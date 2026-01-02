document.addEventListener('DOMContentLoaded', async () => {
    const content = document.getElementById('main-content');
    const previewContainer = document.getElementById('preview-container');
    const previewGrid = document.getElementById('preview-grid');
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Retrieve storage data
    const storage = await chrome.storage.local.get(['supreme_page_title', 'supreme_last_manifest']);
    const safeTitle = storage.supreme_page_title || "Media_Supreme";

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            const yt = window.ytInitialPlayerResponse?.streamingData?.adaptiveFormats || [];
            const images = Array.from(document.querySelectorAll('img'))
                .map(i => i.src)
                .filter(src => src.startsWith('http') && !src.includes('base64'));
            return { yt, images, title: document.title };
        }
    }, (results) => {
        const data = results[0].result;

        const renderVideo = () => {
            setActiveTab('tab-video');
            previewContainer.style.display = 'none';
            const videos = data.yt.filter(f => f.mimeType.includes('video'));
            content.innerHTML = `<div class="media-title">${safeTitle}</div><div class="btn-group">` + 
                videos.map(v => `<button onclick="supremeDownload('${v.url}', 'mp4', '${v.qualityLabel}', '${safeTitle}')">${v.qualityLabel}</button>`).join('') + `</div>`;
            
            if (storage.supreme_last_manifest) {
                const hls = document.createElement('div');
                hls.className = 'hls-box';
                hls.innerText = "🔱 OPEN HLS MANIFEST";
                hls.onclick = () => window.open(storage.supreme_last_manifest);
                content.appendChild(hls);
            }
        };

        const renderAudio = () => {
            setActiveTab('tab-audio');
            previewContainer.style.display = 'none';
            const audio = data.yt.filter(f => f.mimeType.includes('audio'));
            content.innerHTML = `<div class="media-title">High Bitrate Audio</div><div class="btn-group">` + 
                audio.map(a => `<button onclick="supremeDownload('${a.url}', 'mp3', 'Audio', '${safeTitle}')">${Math.round(a.bitrate/1000)}kbps</button>`).join('') + `</div>`;
        };

        const renderGallery = () => {
            setActiveTab('tab-gallery');
            previewGrid.innerHTML = '';
            previewContainer.style.display = 'block';
            
            // Filter out icons and tiny images
            const largeImages = data.images.filter(img => !img.includes('icon') && !img.includes('logo'));
            
            largeImages.forEach(src => {
                const img = document.createElement('img');
                img.src = src;
                img.style = "width:100%; height:45px; object-fit:cover; border-radius:2px; border:1px solid #333;";
                previewGrid.appendChild(img);
            });

            content.innerHTML = `
                <div class="media-title">Gallery (${largeImages.length} items)</div>
                <button style="width:100%" id="bulk-dl">⚡ DOWNLOAD BATCH</button>
            `;
            document.getElementById('bulk-dl').onclick = () => {
                largeImages.forEach((img, i) => {
                    chrome.downloads.download({ url: img, filename: `Supreme_Gallery/${safeTitle}/img_${i}.jpg` });
                });
            };
        };

        document.getElementById('tab-video').onclick = renderVideo;
        document.getElementById('tab-audio').onclick = renderAudio;
        document.getElementById('tab-gallery').onclick = renderGallery;
        renderVideo();
    });

    function setActiveTab(id) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    }
});

window.supremeDownload = (url, ext, quality, title) => {
    chrome.downloads.download({ url: url, filename: `Supreme_Downloads/${title}_${quality}.${ext}` });
};
