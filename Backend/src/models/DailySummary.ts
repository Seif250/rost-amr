import mongoose, { Document, Schema } from 'mongoose';

export interface IDailySummary extends Document {
  date: Date;
  dateString: string; // Format: YYYY-MM-DD for easy querying
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
  topSellingItems: Array<{
    menuItemId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const DailySummarySchema = new Schema<IDailySummary>(
  {
    date: {
      type: Date,
      required: true,
    },
    dateString: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    totalOrders: {
      type: Number,
      required: true,
      default: 0,
    },
    totalSales: {
      type: Number,
      required: true,
      default: 0,
    },
    totalDeliveryOrders: {
      type: Number,
      default: 0,
    },
    totalTakeawayOrders: {
      type: Number,
      default: 0,
    },
    deliveredOrders: {
      type: Number,
      default: 0,
    },
    cancelledOrders: {
      type: Number,
      default: 0,
    },
    pendingOrders: {
      type: Number,
      default: 0,
    },
    paymentBreakdown: {
      cash: { type: Number, default: 0 },
      online: { type: Number, default: 0 },
    },
    deliveryCosts: {
      type: Number,
      default: 0,
    },
    averageOrderValue: {
      type: Number,
      default: 0,
    },
    topSellingItems: [
      {
        menuItemId: String,
        name: String,
        quantity: Number,
        revenue: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for efficient date-based queries
DailySummarySchema.index({ date: -1 });
DailySummarySchema.index({ createdAt: 1 });

// Static method to get date string in YYYY-MM-DD format
DailySummarySchema.statics.getDateString = function (date: Date): string {
  return date.toISOString().split('T')[0];
};

// Static method to clean up old records (older than 7 days)
DailySummarySchema.statics.cleanupOldRecords = async function (): Promise<number> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const result = await this.deleteMany({
    date: { $lt: sevenDaysAgo },
  });

  return result.deletedCount || 0;
};

export const DailySummary = mongoose.model<IDailySummary>('DailySummary', DailySummarySchema);
