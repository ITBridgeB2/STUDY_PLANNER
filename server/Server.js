const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// POST /study_tasks (Insert new task)
app.post('/study_tasks', (req, res) => {
  const { subject, duration, task_date, notes, confidence_level } = req.body;

  if (!subject || !duration || !task_date) {
    return res.status(400).json({ error: 'Subject, Duration, and Date are required' });
  }

  const query = `
    INSERT INTO study_tasks (subject, duration, task_date, notes, confidence_level)
    VALUES (?, ?, ?, ?, ?)
  `;
  const values = [
    subject,
    duration,
    task_date,
    notes || null,
    confidence_level || null
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Insert error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ message: 'Task added successfully', id: result.insertId });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
