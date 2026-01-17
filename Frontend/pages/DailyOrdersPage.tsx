import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Minus, Trash2, Loader2, RefreshCw, Check, Truck, Store, X, Phone, MapPin, Clock, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { ordersApi, menuApi, type Order, type MenuItem, type CreateOrderDTO } from '../services/api';

interface Customer {
  phone: string;
  name: string;
  address: string;
}

interface OrderItemLocal {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  portion?: string; // e.g., 'quarter', 'half', 'full', 'kg'
  portionLabel?: string; // e.g., 'ربع كيلو', 'نص كيلو'
}

// Portion options for weight-based items (meat/grills)
const WEIGHT_PORTIONS = [
  { id: 'quarter', label: 'ربع', multiplier: 0.25 },
  { id: 'half', label: 'نص', multiplier: 0.5 },
];

// Portion options for chicken
const CHICKEN_PORTIONS = [
  { id: 'quarter', label: 'ربع فرخة', multiplier: 0.25 },
  { id: 'half', label: 'نص فرخة', multiplier: 0.5 },
  { id: 'full', label: 'فرخة كاملة', multiplier: 1 },
];

// Category mapping for Arabic display
const CATEGORIES = {
  'appetizers': 'مقبلات',
  'main-dishes': 'أطباق رئيسية',
  'grills': 'مشويات',
  'desserts': 'حلويات',
  'drinks': 'مشروبات',
} as const;

export function DailyOrdersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [phoneSearch, setPhoneSearch] = useState('');
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItemLocal[]>([]);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [orderType, setOrderType] = useState<'delivery' | 'takeaway'>('delivery');
  const [orderNotes, setOrderNotes] = useState('');
  const [extraCost, setExtraCost] = useState<number>(0);
  const [extraCostNote, setExtraCostNote] = useState('');
  
  // For inline portion selection
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'delivered'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'delivery' | 'takeaway'>('all');
  
  // Selected order for drawer
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  const [customerForm, setCustomerForm] = useState({
    name: '',
    address: '',
  });

  // Fetch data from API
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [ordersRes, menuRes] = await Promise.all([
        ordersApi.getToday(),
        menuApi.getAll({ available: true }),
      ]);
      setOrders(ordersRes.data);
      setTodayRevenue(ordersRes.totalRevenue || 0);
      setMenuItems(menuRes.data);
      
      // Load customers from localStorage (could be moved to a backend endpoint later)
      const savedCustomers = localStorage.getItem('customers');
      if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'فشل في تحميل البيانات');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (customers.length > 0) {
      localStorage.setItem('customers', JSON.stringify(customers));
    }
  }, [customers]);

  const handlePhoneSearch = () => {
    if (!phoneSearch.trim()) {
      toast.error('الرجاء إدخال رقم الهاتف');
      return;
    }

    const customer = customers.find(c => c.phone === phoneSearch);
    if (customer) {
      setCurrentCustomer(customer);
      setIsNewCustomer(false);
      setCustomerForm({ name: customer.name, address: customer.address });
      toast.success(`تم العثور على العميل: ${customer.name}`);
    } else {
      setCurrentCustomer({ phone: phoneSearch, name: '', address: '' });
      setIsNewCustomer(true);
      setCustomerForm({ name: '', address: '' });
      toast.info('عميل جديد - الرجاء إدخال البيانات');
    }
  };

  // حفظ بيانات العميل تلقائياً عند التغيير
  const updateCustomerData = (field: 'name' | 'address', value: string) => {
    setCustomerForm(prev => ({ ...prev, [field]: value }));
    
    // حفظ تلقائي للعميل الموجود
    if (currentCustomer && !isNewCustomer) {
      setCustomers(prev => prev.map(c =>
        c.phone === currentCustomer.phone
          ? { ...c, [field]: value }
          : c
      ));
    }
  };

  const handleAddItem = (menuItem: MenuItem) => {
    // Check if item is in grills category (supports portions)
    const isGrill = menuItem.category === 'grills';
    const isChicken = menuItem.nameAr.includes('فراخ') || menuItem.nameAr.includes('فرخ') || menuItem.nameAr.includes('دجاج');
    
    if (isGrill || isChicken) {
      // Toggle expanded state for inline portion selection
      setExpandedItemId(expandedItemId === menuItem._id ? null : menuItem._id);
    } else {
      // Add directly without portion
      addItemToOrder(menuItem, 1, menuItem.price);
    }
  };

  const addItemToOrder = (menuItem: MenuItem, quantity: number, price: number, portion?: string, portionLabel?: string) => {
    const existingItem = orderItems.find(item => 
      portion ? (item.menuItemId === menuItem._id && item.portion === portion) : item.menuItemId === menuItem._id
    );
    
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        (portion ? (item.menuItemId === menuItem._id && item.portion === portion) : item.menuItemId === menuItem._id)
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setOrderItems([...orderItems, { 
        menuItemId: menuItem._id,
        name: portionLabel ? `${menuItem.nameAr} (${portionLabel})` : menuItem.nameAr,
        price: price,
        quantity: quantity,
        portion: portion,
        portionLabel: portionLabel
      }]);
    }
    
    // Collapse after adding
    setExpandedItemId(null);
  };

  const handleSelectPortion = (menuItem: MenuItem, portion: { id: string; label: string; multiplier: number }) => {
    // Use stored price if available, otherwise calculate
    let portionPrice: number;
    if (portion.id === 'half' && menuItem.halfPrice) {
      portionPrice = menuItem.halfPrice;
    } else if (portion.id === 'quarter' && menuItem.quarterPrice) {
      portionPrice = menuItem.quarterPrice;
    } else {
      portionPrice = Math.round(menuItem.price * portion.multiplier);
    }
    addItemToOrder(menuItem, 1, portionPrice, portion.id, portion.label);
  };

  const getPortionsForItem = (menuItem: MenuItem) => {
    const isChicken = menuItem.nameAr.includes('فراخ') || menuItem.nameAr.includes('فرخ') || menuItem.nameAr.includes('دجاج');
    if (isChicken) return CHICKEN_PORTIONS;
    
    // Filter weight portions based on available prices
    return WEIGHT_PORTIONS.filter(portion => {
      if (portion.id === 'half') return menuItem.halfPrice !== null && menuItem.halfPrice !== undefined;
      if (portion.id === 'quarter') return menuItem.quarterPrice !== null && menuItem.quarterPrice !== undefined;
      return true;
    });
  };

  const handleUpdateQuantity = (menuItemId: string, change: number) => {
    setOrderItems(orderItems.map(item =>
      item.menuItemId === menuItemId
        ? { ...item, quantity: Math.max(1, item.quantity + change) }
        : item
    ));
  };

  const handleRemoveItem = (menuItemId: string) => {
    setOrderItems(orderItems.filter(item => item.menuItemId !== menuItemId));
  };

  const calculateTotal = () => {
    const itemsTotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return itemsTotal + (extraCost || 0);
  };

  const calculateItemsTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleSubmitOrder = async () => {
    if (!currentCustomer) {
      toast.error('الرجاء البحث عن العميل أولاً');
      return;
    }

    if (!customerForm.name) {
      toast.error('الرجاء إدخال اسم العميل');
      return;
    }

    // العنوان مطلوب فقط للتوصيل
    if (orderType === 'delivery' && !customerForm.address) {
      toast.error('الرجاء إدخال عنوان التوصيل');
      return;
    }

    if (orderItems.length === 0) {
      toast.error('الرجاء إضافة أصناف للطلب');
      return;
    }

    try {
      setIsSubmitting(true);

      // Save or update customer locally
      if (isNewCustomer) {
        const newCustomer: Customer = {
          phone: currentCustomer.phone,
          name: customerForm.name,
          address: customerForm.address,
        };
        setCustomers([...customers, newCustomer]);
      } else {
        setCustomers(customers.map(c =>
          c.phone === currentCustomer.phone
            ? { ...c, name: customerForm.name, address: customerForm.address }
            : c
        ));
      }

      // Build notes with extra cost info
      let finalNotes = orderNotes || '';
      if (extraCost > 0) {
        finalNotes += finalNotes ? '\n' : '';
        finalNotes += `تكلفة إضافية: ${extraCost} جنيه`;
        if (extraCostNote) finalNotes += ` (${extraCostNote})`;
      }

      // Create order via API
      const orderData: CreateOrderDTO = {
        items: orderItems.map(item => ({
          menuItem: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: calculateTotal(),
        customerName: customerForm.name,
        customerPhone: currentCustomer.phone,
        customerAddress: orderType === 'delivery' ? customerForm.address : 'استلام من المحل',
        orderType: orderType,
        paymentMethod: 'cash',
        notes: finalNotes || undefined,
      };

      const response = await ordersApi.create(orderData);
      setOrders([response.data, ...orders]);
      setTodayRevenue(prev => prev + response.data.totalAmount);
      
      // Reset form
      setPhoneSearch('');
      setCurrentCustomer(null);
      setIsNewCustomer(false);
      setCustomerForm({ name: '', address: '' });
      setOrderItems([]);
      setOrderType('delivery');
      setOrderNotes('');
      setExtraCost(0);
      setExtraCostNote('');
      
      toast.success(`تم إضافة الطلب بنجاح - رقم الطلب: ${response.data.orderNumber}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'فشل في إضافة الطلب');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group menu items by category
  const groupedMenuItems = menuItems.reduce((acc, item) => {
    const category = item.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  // Filter orders based on selected filters
  const filteredOrders = orders.filter(order => {
    // Status filter
    if (statusFilter === 'pending' && order.status !== 'pending') return false;
    if (statusFilter === 'delivered' && order.status !== 'delivered') return false;
    
    // Type filter
    if (typeFilter === 'delivery' && order.orderType !== 'delivery') return false;
    if (typeFilter === 'takeaway' && order.orderType !== 'takeaway') return false;
    
    return true;
  });

  // تأكيد وصول الطلب واستلام النقود
  const handleConfirmDelivery = async (orderId: string) => {
    try {
      setUpdatingOrderId(orderId);
      const response = await ordersApi.update(orderId, { 
        status: 'delivered',
        isPaid: true 
      });
      
      setOrders(orders.map(order => 
        order._id === orderId ? response.data : order
      ));
      
      toast.success('تم تأكيد التوصيل واستلام النقود بنجاح');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'فشل في تحديث حالة الطلب');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // إلغاء الطلب
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) return;
    
    try {
      setUpdatingOrderId(orderId);
      const response = await ordersApi.update(orderId, { status: 'cancelled' });
      
      const order = orders.find(o => o._id === orderId);
      if (order && order.status !== 'cancelled') {
        setTodayRevenue(prev => prev - order.totalAmount);
      }
      
      setOrders(orders.map(o => 
        o._id === orderId ? response.data : o
      ));
      
      toast.success('تم إلغاء الطلب');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'فشل في إلغاء الطلب');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 md:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8 md:mb-12 text-center">
          <h1 className="mb-2 sm:mb-4 text-2xl sm:text-3xl md:text-5xl">الطلبات اليومية</h1>
          <div className="w-16 sm:w-20 h-1 bg-primary mx-auto mb-3 sm:mb-6" />
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground">إضافة وإدارة طلبات العملاء</p>
        </div>

        {/* Summary Cards */}
        <div className="max-w-4xl mx-auto mb-8 sm:mb-12 md:mb-16">
          <div className="flex justify-end mb-3 sm:mb-4">
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm border border-border hover:border-primary transition-all min-h-[40px]"
            >
              <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              تحديث
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:gap-8">
            <div className="text-center py-4 sm:py-6 md:py-8 border-b-2 border-primary">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">عدد طلبات اليوم</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-semibold">{orders.length}</p>
            </div>
            <div className="text-center py-4 sm:py-6 md:py-8 border-b-2 border-primary">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">إجمالي المبيعات اليوم</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-semibold text-primary">
                {todayRevenue.toFixed(2)} <span className="text-lg sm:text-xl">جنيه</span>
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-12">
            {/* Order Form */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8 md:space-y-12">
              {/* Customer Search */}
              <div>
                <h3 className="text-lg sm:text-xl md:text-2xl mb-4 sm:mb-6">بحث عن العميل</h3>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                  <input
                    type="tel"
                    value={phoneSearch}
                    onChange={(e) => setPhoneSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePhoneSearch()}
                    className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg bg-white border border-border focus:outline-none focus:border-primary transition-colors"
                    placeholder="أدخل رقم الهاتف"
                    dir="ltr"
                  />
                  <button
                    onClick={handlePhoneSearch}
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white hover:bg-primary/90 transition-all flex items-center justify-center gap-2 min-h-[48px]"
                  >
                    <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                    بحث
                  </button>
                </div>
              </div>

              {/* Customer Info */}
              {currentCustomer && (
                <>
                  <div className="py-6 sm:py-8 border-y border-border">
                    <h3 className="text-lg sm:text-xl md:text-2xl mb-4 sm:mb-6">
                      {isNewCustomer ? 'عميل جديد' : 'بيانات العميل'}
                    </h3>
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <label className="block mb-2 sm:mb-3 text-xs sm:text-sm">رقم الهاتف</label>
                        <input
                          type="tel"
                          value={currentCustomer.phone}
                          disabled
                          className="w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg bg-muted border border-border"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 sm:mb-3 text-xs sm:text-sm">الاسم *</label>
                        <input
                          type="text"
                          value={customerForm.name}
                          onChange={(e) => updateCustomerData('name', e.target.value)}
                          className="w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg bg-white border border-border focus:outline-none focus:border-primary transition-colors"
                          placeholder="اسم العميل"
                        />
                      </div>
                      
                      {/* نوع الطلب */}
                      <div>
                        <label className="block mb-2 sm:mb-3 text-xs sm:text-sm">نوع الطلب *</label>
                        <div className="grid grid-cols-2 gap-2 sm:gap-4">
                          <button
                            type="button"
                            onClick={() => setOrderType('delivery')}
                            className={`flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 border-2 transition-all min-h-[48px] ${
                              orderType === 'delivery' 
                                ? 'border-primary bg-primary/10 text-primary' 
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="font-medium text-sm sm:text-base">توصيل</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setOrderType('takeaway')}
                            className={`flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 border-2 transition-all min-h-[48px] ${
                              orderType === 'takeaway' 
                                ? 'border-primary bg-primary/10 text-primary' 
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <Store className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="font-medium text-sm sm:text-base">استلام من المحل</span>
                          </button>
                        </div>
                      </div>

                      {/* العنوان - يظهر فقط للتوصيل */}
                      {orderType === 'delivery' && (
                        <div>
                          <label className="block mb-2 sm:mb-3 text-xs sm:text-sm">عنوان التوصيل *</label>
                          <textarea
                            value={customerForm.address}
                            onChange={(e) => updateCustomerData('address', e.target.value)}
                            className="w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg bg-white border border-border focus:outline-none focus:border-primary transition-colors"
                            rows={2}
                            placeholder="عنوان التوصيل بالتفصيل"
                          />
                        </div>
                      )}

                      {/* ملاحظات الطلب */}
                      <div>
                        <label className="block mb-2 sm:mb-3 text-xs sm:text-sm">ملاحظات على الطلب (اختياري)</label>
                        <textarea
                          value={orderNotes}
                          onChange={(e) => setOrderNotes(e.target.value)}
                          className="w-full px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg bg-white border border-border focus:outline-none focus:border-primary transition-colors"
                          rows={2}
                          placeholder="مثال: بدون بصل، حار جداً، إلخ..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div>
                    <h3 className="text-lg sm:text-xl md:text-2xl mb-4 sm:mb-6">اختر الأصناف</h3>
                    {menuItems.length === 0 ? (
                      <div className="text-center py-6 sm:py-8 bg-muted">
                        <p className="text-sm sm:text-base text-muted-foreground">لا توجد أصناف متاحة</p>
                      </div>
                    ) : (
                      <div className="space-y-4 sm:space-y-6">
                        {Object.entries(groupedMenuItems).map(([category, items]) => (
                          <div key={category}>
                            <h4 className="text-sm sm:text-base md:text-lg font-medium mb-2 sm:mb-3 text-muted-foreground">
                              {CATEGORIES[category as keyof typeof CATEGORIES] || category}
                            </h4>
                            <div className="grid grid-cols-2 gap-2 sm:gap-4">
                              {items.map((item) => {
                                const isGrill = item.category === 'grills';
                                const isChicken = item.nameAr.includes('فراخ') || item.nameAr.includes('فرخ') || item.nameAr.includes('دجاج');
                                const hasPortion = isGrill || isChicken;
                                const isExpanded = expandedItemId === item._id;
                                const portions = getPortionsForItem(item);
                                
                                return (
                                  <div key={item._id} className="relative">
                                    <button
                                      onClick={() => handleAddItem(item)}
                                      className={`w-full p-2.5 sm:p-3 text-right bg-white border transition-all min-h-[56px] ${
                                        isExpanded ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'
                                      }`}
                                    >
                                      <div className="flex justify-between items-center">
                                        <div>
                                          <div className="font-medium text-xs sm:text-sm">{item.nameAr}</div>
                                          <div className="text-[10px] sm:text-xs text-primary">{item.price} جنيه/كيلو</div>
                                        </div>
                                        {hasPortion && (
                                          <span className="text-[10px] sm:text-xs text-muted-foreground">
                                            {isExpanded ? '▲' : '▼'}
                                          </span>
                                        )}
                                      </div>
                                    </button>
                                    
                                    {/* Inline Portion Selection */}
                                    {isExpanded && hasPortion && (
                                      <div className="flex flex-wrap gap-1 p-2 bg-muted border border-t-0 border-primary">
                                        {portions.map((portion) => {
                                          // Get the correct price for display
                                          let displayPrice: number;
                                          if (portion.id === 'half' && item.halfPrice) {
                                            displayPrice = item.halfPrice;
                                          } else if (portion.id === 'quarter' && item.quarterPrice) {
                                            displayPrice = item.quarterPrice;
                                          } else {
                                            displayPrice = Math.round(item.price * portion.multiplier);
                                          }
                                          
                                          return (
                                            <button
                                              key={portion.id}
                                              onClick={() => handleSelectPortion(item, portion)}
                                              className="flex-1 min-w-[60px] px-2 py-1.5 text-xs bg-white border border-border hover:border-primary hover:bg-primary hover:text-white transition-all rounded"
                                            >
                                              <div className="font-medium">{portion.label}</div>
                                              <div className="text-[10px] opacity-75">{displayPrice}ج</div>
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              {currentCustomer && (
                <div className="sticky top-20 lg:top-24">
                  <h3 className="text-lg sm:text-xl md:text-2xl mb-4 sm:mb-6">الطلب الحالي</h3>

                  {orderItems.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 bg-muted">
                      <p className="text-sm sm:text-base text-muted-foreground">لم يتم إضافة أصناف بعد</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 max-h-60 sm:max-h-72 overflow-y-auto pb-4">
                        {orderItems.map((item, index) => (
                          <div key={`${item.menuItemId}-${item.portion || index}`} className="p-3 sm:p-4 bg-muted">
                            <div className="flex items-start justify-between mb-2 sm:mb-3">
                              <div className="font-medium text-xs sm:text-sm">{item.name}</div>
                              <button
                                onClick={() => setOrderItems(orderItems.filter((_, i) => i !== index))}
                                className="text-destructive hover:text-destructive/80 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <button
                                  onClick={() => {
                                    const newItems = [...orderItems];
                                    newItems[index] = { ...newItems[index], quantity: Math.max(1, newItems[index].quantity - 1) };
                                    setOrderItems(newItems);
                                  }}
                                  className="w-7 h-7 sm:w-8 sm:h-8 bg-white flex items-center justify-center hover:bg-white/80"
                                >
                                  <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </button>
                                <span className="w-8 sm:w-10 text-center font-medium text-base sm:text-lg">{item.quantity}</span>
                                <button
                                  onClick={() => {
                                    const newItems = [...orderItems];
                                    newItems[index] = { ...newItems[index], quantity: newItems[index].quantity + 1 };
                                    setOrderItems(newItems);
                                  }}
                                  className="w-7 h-7 sm:w-8 sm:h-8 bg-white flex items-center justify-center hover:bg-white/80"
                                >
                                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                </button>
                              </div>
                              <div className="text-primary font-semibold text-sm sm:text-base">
                                {item.price * item.quantity} جنيه
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Extra Cost Section */}
                      <div className="p-3 sm:p-4 bg-yellow-50 border border-yellow-200 mb-4 sm:mb-6">
                        <label className="block mb-2 text-xs sm:text-sm font-medium">تكلفة إضافية (توصيل / إضافات)</label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="number"
                            value={extraCost || ''}
                            onChange={(e) => setExtraCost(Number(e.target.value) || 0)}
                            className="w-20 sm:w-24 px-2 sm:px-3 py-2 text-center text-sm bg-white border border-border focus:outline-none focus:border-primary"
                            placeholder="0"
                            min="0"
                          />
                          <span className="flex items-center text-xs sm:text-sm text-muted-foreground">جنيه</span>
                        </div>
                        <input
                          type="text"
                          value={extraCostNote}
                          onChange={(e) => setExtraCostNote(e.target.value)}
                          className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm bg-white border border-border focus:outline-none focus:border-primary"
                          placeholder="سبب التكلفة (اختياري)"
                        />
                      </div>

                      <div className="py-3 sm:py-4 border-y border-border mb-4 sm:mb-6 space-y-2">
                        <div className="flex justify-between items-center text-xs sm:text-sm text-muted-foreground">
                          <span>الأصناف:</span>
                          <span>{calculateItemsTotal()} جنيه</span>
                        </div>
                        {extraCost > 0 && (
                          <div className="flex justify-between items-center text-xs sm:text-sm text-yellow-700">
                            <span>تكلفة إضافية:</span>
                            <span>+{extraCost} جنيه</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t border-border">
                          <span className="text-sm sm:text-lg font-medium">الإجمالي:</span>
                          <span className="text-xl sm:text-2xl font-semibold text-primary">
                            {calculateTotal()} جنيه
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={handleSubmitOrder}
                        disabled={isSubmitting}
                        className="w-full py-3 sm:py-4 bg-primary text-white hover:bg-primary/90 transition-all text-base sm:text-lg disabled:opacity-50 flex items-center justify-center gap-2 min-h-[48px]"
                      >
                        {isSubmitting && <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />}
                        تأكيد الطلب
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        {orders.length > 0 && (
          <div className="max-w-6xl mx-auto mt-12 sm:mt-16 md:mt-20">
            <div className="flex flex-col gap-4 mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl">طلبات اليوم</h2>
              
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Status Filter */}
                <div className="flex gap-1 p-1 bg-muted rounded-lg overflow-x-auto">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm rounded-md transition-all whitespace-nowrap min-h-[36px] ${
                      statusFilter === 'all' 
                        ? 'bg-white shadow text-primary font-medium' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    الكل ({orders.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('pending')}
                    className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm rounded-md transition-all whitespace-nowrap min-h-[36px] ${
                      statusFilter === 'pending' 
                        ? 'bg-yellow-100 shadow text-yellow-700 font-medium' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    انتظار ({orders.filter(o => o.status === 'pending').length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('delivered')}
                    className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm rounded-md transition-all whitespace-nowrap min-h-[36px] ${
                      statusFilter === 'delivered' 
                        ? 'bg-green-100 shadow text-green-700 font-medium' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    تم ({orders.filter(o => o.status === 'delivered').length})
                  </button>
                </div>
                
                {/* Type Filter */}
                <div className="flex gap-1 p-1 bg-muted rounded-lg overflow-x-auto">
                  <button
                    onClick={() => setTypeFilter('all')}
                    className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm rounded-md transition-all flex items-center gap-1 min-h-[36px] ${
                      typeFilter === 'all' 
                        ? 'bg-white shadow text-primary font-medium' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    الكل
                  </button>
                  <button
                    onClick={() => setTypeFilter('delivery')}
                    className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm rounded-md transition-all flex items-center gap-1 whitespace-nowrap min-h-[36px] ${
                      typeFilter === 'delivery' 
                        ? 'bg-blue-100 shadow text-blue-700 font-medium' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Truck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    توصيل ({orders.filter(o => o.orderType === 'delivery').length})
                  </button>
                  <button
                    onClick={() => setTypeFilter('takeaway')}
                    className={`px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm rounded-md transition-all flex items-center gap-1 whitespace-nowrap min-h-[36px] ${
                      typeFilter === 'takeaway' 
                        ? 'bg-orange-100 shadow text-orange-700 font-medium' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Store className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    استلام ({orders.filter(o => o.orderType === 'takeaway').length})
                  </button>
                </div>
              </div>
            </div>
            
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 bg-muted rounded-lg">
                <p className="text-muted-foreground">لا توجد طلبات تطابق الفلتر المحدد</p>
              </div>
            ) : (
              /* Orders Grid - Cards */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.map((order) => (
                  <button
                    key={order._id}
                    onClick={() => setSelectedOrder(order)}
                    className={`text-right bg-white border-2 p-5 hover:shadow-lg transition-all ${
                      selectedOrder?._id === order._id
                        ? 'border-primary bg-primary/5'
                        : order.status === 'delivered' ? 'border-green-200' :
                          order.status === 'cancelled' ? 'border-red-200' :
                          'border-border hover:border-primary'
                    }`}
                  >
                    {/* Price & Status */}
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-2xl font-bold text-primary">
                        {order.totalAmount} جنيه
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {order.status === 'pending' ? '⏳ انتظار' :
                         order.status === 'delivered' ? '✓ تم' : '✗ ملغي'}
                      </span>
                    </div>
                    
                    {/* Customer Name */}
                    <div className="text-lg font-medium mb-2">{order.customerName}</div>
                    
                    {/* Order Type & Time */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className={`flex items-center gap-1 ${
                        order.orderType === 'delivery' ? 'text-blue-600' : 'text-orange-600'
                      }`}>
                        {order.orderType === 'delivery' ? (
                          <><Truck className="w-3.5 h-3.5" /> توصيل</>
                        ) : (
                          <><Store className="w-3.5 h-3.5" /> استلام</>
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(order.createdAt).toLocaleTimeString('ar-EG', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    
                    {/* Order Number */}
                    <div className="text-xs text-muted-foreground mt-2 font-mono">
                      #{order.orderNumber}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Order Details Drawer */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setSelectedOrder(null)}
            />

            {/* Drawer Panel - Full screen on mobile */}
            <div className="absolute inset-0 sm:inset-auto sm:top-0 sm:right-0 sm:h-full sm:w-full sm:max-w-md bg-white shadow-2xl overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-border p-3 sm:p-4 flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold">تفاصيل الطلب</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-muted rounded-full transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Status Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full font-medium ${
                    selectedOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    selectedOrder.status === 'preparing' ? 'bg-blue-100 text-blue-700' :
                    selectedOrder.status === 'ready' ? 'bg-purple-100 text-purple-700' :
                    selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedOrder.status === 'pending' ? '⏳ قيد الانتظار' :
                     selectedOrder.status === 'preparing' ? '👨‍🍳 جاري التحضير' :
                     selectedOrder.status === 'ready' ? '✅ جاهز للاستلام' :
                     selectedOrder.status === 'delivered' ? '✓ تم التوصيل' :
                     '✗ ملغي'}
                  </span>
                  <span className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-full ${
                    selectedOrder.orderType === 'delivery' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                  }`}>
                    {selectedOrder.orderType === 'delivery' ? '🚚 توصيل' : '🏪 استلام'}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="bg-muted/50 p-3 sm:p-4 rounded-lg space-y-2 sm:space-y-3">
                  <h3 className="text-base sm:text-lg font-semibold">{selectedOrder.customerName}</h3>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span dir="ltr">{selectedOrder.customerPhone}</span>
                  </div>
                  
                  {selectedOrder.orderType === 'delivery' && selectedOrder.customerAddress && (
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5" />
                      <span>{selectedOrder.customerAddress}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-muted-foreground text-xs sm:text-sm">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>
                      {new Date(selectedOrder.createdAt).toLocaleString('ar-EG', {
                        hour: '2-digit',
                        minute: '2-digit',
                        day: 'numeric',
                        month: 'numeric',
                      })}
                    </span>
                  </div>
                  
                  <div className="text-[10px] sm:text-xs text-muted-foreground font-mono">
                    رقم الطلب: {selectedOrder.orderNumber}
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800 font-medium mb-1.5 sm:mb-2 text-sm">
                      <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      ملاحظات
                    </div>
                    <p className="text-yellow-700 text-xs sm:text-sm">{selectedOrder.notes}</p>
                  </div>
                )}

                {/* Order Items */}
                <div>
                  <h4 className="font-semibold mb-2 sm:mb-3 text-sm sm:text-base">الأصناف</h4>
                  <div className="space-y-2 sm:space-y-3">
                    {selectedOrder.items.map((item, idx) => {
                      const menuItem = typeof item.menuItem === 'object' ? item.menuItem : null;
                      return (
                        <div key={idx} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                          <div>
                            <span className="font-medium text-sm sm:text-base">{menuItem?.nameAr || 'صنف محذوف'}</span>
                            <span className="text-muted-foreground text-xs sm:text-sm mr-2">× {item.quantity}</span>
                          </div>
                          <span className="font-semibold text-sm sm:text-base">{item.price * item.quantity} جنيه</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Total */}
                <div className="bg-primary/10 p-3 sm:p-4 rounded-lg flex justify-between items-center">
                  <span className="text-sm sm:text-lg font-semibold">الإجمالي</span>
                  <span className="text-xl sm:text-2xl font-bold text-primary">{selectedOrder.totalAmount} جنيه</span>
                </div>

                {/* Payment Status */}
                {selectedOrder.isPaid && (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2.5 sm:p-3 rounded-lg text-sm">
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium">تم الدفع</span>
                  </div>
                )}

                {/* Action Buttons */}
                {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                  <div className="space-y-2 sm:space-y-3 pt-4 border-t border-border">
                    <button
                      onClick={() => {
                        handleConfirmDelivery(selectedOrder._id);
                        // Update selected order state
                        setSelectedOrder(prev => prev ? {...prev, status: 'delivered', isPaid: true} : null);
                      }}
                      disabled={updatingOrderId === selectedOrder._id}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 sm:py-4 bg-green-600 text-white hover:bg-green-700 transition-all disabled:opacity-50 rounded-lg text-base sm:text-lg min-h-[48px]"
                    >
                      {updatingOrderId === selectedOrder._id ? (
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                      تأكيد التوصيل واستلام النقود
                    </button>
                    <button
                      onClick={() => {
                        handleCancelOrder(selectedOrder._id);
                        setSelectedOrder(null);
                      }}
                      disabled={updatingOrderId === selectedOrder._id}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 text-red-600 border-2 border-red-300 hover:bg-red-50 transition-all disabled:opacity-50 rounded-lg text-sm sm:text-base min-h-[44px]"
                    >
                      إلغاء الطلب
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}