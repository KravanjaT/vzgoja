// ============================================================
//  LONA OS — engine/progressive.js
//  Progressive misije — 3 stopnje (strah, samostojnost)
// ============================================================

function progKey(agentId, missionId) {
  return `lona_prog_${agentId}_${missionId}`;
}

function getProgLevel(agentId, missionId) {
  return parseInt(localStorage.getItem(progKey(agentId, missionId)) || "0");
}

function setProgLevel(agentId, missionId, level) {
  localStorage.setItem(progKey(agentId, missionId), String(level));
}

function handleProgressiveMission(agentId, mission) {
  const currentLevel = getProgLevel(agentId, mission.id);
  const levels       = mission.levels || [];
  const totalLevels  = levels.length;

  if (currentLevel >= totalLevels) {
    lonaToast(`${mission.label} — vse stopnje opravljene! 🏆`, "gold");
    return;
  }

  const lvl  = levels[currentLevel];
  const name = LONA_CONFIG.agents.find(a => a.id === agentId)?.name || agentId;

  const d = document.createElement("div");
  d.className = "joker-dialog";
  d.innerHTML = `<div class="joker-dialog__box">
    <div class="joker-dialog__icon">${mission.icon}</div>
    <p class="joker-dialog__title">${mission.label}</p>
    <div style="background:#F2F2F7;border-radius:14px;padding:14px;width:100%;margin:4px 0">
      <p style="font-size:.65rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#8E8E93;margin-bottom:6px">
        STOPNJA ${currentLevel + 1} / ${totalLevels}
      </p>
      <p style="font-size:.92rem;font-weight:700;color:#1C1C1E;line-height:1.4">${lvl.label}</p>
    </div>
    <div style="display:flex;gap:6px;margin:4px 0">
      ${levels.map((l, i) =>
        `<div style="height:6px;flex:1;border-radius:3px;background:${i < currentLevel ? '#34C759' : i === currentLevel ? '#AF52DE' : '#D1D1D6'}"></div>`
      ).join("")}
    </div>
    <p style="font-size:.75rem;color:#8E8E93;text-align:center">${name} | +${lvl.xp} XP</p>
    <div class="joker-dialog__btns">
      <button class="joker-dialog__cancel">Prekliči</button>
      <button class="joker-dialog__confirm">Opravljeno ✓</button>
    </div>
  </div>`;
  document.body.appendChild(d);

  d.querySelector(".joker-dialog__cancel").addEventListener("click", () => d.remove());
  d.querySelector(".joker-dialog__confirm").addEventListener("click", () => {
    d.remove();

    // Quality check
    if (typeof showQualityCheck === "function") {
      showQualityCheck(agentId, { label: mission.label, baseXp: lvl.xp }, null, (compromised) => {
        const xp = compromised ? Math.floor(lvl.xp / 2) : lvl.xp;
        addXp(agentId, xp);
        if (!compromised) setProgLevel(agentId, mission.id, currentLevel + 1);

        logMission(agentId, mission.id, xp, { label: `Stopnja ${currentLevel + 1}` }, compromised);
        if (typeof addSeasonXp === "function") addSeasonXp(agentId, xp);
        if (typeof addAttrXp   === "function") addAttrXp(agentId, mission.id, xp);

        const nextLevel = currentLevel + 1;
        if (!compromised && nextLevel >= totalLevels) {
          lonaToast(`🏆 ${mission.label} — VSE STOPNJE OPRAVLJENE!`, "gold");
          if (typeof showConfetti === "function") showConfetti();
        } else {
          lonaToast(compromised ? `⚠️ Površno — +${xp} XP` : `+${xp} XP — Stopnja ${nextLevel}/${totalLevels} ✓`, compromised ? "red" : "green");
        }

        if (typeof showXpFloat === "function") showXpFloat(xp);
        setTimeout(() => {
          if (typeof renderMissionsGrid === "function") renderMissionsGrid(window.currentCat || "all");
          if (typeof renderCmdAgents   === "function") renderCmdAgents();
        }, 200);
      });
    } else {
      // Fallback brez quality check
      addXp(agentId, lvl.xp);
      setProgLevel(agentId, mission.id, currentLevel + 1);
      lonaToast(`+${lvl.xp} XP — Stopnja ${currentLevel + 1}/${totalLevels} ✓`, "green");
    }
  });
}

function initProgressive() {
  // Ni posebne inicializacije
}
