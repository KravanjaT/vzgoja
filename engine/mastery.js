// ============================================================
//  LONA OS — engine/mastery.js
//  Mastery sistem — stopnje mojstrstva po veščinah
// ============================================================

function masteryKey(agentId, skillId) {
  return `lona_mastery_${agentId}_${skillId}`;
}

function getMasteryLevel(agentId, skillId) {
  return parseInt(localStorage.getItem(masteryKey(agentId, skillId)) || "0");
}

function setMasteryLevel(agentId, skillId, level) {
  localStorage.setItem(masteryKey(agentId, skillId), String(level));
}

function advanceMastery(agentId, skillId) {
  const skill  = LONA_CONFIG.masterySkills[skillId];
  if (!skill) return;
  const current  = getMasteryLevel(agentId, skillId);
  const next     = skill.levels[current + 1];
  if (!next) { lonaToast("Že na maksimalni stopnji! ⭐", "gold"); return; }

  const cost     = next.xpCost ?? 0;  // cena je v NASLEDNJEM nivoju
  const freeXp   = typeof getXp    === "function" ? getXp(agentId)    : 0;
  const totalXp  = typeof getMaxXp === "function" ? getMaxXp(agentId) : 0;
  const canAfford = cost === 0 || freeXp >= cost;

  const d = document.createElement("div");
  d.className = "joker-dialog";
  d.innerHTML = `<div class="joker-dialog__box">
    <div style="font-size:2.2rem">${next.icon}</div>
    <p style="font-family:'DM Serif Display',serif;font-size:1.05rem;color:#F7F4EF;text-align:center">${skill.label}</p>
    <p style="font-size:.8rem;color:#5AAF7A;font-weight:700;text-align:center">→ ${next.label}</p>
    <p style="font-size:.8rem;color:rgba(247,244,239,.5);text-align:center;margin:4px 0 8px">${next.description}</p>

    <div style="display:flex;gap:8px;width:100%;margin-bottom:8px">
      <div style="flex:1;text-align:center;padding:8px;background:rgba(90,175,122,.1);border:1px solid rgba(90,175,122,.2);border-radius:12px">
        <p style="font-size:1rem;font-weight:800;color:#5AAF7A;margin:0">${freeXp}</p>
        <p style="font-size:.6rem;color:rgba(247,244,239,.4);margin:0;text-transform:uppercase">Prosti XP</p>
      </div>
      <div style="flex:1;text-align:center;padding:8px;background:rgba(255,214,10,.08);border:1px solid rgba(255,214,10,.15);border-radius:12px">
        <p style="font-size:1rem;font-weight:800;color:#FFD60A;margin:0">${totalXp}</p>
        <p style="font-size:.6rem;color:rgba(247,244,239,.4);margin:0;text-transform:uppercase">Skupni XP</p>
      </div>
    </div>

    ${cost > 0 ? `<div style="padding:8px 12px;background:${canAfford?'rgba(90,175,122,.1)':'rgba(255,59,48,.1)'};border:1px solid ${canAfford?'rgba(90,175,122,.3)':'rgba(255,59,48,.3)'};border-radius:12px;text-align:center;margin-bottom:8px">
      <p style="font-size:.88rem;font-weight:800;color:${canAfford?'#5AAF7A':'#FF3B30'};margin:0">
        ${canAfford ? `− ${cost} XP` : `Rabiš ${cost - freeXp} XP več`}
      </p>
      <p style="font-size:.62rem;color:rgba(247,244,239,.4);margin:0">Prosti XP po odbitku: ${freeXp - cost}</p>
    </div>` : '<p style="font-size:.78rem;color:#5AAF7A;text-align:center;margin-bottom:8px">Brezplačno!</p>'}

    <div class="joker-dialog__btns">
      <button class="joker-dialog__cancel">Prekliči</button>
      <button class="joker-dialog__confirm" ${!canAfford?'disabled style="opacity:.4;cursor:not-allowed"':''}>
        ${canAfford ? 'Napreduj ✓' : 'Premalo XP'}
      </button>
    </div>
  </div>`;
  document.body.appendChild(d);
  d.querySelector(".joker-dialog__cancel").addEventListener("click", () => d.remove());
  d.querySelector(".joker-dialog__confirm").addEventListener("click", () => {
    if (!canAfford) return;
    d.remove();
    if (cost > 0) addXp(agentId, -cost); // zniža PROSTI XP, skupni ostane
    setMasteryLevel(agentId, skillId, current + 1);
    if (next.unlocksBadge) unlockBadge(agentId, next.unlocksBadge);
    lonaToast(`${skill.icon} ${skill.label}: ${next.label}! ${next.icon}`, "gold");
    if (typeof showConfetti === "function") showConfetti();
    if (typeof renderMasteryProfile === "function") renderMasteryProfile();
    if (typeof renderHero === "function") renderHero();
  });
}

function unlockBadge(agentId, badgeId) {
  const key    = `lona_badges_${agentId}`;
  const badges = JSON.parse(localStorage.getItem(key) || "[]");
  if (!badges.includes(badgeId)) {
    badges.push(badgeId);
    localStorage.setItem(key, JSON.stringify(badges));
    lonaToast(`🏅 Značka odklenjena: ${badgeId}`, "gold");
  }
}

function getBadges(agentId) {
  return JSON.parse(localStorage.getItem(`lona_badges_${agentId}`) || "[]");
}

function initMastery() {
  // Inicializiraj mastery za vse agente
  LONA_CONFIG.agents.forEach(a => {
    Object.keys(LONA_CONFIG.masterySkills || {}).forEach(skillId => {
      const key = masteryKey(a.id, skillId);
      if (localStorage.getItem(key) === null) {
        localStorage.setItem(key, "0");
      }
    });
  });
}
