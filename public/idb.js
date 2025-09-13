;(function (global) {
    'use strict'

    const _state = {
        rates: { USD: 1, ILS: 1, GBP: 1, EURO: 1 }
    }

    function _open(name, version) {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(name, version)

            req.onupgradeneeded = (e) => {
                const db = e.target.result
                if (!db.objectStoreNames.contains('costs')) {
                    db.createObjectStore('costs', { keyPath: 'id', autoIncrement: true })
                }
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' })
                }
            }

            req.onsuccess = () => resolve(req.result)
            req.onerror = () => reject(req.error)
        })
    }

    function _ensureCostShape(cost) {
        if (typeof cost?.sum !== 'number' || isNaN(cost.sum)) {
            throw new Error('sum must be a number')
        }
        ;['currency', 'category', 'description'].forEach((k) => {
            if (!cost[k] || typeof cost[k] !== 'string') {
                throw new Error(`${k} must be a non-empty string`)
            }
        })
    }

    function _convert(sum, from, to, rates) {
        const rFrom = rates[from]
        const rTo = rates[to]
        if (!rFrom || !rTo) {
            return sum
        }
        const usd = sum / rFrom
        return usd * rTo
    }

    const idb = {
        setExchangeRates(rates) {
            _state.rates = { ..._state.rates, ...rates }
        },

        openCostsDB(databaseName, databaseVersion) {
            return _open(databaseName, databaseVersion).then((db) => {
                return {
                    addCost(cost) {
                        _ensureCostShape(cost)
                        const now = new Date()
                        const toStore = {
                            ...cost,
                            dateISO: now.toISOString(),
                            year: now.getFullYear(),
                            month: now.getMonth() + 1,
                            day: now.getDate()
                        }

                        return new Promise((resolve, reject) => {
                            const tx = db.transaction('costs', 'readwrite')
                            const store = tx.objectStore('costs')
                            const req = store.add(toStore)
                            req.onsuccess = () =>
                                resolve({
                                    sum: cost.sum,
                                    currency: cost.currency,
                                    category: cost.category,
                                    description: cost.description
                                })
                            req.onerror = () => reject(req.error)
                        })
                    },

                    getReport(year, month, currency) {
                        return new Promise((resolve, reject) => {
                            const tx = db.transaction('costs', 'readonly')
                            const store = tx.objectStore('costs')
                            const req = store.getAll()

                            req.onsuccess = () => {
                                const all = req.result || []
                                const filtered = all.filter((c) => c.year === year && c.month === month)

                                const costsOut = filtered.map((c) => ({
                                    sum: Number(_convert(Number(c.sum), c.currency, currency, _state.rates).toFixed(2)),
                                    currency: currency,
                                    category: c.category,
                                    description: c.description,
                                    Date: { day: c.day }
                                }))

                                const total = costsOut.reduce((acc, c) => acc + c.sum, 0)

                                resolve({
                                    year,
                                    month,
                                    costs: costsOut,
                                    total: { currency, total: Number(total.toFixed(2)) }
                                })
                            }

                            req.onerror = () => reject(req.error)
                        })
                    }
                }
            })
        }
    }

    global.idb = idb
})(window)
