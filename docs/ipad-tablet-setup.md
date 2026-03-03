# 📱 iPad / Tablet Setup Guide

Repurpose an old iPad or Android tablet as a WizardingFrame using PWA + kiosk mode.

## iPad Setup (iOS)

### Requirements
- iPad running iOS 16.4+ (for full PWA support)
- A computer running WizardingFrame on your local network

### Step 1: Get Your Computer's IP Address

```bash
# macOS
ipconfig getifaddr en0

# Linux
hostname -I | awk '{print $1}'
```

### Step 2: Install as PWA on iPad

1. On the iPad, open **Safari** (must be Safari for PWA support)
2. Navigate to `http://YOUR_COMPUTER_IP:3000`
3. Tap the **Share** button (square with arrow)
4. Tap **"Add to Home Screen"**
5. Name it "WizardingFrame" and tap **Add**

### Step 3: Enable Kiosk / Guided Access Mode

To lock the iPad to WizardingFrame only:

1. Go to **Settings → Accessibility → Guided Access**
2. Enable **Guided Access**
3. Set a passcode (so kids/guests can't exit)
4. Open WizardingFrame from the home screen
5. **Triple-click the home button** (or side button on newer iPads)
6. Tap **Start** — the iPad is now locked to WizardingFrame

### Step 4: Prevent Screen Sleep

1. **Settings → Display & Brightness → Auto-Lock → Never**
2. If using an iPad as a permanent display, consider a **powered stand**

### Step 5: Upload Media from Your iPhone

With WizardingFrame running, visit:
```
http://YOUR_COMPUTER_IP:3000/upload
```

You can:
- Upload photos and videos directly from your iPhone camera roll
- Export Live Photos as videos and upload them
- The frame updates in real-time — no restart needed

---

## Android Tablet Setup

### Step 1: Install as PWA

1. Open **Chrome** on the tablet
2. Navigate to `http://YOUR_COMPUTER_IP:3000`
3. Tap the **three-dot menu → Add to Home Screen**
4. Launch from the home screen — it opens full screen

### Step 2: Kiosk Mode

For Android, use **Fully Kiosk Browser** (free on Play Store):
1. Install Fully Kiosk Browser
2. Set start URL: `http://YOUR_COMPUTER_IP:3000`
3. Enable **Keep Screen On** in settings
4. Enable **Kiosk Mode** to lock to the app

### Alternatively: Screen Pinning (built-in)

1. **Settings → Security → Screen Pinning** (enable it)
2. Open WizardingFrame in Chrome
3. Tap the recents button, find the app card, tap the pin icon

---

## Tips for Both Platforms

- **Portrait mode**: Most frames look best landscape, but if you have a portrait frame, enable rotation lock
- **Brightness**: Set to ~70% for a magical, dim portrait aesthetic
- **Night mode**: Consider using Scheduled Automations to dim the display at night
- **Power**: Use a quality USB-C cable + charger to keep the tablet permanently charged
