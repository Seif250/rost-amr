import { Request, Response } from 'express';
import { Expense } from '../models/Expense.js';

// Get all expenses
export const getAllExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, startDate, endDate } = req.query;
    const filter: Record<string, unknown> = {};
    
    if (category) filter.category = category;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) (filter.date as Record<string, unknown>).$gte = new Date(startDate as string);
      if (endDate) (filter.date as Record<string, unknown>).$lte = new Date(endDate as string);
    }
    
    const expenses = await Expense.find(filter).sort({ date: -1 });
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    
    res.status(200).json({
      success: true,
      count: expenses.length,
      totalAmount,
      data: expenses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching expenses',
      error,
    });
  }
};

// Get single expense
export const getExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching expense',
      error,
    });
  }
};

// Get expenses summary by category
export const getExpensesSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { month, year } = req.query;
    
    const matchStage: Record<string, unknown> = {};
    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0);
      matchStage.date = { $gte: startDate, $lte: endDate };
    }
    
    const summary = await Expense.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);
    
    const grandTotal = summary.reduce((sum, cat) => sum + cat.totalAmount, 0);
    
    res.status(200).json({
      success: true,
      grandTotal,
      data: summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching expenses summary',
      error,
    });
  }
};

// Create expense
export const createExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const expense = await Expense.create(req.body);
    res.status(201).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating expense',
      error,
    });
  }
};

// Update expense
export const updateExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!expense) {
      res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating expense',
      error,
    });
  }
};

// Delete expense
export const deleteExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) {
      res.status(404).json({
        success: false,
        message: 'Expense not found',
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting expense',
      error,
    });
  }
};
