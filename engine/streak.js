// ============================================================
//  LONA OS — engine/streak.js
//  Dnevni streak — zaporedni dnevi z misijo
// ============================================================

function streakKey(agentId) {
  return `lona_streak_${agentId}`;
}

function getStreak(agentId) {
  return JSON.parse(localStorage.getItem(streakKey(agentId)) || '{"count":0,"lastDate":null}');
}

function updateStreak(agentId) {
  const streak   = getStreak(agentId);
  const today    = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (streak.lastDate === today) return; // Že posodobljeno danes

  if (streak.lastDate === yesterday) {
    streak.count++;
  } else {
    streak.count = 1; // Reset — dan je bil preskočen
  }
  streak.lastDate = today;
  localStorage.setItem(streakKey(agentId), JSON.stringify(streak));

  // Streak milestone toast
  if (streak.count >= 7 && streak.count % 7 === 0) {
    lonaToast(`🔥 ${streak.count} dni zapored! Izjemno!`, "gold");
    if (typeof showConfetti === "function") showConfetti();
  } else if (streak.count >= 3) {
    lonaToast(`🔥 Streak: ${streak.count} dni zapored!`, "gold");
  }

  renderStreak(agentId);
}

function renderStreak(agentId) {
  const el = document.getElementById("streak-display");
  if (!el) return;

  const streak = getStreak(agentId);
  if (!streak.count) { el.innerHTML = ""; return; }

  const flames = "🔥".repeat(Math.min(streak.count, 7));
  el.innerHTML = `
    <div class="streak-banner">
      <span class="streak-banner__flames">${flames}</span>
      <span class="streak-banner__count">${streak.count} dni zapored</span>
    </div>
  `;
}

function initStreak() {
  const agentId = typeof getCurrentAgent === "function" ? getCurrentAgent() : null;
  if (!agentId) return;
  renderStreak(agentId);

  // Reset streak ob polnoči če ni bil aktiven
  const streak = getStreak(agentId);
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (streak.lastDate && streak.lastDate !== today && streak.lastDate !== yesterday) {
    // Preskočen dan — reset
    streak.count = 0;
    localStorage.setItem(streakKey(agentId), JSON.stringify(streak));
  }
}
