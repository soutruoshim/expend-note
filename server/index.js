import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'db.json');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize DB if not exists
const initDb = () => {
  if (!fs.existsSync(dbPath)) {
    const defaultData = {
      expenses: [
        { id: 1, userId: 'default', date: '2026-05-29', name: 'កាហ្វេ', qty: 1, price: 5000, time: '08:15 AM', icon: '☕', category: 'ភេសជ្ជៈ' },
        { id: 2, userId: 'default', date: '2026-05-29', name: 'ទឹកតូច', qty: 10, price: 2000, time: '10:30 AM', icon: '💧', category: 'ភេសជ្ជៈ' },
        { id: 3, userId: 'default', date: '2026-05-28', name: 'V-Coffee', qty: 2, price: 5000, time: '09:00 AM', icon: '🥤', category: 'ភេសជ្ជៈ' },
        { id: 4, userId: 'default', date: '2026-05-28', name: 'ហ្វូ', qty: 1, price: 7000, time: '12:30 PM', icon: '🍜', category: 'អាហារ' },
        { id: 5, userId: 'default', date: '2026-05-27', name: 'កាហ្វេ', qty: 1, price: 5000, time: '08:00 AM', icon: '☕', category: 'ភេសជ្ជៈ' },
        { id: 6, userId: 'default', date: '2026-05-26', name: 'ទឹកធំ', qty: 3, price: 3000, time: '14:00 PM', icon: '🌊', category: 'ភេសជ្ជៈ' },
        { id: 7, userId: 'default', date: '2026-05-25', name: 'បាយ', qty: 1, price: 8000, time: '12:00 PM', icon: '🍱', category: 'អាហារ' }
      ],
      products: [
        { id: 1, userId: 'default', name: 'កាហ្វេ', price: 5000, icon: '☕', category: 'ភេសជ្ជៈ' },
        { id: 2, userId: 'default', name: 'V-Coffee', price: 5000, icon: '🥤', category: 'ភេសជ្ជៈ' },
        { id: 3, userId: 'default', name: 'ទឹកតូច', price: 2000, icon: '💧', category: 'ភេសជ្ជៈ' },
        { id: 4, userId: 'default', name: 'ទឹកធំ', price: 3000, icon: '🌊', category: 'ភេសជ្ជៈ' },
        { id: 5, userId: 'default', name: 'បាយ', price: 8000, icon: '🍱', category: 'អាហារ' },
        { id: 6, userId: 'default', name: 'ហ្វូ', price: 7000, icon: '🍜', category: 'អាហារ' }
      ]
    };
    fs.writeFileSync(dbPath, JSON.stringify(defaultData, null, 2));
  }
};
initDb();

const getDb = () => JSON.parse(fs.readFileSync(dbPath, 'utf8'));
const saveDb = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

// Data migration for existing DBs
const migrateDb = () => {
  const db = getDb();
  let modified = false;
  if (db.expenses) {
    db.expenses.forEach(e => {
      if (!e.userId) { e.userId = 'default'; modified = true; }
    });
  }
  if (db.products) {
    db.products.forEach(p => {
      if (!p.userId) { p.userId = 'default'; modified = true; }
    });
  }
  if (modified) saveDb(db);
};
migrateDb();

const getUserId = (req) => req.headers['x-user-id'] || 'default';

// API Routes
app.get('/api/expenses', (req, res) => {
  const userId = getUserId(req);
  res.json(getDb().expenses.filter(e => e.userId === userId));
});

app.post('/api/expenses', (req, res) => {
  const db = getDb();
  const expense = req.body;
  expense.userId = getUserId(req);
  expense.id = db.expenses.length > 0 ? Math.max(...db.expenses.map(e => e.id)) + 1 : 1;
  db.expenses.push(expense);
  saveDb(db);
  res.status(201).json(expense);
});

app.delete('/api/expenses/:id', (req, res) => {
  const db = getDb();
  const id = parseInt(req.params.id);
  const userId = getUserId(req);
  
  // Only allow deleting own expenses
  const index = db.expenses.findIndex(e => e.id === id && e.userId === userId);
  if (index !== -1) {
    db.expenses.splice(index, 1);
    saveDb(db);
    res.status(200).json({ success: true });
  } else {
    res.status(404).json({ error: 'Expense not found or unauthorized' });
  }
});

app.get('/api/products', (req, res) => {
  const userId = getUserId(req);
  res.json(getDb().products.filter(p => p.userId === userId));
});

app.post('/api/products', (req, res) => {
  const db = getDb();
  const product = req.body;
  product.userId = getUserId(req);
  product.id = db.products.length > 0 ? Math.max(...db.products.map(p => p.id)) + 1 : 1;
  db.products.push(product);
  saveDb(db);
  res.status(201).json(product);
});

app.put('/api/products/:id', (req, res) => {
  const db = getDb();
  const id = parseInt(req.params.id);
  const userId = getUserId(req);
  
  const index = db.products.findIndex(p => p.id === id && p.userId === userId);
  if (index !== -1) {
    db.products[index] = { ...db.products[index], ...req.body };
    saveDb(db);
    res.json(db.products[index]);
  } else {
    res.status(404).json({ error: 'Product not found or unauthorized' });
  }
});

app.get('/api/categories', (req, res) => {
  res.json([
    { name: 'ភេសជ្ជៈ', color: '#3b82f6' },
    { name: 'អាហារ', color: '#f59e0b' },
    { name: 'ផ្សេងៗ', color: '#8b5cf6' }
  ]);
});

app.get('/api/icons', (req, res) => {
  res.json(['☕', '🥤', '💧', '🌊', '🍜', '🍱', '🍕', '🛒', '🚗', '💊']);
});

// Serve frontend static files in production
app.use(express.static(path.join(__dirname, '../dist')));
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Server running on port ${PORT}`);
});
