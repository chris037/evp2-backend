const express = require("express");
const router = express.Router();
const db = require("../db");

// 📌 Submit referrals
router.post("/submit", (req, res) => {
  const { userId, referrals } = req.body;

  if (!userId || !referrals || referrals.length !== 5) {
    return res.status(400).json({ error: "Invalid data. Five referrals are required." });
  }

  const insertSql = `
    INSERT INTO referrals (user_id, name, email, mobile, city, address, status)
    VALUES ?
  `;

  const values = referrals.map(ref => [
    userId,
    ref.name,
    ref.email,
    ref.mobile,
    ref.city,
    ref.address,
    "pending"
  ]);

  db.query(insertSql, [values], (err) => {
    if (err) {
      console.error("Error inserting referrals:", err);
      return res.status(500).json({ error: "Database error" });
    }

    // ✅ Also mark task as completed (pending approval)
    const taskSql = `
      INSERT INTO user_tasks (user_id, task_name, completed)
      VALUES (?, 'Refer 5 People', true)
      ON DUPLICATE KEY UPDATE completed = true
    `;
    db.query(taskSql, [userId], (taskErr) => {
      if (taskErr) {
        console.error("Error updating user_tasks:", taskErr);
        return res.status(500).json({ error: "Task update error" });
      }

      res.status(200).json({ message: "Referrals submitted successfully." });
    });
  });
});

// 📌 Get status of referral submission
router.get("/status/:userId", (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT status FROM referrals
    WHERE user_id = ?
    LIMIT 1
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (results.length === 0) return res.json({ status: "not_submitted" });

    return res.json({ status: results[0].status }); // 'pending', 'approved', etc.
  });
});

module.exports = router;
