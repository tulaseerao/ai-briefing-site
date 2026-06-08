const fs   = require('fs');
const https = require('https');

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const FROM = process.env.SENDGRID_FROM || 'support@inpharmd.com';
const TO   = process.env.SENDGRID_TO   || 'tulasee@inpharmd.com';

const FALLBACK_IMGS = [
  'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=700&q=75&fit=crop',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=700&q=75&fit=crop',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=700&q=75&fit=crop',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&q=75&fit=crop',
  'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=700&q=75&fit=crop',
  'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=700&q=75&fit=crop',
];

function clean(str) {
  return (str || '')
    .replace(/&#8217;/g,"'").replace(/&#8216;/g,"'")
    .replace(/&#8220;/g,'"').replace(/&#8221;/g,'"')
    .replace(/&#8212;/g,'—').replace(/&#8230;/g,'…')
    .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')
    .replace(/🛎️\s*/g,'').trim();
}

function imgSrc(story, i) {
  return story.image || FALLBACK_IMGS[i % FALLBACK_IMGS.length];
}

function buildEmail(briefing, pharma) {
  const site    = 'https://ai-briefing-site.vercel.app';
  const unsub   = 'mailto:support@inpharmd.com?subject=Unsubscribe%20from%20The%20AI%20Brief';

  /* ── pharma rows ── */
  const pharmaHtml = pharma.stories.map(s => `
    <tr><td style="padding:12px 0;border-bottom:1px solid #d0f0ec;">
      <a href="${s.sources[0].url}" target="_blank"
         style="font-size:14px;font-weight:700;color:#1a1a2e;text-decoration:none;line-height:1.4;display:block;margin-bottom:4px;"
      >${clean(s.headline)}</a>
      <p style="margin:0 0 6px;font-size:13px;color:#4a5568;line-height:1.55;">${clean(s.summary)}</p>
      <a href="${s.sources[0].url}" target="_blank"
         style="font-size:11px;font-weight:700;color:#00897b;text-decoration:none;"
      >${s.sources[0].label} ↗</a>
    </td></tr>`).join('');

  /* ── main story rows ── */
  const storyHtml = briefing.stories.map((s, i) => `
    ${i > 0 ? '<tr><td style="padding:0"><hr style="border:none;border-top:1px solid #e5e7eb;margin:0"></td></tr>' : ''}
    <tr><td style="padding:${i===0?'0':'28px'} 0 28px;">

      <!-- image -->
      <img src="${imgSrc(s,i)}" width="560" alt="${clean(s.headline)}"
           style="width:100%;max-width:560px;height:240px;object-fit:cover;border-radius:8px;display:block;margin-bottom:16px;">

      <!-- source + number -->
      <table cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
        <tr>
          <td style="width:22px;height:22px;background:#194aff;border-radius:5px;text-align:center;line-height:22px;font-size:11px;font-weight:800;color:#fff;vertical-align:middle;">${s.id}</td>
          <td style="padding-left:8px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;vertical-align:middle;">${s.sources[0].label}</td>
        </tr>
      </table>

      <!-- headline -->
      <a href="${s.sources[0].url}" target="_blank"
         style="font-size:20px;font-weight:800;color:#1a1a2e;text-decoration:none;line-height:1.35;display:block;margin-bottom:12px;letter-spacing:-0.2px;"
      >${clean(s.headline)}</a>

      <!-- TL;DR -->
      <p style="margin:0 0 12px;font-size:15px;color:#4a5568;line-height:1.7;">
        <strong style="color:#1a1a2e;">TL;DR:</strong> ${clean(s.summary)}
      </p>

      <!-- Why it matters -->
      <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:14px;">
        <tr><td style="background:#f0f4ff;border-left:3px solid #194aff;border-radius:0 6px 6px 0;padding:10px 14px;">
          <p style="margin:0;font-size:13px;color:#1a3acc;line-height:1.6;">
            <strong>Why it matters —</strong> ${clean(s.why)}
          </p>
        </td></tr>
      </table>

      <!-- Read more → right-aligned -->
      <p style="margin:0;text-align:right;">
        <a href="${s.sources[0].url}" target="_blank"
           style="font-size:13px;font-weight:700;color:#194aff;text-decoration:none;">Read more →</a>
      </p>

    </td></tr>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>The AI Brief — ${briefing.date}</title></head>
<body style="margin:0;padding:0;background:#f0f3f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">

<table cellpadding="0" cellspacing="0" width="100%" style="background:#f0f3f8;">
<tr><td align="center" style="padding:20px 16px 36px;">
<table cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;">

  <!-- VIEW ONLINE -->
  <tr><td style="padding:0 0 10px;text-align:center;">
    <span style="font-size:12px;color:#9ca3af;">Trouble viewing? </span>
    <a href="${site}" target="_blank" style="font-size:12px;font-weight:600;color:#194aff;text-decoration:none;">Read online →</a>
  </td></tr>

  <!-- HEADER -->
  <tr><td style="background:#194aff;border-radius:10px 10px 0 0;padding:22px 28px 18px;">
    <table cellpadding="0" cellspacing="0" width="100%"><tr>
      <td>
        <p style="margin:0 0 2px;font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.3px;">● The AI Brief</p>
        <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.7);">Daily AI &amp; Healthcare Intelligence · by InPharmD</p>
      </td>
      <td align="right" valign="middle">
        <p style="margin:0 0 2px;font-size:10px;font-weight:800;color:rgba(255,255,255,0.55);text-transform:uppercase;letter-spacing:0.7px;">Issue #${briefing.issue}</p>
        <p style="margin:0;font-size:14px;font-weight:700;color:#fff;">${briefing.date}</p>
      </td>
    </tr></table>
  </td></tr>

  <!-- BODY -->
  <tr><td style="background:#ffffff;padding:28px 28px 8px;">

    <!-- PHARMA SECTION -->
    <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;border:1px solid #b2dfdb;border-top:3px solid #00897b;border-radius:8px;">
      <tr><td style="padding:18px 20px;">
        <p style="margin:0 0 14px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:#00897b;">⚕ Pharma &amp; Healthcare AI</p>
        <table cellpadding="0" cellspacing="0" width="100%">
          ${pharmaHtml}
          <tr><td style="height:4px;"></td></tr>
        </table>
      </td></tr>
    </table>

    <!-- SECTION LABEL -->
    <p style="margin:0 0 20px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.8px;color:#9ca3af;border-top:2px solid #e5e7eb;padding-top:18px;">Today's AI Briefing</p>

    <!-- STORIES -->
    <table cellpadding="0" cellspacing="0" width="100%">
      ${storyHtml}
    </table>

  </td></tr>

  <!-- FOOTER -->
  <tr><td style="background:#0c1a6e;border-radius:0 0 10px 10px;padding:22px 28px;">
    <table cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td>
          <p style="margin:0 0 3px;font-size:14px;font-weight:900;color:#fff;">The AI Brief</p>
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.45);">by <a href="https://inpharmd.com" target="_blank" style="color:rgba(255,255,255,0.6);text-decoration:none;">InPharmD</a></p>
        </td>
        <td align="right" valign="middle">
          <a href="${site}" target="_blank" style="font-size:12px;color:rgba(255,255,255,0.5);text-decoration:none;margin-right:16px;">Website</a>
          <a href="${site}/archive.html" target="_blank" style="font-size:12px;color:rgba(255,255,255,0.5);text-decoration:none;">Archive</a>
        </td>
      </tr>
      <tr><td colspan="2" style="padding-top:12px;border-top:1px solid rgba(255,255,255,0.08);">
        <p style="margin:6px 0 0;font-size:11px;color:rgba(255,255,255,0.3);line-height:1.6;">
          You're receiving this because you subscribed to The AI Brief. &nbsp;·&nbsp;
          <a href="${unsub}" style="color:rgba(255,255,255,0.45);text-decoration:underline;">Unsubscribe</a>
        </p>
      </td></tr>
    </table>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;
}

function sendEmail(to, subject, html) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: FROM, name: 'The AI Brief by InPharmD' },
      subject,
      content: [{ type: 'text/html', value: html }],
      tracking_settings: {
        click_tracking: { enable: true },
        open_tracking:  { enable: true }
      }
    });
    const opts = {
      hostname: 'api.sendgrid.com', path: '/v3/mail/send', method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };
    const req = https.request(opts, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () =>
        res.statusCode < 300 ? resolve() : reject(new Error(`SendGrid ${res.statusCode}: ${body}`))
      );
    });
    req.on('error', reject);
    req.write(payload); req.end();
  });
}

async function main() {
  if (!SENDGRID_API_KEY) { console.error('SENDGRID_API_KEY not set'); process.exit(1); }

  const briefing = JSON.parse(fs.readFileSync('./data/latest.json',       'utf8'));
  const pharma   = JSON.parse(fs.readFileSync('./data/pharma-latest.json','utf8'));
  const html     = buildEmail(briefing, pharma);
  const subject  = `The AI Brief — ${briefing.date} (Issue #${briefing.issue})`;

  const recipients = [...new Set([
    TO, 'tulasi.chintha@gmail.com'
  ])];

  for (const email of recipients) {
    process.stdout.write(`Sending to ${email}… `);
    await sendEmail(email, subject, html);
    console.log('done');
  }
}

main().catch(err => { console.error(err.message); process.exit(1); });
