<p align="center">
  <img src="./icon/banner.png" alt="Media Extractor Supreme v1.5 Banner" width="100%">
</p>

# 🔱 Media Extractor Supreme
![Version](https://img.shields.io/badge/version-1.5-orange?style=for-the-badge)
![License](https://img.shields.io/badge/license-GPL--3.0-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active-success?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-Brave%20%7C%20Chrome-red?style=for-the-badge)

> **The ultimate web media liberator.** Effortlessly extract 4K video, high-bitrate audio, and full image galleries from any site on the planet.

---

### 📂 Repository Navigation
* 📜 [**Changelog**](./CHANGELOG.md) - Full version history.
* ⚖️ [**License**](./LICENSE) - Open-source GPL-3.0 details.
* 🛠️ [**Source Code**](./src/) - Core extension files.
* 📦 [**Releases**](../../releases) - Download the latest build.

---

### ⚡ Supreme Features
* **📺 4K/8K Video Sniffer:** Automatically detects and extracts adaptive streams (DASH/HLS) from YouTube and Vimeo.
* **🎵 Audio Separator:** Download raw high-bitrate audio (MP3/M4A) without the need for video data.
* **📸 Gallery Nuke:** One-click bulk download of all high-res images on any page with smart size filtering.
* **👻 Instagram Capture:** Surgical extraction of IG Stories and Feed posts via a custom hover-highlight system.
* **📋 Context Menu:** Right-click any image or video to instantly "Send to Supreme" for a direct download.
* **🏷️ Auto-Naming:** Uses AI-style title scraping to name your files properly based on the page content.
* **⚙️ Supreme Settings:** Fully customizable options page with sync-storage support across devices.

---

### 🛠️ Installation Guide
1. **Download:** Grab the latest `media-extractor-supreme.zip` from the [Releases](../../releases) tab.
2. **Extract:** Unzip the folder to a permanent location on your PC.
3. **Developer Mode:** Open `brave://extensions` or `chrome://extensions` and toggle **Developer Mode** on.
4. **Load:** Click **Load Unpacked** and select the `src` folder from the extracted files.

---

### Native media engine (C++, optional Fortran, Haskell CLI)

The browser UI can call a **local** HTTP API that fetches manifests with **system curl** (HTTPS) and parses **HLS** in C++. Optional **Fortran** supplies the stream-quality score; a small **Haskell** executable can shell out to the same binary.

**Requirements:** [CMake](https://cmake.org/) 3.16+, a C++17 compiler, and **`curl`** on `PATH` (`curl.exe` on Windows). Optional: **gfortran** for `-DUSE_FORTRAN=ON`. Optional: [Stack](https://docs.haskellstack.org/) for `haskell/`.

```text
cd cpp
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build
# Optional Fortran metrics:
# cmake -B build -DUSE_FORTRAN=ON
# cmake --build build

# CLI: JSON probe to stdout
./build/media-engine probe "https://example.com/master.m3u8"

# Local API for the extension (default port 17474)
./build/media-engine serve
```

**Extension:** open the options page and set **Native engine port** if needed. Click **Probe current tab URL** in the popup while `media-engine serve` is running.

**Haskell façade** (from repo root):

```text
cd haskell
stack build
stack exec media-supreme-hs -- probe "https://example.com/master.m3u8"
# Set MEDIA_ENGINE=C:\path\to\media-engine.exe if the binary is not beside the default ../cpp/build/...
```

---

### ⚖️ License
This project is licensed under the **GNU General Public License v3.0**. See the [LICENSE](./LICENSE) file for details.
