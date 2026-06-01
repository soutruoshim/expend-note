import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

let pool;

// Initialize Database connection and tables
const initDb = async () => {
  try {
    if (!process.env.MYSQL_URI) {
      console.warn("MYSQL_URI environment variable is not set. Database operations will fail.");
      return;
    }

    pool = mysql.createPool(process.env.MYSQL_URI);
    console.log("Connected to MySQL database.");

    // Ensure the tables support full UTF-8 (for emojis and Khmer characters)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId VARCHAR(255) NOT NULL,
        date VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        qty INT NOT NULL,
        price INT NOT NULL,
        time VARCHAR(255) NOT NULL,
        icon VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        price INT NOT NULL,
        icon VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);

    // Alter existing tables just in case they were already created with the wrong character set
    await pool.query('ALTER TABLE expenses CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
    await pool.query('ALTER TABLE products CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');

    console.log("Database tables initialized.");
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
};
initDb();

const getUserId = (req) => req.headers['x-user-id'] || 'default';

// API Routes
app.post('/api/upload-invoice', (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'No image provided' });
    
    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    const fileName = `invoice-${Date.now()}.png`;
    const uploadsDir = path.join(__dirname, '../uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(uploadsDir, fileName), base64Data, 'base64');
    
    res.json({ url: `/uploads/${fileName}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save image' });
  }
});

app.get('/api/expenses', async (req, res) => {
  try {
    const userId = getUserId(req);
    const [rows] = await pool.query('SELECT * FROM expenses WHERE userId = ?', [userId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { date, name, qty, price, time, icon, category } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO expenses (userId, date, name, qty, price, time, icon, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, date, name, qty, price, time, icon, category]
    );
    
    res.status(201).json({
      id: result.insertId,
      userId, date, name, qty, price, time, icon, category
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = getUserId(req);
    
    const [result] = await pool.query('DELETE FROM expenses WHERE id = ? AND userId = ?', [id, userId]);
    
    if (result.affectedRows > 0) {
      res.status(200).json({ success: true });
    } else {
      res.status(404).json({ error: 'Expense not found or unauthorized' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const userId = getUserId(req);
    const [rows] = await pool.query('SELECT * FROM products WHERE userId = ?', [userId]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const userId = getUserId(req);
    const { name, price, icon, category } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO products (userId, name, price, icon, category) VALUES (?, ?, ?, ?, ?)',
      [userId, name, price, icon, category]
    );
    
    res.status(201).json({
      id: result.insertId,
      userId, name, price, icon, category
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = getUserId(req);
    const { name, price, icon, category } = req.body;
    
    const [result] = await pool.query(
      'UPDATE products SET name = ?, price = ?, icon = ?, category = ? WHERE id = ? AND userId = ?',
      [name, price, icon, category, id, userId]
    );
    
    if (result.affectedRows > 0) {
      res.json({ id, userId, name, price, icon, category });
    } else {
      res.status(404).json({ error: 'Product not found or unauthorized' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
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
