// src/utils/rates.js
import { getSetting } from '../db/idb'

let cached = null
let cachedAt = 0

export async function getExchangeRates() {
    const now = Date.now()
    if (cached && now - cachedAt < 5 * 60 * 1000) return cached

    const url = (await getSetting('ratesUrl')) || ''
    if (!url) {
        // ברירת מחדל: 1:1 (יחידות מטבע לכל 1 USD)
        cached = { USD: 1, GBP: 1, EURO: 1, ILS: 1 }
        cachedAt = now
        return cached
    }

    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch exchange rates')
    const data = await res.json()

    // מצפים ל-base USD בפורמט API סטנדרטי: { base:"USD"/base_code:"USD", rates:{ILS, GBP, EUR} }
    if ((data.base === 'USD' || data.base_code === 'USD') && data.rates) {
        const r = data.rates
        cached = {
            USD: 1,
            GBP: Number(r.GBP),                  // GBP per 1 USD
            EURO: Number(r.EUR ?? r.EURO),       // EUR per 1 USD
            ILS: Number(r.ILS)                   // ILS per 1 USD
        }
    } else if (
        // אם כבר הגיע בפורמט “מוכן” (נדיר), נשתמש בו כמו שהוא
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
