const express = require('express');
const router = express.Router();
const db = require('../db');

// Submit a referral
router.post('/submit', (req, res) => {
    const { userId, referredEmail } = req.body;
    if (!userId || !referredEmail) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }
    const sql = 'INSERT INTO referrals (user_id, referred_email) VALUES (?, ?)';
    db.query(sql, [userId, referredEmail], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error.' });
        }
        res.status(201).json({ message: 'Referral submitted successfully.' });
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
