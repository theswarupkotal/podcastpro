//server/routes/auth.js
import express from 'express';
import dotenv from 'dotenv';
import { supabase } from '../config/supabase.js';

dotenv.config();

// Base URL for your deployed frontend
const FRONTEND_URL = process.env.FRONTEND_URL;
if (!FRONTEND_URL) {
  throw new Error('Missing FRONTEND_URL environment variable');
}

const router = express.Router();

// Verify authentication
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) throw error;
    
    res.json({ user });
  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(401).json({ error: 'Invalid authentication' });
  }
});


// Add this new route for Google OAuth callback
router.get('/callback/google', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code missing' });
    }

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(String(code));
    
    if (error) throw error;

    // Successful authentication — redirect with token in the hash
    res.redirect(
      `${FRONTEND_URL}/auth/callback`
    );
        
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect('/login?error=google_auth_failed');
  }
});
export default router;
