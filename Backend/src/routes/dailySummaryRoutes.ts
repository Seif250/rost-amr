import { Router } from 'express';
import {
  getAllSummaries,
  getSummaryByDate,
  generateTodaySummary,
  generateSummaryForDate,
  triggerCleanup,
  getWeeklySummary,
} from '../controllers/dailySummaryController';

const router: import('express').Router = Router();

// GET /api/summaries - Get all daily summaries (last 7 days)
router.get('/', getAllSummaries);

// GET /api/summaries/weekly - Get weekly aggregate statistics
router.get('/weekly', getWeeklySummary);

// GET /api/summaries/:date - Get summary for a specific date (YYYY-MM-DD)
router.get('/:date', getSummaryByDate);

// POST /api/summaries/generate - Generate summary for today
router.post('/generate', generateTodaySummary);

// POST /api/summaries/generate/:date - Generate summary for a specific date
router.post('/generate/:date', generateSummaryForDate);

// DELETE /api/summaries/cleanup - Manual cleanup of old records
router.delete('/cleanup', triggerCleanup);

export default router;
