import { getSetting } from '../db/idb'

let cached = null
let cachedAt = 0

export async function getExchangeRates() {
    const now = Date.now()
    if (cached && now - cachedAt < 5 * 60 * 1000) return cached

    const url = (await getSetting('ratesUrl')) || 'https://open.er-api.com/v6/latest/USD'

    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch exchange rates')
    const data = await res.json()

    if ((data.base === 'USD' || data.base_code === 'USD') && data.rates) {
        const r = data.rates
        cached = {
            USD: 1,
            GBP: Number(r.GBP),
            EURO: Number(r.EUR ?? r.EURO),
            ILS: Number(r.ILS)
        }
    } else if (
        typeof data.USD === 'number' || typeof data.GBP === 'number' ||
        typeof data.EURO === 'number' || typeof data.EUR === 'number'
    ) {
        cached = {
            USD: Number(data.USD ?? 1),
            GBP: Number(data.GBP ?? 1),
            EURO: Number(data.EURO ?? data.EUR ?? 1),
            ILS: Number(data.ILS ?? 1)
        }
    } else {
        throw new Error('Unsupported rates format')
    }

    cachedAt = now
    return cached
}
