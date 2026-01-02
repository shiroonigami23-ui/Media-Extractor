// --- SUPREME BACKGROUND: CONTEXT & SNIFFER ---

// Create Context Menu on Install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "supreme-capture",
    title: "🔱 Send to Supreme",
    contexts: ["image", "video", "link"]
  });
});

// Handle Context Menu Clicks (Direct Download)
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const mediaUrl = info.srcUrl || info.linkUrl;
  if (mediaUrl) {
    chrome.downloads.download({
      url: mediaUrl,
      filename: `Supreme_Capture/Capture_${Date.now()}.jpg`
    });
  }
});

// HLS/M3U8 Sniffer Logic
chrome.webRequest?.onBeforeRequest.addListener(
  (details) => {
    const url = details.url;
    if (url.includes(".m3u8") || url.includes(".mpd") || url.includes("videoplayback")) {
      chrome.storage.local.set({ supreme_last_manifest: url });
    }
  },
  { urls: ["<all_urls>"] }
);
