import { getSetting } from '../db/idb';

// 5-minute cache for exchange rates to reduce API calls
let cached = null;
let cachedAt = 0;

export async function getExchangeRates() {
    const now = Date.now();
    // Return cached data if less than 5 minutes old
    if (cached && now - cachedAt < 5 * 60 * 1000) return cached;

    const url = (await getSetting('ratesUrl')) || 'https://abelski.com/temp/data.php';

    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch exchange rates');
    const data = await res.json();

    // Handle standard API format: { base: "USD", rates: { GBP: 0.8, ... } }
    if ((data.base === 'USD' || data.base_code === 'USD') && data.rates) {
        const r = data.rates;
        cached = {
            USD: 1,
            GBP: Number(r.GBP),
            EURO: Number(r.EUR ?? r.EURO),
            ILS: Number(r.ILS)
        };
    // Handle flat format: { USD: 1, GBP: 0.8, ... }
    } else if (
        typeof data.USD === 'number' || typeof data.GBP === 'number' ||
        typeof data.EURO === 'number' || typeof data.EUR === 'number'
    ) {
        cached = {
            USD: Number(data.USD ?? 1),
            GBP: Number(data.GBP ?? 1),
            EURO: Number(data.EURO ?? data.EUR ?? 1),
            ILS: Number(data.ILS ?? 1)
        };
    } else {
        throw new Error('Unsupported rates format');
    }

    cachedAt = now;
    return cached;
}
