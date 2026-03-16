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
      { id: req.user.id, email: req.user.email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.redirect(`http://localhost:5173/auth-success?token=${token}`);
  }
);

// Start GitHub Login
app.get(
  "/api/auth/github",
  githubPassport.authenticate("github", { scope: ["user:email"] })
);

// GitHub callback
app.get(
  "/api/auth/github/callback",
  githubPassport.authenticate("github", { session: false }),
  (req, res) => {

    const token = jwt.sign(
      { id: req.user.id, email: req.user.email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.redirect(`http://localhost:5173/auth-success?token=${token}`);
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
      `INSERT INTO project_versions (project_id, code, version_number)
      VALUES ($1, $2, $3)`,
      [projectId, code, 1]
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



//  login user

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

    const token = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "1d" }
    );

    res.json({
    success: true,
    token,
    user: { id: user.id, email: user.email },
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
       (project_id, version_number, code)
       VALUES ($1, $2, $3)`,
      [id, nextVersion, code || null]
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
// app.post("/api/project/:id/regenerate", async (req, res) => {

//   const { id } = req.params;
//   const { prompt } = req.body;

//   if (!prompt) {
//     return res.status(400).json({ success:false, message:"Prompt required"});
//   }

//   try {

//     // get existing project code
//     const projectResult = await pool.query(
//       "SELECT generated_code FROM generated_projects WHERE id=$1",
//       [id]
//     );

//     if (projectResult.rows.length === 0) {
//       return res.status(404).json({ success:false, message:"Project not found"});
//     }

//     const existingCode = projectResult.rows[0].generated_code;

//     // get latest version
//     const versionResult = await pool.query(
//       "SELECT MAX(version_number) as max FROM project_versions WHERE project_id=$1",
//       [id]
//     );

//     const nextVersion = (versionResult.rows[0].max || 0) + 1;

//     // SHORT PROMPT (token saving)
//     const fullPrompt = `
// You are a precise code editor.

// Your job is to modify EXISTING HTML with the SMALLEST possible change.


// USER REQUEST:
// ${prompt}

// EXISTING HTML:
// ${existingCode}

// Editor Rules:
// - Modify the EXISTING HTML with the SMALLEST possible change.
// - Insert new sections ONLY at the placeholder: <!-- PLACEHOLDER: ADDITIONAL SECTIONS HERE -->
// - Preserve all existing layout, structure, and Tailwind classes.
// - Do NOT redesign or remove unrelated elements.
// - If changing text, update only that text.
// - If changing color, update only Tailwind classes.
// - Keep 90–95% of the original HTML unchanged.

// - Output ONLY the updated HTML.
// - DO NOT add new <html>, <head>, <body> tags.
// - Keep the page structure intact.
// - Insert new sections inline at the placeholder.

// `;

//     // streaming headers
//     res.setHeader("Content-Type", "text/plain");
//     res.setHeader("Cache-Control", "no-cache");
//     res.setHeader("Connection", "keep-alive");

//     let fullCode = "";

//     const stream = await client.responses.create({
//       model: "gpt-5-mini",
//       input: [{ role: "user", content: fullPrompt }],
//       stream: true
//     });

//     for await (const event of stream) {

//       if (event.type === "response.output_text.delta") {

//         res.write(event.delta);
//         fullCode += event.delta;

//       }

//     }

//     res.end();

//     // save version AFTER streaming
//     await pool.query(
//       `INSERT INTO project_versions
//        (project_id, version_number, prompt, code)
//        VALUES ($1,$2,$3,$4)`,
//       [id, nextVersion, prompt, fullCode]
//     );

//     // update latest code
//     await pool.query(
//       `UPDATE generated_projects
//        SET generated_code=$1, prompt=$2
//        WHERE id=$3`,
//       [fullCode, prompt, id]
//     );

//   } catch(err){
//     console.error(err);
//     res.end("Server error");
//   }

// });


//api to load saved code late
// START SERVER
app.listen(process.env.PORT, () => {
  console.log("Server started on port " + process.env.PORT);
});
