# 🪄 WizardingFrame

> *"The portraits move here." — Every Hogwarts student, ever.*

WizardingFrame turns any screen into a living, breathing magical portrait — just like the moving paintings in Harry Potter. Display your photos, Apple Live Photos, and short videos with cinematic effects that make them look like they belong on the walls of Hogwarts.

[![License: MIT](https://img.shields.io/badge/License-MIT-gold.svg)](LICENSE)
[![Open Source](https://img.shields.io/badge/Open-Source-brightgreen.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-blue.svg)]()

---

## ✨ What It Does

- 🖼️ Seamless looping slideshow of photos & videos  
- 🎞️ Cinematic effects: film grain, vignette, warm color grading, ornate frame overlays  
- 📱 Converts Apple Live Photos into smooth looping animations  
- 🍎 **Botanica Mode** — ambient fruit, plants & nature (perfect screensaver)  
- 🧙 **Wizarding Mode** — full Harry Potter portrait aesthetic  
- 🌊 **Zen / Family modes** — more coming  
- 🔴 **Live reload** — drop a file in the `media/` folder and it appears instantly, no restart  

## 🖥️ Runs On Everything

| Device | How |
|--------|-----|
| **Raspberry Pi 4/5** + display | Chromium kiosk mode (recommended) |
| **Old iPad / Android tablet** | PWA — add to home screen |
| **Any laptop / desktop** | Just open a browser tab |
| Smart TV / Fire Stick | Browser tab |

---

## 🚀 Quick Start

### macOS / Linux
```bash
git clone https://github.com/yourusername/wizardingframe.git
cd wizardingframe
bash setup.sh
npm start
```

### Windows (PowerShell)
```powershell
git clone https://github.com/yourusername/wizardingframe.git
cd wizardingframe
.\setup.ps1
npm start
```
> If you see an execution policy error, first run:  
> `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### Then
1. Drop photos/videos into the `media/` folder  
2. Open **http://localhost:3000** — the browser opens automatically  
3. To upload from your phone: open **http://[your-computer-ip]:3000/upload.html**  

---

## 📱 Upload From Your Phone

Visit the URL shown in the terminal (e.g. `http://192.168.1.42:3000`) from any device on your WiFi network. The upload page has drag-and-drop and shows your current media library.

## 🍎 Convert Apple Live Photos

Live Photos become seamless bounce-loop videos — the real Harry Potter portrait effect.

### Step 1 — Export from your Mac's Photos app (preserves the motion)

> **Important:** AirDrop sends only the still HEIC — the motion component is stripped.
> You must export as Unmodified Original to keep both files.

1. Open **Photos** on your Mac
2. Select the Live Photos you want
3. **File → Export → Export Unmodified Original**
4. Save them anywhere (e.g. Desktop)
5. Move/copy the exported folder contents into `media/`

Each Live Photo exports as a pair: `IMG_XXXX.HEIC` + `IMG_XXXX.MOV`

### Step 2 — Install ffmpeg (one time)

```bash
# macOS
brew install ffmpeg

# Raspberry Pi / Linux
sudo apt install ffmpeg
```

### Step 3 — Run the pipeline

```bash
npm run pipeline
```

That's it. The pipeline:
- Detects HEIC + MOV pairs automatically
- Converts each pair into a smooth `_loop.mp4` bounce video
- Deletes the originals so only the loop plays
- Your frame reloads instantly (no restart needed)

> For custom input/output paths: `node pipeline/convert.js --input ./my-folder --output ./media`

---

## 📁 Project Structure

```
wizardingframe/
├── server/          # Node.js — serves media, handles uploads, WebSocket
├── player/          # The display web app
│   ├── effects/     # Film grain + vignette canvas renderer
│   ├── modes/       # Wizarding, Botanica modes (frame overlays + color grades)
│   ├── styles/      # CSS (animations, crossfade, mode filters)
│   ├── index.html   # Main frame display
│   └── upload.html  # Upload UI (phone-friendly)
├── pipeline/        # ffmpeg: Live Photos → looping video
├── config/          # frame.json — your settings
├── docs/            # Raspberry Pi + iPad setup guides
├── media/           # Drop your content here (gitignored)
├── setup.sh         # Setup script for macOS/Linux/Pi
└── setup.ps1        # Setup script for Windows
```

---

## 🗺️ Roadmap

### Phase 1 — Foundation ✅
- [x] Project scaffold + architecture  
- [x] Core web player with smooth crossfade  
- [x] Film grain + vignette effects  
- [x] Wizarding Mode (gold frame overlay + warm color grade)  
- [x] Botanica Mode (wood frame + botanical tones)  
- [x] Live folder watching (drop file → appears on frame)  
- [x] Upload page (phone-friendly, drag & drop)  
- [x] macOS + Windows + Pi setup scripts  

### Phase 2 — Content Pipeline
- [ ] Live Photo → looping video converter (ffmpeg wrapper)  
- [ ] Web UI for managing config / switching modes  
- [ ] HEIC/HEIF image support  

### Phase 3 — Hardware
- [ ] Raspberry Pi one-command installer  
- [ ] iPad PWA improvements  

### Phase 4 — Community
- [ ] Community frame overlay themes  
- [ ] Zen + Family mode refinements  
- [ ] Mobile companion app  

---

## 🤝 Contributing

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md). All skill levels welcome!

- 🎨 Designers: SVG frame overlays  
- 💻 Developers: new effects, modes, hardware support  
- 📝 Docs: hardware guides, translations  

## 📄 License

MIT — free for everyone. Share the magic. ✨
