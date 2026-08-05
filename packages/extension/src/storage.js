// chrome.storage.local wrapper with sync-readable in-memory cache.
// Call initStorage() once at startup; afterwards getSync(key) is safe to use
// anywhere without awaiting, while get/set always stay durable.

const GUEST_KEYS = ['outatlas-theme', 'reduce-motion', 'high-contrast'];

const _cache = {};

export async function initStorage() {
  return new Promise(resolve => {
    chrome.storage.local.get(GUEST_KEYS, result => {
      Object.assign(_cache, result);
      resolve();
    });
  });
}

export const store = {
  async get(key) {
    return new Promise(resolve => {
      chrome.storage.local.get(key, result => {
        _cache[key] = result[key] ?? null;
        resolve(_cache[key]);
      });
    });
  },
  async set(key, val) {
    _cache[key] = val;
    return new Promise(resolve => {
      chrome.storage.local.set({ [key]: val }, resolve);
    });
  },
  getSync(key) {
    return _cache[key] ?? null;
  }
};
