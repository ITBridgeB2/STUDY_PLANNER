// server.js
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'study_planner',
});

db.connect((err) => {
  if (err) {
    console.error('DB connection failed:', err);
    process.exit(1);
  }
  console.log('MySQL connected');
});

// GET all tasks with progress and confidence
app.get('/api/tasks', (req, res) => {
  const sql = `
    SELECT t.*, p.progress
    FROM study_tasks t
    LEFT JOIN task_progress p ON t.id = p.task_id
    ORDER BY t.task_date DESC
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});


// GET a single task by ID
app.get('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM study_tasks WHERE id = ?`;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json(results[0]);
  });
});



// PUT to update a task
app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { subject, duration, task_date, notes, confidence_level } = req.body;

  // Add logs to inspect incoming values
  console.log("Updating Task ID:", id);
  console.log("Received:", { subject, duration, task_date, notes, confidence_level });

  const sql = `
    UPDATE study_tasks
    SET subject = ?, duration = ?, task_date = ?, notes = ?, confidence_level = ?
    WHERE id = ?
  `;
  
  db.query(sql, [subject, duration, task_date, notes, confidence_level, id], (err) => {
    if (err) {
      console.error("MySQL Error:", err);  // Show full MySQL error
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    res.json({ message: 'Task updated successfully' });
  });
});







// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
