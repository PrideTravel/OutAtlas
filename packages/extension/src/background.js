chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('refresh', { periodInMinutes: 1440 });
});

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

const CDN_URL = 'https://out-atlas-extension.vercel.app/destinations.json';

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== 'refresh') return;
  const { etag } = await chrome.storage.local.get('etag');
  try {
    const res = await fetch(CDN_URL, {
      headers: etag ? { 'If-None-Match': etag } : {}
    });
    if (res.status === 304) return;
    if (res.ok) {
      const data = await res.json();
      chrome.storage.local.set({ destinations: data, etag: res.headers.get('ETag') });
    }
  } catch (e) {
    console.warn('[OutAtlas BG] refresh failed:', e.message);
  }
});
