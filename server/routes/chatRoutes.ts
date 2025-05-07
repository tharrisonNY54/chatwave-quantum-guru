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
  console.log("🧠 Incoming /ai/reply body:", req.body);

  try {
    console.log("📝 Inserting user message:", { chat_id, role: 'user', content });
    const userMsg = await pool.query(
      'INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3) RETURNING *',
      [chat_id, 'user', content]
    );

    const payload = { prompt: content, chat_id };
    console.log("🧠 Sending to RAG backend:", payload);
    const response = await fetch('http://127.0.0.1:4000/ai/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log("🤖 AI REPLY FROM FASTAPI:", data);

    const assistantReply =
      data.content?.trim() || data.choices?.[0]?.text?.trim();

    if (assistantReply && assistantReply !== '[No reply]') {
      console.log("🤖 Inserting assistant message:", {
        chat_id,
        role: 'assistant',
        content: assistantReply
      });

      const aiMsg = await pool.query(
        'INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3) RETURNING *',
        [chat_id, 'assistant', assistantReply]
      );

      res.status(200).json({
        user: userMsg.rows[0],
        assistant: aiMsg.rows[0]
      });
    } else {
      console.warn("⚠️ Assistant reply was invalid. Skipping insert.");
      res.status(204).send(); // No Content
    }

  } catch (err) {
    console.error('❌ /ai/reply error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


export default router;
