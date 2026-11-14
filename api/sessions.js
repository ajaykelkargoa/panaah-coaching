import { readSessions, cors } from './_store.js';

// GET /api/sessions?coach=Name        -> that coach's entries only
// GET /api/sessions?password=xxxx     -> everything (Hema only)
export default async function handler(req, res) {
  cors(res, 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { password, coach } = req.query;
  try {
    const { sessions } = await readSessions();
    if (password && password === process.env.ADMIN_PASSWORD) return res.status(200).json({ sessions, admin: true });
    if (password) return res.status(401).json({ error: 'Wrong password.' });
    if (coach) return res.status(200).json({ sessions: sessions.filter(s => s.coach === coach) });
    return res.status(401).json({ error: 'Unauthorized' });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Server error.' });
  }
}
