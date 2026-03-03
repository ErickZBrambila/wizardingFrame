/**
 * WizardingFrame — Botanica Mode
 * Ambient nature, fruit, and plant aesthetic.
 * Fresh, slow, meditative. Perfect screensaver energy.
 */

window.BotanicaMode = {
  name: 'botanica',
  label: '🌿 Botanica Mode',

  config: {
    grainIntensity: 0.02,    // lighter grain for botanical look
    vignetteIntensity: 0.45, // softer vignette
    transitionDuration: 3000, // slower, more meditative transitions
    slideDuration: 16000,
  },

  getFrameSVG() {
    // Simple thin natural wood/green frame for Botanica
    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"
         viewBox="0 0 1000 700" preserveAspectRatio="none"
         style="position:absolute;inset:0;width:100%;height:100%">
      <defs>
        <linearGradient id="wood-h" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stop-color="#2d1b0e"/>
          <stop offset="20%"  stop-color="#5c3317"/>
          <stop offset="50%"  stop-color="#7a4520"/>
          <stop offset="80%"  stop-color="#5c3317"/>
          <stop offset="100%" stop-color="#2d1b0e"/>
        </linearGradient>
        <linearGradient id="wood-v" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stop-color="#2d1b0e"/>
          <stop offset="20%"  stop-color="#5c3317"/>
          <stop offset="50%"  stop-color="#7a4520"/>
          <stop offset="80%"  stop-color="#5c3317"/>
          <stop offset="100%" stop-color="#2d1b0e"/>
        </linearGradient>
      </defs>

      <!-- Frame bars -->
      <rect x="0" y="0" width="1000" height="20" fill="url(#wood-h)"/>
      <rect x="0" y="680" width="1000" height="20" fill="url(#wood-h)"/>
      <rect x="0" y="0" width="20" height="700" fill="url(#wood-v)"/>
      <rect x="980" y="0" width="20" height="700" fill="url(#wood-v)"/>

      <!-- Inner accent line (botanical green) -->
      <rect x="24" y="24" width="952" height="2" fill="#4a7c59" opacity="0.6"/>
      <rect x="24" y="674" width="952" height="2" fill="#4a7c59" opacity="0.6"/>
      <rect x="24" y="24" width="2" height="652" fill="#4a7c59" opacity="0.6"/>
      <rect x="974" y="24" width="2" height="652" fill="#4a7c59" opacity="0.6"/>

      <!-- Corner leaf ornaments -->
      <g opacity="0.7">
        <text x="8" y="18" font-size="16" fill="#4a7c59">🌿</text>
        <text x="966" y="18" font-size="16" fill="#4a7c59" transform="scale(-1,1) translate(-1990,0)">🌿</text>
        <text x="8" y="698" font-size="16" fill="#4a7c59">🌿</text>
        <text x="966" y="698" font-size="16" fill="#4a7c59" transform="scale(-1,1) translate(-1990,0)">🌿</text>
      </g>

      <!-- Inner shadow -->
      <rect x="20" y="20" width="960" height="660"
            fill="none"
            stroke="rgba(0,0,0,0.3)"
            stroke-width="6"/>
    </svg>`;
  },

  apply() {
    const overlay = document.getElementById('frame-overlay');
    if (overlay) overlay.innerHTML = this.getFrameSVG();
  }
};
