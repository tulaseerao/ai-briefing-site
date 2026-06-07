module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email } = req.body || {};
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  try {
    const contactRes = await fetch('https://api.sendgrid.com/v3/marketing/contacts', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ contacts: [{ email }] })
    });

    if (!contactRes.ok) {
      const err = await contactRes.text();
      console.error('SendGrid contacts error:', err);
      return res.status(500).json({ error: 'Failed to subscribe' });
    }

    await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: { email: 'support@inpharmd.com', name: 'The AI Brief' },
        personalizations: [{ to: [{ email }], subject: 'Welcome to The AI Brief' }],
        content: [{
          type: 'text/html',
          value: `<!DOCTYPE html><html><body style="font-family:-apple-system,sans-serif;max-width:560px;margin:40px auto;padding:0 20px;color:#09090b">
            <h1 style="font-size:24px;font-weight:800;margin-bottom:8px">Welcome to The AI Brief</h1>
            <p style="color:#71717a;font-size:15px;margin-bottom:24px">You're now subscribed. Every morning at 7 AM EST, you'll receive the most important AI stories — fact-checked and concisely summarized.</p>
            <p style="font-size:15px">We curate from <strong>The Rundown AI, TLDR AI, Ben's Bites, Import AI</strong> and <strong>The Batch</strong> — so you don't have to.</p>
            <hr style="border:none;border-top:1px solid #e4e4e7;margin:32px 0">
            <p style="color:#a1a1aa;font-size:13px">You subscribed at theaibrief.vercel.app</p>
          </body></html>`
        }]
      })
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Subscribe error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
