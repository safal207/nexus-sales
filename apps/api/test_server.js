const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Database setup
const db = new sqlite3.Database('./var/sqlite.db');

// Create tables if they don't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    password_hash TEXT,
    created_at TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    seller_id TEXT,
    title TEXT,
    description TEXT,
    price REAL,
    active INTEGER,
    created_at TEXT,
    updated_at TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    product_id TEXT,
    email TEXT,
    status TEXT,
    created_at TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    name TEXT,
    ts TEXT,
    session_id TEXT,
    product_id TEXT,
    order_id TEXT,
    referrer TEXT,
    ab_variant TEXT
  )`);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payload. Email must be valid and password at least 8 characters.'
      });
    }

    // Check if user exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (row) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists.'
        });
      }

      // Hash password and create user
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = 'usr_' + Date.now();
      const now = new Date().toISOString();

      db.run(
        'INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)',
        [userId, email, hashedPassword, now],
        function(err) {
          if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Database error' });
          }

          const token = jwt.sign(
            { sub: userId, email: email },
            process.env.JWT_SECRET || 'test-secret-key-12345'
          );

          res.status(201).json({
            success: true,
            token: token,
            user: {
              id: userId,
              email: email,
              createdAt: now
            }
          });
        }
      );
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'An unexpected error occurred.' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    db.get(
      'SELECT id, email, password_hash, created_at FROM users WHERE email = ?',
      [email],
      async (err, user) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
          return res.status(401).json({
            success: false,
            message: 'Invalid email or password.'
          });
        }

        const token = jwt.sign(
          { sub: user.id, email: user.email },
          process.env.JWT_SECRET || 'test-secret-key-12345'
        );

        res.json({
          success: true,
          token: token,
          user: {
            id: user.id,
            email: user.email,
            createdAt: user.created_at
          }
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'An unexpected error occurred.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
