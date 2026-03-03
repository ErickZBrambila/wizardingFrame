# 🫐 Raspberry Pi Setup Guide

Turn a Raspberry Pi into a dedicated, always-on WizardingFrame.

## What You'll Need

- Raspberry Pi 4 or 5 (4GB RAM recommended)
- MicroSD card (16GB+)
- Display (any HDMI monitor, or Pi-specific touchscreen)
- Power supply
- Internet connection (for initial setup)

## Step 1: Flash Raspberry Pi OS

Download **Raspberry Pi Imager** from [raspberrypi.com](https://raspberrypi.com/software).

Choose:
- **OS**: Raspberry Pi OS Lite (64-bit) — no desktop needed, we run our own
- Or: Raspberry Pi OS Desktop if you want a GUI for debugging

Enable SSH and set your WiFi credentials in the imager settings before flashing.

## Step 2: SSH In & Update

```bash
ssh pi@raspberrypi.local
sudo apt update && sudo apt upgrade -y
```

## Step 3: Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Should be v20+
```

## Step 4: Install WizardingFrame

```bash
cd ~
git clone https://github.com/yourusername/wizardingframe.git
cd wizardingframe
npm install
```

## Step 5: Install Chromium (for the display)

```bash
sudo apt install -y chromium-browser xorg openbox unclutter
```

## Step 6: Auto-Start on Boot

Create a systemd service for the Node server:

```bash
sudo nano /etc/systemd/system/wizardingframe.service
```

```ini
[Unit]
Description=WizardingFrame Server
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/wizardingframe
ExecStart=/usr/bin/node server/index.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production PORT=3000

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable wizardingframe
sudo systemctl start wizardingframe
```

## Step 7: Auto-Start Chromium in Kiosk Mode

Create `~/.config/openbox/autostart`:

```bash
mkdir -p ~/.config/openbox
nano ~/.config/openbox/autostart
```

```bash
# Hide cursor
unclutter -idle 0.5 -root &

# Wait for server to start
sleep 5

# Launch Chromium in kiosk mode
chromium-browser \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --no-first-run \
  --check-for-update-interval=31536000 \
  --disable-translate \
  --autoplay-policy=no-user-gesture-required \
  http://localhost:3000 &
```

## Step 8: Configure Display to Auto-Start X

```bash
sudo nano /etc/rc.local
```

Add before `exit 0`:
```bash
su - pi -c "startx" &
```

## Step 9: Prevent Screen Sleep

```bash
sudo nano /etc/xdg/openbox/autostart
```

Add:
```bash
xset s off
xset s noblank
xset -dpms
```

## Step 10: Add Your Media

From your Mac/PC, copy files to the Pi:

```bash
# From your computer:
scp -r ~/Photos/WizardingFrame/* pi@raspberrypi.local:~/wizardingframe/media/
```

Or use the pipeline to convert Live Photos first:
```bash
node pipeline/convert.js --input ~/Photos/LivePhotos --output ./ready
scp -r ./ready/* pi@raspberrypi.local:~/wizardingframe/media/
```

## Reboot & Enjoy 🪄

```bash
sudo reboot
```

The frame will boot directly into WizardingFrame. ✨

## Tips

- **WiFi uploads**: Visit `http://raspberrypi.local:3000` from your phone to upload directly
- **Rotate display**: Add `display_rotate=1` to `/boot/config.txt` for portrait orientation
- **Overclock** (Pi 4): Add to `/boot/config.txt` for smoother effects on 4K displays:
  ```
  over_voltage=2
  arm_freq=1800
  ```
