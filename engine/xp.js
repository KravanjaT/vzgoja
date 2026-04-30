// ============================================================
//  LONA OS — engine/xp.js
//  XP sistem — addXp, getXp, rangi, CMD panel refresh
// ============================================================

function xpKey(agentId) {
  return "lona_xp_" + agentId;
}

function xpLoadState() {
  return JSON.parse(localStorage.getItem("lona_xp_state") || "{}");
}

function getXp(agentId) {
  const state = xpLoadState();
  return state[agentId] ?? 0;
}

function getMaxXp(agentId) {
  const state = JSON.parse(localStorage.getItem("lona_rank_state") || "{}");
  return state[agentId] ?? getXp(agentId);
}

function _setMaxXp(agentId, val) {
  const state = JSON.parse(localStorage.getItem("lona_rank_state") || "{}");
  state[agentId] = val;
  localStorage.setItem("lona_rank_state", JSON.stringify(state));
}

function getRank(xp) {
  const ranks = LONA_CONFIG.ranks;
  let rank = ranks[0].label;
  for (const r of ranks) {
    if (xp >= r.minXp) rank = r.label;
    else break;
  }
  return rank;
}

function addXp(agentId, amount) {
  const state   = xpLoadState();
  const prev    = state[agentId] ?? 0;
  const newVal  = Math.max(0, prev + amount);
  state[agentId] = newVal;
  localStorage.setItem("lona_xp_state", JSON.stringify(state));

  // Max XP (rang)
  if (amount > 0) {
    const maxPrev = getMaxXp(agentId);
    const maxNew  = maxPrev + amount;
    _setMaxXp(agentId, maxNew);

    // Rank up check
    const oldRank = getRank(maxPrev);
    const newRank = getRank(maxNew);
    if (oldRank !== newRank) {
      lonaToast(`🏆 ${LONA_CONFIG.agents.find(a=>a.id===agentId)?.name} → ${newRank}!`, "gold");
      if (typeof showConfetti === "function") showConfetti();
      if (typeof showScreenFlash === "function") showScreenFlash();
    }
  }

  // Double XP
  if (typeof isDoubleXpActive === "function" && isDoubleXpActive() && amount > 0) {
    const bonus = amount;
    state[agentId] = (state[agentId] ?? 0) + bonus;
    localStorage.setItem("lona_xp_state", JSON.stringify(state));
    const mx = getMaxXp(agentId);
    localStorage.setItem("lona_max_xp_" + agentId, String(mx + bonus));
    lonaToast(`⚡ Dvojni XP! +${bonus} bonus`, "gold");
  }

  // Posodobi UI — samo funkcije ki obstajajo na tej strani
  if (amount > 0 && typeof updateStreak  === "function") updateStreak(agentId);
  setTimeout(() => {
    if (typeof renderCmdAgents === "function") renderCmdAgents();
    if (typeof renderStreak    === "function") renderStreak(agentId);
    if (typeof renderTreasury  === "function") renderTreasury();
    if (typeof renderAttrsMini === "function") renderAttrsMini(agentId);
    // Posodobi profil stran če je odprta
    if (typeof renderAll       === "function") renderAll();
  }, 50);
}

function lonaReset() {
  const d = document.createElement("div");
  d.className = "joker-dialog";
  d.innerHTML = `<div class="joker-dialog__box">
    <div class="joker-dialog__icon">⚠️</div>
    <p class="joker-dialog__title">Res resetirat VSE?</p>
    <p class="joker-dialog__body">XP, misije, jokerji — vse izgine.</p>
    <div class="joker-dialog__btns">
      <button class="joker-dialog__cancel">Prekliči</button>
      <button class="joker-dialog__confirm" style="background:rgba(255,60,90,.15);border-color:rgba(255,60,90,.4);color:#C4352A">
        Da, resetiraj
      </button>
    </div>
  </div>`;
  document.body.appendChild(d);
  d.querySelector(".joker-dialog__cancel").addEventListener("click", () => d.remove());
  d.querySelector(".joker-dialog__confirm").addEventListener("click", () => {
    d.remove();
    const keys = Object.keys(localStorage).filter(k => k.startsWith("lona_"));
    keys.forEach(k => localStorage.removeItem(k));
    location.reload();
  });
}

function lonaDebug() {
  const state  = xpLoadState();
  const gkKey  = "lona_gk_" + new Date().toDateString();
  const gkState = JSON.parse(localStorage.getItem(gkKey) || "{}");
  console.group("🛡 LONA OS Debug");
  console.log("XP State:", state);
  console.log("Gatekeeper:", gkState, "→ approved:", LONA_CONFIG.gatekeeper.checks.every(c => gkState[c.id]));
  LONA_CONFIG.agents.forEach(a => {
    console.log(`Agent ${a.name}: xp=${getXp(a.id)}, maxXp=${getMaxXp(a.id)}, rank=${getRank(getMaxXp(a.id))}`);
  });
  console.groupEnd();
}

function fmtMs(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function initXp() {
  const state = xpLoadState();
  const rankState = JSON.parse(localStorage.getItem("lona_rank_state") || "{}");
  let changed = false;
  LONA_CONFIG.agents.forEach(a => {
    if (state[a.id] === undefined) {
      state[a.id] = a.xp || 0;
      changed = true;
    }
    if (rankState[a.id] === undefined) {
      rankState[a.id] = a.xp || 0;
    }
  });
  if (changed) localStorage.setItem("lona_xp_state", JSON.stringify(state));
  localStorage.setItem("lona_rank_state", JSON.stringify(rankState));
}

function grantManualBonus(amount) {
  const agentId = getCurrentAgent();
  addXp(agentId, amount);
  if (typeof showXpFloat === "function") showXpFloat(amount);
  if (typeof showStamp   === "function") showStamp(`+${amount} XP`, "gold");
  if (typeof _playSound  === "function") _playSound("coin");
  const name = LONA_CONFIG.agents.find(a => a.id === agentId)?.name || agentId;
  lonaToast(`${name} +${amount} XP bonus! ⭐`, "gold");
  if (typeof renderCmdAgents === "function") renderCmdAgents();
}

function showProposals() {
  lonaToast("Predlogi — prihaja kmalu! 📬", "cyan");
}

// ── KOVANCI 🪙 ──────────────────────────────────────────────
function coinsKey(agentId) { return `lona_coins_${agentId}`; }

function getCoins(agentId) {
  const stored = localStorage.getItem(coinsKey(agentId));
  if (stored !== null) return parseInt(stored);
  return LONA_CONFIG.agents.find(a => a.id === agentId)?.coins ?? 0;
}

function addCoins(agentId, amount) {
  const current = getCoins(agentId);
  const newVal  = Math.max(0, current + amount);
  localStorage.setItem(coinsKey(agentId), String(newVal));
  if (typeof renderCmdAgents === "function") renderCmdAgents();
  return newVal;
}

function spendCoins(agentId, amount) {
  if (getCoins(agentId) < amount) return false;
  addCoins(agentId, -amount);
  return true;
}

function initCoins() {
  LONA_CONFIG.agents.forEach(a => {
    if (localStorage.getItem(coinsKey(a.id)) === null) {
      localStorage.setItem(coinsKey(a.id), String(a.coins ?? 0));
    }
  });
}
