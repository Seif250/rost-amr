export interface Env {
  MONGODB_DATA_API_URL: string; // e.g. https://data.mongodb-api.com/app/<APP_ID>/endpoint/data/v1
  MONGODB_DATA_API_KEY: string;
  MONGO_DB_NAME: string; // e.g. 'yourDb'
  MONGO_DATA_SOURCE: string; // e.g. 'Cluster0'
}

const json = (status: number, data: any) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

const checkEnv = (env: Env) => {
  if (!env.MONGODB_DATA_API_URL || !env.MONGODB_DATA_API_KEY || !env.MONGO_DB_NAME || !env.MONGO_DATA_SOURCE) {
    throw new Error('Missing required environment variables. Set MONGODB_DATA_API_URL, MONGODB_DATA_API_KEY, MONGO_DB_NAME, MONGO_DATA_SOURCE');
  }
};

async function mongoFind(env: Env, collection: string, body: any) {
  checkEnv(env);
  const url = new URL(env.MONGODB_DATA_API_URL + `/action/${body.action || 'find'}`);

  const resp = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': env.MONGODB_DATA_API_KEY,
    },
    body: JSON.stringify({
      dataSource: env.MONGO_DATA_SOURCE,
      database: env.MONGO_DB_NAME,
      collection,
      ...body.payload,
    }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Mongo Data API error: ${resp.status} ${text}`);
  }

  return resp.json();
}

// Helper to find orders between start/end ISO strings
async function findOrdersBetween(env: Env, startISO: string, endISO: string) {
  const payload = {
    filter: {
      createdAt: { $gte: { $date: startISO }, $lte: { $date: endISO } },
    },
  };
  const res = await mongoFind(env, 'orders', { action: 'find', payload });
  return res.documents || [];
}

// Aggregation for top selling items
async function getTopSellingItems(env: Env, startISO: string, endISO: string) {
  const pipeline = [
    { $match: { createdAt: { $gte: { $date: startISO }, $lte: { $date: endISO } } } },
    { $unwind: '$items' },
    { $group: { _id: '$items.menuItem', quantity: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } } } },
    { $lookup: { from: 'menuitems', localField: '_id', foreignField: '_id', as: 'menuItem' } },
    { $unwind: { path: '$menuItem', preserveNullAndEmptyArrays: true } },
    { $project: { menuItemId: '$_id', name: '$menuItem.nameAr', quantity: 1, revenue: 1 } },
    { $sort: { quantity: -1 } },
    { $limit: 10 },
  ];

  const res = await mongoFind(env, 'orders', { action: 'aggregate', payload: { pipeline } });
  return res.documents || [];
}

async function upsertDailySummary(env: Env, dateString: string, data: any) {
  const filter = { dateString };
  const update = { $set: data };
  const payload = { filter, update, upsert: true };
  const res = await mongoFind(env, 'dailySummaries', { action: 'updateOne', payload });
  return res;
}

async function deleteOldSummaries(env: Env, olderThanISO: string) {
  const filter = { date: { $lt: { $date: olderThanISO } } };
  const payload = { filter };
  const res = await mongoFind(env, 'dailySummaries', { action: 'deleteMany', payload });
  return res;
}

function isoForDate(date: Date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  const start = new Date(d).toISOString();
  const end = new Date(d);
  end.setUTCHours(23, 59, 59, 999);
  return { start: start, end: end.toISOString() };
}

async function generateDailySummaryForDate(env: Env, target: Date) {
  const { start, end } = isoForDate(target);

  // fetch orders
  const orders = await findOrdersBetween(env, start, end);
  if (!orders || orders.length === 0) return null;

  const totalOrders = orders.length;
  const validOrders = orders.filter((o: any) => o.status !== 'cancelled');
  const totalSales = validOrders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
  const deliveredOrders = orders.filter((o: any) => o.status === 'delivered').length;
  const cancelledOrders = orders.filter((o: any) => o.status === 'cancelled').length;
  const pendingOrders = orders.filter((o: any) => o.status === 'pending').length;
  const totalDeliveryOrders = orders.filter((o: any) => o.orderType === 'delivery').length;
  const totalTakeawayOrders = orders.filter((o: any) => o.orderType === 'takeaway').length;

  const paymentBreakdown = {
    cash: validOrders.filter((o: any) => o.paymentMethod === 'cash').reduce((s: number, o: any) => s + (o.totalAmount || 0), 0),
    online: validOrders.filter((o: any) => o.paymentMethod === 'card').reduce((s: number, o: any) => s + (o.totalAmount || 0), 0),
  };

  const averageOrderValue = validOrders.length > 0 ? totalSales / validOrders.length : 0;

  let deliveryCosts = 0;
  validOrders.forEach((order: any) => {
    if (order.notes && typeof order.notes === 'string' && order.notes.includes('تكلفة إضافية')) {
      const match = order.notes.match(/تكلفة إضافية:\s*(\d+)/);
      if (match) deliveryCosts += parseInt(match[1], 10);
    }
  });

  const topSellingItems = await getTopSellingItems(env, start, end);

  const summary = {
    date: new Date(start),
    dateString: start.split('T')[0],
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

  await upsertDailySummary(env, summary.dateString, summary);
  return summary;
}

export default {
  async fetch(request: Request, env: Env) {
    try {
      const url = new URL(request.url);
      const pathname = url.pathname.replace(/\/+/g, '/');

      // Simple routing
      if (pathname === '/api/summaries' && request.method === 'GET') {
        const res = await mongoFind(env, 'dailySummaries', { action: 'find', payload: { sort: { date: -1 }, limit: 7 } });
        return json(200, { success: true, data: res.documents });
      }

      if (pathname === '/api/summaries/weekly' && request.method === 'GET') {
        const res = await mongoFind(env, 'dailySummaries', { action: 'find', payload: { sort: { date: -1 }, limit: 7 } });
        const summaries = res.documents || [];
        const totalOrders = summaries.reduce((s: number, x: any) => s + (x.totalOrders || 0), 0);
        const totalSales = summaries.reduce((s: number, x: any) => s + (x.totalSales || 0), 0);
        const averageDaily = summaries.length ? totalSales / summaries.length : 0;
        const bestDay = summaries.reduce((best: any, s: any) => (s.totalSales > (best?.totalSales || 0) ? s : best), summaries[0]);
        const paymentBreakdown = { cash: summaries.reduce((s: number, x: any) => s + (x.paymentBreakdown?.cash || 0), 0), online: summaries.reduce((s: number, x: any) => s + (x.paymentBreakdown?.online || 0), 0) };
        return json(200, { success: true, data: { totalOrders, totalSales, averageDaily, bestDay: bestDay ? { date: bestDay.dateString, sales: bestDay.totalSales, orders: bestDay.totalOrders } : null, paymentBreakdown, daysCount: summaries.length } });
      }

      const dateMatch = pathname.match(/^\/api\/summaries\/(\d{4}-\d{2}-\d{2})$/);
      if (dateMatch && request.method === 'GET') {
        const date = dateMatch[1];
        const res = await mongoFind(env, 'dailySummaries', { action: 'find', payload: { filter: { dateString: date } } });
        const doc = (res.documents || [])[0];
        if (!doc) return json(404, { success: false, error: 'لا يوجد ملخص لهذا التاريخ' });
        return json(200, { success: true, data: doc });
      }

      if (pathname === '/api/summaries/generate' && request.method === 'POST') {
        const summary = await generateDailySummaryForDate(env, new Date());
        if (!summary) return json(404, { success: false, error: 'لا توجد طلبات لهذا اليوم' });
        return json(200, { success: true, data: summary, message: 'تم إنشاء ملخص اليوم بنجاح' });
      }

      const generateDateMatch = pathname.match(/^\/api\/summaries\/generate\/(\d{4}-\d{2}-\d{2})$/);
      if (generateDateMatch && request.method === 'POST') {
        const targetDate = new Date(generateDateMatch[1]);
        const summary = await generateDailySummaryForDate(env, targetDate);
        if (!summary) return json(404, { success: false, error: 'لا توجد طلبات لهذا التاريخ' });
        return json(200, { success: true, data: summary, message: 'تم إنشاء الملخص بنجاح' });
      }

      if (pathname === '/api/summaries/cleanup' && request.method === 'DELETE') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setUTCHours(0, 0, 0, 0);
        const res = await deleteOldSummaries(env, sevenDaysAgo.toISOString());
        return json(200, { success: true, message: `تم حذف ${res.deletedCount || 0} سجل قديم`, deletedCount: res.deletedCount || 0 });
      }

      return new Response('Not found', { status: 404 });
    } catch (err: any) {
      return json(500, { success: false, error: err.message || String(err) });
    }
  }
};
