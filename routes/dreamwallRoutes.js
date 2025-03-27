const express = require("express");
const router = express.Router();
const db = require("../db");

// ✅ Add multer
const multer = require("multer");
const path = require("path");

// ✅ Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../uploads")); // make sure this path exists
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + "-" + uniqueSuffix + ext);
    }
});

const upload = multer({ storage }); // ✅ this defines 'upload'

// 📌 Fetch all approved entries
router.get("/entries", (req, res) => {
    const sort = req.query.sort;
    let order = "ORDER BY created_at DESC"; // Default sort

    if (sort === "asc") order = "ORDER BY created_at ASC";
    else if (sort === "random") order = "ORDER BY RAND()";

    const sql = `
    SELECT d.*, u.name 
    FROM dreamwall_entries d 
    JOIN users u ON d.user_id = u.id 
    WHERE d.status = 'approved' ${order}
  `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).send("Error fetching entries.");
        res.json(results);
    });
});

// 📌 Check submission status of a user
router.get("/status/:userId", (req, res) => {
    const sql = "SELECT status FROM dreamwall_entries WHERE user_id = ?";
    db.query(sql, [req.params.userId], (err, results) => {
        if (err) return res.status(500).send("DB error");
        if (results.length === 0) return res.json({ status: "not_submitted" });

        return res.json({ status: results[0].status });
    });
});

// 📌 Submit entry and mark task completed if approved
router.post("/submit", (req, res) => {
  const { userId, title, caption, imageUrl } = req.body;

  if (!userId || !title || !caption || !imageUrl) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const insertSql = `
    INSERT INTO dreamwall_entries (user_id, title, caption, photo, status)
    VALUES (?, ?, ?, ?, 'pending')
  `;

  db.query(insertSql, [userId, title, caption, imageUrl], (err, result) => {
    if (err) {
      console.error("Insert error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    const insertTaskSql = `
      INSERT INTO user_tasks (user_id, task_name, completed)
      VALUES (?, 'Dreamwall/ Aspirational Wall', true)
      ON DUPLICATE KEY UPDATE completed = true
    `;

    db.query(insertTaskSql, [userId], (err2) => {
      if (err2) {
        console.error("Task update error:", err2);
        return res.status(500).json({ error: "Task insert failed" });
      }

      res.status(200).json({ message: "Dreamwall entry submitted and task marked complete." });
    });
  });
});
  
// ✅ OPTIONAL: Auto-complete task after approval (admin would normally handle this)
const completeTaskIfApproved = (userId) => {
    const sql = `
    INSERT INTO user_tasks (user_id, task_name, completed)
    VALUES (?, 'Dreamwall/ Aspirational Wall', true)
    ON DUPLICATE KEY UPDATE completed = true
  `;
    db.query(sql, [userId], (err) => {
        if (err) console.error("Failed to mark task as complete", err);
    });
};

router.post("/complete", (req, res) => {
    const { userId, taskName } = req.body;

    const sql = `
      INSERT INTO user_tasks (user_id, task_name, completed)
      VALUES (?, ?, true)
      ON DUPLICATE KEY UPDATE completed = true
    `;

    db.query(sql, [userId, taskName], (err) => {
        if (err) return res.status(500).send("DB error");
        res.status(200).send("Task marked as completed");
    });
});


module.exports = router;
