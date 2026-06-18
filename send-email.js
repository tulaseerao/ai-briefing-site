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
  const site  = 'https://ai-briefing-site.vercel.app';
  const unsub = 'mailto:support@inpharmd.com?subject=Unsubscribe%20from%20The%20AI%20Brief';

  /* ── pharma rows ── */
  const pharmaHtml = pharma.stories.map((s, i) => `
    <tr><td class="ep" style="padding:16px 40px;${i < pharma.stories.length - 1 ? 'border-bottom:1px solid #e0f2f1;' : ''}background-color:#f7fffe;">
      <a href="${s.sources[0].url}" target="_blank"
         style="font-size:16px;font-weight:700;color:#1c1c21;text-decoration:none;line-height:1.4;display:block;margin-bottom:5px;word-break:break-word;"
      >${clean(s.headline)}</a>
      <p style="margin:0 0 7px;font-size:14px;color:#4a5568;line-height:1.6;word-break:break-word;">${clean(s.summary)}</p>
      <a href="${s.sources[0].url}" target="_blank"
         style="font-size:12px;font-weight:700;color:#00897b;text-decoration:none;"
      >${s.sources[0].label} ↗</a>
    </td></tr>`).join('');

  /* ── main story rows ── */
  const storyHtml = briefing.stories.map((s, i) => {
    const imgUrl = imgSrc(s, i);
    return `
    <tr><td class="es" style="padding:22px 40px;${i < briefing.stories.length - 1 ? 'border-bottom:1px solid #e8e8e8;' : ''}">
      <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr valign="top">

        <td class="eb" width="36" style="padding-right:0;padding-top:2px;">
          <table cellpadding="0" cellspacing="0" border="0"><tr>
            <td width="24" height="24" bgcolor="#FF6154"
                style="width:24px;height:24px;border-radius:12px;text-align:center;vertical-align:middle;">
              <span style="font-size:11px;font-weight:800;color:#ffffff;line-height:24px;">${s.id}</span>
            </td>
          </tr></table>
        </td>

        <td class="et" width="106" style="padding:0 16px 0 8px;">
          <img src="${imgUrl}" alt="" width="90"
               style="display:block;width:90px;height:auto;border-radius:8px;">
        </td>

        <td>
          <span style="font-size:11px;font-weight:700;color:#FF6154;text-transform:uppercase;letter-spacing:0.6px;">${s.sources[0].label}</span>
          <a href="${s.sources[0].url}" target="_blank"
             style="display:block;font-size:18px;font-weight:700;color:#1c1c21;text-decoration:none;line-height:1.35;margin:5px 0 10px;word-break:break-word;"
          >${clean(s.headline)}</a>
          <p style="margin:0 0 9px;font-size:14px;color:#374151;line-height:1.65;word-break:break-word;">
            <strong style="color:#1c1c21;">TL;DR:</strong> ${clean(s.summary)}
          </p>
          <p style="margin:0 0 12px;font-size:13px;color:#6b7280;line-height:1.55;word-break:break-word;">
            <strong style="color:#FF6154;">Why it matters —</strong> ${clean(s.why)}
          </p>
          <a href="${s.sources[0].url}" target="_blank"
             style="font-size:13px;font-weight:700;color:#FF6154;text-decoration:none;">Read more →</a>
        </td>

      </tr></table>
    </td></tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>The AI Brief &mdash; ${briefing.date}</title>
<style type="text/css">
  @media only screen and (max-width: 620px) {
    .eo  { padding: 0 0 20px !important; }
    .eh  { padding: 18px 16px 16px !important; }
    .epl { padding: 12px 16px 0    !important; }
    .ep  { padding: 14px 16px      !important; }
    .esl { padding: 16px 16px 0    !important; }
    .es  { padding: 16px 16px      !important; }
    .ef  { padding: 20px 16px      !important; }
    .et  { display: none !important; width: 0 !important; max-height: 0 !important;
           overflow: hidden !important; mso-hide: all !important; }
    .eb  { width: 30px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#f2f2f2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

<table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f2f2f2" style="background-color:#f2f2f2;">
<tr><td class="eo" align="center" style="padding:16px 16px 40px;">

  <table cellpadding="0" cellspacing="0" border="0" width="600" bgcolor="#ffffff"
         style="max-width:600px;width:100%;background-color:#ffffff;">

    <!-- VIEW ONLINE -->
    <tr><td bgcolor="#f2f2f2" style="background-color:#f2f2f2;padding:8px 0 10px;text-align:center;">
      <span style="font-size:12px;color:#9ca3af;">Trouble viewing?&nbsp;</span>
      <a href="${site}" target="_blank"
         style="font-size:12px;font-weight:600;color:#FF6154;text-decoration:none;">Read online →</a>
    </td></tr>

    <!-- HEADER -->
    <tr><td class="eh" style="padding:28px 40px 22px;border-bottom:2px solid #FF6154;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
        <td valign="middle">
          <p style="margin:0 0 4px;font-size:26px;font-weight:900;color:#1c1c21;letter-spacing:-0.5px;">
            <span style="color:#FF6154;">&#9679;</span> The AI Brief
          </p>
          <p style="margin:0;font-size:13px;color:#6b7280;">
            Daily AI &amp; Healthcare Intelligence &middot; by InPharmD
          </p>
        </td>
        <td align="right" valign="middle" style="white-space:nowrap;">
          <p style="margin:0 0 3px;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.6px;">Issue #${briefing.issue}</p>
          <p style="margin:0;font-size:14px;font-weight:700;color:#1c1c21;">${briefing.date}</p>
        </td>
      </tr></table>
    </td></tr>

    <!-- PHARMA SECTION LABEL -->
    <tr><td class="epl" bgcolor="#f7fffe" style="background-color:#f7fffe;padding:14px 40px 0;border-left:3px solid #00897b;">
      <p style="margin:0;font-size:10px;font-weight:800;color:#00897b;text-transform:uppercase;letter-spacing:1px;">
        &#9877; Pharma &amp; Healthcare AI
      </p>
    </td></tr>

    ${pharmaHtml}

    <!-- DIVIDER + AI SECTION LABEL -->
    <tr><td class="esl" style="padding:22px 40px 0;">
      <p style="margin:0;font-size:10px;font-weight:800;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;border-top:2px solid #e8e8e8;padding-top:20px;">
        Today's AI Briefing
      </p>
    </td></tr>

    ${storyHtml}

    <!-- FOOTER -->
    <tr><td class="ef" style="padding:24px 40px;border-top:1px solid #e8e8e8;text-align:center;">
      <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:#1c1c21;">
        The AI Brief &middot; by
        <a href="https://inpharmd.com" target="_blank"
           style="color:#FF6154;text-decoration:none;">InPharmD</a>
      </p>
      <p style="margin:0 0 10px;">
        <a href="${site}" target="_blank"
           style="font-size:12px;color:#9ca3af;text-decoration:none;margin:0 8px;">Website</a>
        <span style="font-size:12px;color:#e5e7eb;">&middot;</span>
        <a href="${site}/archive.html" target="_blank"
           style="font-size:12px;color:#9ca3af;text-decoration:none;margin:0 8px;">Archive</a>
        <span style="font-size:12px;color:#e5e7eb;">&middot;</span>
        <a href="${unsub}"
           style="font-size:12px;color:#9ca3af;text-decoration:underline;margin:0 8px;">Unsubscribe</a>
      </p>
      <p style="margin:0;font-size:11px;color:#d1d5db;line-height:1.5;">
        &copy; 2026 InPharmD &nbsp;&middot;&nbsp;
        You're receiving this because you subscribed to The AI Brief.
      </p>
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

  const recipients = [...new Set([TO, 'tulasi.chintha@gmail.com'])];

  for (const email of recipients) {
    process.stdout.write(`Sending to ${email}… `);
    await sendEmail(email, subject, html);
    console.log('done');
  }
}

main().catch(err => { console.error(err.message); process.exit(1); });
