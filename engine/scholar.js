// ============================================================
//  LONA OS — engine/scholar.js
//  Scholar — Knjižni Molj, branje = XP
// ============================================================

const SCHOLAR_KEY = "lona_scholar_sessions";

function scholarLoad() {
  return JSON.parse(localStorage.getItem(SCHOLAR_KEY) || "[]");
}

function scholarSave(sessions) {
  localStorage.setItem(SCHOLAR_KEY, JSON.stringify(sessions));
}

function scholarStartSession(agentId, bookTypeId, forYounger) {
  const sessions = scholarLoad();
  // Preveri ali ima že aktivno
  const active = sessions.find(s => s.agentId === agentId && !s.completed);
  if (active) { lonaToast("Že imaš aktivno branje!", "red"); return; }

  sessions.push({
    agentId,
    bookTypeId,
    forYounger: !!forYounger,
    startDate:  new Date().toDateString(),
    completed:  false,
  });
  scholarSave(sessions);
  const bt = LONA_CONFIG.scholar.bookTypes.find(b => b.id === bookTypeId);
  lonaToast(`📚 Branje začeto: ${bt?.label}!`, "cyan");
  renderScholarPanel(agentId);
}

function scholarCompleteSession(agentId) {
  const sessions = scholarLoad();
  const idx = sessions.findIndex(s => s.agentId === agentId && !s.completed);
  if (idx < 0) { lonaToast("Ni aktivnega branja!", "red"); return; }

  const session = sessions[idx];
  const bt      = LONA_CONFIG.scholar.bookTypes.find(b => b.id === session.bookTypeId);
  if (!bt) return;

  let xp = bt.baseXp;
  if (session.forYounger) xp *= LONA_CONFIG.scholar.familyClubMultiplier;

  session.completed = true;
  session.endDate   = new Date().toDateString();
  scholarSave(sessions);

  addXp(agentId, xp);
  if (typeof showXpFloat === "function") showXpFloat(xp);
  if (typeof addSeasonXp === "function") addSeasonXp(agentId, xp);
  if (typeof addAttrXp   === "function") addAttrXp(agentId, "scholar_reading", xp);
  logMission(agentId, "scholar_reading", xp, { label: "Branje" }, false);

  lonaToast(`📚 Branje zaključeno! +${xp} XP${session.forYounger ? " (×2 Mlajšemu!)" : ""}`, "gold");
  if (typeof showScrollBurn === "function") showScrollBurn(bt.label, xp);
  renderScholarPanel(agentId);
}

function renderScholarPanel(agentId) {
  const el = document.getElementById("scholar-panel");
  if (!el) return;

  const sessions  = scholarLoad();
  const active    = sessions.find(s => s.agentId === agentId && !s.completed);
  const cfg       = LONA_CONFIG.scholar;
  const bookTypes = cfg.bookTypes;

  if (active) {
    const bt = bookTypes.find(b => b.id === active.bookTypeId);
    const xp = active.forYounger ? bt.baseXp * cfg.familyClubMultiplier : bt.baseXp;
    el.innerHTML = `
      <div class="scholar-panel">
        <p class="scholar-panel__title">📚 ${cfg.label}</p>
        <div class="scholar-active">
          <p class="scholar-active__label">Aktivno: <strong>${bt?.label}</strong></p>
          ${active.forYounger ? '<p style="color:#007AFF;font-size:.75rem;font-weight:700">📖 Za mlajšega — ×2 XP!</p>' : ""}
          <p class="scholar-active__xp">+${xp} XP ob zaključku</p>
          <button class="scholar-btn scholar-btn--complete"
            onclick="showScholarBriefing('${agentId}')">
            📋 ${cfg.briefingLabel}
          </button>
        </div>
      </div>`;
  } else {
    el.innerHTML = `
      <div class="scholar-panel">
        <p class="scholar-panel__title">📚 ${cfg.label}</p>
        <div class="scholar-books">
          ${bookTypes.map(bt => `
            <button class="scholar-book-btn" onclick="scholarStartSession('${agentId}','${bt.id}',false)">
              <span class="scholar-book-btn__label">${bt.label}</span>
              <span class="scholar-book-btn__xp">+${bt.baseXp} XP</span>
            </button>
          `).join("")}
        </div>
        <button class="scholar-btn scholar-btn--family"
          onclick="showScholarFamilyPicker('${agentId}')">
          👨‍👦 Beri mlajšemu (×${cfg.familyClubMultiplier} XP)
        </button>
      </div>`;
  }
}

function showScholarBriefing(agentId) {
  const d = document.createElement("div");
  d.className = "joker-dialog";
  d.innerHTML = `<div class="joker-dialog__box">
    <div class="joker-dialog__icon">📋</div>
    <p class="joker-dialog__title">Ustni Brifing</p>
    <p class="joker-dialog__body">
      Povedaj Poveljniku:<br>
      <strong>1. O čem je bila knjiga?</strong><br>
      <strong>2. Kateri lik ti je bil všeč in zakaj?</strong><br>
      <strong>3. Kaj bi spremenil v zgodbi?</strong>
    </p>
    <p style="font-size:.72rem;color:#8E8E93;text-align:center">Starš potrdi ko je brifing opravljen.</p>
    <div class="joker-dialog__btns">
      <button class="joker-dialog__cancel">Prekliči</button>
      <button class="joker-dialog__confirm">Brifing Opravljen ✓</button>
    </div>
  </div>`;
  document.body.appendChild(d);
  d.querySelector(".joker-dialog__cancel").addEventListener("click", () => d.remove());
  d.querySelector(".joker-dialog__confirm").addEventListener("click", () => {
    d.remove();
    scholarCompleteSession(agentId);
  });
}

function showScholarFamilyPicker(agentId) {
  const d = document.createElement("div");
  d.className = "joker-dialog";
  const bookTypes = LONA_CONFIG.scholar.bookTypes;
  const mul = LONA_CONFIG.scholar.familyClubMultiplier;
  d.innerHTML = `<div class="joker-dialog__box">
    <div class="joker-dialog__icon">👨‍👦</div>
    <p class="joker-dialog__title">Beri Mlajšemu (×${mul} XP)</p>
    <div class="joker-dialog__btns" style="flex-direction:column;gap:6px">
      ${bookTypes.map(bt => `
        <button class="joker-dialog__confirm" style="width:100%"
          onclick="scholarStartSession('${agentId}','${bt.id}',true);this.closest('.joker-dialog').remove()">
          ${bt.label} → +${bt.baseXp * mul} XP
        </button>
      `).join("")}
    </div>
    <button class="joker-dialog__cancel" style="margin-top:6px;width:100%"
      onclick="this.closest('.joker-dialog').remove()">Prekliči</button>
  </div>`;
  document.body.appendChild(d);
}

function initScholar() {
  const agentId = typeof getCurrentAgent === "function" ? getCurrentAgent() : null;
  if (!agentId) return;
  renderScholarPanel(agentId);
}
