import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db';
import chatRoutes from './routes/chatRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ✅ Fixed: use a proper base path for router
app.use('/', chatRoutes);

pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL'))
  .catch((err: unknown) => console.error('❌ Database connection error:', err));

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
