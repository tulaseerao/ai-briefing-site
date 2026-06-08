module.exports = async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Auth via header or query param
  const token = req.headers['x-admin-token'] || req.query.token;
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { action } = req.query;
  const sg = process.env.SENDGRID_API_KEY;

  try {
    if (action === 'subscribers') {
      // Search all contacts in SendGrid Marketing
      const r = await fetch('https://api.sendgrid.com/v3/marketing/contacts/search', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${sg}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: "email IS NOT NULL", page_size: 1000 })
      });
      const data = await r.json();
      const contacts = (data.result || []).map(c => ({
        email: c.email,
        first_name: c.first_name || '',
        last_name: c.last_name || '',
        created_at: c.created_at,
        updated_at: c.updated_at
      })).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return res.json({ count: contacts.length, contacts });
    }

    if (action === 'stats') {
      // 30-day sending stats (transactional)
      const end   = new Date().toISOString().split('T')[0];
      const start = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

      const [statsRes, countRes] = await Promise.all([
        fetch(`https://api.sendgrid.com/v3/stats?start_date=${start}&end_date=${end}&aggregated_by=day`, {
          headers: { 'Authorization': `Bearer ${sg}` }
        }),
        fetch('https://api.sendgrid.com/v3/marketing/contacts/count', {
          headers: { 'Authorization': `Bearer ${sg}` }
        })
      ]);

      const [stats, countData] = await Promise.all([statsRes.json(), countRes.json()]);

      // Aggregate totals
      const totals = { requests: 0, delivered: 0, opens: 0, unique_opens: 0, clicks: 0, unique_clicks: 0, bounces: 0, spam_reports: 0, unsubscribes: 0 };
      const daily = (Array.isArray(stats) ? stats : []).map(day => {
        const m = day.stats?.[0]?.metrics || {};
        Object.keys(totals).forEach(k => { totals[k] += (m[k] || 0); });
        return { date: day.date, ...m };
      }).reverse();

      const openRate  = totals.delivered ? ((totals.unique_opens  / totals.delivered) * 100).toFixed(1) : '0.0';
      const clickRate = totals.delivered ? ((totals.unique_clicks / totals.delivered) * 100).toFixed(1) : '0.0';

      return res.json({
        subscribers: countData.contact_count || 0,
        totals,
        openRate,
        clickRate,
        daily
      });
    }

    return res.status(400).json({ error: 'Unknown action. Use ?action=stats or ?action=subscribers' });
  } catch (err) {
    console.error('Admin error:', err);
    return res.status(500).json({ error: err.message });
  }
};
