// POST /api/contact
// Saves an enquiry to Supabase and sends an email notification via Resend.
// Required environment variables (set in Vercel → Settings → Environment Variables):
//   SUPABASE_URL           e.g. https://xxxxx.supabase.co
//   SUPABASE_SERVICE_KEY   the "service_role" secret key from Supabase
//   RESEND_API_KEY         from resend.com
//   NOTIFY_EMAIL           (optional) where notification emails go — defaults below

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, email, service, message } = req.body || {};

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required.' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'info@femtechhub.com';

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing Supabase environment variables.');
    return res.status(500).json({ error: 'Server is not configured yet.' });
  }

  // 1) Save the enquiry to Supabase — this must succeed for the request to count as successful.
  try {
    const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/enquiries`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify([
        {
          name,
          phone,
          email: email || null,
          service: service || null,
          message: message || null,
        },
      ]),
    });

    if (!dbRes.ok) {
      const errText = await dbRes.text();
      console.error('Supabase insert failed:', errText);
      return res.status(500).json({ error: 'Could not save your enquiry. Please try again or call us directly.' });
    }
  } catch (err) {
    console.error('Supabase request error:', err);
    return res.status(500).json({ error: 'Could not save your enquiry. Please try again or call us directly.' });
  }

  // 2) Send an email notification — best-effort. If this fails, the enquiry is still saved,
  //    so we don't fail the whole request over an email hiccup.
  if (RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: "D' Fem Tech Hub Website <onboarding@resend.dev>",
          to: [NOTIFY_EMAIL],
          subject: `New enquiry — ${service || 'General'} — ${name}`,
          html: `
            <h3>New website enquiry</h3>
            <p><b>Name:</b> ${escapeHtml(name)}</p>
            <p><b>Phone:</b> ${escapeHtml(phone)}</p>
            <p><b>Email:</b> ${escapeHtml(email || 'Not provided')}</p>
            <p><b>Service:</b> ${escapeHtml(service || 'Not specified')}</p>
            <p><b>Message:</b><br>${escapeHtml(message || 'Not provided').replace(/\n/g, '<br>')}</p>
          `,
        }),
      });
    } catch (emailErr) {
      console.error('Email send failed (non-fatal):', emailErr);
    }
  }

  return res.status(200).json({ success: true });
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
