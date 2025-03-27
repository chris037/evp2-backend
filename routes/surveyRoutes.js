// routes/surveyRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../db"); // your db connection

// ✅ Submit survey
router.post("/submit", (req, res) => {
  const {
    userId,
    brandIcon,
    coreValues,
    visitedWebsite,
    ibexNews,
    socialFollow,
    socialPlatform,
    onlineActivities,
    communicationFrequency,
    attendedEvents,
    referredSomeone,
    whyJoinIbex,
    memorableCampaign,
    brandImprovement,
  } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  const sql = `
    INSERT INTO survey_responses (
      user_id, brand_icon, core_values, visited_website, ibex_news, social_follow,
      social_platform, online_activities, communication_frequency, attended_events,
      referred_someone, why_join_ibex, memorable_campaign, brand_improvement
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    userId,
    brandIcon,
    coreValues,
    visitedWebsite,
    ibexNews,
    socialFollow,
    socialPlatform,
    onlineActivities,
    communicationFrequency,
    attendedEvents,
    referredSomeone,
    whyJoinIbex,
    memorableCampaign,
    brandImprovement,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Survey insert error:", err);
      return res.status(500).json({ error: "Database error" });
    }

    return res.status(200).json({ message: "Survey submitted successfully" });
  });
});

module.exports = router;
