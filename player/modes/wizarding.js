/**
 * WizardingFrame — Wizarding Mode
 * Harry Potter portrait aesthetic configuration.
 * Warm amber tones, heavy vignette, slow breath animation,
 * ornate gold frame overlay.
 */

window.WizardingMode = {
  name: 'wizarding',
  label: '⚡ Wizarding Mode',

  config: {
    grainIntensity: 0.05,
    vignetteIntensity: 0.65,
    transitionDuration: 2500,
    slideDuration: 14000,
  },

  // SVG ornate frame — injected into the frame-overlay div
  getFrameSVG() {
    return `
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"
         viewBox="0 0 1000 700" preserveAspectRatio="none"
         style="position:absolute;inset:0;width:100%;height:100%">
      <defs>
        <linearGradient id="gold-h" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stop-color="#3d2800"/>
          <stop offset="15%"  stop-color="#c9a84c"/>
          <stop offset="35%"  stop-color="#f5d98b"/>
          <stop offset="50%"  stop-color="#c9a84c"/>
          <stop offset="65%"  stop-color="#f5d98b"/>
          <stop offset="85%"  stop-color="#c9a84c"/>
          <stop offset="100%" stop-color="#3d2800"/>
        </linearGradient>
        <linearGradient id="gold-v" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stop-color="#3d2800"/>
          <stop offset="15%"  stop-color="#c9a84c"/>
          <stop offset="35%"  stop-color="#f5d98b"/>
          <stop offset="50%"  stop-color="#c9a84c"/>
          <stop offset="65%"  stop-color="#f5d98b"/>
          <stop offset="85%"  stop-color="#c9a84c"/>
          <stop offset="100%" stop-color="#3d2800"/>
        </linearGradient>
        <filter id="emboss">
          <feConvolveMatrix order="3" kernelMatrix="2 -1 0 -1 1 1 0 1 -2"/>
        </filter>
      </defs>

      <!-- Outer frame bars -->
      <rect x="0" y="0" width="1000" height="28" fill="url(#gold-h)"/>
      <rect x="0" y="672" width="1000" height="28" fill="url(#gold-h)"/>
      <rect x="0" y="0" width="28" height="700" fill="url(#gold-v)"/>
      <rect x="972" y="0" width="28" height="700" fill="url(#gold-v)"/>

      <!-- Inner frame bars (thinner) -->
      <rect x="36" y="36" width="928" height="10" fill="url(#gold-h)" opacity="0.6"/>
      <rect x="36" y="654" width="928" height="10" fill="url(#gold-h)" opacity="0.6"/>
      <rect x="36" y="36" width="10" height="628" fill="url(#gold-v)" opacity="0.6"/>
      <rect x="954" y="36" width="10" height="628" fill="url(#gold-v)" opacity="0.6"/>

      <!-- Corner ornaments -->
      <g fill="#c9a84c" opacity="0.9">
        <!-- Top-left -->
        <circle cx="28" cy="28" r="18" fill="#8b6914"/>
        <circle cx="28" cy="28" r="10" fill="#f5d98b"/>
        <circle cx="28" cy="28" r="4"  fill="#c9a84c"/>

        <!-- Top-right -->
        <circle cx="972" cy="28" r="18" fill="#8b6914"/>
        <circle cx="972" cy="28" r="10" fill="#f5d98b"/>
        <circle cx="972" cy="28" r="4"  fill="#c9a84c"/>

        <!-- Bottom-left -->
        <circle cx="28" cy="672" r="18" fill="#8b6914"/>
        <circle cx="28" cy="672" r="10" fill="#f5d98b"/>
        <circle cx="28" cy="672" r="4"  fill="#c9a84c"/>

        <!-- Bottom-right -->
        <circle cx="972" cy="672" r="18" fill="#8b6914"/>
        <circle cx="972" cy="672" r="10" fill="#f5d98b"/>
        <circle cx="972" cy="672" r="4"  fill="#c9a84c"/>
      </g>

      <!-- Mid-edge ornaments -->
      <g fill="#c9a84c" opacity="0.7">
        <ellipse cx="500" cy="14" rx="40" ry="8"/>
        <ellipse cx="500" cy="686" rx="40" ry="8"/>
        <ellipse cx="14" cy="350" rx="8" ry="40"/>
        <ellipse cx="986" cy="350" rx="8" ry="40"/>
      </g>

      <!-- Subtle inner shadow to blend frame into image -->
      <rect x="28" y="28" width="944" height="644"
            fill="none"
            stroke="rgba(0,0,0,0.4)"
            stroke-width="8"/>
    </svg>`;
  },

  apply() {
    const overlay = document.getElementById('frame-overlay');
    if (overlay) overlay.innerHTML = this.getFrameSVG();
  }
};
