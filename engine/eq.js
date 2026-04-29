// ============================================================
//  LONA OS — engine/eq.js
//  EQ Operacije — čustvena inteligenca misije
// ============================================================

const EQ_FLOWS = {
  nevtralizator: {
    title:  "Nevtralizator",
    icon:   "🧘",
    steps:  [
      "Zaznaj kaj čutiš zdaj. Poimenuj čustvo: jeza, strah, frustracija...",
      "Dihanje: 4 sekunde vdih, 4 zadrži, 4 izdih. 3×.",
      "Povej eno stvar ki ti gre danes dobro.",
    ],
    reward: { type: "joker", amount: 1 },
  },
  debriefing: {
    title: "Debriefing",
    icon:  "📋",
    steps: [
      "Kaj se je danes zgodilo? (1 minuta — samo dejstva)",
      "Kako si se ob tem počutil?",
      "Kaj bi naslednjič naredil drugače?",
    ],
    reward: { type: "xp", amount: 25 },
  },
  intel_report: {
    title: "Intel Report",
    icon:  "🤝",
    steps: [
      "Izberi eno osebo ki ti je danes pomagala.",
      "Povej jim hvala — konkretno, ne samo 'hvala'.",
      "Zakaj je to pomembno? Razloži s svojimi besedami.",
    ],
    reward: { type: "xp", amount: 20 },
  },
  advokat: {
    title: "Advokat",
    icon:  "⚖️",
    steps: [
      "Izberi prepir ali težavo ki jo imaš zdaj.",
      "Povej stvar z vidika DRUGE osebe — kaj čutijo oni?",
      "Predlagaj rešitev ki je poštena za oba.",
    ],
    reward: { type: "xp", amount: 30 },
  },
};

function handleEqMission(agentId, mission) {
  const flow = EQ_FLOWS[mission.eqType];
  if (!flow) return;

  let step = 0;

  function showStep() {
    const d = document.querySelector(".eq-dialog");
    if (d) d.remove();

    if (step >= flow.steps.length) {
      // Zaključek
      _finishEqMission(agentId, mission, flow);
      return;
    }

    const el = document.createElement("div");
    el.className = "joker-dialog eq-dialog";
    el.innerHTML = `<div class="joker-dialog__box">
      <div class="joker-dialog__icon">${flow.icon}</div>
      <p class="joker-dialog__title">${flow.title}</p>
      <div style="background:#F2F2F7;border-radius:14px;padding:14px;width:100%;margin:4px 0">
        <p style="font-size:.65rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#8E8E93;margin-bottom:6px">
          KORAK ${step+1} / ${flow.steps.length}
        </p>
        <p style="font-size:.92rem;font-weight:600;color:#1C1C1E;line-height:1.5">${flow.steps[step]}</p>
      </div>
      <div class="joker-dialog__btns">
        <button class="joker-dialog__cancel">Prekliči</button>
        <button class="joker-dialog__confirm">${step < flow.steps.length - 1 ? "Naslednji →" : "Zaključi ✓"}</button>
      </div>
    </div>`;
    document.body.appendChild(el);
    el.querySelector(".joker-dialog__cancel").addEventListener("click", () => el.remove());
    el.querySelector(".joker-dialog__confirm").addEventListener("click", () => {
      el.remove();
      step++;
      showStep();
    });
  }

  showStep();
}

function _finishEqMission(agentId, mission, flow) {
  const name = LONA_CONFIG.agents.find(a => a.id === agentId)?.name || agentId;
  const rew  = flow.reward;

  if (rew.type === "joker") {
    earnJoker(agentId, rew.amount);
    lonaToast(`${name} dobil ${rew.amount} Joker! 🃏`, "gold");
  } else {
    addXp(agentId, rew.amount);
    if (typeof showXpFloat === "function") showXpFloat(rew.amount);
    lonaToast(`${name} +${rew.amount} XP — EQ Operacija ✓`, "green");
  }

  logMission(agentId, mission.id, rew.type === "xp" ? rew.amount : 0, { label: mission.label }, false);

  if (mission.cooldownHrs) {
    setCooldown(mission.id, mission.cooldownHrs);
    if (typeof renderMissionsGrid === "function") {
      setTimeout(() => renderMissionsGrid(window.currentCat || "all"), 100);
    }
  }

  if (typeof showStamp === "function") showStamp("EQ ✓", "green");
  if (typeof addSeasonXp === "function" && rew.type === "xp") addSeasonXp(agentId, rew.amount);
  if (typeof addAttrXp   === "function" && rew.type === "xp") addAttrXp(agentId, mission.id, rew.amount);
}

function initEq() {
  // Ni posebne inicializacije potrebne
}
