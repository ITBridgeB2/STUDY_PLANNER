const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root", // Add your password
  database: "study", // Use your DB name
});

// Get all tasks
app.get("/api/tasks", (req, res) => {
  db.query("SELECT * FROM study_tasks", (err, results) => {
    if (err) return res.status(500).json({ error: err });
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

// Update progress
app.put("/api/tasks/:id/progress", (req, res) => {
  const { progress } = req.body;
  const taskId = req.params.id;

  const insertQuery = "INSERT INTO task_progress (task_id, progress, updated_at) VALUES (?, ?, NOW())";

  db.query(insertQuery, [taskId, progress], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: "Progress updated" });
  });
});

// Delete a task and its progress records
app.delete("/api/tasks/:id", (req, res) => {
  const taskId = req.params.id;

  // First delete progress records associated with the task
  const deleteProgressQuery = "DELETE FROM task_progress WHERE task_id = ?";
  // Then delete the task itself
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


app.listen(5000, () => console.log("Server running on port 5000"));