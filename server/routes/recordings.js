import express from 'express';
import multer from 'multer';
import { supabase } from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Upload recording
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { sessionId, type, metadata } = req.body;
    const file = req.file;
    
    if (!file) {
      throw new Error('No file uploaded');
    }
    
    // Upload to Supabase Storage
    const fileName = `${sessionId}/${uuidv4()}.${file.originalname.split('.').pop()}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(fileName, file.buffer);
    
    if (uploadError) throw uploadError;
    
    // Create recording record
    const recording = {
      id: uuidv4(),
      session_id: sessionId,
      type,
      storage_path: fileName,
      metadata: JSON.parse(metadata),
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('podcast_recordings')
      .insert([recording])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Recording upload error:', error);
    res.status(500).json({ error: 'Failed to upload recording' });
  }
});

// Get session recordings
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const { data, error } = await supabase
      .from('podcast_recordings')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Get signed URLs for each recording
    const recordingsWithUrls = await Promise.all(
      data.map(async (recording) => {
        const { data: { signedUrl }, error: signedUrlError } = await supabase.storage
          .from(process.env.SUPABASE_BUCKET)
          .createSignedUrl(recording.storage_path, 3600); // 1 hour expiry
        
        if (signedUrlError) throw signedUrlError;
        
        return { ...recording, url: signedUrl };
      })
    );
    
    res.json(recordingsWithUrls);
  } catch (error) {
    console.error('Recordings fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch recordings' });
  }
});

export default router;