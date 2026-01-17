import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { connectDB } from './config/database.js';
import { menuRoutes, orderRoutes, expenseRoutes } from './routes/index.js';
import uploadRoutes from './routes/upload.js';
import dailySummaryRoutes from './routes/dailySummaryRoutes.js';
import { errorHandler, notFound } from './middleware/index.js';
import { checkAndGeneratePreviousDaySummary, cleanupOldSummaries } from './controllers/dailySummaryController.js';

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/summaries', dailySummaryRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    
    // Run daily summary check and cleanup on server start
    try {
      await checkAndGeneratePreviousDaySummary();
      console.log('✅ Daily summary check completed');
    } catch (summaryError) {
      console.error('⚠️ Daily summary check failed:', summaryError);
    }

    // Schedule daily cleanup at midnight
    const scheduleCleanup = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setDate(midnight.getDate() + 1);
      midnight.setHours(0, 0, 0, 0);
      
      const msUntilMidnight = midnight.getTime() - now.getTime();
      
      setTimeout(async () => {
        try {
          await checkAndGeneratePreviousDaySummary();
          console.log('✅ Midnight daily summary generated');
        } catch (error) {
          console.error('⚠️ Midnight summary generation failed:', error);
        }
        // Reschedule for next midnight
        scheduleCleanup();
      }, msUntilMidnight);
      
      console.log(`🕛 Next summary scheduled in ${Math.round(msUntilMidnight / 1000 / 60)} minutes`);
    };
    
    scheduleCleanup();
    
    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`📍 Environment: ${config.nodeEnv}`);
      console.log(`🔗 API URL: http://localhost:${config.port}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
