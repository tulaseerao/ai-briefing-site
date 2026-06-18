const RSS_SOURCES = [
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', source: 'TechCrunch AI' },
  { url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml', source: 'The Verge AI' },
  { url: 'https://aisecret.us/rss/', source: 'AI Secret' },
  { url: 'https://news.google.com/rss/search?q=site:superhuman.ai+AI&hl=en-US&gl=US&ceid=US:en', source: 'Superhuman AI' },
  { url: 'https://www.producthunt.com/feed', source: 'Product Hunt' },
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

  /* ── pharma rows ── */
  const pharmaRows = pharma.stories.map((s, i) => `
    <tr><td class="ep" style="padding:16px 40px;${i < pharma.stories.length - 1 ? 'border-bottom:1px solid #e0f2f1;' : ''}background-color:#f7fffe;">
      <a href="${s.sources[0].url}" target="_blank"
         style="font-size:16px;font-weight:700;color:#1c1c21;text-decoration:none;line-height:1.4;display:block;margin-bottom:5px;word-break:break-word;"
      >${decodeEntities(s.headline)}</a>
      <p style="margin:0 0 7px;font-size:14px;color:#4a5568;line-height:1.6;word-break:break-word;">${decodeEntities(s.summary)}</p>
      <a href="${s.sources[0].url}" target="_blank"
         style="font-size:12px;font-weight:700;color:#00897b;text-decoration:none;"
      >${s.sources[0].label} ↗</a>
    </td></tr>`).join('');

  /* ── main story rows ── */
  const storyRows = briefing.stories.map((s, i) => {
    const imgUrl = s.image || FALLBACK_IMGS[i % FALLBACK_IMGS.length];
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
          >${decodeEntities(s.headline)}</a>
          <p style="margin:0 0 9px;font-size:14px;color:#374151;line-height:1.65;word-break:break-word;">
            <strong style="color:#1c1c21;">TL;DR:</strong> ${decodeEntities(s.summary)}
          </p>
          <p style="margin:0 0 12px;font-size:13px;color:#6b7280;line-height:1.55;word-break:break-word;">
            <strong style="color:#FF6154;">Why it matters —</strong> ${decodeEntities(s.why)}
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
  /* Mobile: reduce padding, hide thumbnail, stack cleanly */
  @media only screen and (max-width: 620px) {
    .eo  { padding: 0 0 20px !important; }
    .eh  { padding: 18px 16px 16px !important; }
    .epl { padding: 12px 16px 0    !important; }
    .ep  { padding: 14px 16px      !important; }
    .esl { padding: 16px 16px 0    !important; }
    .es  { padding: 16px 16px      !important; }
    .ef  { padding: 20px 16px      !important; }
    /* hide thumbnail column on mobile — content fills the space */
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

    ${pharmaRows}

    <!-- DIVIDER + AI SECTION LABEL -->
    <tr><td class="esl" style="padding:22px 40px 0;">
      <p style="margin:0;font-size:10px;font-weight:800;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;border-top:2px solid #e8e8e8;padding-top:20px;">
        Today's AI Briefing
      </p>
    </td></tr>

    ${storyRows}

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
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
    const desc = decodedDesc
      .replace(/<[^>]+>/g, '')          // strip HTML tags
      .replace(/\[https?:\/\/[^\]]*\]/g, '')  // strip [https://...] inline URL references
      .replace(/\[\/[^\]]*\]/g, '')     // strip [/path/...] relative URL references
      .replace(/🛎️\s*/g, '')
      .replace(/\s+/g, ' ').trim().substring(0, 220);
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

    const cleanTitle = t => t.replace(/🛎️\s*/g, '').replace(/\s+/g, ' ').trim();

    const stories = items.slice(0, 6).map((item, i) => ({
      id: i + 1,
      confidence: 'HIGH',
      vote: '3-0',
      headline: cleanTitle(item.title),
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
        headline: cleanTitle(item.title),
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
