import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  CreditCard, 
  Banknote,
  Calendar,
  RefreshCw,
  Truck,
  Package,
  Clock,
  XCircle,
  CheckCircle,
  BarChart3,
  Trash2
} from 'lucide-react';

interface DailySummary {
  _id: string;
  date: string;
  dateString: string;
  totalOrders: number;
  totalSales: number;
  totalDeliveryOrders: number;
  totalTakeawayOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  paymentBreakdown: {
    cash: number;
    online: number;
  };
  deliveryCosts: number;
  averageOrderValue: number;
  topSellingItems: {
    menuItemId: string;
    name: string;
    quantity: number;
    revenue: number;
  }[];
}

interface WeeklySummary {
  totalOrders: number;
  totalSales: number;
  averageDaily: number;
  bestDay: {
    date: string;
    sales: number;
    orders: number;
  } | null;
  paymentBreakdown: {
    cash: number;
    online: number;
  };
  daysCount: number;
}

const API_BASE = 'http://localhost:5000/api';

const DailySummaryPage = () => {
  const [summaries, setSummaries] = useState<DailySummary[]>([]);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [selectedSummary, setSelectedSummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Fetch all summaries
  const fetchSummaries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [summariesRes, weeklyRes] = await Promise.all([
        fetch(`${API_BASE}/summaries`),
        fetch(`${API_BASE}/summaries/weekly`),
      ]);
      
      const summariesData = await summariesRes.json();
      const weeklyData = await weeklyRes.json();
      
      if (summariesData.success) {
        setSummaries(summariesData.data);
        if (summariesData.data.length > 0) {
          setSelectedSummary(summariesData.data[0]);
        }
      }
      
      if (weeklyData.success) {
        setWeeklySummary(weeklyData.data);
      }
    } catch (err) {
      setError('فشل في تحميل البيانات');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Generate today's summary
  const generateTodaySummary = async () => {
    try {
      setGenerating(true);
      const res = await fetch(`${API_BASE}/summaries/generate`, {
        method: 'POST',
      });
      const data = await res.json();
      
      if (data.success) {
        await fetchSummaries();
      } else {
        setError(data.error || 'فشل في إنشاء الملخص');
      }
    } catch (err) {
      setError('فشل في إنشاء الملخص');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  // Cleanup old records
  const cleanupOldRecords = async () => {
    try {
      const res = await fetch(`${API_BASE}/summaries/cleanup`, {
        method: 'DELETE',
      });
      const data = await res.json();
      
      if (data.success) {
        await fetchSummaries();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSummaries();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 md:w-12 md:h-12 text-amber-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-base md:text-lg">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-3 sm:py-6 sm:px-4 md:py-8 md:px-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 md:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
              <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-amber-600" />
              ملخص الطلبات اليومي
            </h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              آخر 7 أيام من سجلات الطلبات
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={generateTodaySummary}
              disabled={generating}
              className="flex-1 sm:flex-none min-h-[44px] px-3 sm:px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 text-sm md:text-base"
            >
              {generating ? (
                <RefreshCw className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 md:w-5 md:h-5" />
              )}
              <span className="hidden xs:inline">إنشاء ملخص اليوم</span>
              <span className="xs:hidden">ملخص اليوم</span>
            </button>
            <button
              onClick={cleanupOldRecords}
              className="min-h-[44px] px-3 sm:px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
            >
              <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
              <span className="hidden sm:inline">تنظيف</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 sm:px-4 sm:py-3 rounded-lg mb-4 sm:mb-6 text-sm md:text-base">
            {error}
          </div>
        )}

        {/* Weekly Summary Cards */}
        {weeklySummary && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
            <div className="bg-white rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <span className="text-xs sm:text-sm text-gray-500">إجمالي المبيعات</span>
                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
              </div>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                {formatCurrency(weeklySummary.totalSales)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                آخر {weeklySummary.daysCount} أيام
              </p>
            </div>

            <div className="bg-white rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <span className="text-xs sm:text-sm text-gray-500">إجمالي الطلبات</span>
                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                {weeklySummary.totalOrders}
              </p>
              <p className="text-xs text-gray-500 mt-1">طلب</p>
            </div>

            <div className="bg-white rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <span className="text-xs sm:text-sm text-gray-500">متوسط يومي</span>
                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                </div>
              </div>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                {formatCurrency(weeklySummary.averageDaily)}
              </p>
              <p className="text-xs text-gray-500 mt-1">في اليوم</p>
            </div>

            <div className="bg-white rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <span className="text-xs sm:text-sm text-gray-500">أفضل يوم</span>
                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                </div>
              </div>
              {weeklySummary.bestDay ? (
                <>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                    {formatCurrency(weeklySummary.bestDay.sales)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {weeklySummary.bestDay.orders} طلب
                  </p>
                </>
              ) : (
                <p className="text-gray-400 text-sm">لا توجد بيانات</p>
              )}
            </div>
          </div>
        )}

        {/* Payment Breakdown */}
        {weeklySummary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
            <div className="bg-white rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 md:mb-4">
                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Banknote className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">الدفع النقدي</p>
                  <p className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                    {formatCurrency(weeklySummary.paymentBreakdown.cash)}
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                <div
                  className="bg-green-500 h-2 md:h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${weeklySummary.totalSales > 0 
                      ? (weeklySummary.paymentBreakdown.cash / weeklySummary.totalSales) * 100 
                      : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 md:mb-4">
                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">الدفع الإلكتروني</p>
                  <p className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                    {formatCurrency(weeklySummary.paymentBreakdown.online)}
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 md:h-3">
                <div
                  className="bg-blue-500 h-2 md:h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${weeklySummary.totalSales > 0 
                      ? (weeklySummary.paymentBreakdown.online / weeklySummary.totalSales) * 100 
                      : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Daily Summaries List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Days List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-3 sm:p-4 border-b border-gray-100">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
                  السجلات اليومية
                </h2>
              </div>
              <div className="divide-y divide-gray-100 max-h-[400px] md:max-h-[500px] overflow-y-auto">
                {summaries.length === 0 ? (
                  <div className="p-4 sm:p-6 md:p-8 text-center text-gray-500">
                    <Calendar className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm md:text-base">لا توجد سجلات بعد</p>
                    <p className="text-xs md:text-sm mt-1">اضغط "إنشاء ملخص اليوم" للبدء</p>
                  </div>
                ) : (
                  summaries.map((summary) => (
                    <button
                      key={summary._id}
                      onClick={() => setSelectedSummary(summary)}
                      className={`w-full p-3 sm:p-4 text-right transition-colors min-h-[60px] ${
                        selectedSummary?._id === summary._id
                          ? 'bg-amber-50 border-r-4 border-amber-500'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <p className="font-medium text-gray-900 text-sm md:text-base">
                        {formatDate(summary.dateString)}
                      </p>
                      <div className="flex items-center gap-3 sm:gap-4 mt-1 text-xs md:text-sm text-gray-500">
                        <span>{summary.totalOrders} طلب</span>
                        <span>{formatCurrency(summary.totalSales)}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Selected Day Details */}
          <div className="lg:col-span-2">
            {selectedSummary ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 md:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 md:mb-6">
                  تفاصيل يوم {formatDate(selectedSummary.dateString)}
                </h2>

                {/* Order Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 md:mb-6">
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-3 md:p-4">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1">
                      <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                      <span className="text-xs sm:text-sm text-gray-500">إجمالي الطلبات</span>
                    </div>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                      {selectedSummary.totalOrders}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-2 sm:p-3 md:p-4">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1">
                      <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                      <span className="text-xs sm:text-sm text-gray-500">إجمالي المبيعات</span>
                    </div>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                      {formatCurrency(selectedSummary.totalSales)}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-2 sm:p-3 md:p-4">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1">
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600" />
                      <span className="text-xs sm:text-sm text-gray-500">متوسط الطلب</span>
                    </div>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                      {formatCurrency(selectedSummary.averageOrderValue)}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-2 sm:p-3 md:p-4">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1">
                      <Truck className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                      <span className="text-xs sm:text-sm text-gray-500">توصيل</span>
                    </div>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                      {selectedSummary.totalDeliveryOrders}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-2 sm:p-3 md:p-4">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1">
                      <Package className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
                      <span className="text-xs sm:text-sm text-gray-500">استلام</span>
                    </div>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                      {selectedSummary.totalTakeawayOrders}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-2 sm:p-3 md:p-4">
                    <div className="flex items-center gap-1 sm:gap-2 mb-1">
                      <Banknote className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                      <span className="text-xs sm:text-sm text-gray-500">تكاليف توصيل</span>
                    </div>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                      {formatCurrency(selectedSummary.deliveryCosts)}
                    </p>
                  </div>
                </div>

                {/* Order Status */}
                <div className="mb-4 md:mb-6">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">حالة الطلبات</h3>
                  <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4">
                    <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-green-50 rounded-lg">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                      <span className="text-xs sm:text-sm text-green-700">
                        مكتمل: {selectedSummary.deliveredOrders}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-yellow-50 rounded-lg">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
                      <span className="text-xs sm:text-sm text-yellow-700">
                        معلق: {selectedSummary.pendingOrders}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-red-50 rounded-lg">
                      <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600" />
                      <span className="text-xs sm:text-sm text-red-700">
                        ملغي: {selectedSummary.cancelledOrders}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Breakdown */}
                <div className="mb-4 md:mb-6">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">طرق الدفع</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                        <span className="text-sm md:text-base text-green-700">نقدي</span>
                      </div>
                      <span className="font-bold text-green-700 text-sm md:text-base">
                        {formatCurrency(selectedSummary.paymentBreakdown.cash)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        <span className="text-sm md:text-base text-blue-700">إلكتروني</span>
                      </div>
                      <span className="font-bold text-blue-700 text-sm md:text-base">
                        {formatCurrency(selectedSummary.paymentBreakdown.online)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Top Selling Items */}
                {selectedSummary.topSellingItems.length > 0 && (
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2 md:mb-3">
                      الأصناف الأكثر مبيعاً
                    </h3>
                    <div className="space-y-2">
                      {selectedSummary.topSellingItems.slice(0, 5).map((item, index) => (
                        <div
                          key={item.menuItemId}
                          className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <span className="w-5 h-5 sm:w-6 sm:h-6 bg-amber-100 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-amber-700">
                              {index + 1}
                            </span>
                            <span className="text-gray-900 text-sm md:text-base">{item.name}</span>
                          </div>
                          <div className="text-left">
                            <p className="text-xs sm:text-sm text-gray-500">{item.quantity} وحدة</p>
                            <p className="font-medium text-gray-900 text-xs sm:text-sm">
                              {formatCurrency(item.revenue)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 md:p-12 text-center">
                <BarChart3 className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-sm md:text-base">اختر يوماً لعرض التفاصيل</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailySummaryPage;
