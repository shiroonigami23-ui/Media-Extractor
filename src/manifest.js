{
  "manifest_version": 3,
  "name": "Media Extractor Supreme",
  "version": "1.1",
  "description": "Extract 4K video and high-res audio from YT, Instagram, and more.",
  "permissions": [
    "declarativeNetRequest",
    "storage",
    "activeTab",
    "scripting",
    "downloads"
  ],
  "host_permissions": ["<all_urls>"],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html"
  },
  "content_scripts": [
    {
      "matches": ["*://*.youtube.com/*", "*://*.instagram.com/*", "*://*.vimeo.com/*"],
      "js": ["content.js"],
      "run_at": "document_end"
    }
  ],
  "declarative_net_request": {
    "rule_resources": [{
      "id": "ruleset_1",
      "enabled": true,
      "path": "rules.json"
    }]
  }
}
