// Deploy this file as a Cloudflare Worker.
// Bind a KV namespace named SKIN_STATS to the worker.

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Skin-Voter',
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    try {
      if (path === '/api/stats') {
        return await handleGetStats(env, url);
      }
      const match = path.match(/^\/api\/(like|download)\/(.+)$/);
      if (match && request.method === 'POST') {
        const action = match[1];
        const skin = decodeURIComponent(match[2]);
        if (action === 'like') return await handleLike(env, skin, request);
        if (action === 'download') return await handleDownload(env, skin);
      }
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
      });
    }

    return new Response('Not found', { status: 404, headers: CORS_HEADERS });
  },
};

async function getSkinStats(env, skin) {
  const raw = await env.SKIN_STATS.get(`stats:${skin}`);
  return raw ? JSON.parse(raw) : { downloads: 0, likes: [] };
}

async function handleGetStats(env, url) {
  const skin = url.searchParams.get('skin');
  if (skin) {
    const stats = await getSkinStats(env, skin);
    return new Response(JSON.stringify({ skin, ...stats, liked: stats.likes.length }), {
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  const list = await env.SKIN_STATS.list({ prefix: 'stats:' });
  const result = {};
  for (const key of list.keys) {
    const skinName = key.name.slice(6);
    const stats = JSON.parse(await env.SKIN_STATS.get(key.name));
    result[skinName] = { downloads: stats.downloads, liked: stats.likes.length };
  }
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

async function handleDownload(env, skin) {
  const stats = await getSkinStats(env, skin);
  stats.downloads++;
  await env.SKIN_STATS.put(`stats:${skin}`, JSON.stringify(stats));
  return new Response(JSON.stringify({ skin, downloads: stats.downloads }), {
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

async function handleLike(env, skin, request) {
  const voter = request.headers.get('X-Skin-Voter');
  if (!voter) {
    return new Response(JSON.stringify({ error: 'Missing X-Skin-Voter header' }), {
      status: 400, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rateKey = `ratelimit:like:${ip}`;
  const recent = await env.SKIN_STATS.get(rateKey);
  if (recent && parseInt(recent) >= 20) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    });
  }
  await env.SKIN_STATS.put(rateKey, String(recent ? parseInt(recent) + 1 : 1), { expirationTtl: 60 });

  const stats = await getSkinStats(env, skin);
  const idx = stats.likes.indexOf(voter);
  if (idx === -1) {
    stats.likes.push(voter);
  } else {
    stats.likes.splice(idx, 1);
  }
  await env.SKIN_STATS.put(`stats:${skin}`, JSON.stringify(stats));
  return new Response(JSON.stringify({ skin, liked: stats.likes.length, userLiked: idx === -1 }), {
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}
