const express = require('express');
const router = express.Router();
const db = require('../db');

// Submit a referral
router.post("/submit", (req, res) => {
    const { userId, referrals } = req.body;
  
    if (!userId || !Array.isArray(referrals) || referrals.length !== 5) {
      return res.status(400).json({ error: "Missing required fields." });
    }
  
    const values = referrals.map(r => [userId, r.name, r.email, r.mobile, r.city, r.address]);
  
    const sql = `
      INSERT INTO referrals (user_id, name, email, mobile, city, address)
      VALUES ?
    `;
  
    db.query(sql, [values], (err, result) => {
      if (err) {
        console.error("Database error inserting referrals:", err);
        return res.status(500).json({ error: "Database error" });
      }
  
      // ✅ Also mark task as completed
      const taskSql = `
        INSERT INTO user_tasks (user_id, task_name, completed)
        VALUES (?, 'Refer 5 People', true)
        ON DUPLICATE KEY UPDATE completed = true
      `;
  
      db.query(taskSql, [userId], (taskErr) => {
        if (taskErr) {
          console.error("Task update error:", taskErr);
          return res.status(500).json({ error: "Task completion failed" });
        }
  
        res.json({ message: "Referrals submitted successfully" });
      });
    });
  });

// Check referral status
router.get('/status/:userId', (req, res) => {
    const { userId } = req.params;
    const sql = 'SELECT status FROM referrals WHERE user_id = ?';
    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error.' });
        }
        res.status(200).json(results);
    });
});

// Update referral status (for admin approval)
router.put('/update-status/:referralId', (req, res) => {
    const { referralId } = req.params;
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status value.' });
    }
    const sql = 'UPDATE referrals SET status = ? WHERE id = ?';
    db.query(sql, [status, referralId], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error.' });
        }
        res.status(200).json({ message: 'Referral status updated successfully.' });
    });
});

module.exports = router;
