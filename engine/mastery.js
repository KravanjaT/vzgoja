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
  const current = getMasteryLevel(agentId, skillId);
  const next    = skill.levels[current + 1];
  if (!next) { lonaToast("Že na maksimalni stopnji!", "gold"); return; }

  const cost = skill.levels[current]?.xpCost ?? 0;
  if (cost > 0 && getXp(agentId) < cost) {
    lonaToast(`Premalo XP! Rabiš ${cost} XP`, "red");
    return;
  }

  const d = document.createElement("div");
  d.className = "joker-dialog";
  d.innerHTML = `<div class="joker-dialog__box">
    <div class="joker-dialog__icon">${next.icon}</div>
    <p class="joker-dialog__title">${skill.label} → ${next.label}</p>
    <p class="joker-dialog__body">${next.description}</p>
    ${cost > 0 ? `<p style="color:var(--neon-red);font-size:.8rem;font-weight:700">Cena: −${cost} XP</p>` : ""}
    ${next.xpReward > 0 ? `<p style="color:var(--green);font-size:.8rem;font-weight:700">Nagrada: +${next.xpReward} XP</p>` : ""}
    <div class="joker-dialog__btns">
      <button class="joker-dialog__cancel">Prekliči</button>
      <button class="joker-dialog__confirm">Napreduj ✓</button>
    </div>
  </div>`;
  document.body.appendChild(d);
  d.querySelector(".joker-dialog__cancel").addEventListener("click", () => d.remove());
  d.querySelector(".joker-dialog__confirm").addEventListener("click", () => {
    d.remove();
    if (cost > 0) addXp(agentId, -cost);
    setMasteryLevel(agentId, skillId, current + 1);
    if (next.xpReward > 0) {
      addXp(agentId, next.xpReward);
      if (typeof showXpFloat === "function") showXpFloat(next.xpReward);
    }
    if (next.unlocksBadge) unlockBadge(agentId, next.unlocksBadge);
    lonaToast(`${skill.label}: ${next.label} doseženo! ${next.icon}`, "gold");
    if (typeof showConfetti === "function") showConfetti();
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
