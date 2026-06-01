import { Expense } from '../../domain/entities/Expense.js';

const STORAGE_KEY = 'expend_note_expenses_v2';

export class LocalStorageExpenseRepository {
  constructor() {
    this._initializeMockDataIfEmpty();
  }

  _initializeMockDataIfEmpty() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const mockData = [
        { id: 1, date: '2026-05-29', name: 'កាហ្វេ', qty: 1, price: 5000, time: '08:15 AM', icon: '☕', category: 'ភេសជ្ជៈ' },
        { id: 2, date: '2026-05-29', name: 'ទឹកតូច', qty: 10, price: 2000, time: '10:30 AM', icon: '💧', category: 'ភេសជ្ជៈ' },
        { id: 3, date: '2026-05-28', name: 'V-Coffee', qty: 2, price: 5000, time: '09:00 AM', icon: '🥤', category: 'ភេសជ្ជៈ' },
        { id: 4, date: '2026-05-28', name: 'ហ្វូ', qty: 1, price: 7000, time: '12:30 PM', icon: '🍜', category: 'អាហារ' },
        { id: 5, date: '2026-05-27', name: 'កាហ្វេ', qty: 1, price: 5000, time: '08:00 AM', icon: '☕', category: 'ភេសជ្ជៈ' },
        { id: 6, date: '2026-05-26', name: 'ទឹកធំ', qty: 3, price: 3000, time: '14:00 PM', icon: '🌊', category: 'ភេសជ្ជៈ' },
        { id: 7, date: '2026-05-25', name: 'បាយ', qty: 1, price: 8000, time: '12:00 PM', icon: '🍱', category: 'អាហារ' },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockData));
    }
  }

  _save(expenses) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }

  async getAll() {
    const dataStr = localStorage.getItem(STORAGE_KEY);
    if (!dataStr) return [];
    try {
      const data = JSON.parse(dataStr);
      return data.map(item => new Expense(item));
    } catch (e) {
      console.error('Error parsing expenses', e);
      return [];
    }
  }

  async add(expense) {
    const expenses = await this.getAll();
    // Prepend to list
    expenses.unshift(expense);
    this._save(expenses);
  }

  async delete(id) {
    const expenses = await this.getAll();
    const updated = expenses.filter(e => e.id !== id);
    this._save(updated);
  }
}
