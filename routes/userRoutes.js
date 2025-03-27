// backend/routes/userRoutes.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// POST /register - save user info
// router.post("/register", (req, res) => {
//   const { name, email, mobile, region, site } = req.body;
//   const sql = "INSERT INTO users (name, email, mobile, region, site) VALUES (?, ?, ?, ?, ?)";
//   db.query(sql, [name, email, mobile, region, site], (err, result) => {
//     if (err) {
//       console.error("❌ MySQL Error:", err);
//       return res.status(500).send("Database insert failed");
//     }
//     res.status(200).send("User registered successfully");
//   });
// });

router.post("/register", (req, res) => {
    const { name, email, mobile, site, region } = req.body;
  
    const sql = "INSERT INTO users (name, email, mobile, site, region) VALUES (?, ?, ?, ?, ?)";
  
    db.query(sql, [name, email, mobile, site, region], (err, result) => {
      if (err) {
        console.error("Registration error:", err);
        return res.status(500).send("Database error");
      }
  
      // ✅ return user ID to frontend
      res.status(200).json({ userId: result.insertId });
    });
  });

module.exports = router;


