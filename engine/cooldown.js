// ============================================================
//  LONA OS — engine/cooldown.js
//  Cooldown sistem za misije
// ============================================================

function cdKey(missionId) {
  return "lona_cooldown_" + missionId;
}

function setCooldown(missionId, hours) {
  const until = Date.now() + hours * 3600000;
  localStorage.setItem(cdKey(missionId), String(until));
}

function getCooldownMs(missionId) {
  const until = parseInt(localStorage.getItem(cdKey(missionId)) || "0");
  return Math.max(0, until - Date.now());
}

function isOnCooldown(missionId) {
  return getCooldownMs(missionId) > 0;
}

function getRemainingMs(missionId) {
  return getCooldownMs(missionId);
}

function renderCooldown(missionId) {
  const btn = document.querySelector(`.mission-btn[data-mission="${missionId}"]`);
  if (!btn) return;
  if (isOnCooldown(missionId)) {
    const ms  = getCooldownMs(missionId);
    const hrs = Math.ceil(ms / 3600000);
    const cdEl = btn.querySelector(".mission-btn__cooldown");
    if (cdEl) cdEl.textContent = `⏱ ${hrs}h`;
  }
}

// Ticker — vsako minuto posodobi cooldown prikaz
function initCooldownTicker() {
  setInterval(() => {
    document.querySelectorAll(".mission-btn[data-mission]").forEach(btn => {
      const mId = btn.dataset.mission;
      if (!isOnCooldown(mId) && btn.classList.contains("mission-btn--locked")) {
        // Cooldown potekel — osveži grid
        if (typeof renderMissionsGrid === "function") {
          renderMissionsGrid(window.currentCat || "all");
        }
      }
    });
  }, 60000);
}
