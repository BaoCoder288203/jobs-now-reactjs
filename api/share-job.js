const SITE_URL = (process.env.SITE_URL || 'https://jobsnow.id.vn').replace(/\/+$/, '');
const API_BASE_URL = (
  process.env.API_BASE_URL || 'https://jobsnow.onrender.com'
).replace(/\/+$/, '');

const DEFAULT_IMAGE = `${SITE_URL}/og-default.jpg`;

function escapeHtml(input = '') {
  return String(input)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function toAbsoluteUrl(value) {
  if (!value) return DEFAULT_IMAGE;

  if (
    value.startsWith('http://') ||
    value.startsWith('https://')
  ) {
    return value;
  }

  return `${SITE_URL}${value.startsWith('/') ? '' : '/'}${value}`;
}

function stripHtml(value = '') {
  return String(value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(value = '', max = 180) {
  return value.length > max
    ? `${value.slice(0, max - 3)}...`
    : value;
}

function getFirstString(...candidates) {
  for (const candidate of candidates) {
    if (
      typeof candidate === 'string' &&
      candidate.trim()
    ) {
      return candidate.trim();
    }
  }

  return '';
}

async function fetchJobDetail(jobId) {
  const endpoint = `${API_BASE_URL}/job/${encodeURIComponent(jobId)}`;

  const upstream = await fetch(endpoint, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!upstream.ok) {
    throw new Error(
      `Fetch failed with ${upstream.status}`
    );
  }

  const contentType =
    upstream.headers.get('content-type') || '';

  if (
    !contentType
      .toLowerCase()
      .includes('application/json')
  ) {
    throw new Error(
      `Unexpected content-type: ${contentType}`
    );
  }

  const payload = await upstream.json();

  if (
    payload &&
    typeof payload === 'object' &&
    'code' in payload
  ) {
    const code = Number(payload.code);

    if (!Number.isNaN(code) && code !== 200) {
      throw new Error(
        `API error code: ${payload.code}`
      );
    }
  }

  const raw = payload?.data ?? payload ?? {};

  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid payload shape');
  }

  return raw;
}

function renderHtml({
  title,
  description,
  image,
  url,
}) {
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  />

  <title>${escapeHtml(title)}</title>

  <link
    rel="canonical"
    href="${escapeHtml(url)}"
  />

  <meta
    name="description"
    content="${escapeHtml(description)}"
  />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="JobsNow" />

  <meta
    property="og:title"
    content="${escapeHtml(title)}"
  />

  <meta
    property="og:description"
    content="${escapeHtml(description)}"
  />

  <meta
    property="og:image"
    content="${escapeHtml(image)}"
  />

  <meta
    property="og:image:secure_url"
    content="${escapeHtml(image)}"
  />

  <meta
    property="og:url"
    content="${escapeHtml(url)}"
  />

  <!-- Twitter -->
  <meta
    name="twitter:card"
    content="summary_large_image"
  />

  <meta
    name="twitter:title"
    content="${escapeHtml(title)}"
  />

  <meta
    name="twitter:description"
    content="${escapeHtml(description)}"
  />

  <meta
    name="twitter:image"
    content="${escapeHtml(image)}"
  />
</head>

<body>
  <h1>${escapeHtml(title)}</h1>

  <p>${escapeHtml(description)}</p>

  <a href="${escapeHtml(url)}">
    View Job
  </a>
</body>
</html>`;
}

export default async function handler(req, res) {
  const id = String(req.query?.id || '').trim();

  if (!id) {
    res.statusCode = 400;
    res.setHeader(
      'content-type',
      'text/plain; charset=utf-8'
    );

    return res.end('Missing job id');
  }

  // URL share phải EXACT MATCH URL scrape
  const shareUrl = `${SITE_URL}/s/jobs/${encodeURIComponent(
    id
  )}`;

  // URL thật của frontend
  const appUrl = `${SITE_URL}/jobs/${encodeURIComponent(
    id
  )}`;

  const fallbackTitle = 'Việc làm | JobsNow';

  const fallbackDescription =
    'Cơ hội việc làm mới nhất trên JobsNow.';

  // Detect social bots
  const ua = req.headers['user-agent'] || '';

  const isBot =
    /facebookexternalhit|Facebot|LinkedInBot|Twitterbot|Slackbot|Discordbot|TelegramBot/i.test(
      ua
    );

  try {
    const raw = await fetchJobDetail(id);

    const jobTitle = getFirstString(raw.title);

    const companyName = getFirstString(
      raw.companyName
    );

    const title = jobTitle
      ? `${jobTitle} | JobsNow`
      : fallbackTitle;

    const descriptionSource = getFirstString(
      raw.description,
      raw.requirements,
      companyName
    );

    const description =
      truncate(
        stripHtml(
          descriptionSource || fallbackDescription
        ),
        180
      ) || fallbackDescription;

    const image = toAbsoluteUrl(
      getFirstString(
        raw.thumbnailUrl,
        raw.companyLogo
      )
    );

    // BOT => trả HTML OG tags
    if (isBot) {
      const html = renderHtml({
        title,
        description,
        image,
        url: shareUrl,
      });

      res.statusCode = 200;

      res.setHeader(
        'content-type',
        'text/html; charset=utf-8'
      );

      res.setHeader(
        'cache-control',
        'public, s-maxage=300, stale-while-revalidate=86400'
      );

      return res.end(html);
    }

    // USER => redirect sang frontend thật
    res.writeHead(302, {
      Location: appUrl,
      'Cache-Control': 'no-store',
    });

    return res.end();
  } catch (error) {
    console.error('[share-job] failed', {
      id,
      message: error?.message,
    });

    // BOT fallback
    if (isBot) {
      const html = renderHtml({
        title: fallbackTitle,
        description: fallbackDescription,
        image: DEFAULT_IMAGE,
        url: shareUrl,
      });

      res.statusCode = 200;

      res.setHeader(
        'content-type',
        'text/html; charset=utf-8'
      );

      return res.end(html);
    }

    // USER fallback redirect
    res.writeHead(302, {
      Location: appUrl,
    });

    return res.end();
  }
}