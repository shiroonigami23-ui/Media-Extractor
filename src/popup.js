document.addEventListener('DOMContentLoaded', async () => {
    const content = document.getElementById('main-content');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // 1. Get Data from Page
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            const yt = window.ytInitialPlayerResponse?.streamingData?.adaptiveFormats || [];
            const images = Array.from(document.querySelectorAll('img')).map(i => i.src).filter(src => src.startsWith('http'));
            return { yt, images, title: document.title };
        }
    }, (results) => {
        const data = results[0].result;
        renderVideo(data); // Default view

        // Tab Switching Logic
        document.getElementById('tab-video').onclick = () => renderVideo(data);
        document.getElementById('tab-audio').onclick = () => renderAudio(data);
        document.getElementById('tab-gallery').onclick = () => renderGallery(data);
    });

    function renderVideo(data) {
        setActiveTab('tab-video');
        const videos = data.yt.filter(f => f.mimeType.includes('video'));
        content.innerHTML = `<div class="media-title">${data.title}</div><div class="btn-group">` + 
            videos.map(v => `<button onclick="download('${v.url}', 'video_${v.qualityLabel}.mp4')">${v.qualityLabel}</button>`).join('') + `</div>`;
    }

    function renderAudio(data) {
        setActiveTab('tab-audio');
        const audio = data.yt.filter(f => f.mimeType.includes('audio'));
        content.innerHTML = `<div class="media-title">High Bitrate Audio</div><div class="btn-group">` + 
            audio.map(a => `<button onclick="download('${a.url}', 'audio_supreme.mp3')">${Math.round(a.bitrate/1000)}kbps</button>`).join('') + `</div>`;
    }

    function renderGallery(data) {
        setActiveTab('tab-gallery');
        content.innerHTML = `
            <div class="gallery-stats">Found ${data.images.length} images on this page.</div>
            <button style="width:100%" id="bulk-dl">⚡ DOWNLOAD ALL AS BATCH</button>
        `;
        document.getElementById('bulk-dl').onclick = () => {
            data.images.forEach((img, i) => {
                chrome.downloads.download({ url: img, filename: `Gallery/img_${i}.jpg` });
            });
        };
    }

    function setActiveTab(id) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    }
});

// Helper for downloads
window.download = (url, name) => {
    chrome.downloads.download({ url: url, filename: name });
};
