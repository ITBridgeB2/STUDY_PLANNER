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

// GET /api/stats
app.get('/api/stats', (req, res) => {
  const query = `
    SELECT 
      COUNT(st.id) AS totalTasks,
      SUM(CASE WHEN tp.progress = 100 THEN 1 ELSE 0 END) AS completedTasks,
      SUM(CASE WHEN tp.progress < 100 OR tp.progress IS NULL THEN 1 ELSE 0 END) AS pendingTasks,
      ROUND(AVG(st.confidence_level), 2) AS avgConfidence,
      SUM(CASE WHEN tp.progress = 100 AND tp.updated_at <= st.task_date THEN 1 ELSE 0 END) AS onTimeTasks,
      SUM(CASE WHEN tp.progress = 100 AND tp.updated_at > st.task_date THEN 1 ELSE 0 END) AS delayedTasks
    FROM study_tasks st
    LEFT JOIN task_progress tp ON st.id = tp.task_id
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching data:", err);
      return res.status(500).json({ error: "Database query failed" });
    }

    const row = result[0];
    const totalTasks = row.totalTasks || 0;
    const completedTasks = row.completedTasks || 0;
    const pendingTasks = row.pendingTasks || 0;
    const avgConfidence = row.avgConfidence || 0;
    const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const onTimeCompletion = completedTasks
      ? Number(((row.onTimeTasks / completedTasks) * 100).toFixed(2))
      : 0;
    const delayedCompletion = completedTasks
      ? Number(((row.delayedTasks / completedTasks) * 100).toFixed(2))
      : 0;

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      avgConfidence,
      completionRate,
      onTimeCompletion,
      delayedTasks: delayedCompletion,
    });
  });
});

// POST /study_tasks
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

// GET all tasks with progress
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

// Get a specific task with progress
app.get("/api/tasks/:id", (req, res) => {
  const id = req.params.id;
  const taskQuery = "SELECT * FROM study_tasks WHERE id = ?";
  const progressQuery = "SELECT * FROM task_progress WHERE task_id = ? ORDER BY updated_at DESC LIMIT 1";

  db.query(taskQuery, [id], (err, taskResult) => {
    if (err || taskResult.length === 0) return res.status(404).json({ error: "Task not found" });

    db.query(progressQuery, [id], (err, progressResult) => {
      const task = taskResult[0];
      task.progress = progressResult.length ? progressResult[0].progress : 0;
      res.json(task);
    });
  });
});

// Update progress properly: update if exists, otherwise insert
app.put("/api/tasks/:id/progress", (req, res) => {
  const { progress } = req.body;
  const taskId = req.params.id;

  // 1. Ensure the task exists
  const checkTaskQuery = "SELECT id FROM study_tasks WHERE id = ?";
  db.query(checkTaskQuery, [taskId], (err, taskResult) => {
    if (err) {
      console.error("Error checking task:", err);
      return res.status(500).json({ error: "Database error while checking task" });
    }

    if (taskResult.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    // 2. Check if progress entry exists
    const checkProgressQuery = "SELECT * FROM task_progress WHERE task_id = ?";
    db.query(checkProgressQuery, [taskId], (err, progressResult) => {
      if (err) {
        console.error("Error checking progress:", err);
        return res.status(500).json({ error: "Database error while checking progress" });
      }

      if (progressResult.length > 0) {
        // 3a. Update if exists
        const updateQuery = `
          UPDATE task_progress SET progress = ?, updated_at = NOW() WHERE task_id = ?
        `;
        db.query(updateQuery, [progress, taskId], (err) => {
          if (err) {
            console.error("Error updating progress:", err);
            return res.status(500).json({ error: "Database error during update" });
          }
          res.json({ message: "Progress updated successfully" });
        });
      } else {
        // 3b. Insert if not exists
        const insertQuery = `
          INSERT INTO task_progress (task_id, progress, updated_at)
          VALUES (?, ?, NOW())
        `;
        db.query(insertQuery, [taskId, progress], (err) => {
          if (err) {
            console.error("Error inserting progress:", err);
            return res.status(500).json({ error: "Database error during insert" });
          }
          res.json({ message: "Progress inserted successfully" });
        });
      }
    });
  });
});


// Delete a task and its progress records
app.delete("/api/tasks/:id", (req, res) => {
  const taskId = req.params.id;
  const deleteProgressQuery = "DELETE FROM task_progress WHERE task_id = ?";
  const deleteTaskQuery = "DELETE FROM study_tasks WHERE id = ?";

  db.query(deleteProgressQuery, [taskId], (err) => {
    if (err) return res.status(500).json({ error: err });

    db.query(deleteTaskQuery, [taskId], (err, result) => {
      if (err) return res.status(500).json({ error: err });

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Task not found" });
      }

      res.json({ message: "Task and related progress deleted successfully" });
    });
  });
});

// PUT to update a task
app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { subject, duration, task_date, notes, confidence_level } = req.body;

  console.log("Updating Task ID:", id);
  console.log("Received:", { subject, duration, task_date, notes, confidence_level });

  const sql = `
    UPDATE study_tasks
    SET subject = ?, duration = ?, task_date = ?, notes = ?, confidence_level = ?
    WHERE id = ?
  `;
  
  db.query(sql, [subject, duration, task_date, notes, confidence_level, id], (err) => {
    if (err) {
      console.error("MySQL Error:", err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    res.json({ message: 'Task updated successfully' });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
