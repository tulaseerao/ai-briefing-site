const RSS_SOURCES = [
  // Direct RSS feeds
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', source: 'TechCrunch AI' },
  { url: 'https://venturebeat.com/category/ai/feed/', source: 'VentureBeat AI' },
  { url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml', source: 'The Verge AI' },
  { url: 'https://aisecret.us/rss/', source: 'AI Secret' },
  // Google News RSS for newsletters that block direct feed access
  { url: 'https://news.google.com/rss/search?q=site:superhuman.ai+AI&hl=en-US&gl=US&ceid=US:en', source: 'Superhuman AI' },
  { url: 'https://news.google.com/rss/search?q=site:aitoast.beehiiv.com&hl=en-US&gl=US&ceid=US:en', source: 'AI Toast' },
  { url: 'https://news.google.com/rss/search?q=site:newsletter.theaireport.ai&hl=en-US&gl=US&ceid=US:en', source: 'The AI Report' },
];

// Titles that indicate non-article pages to skip
const SKIP_TITLES = ['subscribe', 'home', 'refund', 'privacy', 'about', 'contact', 'google news', 'join the world'];

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
    // Extract image from media:content, enclosure, or first <img> in description
    const image =
      block.match(/<media:content[^>]+url="([^"]+)"[^>]*/)?.[1] ||
      block.match(/<enclosure[^>]+url="([^"]+)"[^>]+type="image/)?.[1] ||
      rawDesc.match(/<img[^>]+src="([^"']+)"/)?.[1] ||
      null;
    const desc = rawDesc.replace(/<[^>]+>/g, '').replace(/&[^;]+;/g, ' ').trim().substring(0, 220);
    const isSkippable = SKIP_TITLES.some(s => title.toLowerCase().includes(s));
    if (title && link && !isSkippable) items.push({ title, link, desc, image, source: sourceName });
  }
  return items.slice(0, 2);
}

async function fetchAllNews() {
  const results = await Promise.allSettled(
    RSS_SOURCES.map(async ({ url, source }) => {
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
  const repo = 'ai-briefing-site';
  const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json',
  };

  // Get current SHA if file exists
  const getRes = await fetch(apiBase, { headers });
  const existing = await getRes.json();
  const sha = existing.sha || undefined;

  const encoded = Buffer.from(JSON.stringify(content, null, 2)).toString('base64');
  const body = { message, content: encoded };
  if (sha) body.sha = sha;

  const putRes = await fetch(apiBase, { method: 'PUT', headers, body: JSON.stringify(body) });
  if (!putRes.ok) throw new Error(`GitHub write failed for ${path}: ${await putRes.text()}`);
}

async function commitToGitHub(briefing) {
  const token = process.env.GITHUB_TOKEN;
  const msg = `Daily briefing: ${briefing.date}`;

  // 1. Update latest.json
  await githubPut(token, 'data/latest.json', briefing, msg);

  // 2. Save dated archive file
  await githubPut(token, `data/${briefing.date_slug}.json`, briefing, msg);

  // 3. Update archive index
  const owner = 'tulaseerao';
  const repo = 'ai-briefing-site';
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
  };
  const archiveRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/data/archive.json`, { headers });
  const archiveFile = await archiveRes.json();
  let archive = [];
  if (archiveFile.content) {
    archive = JSON.parse(Buffer.from(archiveFile.content, 'base64').toString('utf-8'));
  }
  // Add today if not already present
  if (!archive.find(e => e.date_slug === briefing.date_slug)) {
    archive.unshift({ date: briefing.date, date_slug: briefing.date_slug, issue: briefing.issue, storiesCount: briefing.stories.length });
  }
  await githubPut(token, 'data/archive.json', archive, msg);
}

module.exports = async function handler(req, res) {
  // Vercel passes CRON_SECRET automatically for cron requests
  const auth = req.headers.authorization;
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const items = await fetchAllNews();
    const now = new Date();

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
    const issue = Math.floor((now - startDate) / 86400000) + 1;

    const briefing = {
      date: now.toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/New_York'
      }),
      date_slug: now.toISOString().split('T')[0],
      issue: Math.max(1, issue),
      stories
    };

    await commitToGitHub(briefing);

    return res.status(200).json({
      success: true,
      date: briefing.date,
      issue: briefing.issue,
      storiesCount: stories.length
    });
  } catch (err) {
    console.error('Cron error:', err);
    return res.status(500).json({ error: err.message });
  }
};
