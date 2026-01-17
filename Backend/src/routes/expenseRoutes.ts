import { Router, IRouter } from 'express';
import {
  getAllExpenses,
  getExpense,
  getExpensesSummary,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../controllers/expenseController.js';

const router: IRouter = Router();

router.route('/')
  .get(getAllExpenses)
  .post(createExpense);

router.get('/summary', getExpensesSummary);

router.route('/:id')
  .get(getExpense)
  .put(updateExpense)
  .delete(deleteExpense);

export default router;
