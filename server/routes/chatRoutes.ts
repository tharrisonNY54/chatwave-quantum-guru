import express from 'express';
import pool from '../db';

const router = express.Router();

router.post('/chats', async (req, res) => {
  const { title } = req.body;
  const result = await pool.query(
    'INSERT INTO chats (title) VALUES ($1) RETURNING *',
    [title]
  );
  res.json(result.rows[0]);
});

router.get('/chats', async (_, res) => {
  const result = await pool.query('SELECT * FROM chats ORDER BY created_at DESC');
  res.json(result.rows);
});

router.post('/messages', async (req, res) => {
  const { chat_id, role, content } = req.body;
  const result = await pool.query(
    'INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3) RETURNING *',
    [chat_id, role, content]
  );
  res.json(result.rows[0]);
});

router.get('/chats/:chatId/messages', async (req, res) => {
  const chatId = req.params.chatId;
  const result = await pool.query(
    'SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at',
    [chatId]
  );
  res.json(result.rows);
});

export default router;
