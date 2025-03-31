import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db'; // PostgreSQL connection
import chatRoutes from './lib/chatRoutes'; // Chat & message routes

// Load .env
dotenv.config();

// App setup
const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Test DB connection
pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL'))
  .catch((err) => console.error('❌ Database connection error:', err));

// Routes
app.use('/', chatRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
