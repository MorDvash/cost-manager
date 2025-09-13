let ratesProvider = null; //  פונקציה שתספק שערים {USD, ILS, GBP, EURO}

export function setRatesProvider(fn) {
  ratesProvider = fn;
}

export async function openCostsDB(name = "costsdb", version = 1) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("costs")) {
        db.createObjectStore("costs", { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// שמירת/קריאת הגדרה
export async function saveSetting(key, value) {
  const db = await openCostsDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("settings", "readwrite");
    tx.objectStore("settings").put({ key, value });
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}
export async function getSetting(key) {
  const db = await openCostsDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("settings", "readonly");
    const req = tx.objectStore("settings").get(key);
    req.onsuccess = () => resolve(req.result?.value);
    req.onerror = () => reject(req.error);
  });
}

export async function addCost(cost) {
  const db = await openCostsDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("costs", "readwrite");
    const store = tx.objectStore("costs");

    const newCost = {
      ...cost,
      date: new Date().toISOString(),
    };

    const req = store.add(newCost);
    req.onsuccess = () => resolve(newCost);
    req.onerror = () => reject(req.error);
  });
}

function convert(sum, from, to, rates) {
  if (!rates || !rates[from] || !rates[to]) return Number(sum);
  const usd = Number(sum) / rates[from];  // יחס מהמסמך: {USD:1, GBP:1.8, EURO:0.7, ILS:3.4}
  return usd * rates[to];
}

export async function getReport(year, month, currency) {
  const db = await openCostsDB();
  const rates = ratesProvider ? await ratesProvider() : null;

  return new Promise((resolve, reject) => {
    const tx = db.transaction("costs", "readonly");
    const store = tx.objectStore("costs");
    const req = store.getAll();

    req.onsuccess = () => {
      const all = req.result || [];

      const filtered = all.filter((c) => {
        const d = new Date(c.date);
        return d.getFullYear() === year && d.getMonth() + 1 === month;
      });

      const costsOut = filtered.map((c) => ({
        sum: Number(convert(c.sum, c.currency, currency, rates).toFixed(2)),
        currency,
        category: c.category,
        description: c.description,
        Date: { day: new Date(c.date).getDate() },
      }));

      const total = costsOut.reduce((s, c) => s + c.sum, 0);

      resolve({
        year,
        month,
        costs: costsOut,
        total: { currency, total: Number(total.toFixed(2)) },
      });
    };

    req.onerror = () => reject(req.error);
  });
}
