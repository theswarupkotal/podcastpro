//server.index.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';
import authRoutes from './routes/auth.js';
import sessionRoutes from './routes/sessions.js';
import recordingRoutes from './routes/recordings.js';
import pool from './config/db.js';
import { setupSocketServer } from './socket.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

// Set up Socket.IO
setupSocketServer(server);

// Middleware
app.use(cors({
  origin: [
    'https://swarup-podcast.vercel.app', 
    'https://swaruppodcast.onrender.com',
    'http://localhost:3000'
  ],
  methods: ['GET','POST','PUT','DELETE'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/recordings', recordingRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Serve React SPA build and fallback all other GET requests to index.html
const buildPath = join(__dirname, '../dist');
app.use(express.static(buildPath));
app.get('*', (req, res) => {
  res.sendFile(join(buildPath, 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Swarup Podcast server running on port ${PORT}`);
});