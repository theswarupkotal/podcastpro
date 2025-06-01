//server/config/supabase.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// emulate __dirname in ES module
const __dirname = dirname(fileURLToPath(import.meta.url));
// load env from env/.env if present (Render injects its own vars automatically)
dotenv.config({ path: path.resolve(__dirname, '../../env/.env') });


const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
