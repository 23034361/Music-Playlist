const express = require("express");
const mysql = require("mysql2");
const app = express();

app.use(express.json());

// ✅ Database connection (Aiven + Render)
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,          // ✅ REQUIRED
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false          // ✅ REQUIRED FOR AIVEN
  }
});

// ✅ Test DB connection
db.connect(err => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Connected to database");
  }
});

/* =======================
   ROUTES
======================= */

// View all songs
app.get("/songs", (req, res) => {
  db.query("SELECT * FROM songs", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// Add a new song
app.post("/songs", (req, res) => {
  const { title, artist, duration } = req.body;
  const sql = "INSERT INTO songs (title, artist, duration) VALUES (?, ?, ?)";
  db.query(sql, [title, artist, duration], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Song added", id: result.insertId });
  });
});

// Update a song
app.put("/songs/:id", (req, res) => {
  const { title, artist, duration } = req.body;
  const sql = "UPDATE songs SET title=?, artist=?, duration=? WHERE id=?";
  db.query(sql, [title, artist, duration, req.params.id], err => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Song updated" });
  });
});

// Delete a song
app.delete("/songs/:id", (req, res) => {
  db.query("DELETE FROM songs WHERE id=?", [req.params.id], err => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Song deleted" });
  });
});

// Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
