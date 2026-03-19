/**
 * WizardingFrame — Film Grain + Vignette Effect
 * Renders animated film grain over the entire display via canvas.
 * This is the secret sauce that makes digital photos feel like
 * they're living, breathing magical portraits.
 */

class GrainEffect {
  constructor(canvas, config) {
    this.canvas = canvas;
    this.config = config;
    this.ctx = canvas.getContext('2d');
    this.animFrame = null;
    this.lastGrainTime = 0;
    this.grainFPS = 12; // Film grain updates at 12fps for authentic look

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  start() {
    const loop = (timestamp) => {
      this.animFrame = requestAnimationFrame(loop);

      // Throttle grain to ~12fps for authentic film look
      if (timestamp - this.lastGrainTime < 1000 / this.grainFPS) return;
      this.lastGrainTime = timestamp;

      this.render();
    };
    this.animFrame = requestAnimationFrame(loop);
  }

  stop() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
  }

  render() {
    const { width, height } = this.canvas;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, width, height);

    if (this.config.effects?.grain) {
      this.drawGrain(ctx, width, height);
    }

    if (this.config.effects?.vignette) {
      this.drawVignette(ctx, width, height);
    }
  }

  drawGrain(ctx, width, height) {
    const intensity = this.config.grainIntensity ?? 0.04;

    // Create grain using ImageData for performance
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    // Only update a portion each frame for performance on Pi
    const step = 1; // Set to 2 for lower-end hardware
    for (let i = 0; i < data.length; i += 4 * step) {
      // Random noise value
      const noise = (Math.random() - 0.5) * 255 * intensity * 4;
      const value = 128 + noise;
      data[i] = value;     // R
      data[i+1] = value;   // G
      data[i+2] = value;   // B
      data[i+3] = Math.abs(noise) * 1.5; // Alpha — sparse grain
    }

    // Use overlay blend mode for grain
    ctx.putImageData(imageData, 0, 0);
  }

  drawVignette(ctx, width, height) {
    const intensity = this.config.vignetteIntensity ?? 0.6;

    // Radial gradient vignette
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.sqrt(cx * cx + cy * cy);

    const gradient = ctx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, radius);
    gradient.addColorStop(0, `rgba(0, 0, 0, 0)`);
    gradient.addColorStop(0.6, `rgba(0, 0, 0, 0)`);
    gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity})`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Extra dark corners — more cinematic
    const cornerGrad = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius * 1.1);
    cornerGrad.addColorStop(0, `rgba(0, 0, 0, 0)`);
    cornerGrad.addColorStop(1, `rgba(0, 0, 0, ${intensity * 0.4})`);
    ctx.fillStyle = cornerGrad;
    ctx.fillRect(0, 0, width, height);
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export for use in player.js
window.GrainEffect = GrainEffect;
