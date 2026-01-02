document.addEventListener('DOMContentLoaded', () => {
  const list = document.getElementById('media-list');

  // Request the latest sniffed data from content script or storage
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    chrome.scripting.executeScript({
      target: {tabId: tabs[0].id},
      func: getMediaData
    }, (results) => {
      if (results && results[0].result) {
        renderMedia(results[0].result);
      }
    });
  });

  function renderMedia(data) {
    list.innerHTML = '';
    data.forEach(item => {
      const card = document.createElement('div');
      card.className = 'media-card';
      
      let buttonsHtml = '';
      // Map detected formats to our buttons
      item.formats.forEach(fmt => {
        const isHigh = fmt.label.includes('1080') || fmt.label.includes('4K');
        buttonsHtml += `<button class="${isHigh ? 'high-res' : ''}" onclick="window.open('${fmt.url}')">${fmt.label}</button>`;
      });

      card.innerHTML = `
        <div class="title">${item.title}</div>
        <div class="res-grid">${buttonsHtml}</div>
      `;
      list.appendChild(card);
    });
  }
});

// This function runs inside the webpage to grab the YT/Insta objects
function getMediaData() {
  const ytData = window.ytInitialPlayerResponse?.streamingData?.adaptiveFormats;
  if (!ytData) return null;

  const formats = ytData.map(f => ({
    label: f.qualityLabel || (f.mimeType.includes('audio') ? 'Audio' : 'Unknown'),
    url: f.url
  })).filter(f => f.url);

  return [{
    title: document.title,
    formats: formats
  }];
}
