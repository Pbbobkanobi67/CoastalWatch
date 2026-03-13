// CoastalWatch AI Proxy — Cloudflare Worker
// Proxies requests to Gemini API with server-side key + rate limiting

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const RATE_LIMIT = 10;       // requests per window
const RATE_WINDOW = 3600;    // seconds (1 hour)

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    // Only accept POST to /analyze
    const url = new URL(request.url);
    if (request.method !== 'POST' || url.pathname !== '/analyze') {
      return json({ error: 'Not found' }, 404);
    }

    // Rate limiting via KV
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rlKey = `rl:${ip}`;

    try {
      const rlData = await env.RATE_LIMITS.get(rlKey, 'json');
      if (rlData && rlData.count >= RATE_LIMIT) {
        return json({ error: `Rate limit exceeded. Max ${RATE_LIMIT} requests per hour. Try your own Gemini key (free at aistudio.google.com).` }, 429);
      }

      const newCount = rlData ? rlData.count + 1 : 1;
      await env.RATE_LIMITS.put(rlKey, JSON.stringify({ count: newCount }), { expirationTtl: RATE_WINDOW });
    } catch (e) {
      // If KV fails, allow the request through
      console.error('Rate limit check failed:', e);
    }

    // Parse and forward request
    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: 'Invalid JSON body' }, 400);
    }

    if (!body.contents || !Array.isArray(body.contents)) {
      return json({ error: 'Missing "contents" array in request body' }, 400);
    }

    // Forward to Gemini
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return json({ error: 'Server configuration error: missing API key' }, 500);
    }

    const geminiResponse = await fetch(`${GEMINI_URL}?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: body.contents })
    });

    const geminiData = await geminiResponse.json();

    return new Response(JSON.stringify(geminiData), {
      status: geminiResponse.status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders()
      }
    });
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() }
  });
}
