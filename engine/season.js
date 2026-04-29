// ============================================================
//  LONA OS — engine/season.js
//  Tedenske sezone — weekly XP lestvica
// ============================================================

function seasonKey() {
  // Tedenski ključ: leto + teden
  const d   = new Date();
  const week = Math.floor((d - new Date(d.getFullYear(), 0, 1)) / 604800000);
  return `lona_season_${d.getFullYear()}_w${week}`;
}

function addSeasonXp(agentId, amount) {
  const key   = seasonKey();
  const state = JSON.parse(localStorage.getItem(key) || "{}");
  state[agentId] = (state[agentId] || 0) + amount;
  localStorage.setItem(key, JSON.stringify(state));
}

function getSeasonXp(agentId) {
  const state = JSON.parse(localStorage.getItem(seasonKey()) || "{}");
  return state[agentId] || 0;
}

function getSeasonLeaderboard() {
  const state = JSON.parse(localStorage.getItem(seasonKey()) || "{}");
  return LONA_CONFIG.agents
    .map(a => ({ id: a.id, name: a.name, avatar: a.avatar, xp: state[a.id] || 0 }))
    .sort((a, b) => b.xp - a.xp);
}

function renderSeasonWidget() {
  const el = document.getElementById("season-widget");
  if (!el) return;

  const board = getSeasonLeaderboard();
  const cfg   = LONA_CONFIG.season;

  el.innerHTML = `
    <div class="season-widget">
      <p class="season-widget__title">📅 ${cfg.label} — Ta teden</p>
      <div class="season-leaderboard">
        ${board.map((a, i) => `
          <div class="season-row ${i === 0 ? "season-row--leader" : ""}">
            <span class="season-row__rank">${i === 0 ? "🏆" : i === 1 ? "🥈" : "🥉"}</span>
            <span class="season-row__name">${a.avatar} ${a.name}</span>
            <span class="season-row__xp">${a.xp} XP</span>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function initSeason() {
  renderSeasonWidget();
}
