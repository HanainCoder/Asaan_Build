import express from "express";
import cors from "cors";
import { pool } from "./db.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// TEST
app.get("/", (req, res) => {
  res.send("Backend is running...");
});


// -----------------------------------------------------
// ✅ SAVE PROMPT WITH USER ID
// -----------------------------------------------------
app.post("/api/savePrompt", async (req, res) => {
  const { userId, prompt } = req.body;

  if (!userId || !prompt) {
    return res.status(400).json({ success: false, message: "userId and prompt are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO prompts (user_id, prompt_text) VALUES ($1, $2) RETURNING *",
      [userId, prompt]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});


// -----------------------------------------------------
// ✅ REGISTER USER
// -----------------------------------------------------
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;

  try {
    const check = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);

    if (check.rows.length > 0) {
      return res.json({ success: false, message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email",
      [email, hashed]
    );

    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.json({ success: false, message: "Server error" });
  }
});


// -----------------------------------------------------
// ✅ LOGIN USER
// -----------------------------------------------------
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Incorrect password" });
    }

    res.json({
      success: true,
      user: { id: user.id, email: user.email },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.json({ success: false, message: "Server error" });
  }
});


// START SERVER
app.listen(process.env.PORT, () => {
  console.log("Server started on port " + process.env.PORT);
});
