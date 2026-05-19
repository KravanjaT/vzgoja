/* ============================================================
   LONA OS — parallax.js  (v1.0)
   Gyroscope na mobilnem, miška na desktopu.
   Použíti: dodaj <script src="parallax.js"></script> v HTML
   In dodaj data-parallax="N" na elemente (N = moč, 1–5)
   ============================================================ */

(function() {
  'use strict';

  // ── KONFIGURACIJA ─────────────────────────────────────────
  const CFG = {
    maxShift:    18,    // px — max premik pri polnem naklonu
    smoothing:   0.08,  // 0–1, manjše = bolj mehko
    gyroScale:   0.6,   // občutljivost gyroskopa
    mouseScale:  0.5,   // občutljivost miške
    perspective: 800,   // CSS perspective px
  };

  // Trenutni cilj in dejanski položaj (za smooth lerp)
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let rafId = null;
  let gyroPermission = false;

  // ── POIŠČI ELEMENTE ───────────────────────────────────────
  function getLayers() {
    return Array.from(document.querySelectorAll('[data-parallax]')).map(el => ({
      el,
      depth: parseFloat(el.dataset.parallax) || 1,
    }));
  }

  // ── APLICIRAJ TRANSFORM ───────────────────────────────────
  function applyLayers(x, y) {
    const layers = getLayers();
    layers.forEach(({ el, depth }) => {
      const dx = x * depth * CFG.maxShift;
      const dy = y * depth * CFG.maxShift;
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      el.style.willChange = 'transform';
    });
  }

  // ── ANIMACIJSKA ZANKA (lerp) ──────────────────────────────
  function animate() {
    currentX += (targetX - currentX) * CFG.smoothing;
    currentY += (targetY - currentY) * CFG.smoothing;
    applyLayers(currentX, currentY);
    rafId = requestAnimationFrame(animate);
  }

  // ── MIŠKA (desktop) ───────────────────────────────────────
  function onMouseMove(e) {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    targetX = -((e.clientX - cx) / cx) * CFG.mouseScale;
    targetY = -((e.clientY - cy) / cy) * CFG.mouseScale;
  }

  // ── GYROSCOPE (mobil) ─────────────────────────────────────
  function onDeviceOrientation(e) {
    // gamma = levo/desno (-90 do 90), beta = naprej/nazaj (-180 do 180)
    const gamma = Math.max(-30, Math.min(30, e.gamma || 0));
    const beta  = Math.max(-30, Math.min(30, (e.beta || 0) - 45)); // -45 ker telefon ni raven
    targetX = -(gamma / 30) * CFG.gyroScale;
    targetY = -(beta  / 30) * CFG.gyroScale;
  }

  // ── iOS 13+ zahteva permission ────────────────────────────
  function requestGyroPermission() {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(state => {
          if (state === 'granted') {
            window.addEventListener('deviceorientation', onDeviceOrientation, { passive: true });
            gyroPermission = true;
          }
        })
        .catch(() => {});
    } else {
      // Android / starejši iOS — direktno
      window.addEventListener('deviceorientation', onDeviceOrientation, { passive: true });
      gyroPermission = true;
    }
  }

  // ── SCROLL PARALLAX (desktop fallback) ───────────────────
  function onScroll() {
    if (gyroPermission) return; // gyro ima prednost
    const scrollY = window.scrollY || window.pageYOffset;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return;
    const pct = scrollY / maxScroll; // 0–1
    targetY = (pct - 0.5) * CFG.mouseScale;
  }

  // ── INIT ──────────────────────────────────────────────────
  function init() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
      // Poskusi gyro — ob prvem tapnem zahtevamo permission
      if (typeof DeviceOrientationEvent !== 'undefined' &&
          typeof DeviceOrientationEvent.requestPermission === 'function') {
        // iOS 13+ — rabimo user gesture
        document.addEventListener('touchstart', function askOnce() {
          requestGyroPermission();
          document.removeEventListener('touchstart', askOnce);
        }, { once: true });
      } else {
        // Android / starejši — direktno
        window.addEventListener('deviceorientation', onDeviceOrientation, { passive: true });
        gyroPermission = true;
      }
      // Miška ni na mobilnem, scroll pa ja
      window.addEventListener('scroll', onScroll, { passive: true });
    } else {
      // Desktop — miška + scroll
      window.addEventListener('mousemove', onMouseMove, { passive: true });
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    // Animacijska zanka
    animate();
  }

  // ── PAUSE ko tab ni aktiven ───────────────────────────────
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    } else {
      if (!rafId) animate();
    }
  });

  // ── START ─────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Izpostavi za debug
  window._lonaParallax = { CFG, getTarget: () => ({ x: targetX, y: targetY }) };

})();
