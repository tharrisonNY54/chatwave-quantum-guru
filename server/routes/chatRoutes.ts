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

router.post('/ai/reply', async (req, res) => {
  const { chat_id, content } = req.body;

  try {
    // 1. Save the user's message
    const userMsg = await pool.query(
      'INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3) RETURNING *',
      [chat_id, 'user', content]
    );

    // 2. Call your local Mistral server
    const response = await fetch('http://localhost:8000/v1/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "mistral",
        prompt: content,
        temperature: 0.7,
        max_tokens: 200
      }),
    });

    const data = await response.json();
    const assistantReply = data.choices?.[0]?.text?.trim() || "[No reply]";

    // 3. Save assistant reply
    const aiMsg = await pool.query(
      'INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3) RETURNING *',
      [chat_id, 'assistant', assistantReply]
    );

    // 4. Send reply to frontend
    res.json({
      user: userMsg.rows[0],
      assistant: aiMsg.rows[0],
    });

  } catch (err) {
    console.error('❌ /ai/reply error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
