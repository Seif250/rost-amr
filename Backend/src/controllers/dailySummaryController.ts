import { Request, Response, NextFunction } from 'express';
import { DailySummary } from '../models/DailySummary';
import { Order } from '../models/Order';

// Helper: Get start and end of a specific date
const getDayBounds = (date: Date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  
  return { start, end };
};

// Helper: Get date string in YYYY-MM-DD format
const getDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Generate summary for a specific date
export const generateDailySummary = async (targetDate: Date) => {
  const { start, end } = getDayBounds(targetDate);
  const dateString = getDateString(targetDate);

  // Get all orders for the day
  const orders = await Order.find({
    createdAt: { $gte: start, $lte: end },
  }).populate('items.menuItem');

  if (orders.length === 0) {
    return null;
  }

  // Calculate statistics
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  
  const totalDeliveryOrders = orders.filter(o => o.orderType === 'delivery').length;
  const totalTakeawayOrders = orders.filter(o => o.orderType === 'takeaway').length;

  // Calculate sales (only from non-cancelled orders)
  const validOrders = orders.filter(o => o.status !== 'cancelled');
  const totalSales = validOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  
  // Payment breakdown
  const cashOrders = validOrders.filter(o => o.paymentMethod === 'cash');
  // Model uses 'card' for electronic payments; aggregate it under `online` for reporting
  const cardOrders = validOrders.filter(o => o.paymentMethod === 'card');
  
  const paymentBreakdown = {
    cash: cashOrders.reduce((sum, o) => sum + o.totalAmount, 0),
    online: cardOrders.reduce((sum, o) => sum + o.totalAmount, 0),
  };

  // Calculate average order value
  const averageOrderValue = validOrders.length > 0 ? totalSales / validOrders.length : 0;

  // Calculate delivery costs (extract from notes if mentioned, or estimate)
  let deliveryCosts = 0;
  validOrders.forEach(order => {
    if (order.notes && order.notes.includes('تكلفة إضافية')) {
      const match = order.notes.match(/تكلفة إضافية:\s*(\d+)/);
      if (match) {
        deliveryCosts += parseInt(match[1], 10);
      }
    }
  });

  // Top selling items
  const itemsSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
  
  validOrders.forEach(order => {
    order.items.forEach((item: any) => {
      const menuItem = item.menuItem;
      const itemId = menuItem?._id?.toString() || item.menuItem?.toString() || 'unknown';
      const itemName = menuItem?.nameAr || 'صنف غير معروف';
      
      if (!itemsSales[itemId]) {
        itemsSales[itemId] = { name: itemName, quantity: 0, revenue: 0 };
      }
      itemsSales[itemId].quantity += item.quantity;
      itemsSales[itemId].revenue += item.price * item.quantity;
    });
  });

  const topSellingItems = Object.entries(itemsSales)
    .map(([menuItemId, data]) => ({
      menuItemId,
      name: data.name,
      quantity: data.quantity,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10); // Top 10 items

  // Create or update daily summary
  const summaryData = {
    date: start,
    dateString,
    totalOrders,
    totalSales,
    totalDeliveryOrders,
    totalTakeawayOrders,
    deliveredOrders,
    cancelledOrders,
    pendingOrders,
    paymentBreakdown,
    deliveryCosts,
    averageOrderValue,
    topSellingItems,
  };

  const summary = await DailySummary.findOneAndUpdate(
    { dateString },
    summaryData,
    { upsert: true, new: true }
  );

  return summary;
};

// Auto-generate summary for previous day (called on first order of new day)
export const checkAndGeneratePreviousDaySummary = async () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const yesterdayString = getDateString(yesterday);
  
  // Check if summary already exists for yesterday
  const existingSummary = await DailySummary.findOne({ dateString: yesterdayString });
  
  if (!existingSummary) {
    // Generate summary for yesterday
    await generateDailySummary(yesterday);
    console.log(`[DailySummary] Generated summary for ${yesterdayString}`);
  }

  // Clean up old records
  await cleanupOldSummaries();
};

// Clean up summaries older than 7 days
export const cleanupOldSummaries = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const result = await DailySummary.deleteMany({
    date: { $lt: sevenDaysAgo },
  });

  if (result.deletedCount && result.deletedCount > 0) {
    console.log(`[DailySummary] Cleaned up ${result.deletedCount} old records`);
  }

  return result.deletedCount || 0;
};

// Controller: Get all daily summaries (last 7 days)
export const getAllSummaries = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const summaries = await DailySummary.find()
      .sort({ date: -1 })
      .limit(7);

    res.json({
      success: true,
      data: summaries,
      count: summaries.length,
    });
  } catch (error) {
    next(error);
  }
};

// Controller: Get summary for a specific date
export const getSummaryByDate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date } = req.params;
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        error: 'تنسيق التاريخ غير صحيح. استخدم YYYY-MM-DD',
      });
    }

    const summary = await DailySummary.findOne({ dateString: date });

    if (!summary) {
      return res.status(404).json({
        success: false,
        error: 'لا يوجد ملخص لهذا التاريخ',
      });
    }

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

// Controller: Generate summary for today (manual trigger)
export const generateTodaySummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const today = new Date();
    const summary = await generateDailySummary(today);

    if (!summary) {
      return res.status(404).json({
        success: false,
        error: 'لا توجد طلبات لهذا اليوم',
      });
    }

    res.json({
      success: true,
      data: summary,
      message: 'تم إنشاء ملخص اليوم بنجاح',
    });
  } catch (error) {
    next(error);
  }
};

// Controller: Generate summary for a specific date (manual trigger)
export const generateSummaryForDate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { date } = req.params;
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        error: 'تنسيق التاريخ غير صحيح. استخدم YYYY-MM-DD',
      });
    }

    const targetDate = new Date(date);
    const summary = await generateDailySummary(targetDate);

    if (!summary) {
      return res.status(404).json({
        success: false,
        error: 'لا توجد طلبات لهذا التاريخ',
      });
    }

    res.json({
      success: true,
      data: summary,
      message: 'تم إنشاء الملخص بنجاح',
    });
  } catch (error) {
    next(error);
  }
};

// Controller: Manual cleanup trigger
export const triggerCleanup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deletedCount = await cleanupOldSummaries();

    res.json({
      success: true,
      message: `تم حذف ${deletedCount} سجل قديم`,
      deletedCount,
    });
  } catch (error) {
    next(error);
  }
};

// Controller: Get summary statistics (aggregate of last 7 days)
export const getWeeklySummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const summaries = await DailySummary.find()
      .sort({ date: -1 })
      .limit(7);

    if (summaries.length === 0) {
      return res.json({
        success: true,
        data: {
          totalOrders: 0,
          totalSales: 0,
          averageDaily: 0,
          bestDay: null,
          paymentBreakdown: { cash: 0, online: 0 },
        },
      });
    }

    const totalOrders = summaries.reduce((sum, s) => sum + s.totalOrders, 0);
    const totalSales = summaries.reduce((sum, s) => sum + s.totalSales, 0);
    const averageDaily = totalSales / summaries.length;
    
    const bestDay = summaries.reduce((best, s) => 
      s.totalSales > (best?.totalSales || 0) ? s : best
    , summaries[0]);

    const paymentBreakdown = {
      cash: summaries.reduce((sum, s) => sum + s.paymentBreakdown.cash, 0),
      online: summaries.reduce((sum, s) => sum + s.paymentBreakdown.online, 0),
    };

    res.json({
      success: true,
      data: {
        totalOrders,
        totalSales,
        averageDaily,
        bestDay: {
          date: bestDay.dateString,
          sales: bestDay.totalSales,
          orders: bestDay.totalOrders,
        },
        paymentBreakdown,
        daysCount: summaries.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
