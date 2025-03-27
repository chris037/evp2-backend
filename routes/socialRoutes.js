const express = require("express");
const router = express.Router();
const db = require("../db"); // assuming MySQL is set up

// POST /api/social/submit
router.post("/submit", (req, res) => {
  const { userId, postLink, photoUrl } = req.body;

  if (!userId || !postLink || !photoUrl) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sql = `
    INSERT INTO social_submissions (user_id, post_link, photo_url)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [userId, postLink, photoUrl], (err, result) => {
    if (err) {
      console.error("DB insert error:", err);
      return res.status(500).send("Database error");
    }

    return res.status(200).send("Submission saved successfully");
  });
});

module.exports = router;
