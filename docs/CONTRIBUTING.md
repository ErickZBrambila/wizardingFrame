# 🤝 Contributing to WizardingFrame

Welcome to the WizardingFrame community! We're building the most magical open source photo frame platform together. Every contribution matters.

## Ways to Contribute

### 🎨 Design: Frame Overlays & Themes
The most visible contribution! Add new frame artwork:
- Create SVG frame overlays (see `player/modes/wizarding.js` for the format)
- Design new visual themes (color grades, effect combos)
- Ideas: Victorian, Minimalist, Sci-Fi, Watercolor, Art Nouveau...

### 💻 Code: Features & Fixes
- New display modes (Zen, Aquarium, Space, etc.)
- Hardware support (new TV sticks, single-board computers)
- Upload UI improvements
- Performance optimizations for lower-end hardware

### 📝 Documentation
- Hardware setup guides for new devices
- Translations (make it accessible globally!)
- Tutorial videos and blog posts

### 🧪 Testing
- Try it on new hardware and report results
- Test edge cases (large files, slow networks, many photos)
- Report bugs via GitHub Issues

## Development Setup

```bash
git clone https://github.com/yourusername/wizardingframe.git
cd wizardingframe
npm install
npm run dev   # Server with auto-reload
```

Open `http://localhost:3000` — drop test media into `media/` folder.

## Adding a New Mode

1. Create `player/modes/yourmode.js` following the pattern in `botanica.js`
2. Add your mode to `server/index.js` default config validation
3. Add CSS filter in `player/styles/player.css` under `body.mode-yourmode`
4. Test with a variety of media types
5. Submit a PR with before/after screenshots!

## Code Style

- ES6+ JavaScript, no build step required (keeps it simple for Pi deployment)
- Comment your effects — explain *why*, not just *what*
- Keep the player performant: it runs on a $35 Raspberry Pi
- Prefer CSS animations over JS where possible

## Submitting a PR

1. Fork the repo
2. Create a branch: `git checkout -b feature/my-new-mode`
3. Make your changes
4. Test on at least one real device (even a browser counts!)
5. Submit a PR with a description of what you changed and why

## Community Guidelines

- Be kind, be patient, be curious
- Beginner questions are welcome — we all started somewhere
- Share your builds! Tag us on social with #WizardingFrame

Thank you for helping make magic more accessible. ✨
