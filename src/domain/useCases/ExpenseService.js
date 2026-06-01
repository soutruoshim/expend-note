import { Expense } from '../entities/Expense.js';

export class ExpenseService {
  constructor(expenseRepository) {
    this.expenseRepository = expenseRepository;
  }

  async getAllExpenses() {
    return await this.expenseRepository.getAll();
  }

  async getExpensesByDate(date) {
    const expenses = await this.getAllExpenses();
    return expenses.filter(e => e.date === date);
  }

  async addExpense(expenseData) {
    const expense = new Expense(expenseData);
    await this.expenseRepository.add(expense);
    return expense;
  }

  async deleteExpense(id) {
    await this.expenseRepository.delete(id);
  }

  calculateTotal(expenses) {
    return expenses.reduce((sum, item) => sum + (item.price * item.qty), 0);
  }

  calculateCategoryTotals(expenses, categories) {
    const total = this.calculateTotal(expenses) || 1;
    return categories.map(c => {
      const sum = expenses
        .filter(e => e.category === c.name)
        .reduce((t, i) => t + (i.price * i.qty), 0);
      const count = expenses.filter(e => e.category === c.name).length;
      return { ...c, sum, count, pct: Math.round((sum / total) * 100) };
    }).filter(c => c.sum > 0);
  }

  getWeeklyTotals(expenses, weekDates) {
    return weekDates.map(date => {
      const dayTotal = expenses
        .filter(e => e.date === date)
        .reduce((t, i) => t + (i.price * i.qty), 0);
      return { date, total: dayTotal };
    });
  }
}
