// backend/server.js
const express = require("express");
const app = express();
const cors = require("cors");
//✅ Allow all origins or specify your frontend domain
app.use(cors());
// app.use(cors({
//   origin: ["https://evp-xs9f.onrender.com", "https://ibexvst.com", "http://localhost:4173", "http://10.210.123.172:4173"], // ✅ Allow your frontend
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   headers: ["Content-Type"],
//   credentials: true,
// }));

const bodyParser = require("body-parser");
const path = require("path");

const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const dreamwallRoutes = require("./routes/dreamwallRoutes");
const referralRoutes = require('./routes/referralRoutes');


const PORT = process.env.PORT || 5001;



// app.use(cors({
//   origin: ["*"], // ✅ Allow your frontend
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   credentials: false,
// }));

app.options('*', cors())
// ✅ Middleware

app.use(bodyParser.json());
app.use(express.json());

// ✅ Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dreamwall", dreamwallRoutes);
app.use('/api/referrals', referralRoutes);

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});


app.get("/test-cors", (req, res) => {
  res.json({ message: "CORS is working!" });
})