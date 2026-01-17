import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { expensesApi, type Expense, type CreateExpenseDTO } from '../services/api';

// Backend categories mapping
const CATEGORIES = {
  ingredients: 'مكونات',
  utilities: 'مرافق',
  salaries: 'رواتب',
  rent: 'إيجار',
  equipment: 'معدات',
  other: 'أخرى',
} as const;

type CategoryKey = keyof typeof CATEGORIES;

export function PurchasesExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [totalAmount, setTotalAmount] = useState(0);
  
  const [formData, setFormData] = useState({
    title: '',
    category: 'ingredients' as CategoryKey,
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  // Fetch expenses from API
  const fetchExpenses = useCallback(async () => {
    try {
      setIsLoading(true);
      // Calculate date range based on selected period
      const now = new Date();
      let startDate: string | undefined;
      let endDate: string | undefined;

      if (selectedPeriod === 'daily') {
        startDate = now.toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
      } else if (selectedPeriod === 'weekly') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate = weekAgo.toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
      } else {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate = monthStart.toISOString().split('T')[0];
        endDate = now.toISOString().split('T')[0];
      }

      const response = await expensesApi.getAll({ startDate, endDate });
      setExpenses(response.data);
      setTotalAmount(response.totalAmount || 0);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'فشل في تحميل المصروفات');
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleAddExpense = async () => {
    if (!formData.title || !formData.amount) {
      toast.error('الرجاء إكمال الحقول المطلوبة');
      return;
    }

    try {
      setIsSaving(true);
      const newExpense: CreateExpenseDTO = {
        title: formData.title,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: formData.date,
      };

      const response = await expensesApi.create(newExpense);
      setExpenses([response.data, ...expenses]);
      setTotalAmount(prev => prev + response.data.amount);
      resetForm();
      toast.success('تم إضافة المصروف بنجاح');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'فشل في إضافة المصروف');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateExpense = async () => {
    if (!editingExpense || !formData.title || !formData.amount) {
      toast.error('الرجاء إكمال الحقول المطلوبة');
      return;
    }

    try {
      setIsSaving(true);
      const updatedData: Partial<CreateExpenseDTO> = {
        title: formData.title,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: formData.date,
      };

      const oldExpense = expenses.find(e => e._id === editingExpense);
      const response = await expensesApi.update(editingExpense, updatedData);
      
      setExpenses(expenses.map(expense => 
        expense._id === editingExpense ? response.data : expense
      ));
      
      // Update total
      if (oldExpense) {
        setTotalAmount(prev => prev - oldExpense.amount + response.data.amount);
      }
      
      resetForm();
      toast.success('تم تحديث المصروف بنجاح');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'فشل في تحديث المصروف');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
      return;
    }

    try {
      const expense = expenses.find(e => e._id === id);
      await expensesApi.delete(id);
      setExpenses(expenses.filter(expense => expense._id !== id));
      if (expense) {
        setTotalAmount(prev => prev - expense.amount);
      }
      toast.success('تم حذف المصروف');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'فشل في حذف المصروف');
    }
  };

  const handleEdit = (expense: Expense) => {
    setFormData({
      title: expense.title,
      category: expense.category,
      amount: expense.amount.toString(),
      description: expense.description || '',
      date: expense.date.split('T')[0],
    });
    setEditingExpense(expense._id);
    setIsAddingExpense(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: 'ingredients',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
    setIsAddingExpense(false);
    setEditingExpense(null);
  };

  // Group expenses by category for summary
  const summaryByCategory = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const getPeriodLabel = () => {
    if (selectedPeriod === 'daily') return 'اليوم';
    if (selectedPeriod === 'weekly') return 'هذا الأسبوع';
    return 'هذا الشهر';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">جاري تحميل المصروفات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8 md:mb-12 text-center">
          <h1 className="mb-2 sm:mb-4 text-2xl sm:text-3xl md:text-5xl">المشتريات والمصروفات</h1>
          <div className="w-16 sm:w-20 h-1 bg-primary mx-auto mb-3 sm:mb-6" />
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground">تسجيل ومتابعة مصروفات المطعم</p>
        </div>

        {/* Summary Section */}
        <div className="max-w-5xl mx-auto mb-8 sm:mb-12 md:mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl md:text-2xl">الملخص المالي</h2>
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto">
              {(['daily', 'weekly', 'monthly'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 sm:px-6 py-2 text-xs sm:text-sm transition-all whitespace-nowrap min-h-[40px] ${
                    selectedPeriod === period
                      ? 'bg-primary text-white'
                      : 'bg-white border border-border hover:border-primary'
                  }`}
                >
                  {period === 'daily' ? 'يومي' : period === 'weekly' ? 'أسبوعي' : 'شهري'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
            <div className="text-center py-4 sm:py-6 md:py-8 border-b-2 border-primary">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">إجمالي المصروفات - {getPeriodLabel()}</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-semibold text-primary">{totalAmount.toFixed(2)} <span className="text-lg sm:text-xl">جنيه</span></p>
            </div>

            <div className="text-center py-4 sm:py-6 md:py-8 border-b-2 border-muted-foreground">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">عدد المصروفات - {getPeriodLabel()}</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-semibold">{expenses.length}</p>
            </div>

            <div className="text-center py-4 sm:py-6 md:py-8 border-b-2 border-muted-foreground">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">متوسط المصروف - {getPeriodLabel()}</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-semibold">
                {expenses.length > 0 ? (totalAmount / expenses.length).toFixed(2) : '0.00'} <span className="text-lg sm:text-xl">جنيه</span>
              </p>
            </div>
          </div>

          {/* Category Breakdown */}
          {Object.keys(summaryByCategory).length > 0 && (
            <div className="py-6 sm:py-8 border-t border-border">
              <h3 className="text-base sm:text-lg md:text-xl mb-4 sm:mb-6">التوزيع حسب الفئة - {getPeriodLabel()}</h3>
              <div className="space-y-3 sm:space-y-4">
                {Object.entries(summaryByCategory).map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between py-2 sm:py-3 border-b border-border last:border-0">
                    <span className="text-sm sm:text-base md:text-lg text-muted-foreground">{CATEGORIES[category as CategoryKey] || category}</span>
                    <span className="text-base sm:text-lg md:text-xl font-semibold text-primary">{amount.toFixed(2)} جنيه</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Add Expense Button */}
        <div className="max-w-5xl mx-auto mb-8 sm:mb-12">
          {!isAddingExpense && (
            <button
              onClick={() => setIsAddingExpense(true)}
              className="flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white hover:bg-primary/90 transition-all mx-auto text-sm sm:text-base min-h-[48px]"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              تسجيل مصروف جديد
            </button>
          )}
        </div>

        {/* Add/Edit Form */}
        {isAddingExpense && (
          <div className="max-w-5xl mx-auto mb-10 sm:mb-16 py-6 sm:py-8 md:py-12 border-y border-border">
            <h3 className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 text-center">{editingExpense ? 'تعديل المصروف' : 'تسجيل مصروف جديد'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div>
                <label className="block mb-2 sm:mb-3 text-xs sm:text-sm">عنوان المصروف *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-border focus:outline-none focus:border-primary transition-colors text-sm"
                  placeholder="مثال: شراء لحم بقري"
                />
              </div>
              <div>
                <label className="block mb-2 sm:mb-3 text-xs sm:text-sm">الفئة *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as CategoryKey })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-border focus:outline-none focus:border-primary transition-colors text-sm"
                >
                  {Object.entries(CATEGORIES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2 sm:mb-3 text-xs sm:text-sm">المبلغ (جنيه) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-border focus:outline-none focus:border-primary transition-colors text-sm"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block mb-2 sm:mb-3 text-xs sm:text-sm">تاريخ المصروف *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-border focus:outline-none focus:border-primary transition-colors text-sm"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block mb-2 sm:mb-3 text-xs sm:text-sm">الوصف (اختياري)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-border focus:outline-none focus:border-primary transition-colors text-sm"
                  rows={2}
                  placeholder="أي تفاصيل إضافية"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={editingExpense ? handleUpdateExpense : handleAddExpense}
                disabled={isSaving}
                className="w-full sm:w-auto px-8 sm:px-10 py-2.5 sm:py-3 bg-primary text-white hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm min-h-[44px]"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingExpense ? 'حفظ التعديلات' : 'تسجيل المصروف'}
              </button>
              <button
                onClick={resetForm}
                className="w-full sm:w-auto px-8 sm:px-10 py-2.5 sm:py-3 bg-white border border-border hover:border-primary transition-all text-sm min-h-[44px]"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}

        {/* Expenses List */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-lg sm:text-xl md:text-2xl mb-4 sm:mb-6 md:mb-8">سجل المصروفات</h2>
          {expenses.length === 0 ? (
            <div className="text-center py-12 sm:py-16 md:py-20">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-muted mx-auto mb-4 sm:mb-6" />
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-2">لا توجد مصروفات مسجلة</p>
              <p className="text-sm sm:text-base text-muted-foreground">ابدأ بتسجيل مصروف جديد</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {expenses.map((expense) => (
                <div key={expense._id} className="py-4 sm:py-6 border-b border-border last:border-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg md:text-xl mb-1.5 sm:mb-2">{expense.title}</h3>
                      <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                        <span>الفئة: {CATEGORIES[expense.category]}</span>
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2">
                        التاريخ: {new Date(expense.date).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                        })}
                      </div>
                      {expense.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 sm:mt-2 italic">الوصف: {expense.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xl sm:text-2xl md:text-3xl font-semibold text-primary mb-2 sm:mb-4">
                        {expense.amount.toFixed(2)} جنيه
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <button
                      onClick={() => handleEdit(expense)}
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-border hover:border-primary transition-all min-h-[36px]"
                    >
                      <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDeleteExpense(expense._id)}
                      className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-destructive border border-destructive hover:bg-destructive hover:text-white transition-all min-h-[36px]"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}