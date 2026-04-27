import express from "express";
import cors from "cors";
import { pool } from "./db.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import puppeteer from "puppeteer";
import jwt from "jsonwebtoken";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "asaanbuild_secret";
import OpenAI from "openai";
import axios from "axios";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
//for  open ai  

// open ai


const app = express();
app.use(cors());
app.use(express.json());
//for google auth
import passport from "./config/googleAuth.js";
app.use(passport.initialize());
//for github auth
import githubPassport from "./config/githubAuth.js";

app.use("/thumbnails", express.static("thumbnails"));

// Test
app.get("/", (req, res) => {
  res.send("Backend is running...");
});
// Simple JWT Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    req.user = user; // store user data in request
    next();
  });
}

// Start Google Login
app.get(
  "/api/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback
app.get(
  "/api/auth/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {

    const token = jwt.sign(
      { id: req.user.id, email: req.user.email,  name: req.user.name, login_method: 'google' },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.redirect(`http://localhost:5173/auth-success?token=${token}`);
  }
);

// Start GitHub Login
app.get("/api/auth/github", (req, res, next) => {
  const { projectId, token } = req.query;

  const state = JSON.stringify({ projectId, token });

  const authenticator = githubPassport.authenticate("github", {
    scope: ["user:email", "repo"],
    state
  });

  authenticator(req, res, next);
});



app.get(
  "/api/auth/github/callback",
  githubPassport.authenticate("github", { session: false }),
  async (req, res) => {
    try {
      let projectId = null;
      let userId = null;

      // ✅ Parse state safely
      if (req.query.state) {
        try {
          const parsed = JSON.parse(req.query.state);
          projectId = parsed.projectId;
          
          if (parsed.token) {
            const decoded = jwt.verify(parsed.token, process.env.JWT_SECRET);
            userId = decoded.id;
          }
        } catch (e) {
          projectId = req.query.state;
        }
      }

      // 🔥 THIS IS THE ONLY NEW LOGIC
      if (userId) {
        // 👉 CONNECT MODE (Google / Email users)
        await pool.query(
          `UPDATE users
           SET github_token = $1,
               github_username = $2
           WHERE id = $3`,
          [req.user.github_token, req.user.github_username, userId]
        );

        const token = jwt.sign(
          { id: userId, login_method: 'github'},
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );

        return res.redirect(
          `http://localhost:5173/auth-success?token=${token}` +
          (projectId ? `&projectId=${projectId}` : "")
        );
      }

      // ✅ EXISTING FLOW (GitHub login) — unchanged
      await pool.query(
        `UPDATE users
         SET github_token = $1, github_username = $2
         WHERE id = $3`,
        [req.user.github_token, req.user.github_username, req.user.id]
      );

      const token = jwt.sign(
        { id: req.user.id, login_method: 'github'  },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

     const redirectUrl =
  `http://localhost:5173/auth-success?token=${token}` +
  (projectId ? `&projectId=${projectId}` : "");

      res.redirect(redirectUrl);

    } catch (err) {
      console.error(err);
      res.redirect("http://localhost:5173/login");
    }
  }
);
// helper to generate project name from prompt (supports Urdu, Roman Urdu, English)
function generateProjectName(prompt) {
  if (!prompt || prompt.trim() === "") return "Untitled Project";

  const cleanPrompt = prompt.trim();

  // truncate for display if too long (optional, e.g., 50 chars)
  const truncated = cleanPrompt.length > 50 ? cleanPrompt.slice(0, 50) + "..." : cleanPrompt;

  // append "Project" at the end
  return truncated + " Project";
}

// helper to create screenshot thumbnail
async function createThumbnail(html, projectId) {
  const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setContent(html);
  const path = `./thumbnails/project-${projectId}.png`;
  await page.screenshot({ path, fullPage: false });
  await browser.close();
  return path;
}

//prepare prompt
// Prepare structured long prompt
// app.post("/api/preparePrompt", async (req, res) => {
//   const { prompt } = req.body;

//   if (!prompt) return res.status(400).json({ success: false, message: "Prompt required" });

//   const structuredPrompt = `
// You are an expert full-stack web developer.

// User idea:
// "${prompt}"

// Task:
// 1. Understand what the user wants.
// 2. Assume standard features for this type of app if not specified.
// 3. Generate a detailed structured JSON including frontend, backend, and database.
// 4. Frontend: pages, components, styling (Tailwind CSS)
// 5. Backend: API routes, auth (JWT), logic
// 6. Database: tables and fields
// 7. Respond ONLY in valid JSON.
// `;

//   res.json({ success: true, structuredPrompt });
// });


//  save prompt with user ID.

// app.post("/api/savePrompt", async (req, res) => {
//   const { userId, prompt, structuredPrompt } = req.body;

//   if (!userId || !prompt) {
//     return res.status(400).json({ success: false, message: "userId and prompt are required" });
//   }

//   try {
//     const result = await pool.query(
//       "INSERT INTO prompts (user_id, prompt_text, structured_prompt) VALUES ($1, $2, $3) RETURNING *",
//       [userId, prompt, structuredPrompt || null]
//     );

//     res.json({ success: true, data: result.rows[0] });
//   } catch (err) {
//     console.error("DB Error:", err);
//     res.status(500).json({ success: false, message: "Database error" });
//   }
// });
//ai COding

// Streaming landing page generation
// Streaming landing page generation (HTML + CSS)
// Streaming landing page generation (HTML + CSS in one file)
app.post("/api/generateLandingStream", async (req, res) => {
  const { prompt  } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt required" });
  

  const fullPrompt = `
You are an AI web developer. 
user request:
"${prompt}"
Rules:
- If the request is in Urdu, Roman Urdu, or Roman English, convert it to English internally.
- The generated website content must be in English only.
Requirements:
- Generate ONLY ONE landing page preview section.
- The section must look complete and professional.
- Keep the section medium sized (not a full page).
- Do NOT generate multiple sections.
Output:
- Return a complete HTML file.
- Load Tailwind via CDN.
- Respond line-by-line as if streaming.
- Output code only. No explanations or questions.
`;

  // Set plain text headers
  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  //addd for save code
  let fullCode = ""; // store complete code

  try {
    const stream = await client.responses.create({
      model: "gpt-5-mini",
      input: [{ role: "user", content: fullPrompt }],
      stream: true,
    });
    

    for await (const event of stream) {
      if (event.type === "response.output_text.delta") {
        // write raw code directly
        res.write(event.delta);
        fullCode += event.delta; // save chunks
      }
    }
    res.end(); // finish streaming

    
    // save into database after generation
    

    
  } catch (err) {
    console.error(err);
    res.end(`Error: ${err.message}`);
  }
});



//save generating code
app.post("/api/saveGeneratedCode", async (req, res) => {
  const { userId, code, prompt } = req.body;
  if (!userId || !code || !prompt) {
    return res.status(400).json({ success: false, message: "userId, code and prompt are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO generated_projects (user_id, prompt, generated_code)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [userId, prompt, code]
    );

    res.json({ success: true, projectId: result.rows[0].id });
  } catch (err) {
    console.error("SAVE ERROR:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});
// Save the projects in generated_projects (My Projects)
app.post("/api/saveMyProject", async (req, res) => {
  const { userId, code, prompt } = req.body;

  if (!userId || !code || !prompt) {
    return res.status(400).json({ success: false, message: "userId, code and prompt are required" });
  }

  try {
    const projectName = generateProjectName(prompt);

    const result = await pool.query(
      `INSERT INTO generated_projects (user_id, prompt, generated_code, project_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [userId, prompt, code, projectName]
    );

    const projectId = result.rows[0].id;

    // VERSION 1 SAVE
    await pool.query(
      `INSERT INTO project_versions (project_id, code, version_number,  edit_type)
      VALUES ($1, $2, $3, $4)`, //add edit type
      [projectId, code, 1, "initial"]
     );

    const thumbnailPath = await createThumbnail(code, projectId);

    // Strip leading ./ here before saving
    const thumbnailClean = thumbnailPath.replace(/^\.\//, '');

    await pool.query(
      `UPDATE generated_projects SET thumbnail=$1 WHERE id=$2`,
      [thumbnailClean, projectId]
    );

    res.json({ success: true, projectId, projectName, thumbnail: thumbnailClean });
  } catch (err) {
    console.error("SAVE MY PROJECT ERROR:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});
// Get all projects for a user
// Get all projects for a user using query parameter
app.get("/api/myProjects", async (req, res) => {
  const { userId } = req.query;

  if (!userId) return res.status(400).json({ success: false, message: "userId required" });

  try {
    const result = await pool.query(
      `SELECT id, project_name AS name, created_at AS date, thumbnail, 'Active' AS status
       FROM generated_projects
       WHERE user_id=$1
       ORDER BY created_at DESC`,
      [Number(userId)]
    );

    const projects = result.rows.map(p => ({
      ...p,
      thumbnail: p.thumbnail ? p.thumbnail.replace(/^\.\//, '') : null,
    }));

    res.json({ success: true, projects });
  } catch (err) {
    console.error("Fetch projects error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// Delete a project
app.delete("/api/project/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM generated_projects WHERE id = $1", [id]);
    res.json({ success: true, message: "Project deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// Rename a project
app.put("/api/project/:id/rename", async (req, res) => {
  const { id } = req.params;
  const { newName } = req.body;

  if (!newName || newName.trim() === "") {
    return res.status(400).json({ success: false, message: "New name required" });
  }

  try {
    await pool.query(
      "UPDATE generated_projects SET project_name=$1 WHERE id=$2",
      [newName.trim(), id]
    );
    res.json({ success: true, newName });
  } catch (err) {
    console.error("Rename error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// Duplicate a project
app.post("/api/project/:id/duplicate", async (req, res) => {
  const { id } = req.params;

  try {
    // Get original project
    const result = await pool.query(
      "SELECT * FROM generated_projects WHERE id=$1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const original = result.rows[0];

    // Insert duplicate
    const insert = await pool.query(
      `INSERT INTO generated_projects 
       (user_id, prompt, generated_code, project_name, thumbnail)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, project_name, thumbnail`,
      [
        original.user_id,
        original.prompt,
        original.generated_code,
        original.project_name + " (Copy)",
        original.thumbnail,
      ]
    );

    res.json({ success: true, project: insert.rows[0] });
  } catch (err) {
    console.error("Duplicate error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
//  register user

app.post("/api/register", async (req, res) => {
  let { name, email, password } = req.body;

  if (!name || !name.trim()) {
    return res.json({
      success: false,
      message: "Name is required",
    });
  }

  if (!email || !email.trim()) {
    return res.json({
      success: false,
      message: "Email is required",
    });
  }

  try {
    // ✅ normalize email
    email = email.trim().toLowerCase();

    const check = await pool.query(
      "SELECT id FROM users WHERE LOWER(email) = LOWER($1)",
      [email]
    );

    if (check.rows.length > 0) {
      return res.json({ success: false, message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name.trim(), email, hashed]
    );

    res.json({ success: true, user: result.rows[0] });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.json({ success: false, message: "Server error" });
  }
});



//  login user

app.post("/api/login", async (req, res) => {
  let { email, password } = req.body;

  try {
    // ✅ normalize email
    email = email.trim().toLowerCase();

    const result = await pool.query(
      "SELECT * FROM users WHERE LOWER(email) = LOWER($1)",
      [email]
    );

    if (result.rows.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Incorrect password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name ,login_method: 'local' },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.json({ success: false, message: "Server error" });
  }
});

// api to load save code
app.get("/api/project/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM generated_projects WHERE id=$1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
// Get only code of a project
app.get("/api/project/:id/code", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT generated_code FROM generated_projects WHERE id=$1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Project not found" 
      });
    }

    res.json({
      success: true,
      code: result.rows[0].generated_code
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      message: "Server error" 
    });
  }
});
// Save edited code as new version
app.post("/api/project/:id/version", async (req, res) => {
  const { id } = req.params;
  const { code} = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: "Code required" });
  }

  try {

    // Get latest version number
    const result = await pool.query(
      "SELECT MAX(version_number) as max FROM project_versions WHERE project_id=$1",
      [id]
    );

    const nextVersion = (result.rows[0].max || 0) + 1;

    // Insert new version (NOW includes prompt)
    await pool.query(
      `INSERT INTO project_versions 
       (project_id, version_number, code, edit_type)
       VALUES ($1, $2, $3, $4)`,
      [id, nextVersion, code || null, "code"]
    );

    // Update latest code in main table (keep this)
    await pool.query(
      `UPDATE generated_projects SET generated_code=$1 WHERE id=$2`,
      [code, id]
    );

    res.json({
      success: true,
      version: nextVersion
    });

  } catch (err) {
    console.error("VERSION SAVE ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
//for regerneraton
app.post("/api/project/:id/edit", async (req, res) => {

  const { id } = req.params;
  const { instruction, updatedPrompt } = req.body;

  if (!instruction) {
    return res.status(400).json({ success:false, message:"Instruction required"});
  }

  try {

    // 1. GET EXISTING CODE
    const projectResult = await pool.query(
      "SELECT generated_code FROM generated_projects WHERE id=$1",
      [id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ success:false, message:"Project not found"});
    }

    const existingCode = projectResult.rows[0].generated_code;

    // 2. VERSION NUMBER
    const versionResult = await pool.query(
      "SELECT MAX(version_number) as max FROM project_versions WHERE project_id=$1",
      [id]
    );

    const nextVersion = (versionResult.rows[0].max || 0) + 1;

    // 🔥 3. PERFECT PROMPT (THIS IS THE MAGIC)
    const fullPrompt = `
You are a professional frontend developer.

You MUST edit the existing code, NOT create new website.

CURRENT CODE:
${existingCode}

USER INSTRUCTION:
${instruction}

STRICT RULES:
- Keep layout EXACTLY same
- Keep 95% code unchanged
- ONLY apply requested change
- If color change → only change color classes
- If text change → only change text
- If add section → append without touching existing
- DO NOT redesign anything
- DO NOT remove anything

Return FULL updated HTML only.
`;

    res.setHeader("Content-Type", "text/plain");

    let fullCode = "";

    const stream = await client.responses.create({
      model: "gpt-5-mini",
      input: [{ role: "user", content: fullPrompt }],
      stream: true
    });

    for await (const event of stream) {
      if (event.type === "response.output_text.delta") {
        res.write(event.delta);
        fullCode += event.delta;
      }
    }

    res.end();

    // 4. SAVE VERSION
    await pool.query(
      `INSERT INTO project_versions (project_id, version_number, code, prompt, edit_type)
       VALUES ($1,$2,$3,$4, $5)`,
      [id, nextVersion, fullCode, updatedPrompt || instruction, "prompt"]
    );

    await pool.query(
      `UPDATE generated_projects SET generated_code=$1 WHERE id=$2`,
      [fullCode, id]
    );

  } catch(err){
    console.error(err);
    res.end("Server error");
  }

});

// all versions of  a project
// Get all versions of a project
// 🔥 NEW: Get projects WITH versions (for Version Page ONLY)

// Get all versions of a specific project
app.get("/api/project/:id/versions", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, version_number, code, prompt, edit_type, created_at
       FROM project_versions
       WHERE project_id = $1
       ORDER BY version_number DESC`,
      [id]
    );

    res.json({
      success: true,
      versions: result.rows
    });

  } catch (err) {
    console.error("FETCH VERSIONS ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
//to get the code of that specific version in database
app.get("/api/version/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT code FROM project_versions WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.json({ success: false });
    }

    res.json({
      success: true,
      code: result.rows[0].code
    });

  } catch (err) {
    console.error("FETCH VERSION ERROR:", err);
    res.status(500).json({ success: false });
  }
});

// Restore a version as current project code
app.post("/api/project/:id/restore/:versionId", authenticateToken, async (req, res) => {
  const { id, versionId } = req.params;

  try {
    // Get the version code
    const versionResult = await pool.query(
  `SELECT code, version_number FROM project_versions WHERE id = $1 AND project_id = $2`,
  [versionId, id]
);

    if (versionResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Version not found" });
    }

    const restoredCode = versionResult.rows[0].code;
    const restoredFromNumber = versionResult.rows[0].version_number;

    // Get next version number
    const maxResult = await pool.query(
      `SELECT MAX(version_number) as max FROM project_versions WHERE project_id = $1`,
      [id]
    );
    const nextVersion = (maxResult.rows[0].max || 0) + 1;

    // Save as new version with edit_type = "restored"
    await pool.query(
      `INSERT INTO project_versions (project_id, version_number, code, edit_type)
       VALUES ($1, $2, $3, $4)`,
      [id, nextVersion, restoredCode, `Restored from Version ${restoredFromNumber}`]
    );

    // Update main project code
    await pool.query(
      `UPDATE generated_projects SET generated_code = $1 WHERE id = $2`,
      [restoredCode, id]
    );

    res.json({ success: true, message: "Version restored", version: nextVersion });

  } catch (err) {
    console.error("RESTORE ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
// Delete a specific version
app.delete("/api/version/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Don't allow deleting version 1 (initial)
    const check = await pool.query(
      `SELECT version_number FROM project_versions WHERE id = $1`,
      [id]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Version not found" });
    }

    if (check.rows[0].version_number === 1) {
      return res.status(400).json({ success: false, message: "Cannot delete initial version" });
    }

    await pool.query(`DELETE FROM project_versions WHERE id = $1`, [id]);

    res.json({ success: true, message: "Version deleted" });

  } catch (err) {
    console.error("DELETE VERSION ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
//upload to GitHUb
app.post("/api/uploadToGithub", authenticateToken, async (req, res) => {
  const { projectId } = req.body;
    


  try {
    // 1. Get user GitHub token
    const userResult = await pool.query(
      "SELECT github_token, github_username FROM users WHERE id=$1",
      [req.user.id]
    );
        


    const user = userResult.rows[0];

    if (!user.github_token) {
      return res.status(400).json({
        success: false,
        message: "GitHub not connected"
      });
    }

    // 2. Get project data
    const projectResult = await pool.query(
      "SELECT generated_code, project_name FROM generated_projects WHERE id=$1",
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    const project = projectResult.rows[0];  // ← ADD THIS LINE


    const repoName = (
  project.project_name
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/Project$/i, "")          // ← remove trailing "Project" word
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase()
    .replace(/^-+|-+$/g, "")
  || `project-${projectId}`
).substring(0, 100) || `project-${projectId}`; 
    

    const headers = {
      Authorization: `token ${user.github_token}`
    };

    // ===============================
    // 3. CREATE REPO (SAFE FIX)
    // ===============================
    try {
      await axios.post(
        "https://api.github.com/user/repos",
        {
          name: repoName,
          private: false
        },
        { headers }
      );
    } catch (err) {
      // Ignore ONLY "repo already exists"
      if (err.response?.status !== 422) {
        throw err;
      }
    }

    // ===============================
    // 4. GET FILE SHA (if exists)
    // ===============================
    let sha = null;

    try {
      const fileRes = await axios.get(
        `https://api.github.com/repos/${user.github_username}/${repoName}/contents/index.html`,
        { headers }
      );

      sha = fileRes.data.sha;
    } catch (err) {
      sha = null;
    }

    // ===============================
    // 5. UPLOAD / UPDATE FILE
    // ===============================
    const content = Buffer.from(project.generated_code).toString("base64");

    const body = {
      message: sha ? "Update from AsaanBuild" : "Initial commit from AsaanBuild",
      content: content
    };

    if (sha) {
      body.sha = sha;
    }

    await axios.put(
      `https://api.github.com/repos/${user.github_username}/${repoName}/contents/index.html`,
      body,
      { headers }
    );

    res.json({
      success: true,
      repoUrl: `https://github.com/${user.github_username}/${repoName}`
    });

  } catch (err) {
    console.error(err.response?.data || err.message);

    res.status(500).json({
      success: false,
      message: "GitHub upload failed"
    });
  }
});
app.get("/api/me", authenticateToken, async (req, res) => {
  const result = await pool.query(
    "SELECT id, email, github_token FROM users WHERE id=$1",
    [req.user.id]
  );
  res.json(result.rows[0]);
});
//for templates
// ============================================
// TEMPLATES ROUTES
// ============================================

// GET all templates (with optional category filter)
app.get("/api/templates", async (req, res) => {
  const { category } = req.query;

  try {
    let result;

    if (category && category !== "All") {
      result = await pool.query(
        `SELECT id, title, category, description, thumbnail_color, badge, preview_html
         FROM templates
         WHERE is_active = TRUE AND category = $1
         ORDER BY created_at DESC`,
        [category]
      );
    } else {
      result = await pool.query(
        `SELECT id, title, category, description, thumbnail_color, badge, preview_html
         FROM templates
         WHERE is_active = TRUE
         ORDER BY created_at DESC`
      );
    }

    res.json({ success: true, templates: result.rows });

  } catch (err) {
    console.error("FETCH TEMPLATES ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// POST generate from template — reuses your EXACT streaming logic
app.post("/api/generateFromTemplate", async (req, res) => {
  const { templateId, extraInstructions } = req.body;

  if (!templateId) {
    return res.status(400).json({ success: false, message: "templateId required" });
  }

  try {
    // Fetch the stored template prompt from DB
    const templateResult = await pool.query(
      `SELECT prompt, title FROM templates WHERE id = $1 AND is_active = TRUE`,
      [templateId]
    );

    if (templateResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Template not found" });
    }

    const { prompt: templatePrompt, title } = templateResult.rows[0];

    // Combine template prompt with any extra user instructions
    // NAYA
    const finalPrompt = `
You are an expert web developer. Generate a complete, beautiful landing page for: "${templatePrompt}${extraInstructions ? `. ${extraInstructions}` : ''}"

STRICT RULES:
- Output ONLY raw HTML. No explanations, no markdown, no backticks, no comments before <!DOCTYPE html> or after </html>.
- Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
- Use Google Fonts via a <link> tag for a distinctive font pairing (e.g. Playfair Display + Inter, or Sora + DM Sans — pick what fits the brand).
- NO <img> tags. NO background-image with URLs. Use ONLY:
    • CSS gradient backgrounds (e.g. bg-gradient-to-br)
    • Tailwind background color classes
    • SVG icons inline (heroicons style, simple paths)
    • Emoji sparingly as decorative elements
    • CSS shapes / geometric dividers using pure Tailwind

SECTIONS TO INCLUDE (all in one page, no JS routing):
1. Navbar — logo text + nav links + CTA button
2. Hero — bold headline, subtext, 2 CTA buttons, a decorative CSS/SVG visual (NO img)
3. Features/Benefits — 3–4 cards with icons (inline SVG) + short descriptions
4. How It Works — 3 numbered steps, horizontal or vertical layout
5. Testimonials — 2–3 quote cards with fake names and avatar initials (CSS circle, no photo)
6. Pricing — 2–3 tiers, highlight the middle/recommended tier
7. FAQ — 3–4 accordion items (CSS-only using <details><summary>)
8. Footer — links, copyright, social icons (inline SVG)

DESIGN RULES:
- Pick ONE strong color theme (e.g. deep navy + lime, slate + violet, dark charcoal + amber) — not generic purple-on-white
- Use large bold typography for headings (text-5xl or bigger for hero)
- Add subtle gradients, rounded corners, shadows for depth
- Make it look like a real $5000 SaaS landing page
- Responsive: works on mobile (use Tailwind responsive prefixes)
- Smooth scroll: <html style="scroll-behavior: smooth">
- All sections have generous padding (py-20 or more)
`
;

    // ---- EXACT SAME STREAMING LOGIC AS /api/generateLandingStream ----
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await client.responses.create({
      model: "gpt-5-mini",
      input: [{ role: "user", content: finalPrompt }],
      stream: true,
    });

    for await (const event of stream) {
      if (event.type === "response.output_text.delta") {
        res.write(event.delta);
      }
    }

    res.end();

  } catch (err) {
    console.error("GENERATE FROM TEMPLATE ERROR:", err);
    res.end(`Error: ${err.message}`);
  }
});
//for prompt engineering autu suggestions

// 🔥 Get latest 3 prompts (for main page)
app.get("/api/prompts/recent", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, prompt, improved_prompt, created_at
   FROM generated_projects
   WHERE user_id = $1
   ORDER BY created_at DESC
   LIMIT 3`,
  [req.user.id]
    );

    res.json({
      success: true,
      prompts: result.rows
    });

  } catch (err) {
    console.error("RECENT PROMPTS ERROR:", err);
    res.status(500).json({ success: false });
  }
});
//all prompts for prompt history page
// 🔥 Get ALL prompts (for modal)
app.get("/api/prompts/all", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
       `SELECT id, prompt, improved_prompt, created_at
   FROM generated_projects
   WHERE user_id = $1
   ORDER BY created_at DESC`,
  [req.user.id]
    );

    res.json({
      success: true,
      prompts: result.rows
    });

  } catch (err) {
    console.error("ALL PROMPTS ERROR:", err);
    res.status(500).json({ success: false });
  }
});
//// ============================================
// PROMPT IMPROVER (ULTRA LIGHT, NO STREAM)
// ============================================

app.post("/api/prompts/improve", authenticateToken, async (req, res) => {
  const { prompt, id } = req.body;

  if (!prompt || !id) {
    return res.status(400).json({
      success: false,
      message: "Prompt and ID required"
    });
  }

  try {
    // ✅ CHECK IF ALREADY IMPROVED (NEW ADDITION)
    const existing = await pool.query(
      `SELECT improved_prompt FROM generated_projects WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (existing.rows[0]?.improved_prompt) {
      return res.json({
        success: true,
        improved: existing.rows[0].improved_prompt,
        message: "Already improved"
      });
    }

    // 🔽 YOUR ORIGINAL LOGIC (UNCHANGED)
    const improvePrompt = `Improve this app idea in one clear and slightly more detailed sentence:\n${prompt}`;

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: improvePrompt,
      max_output_tokens: 60
    });

    const improved = response.output_text;

    // 🔥 SAVE INTO SAME ROW
    await pool.query(
      `UPDATE generated_projects
       SET improved_prompt = $1
       WHERE id = $2 AND user_id = $3`,
      [improved, id, req.user.id]
    );

    res.json({
      success: true,
      improved
    });

  } catch (err) {
    console.error("IMPROVE ERROR:", err.message);

    res.status(500).json({
      success: false,
      message: "Failed to improve prompt"
    });
  }
});
//api for prompt usage stats (for analytics page)
app.get("/api/prompts/stats", authenticateToken, async (req, res) => {
  const { type } = req.query; // daily | weekly | monthly

  try {
    let groupBy;

    if (type === "weekly") {
      groupBy = "DATE_TRUNC('week', created_at)";
    } else if (type === "monthly") {
      groupBy = "DATE_TRUNC('month', created_at)";
    } else {
      groupBy = "DATE(created_at)";
    }

    const result = await pool.query(
      `
      SELECT 
        ${groupBy} as date,
        COUNT(*) as count
      FROM generated_projects
      WHERE user_id = $1
      GROUP BY date
      ORDER BY date ASC
      `,
      [req.user.id]
    );

    res.json({ success: true, stats: result.rows });

  } catch (err) {
    res.status(500).json({ success: false });
  }
});
// ── GET PROFILE ──────────────────────────────────────────
app.get("/api/user/profile", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, avatar, provider, github_username,
       (password IS NOT NULL AND password != '') AS has_password
       FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// ── UPDATE PROFILE / PASSWORD ─────────────────────────────
app.put("/api/user/update", authenticateToken, async (req, res) => {
  const { name, currentPassword, newPassword } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE id = $1", 
      [req.user.id]
    );
    const user = result.rows[0];

    // ── Update name
    if (name && name.trim()) {
      await pool.query(
        "UPDATE users SET name = $1 WHERE id = $2",
        [name.trim(), user.id]
      );
    }

    // ── Update password (sirf local users)
    if (newPassword) {
      const hasLocalPassword = !user.provider || user.provider.includes("local");

      if (!hasLocalPassword) {
        return res.json({
          success: false,
          message: "Password change not available for social login accounts",
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.json({ success: false, message: "Current password is incorrect" });
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      await pool.query(
        "UPDATE users SET password = $1 WHERE id = $2",
        [hashed, user.id]
      );
    }

    // ── Return updated user
    const updated = await pool.query(
      "SELECT id, name, email, avatar, provider, github_username FROM users WHERE id = $1",
      [req.user.id]
    );

    res.json({ success: true, user: updated.rows[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ── uploads folder create karo agar nahi hai
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// ── Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user.id}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only jpg, png, webp allowed'));
    }
  },
});

// ── Static folder serve karo
app.use('/uploads', express.static('./uploads'));

// ── Avatar upload endpoint
app.post('/api/user/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ success: false, message: 'No file uploaded' });
    }

    const avatarUrl = `http://localhost:5000/uploads/${req.file.filename}`;

    await pool.query(
      'UPDATE users SET avatar = $1 WHERE id = $2',
      [avatarUrl, req.user.id]
    );

    res.json({ success: true, avatar: avatarUrl });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
// for Dashboard anlytics -total projects, versions,
app.get("/api/user/stats", authenticateToken, async (req, res) => {
  try {
    const versionsResult = await pool.query(
      `SELECT COUNT(*) as total FROM project_versions 
       WHERE project_id IN (
         SELECT id FROM generated_projects WHERE user_id = $1
       )`,
      [req.user.id]
    );

    res.json({
      success: true,
      totalVersions: parseInt(versionsResult.rows[0].total)
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});
// version analytics stat cards
app.get("/api/version/stats/:userId", authenticateToken, async (req, res) => {
  const { userId } = req.params;

  try {
    // 1. Total Versions
    const totalVersionsResult = await pool.query(`
      SELECT COUNT(*) AS total
      FROM project_versions pv
      JOIN generated_projects gp ON pv.project_id = gp.id
      WHERE gp.user_id = $1
    `, [userId]);

    // 2. Most Versioned Project (if same count then latest created version wins)
    const topProjectResult = await pool.query(`
  SELECT gp.project_name, COUNT(pv.id) AS total_versions, MAX(pv.created_at) AS latest_activity
  FROM generated_projects gp
  JOIN project_versions pv ON pv.project_id = gp.id
  WHERE gp.user_id = $1
  GROUP BY gp.id, gp.project_name
  ORDER BY total_versions DESC, latest_activity DESC
  LIMIT 1
`, [userId]);

    // 3. Restored Versions
    const restoredResult = await pool.query(`
      SELECT COUNT(*) AS total
      FROM project_versions pv
      JOIN generated_projects gp ON pv.project_id = gp.id
      WHERE gp.user_id = $1
      AND pv.edit_type ILIKE 'Restored%'
    `, [userId]);

    // 4. Prompt Edited Versions
    const promptResult = await pool.query(`
      SELECT COUNT(*) AS total
      FROM project_versions pv
      JOIN generated_projects gp ON pv.project_id = gp.id
      WHERE gp.user_id = $1
      AND pv.edit_type = 'prompt'
    `, [userId]);

    // 5. Code Edited Versions
    const codeResult = await pool.query(`
      SELECT COUNT(*) AS total
      FROM project_versions pv
      JOIN generated_projects gp ON pv.project_id = gp.id
      WHERE gp.user_id = $1
      AND pv.edit_type = 'code'
    `, [userId]);

    res.json({
      success: true,
      totalVersions: Number(totalVersionsResult.rows[0].total),
      topProject: topProjectResult.rows[0] || null,
      restoredVersions: Number(restoredResult.rows[0].total),
      promptVersions: Number(promptResult.rows[0].total),
      codeVersions: Number(codeResult.rows[0].total),
    });

  } catch (err) {
    console.error("VERSION STATS ERROR:", err);
    res.status(500).json({ success: false });
  }
});
// START SERVER
app.listen(process.env.PORT, () => {
  console.log("Server started on port " + process.env.PORT);
});
