export class Expense {
  constructor({ id, date, name, qty, price, time, icon, category }) {
    this.id = id || Date.now();
    this.date = date; // Format: YYYY-MM-DD
    this.name = name;
    this.qty = qty || 1;
    this.price = price || 0;
    this.time = time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    this.icon = icon || '☕';
    this.category = category || 'ផ្សេងៗ';
  }

  get total() {
    return this.price * this.qty;
  }
}
