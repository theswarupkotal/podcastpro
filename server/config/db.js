// server/config/db.js
import pkg from 'pg';
const { Pool } = pkg;

// Render injects DATABASE_URL automatically if you've set it in the Render dashboard.
// We also add `ssl: { rejectUnauthorized: false }` because many managed Postgres instances require SSL.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export default pool;
