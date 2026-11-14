import { readSessions, writeSessions, cors } from './_store.js';

// POST { password, id }  -> Hema removes a wrongly logged entry
// POST { coach, id }     -> a coach removes their own entry if logged in the last 24 hours
export default async function handler(req, res) {
  cors(res, 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { password, coach, id } = req.body || {};
  if (!id) return res.status(400).json({ error: 'Missing id.' });

  try {
    const { sessions, sha } = await readSessions();
    const idx = sessions.findIndex(s => String(s.id) === String(id));
    if (idx === -1) return res.status(404).json({ error: 'Entry not found.' });
    const entry = sessions[idx];

    const isAdmin = password && password === process.env.ADMIN_PASSWORD;
    const isOwner = coach && entry.coach === coach &&
      (Date.now() - new Date(entry.loggedAt).getTime()) < 24 * 60 * 60 * 1000;
    if (!isAdmin && !isOwner) return res.status(401).json({ error: 'Not allowed.' });

    sessions.splice(idx, 1);
    await writeSessions(sessions, sha, `Remove: ${entry.coach} / ${entry.coachee} / ${entry.session}`);
    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Server error.' });
  }
}
