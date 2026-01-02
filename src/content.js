// --- SUPREME CONTENT: AUTO-NAMER & INJECTORS ---

const getSupremeTitle = () => {
    const h1 = document.querySelector('h1')?.innerText;
    const title = document.title;
    return (h1 || title || "Media").replace(/[^a-z0-9]/gi, '_').substring(0, 50);
};

const initExtractor = () => {
    const safeTitle = getSupremeTitle();
    chrome.storage.local.set({ supreme_page_title: safeTitle });

    if (window.location.host.includes('youtube.com')) injectYTButtons();
    if (window.location.host.includes('instagram.com')) extractInstagram();
    injectFloatingSniffer();
};

const extractInstagram = () => {
    const media = document.querySelectorAll('img[srcset], video:not([supreme-tagged])');
    media.forEach(el => {
        el.setAttribute('supreme-tagged', 'true');
        el.onmouseenter = () => { el.style.border = "4px solid #ff3e00"; el.style.cursor = "zoom-in"; };
        el.onmouseleave = () => el.style.border = "none";
        el.onclick = () => {
            const mediaUrl = el.src || el.currentSrc;
            if (mediaUrl) {
                chrome.storage.local.set({ lastSniffedMedia: mediaUrl });
                alert("🔱 Supreme: Asset captured!");
            }
        };
    });
};

const injectYTButtons = () => {
    const target = document.querySelector('#top-level-buttons-computed');
    if (target && !document.getElementById('supreme-yt-dl')) {
        const btn = document.createElement('button');
        btn.id = 'supreme-yt-dl';
        btn.innerHTML = '⚡ EXTRACT';
        btn.style = "background:#ff3e00; color:#fff; border:none; padding:8px 16px; border-radius:18px; font-weight:bold; cursor:pointer; margin-left:8px;";
        btn.onclick = () => alert("🔱 Supreme: Use Dashboard for 4K options.");
        target.appendChild(btn);
    }
};

const injectFloatingSniffer = () => {
    if (document.getElementById('supreme-floater')) return;
    const floater = document.createElement('div');
    floater.id = 'supreme-floater';
    floater.innerHTML = '📂';
    floater.style = "position:fixed; bottom:20px; right:20px; z-index:9999; background:#ff3e00; color:white; width:50px; height:50px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:24px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);";
    floater.onclick = () => {
        const video = document.querySelector('video');
        if (video?.src) window.open(video.src, '_blank');
        else alert("No direct video tag found. Open dashboard for advanced streams.");
    };
    document.body.appendChild(floater);
};

setInterval(initExtractor, 2000);
