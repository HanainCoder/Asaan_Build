import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { pool } from "../db.js";
import dotenv from "dotenv";

dotenv.config();

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/api/auth/github/callback",
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {

        const githubId = profile.id;
        const email = profile.emails?.[0]?.value || null;
        const name = profile.displayName || profile.username;
        const avatar = profile.photos?.[0]?.value || null;

        // 1️⃣ FIRST: Check by github_id (MOST IMPORTANT)
        const githubUser = await pool.query(
          "SELECT * FROM users WHERE github_id=$1",
          [githubId]
        );

        if (githubUser.rows.length > 0) {
          return done(null, githubUser.rows[0]);
        }

        // 2️⃣ THEN: Check by email (for merging)
        if (email) {
          const emailUser = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
          );

          if (emailUser.rows.length > 0) {

            // Update existing account with github_id
            const updatedUser = await pool.query(
              `UPDATE users
               SET github_id=$1, provider='google+github'
               WHERE email=$2
               RETURNING *`,
              [githubId, email]
            );

            return done(null, updatedUser.rows[0]);
          }
        }

        // 3️⃣ If nothing found → create new user
        const newUser = await pool.query(
          `INSERT INTO users (email, github_id, name, avatar, provider)
           VALUES ($1,$2,$3,$4,$5)
           RETURNING *`,
          [email, githubId, name, avatar, "github"]
        );

        return done(null, newUser.rows[0]);

      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;