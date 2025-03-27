const express = require("express");
const router = express.Router();
const db = require("../db");

// ✅ Mark a task as completed
router.post("/complete", (req, res) => {
    const { userId, taskName } = req.body;
    console.log("Received task update:", req.body); // <-- Add this

    const sql = `
      INSERT INTO user_tasks (user_id, task_name, completed)
      VALUES (?, ?, true)
      ON DUPLICATE KEY UPDATE completed = true
    `;

    db.query(sql, [userId, taskName], (err, result) => {
        if (err) {
            console.error("Database insert error:", err);
            return res.status(500).send("DB error");
        }
        res.status(200).send("Task saved");
    });
});

// ✅ 🆕 Add this route to fetch completed tasks by user
router.get("/:userId", (req, res) => {
    const sql = "SELECT task_name FROM user_tasks WHERE user_id = ? AND completed = 1";
    db.query(sql, [req.params.userId], (err, results) => {
        if (err) return res.status(500).send("DB error");
        res.json(results.map(row => row.task_name));
    });
});

module.exports = router;


