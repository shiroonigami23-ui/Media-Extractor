// --- SUPREME BACKGROUND: CONTEXT & SNIFFER ---

// Wrap context menu creation with a settings check
chrome.storage.sync.get('enable_context', (settings) => {
    if (settings.enable_context) {
        chrome.contextMenus.create({
            id: "supreme-capture",
            title: "🔱 Send to Supreme",
            contexts: ["image", "video", "link"]
        });
    }
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

// HLS/M3U8 Sniffer Logic (Always Active)
chrome.webRequest?.onBeforeRequest.addListener(
    (details) => {
        const url = details.url;
        if (url.includes(".m3u8") || url.includes(".mpd") || url.includes("videoplayback")) {
            chrome.storage.local.set({ supreme_last_manifest: url });
        }
    },
    { urls: ["<all_urls>"] }
);
