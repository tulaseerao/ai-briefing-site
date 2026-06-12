const RSS_SOURCES = [
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', source: 'TechCrunch AI' },
  { url: 'https://venturebeat.com/category/ai/feed/', source: 'VentureBeat AI' },
  { url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml', source: 'The Verge AI' },
  { url: 'https://aisecret.us/rss/', source: 'AI Secret' },
  { url: 'https://news.google.com/rss/search?q=site:superhuman.ai+AI&hl=en-US&gl=US&ceid=US:en', source: 'Superhuman AI' },
  { url: 'https://news.google.com/rss/search?q=site:aitoast.beehiiv.com&hl=en-US&gl=US&ceid=US:en', source: 'AI Toast' },
  { url: 'https://news.google.com/rss/search?q=site:newsletter.theaireport.ai&hl=en-US&gl=US&ceid=US:en', source: 'The AI Report' },
];

const PHARMA_SOURCES = [
  { url: 'https://news.google.com/rss/search?q=AI+FDA+drug+discovery+pharma+clinical+trials&hl=en-US&gl=US&ceid=US:en', source: 'Google News' },
  { url: 'https://news.google.com/rss/search?q=AI+hospital+healthcare+diagnosis+treatment&hl=en-US&gl=US&ceid=US:en', source: 'Google News' },
  { url: 'https://www.fiercehealthcare.com/rss/xml', source: 'Fierce Healthcare' },
  { url: 'https://www.statnews.com/feed/', source: 'STAT News' },
];

const SKIP_TITLES = ['subscribe', 'home', 'refund', 'privacy', 'about', 'contact', 'google news', 'join the world'];

// InPharmD brand colours
const C = {
  brand:      '#194aff',
  brandBg:    '#f0f4ff',
  brandBorder:'#c7d4ff',
  brandText:  '#1a3acc',
  teal:       '#00897b',
  tealBg:     '#f0faf9',
  tealBorder: '#b2dfdb',
  footerBg:   '#0c1a6e',
  text:       '#1a1a2e',
  text2:      '#555e6d',
  text3:      '#adb5bd',
  border:     '#e9ecef',
  bg:         '#f0f3f8',
};

function decodeEntities(str) {
  return (str || '')
    .replace(/&#8217;/g, "'").replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"').replace(/&#8221;/g, '"')
    .replace(/&#8212;/g, '—').replace(/&#8230;/g, '…')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/🛎️\s*/g, '').trim();
}

const FALLBACK_IMGS = [
  'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=700&q=75&fit=crop',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=700&q=75&fit=crop',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=700&q=75&fit=crop',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=700&q=75&fit=crop',
  'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=700&q=75&fit=crop',
  'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=700&q=75&fit=crop',
];

function buildEmailHtml(briefing, pharma) {
  const site  = 'https://ai-briefing-site.vercel.app';
  const unsub = 'mailto:support@inpharmd.com?subject=Unsubscribe%20from%20The%20AI%20Brief';

  const pharmaRows = pharma.stories.map((s, i) => `
    <tr><td style="padding:14px 0;${i < pharma.stories.length - 1 ? 'border-bottom:1px solid #d0f0ec;' : ''}">
      <a href="${s.sources[0].url}" target="_blank"
         style="font-size:17px;font-weight:700;color:#1a1a2e;text-decoration:none;line-height:1.4;display:block;margin-bottom:6px;"
      >${decodeEntities(s.headline)}</a>
      <p style="margin:0 0 8px;font-size:15px;color:#374151;line-height:1.6;">${decodeEntities(s.summary)}</p>
      <a href="${s.sources[0].url}" target="_blank"
         style="font-size:13px;font-weight:700;color:#00897b;text-decoration:none;"
      >${s.sources[0].label} ↗</a>
    </td></tr>`).join('');

  const storyRows = briefing.stories.map((s, i) => {
    const imgUrl = s.image || FALLBACK_IMGS[i % FALLBACK_IMGS.length];
    return `
    ${i > 0 ? '<tr><td style="padding:0;"><hr style="border:none;border-top:1px solid #e5e7eb;margin:0;"></td></tr>' : ''}
    <tr><td style="padding:${i === 0 ? '0' : '30px'} 0 30px;">

      <!-- image: email-safe, no object-fit -->
      <img src="${imgUrl}" alt="" width="536"
           style="width:100%;height:auto;display:block;border-radius:8px;margin-bottom:18px;">

      <!-- number badge + source -->
      <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:12px;">
        <tr>
          <td width="26" height="26" bgcolor="#194aff"
              style="width:26px;height:26px;border-radius:5px;text-align:center;vertical-align:middle;">
            <span style="font-size:12px;font-weight:800;color:#ffffff;line-height:26px;">${s.id}</span>
          </td>
          <td style="padding-left:10px;font-size:12px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.6px;vertical-align:middle;">
            ${s.sources[0].label}
          </td>
        </tr>
      </table>

      <!-- headline -->
      <a href="${s.sources[0].url}" target="_blank"
         style="font-size:22px;font-weight:800;color:#111827;text-decoration:none;line-height:1.3;display:block;margin-bottom:14px;"
      >${decodeEntities(s.headline)}</a>

      <!-- TL;DR summary -->
      <p style="margin:0 0 14px;font-size:16px;color:#374151;line-height:1.7;">
        <strong style="color:#111827;">TL;DR:</strong> ${decodeEntities(s.summary)}
      </p>

      <!-- Why it matters box -->
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:16px;">
        <tr>
          <td style="background:#f0f4ff;border-left:4px solid #194aff;padding:12px 16px;border-radius:0 6px 6px 0;">
            <p style="margin:0;font-size:15px;color:#1e40af;line-height:1.65;">
              <strong>Why it matters —</strong> ${decodeEntities(s.why)}
            </p>
          </td>
        </tr>
      </table>

      <!-- Read more → right-aligned -->
      <p style="margin:0;text-align:right;">
        <a href="${s.sources[0].url}" target="_blank"
           style="font-size:14px;font-weight:700;color:#194aff;text-decoration:none;">Read more →</a>
      </p>

    </td></tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>The AI Brief &mdash; ${briefing.date}</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f3f8;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;">

<table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f0f3f8;">
<tr><td align="center" style="padding:24px 16px 40px;">

  <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;">

    <!-- VIEW ONLINE -->
    <tr><td style="padding:0 0 12px;text-align:center;">
      <span style="font-size:13px;color:#9ca3af;">Trouble viewing?&nbsp;</span>
      <a href="${site}" target="_blank"
         style="font-size:13px;font-weight:600;color:#194aff;text-decoration:none;">Read online →</a>
    </td></tr>

    <!-- HEADER -->
    <tr><td bgcolor="#194aff" style="background-color:#194aff;border-radius:10px 10px 0 0;padding:24px 32px 20px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
        <td valign="middle">
          <p style="margin:0 0 4px;font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">&#9679; The AI Brief</p>
          <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.75);">Daily AI &amp; Healthcare Intelligence &middot; by InPharmD</p>
        </td>
        <td align="right" valign="middle">
          <p style="margin:0 0 3px;font-size:11px;font-weight:700;color:rgba(255,255,255,0.55);text-transform:uppercase;letter-spacing:0.7px;">Issue #${briefing.issue}</p>
          <p style="margin:0;font-size:15px;font-weight:700;color:#ffffff;">${briefing.date}</p>
        </td>
      </tr></table>
    </td></tr>

    <!-- BODY -->
    <tr><td bgcolor="#ffffff" style="background-color:#ffffff;padding:28px 32px 12px;">

      <!-- PHARMA SECTION -->
      <table cellpadding="0" cellspacing="0" border="0" width="100%"
             style="margin-bottom:30px;border:1px solid #b2dfdb;border-top:3px solid #00897b;border-radius:8px;">
        <tr><td style="padding:20px 22px;">
          <p style="margin:0 0 16px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#00897b;">
            &#9877; Pharma &amp; Healthcare AI
          </p>
          <table cellpadding="0" cellspacing="0" border="0" width="100%">
            ${pharmaRows}
          </table>
        </td></tr>
      </table>

      <!-- SECTION LABEL -->
      <p style="margin:0 0 22px;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;border-top:2px solid #e5e7eb;padding-top:20px;">
        Today's AI Briefing
      </p>

      <!-- STORIES -->
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        ${storyRows}
      </table>

    </td></tr>

    <!-- FOOTER -->
    <tr><td bgcolor="#0c1a6e" style="background-color:#0c1a6e;border-radius:0 0 10px 10px;padding:24px 32px;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td valign="middle">
            <p style="margin:0 0 3px;font-size:15px;font-weight:900;color:#ffffff;">The AI Brief</p>
            <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.5);">by
              <a href="https://inpharmd.com" target="_blank"
                 style="color:rgba(255,255,255,0.65);text-decoration:none;">InPharmD</a>
            </p>
          </td>
          <td align="right" valign="middle">
            <a href="${site}" target="_blank"
               style="font-size:13px;color:rgba(255,255,255,0.55);text-decoration:none;margin-right:18px;">Website</a>
            <a href="${site}/archive.html" target="_blank"
               style="font-size:13px;color:rgba(255,255,255,0.55);text-decoration:none;">Archive</a>
          </td>
        </tr>
        <tr><td colspan="2" style="padding-top:14px;border-top:1px solid rgba(255,255,255,0.1);">
          <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.35);line-height:1.6;">
            You're receiving this because you subscribed to The AI Brief.&nbsp;&nbsp;&middot;&nbsp;&nbsp;
            <a href="${unsub}"
               style="color:rgba(255,255,255,0.5);text-decoration:underline;">Unsubscribe</a>
          </p>
        </td></tr>
      </table>
    </td></tr>

  </table>

</td></tr>
</table>
</body></html>`;
}

async function sendNewsletter(briefing, pharmaData) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from   = process.env.SENDGRID_FROM || 'support@inpharmd.com';

  // Support comma-separated recipients in SENDGRID_TO
  const toList = (process.env.SENDGRID_TO || 'tulasee@inpharmd.com')
    .split(',').map(e => e.trim()).filter(Boolean);
  // Always include the gmail address
  const allTo = [...new Set([...toList, 'tulasi.chintha@gmail.com'])];

  if (!apiKey) throw new Error('SENDGRID_API_KEY not set');

  const html    = buildEmailHtml(briefing, pharmaData);
  const subject = `The AI Brief — ${briefing.date} (Issue #${briefing.issue})`;

  const payload = JSON.stringify({
    personalizations: [{ to: allTo.map(email => ({ email })) }],
    from: { email: from, name: 'The AI Brief by InPharmD' },
    subject,
    content: [{ type: 'text/html', value: html }],
    tracking_settings: {
      click_tracking: { enable: true },
      open_tracking:  { enable: true }
    }
  });

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: payload
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`SendGrid ${res.status}: ${body}`);
  }
}

function parseRSS(xml, sourceName) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1];
    const get = (tag) => {
      const m = block.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i'));
      return m ? m[1].trim() : '';
    };
    const title = get('title');
    const link = get('link') || get('guid');
    const rawDesc = get('description');
    const image =
      block.match(/<media:content[^>]+url="([^"]+)"[^>]*/)?.[1] ||
      block.match(/<enclosure[^>]+url="([^"]+)"[^>]+type="image/)?.[1] ||
      rawDesc.match(/<img[^>]+src="([^"']+)"/)?.[1] ||
      null;
    // Decode HTML entities before stripping tags — Google News encodes as &lt;a href=...&gt;
    const decodedDesc = rawDesc
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
    const desc = decodedDesc.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().substring(0, 220);
    const isSkippable = SKIP_TITLES.some(s => title.toLowerCase().includes(s));
    if (title && link && !isSkippable) items.push({ title, link, desc, image, source: sourceName });
  }
  return items.slice(0, 2);
}

async function fetchFromSources(sources) {
  const results = await Promise.allSettled(
    sources.map(async ({ url, source }) => {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AIBriefBot/1.0)' },
        signal: AbortSignal.timeout(8000)
      });
      const xml = await res.text();
      return parseRSS(xml, source);
    })
  );
  return results.flatMap(r => r.status === 'fulfilled' ? r.value : []);
}

async function githubPut(token, path, content, message) {
  const owner = 'tulaseerao';
  const repo  = 'ai-briefing-site';
  const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json',
  };

  const getRes  = await fetch(apiBase, { headers });
  const existing = await getRes.json();
  const sha      = existing.sha || undefined;

  const encoded = Buffer.from(JSON.stringify(content, null, 2)).toString('base64');
  const body    = { message, content: encoded };
  if (sha) body.sha = sha;

  const putRes = await fetch(apiBase, { method: 'PUT', headers, body: JSON.stringify(body) });
  if (!putRes.ok) throw new Error(`GitHub write failed for ${path}: ${await putRes.text()}`);
}

async function commitToGitHub(briefing) {
  const token = process.env.GITHUB_TOKEN;
  const msg   = `Daily briefing: ${briefing.date}`;

  // Critical writes — always run these
  await githubPut(token, 'data/latest.json', briefing, msg);
  await githubPut(token, `data/${briefing.date_slug}.json`, briefing, msg);

  // Archive update — best-effort, never block critical writes
  try {
    const owner   = 'tulaseerao';
    const repo    = 'ai-briefing-site';
    const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github+json' };
    const archiveRes  = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data/archive.json`, { headers });
    const archiveFile = await archiveRes.json();
    let archive = [];
    if (archiveFile.content) {
      archive = JSON.parse(Buffer.from(archiveFile.content.replace(/\n/g, ''), 'base64').toString('utf-8'));
    }
    if (!archive.find(e => e.date_slug === briefing.date_slug)) {
      archive.unshift({ date: briefing.date, date_slug: briefing.date_slug, issue: briefing.issue, storiesCount: briefing.stories.length });
      await githubPut(token, 'data/archive.json', archive, msg);
    }
  } catch (err) {
    console.error('Archive update failed (non-fatal):', err.message);
  }
}

module.exports = async function handler(req, res) {
  const auth = req.headers.authorization;
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const [items, pharmaItems] = await Promise.all([
      fetchFromSources(RSS_SOURCES),
      fetchFromSources(PHARMA_SOURCES)
    ]);

    const now     = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/New_York'
    });
    const dateSlug = now.toISOString().split('T')[0];

    const stories = items.slice(0, 6).map((item, i) => ({
      id: i + 1,
      confidence: 'HIGH',
      vote: '3-0',
      headline: item.title,
      summary: item.desc || 'Read the full story at the source.',
      why: `An important development covered by ${item.source} worth tracking today.`,
      image: item.image || null,
      sources: [{ label: item.source, url: item.link }]
    }));

    const startDate = new Date('2026-06-05');
    const issue     = Math.max(1, Math.floor((now - startDate) / 86400000) + 1);

    const briefing = { date: dateStr, date_slug: dateSlug, issue, stories };

    const seen = new Set();
    const pharmaStories = pharmaItems
      .filter(item => { if (seen.has(item.title)) return false; seen.add(item.title); return true; })
      .slice(0, 4)
      .map((item, i) => ({
        id: i + 1,
        headline: item.title,
        summary: item.desc || 'Read the full story at the source.',
        why: `Healthcare AI development covered by ${item.source}.`,
        image: item.image || null,
        sources: [{ label: item.source, url: item.link }]
      }));

    const pharmaData = { date: dateStr, date_slug: dateSlug, stories: pharmaStories };

    // Commit website data and send newsletter in parallel
    await Promise.all([
      commitToGitHub(briefing),
      githubPut(process.env.GITHUB_TOKEN, 'data/pharma-latest.json', pharmaData, `Pharma briefing: ${dateStr}`),
      sendNewsletter(briefing, pharmaData)
    ]);

    return res.status(200).json({
      success: true,
      date: briefing.date,
      issue: briefing.issue,
      storiesCount: stories.length,
      pharmaStoriesCount: pharmaStories.length,
      emailSent: true
    });
  } catch (err) {
    console.error('Cron error:', err);
    return res.status(500).json({ error: err.message });
  }
};
