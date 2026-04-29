// ============================================================
//  LONA OS — engine/gatekeeper.js
//  Standard 0 — dnevni protokol, brez tega nič ne deluje
// ============================================================

function _gkKey() {
  return "lona_gk_" + new Date().toDateString();
}

function isGatekeeperApproved() {
  const state = JSON.parse(localStorage.getItem(_gkKey()) || "{}");
  return LONA_CONFIG.gatekeeper.checks.every(c => state[c.id]);
}

function setGatekeeperCheck(id, val) {
  const state = JSON.parse(localStorage.getItem(_gkKey()) || "{}");
  state[id] = val;
  localStorage.setItem(_gkKey(), JSON.stringify(state));
}

function getGatekeeperState() {
  return JSON.parse(localStorage.getItem(_gkKey()) || "{}");
}

function renderGatekeeper() {
  const el = document.getElementById("gatekeeper");
  if (!el) return;

  const cfg   = LONA_CONFIG.gatekeeper;
  const state = getGatekeeperState();
  const done  = cfg.checks.every(c => state[c.id]);

  el.className = "gatekeeper" + (done ? " gatekeeper--approved" : "");

  el.innerHTML = `
    <div class="gatekeeper__header">
      <p class="gatekeeper__label">${cfg.label}</p>
      <p class="gatekeeper__sub">${cfg.subtitle}</p>
    </div>
    <div class="gatekeeper__checks">
      ${cfg.checks.map(c => `
        <button class="gk-check ${state[c.id] ? "gk-check--done" : ""}"
          data-gk="${c.id}" onclick="toggleGkCheck('${c.id}')">
          <span class="gk-check__icon">${state[c.id] ? "✓" : "○"}</span>
          <span class="gk-check__label">${c.label}</span>
        </button>
      `).join("")}
    </div>
    ${done ? '<p class="gatekeeper__approved-msg">✅ Standard 0 odobren — misije odklenjene!</p>' : ""}
  `;

  // Posodobi mission gumbe
  _applyGatekeeperToMissions();
}

function toggleGkCheck(id) {
  const state = getGatekeeperState();
  state[id] = !state[id];
  localStorage.setItem(_gkKey(), JSON.stringify(state));
  renderGatekeeper();

  const allDone = LONA_CONFIG.gatekeeper.checks.every(c => state[c.id]);
  if (allDone) {
    lonaToast("Standard 0 odobren! 🎯 Misije odklenjene.", "green");
    if (typeof renderMissionsGrid === "function") renderMissionsGrid(window.currentCat || "all");
  }
}

function _applyGatekeeperToMissions() {
  const approved = isGatekeeperApproved();
  document.querySelectorAll(".mission-btn[data-mission]").forEach(btn => {
    btn.dataset.gkLocked = approved ? "0" : "1";
  });
}

function initGatekeeper() {
  renderGatekeeper();

  // Vsak dan reset ob polnoči
  const now     = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const msToMidnight = tomorrow - now;
  setTimeout(() => {
    renderGatekeeper();
    setInterval(renderGatekeeper, 86400000);
  }, msToMidnight);
}
