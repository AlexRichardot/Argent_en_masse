// Fonction Supabase Edge : /functions/v1/quote
// Récupère un cours de bourse via Twelve Data, en cachant la clé API côté serveur.
Deno.serve(async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const url = new URL(req.url);
    const symbol = url.searchParams.get('symbol');
    const exchange = url.searchParams.get('exchange'); // optionnel, aide pour les titres européens
    if (!symbol) {
      return new Response(JSON.stringify({ error: 'paramètre symbol requis' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('TWELVEDATA_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "clé API non configurée côté serveur" }), {
        status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // on retire les suffixes type .PA/.AS/.DE avant d'interroger Twelve Data
    const baseSymbol = symbol.replace(/\.(PA|AS|DE|L|MI|MC|BR)$/i, '');
    let quoteUrl = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(baseSymbol)}&apikey=${apiKey}`;
    if (exchange) quoteUrl += `&exchange=${encodeURIComponent(exchange)}`;

    const r = await fetch(quoteUrl);
    const data = await r.json();

    if (data.status === 'error' || data.code) {
      return new Response(JSON.stringify({ error: data.message || 'symbole introuvable' }), {
        status: 404, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const priceNative = parseFloat(data.close);
    let priceEur = priceNative;
    const currency = data.currency || 'EUR';

    if (currency !== 'EUR' && isFinite(priceNative)) {
      try {
        const fxR = await fetch(`https://api.twelvedata.com/exchange_rate?symbol=${currency}/EUR&apikey=${apiKey}`);
        const fx = await fxR.json();
        if (fx.rate) priceEur = priceNative * parseFloat(fx.rate);
      } catch (_e) { /* on retombe sur le prix natif si la conversion échoue */ }
    }

    return new Response(JSON.stringify({
      price_native: priceNative,
      currency,
      price_eur: Math.round(priceEur * 100) / 100,
      asof: data.datetime || new Date().toISOString().slice(0, 10),
      name: data.name || symbol,
    }), { headers: { ...cors, 'Content-Type': 'application/json' } });

  } catch (e) {
    return new Response(JSON.stringify({ error: String(e && e.message || e) }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
