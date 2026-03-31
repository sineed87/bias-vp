export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(400).json({ error: 'API ključ ni nastavljen.' });
  const { instrument } = req.body;
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        system: 'Trading analyst. Search X/Twitter and trading communities for latest sentiment. Respond in Slovenian. Be very brief.',
        messages: [{
          role: 'user',
          content: `Poišči najnovejši sentiment za ${instrument} na X/Twitterju in med day trade influencerji (zadnje 24h).

Odgovori SAMO v tej obliki (brez razlag):
SENTIMENT: [Bikovni / Medvedji / Mešan]
POZICIONIRANJE: Nakupi [X]% · Prodaje [Y]%
MNENJE SKUPNOSTI: [1 stavek]
INFLUENCERJI:
• [ime/handle]: [kratek pogled - max 10 besed]
• [ime/handle]: [kratek pogled - max 10 besed]
OPOZORILO: [1 stavek o glavnem tveganju]`
        }]
      })
    });
    const data = await response.json();
    const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n') || 'Ni podatkov.';
    res.json({ sentiment: text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
