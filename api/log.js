import { MAPPING, SESSIONS, STATUSES, DONE_STATUSES } from './_mapping.js';
import { readSessions, writeSessions, cors } from './_store.js';

// A coach logs one event for a session slot: scheduled, completed, no-show, etc.
// A slot can have several events over time (scheduled -> no-show -> scheduled -> completed).
export default async function handler(req, res) {
  cors(res, 'POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { coach, coachee, session, date, time, status } = req.body || {};
  if (!coach || !coachee || !session || !date || !time || !status)
    return res.status(400).json({ error: 'All fields are required.' });
  if (!MAPPING[coach]) return res.status(400).json({ error: 'Unknown coach.' });
  if (!MAPPING[coach].includes(coachee)) return res.status(400).json({ error: `${coachee} is not mapped to ${coach}.` });
  if (!SESSIONS.includes(session)) return res.status(400).json({ error: 'Unknown session.' });
  if (!STATUSES.includes(status)) return res.status(400).json({ error: 'Unknown status.' });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time))
    return res.status(400).json({ error: 'Date or time is not valid.' });

  try {
    const { sessions, sha } = await readSessions();
    const slot = sessions.filter(s => s.coach === coach && s.coachee === coachee && s.session === session);

    if (slot.some(s => DONE_STATUSES.includes(s.status)))
      return res.status(409).json({ error: `${session} with ${coachee} is already marked as completed.` });

    const last = slot[slot.length - 1];
    if (status === 'Scheduled' && last && last.status === 'Scheduled')
      return res.status(409).json({ error: `${session} with ${coachee} already has a scheduled date (${last.date}). Log what happened to it first, or mark it as rescheduled.` });

    const entry = {
      id: Date.now(),
      coach, coachee, session, date, time, status,
      loggedAt: new Date().toISOString()
    };
    sessions.push(entry);
    await writeSessions(sessions, sha, `Log: ${coach} / ${coachee} / ${session} / ${status}`);
    return res.status(200).json({ success: true, entry });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Server error. Please try again.' });
  }
}
