chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create('refresh', { periodInMinutes: 1440 });
});

chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== 'refresh') return;
  const { etag } = await chrome.storage.local.get('etag');
  try {
    const res = await fetch('https://api.outatlas.com/v1/destinations', {
      headers: etag ? { 'If-None-Match': etag } : {}
    });
    if (res.ok) {
      const data = await res.json();
      chrome.storage.local.set({ destinations: data, etag: res.headers.get('ETag') });
    }
  } catch (e) {
    console.warn('[OutAtlas BG] refresh failed:', e.message);
  }
});
