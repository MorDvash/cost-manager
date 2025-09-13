// src/utils/rates.js
import { getSetting } from '../db/idb'

let cached = null
let cachedAt = 0

export async function getExchangeRates() {
    const now = Date.now()
    if (cached && now - cachedAt < 5 * 60 * 1000) { // קאש 5 דק׳
        return cached
    }
    const url = (await getSetting('ratesUrl')) || ''  // אם אין URL, נחזיר יחס 1:1
    if (!url) {
        cached = { USD:1, ILS:1, GBP:1, EURO:1 }
        cachedAt = now
        return cached
    }
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch exchange rates')
    const json = await res.json()
    cached = json
    cachedAt = now
    return json
}
