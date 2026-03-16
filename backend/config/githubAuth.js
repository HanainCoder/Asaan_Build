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
      scope: ["user:email", "repo"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const githubId = profile.id;
        const username = profile.username;
        const email = profile.emails?.[0]?.value || null;
        const name = profile.displayName || profile.username;
        const avatar = profile.photos?.[0]?.value || null;

        // 1️⃣ Check by github_id
        const existing = await pool.query(
          "SELECT * FROM users WHERE github_id=$1",
          [githubId]
        );

        if (existing.rows.length > 0) {
          const updated = await pool.query(
            `UPDATE users
             SET github_token=$1,
                 github_username=$2
             WHERE github_id=$3
             RETURNING *`,
            [accessToken, username, githubId]
          );

          return done(null, updated.rows[0]);
        }

        // 2️⃣ Check by email (merge)
        if (email) {
          const emailUser = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
          );

          if (emailUser.rows.length > 0) {
            const updated = await pool.query(
              `UPDATE users
               SET github_id=$1,
                   github_username=$2,
                   github_token=$3,
                   provider='google+github'
               WHERE email=$4
               RETURNING *`,
              [githubId, username, accessToken, email]
            );

            return done(null, updated.rows[0]);
          }
        }

        // 3️⃣ Create new user
        const newUser = await pool.query(
          `INSERT INTO users
           (email, github_id, github_username, name, avatar, provider, github_token)
           VALUES ($1,$2,$3,$4,$5,$6,$7)
           RETURNING *`,
          [email, githubId, username, name, avatar, "github", accessToken]
        );

        return done(null, newUser.rows[0]);

      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;