//server/routes/sessions.js
import express from 'express';
import pool from '../config/db.js';  
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Create a new session
router.post('/', async (req, res) => {
  try {
    const { name, userId } = req.body;

    if (!name || !userId) {
      return res.status(400).json({ error: 'name and userId are required' });
    }

    const id = uuidv4();
    const meeting_key = uuidv4().split('-')[0];
    const created_at = new Date().toISOString();

    const insertQuery = `
      INSERT INTO podcast_sessions (id, name, host_id, meeting_key, created_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [id, name, userId, meeting_key, created_at];

    const { rows } = await pool.query(insertQuery, values);
    // rows[0] is the newly inserted session
    return res.json(rows[0]);
  } catch (error) {
    console.error('Session creation error:', error);
    return res.status(500).json({ error: 'Failed to create session', details: error.message });
  }
});

// Get user's sessions
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId parameter' });
    }

    const selectQuery = `
      SELECT * 
      FROM podcast_sessions 
      WHERE host_id = $1
      ORDER BY created_at DESC;
    `;
    const { rows } = await pool.query(selectQuery, [userId]);
    return res.json(rows);
  } catch (error) {
    console.error('Sessions fetch error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch sessions',
      details: error.message 
    });
  }
});


// Join session by meeting key
router.post('/join', async (req, res) => {
  try {
    const { meetingKey } = req.body;
    if (!meetingKey) {
      return res.status(400).json({ error: 'Missing meetingKey in request body' });
    }

    const joinQuery = `
      SELECT * 
      FROM podcast_sessions 
      WHERE meeting_key = $1
      LIMIT 1;
    `;
    const { rows } = await pool.query(joinQuery, [meetingKey]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    return res.json(rows[0]);
  } catch (error) {
    console.error('Session join error:', error);
    return res.status(500).json({ error: 'Failed to join session', details: error.message });
  }
});

export default router;
