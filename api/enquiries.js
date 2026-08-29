// GET /api/enquiries
// Returns all saved enquiries — protected by the ADMIN_KEY environment variable.
// The admin dashboard (admin.html) sends the key in the "x-admin-key" header.

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const key = req.headers['x-admin-key'];
  if (!key || !process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing Supabase environment variables.');
    return res.status(500).json({ error: 'Server is not configured yet.' });
  }

  try {
    const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/enquiries?select=*&order=created_at.desc`, {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });

    if (!dbRes.ok) {
      const errText = await dbRes.text();
      console.error('Supabase fetch failed:', errText);
      return res.status(500).json({ error: 'Could not load enquiries.' });
    }

    const data = await dbRes.json();
    return res.status(200).json({ enquiries: data });
  } catch (err) {
    console.error('Supabase request error:', err);
    return res.status(500).json({ error: 'Could not load enquiries.' });
  }
};
