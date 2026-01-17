import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { menuApi, uploadApi, type MenuItem, type CreateMenuItemDTO } from '../services/api';

// Category mapping for Arabic display
const CATEGORIES = {
  'appetizers': 'مقبلات',
  'main-dishes': 'أطباق رئيسية',
  'grills': 'مشويات',
  'desserts': 'حلويات',
  'drinks': 'مشروبات',
} as const;

export function MenuManagementPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    nameAr: '',
    price: '',
    halfPrice: '',
    quarterPrice: '',
    description: '',
    descriptionAr: '',
    image: '',
    category: 'grills' as keyof typeof CATEGORIES,
    isAvailable: true,
  });

  // Fetch menu items from API
  const fetchMenuItems = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await menuApi.getAll();
      setMenuItems(response.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'فشل في تحميل الأصناف');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  const handleAddItem = async () => {
    if (!formData.nameAr || !formData.price) {
      toast.error('الرجاء إكمال الحقول المطلوبة');
      return;
    }

    try {
      setIsSaving(true);
      const newItem: CreateMenuItemDTO = {
        name: formData.name || formData.nameAr,
        nameAr: formData.nameAr,
        price: parseFloat(formData.price),
        halfPrice: formData.halfPrice ? parseFloat(formData.halfPrice) : null,
        quarterPrice: formData.quarterPrice ? parseFloat(formData.quarterPrice) : null,
        description: formData.description,
        descriptionAr: formData.descriptionAr,
        image: formData.image,
        category: formData.category,
        isAvailable: formData.isAvailable,
      };

      const response = await menuApi.create(newItem);
      setMenuItems([response.data, ...menuItems]);
      resetForm();
      toast.success('تم إضافة الصنف بنجاح');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'فشل في إضافة الصنف');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem || !formData.nameAr || !formData.price) {
      toast.error('الرجاء إكمال الحقول المطلوبة');
      return;
    }

    try {
      setIsSaving(true);
      const updatedData: Partial<CreateMenuItemDTO> = {
        name: formData.name || formData.nameAr,
        nameAr: formData.nameAr,
        price: parseFloat(formData.price),
        halfPrice: formData.halfPrice ? parseFloat(formData.halfPrice) : null,
        quarterPrice: formData.quarterPrice ? parseFloat(formData.quarterPrice) : null,
        description: formData.description,
        descriptionAr: formData.descriptionAr,
        image: formData.image,
        category: formData.category,
        isAvailable: formData.isAvailable,
      };

      const response = await menuApi.update(editingItem, updatedData);
      setMenuItems(menuItems.map((item: MenuItem) => 
        item._id === editingItem ? response.data : item
      ));
      resetForm();
      toast.success('تم تحديث الصنف بنجاح');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'فشل في تحديث الصنف');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الصنف؟')) {
      return;
    }

    try {
      await menuApi.delete(id);
      setMenuItems(menuItems.filter((item: MenuItem) => item._id !== id));
      toast.success('تم حذف الصنف');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'فشل في حذف الصنف');
    }
  };

  const handleEdit = (item: MenuItem) => {
    setFormData({
      name: item.name,
      nameAr: item.nameAr,
      price: item.price.toString(),
      halfPrice: item.halfPrice?.toString() || '',
      quarterPrice: item.quarterPrice?.toString() || '',
      description: item.description || '',
      descriptionAr: item.descriptionAr || '',
      image: item.image || '',
      category: item.category as keyof typeof CATEGORIES,
      isAvailable: item.isAvailable,
    });
    setEditingItem(item._id);
    setIsAddingItem(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameAr: '',
      price: '',
      halfPrice: '',
      quarterPrice: '',
      description: '',
      descriptionAr: '',
      image: '',
      category: 'grills',
      isAvailable: true,
    });
    setIsAddingItem(false);
    setEditingItem(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const response = await uploadApi.uploadImage(file);
      setFormData({ ...formData, image: response.url });
      toast.success('تم رفع الصورة بنجاح');
    } catch (error) {
      // Fallback to base64 if upload fails
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
        toast.info('تم حفظ الصورة محلياً');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">جاري تحميل الأصناف...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <section className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">
        {/* Page Header Block */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="mb-2 sm:mb-3 text-2xl sm:text-3xl md:text-4xl">إدارة الأصناف</h1>
          <div className="w-12 sm:w-16 h-1 bg-primary mx-auto mb-3 sm:mb-4" />
          <p className="text-sm sm:text-base text-muted-foreground">إضافة وتعديل أصناف القائمة</p>
        </div>

        {/* Stats Block */}
        <div className="max-w-4xl mx-auto mb-6 sm:mb-8">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6">
            <div className="text-center py-3 sm:py-4 border-b-2 border-primary">
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mb-1">إجمالي الأصناف</p>
              <p className="text-lg sm:text-2xl md:text-3xl font-semibold text-primary">{menuItems.length}</p>
            </div>
            <div className="text-center py-3 sm:py-4 border-b-2 border-accent">
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mb-1">متوسط السعر</p>
              <p className="text-lg sm:text-2xl md:text-3xl font-semibold text-accent">
                {menuItems.length > 0 
                  ? (menuItems.reduce((sum: number, item: MenuItem) => sum + item.price, 0) / menuItems.length).toFixed(0)
                  : '0'}
              </p>
            </div>
            <div className="text-center py-3 sm:py-4 border-b-2 border-green-500">
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mb-1">متاحة</p>
              <p className="text-lg sm:text-2xl md:text-3xl font-semibold text-green-500">
                {menuItems.filter(item => item.isAvailable).length}
              </p>
            </div>
          </div>
        </div>

        {/* Add Button Block */}
        <div className="max-w-4xl mx-auto mb-4 sm:mb-6">
          {!isAddingItem && (
            <button
              onClick={() => setIsAddingItem(true)}
              className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-primary text-white hover:bg-primary/90 transition-all mx-auto text-sm min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              إضافة صنف جديد
            </button>
          )}
        </div>

        {/* Add/Edit Form Block */}
        {isAddingItem && (
          <div className="max-w-4xl mx-auto mb-6 sm:mb-8 py-4 sm:py-6 border-y border-border">
            <h3 className="text-lg sm:text-xl mb-4 sm:mb-6 text-center">{editingItem ? 'تعديل الصنف' : 'إضافة صنف جديد'}</h3>
            
            {/* Image Upload */}
            <div className="mb-4 sm:mb-6">
              <label className="block mb-2 text-xs sm:text-sm">صورة الصنف</label>
              <div className="flex flex-col items-center gap-2 sm:gap-3">
                {formData.image && (
                  <div className="w-28 h-28 sm:w-36 sm:h-36 overflow-hidden border-2 border-border">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                <label className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-muted border border-border hover:border-primary cursor-pointer transition-all text-xs sm:text-sm min-h-[40px]">
                  {isUploading ? (
                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                  {isUploading ? 'جاري الرفع...' : formData.image ? 'تغيير الصورة' : 'رفع صورة'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div>
                <label className="block mb-1.5 sm:mb-2 text-xs sm:text-sm">اسم الصنف (عربي) *</label>
                <input
                  type="text"
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  className="w-full px-3 py-2.5 sm:py-2 bg-white border border-border focus:outline-none focus:border-primary transition-colors text-sm"
                  placeholder="مثال: كباب لحم"
                />
              </div>
              <div>
                <label className="block mb-1.5 sm:mb-2 text-xs sm:text-sm">اسم الصنف (إنجليزي)</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 sm:py-2 bg-white border border-border focus:outline-none focus:border-primary transition-colors text-sm"
                  placeholder="e.g., Lamb Kebab"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block mb-1.5 sm:mb-2 text-xs sm:text-sm">السعر (جنيه) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2.5 sm:py-2 bg-white border border-border focus:outline-none focus:border-primary transition-colors text-sm"
                  placeholder="سعر الكيلو أو الوحدة"
                />
              </div>
              <div>
                <label className="block mb-1.5 sm:mb-2 text-xs sm:text-sm">الفئة *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as keyof typeof CATEGORIES })}
                  className="w-full px-3 py-2.5 sm:py-2 bg-white border border-border focus:outline-none focus:border-primary transition-colors text-sm"
                >
                  {Object.entries(CATEGORIES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Portion Prices Section - Only for grills */}
            {formData.category === 'grills' && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-muted/50 border border-border">
                <h4 className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 text-primary">أسعار الأجزاء (للمشويات)</h4>
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-3 sm:mb-4">اترك الحقل فارغ إذا لم يكن هذا الحجم متاح للصنف</p>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block mb-1.5 sm:mb-2 text-xs sm:text-sm">سعر النصف (جنيه)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.halfPrice}
                      onChange={(e) => setFormData({ ...formData, halfPrice: e.target.value })}
                      className="w-full px-3 py-2.5 sm:py-2 bg-white border border-border focus:outline-none focus:border-primary transition-colors text-sm"
                      placeholder="مثال: 150"
                    />
                  </div>
                  <div>
                    <label className="block mb-1.5 sm:mb-2 text-xs sm:text-sm">سعر الربع (جنيه)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.quarterPrice}
                      onChange={(e) => setFormData({ ...formData, quarterPrice: e.target.value })}
                      className="w-full px-3 py-2.5 sm:py-2 bg-white border border-border focus:outline-none focus:border-primary transition-colors text-sm"
                      placeholder="مثال: 80"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div>
                <label className="block mb-1.5 sm:mb-2 text-xs sm:text-sm">الوصف (عربي)</label>
                <textarea
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  className="w-full px-3 py-2.5 sm:py-2 bg-white border border-border focus:outline-none focus:border-primary transition-colors text-sm"
                  rows={2}
                  placeholder="وصف الصنف بالعربي"
                />
              </div>
              <div>
                <label className="block mb-1.5 sm:mb-2 text-xs sm:text-sm">الوصف (إنجليزي)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2.5 sm:py-2 bg-white border border-border focus:outline-none focus:border-primary transition-colors text-sm"
                  rows={2}
                  placeholder="Description in English"
                  dir="ltr"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isAvailable" className="text-xs sm:text-sm">متاح للطلب</label>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
              <button
                onClick={editingItem ? handleUpdateItem : handleAddItem}
                disabled={isSaving}
                className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-2 bg-primary text-white hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm min-h-[44px]"
              >
                {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingItem ? 'حفظ التعديلات' : 'إضافة الصنف'}
              </button>
              <button
                onClick={resetForm}
                className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-2 bg-white border border-border hover:border-primary transition-all text-sm min-h-[44px]"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}

        {/* Menu Items List Block */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-base sm:text-lg mb-3 sm:mb-4">الأصناف المسجلة</h2>
          {menuItems.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted mx-auto mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-muted-foreground mb-1">لا توجد أصناف مسجلة</p>
              <p className="text-xs sm:text-sm text-muted-foreground">ابدأ بإضافة صنف جديد</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {menuItems.map((item: MenuItem) => (
                <div key={item._id} className="border border-border overflow-hidden hover:border-primary transition-all">
                  {item.image && (
                    <div className="h-28 sm:h-36 overflow-hidden">
                      <img src={item.image} alt={item.nameAr} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-3 sm:p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-sm sm:text-base mb-1">{item.nameAr}</h3>
                        <p className="text-[10px] sm:text-xs text-muted-foreground">
                          {CATEGORIES[item.category as keyof typeof CATEGORIES] || item.category}
                        </p>
                        {!item.isAvailable && (
                          <span className="inline-block px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs bg-red-100 text-red-600 rounded mt-1">
                            غير متاح
                          </span>
                        )}
                      </div>
                      <div className="text-base sm:text-lg font-semibold text-primary">
                        {item.price} جنيه
                      </div>
                    </div>
                    {item.descriptionAr && (
                      <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 line-clamp-2">{item.descriptionAr}</p>
                    )}
                    <div className="flex items-center gap-2 pt-2 sm:pt-3 border-t border-border">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-xs border border-border hover:border-primary transition-all min-h-[36px]"
                      >
                        <Edit2 className="w-3 h-3" />
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[10px] sm:text-xs text-destructive border border-destructive hover:bg-destructive hover:text-white transition-all min-h-[36px]"
                      >
                        <Trash2 className="w-3 h-3" />
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
