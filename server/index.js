/**
 * WizardingFrame Server
 * Serves the player web app, media files, and handles uploads.
 * Works on macOS, Windows, Linux, and Raspberry Pi.
 */

const express = require('express');
const http    = require('http');
const WebSocket = require('ws');
const path    = require('path');
const fs      = require('fs');
const multer  = require('multer');
const chokidar = require('chokidar');

const app    = express();
const server = http.createServer(app);
const wss    = new WebSocket.Server({ server });

const PORT        = process.env.PORT || 3000;
const MEDIA_DIR   = path.join(__dirname, '..', 'media');
const PLAYER_DIR  = path.join(__dirname, '..', 'player');
const CONFIG_FILE = path.join(__dirname, '..', 'config', 'frame.json');

const SUPPORTED_EXTENSIONS = ['.mp4', '.webm', '.mov', '.jpg', '.jpeg', '.png', '.gif', '.webp'];

[MEDIA_DIR, path.dirname(CONFIG_FILE)].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

app.use(express.static(PLAYER_DIR));
app.use('/media', express.static(MEDIA_DIR));
app.use(express.json());

app.get('/api/config', (req, res) => res.json(getConfig()));

app.post('/api/config', (req, res) => {
  const config = { ...getDefaultConfig(), ...req.body };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  broadcast({ type: 'config', data: config });
  res.json({ ok: true, config });
});

app.get('/api/media', (req, res) => {
  res.json({ files: getMediaFiles(), count: getMediaFiles().length });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, MEDIA_DIR),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._\- ]/g, '_');
    const ext  = path.extname(safe).toLowerCase();
    const base = path.basename(safe, ext);
    let name = safe, counter = 1;
    while (fs.existsSync(path.join(MEDIA_DIR, name))) {
      name = `${base}_${counter++}${ext}`;
    }
    cb(null, name);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(SUPPORTED_EXTENSIONS.includes(ext) ? null : new Error(`Unsupported: ${ext}`),
       SUPPORTED_EXTENSIONS.includes(ext));
  },
  limits: { fileSize: 500 * 1024 * 1024 }
});

app.post('/api/upload', (req, res) => {
  upload.array('files')(req, res, (err) => {
    if (err) return res.status(400).json({ ok: false, error: err.message });
    if (!req.files || !req.files.length) return res.status(400).json({ ok: false, error: 'No files' });
    const uploaded = req.files.map(f => f.filename);
    console.log('📥 Uploaded:', uploaded.join(', '));
    broadcast({ type: 'media-changed', files: getMediaFiles() });
    res.json({ ok: true, uploaded });
  });
});

app.delete('/api/media/:filename', (req, res) => {
  const filePath = path.join(MEDIA_DIR, req.params.filename);
  if (!path.resolve(filePath).startsWith(path.resolve(MEDIA_DIR)))
    return res.status(403).json({ ok: false, error: 'Forbidden' });
  if (!fs.existsSync(filePath))
    return res.status(404).json({ ok: false, error: 'Not found' });
  fs.unlinkSync(filePath);
  broadcast({ type: 'media-changed', files: getMediaFiles() });
  res.json({ ok: true });
});

chokidar.watch(MEDIA_DIR, { ignoreInitial: true, awaitWriteFinish: { stabilityThreshold: 1000 } })
  .on('add', () => broadcast({ type: 'media-changed', files: getMediaFiles() }))
  .on('unlink', () => broadcast({ type: 'media-changed', files: getMediaFiles() }));

wss.on('connection', (ws) => {
  console.log('🖼️  Player connected');
  ws.send(JSON.stringify({ type: 'init', config: getConfig(), files: getMediaFiles() }));
  ws.on('error', () => {});
});

function broadcast(data) {
  const msg = JSON.stringify(data);
  wss.clients.forEach(c => { if (c.readyState === WebSocket.OPEN) try { c.send(msg); } catch {} });
}

function getMediaFiles() {
  if (!fs.existsSync(MEDIA_DIR)) return [];
  return fs.readdirSync(MEDIA_DIR)
    .filter(f => SUPPORTED_EXTENSIONS.includes(path.extname(f).toLowerCase()) && !f.startsWith('.'))
    .sort()
    .map(f => ({ name: f, url: `/media/${encodeURIComponent(f)}`, type: getMediaType(f) }));
}

function getMediaType(f) {
  return ['.mp4', '.webm', '.mov'].includes(path.extname(f).toLowerCase()) ? 'video' : 'image';
}

function getConfig() {
  try { return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')); }
  catch { return getDefaultConfig(); }
}

function getDefaultConfig() {
  return {
    mode: 'wizarding', slideDuration: 12000, transitionDuration: 2000,
    effects: { grain: true, vignette: true, colorGrade: true, frameOverlay: true, scanlines: false },
    brightness: 0.9, grainIntensity: 0.04, vignetteIntensity: 0.6, shuffle: true, loop: true
  };
}

function getLocalIP() {
  const { networkInterfaces } = require('os');
  for (const iface of Object.values(networkInterfaces()))
    for (const alias of iface)
      if (alias.family === 'IPv4' && !alias.internal) return alias.address;
  return 'localhost';
}

server.listen(PORT, () => {
  const ip = getLocalIP();
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║          🪄  WizardingFrame               ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log(`\n  Local:    http://localhost:${PORT}`);
  console.log(`  Network:  http://${ip}:${PORT}  ← open on your phone to upload`);
  console.log(`  Upload:   http://localhost:${PORT}/upload.html`);
  console.log(`\n  📁 Drop media into: ${MEDIA_DIR}`);
  console.log('\n  Press Ctrl+C to stop\n');

  if (process.env.NO_OPEN !== '1' && process.env.NODE_ENV !== 'production') {
    try { require('open')(`http://localhost:${PORT}`); } catch {}
  }
});

process.on('SIGINT', () => { console.log('\n👋 Shutting down...'); server.close(); process.exit(0); });
