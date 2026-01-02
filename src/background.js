
// --- MEDIA SUPREME: NETWORK SNIFFER ---
chrome.webRequest?.onBeforeRequest.addListener(
  (details) => {
    const url = details.url;
    // Filters for common video stream manifests
    if (url.includes(".m3u8") || url.includes(".mpd") || url.includes("googlevideo.com/videoplayback")) {
      console.log("🔱 Supreme Found Media Stream:", url);
      chrome.storage.local.set({ lastMediaUrl: url });
    }
  },
  { urls: ["<all_urls>"] }
);

