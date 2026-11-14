// Reads and writes data/sessions.json in the GitHub repo. Same approach as the Acumen tracker.
const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;
const TOKEN = process.env.GITHUB_TOKEN;
const API_URL = `https://api.github.com/repos/${OWNER}/${REPO}/contents/data/sessions.json`;
const HEADERS = {
  Authorization: `token ${TOKEN}`,
  Accept: 'application/vnd.github.v3+json',
  'Content-Type': 'application/json'
};

export async function readSessions() {
  const r = await fetch(API_URL, { headers: HEADERS, cache: 'no-store' });
  if (!r.ok) throw new Error('Could not read session data.');
  const fd = await r.json();
  const sessions = JSON.parse(Buffer.from(fd.content, 'base64').toString('utf-8'));
  return { sessions, sha: fd.sha };
}

export async function writeSessions(sessions, sha, message) {
  const r = await fetch(API_URL, {
    method: 'PUT',
    headers: HEADERS,
    body: JSON.stringify({
      message,
      content: Buffer.from(JSON.stringify(sessions, null, 2)).toString('base64'),
      sha
    })
  });
  if (!r.ok) throw new Error('Failed to save. Please try again.');
}

export function cors(res, methods) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
}
