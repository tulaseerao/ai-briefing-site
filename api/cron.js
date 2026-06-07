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
    const desc = get('description').replace(/<[^>]+>/g, '').replace(/&[^;]+;/g, ' ').trim().substring(0, 220);
    const isSkippable = SKIP_TITLES.some(s => title.toLowerCase().includes(s));
    if (title && link && !isSkippable) items.push({ title, link, desc, source: sourceName });
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

async function commitToGitHub(content) {
  const token = process.env.GITHUB_TOKEN;
  const owner = 'tulaseerao';
  const repo = 'ai-briefing-site';
  const path = 'data/latest.json';
  const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github+json',
    'Content-Type': 'application/json',
  };

  // Get current file SHA (required for update)
  const getRes = await fetch(apiBase, { headers });
  const { sha } = await getRes.json();

  const encoded = Buffer.from(JSON.stringify(content, null, 2)).toString('base64');
  const putRes = await fetch(apiBase, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      message: `Daily briefing: ${content.date}`,
      content: encoded,
      sha
    })
  });

  if (!putRes.ok) {
    const err = await putRes.text();
    throw new Error(`GitHub commit failed: ${err}`);
  }
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
