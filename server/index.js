import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { testConnection } from './config/db.js';
import { initializeDatabase } from './schema/initDb.js';

import authRoutes from './routes/authRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import impactRoutes from './routes/impactRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import intelligenceRoutes from './routes/intelligenceRoutes.js';
import civicOpsRoutes from './routes/civicOpsRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploaded media
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Serve public assets fallback
app.use('/assets', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Sevadeep CivicConnect API Server',
    organization: 'Sevadeep NGO, Pune, Maharashtra'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/impact', impactRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/intelligence', intelligenceRoutes);
app.use('/api/civicops', civicOpsRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server with Database Connection
async function startServer() {
  const isDbConnected = await testConnection();
  if (isDbConnected) {
    try {
      await initializeDatabase();
    } catch (e) {
      console.warn('[Server Warning] Database init warning (tables may already exist):', e.message);
    }
  } else {
    console.warn('[Server Warning] MySQL is not responding at startup. Check DB credentials in server/.env');
  }

  app.listen(PORT, () => {
    console.log(`\n Sevadeep CivicConnect Backend API is running on http://localhost:${PORT}`);
    console.log(` Health check available at http://localhost:${PORT}/api/health\n`);
  });
}

startServer();
