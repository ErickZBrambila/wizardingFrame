/**
 * WizardingFrame — Core Player
 * Orchestrates the slideshow, handles transitions, connects to server.
 */

class WizardingFramePlayer {
  constructor() {
    this.config = null;
    this.media  = [];
    this.currentIndex = 0;
    this.activeSlot   = 'a';
    this.slideTimer   = null;
    this.ws           = null;
    this.isTransitioning = false;

    this.slotA      = document.getElementById('slot-a');
    this.slotB      = document.getElementById('slot-b');
    this.emptyState = document.getElementById('empty-state');
    this.modeLabel  = document.getElementById('mode-label');
    this.fxCanvas   = document.getElementById('fx-canvas');

    this.init();
  }

  async init() {
    await this.fetchConfig();
    await this.fetchMedia();
    this.connectWebSocket();
    this.initEffects();
    this.applyMode();
    this.start();
  }

  // ─── Data ──────────────────────────────────────────────────────────────────

  async fetchConfig() {
    try {
      const res = await fetch('/api/config');
      this.config = await res.json();
    } catch {
      this.config = this.defaultConfig();
    }
    document.documentElement.style.setProperty('--transition', `${this.config.transitionDuration}ms`);
  }

  async fetchMedia() {
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      this.media = data.files || [];
      if (this.config.shuffle) this.shuffle(this.media);
    } catch {
      this.media = [];
    }
  }

  // ─── WebSocket ─────────────────────────────────────────────────────────────

  connectWebSocket() {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.ws = new WebSocket(`${protocol}//${location.host}`);

    this.ws.onmessage = (event) => {
      try { this.handleMessage(JSON.parse(event.data)); } catch {}
    };

    this.ws.onclose = () => setTimeout(() => this.connectWebSocket(), 5000);
    this.ws.onerror = () => {};
  }

  handleMessage(msg) {
    switch (msg.type) {
      case 'init':
        this.config = msg.config;
        this.media  = msg.files || [];
        if (this.config.shuffle) this.shuffle(this.media);
        this.applyMode();
        this.start();
        break;
      case 'media-changed':
        this.media = msg.files || [];
        if (this.config.shuffle) this.shuffle(this.media);
        if (this.media.length > 0 && !this.slideTimer) {
          this.hideEmptyState();
          this.currentIndex = 0;
          this.start();
        } else if (this.media.length === 0) {
          this.showEmptyState();
        }
        break;
      case 'config':
        const prevMode = this.config.mode;
        this.config = msg.data;
        document.documentElement.style.setProperty('--transition', `${this.config.transitionDuration}ms`);
        if (prevMode !== this.config.mode) {
          this.applyMode();
          this.flashModeLabel();
        }
        if (this.grain) this.grain.updateConfig(this.config);
        break;
    }
  }

  // ─── Slideshow ─────────────────────────────────────────────────────────────

  start() {
    if (this.media.length === 0) { this.showEmptyState(); return; }
    this.hideEmptyState();
    if (this.slideTimer) { clearTimeout(this.slideTimer); this.slideTimer = null; }
    this.loadSlide(this.currentIndex);
  }

  async loadSlide(index) {
    if (this.media.length === 0) return;
    this.isTransitioning = true;

    const item        = this.media[index % this.media.length];
    const incomingEl  = this.activeSlot === 'a' ? this.slotB : this.slotA;
    const outgoingEl  = this.activeSlot === 'a' ? this.slotA : this.slotB;

    // Build element
    const el = item.type === 'video' ? this.buildVideo(item) : this.buildImage(item);
    incomingEl.innerHTML = '';
    incomingEl.appendChild(el);

    await this.waitForLoad(el);

    // Crossfade
    incomingEl.classList.add('active');
    outgoingEl.classList.remove('active');
    this.activeSlot = this.activeSlot === 'a' ? 'b' : 'a';

    // Duration: use actual video length, or configured slideDuration for images
    let duration = this.config.slideDuration;
    if (item.type === 'video' && el.duration && isFinite(el.duration)) {
      duration = el.duration * 1000;
    }

    // Allow next transition after crossfade completes
    setTimeout(() => { this.isTransitioning = false; }, this.config.transitionDuration + 100);

    this.slideTimer = setTimeout(() => {
      this.currentIndex = (this.currentIndex + 1) % this.media.length;
      this.loadSlide(this.currentIndex);
    }, duration);
  }

  buildVideo(item) {
    const v = document.createElement('video');
    v.src = item.url;
    v.autoplay = v.muted = v.loop = v.playsInline = true;
    v.setAttribute('playsinline', '');
    return v;
  }

  buildImage(item) {
    const img = document.createElement('img');
    img.src = item.url;
    img.alt = '';
    img.draggable = false;
    return img;
  }

  waitForLoad(el) {
    return new Promise((resolve) => {
      const done = () => resolve();
      if (el.tagName === 'VIDEO') {
        el.addEventListener('canplay', done, { once: true });
        el.addEventListener('error', done, { once: true });
        setTimeout(done, 4000); // Failsafe
        el.load();
      } else {
        if (el.complete && el.naturalWidth) return done();
        el.addEventListener('load', done, { once: true });
        el.addEventListener('error', done, { once: true });
      }
    });
  }

  // ─── Effects & Modes ───────────────────────────────────────────────────────

  initEffects() {
    if (window.GrainEffect) {
      this.grain = new GrainEffect(this.fxCanvas, this.config);
      this.grain.start();
    }
  }

  applyMode() {
    // Remove all mode classes
    document.body.className = document.body.className
      .replace(/\bmode-\w+\b/g, '').trim();

    document.body.classList.add(`mode-${this.config.mode}`);

    // Scanlines
    document.body.classList.toggle('fx-scanlines', !!this.config.effects?.scanlines);

    // Apply frame overlay from mode module
    const modeModules = {
      wizarding: window.WizardingMode,
      botanica:  window.BotanicaMode,
    };
    const mod = modeModules[this.config.mode];
    if (mod && mod.apply) mod.apply();
    else {
      // Clear overlay for modes without a custom frame
      const overlay = document.getElementById('frame-overlay');
      if (overlay) overlay.innerHTML = '';
    }
  }

  flashModeLabel() {
    const labels = { wizarding: '⚡ Wizarding Mode', botanica: '🌿 Botanica Mode', zen: '🌊 Zen Mode', family: '❤️ Family Mode' };
    this.modeLabel.textContent = labels[this.config.mode] || this.config.mode;
    this.modeLabel.classList.remove('hidden');
    this.modeLabel.classList.add('visible');
    setTimeout(() => {
      this.modeLabel.classList.remove('visible');
      setTimeout(() => this.modeLabel.classList.add('hidden'), 600);
    }, 2500);
  }

  showEmptyState() { this.emptyState.classList.remove('hidden'); }
  hideEmptyState() { this.emptyState.classList.add('hidden'); }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  defaultConfig() {
    return {
      mode: 'wizarding', slideDuration: 12000, transitionDuration: 2000,
      effects: { grain: true, vignette: true, colorGrade: true, frameOverlay: true },
      grainIntensity: 0.04, vignetteIntensity: 0.6, shuffle: true
    };
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.player = new WizardingFramePlayer();
  // Prevent screen sleep on supported browsers
  if ('wakeLock' in navigator) navigator.wakeLock.request('screen').catch(() => {});
});
