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

  apply() {
    const overlay = document.getElementById('frame-overlay');
    if (overlay) overlay.innerHTML = '';
  }
};
