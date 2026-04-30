const CAT_COLORS = {
  hygiene:'#34C759',kitchen:'#FF9500',cleaning:'#007AFF',organisation:'#AF52DE',
  care:'#FF2D55',outdoor:'#30D158',body:'#FF3B30',safety:'#FF3B30',
  money:'#FFD60A',social:'#5AC8FA',creativity:'#FF9500',custom:'#5AAF7A',
  fear:'#AF52DE',independence:'#007AFF',eq:'#AF52DE',fitness:'#FF6B00',
};
const CAT_NAMES = {
  hygiene:'Higiena',kitchen:'Kuhinja',cleaning:'Čiščenje',organisation:'Organizacija',
  care:'Skrb',outdoor:'Outdoor',body:'Telo',safety:'Varnost',money:'Denar',
  social:'Socialne',creativity:'Ustvarjalnost',custom:'Moje',fear:'Strah',
  independence:'Samostojnost',eq:'EQ',
};

// ============================================================
//  LONA OS — engine.js  (v2.6)
//  Vstopna točka — inicializira vse module
// ============================================================

// ── MISSION LOG ────────────────────────────────────────────
function logMission(agentId, missionId, xp, modifier, compromised) {
  const log = JSON.parse(localStorage.getItem("lona_mission_log") || "[]");
  log.push({
    agentId, missionId, xp, compromised,
    modifier: modifier?.label || "—",
    date: new Date().toISOString(),
  });
  if (log.length > 100) log.splice(0, log.length - 100);
  localStorage.setItem("lona_mission_log", JSON.stringify(log));

  // Štej dnevne misije
  if (typeof addDailyCount === "function") {
    const count = addDailyCount(agentId);
    if (count >= DAILY_MAX) {
      lonaToast("🔒 Dnevni limit dosežen! Odlično! 🏆", "gold");
      setTimeout(() => renderMissionsGrid(), 200);
    }
  }
  // Dodaj kovance
  if (typeof addCoins === "function" && xp > 0) {
    const mission = LONA_CONFIG.missions[missionId];
    const coins   = mission?.coins || Math.round(xp * (LONA_CONFIG.coinsPerXp || 0.4));
    addCoins(agentId, coins);
    if (typeof renderCmdAgents === "function") renderCmdAgents();
  }
}

// ── CURRENT AGENT ─────────────────────────────────────────
function getCurrentAgent() {
  return localStorage.getItem("lona_current_agent") || LONA_CONFIG.agents[0].id;
}

// ── TOAST ──────────────────────────────────────────────────
function lonaToast(msg, color) {
  const c = { green:"#2D7D52", gold:"#C47D1A", red:"#C4352A", cyan:"#2563EB" };
  const bg = { green:"#EAF4EE", gold:"#FDF3E3", red:"#FDECEA", cyan:"#EEF3FD" };
  const clr = c[color] || c.green;
  const bgClr = bg[color] || bg.green;
  const el = document.createElement("div");
  el.style.cssText = `
    position:fixed;bottom:90px;left:50%;transform:translateX(-50%);
    background:${bgClr};border:1px solid ${clr}44;color:${clr};
    padding:10px 18px;border-radius:12px;font-size:.85rem;font-weight:600;
    z-index:9000;white-space:nowrap;
    box-shadow:0 4px 16px rgba(0,0,0,.12);
    font-family:var(--font-sans, sans-serif);
    animation:fadeInUp .25s ease;
  `;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

// ── MISSION FUNNEL CONFIG ──────────────────────────────────
// Ozemlja po misiji
const MISSION_ZONES = {
  sesanje:    ["En prostor", "Dva prostora", "Cela hiša"],
  posoda:     null,  // auto — sistem sam izbere
  perilo:     ["En kup", "Cela gora"],
  kuhanje:    ["Priprava", "Kuhanje", "Pospravljanje po"],
  skrivna_wc: null,
  wc:         null,  // auto
};

const MISSION_ZONES_AUTO = {
  posoda:     ["Zloži ven", "Zloži noter", "Oboje"],
  skrivna_wc: ["Skrivna"],
  wc:         ["WC"],
};

// Modifikatorji po misiji
const MISSION_MODIFIERS = {
  sesanje: [
    { icon:"🐻", label:"Medvedja hoja",       text:"Sesalec potiskaš samo po vseh štirih!" },
    { icon:"🦀", label:"Rakova hoja",          text:"Po vseh štirih — trebuh gor, sesalec med nogami." },
    { icon:"🦩", label:"Štorklja",             text:"Sešeš samo na eni nogi. Menjava pri vsaki sobi." },
    { icon:"🤫", label:"Tihi agent",           text:"Sesalec se ne sme dotakniti pohištva. Nič hrupa." },
    { icon:"⚡", label:"Turbo",                text:"5 minut — štoparica teče. Kaj se da?" },
    { icon:"🙈", label:"Navigacija na slepo",  text:"Eden zapre oči, drugi usmerja: levo, desno, stop." },
  ],
  posoda: [
    { icon:"🤫", label:"Tihi agent",           text:"Niti en 'klink'. Vsak zvok = -2 XP." },
    { icon:"⚡", label:"Turbo",                text:"3 minute — vse zloženo preden odteče čas." },
    { icon:"🎯", label:"Sortiranje",           text:"Najprej vilice, potem žlice, potem noži — po velikosti." },
    { icon:"🧤", label:"Ena roka",             text:"Zlagaš samo z eno roko. Druga je za hrbtom." },
    { icon:"🦩", label:"Štorklja",             text:"Med zlaganjem stojiš na eni nogi." },
  ],
  perilo: [
    { icon:"🐻", label:"Medvedja hoja",        text:"Vsak kos perila prineseš po vseh štirih." },
    { icon:"🦀", label:"Rakova hoja",          text:"Transport do stroja — trebuh gor, kos perila na trebuhu." },
    { icon:"🔍", label:"Detektiv",             text:"Preveri vsak žep! Skrit kovanec = bonus. Robček = kazen." },
    { icon:"🎯", label:"Sortiranje",           text:"Najprej temno, potem svetlo, potem barvno." },
    { icon:"⚡", label:"Turbo",                text:"Cela gora v 4 minute. Štoparica!" },
  ],
  kuhanje: [
    { icon:"🧑‍🍳", label:"Šef govori",        text:"Starš samo naroča, ti izvajaš. Brez vprašanj." },
    { icon:"🤫", label:"Tiha kuhinja",         text:"Nič glasnega odlaganja. Kuhinja ostane tiha." },
    { icon:"⚡", label:"Turbo prep",           text:"Vse sestavine pripravljene v 3 minutah." },
    { icon:"🎯", label:"Natančnost",           text:"Meriš vse — žlice, grami. Nič na oko." },
    { icon:"🧤", label:"Ena roka",             text:"Rezanje in mešanje samo z eno roko." },
  ],
  skupna: [
    { icon:"🐻", label:"Medvedja hoja",    text:"Oba prenašata skupaj po vseh štirih!" },
    { icon:"🙈", label:"Navigacija slepo", text:"Eden zapre oči, drugi usmerja." },
    { icon:"⚡", label:"Turbo skupaj",     text:"5 minut — skupaj naredita vse!" },
    { icon:"🤫", label:"Tiha ekipa",       text:"Nobenih besed — samo geste!" },
  ],
  skrivna_wc: [],
  // Varnost
  prva_pomoc: [
    { icon:"🩹", label:"Detektiv ran",    text:"Poišči vse v prvi pomoči in povej za kaj je." },
    { icon:"🎭", label:"Igranje vlog",    text:"Starš se pretvarja da je poškodovan — ti pomagaš." },
    { icon:"⏱️", label:"Na čas",          text:"Koliko časa rabiš za povoj?" },
  ],
  klic_112: [
    { icon:"🎭", label:"Vaja klic",       text:"Zaigrajta scenarij — ti kličeš, starš je dispečer." },
    { icon:"📍", label:"Naslov agent",    text:"Povej točen naslov iz glave — brez gledanja." },
    { icon:"🧠", label:"Kaj poveš?",      text:"Naštej vse informacije ki jih moraš povedati." },
  ],
  varnost_ulica: [
    { icon:"🚦", label:"Zelena svetloba", text:"Prehod — poglej levo, desno, levo." },
    { icon:"🕵️", label:"Opazovalec",     text:"Poišči 3 potencialno nevarne situacije." },
    { icon:"🤝", label:"Varni odrasli",  text:"Kateri odrasli so varni za pomoč?" },
  ],

  // Denar
  stej_denar: [
    { icon:"🪙", label:"Hitrost",         text:"Preštej mešanico kovancev v 30 sekundah." },
    { icon:"💶", label:"Znesek",          text:"Sestavi točen znesek iz kovancev." },
    { icon:"🧮", label:"Drobiž nazaj",    text:"Starš da preveč — koliko vrneš nazaj?" },
  ],
  nakup_sam: [
    { icon:"🥷", label:"Nindža nakup",    text:"Sam plačaj brez pomoči — niti besede od starša." },
    { icon:"📝", label:"Seznam agent",    text:"Zapomni si 3 stvari brez zapiskov." },
    { icon:"💰", label:"Najcenejše",      text:"Najdi najcenejšo varianto na polici." },
  ],

  // Socialne
  predstavi_se: [
    { icon:"🎯", label:"3 dejstva",       text:"Povej ime, starost in eno posebno stvar o sebi." },
    { icon:"👁️", label:"Očesni stik",    text:"Med pogovorom vzdržuj očesni stik." },
    { icon:"🤝", label:"Rokovanje",       text:"Trden stisk roke + nasmeh." },
  ],
  telefon_klic: [
    { icon:"🎭", label:"Vaja doma",       text:"Najprej z mano poigraj scenarij." },
    { icon:"🥷", label:"Sam pokliči",     text:"Pokliči zobozdravnika/frizerja — sam naroči termin." },
    { icon:"📝", label:"Beležka",         text:"Med klicem napiši vse pomembne info." },
  ],

  // Ustvarjalnost
  izum: [
    { icon:"⏱️", label:"5 minut",         text:"Imaš 5 minut in 3 predmete — kaj narediš?" },
    { icon:"🌍", label:"Problem sveta",   text:"Reši en problem ki ga vidiš doma." },
    { icon:"🎨", label:"Nariši izum",     text:"Skiciraj in razloži kako deluje." },
  ],
  zgodba: [
    { icon:"🎭", label:"Brez konca",      text:"Začni zgodbo — starš jo nadaljuje — ti zaključiš." },
    { icon:"🎲", label:"3 besede",        text:"Starš da 3 besede — ti naredis zgodbo iz njih." },
    { icon:"😂", label:"Smešna zgodba",   text:"Zgodba mora vsebovati vsaj 2 šali." },
  ],

  // Telo
  raztezanje: [
    { icon:"🧘", label:"Yoga jutro",      text:"5 joga položajev — drži vsak 30 sekund." },
    { icon:"💨", label:"Dihanje",         text:"4-7-8 tehnika: vdih 4s, zadrži 7s, izdih 8s." },
    { icon:"🌅", label:"Sončni pozdrav",  text:"Naredi 3 sončne pozdrave zapored." },
  ],
  tek: [
    { icon:"⏱️", label:"Sprint",          text:"3x 30-sekundni sprint z odmorom." },
    { icon:"🌿", label:"Narava tek",      text:"Bosi po travi — 5 minut." },
    { icon:"🎵", label:"Ritem",           text:"Teci v ritmu pesmi ki jo brenčiš." },
  ],

  listi: [
    { icon:"🔍", label:"Detektiv",      text:"Poišči 5 RAZLIČNIH listov — oblika, barva, velikost." },
    { icon:"🎨", label:"Umetnik",       text:"Nariši vsak list ki ga najdeš." },
    { icon:"⚡", label:"Hitrostni lov", text:"2 minuti — kdo najde več vrst?" },
  ],
  pot: [
    { icon:"🥷", label:"Nindža čiščenje", text:"Brez hrupa, brez opomina." },
    { icon:"⏱️", label:"Hitrostni rekord", text:"Izmeri čas — poraziš rekord?" },
    { icon:"📋", label:"Inspektor",        text:"Preveri vsak centimeter. Starš oceni 1-10." },
  ],
  vrt: [
    { icon:"🌱", label:"Botanik",    text:"Identificiraj 3 rastline ki rasteš." },
    { icon:"💧", label:"Vodovod",    text:"Zalij NATANČNO — ne preveč, ne premalo." },
    { icon:"🔬", label:"Opazovalec", text:"Poišči žuželko in jo opisuj 1 minuto." },
  ],
  narava_foto: [
    { icon:"🎯", label:"Tema: Simetrija",  text:"Najdi 3 simetrične objekte v naravi." },
    { icon:"🌈", label:"Tema: Barve",      text:"Vsaka barva mavrice — ena fotografija." },
    { icon:"🔍", label:"Makro izziv",      text:"Fotografiraj kar je manjše od tvoje roke." },
  ],
  orientacija_out: [
    { icon:"☀️", label:"Sončna metoda",  text:"Najdi sever samo s senco in palico." },
    { icon:"⭐", label:"Zvezde",          text:"Ponoči poišči Severnico." },
    { icon:"🗺️", label:"Brez kompasa",   text:"Navigiraj 100m samo z opazovanjem." },
  ],
  taborisce: [
    { icon:"⚡", label:"Speed Camp",    text:"Postavi taborišče v 10 minutah." },
    { icon:"🌧️", label:"Mokri izziv",   text:"Postavi taborišče ki bo suho tudi v dežju." },
    { icon:"🌙", label:"Nočni tabor",   text:"Zvečer — vse postaviti pred temo." },
  ],
  wc: [
    { icon:"🥷", label:"Nindža čiščenje",  text:"Preden te kdo opazi — hitro in tiho." },
    { icon:"⚡", label:"Turbo",            text:"5 minut — vse mora sijati." },
    { icon:"🔍", label:"Inspektor",        text:"Preveri vsak kot. Starš bo pregledal z belim robcem." },
    { icon:"🤫", label:"Tiho čiščenje",    text:"Nobenih glasnih gibov. Tiho kot miška." },
  ],
};

// ── STEP 1: OZEMLJE ────────────────────────────────────────
function showZonePicker(missionId, callback) {
  const zones = MISSION_ZONES[missionId];

  // Null = auto izbira, brez dialoga
  if (!zones) {
    const autoZones = MISSION_ZONES_AUTO[missionId] || ["Standardno"];
    const picked = autoZones[Math.floor(Math.random() * autoZones.length)];
    callback(picked);
    return;
  }

  const d = document.createElement("div");
  d.className = "joker-dialog";
  const btns = zones.map(z =>
    `<button class="funnel-btn" data-zone="${z}">${z}</button>`
  ).join("");
  d.innerHTML = `<div class="joker-dialog__box">
    <div class="joker-dialog__icon">🗺️</div>
    <p class="joker-dialog__title">Kje bo misija?</p>
    <div class="funnel-grid">${btns}</div>
    <button class="joker-dialog__cancel" style="margin-top:10px;width:100%">Prekliči</button>
  </div>`;
  document.body.appendChild(d);
  d.querySelector(".joker-dialog__cancel").addEventListener("click", () => d.remove());
  d.querySelectorAll(".funnel-btn").forEach(b => {
    b.addEventListener("click", () => { d.remove(); callback(b.dataset.zone); });
  });
}

// ── STEP 2: MODIFIKATOR ────────────────────────────────────
function showModifier(missionId, callback) {
  const pool = MISSION_MODIFIERS[missionId] || MISSION_MODIFIERS.sesanje;
  const mod = pool[Math.floor(Math.random() * pool.length)];
  const d = document.createElement("div");
  d.className = "joker-dialog";
  d.innerHTML = `<div class="joker-dialog__box">
    <div class="joker-dialog__icon">${mod.icon}</div>
    <p class="joker-dialog__title">${mod.label}</p>
    <p class="joker-dialog__body" style="font-size:.95rem;color:var(--text-primary)">${mod.text}</p>
    <div class="joker-dialog__btns" style="margin-top:4px">
      <button class="joker-dialog__cancel">Premešaj 🔀</button>
      <button class="joker-dialog__confirm">Sprejmi ✓</button>
    </div>
  </div>`;
  document.body.appendChild(d);
  // Premešaj → nov modifikator
  d.querySelector(".joker-dialog__cancel").addEventListener("click", () => {
    d.remove(); showModifier(missionId, callback);
  });
  d.querySelector(".joker-dialog__confirm").addEventListener("click", () => {
    d.remove(); callback(mod);
  });
}

// ── JOKER VERJETNOST ──────────────────────────────────────
function jokerProbability(count) {
  if (count <= 0) return 0;
  if (count === 1) return 0.20;
  if (count === 2) return 0.35;
  return 0.50; // 3+
}

// ── STEP 3: MODIFIKATOR DIALOG (joker pade nepričakovano) ──
function showMissionConfirm(agentId, missionLabel, mod, callback) {
  const jokers = getJokers(agentId);
  const name   = LONA_CONFIG.agents.find(a => a.id === agentId)?.name || agentId;

  // Tiho vrži kocko — joker pade PRED potrditvijo
  const jokerFalls = Math.random() < jokerProbability(jokers);

  if (jokerFalls) {
    // Kratka zakasnitev — kot da sistem "razmišlja"
    setTimeout(() => {
      const d = document.createElement("div");
      d.className = "joker-dialog";
      d.innerHTML = `<div class="joker-dialog__box" style="border-color:rgba(255,209,102,.6);box-shadow:0 0 40px rgba(255,209,102,.2)">
        <div class="joker-dialog__icon" style="font-size:3rem;animation:pulse-dot 1s ease-in-out infinite">🃏</div>
        <p class="joker-dialog__title" style="color:var(--neon-gold);font-size:1.3rem">JOKER!</p>
        <p class="joker-dialog__body" style="font-size:.9rem">
          <strong>${name}</strong> ima srečo —<br>
          <em>${missionLabel}</em> je danes preskočena!<br>
          <span style="font-size:.75rem;color:var(--text-dim)">Jokerjev ostane: ${jokers - 1}</span>
        </p>
        <div class="joker-dialog__btns">
          <button class="joker-dialog__cancel">Vseeno opravi</button>
          <button class="joker-dialog__confirm" style="background:rgba(255,209,102,.15);border-color:rgba(255,209,102,.5);color:var(--neon-gold)">Sprejmi! 🃏</button>
        </div>
      </div>`;
      document.body.appendChild(d);
      d.querySelector(".joker-dialog__cancel").addEventListener("click", () => { d.remove(); callback(false); });
      d.querySelector(".joker-dialog__confirm").addEventListener("click", () => {
        d.remove();
        spendJoker(agentId);
        lonaToast(`Joker! ${name} je prost danes 🃏`, "gold");
        callback(true);
      });
    }, 400);
    return;
  }

  // Normalen povzetek
  const d = document.createElement("div");
  d.className = "joker-dialog";
  d.innerHTML = `<div class="joker-dialog__box">
    <div class="joker-dialog__icon">${mod.icon}</div>
    <p class="joker-dialog__title">${mod.label}</p>
    <p class="joker-dialog__body" style="font-size:.92rem;color:var(--text-primary)">${mod.text}</p>
    <div class="mission-summary" style="margin-top:8px">
      <div class="summary-row">
        <span class="summary-label">Misija</span>
        <span class="summary-val">${missionLabel}</span>
      </div>
      ${jokers > 0 ? `<div class="summary-row"><span class="summary-label">Jokerji</span><span class="summary-val" style="color:var(--neon-gold)">🃏 ×${jokers}</span></div>` : ""}
    </div>
    <div class="joker-dialog__btns">
      <button class="joker-dialog__cancel">Prekliči</button>
      <button class="joker-dialog__confirm">Gremo! 🚀</button>
    </div>
  </div>`;
  document.body.appendChild(d);
  d.querySelector(".joker-dialog__cancel").addEventListener("click", () => d.remove());
  d.querySelector(".joker-dialog__confirm").addEventListener("click", () => { d.remove(); callback(false); });
}

// ── AGENT PICKER ───────────────────────────────────────────
function showAgentPicker(callback) {
  const d = document.createElement("div");
  d.className = "joker-dialog";
  const btns = LONA_CONFIG.agents.map(a =>
    `<button class="agent-pick-btn" data-id="${a.id}">${a.avatar} ${a.name}</button>`
  ).join("");
  d.innerHTML = `<div class="joker-dialog__box">
    <p class="joker-dialog__title">Kdo je opravil misijo?</p>
    <div class="joker-dialog__btns">${btns}</div>
    <button class="joker-dialog__cancel" style="margin-top:8px;width:100%">Prekliči</button>
  </div>`;
  document.body.appendChild(d);
  d.querySelector(".joker-dialog__cancel").addEventListener("click", () => d.remove());
  d.querySelectorAll(".agent-pick-btn").forEach(b => {
    b.addEventListener("click", () => { d.remove(); callback(b.dataset.id); });
  });
}

// ── QUALITY CHECK (Mission Compromised) ───────────────────
function showQualityCheck(agentId, mission, mod, callback) {
  const name   = LONA_CONFIG.agents.find(a => a.id === agentId)?.name || agentId;
  const xp     = mission.baseXp || mission.xp || 20;
  const coins  = mission.coins  || Math.round(xp * (LONA_CONFIG.coinsPerXp || 0.4));
  const isEqAc = mission.eqType === "akcija";

  const d = document.createElement("div");
  d.className = "joker-dialog";
  d.innerHTML = `<div class="joker-dialog__box">
    <div style="font-size:2.2rem">${mission.icon || "📋"}</div>
    <p style="font-family:'DM Serif Display',serif;font-size:1.05rem;color:#F7F4EF;margin:0;text-align:center">${mission.label}</p>
    <p style="font-size:.78rem;color:rgba(247,244,239,.45);text-align:center;margin:2px 0 10px">${mission.desc || ""}</p>

    <div style="display:flex;gap:8px;width:100%;justify-content:center;margin-bottom:6px">
      <div style="text-align:center;padding:8px 12px;background:rgba(90,175,122,.12);border:1px solid rgba(90,175,122,.25);border-radius:12px;flex:1">
        <p style="font-size:1.2rem;font-weight:800;color:#5AAF7A;margin:0">+${xp}</p>
        <p style="font-size:.6rem;color:rgba(247,244,239,.4);margin:0;text-transform:uppercase">XP</p>
      </div>
      <div style="text-align:center;padding:8px 12px;background:rgba(255,214,10,.1);border:1px solid rgba(255,214,10,.2);border-radius:12px;flex:1">
        <p style="font-size:1.2rem;font-weight:800;color:#FFD60A;margin:0">+${coins}</p>
        <p style="font-size:.6rem;color:rgba(247,244,239,.4);margin:0;text-transform:uppercase">🪙</p>
      </div>
      ${isEqAc ? `<div style="text-align:center;padding:8px 12px;background:rgba(255,209,102,.1);border:1px solid rgba(255,209,102,.2);border-radius:12px;flex:1">
        <p style="font-size:1.2rem;font-weight:800;color:#FFD60A;margin:0">+1</p>
        <p style="font-size:.6rem;color:rgba(247,244,239,.4);margin:0;text-transform:uppercase">🃏</p>
      </div>` : ""}
    </div>

    <div class="joker-dialog__btns">
      <button class="joker-dialog__cancel" style="border-color:rgba(255,60,90,.3);color:#FF3B30">⚠️ Površno</button>
      <button class="joker-dialog__confirm">✓ Potrdi</button>
    </div>
    <p style="font-size:.68rem;color:rgba(247,244,239,.3);text-align:center;margin-top:2px">Površno = pol točk</p>
  </div>`;
  document.body.appendChild(d);

  d.querySelector(".joker-dialog__cancel").addEventListener("click", () => {
    d.remove();
    lonaToast(`⚠️ Površno — +${Math.floor(xp/2)} XP`, "red");
    callback(true, false);
  });
  d.querySelector(".joker-dialog__confirm").addEventListener("click", () => {
    d.remove();
    lonaToast(`+${xp} XP +${coins} 🪙 ✓`, "green");
    callback(false, false);
  });
}

// ── HELPER: zakleni mission gumb ─────────────────────────
function _lockBtn(b) {
  if (!b) return;
  b.classList.remove("mission-btn--available","mission-btn--special","mission-btn--mastery");
  b.classList.add("mission-btn--locked");
  b.disabled = true;
  b.style.opacity = "";
  b.style.pointerEvents = "";
  const top = b.querySelector(".mission-btn__top");
  if (top && !top.querySelector(".mission-btn__lock")) {
    const lk = document.createElement("span");
    lk.className = "mission-btn__lock"; lk.textContent = "🔒";
    top.appendChild(lk);
  }
  b.querySelector(".mission-btn__avail-dot")?.remove();
}

// ── MISSION CLICK — GLAVNI FLOW ────────────────────────────
function onMissionClick(btn) {
  const missionId = btn.dataset.mission;
  // Preveri custom misije
  let mission = LONA_CONFIG.missions[missionId];
  if (!mission && typeof customLoad === 'function') {
    mission = customLoad().find(m => m.id === missionId);
  }
  if (!mission) return;

  // Gatekeeper ni odobren
  if (btn.dataset.gkLocked === "1") {
    lonaToast("Najprej opravi Standard 0! 🔒", "red");
    return;
  }

  // Zaklenjeno s cooldownom → Joker ponudi
  if (btn.classList.contains("mission-btn--locked")) {
    const ms = getCooldownMs(missionId);
    if (ms > 0) {
      // Pokaži koliko časa še — in ponudi joker
      const d = document.createElement("div");
      d.className = "joker-dialog";
      d.innerHTML = `<div class="joker-dialog__box">
        <div class="joker-dialog__icon">🔒</div>
        <p class="joker-dialog__title">${mission.label}</p>
        <p class="joker-dialog__body">Misija se odklene čez<br><strong style="font-size:1.1rem">${fmtMs(ms)}</strong></p>
        <div class="joker-dialog__btns">
          <button class="joker-dialog__cancel">Zapri</button>
          <button class="joker-dialog__confirm">Uporabi Joker 🃏</button>
        </div>
      </div>`;
      document.body.appendChild(d);
      d.querySelector(".joker-dialog__cancel").addEventListener("click", () => d.remove());
      d.querySelector(".joker-dialog__confirm").addEventListener("click", () => {
        d.remove();
        const agentId = getCurrentAgent();
        if (getJokers(agentId) <= 0) {
          lonaToast("Nimaš Jokerjev!", "red");
          return;
        }
        spendJoker(agentId);
        showJokerFly();
        localStorage.removeItem("lona_cooldown_" + missionId);
        renderCooldown(missionId);
        lonaToast("Joker porabljen — misija odklenjena! 🃏", "gold");
        updateMissionsBadge();
      });
    }
    return;
  }

  // Gatekeeper ni odobren — blokiraj
  if (!isGatekeeperApproved()) {
    lonaToast("Najprej opravi Standard 0! 🔒", "red");
    return;
  }

  // Izvidniški bonus — starš sam potrdi kaj je otrok opazil
  if (mission.isScout) {
    const agentId   = getCurrentAgent();
    const agentName = LONA_CONFIG.agents.find(a => a.id === agentId)?.name || agentId;

    // XP možnosti
    const xpOptions = [10, 15, 20, 25, 30, 40, 50];

    const d = document.createElement("div");
    d.className = "joker-dialog";
    const optBtns = xpOptions.map(v =>
      `<button class="funnel-btn" data-xp="${v}">+${v} XP</button>`
    ).join("");
    d.innerHTML = `<div class="joker-dialog__box">
      <div class="joker-dialog__icon">👁️</div>
      <p class="joker-dialog__title">Izvidniški Bonus</p>
      <p class="joker-dialog__body">
        <strong>${agentName}</strong> je sam opazil priložnost<br>in jo opravil brez opomnika.<br>
        <span style="font-size:.8rem;color:#8A8480">Koliko XP je vredno?</span>
      </p>
      <div class="funnel-grid" style="margin-top:4px">${optBtns}</div>
      <button class="joker-dialog__cancel" style="margin-top:8px;width:100%">Prekliči</button>
    </div>`;
    document.body.appendChild(d);
    d.querySelector(".joker-dialog__cancel").addEventListener("click", () => d.remove());
    d.querySelectorAll(".funnel-btn").forEach(b => {
      b.addEventListener("click", () => {
        d.remove();
        const xp = parseInt(b.dataset.xp);
        logMission(agentId, "izvidnik", xp, {label:"Izvidniški bonus"}, false);
        addXp(agentId, xp);
        lonaToast(`${agentName} +${xp} XP — sam je opazil! 👁️`, "gold");
      });
    });
    return;
  }

  // Skupna misija — oba agenta dobita XP
  if (mission.isShared) {
    const d = document.createElement("div");
    d.className = "joker-dialog";
    const agents = LONA_CONFIG.agents;
    d.innerHTML = `<div class="joker-dialog__box">
      <div class="joker-dialog__icon">🤝</div>
      <p class="joker-dialog__title">Skupna misija!</p>
      <p class="joker-dialog__body">
        Oba agenta opravita nalogo skupaj.<br>
        Vsak dobi <strong>+${mission.baseXp} XP</strong>
      </p>
      <div class="joker-dialog__btns">
        <button class="joker-dialog__cancel">Prekliči</button>
        <button class="joker-dialog__confirm">Opravljeno ✓</button>
      </div>
    </div>`;
    document.body.appendChild(d);
    d.querySelector(".joker-dialog__cancel").addEventListener("click", () => d.remove());
    d.querySelector(".joker-dialog__confirm").addEventListener("click", () => {
      d.remove();
      showQualityCheck(getCurrentAgent(), mission, null, (compromised) => {
        const xp = compromised ? Math.floor(mission.baseXp / 2) : mission.baseXp;
        // Oba dobita XP
        LONA_CONFIG.agents.forEach(a => {
          logMission(a.id, missionId, xp, {label:"Skupna misija"}, compromised);
          addXp(a.id, xp);
        });
        if (!compromised) {
          lonaToast(`Oba +${xp} XP! 🤝`, "green");
        } else {
          lonaToast(`⚠️ Površno — oba +${xp} XP`, "red");
        }
        setTimeout(updateMissionsBadge, 100);
      });
    });
    return;
  }

  // Progressive misije — strah + samostojnost
  if (mission.isProgressive) {
    const agentId = getCurrentAgent();
    if (typeof handleProgressiveMission === "function") handleProgressiveMission(agentId, mission);
    return;
  }

  // EQ Operacije — poseben flow
  if (mission.isEq) {
    const agentId = getCurrentAgent();
    if (typeof handleEqMission === "function") handleEqMission(agentId, mission);
    return;
  }

  // Skrivna misija — najprej agent, potem naključna misija
  // Nič se ne zaklene — skrivna ostane vedno odprta
  if (mission.isHidden || missionId === "skrivna_wc") {
    const agentId   = getCurrentAgent();
    const pool      = Object.values(LONA_CONFIG.missions).filter(m => m.id !== "skrivna_wc" && !m.isHidden);
    const picked    = pool[Math.floor(Math.random() * pool.length)];
    const agentName = LONA_CONFIG.agents.find(a => a.id === agentId)?.name || agentId;
    const d = document.createElement("div");
    d.className = "joker-dialog";
    d.innerHTML = `<div class="joker-dialog__box">
      <div class="joker-dialog__icon">🎲</div>
      <p class="joker-dialog__title">Skrivna misija!</p>
      <p class="joker-dialog__body">
        <strong>${agentName}</strong> mora opraviti:<br>
        <strong style="font-size:1.1rem">${picked.label}</strong><br>
        <span style="color:#2D7D52;font-weight:600">+${picked.baseXp} XP</span>
      </p>
      <div class="joker-dialog__btns">
        <button class="joker-dialog__cancel">Prekliči</button>
        <button class="joker-dialog__confirm">Opravljeno ✓</button>
      </div>
    </div>`;
    document.body.appendChild(d);
    d.querySelector(".joker-dialog__cancel").addEventListener("click", () => d.remove());
    d.querySelector(".joker-dialog__confirm").addEventListener("click", () => {
      d.remove();
      showQualityCheck(agentId, picked, null, (compromised) => {
        const xp = compromised ? Math.floor(picked.baseXp / 2) : picked.baseXp;
        logMission(agentId, picked.id, xp, {label:"Skrivna misija"}, compromised);
        addXp(agentId, xp);
        lonaToast(compromised ? `⚠️ Površno — +${xp} XP` : `+${xp} XP zasluženo! ✓`, compromised ? "red" : "green");
        setTimeout(updateMissionsBadge, 100);
      });
    });
    return;
  }

  // Direktno na Commander potrditev
  const agentId = getCurrentAgent();
  showQualityCheck(agentId, mission, null, (compromised) => {
    const xp = compromised ? Math.floor((mission.baseXp || mission.xp || 20) / 2) : (mission.baseXp || mission.xp || 20);

    addXp(agentId, xp);

    if (!compromised && mission.cooldownHrs) {
      setCooldown(missionId, mission.cooldownHrs);
    }

    logMission(agentId, missionId, xp, { label: mission.label }, compromised);

    if (typeof showXpFloat === "function") showXpFloat(xp);

    const coins = mission.coins || Math.round(xp * (LONA_CONFIG.coinsPerXp || 0.4));
    lonaToast(compromised ? `⚠️ Površno — +${xp} XP` : `+${xp} XP  +${coins} 🪙 ✓`, compromised ? "red" : "green");

    setTimeout(() => {
      if (typeof _refreshCurrentView === "function") _refreshCurrentView();
      if (typeof renderCmdAgents     === "function") renderCmdAgents();
    }, 150);
  });
}


// ── MISSIONS BADGE ─────────────────────────────────────────
function updateMissionsBadge() {
  const badgeEl = document.querySelector(".section-header__badge");
  if (!badgeEl) return;
  const all    = document.querySelectorAll(".missions-grid .mission-btn[data-mission]").length;
  const locked = document.querySelectorAll(".missions-grid .mission-btn--locked").length;
  const avail  = all - locked;
  badgeEl.textContent = avail + " razpoložljive";
}

// ── INIT ───────────────────────────────────────────────────
// ── MISSIONS GRID RENDER ─────────────────────────────────────

const CAT_LABELS = {
  all: "⭐ Vse Misije", hygiene: "🧼 Higiena", kitchen: "🍳 Kuhinja",
  cleaning: "🧹 Čiščenje", organisation: "📦 Organizacija", care: "🤲 Skrb za Druge",
  outdoor: "🌿 Outdoor", body: "💪 Telo & Gibanje", safety: "🛡️ Varnost",
  money: "💰 Denar", social: "👥 Socialne", creativity: "🎨 Ustvarjalnost",
  eq: "🧠 EQ Operacije", fear: "🌙 Strah Protokol",
  independence: "🎯 Samostojnost", custom: "✏️ Moje Misije",
};

let currentCat = "all";

function renderMissionsGrid(cat) {
  const grid     = document.getElementById("missions-grid");
  const titleEl  = document.getElementById("missions-cat-title");
  const badgeEl  = document.getElementById("missions-badge");
  if (!grid) return;

  currentCat = cat || "all";
  const agentId  = getCurrentAgent();
  const allMissions = { ...LONA_CONFIG.missions };

  // Dodaj custom misije
  if (typeof customLoad === "function") {
    const customs = customLoad();
    (Array.isArray(customs) ? customs : Object.values(customs)).forEach(m => { allMissions[m.id] = m; });
  }

  // Filtriraj po kategoriji
  let filtered = Object.values(allMissions).filter(m => {
    if (m.isHidden) return false;
    if (currentCat === "all") return true;
    if (currentCat === "eq") return m.isEq;
    if (currentCat === "fear") return m.category === "fear";
    if (currentCat === "independence") return m.category === "independence";
    if (currentCat === "outdoor") return m.location === "outdoor" && !m.isEq && !m.isProgressive && !m.situation;
    if (currentCat === "custom") return m.category === "custom";
    return m.category === currentCat;
  });

  // Naslov
  if (titleEl) titleEl.textContent = CAT_LABELS[currentCat] || currentCat;
  if (badgeEl) {
    const avail = filtered.filter(m => !isOnCooldown(m.id)).length;
    badgeEl.textContent = avail + " razpoložljive";
    badgeEl.style.background = avail > 0 ? "var(--green)" : "var(--ink-4)";
  }

  // Render carousel
  grid.innerHTML = filtered.map(m => buildMissionBtn(m, agentId)).join("");

  // Event listenerji — klik na kartico
  grid.querySelectorAll(".mc-card[data-mission]").forEach(card => {
    card.addEventListener("click", () => {
      const idx = parseInt(card.dataset.carouselIdx || 0);
      if (idx !== _mcState.cur) { _mcSnapTo(idx); return; }
      if (navigator.vibrate) navigator.vibrate(15);
      onMissionClick(card);
    });
  });

  // Inicializiraj carousel
  initMissionCarousel(grid);
}

// ── MOUSE DRAG SCROLL z inercijo ─────────────────────────────
function initDragScroll(el) {
  if (!el) return;

  let isDown   = false;
  let startX   = 0;
  let scrollL  = 0;
  let velX     = 0;
  let lastX    = 0;
  let lastT    = 0;
  let rafId    = null;
  let moved    = false;

  // Inercija — teče naprej po spustu
  function momentum() {
    if (Math.abs(velX) < 0.5) return;
    el.scrollLeft -= velX;
    velX *= 0.92; // Trenje
    rafId = requestAnimationFrame(momentum);
  }

  el.addEventListener("mousedown", e => {
    isDown  = true;
    moved   = false;
    startX  = e.pageX;
    scrollL = el.scrollLeft;
    lastX   = e.pageX;
    lastT   = Date.now();
    velX    = 0;
    cancelAnimationFrame(rafId);
    el.style.cursor = "grabbing";
  });

  window.addEventListener("mouseup", () => {
    if (!isDown) return;
    isDown = false;
    el.style.cursor = "grab";
    // Zaženi inercijo
    rafId = requestAnimationFrame(momentum);
  });

  window.addEventListener("mousemove", e => {
    if (!isDown) return;
    const dx = e.pageX - startX;
    if (Math.abs(dx) > 5) moved = true;
    if (!moved) return;

    // Hitrost
    const now = Date.now();
    const dt  = now - lastT || 1;
    velX = (lastX - e.pageX) / dt * 12;
    lastX = e.pageX;
    lastT = now;

    el.scrollLeft = scrollL - dx;
    e.preventDefault();
  });

  // Blokiraj click če je bil drag
  el.addEventListener("click", e => {
    if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; }
  }, true);

  el.style.cursor = "grab";
}

function initCarouselDots(grid, total) {
  // Odstrani stare dots
  const existing = document.getElementById("carousel-dots");
  if (existing) existing.remove();

  if (total <= 2) return; // Premalo za dots

  const wrapper = grid.parentElement;
  const dots = document.createElement("div");
  dots.className = "carousel-dots";
  dots.id = "carousel-dots";

  // Max 10 dots
  const count = Math.min(total, 10);
  for (let i = 0; i < count; i++) {
    const dot = document.createElement("div");
    dot.className = "carousel-dot" + (i === 0 ? " carousel-dot--active" : "");
    dot.addEventListener("click", () => {
      const btnWidth = 140 + 12; // width + gap
      grid.scrollTo({ left: i * btnWidth, behavior: "smooth" });
    });
    dots.appendChild(dot);
  }
  wrapper.after(dots);

  // Posodobi dots ob scrollu
  grid.addEventListener("scroll", () => {
    const btnWidth = 140 + 12;
    const idx = Math.round(grid.scrollLeft / btnWidth);
    const dotEl = Math.min(idx, count - 1);
    dots.querySelectorAll(".carousel-dot").forEach((d, i) => {
      d.classList.toggle("carousel-dot--active", i === dotEl);
    });
  }, { passive: true });
}

function buildMissionBtn(mission, agentId) {
  const mId       = mission.id;
  const onCooldown = typeof isOnCooldown === "function" && isOnCooldown(mId);
  const xp        = mission.baseXp || mission.xp || 0;

  let cls = "mission-btn";
  let innerStyle = "";
  let afterBg    = "";
  const color = CAT_COLORS[mission.category] || CAT_COLORS[mission.location] || "#34C759";

  if (onCooldown) {
    cls += " mission-btn--locked";
    innerStyle = "background:linear-gradient(160deg,#C7C7CC,#A8A8B0);border-color:rgba(255,255,255,.2)";
    afterBg    = "#6E6E76";
  } else if (mission.isProgressive) {
    const level = typeof getProgLevel === "function" ? getProgLevel(agentId, mId) : 0;
    const total = mission.levels?.length || 3;
    const done  = level >= total;
    innerStyle  = done
      ? "background:linear-gradient(160deg,#5AC8FA,#34C759);border-color:rgba(255,255,255,.3)"
      : "background:linear-gradient(160deg,#CF8FFF,#AF52DE);border-color:rgba(255,255,255,.3)";
    afterBg     = done ? "#1A8A33" : "#7B2BAE";
  } else if (mission.isEq) {
    const eqColors = {
      nevtralizator: ["#4CD964","#2DB84B","#1A8A33"],
      debriefing:    ["#5AC8FA","#007AFF","#0055CC"],
      intel_report:  ["#CF8FFF","#AF52DE","#7B2BAE"],
      advokat:       ["#FFB340","#FF9500","#CC7000"],
    };
    const [c1,c2,c3] = eqColors[mId] || ["#CF8FFF","#AF52DE","#7B2BAE"];
    innerStyle = `background:linear-gradient(160deg,${c1},${c2});border-color:rgba(255,255,255,.3)`;
    afterBg    = c3;
  } else {
    // Barva po kategoriji
    const gradients = {
      hygiene:      ["#4CD964","#2DB84B","#1A8A33"],
      kitchen:      ["#FFB340","#FF9500","#CC7000"],
      cleaning:     ["#5AC8FA","#007AFF","#0055CC"],
      organisation: ["#CF8FFF","#AF52DE","#7B2BAE"],
      care:         ["#FF6B9D","#FF2D55","#CC0033"],
      outdoor:      ["#5AC8FA","#34C759","#1A8A33"],
      body:         ["#FF6B6B","#FF3B30","#CC1A10"],
      safety:       ["#FF6B6B","#FF3B30","#CC1A10"],
      money:        ["#FFE566","#FFD60A","#CCA800"],
      social:       ["#5AC8FA","#007AFF","#0055CC"],
      creativity:   ["#FFB340","#FF9500","#CC7000"],
      custom:       ["#CF8FFF","#AF52DE","#7B2BAE"],
    };
    const [c1,c2,c3] = gradients[mission.category] || gradients.hygiene;
    innerStyle = `background:linear-gradient(160deg,${c1},${c2});border-color:rgba(255,255,255,.3)`;
    afterBg    = c3;
  }

  // XP prikaz
  let xpLabel = onCooldown ? "🔒" : mission.isProgressive ? "3 stopnje" : `+${xp} XP`;
  if (mission.isEq && mId === "nevtralizator") xpLabel = "+1 🃏";
  const subLabel = "";  // Odstranjen — preveč šuma na karticah

  // Cooldown timer
  let cooldownHtml = "";
  if (onCooldown && typeof getRemainingMs === "function") {
    const ms  = getRemainingMs(mId);
    const hrs = Math.ceil(ms / 3600000);
    cooldownHtml = `<p class="mission-btn__cooldown">⏱ ${hrs}h</p>`;
  }

  // CAT_COLORS in CAT_NAMES so globalni (definirani na vrhu)

  const clr   = onCooldown ? 'rgba(247,244,239,.25)' : (CAT_COLORS[mission.category] || '#5AAF7A');
  const bg    = onCooldown ? 'rgba(255,255,255,.04)' : clr.replace(')', ',.12)').replace('rgb(','rgba(');
  const border= onCooldown ? 'rgba(255,255,255,.07)' : clr.replace(')', ',.25)').replace('rgb(','rgba(');
  const iconBg= onCooldown ? 'rgba(255,255,255,.06)' : clr.replace(')', ',.18)').replace('rgb(','rgba(');
  const catName = CAT_NAMES[mission.category] || '';
  const isEqAction = mission.isEq && mission.eqType === 'akcija';
  const xpTxt = onCooldown ? '🔒' : mission.isProgressive ? '3×' : `+${xp}`;
  const desc  = mission.desc || catName;

  const agentJokers = typeof getJokers === "function" ? getJokers(agentId) : 0;
  const dailyLocked = typeof isDailyLocked === "function" ? isDailyLocked(agentId) : false;

  // Joker = preskoči misijo (cooldown ostane, ne šteje v 4)
  const showJoker  = agentJokers > 0 && !mission.isEq && !dailyLocked && !onCooldown;

  // Zaklenjeno stanje
  const isLocked   = dailyLocked || onCooldown;
  const lockReason = dailyLocked ? '🔒 Dnevni limit (4/4)' : onCooldown ? '⏱ 3-dnevni cooldown' : '';

  const cardBg     = isLocked ? 'rgba(255,255,255,.03)' : bg;
  const cardBorder = isLocked ? 'rgba(255,255,255,.06)' : border;
  const cardOpacity= isLocked ? '.4' : '1';

  return `<div class="mc-card ${isLocked ? 'mc-locked' : ''}" data-mission="${mId}"
    style="background:${cardBg};border:1px solid ${cardBorder};opacity:${cardOpacity}">
    <div class="mc-card__icon" style="background:${isLocked ? 'rgba(255,255,255,.06)' : iconBg}">${mission.icon||'📋'}</div>
    <div class="mc-card__body">
      <p class="mc-card__name">${mission.label}</p>
      <p class="mc-card__desc">${isLocked ? lockReason : desc}</p>
    </div>
    <div class="mc-card__right" style="display:flex;flex-direction:column;align-items:flex-end;gap:4px">
      ${showJoker
        ? `<button onclick="event.stopPropagation();useJokerOnMission('${mId}')"
            style="padding:5px 10px;border-radius:12px;background:rgba(255,209,102,.15);
            border:1px solid rgba(255,209,102,.4);color:#FFD60A;font-size:12px;font-weight:800;
            cursor:pointer;white-space:nowrap">🃏 Preskoči</button>`
        : `<p class="mc-card__xp" style="color:${isLocked ? 'rgba(247,244,239,.25)' : clr};margin:0">${isLocked ? '—' : xpTxt + ' XP'}</p>`
      }
      ${isEqAction && !isLocked ? '<p class="mc-card__joker">+1 🃏</p>' : ''}
    </div>
  </div>`;
}

// Kategorija klik
function initCategoryFilter() {
  document.querySelectorAll(".cat-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".cat-pill").forEach(p => p.classList.remove("cat-pill--active"));
      pill.classList.add("cat-pill--active");
      renderMissionsGrid(pill.dataset.cat);
      // Scroll pill v view
      pill.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      if (navigator.vibrate) navigator.vibrate(15);
    });
  });
}


// ══════════════════════════════════════════════════════════
//  MISSION CAROUSEL
// ══════════════════════════════════════════════════════════

const _mcState = { cur: 0, drag: false, sx: 0, ss: 0, vx: 0, lx: 0, lt: 0, raf: null, track: null };

function _mcSnapTo(i) {
  const { track } = _mcState;
  if (!track) return;
  const cards = [...track.querySelectorAll('.mc-card')];
  _mcState.cur = Math.max(0, Math.min(i, cards.length - 1));
  const c = cards[_mcState.cur];
  if (!c) return;
  const target = c.offsetLeft - (track.clientWidth - c.offsetWidth) / 2;
  track.style.scrollBehavior = 'smooth';
  track.scrollLeft = target;
  _mcUpdateActive();
}

function _mcUpdateActive() {
  const { track, cur } = _mcState;
  if (!track) return;
  const cards = [...track.querySelectorAll('.mc-card')];
  cards.forEach((c, i) => {
    c.classList.remove('mc-active', 'mc-adj');
    c.dataset.carouselIdx = i;
    if (i === cur) c.classList.add('mc-active');
    else if (Math.abs(i - cur) === 1) c.classList.add('mc-adj');
  });
  // Dots
  const dotsEl = track.parentElement?.querySelector('.mc-dots');
  if (dotsEl) {
    [...dotsEl.querySelectorAll('.mc-dot')].forEach((d, i) =>
      d.classList.toggle('mc-dot--on', i === cur)
    );
  }
}

function initMissionCarousel(grid) {
  // Wrapper
  const wrapper = grid.parentElement;
  wrapper.style.cssText = 'position:relative;overflow:hidden';

  // Track = grid postane carousel track
  grid.style.cssText = `
    display:flex!important;gap:14px!important;
    padding:20px calc(50% - 100px)!important;
    overflow-x:scroll!important;scroll-snap-type:x mandatory!important;
    -webkit-overflow-scrolling:touch!important;scrollbar-width:none!important;
    cursor:grab!important;align-items:center!important;
    grid-template-columns:unset!important;
  `;

  _mcState.track = grid;
  _mcState.cur = 0;

  // Dots
  wrapper.querySelector('.mc-dots')?.remove();
  const cards = [...grid.querySelectorAll('.mc-card')];
  if (cards.length > 1) {
    const dotsEl = document.createElement('div');
    dotsEl.className = 'mc-dots';
    cards.forEach((_, i) => {
      const d = document.createElement('div');
      d.className = 'mc-dot' + (i === 0 ? ' mc-dot--on' : '');
      dotsEl.appendChild(d);
    });
    wrapper.after(dotsEl);
  }

  // Scroll → parallax + active
  grid.addEventListener('scroll', () => {
    const tx = grid.scrollLeft + grid.clientWidth / 2;
    let bi = 0, bd = Infinity;
    cards.forEach((c, i) => {
      // Parallax
      const bg = c.querySelector('.mc-bg');
      if (bg) {
        const cx = c.offsetLeft + c.offsetWidth / 2;
        bg.style.transform = `translateX(${(cx - tx) * -0.12}px)`;
      }
      // Closest
      const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - tx);
      if (d < bd) { bd = d; bi = i; }
    });
    if (bi !== _mcState.cur) { _mcState.cur = bi; _mcUpdateActive(); }
  }, { passive: true });

  // Mouse drag
  grid.addEventListener('mousedown', e => {
    _mcState.drag = true; _mcState.sx = e.pageX;
    _mcState.ss = grid.scrollLeft; _mcState.lx = e.pageX;
    _mcState.lt = Date.now(); _mcState.vx = 0;
    grid.style.scrollBehavior = 'auto';
    grid.style.cursor = 'grabbing';
    cancelAnimationFrame(_mcState.raf);
  });
  window.addEventListener('mouseup', () => {
    if (!_mcState.drag) return;
    _mcState.drag = false;
    grid.style.cursor = 'grab';
    _mcSnapNearest();
  });
  window.addEventListener('mousemove', e => {
    if (!_mcState.drag) return;
    const now = Date.now();
    _mcState.vx = (_mcState.lx - e.pageX) / (now - _mcState.lt || 1) * 14;
    _mcState.lx = e.pageX; _mcState.lt = now;
    grid.scrollLeft = _mcState.ss - (e.pageX - _mcState.sx);
  });

  // Touch
  grid.addEventListener('touchstart', e => {
    _mcState.sx = e.touches[0].pageX; _mcState.ss = grid.scrollLeft;
    _mcState.lx = _mcState.sx; _mcState.lt = Date.now(); _mcState.vx = 0;
    grid.style.scrollBehavior = 'auto';
  }, { passive: true });
  grid.addEventListener('touchend', () => _mcSnapNearest(), { passive: true });
  grid.addEventListener('touchmove', e => {
    const now = Date.now();
    _mcState.vx = (_mcState.lx - e.touches[0].pageX) / (now - _mcState.lt || 1) * 14;
    _mcState.lx = e.touches[0].pageX; _mcState.lt = now;
    grid.scrollLeft = _mcState.ss - (e.touches[0].pageX - _mcState.sx);
  }, { passive: true });

  function _mcSnapNearest() {
    const tx = grid.scrollLeft + grid.clientWidth / 2;
    let bi = 0, bd = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - tx);
      if (d < bd) { bd = d; bi = i; }
    });
    _mcSnapTo(bi);
  }

  _mcUpdateActive();
  setTimeout(() => _mcSnapTo(0), 80);
}


// ══════════════════════════════════════════════════════════
//  LOCATION PICKER — EQ / Indoor / Outdoor
// ══════════════════════════════════════════════════════════

let _currentLocation = 'eq';

function setLocation(loc) {
  _currentLocation = loc;

  // Posodobi aktivni gumb
  ['eq','indoor','outdoor'].forEach(l => {
    const btn = document.getElementById('loc-' + l);
    if (btn) btn.classList.toggle('loc-btn--active', l === loc);
  });

  // Prikaži/skrij reshuffle gumb
  const reshuffleBtn = document.getElementById('reshuffle-btn');
  if (reshuffleBtn) reshuffleBtn.style.display = loc !== 'eq' ? 'block' : 'none';

  // Posodobi naslov
  const titleEl = document.getElementById('missions-cat-title');
  if (titleEl) titleEl.textContent = {
    eq: '⚡ EQ Misije',
    indoor: '🏠 V hiši',
    outdoor: '🌲 Zunaj',
  }[loc];

  // Render misije
  renderLocationMissions(loc);
}

function renderLocationMissions(loc) {
  const grid    = document.getElementById('missions-grid');
  const agentId = getCurrentAgent();
  if (!grid) return;

  let missions = Object.values(LONA_CONFIG.missions);

  if (loc === 'eq') {
    missions = missions.filter(m => m.category === 'eq');
  } else if (loc === 'indoor') {
    missions = missions.filter(m =>
      m.location === 'indoor' && m.category !== 'eq'
    );
    // Naključnih 5
    missions = _shuffle(missions).slice(0, 5);
  } else if (loc === 'outdoor') {
    missions = missions.filter(m =>
      (m.location === 'outdoor' || m.category === 'outdoor' ||
       m.category === 'body' || m.category === 'social' ||
       m.category === 'fear')
      && m.category !== 'eq'
    );
    missions = _shuffle(missions).slice(0, 5);
  }

  grid.innerHTML = missions.map(m => buildMissionBtn(m, agentId)).join('');

  // Event listenerji
  grid.querySelectorAll('.mc-card[data-mission]').forEach(card => {
    card.addEventListener('click', () => {
      if (card.classList.contains('mc-locked')) return;
      if (navigator.vibrate) navigator.vibrate(12);
      onMissionClick(card);
    });
  });

  // Staggered animacija
  setTimeout(() => {
    grid.querySelectorAll('.mc-card').forEach((c, i) => {
      setTimeout(() => c.classList.add('mc-visible'), i * 60);
    });
  }, 30);
}

function reshuffleMissions() {
  renderLocationMissions(_currentLocation);
  if (navigator.vibrate) navigator.vibrate(8);
}

function _shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Override renderMissionsGrid — zdaj gre skozi location sistem
function renderMissionsGrid(cat) {
  setLocation(_currentLocation || 'eq');
}


// ── JOKER — otrok sam preskoči misijo ──────────────────
function useJokerOnMission(missionId) {
  const agentId = getCurrentAgent();
  const jokers  = getJokers(agentId);
  const mission = LONA_CONFIG.missions[missionId];
  const name    = LONA_CONFIG.agents.find(a => a.id === agentId)?.name || agentId;

  if (jokers <= 0) { lonaToast("Nimaš jokerjev! 🃏", "red"); return; }

  const d = document.createElement("div");
  d.className = "joker-dialog";
  d.innerHTML = `<div class="joker-dialog__box" style="border-color:rgba(255,209,102,.5);box-shadow:0 0 40px rgba(255,209,102,.15)">
    <div class="joker-dialog__icon" style="font-size:2.5rem">🃏</div>
    <p class="joker-dialog__title" style="color:#FFD60A">Porabi Joker?</p>
    <p class="joker-dialog__body">
      <strong>${mission?.label}</strong> bo preskočena.<br>
      <span style="font-size:.75rem;opacity:.6">Ostane ti ${jokers - 1} joker${jokers - 1 !== 1 ? 'jev' : ''}</span>
    </p>
    <div class="joker-dialog__btns">
      <button class="joker-dialog__cancel">Ne</button>
      <button class="joker-dialog__confirm" style="background:rgba(255,209,102,.15);border-color:rgba(255,209,102,.5);color:#FFD60A">Da, preskoči 🃏</button>
    </div>
  </div>`;
  document.body.appendChild(d);

  d.querySelector(".joker-dialog__cancel").addEventListener("click", () => d.remove());
  d.querySelector(".joker-dialog__confirm").addEventListener("click", () => {
    d.remove();
    spendJoker(agentId);
    // Joker = preskoči, ne šteje v dnevni limit, cooldown ostane
    const log = JSON.parse(localStorage.getItem("lona_mission_log") || "[]");
    log.push({ agentId, missionId, xp: 0, compromised: false,
      modifier: "🃏 Preskočeno", date: new Date().toISOString() });
    localStorage.setItem("lona_mission_log", JSON.stringify(log));
    lonaToast(`🃏 ${name} preskočil ${mission?.label} — ne šteje v 4!`, "gold");
    setTimeout(() => renderLocationMissions(_currentLocation || "eq"), 150);
  });
}


// ══════════════════════════════════════════════════════════
//  DAILY LIMIT — max 4 misije na dan
// ══════════════════════════════════════════════════════════

const DAILY_MAX = 4;

function dailyKey(agentId) {
  return `lona_daily_${agentId}_${new Date().toDateString()}`;
}

function getDailyCount(agentId) {
  return parseInt(localStorage.getItem(dailyKey(agentId)) || "0");
}

function addDailyCount(agentId) {
  const c = getDailyCount(agentId) + 1;
  localStorage.setItem(dailyKey(agentId), String(c));
  return c;
}

function isDailyLocked(agentId) {
  return getDailyCount(agentId) >= DAILY_MAX;
}

function getDailyRemaining(agentId) {
  return Math.max(0, DAILY_MAX - getDailyCount(agentId));
}

// Prikaži daily progress v header
function renderDailyProgress(agentId) {
  const el = document.getElementById('daily-progress');
  if (!el) return;
  const done = getDailyCount(agentId);
  const locked = isDailyLocked(agentId);
  el.innerHTML = Array.from({length: DAILY_MAX}, (_,i) =>
    `<div style="width:10px;height:10px;border-radius:50%;background:${i < done ? '#5AAF7A' : 'rgba(255,255,255,.15)'}"></div>`
  ).join('') + `<span style="font-size:11px;font-weight:700;color:${locked ? '#FF3B30' : 'rgba(247,244,239,.5)'}">
    ${locked ? '🔒 Zaklenjeno' : done + '/' + DAILY_MAX}
  </span>`;
}


// ══════════════════════════════════════════════════════════
//  PS5/XBOX UI — Carousel + Drawer + Ribbon
// ══════════════════════════════════════════════════════════

const CAT_TILES = {
  eq: [
    { id:'eq_akcija',  label:'EQ Akcija',    icon:'⚡', sub:'Joker nagrada', grad:['#2d0050','#7700cc','#aa44ff'], filter: m => m.category==='eq' && m.eqType==='akcija' },
    { id:'eq_ref',     label:'EQ Refleksija',icon:'📋', sub:'Pogovor',       grad:['#2d1500','#884400','#cc6600'], filter: m => m.category==='eq' && m.eqType==='refleksija' },
  ],
  indoor: [
    { id:'cleaning',   label:'Čiščenje',     icon:'🧹', sub:'', grad:['#001a3d','#003d99','#0066ff'], filter: m => m.category==='cleaning' },
    { id:'hygiene',    label:'Higiena',      icon:'🦷', sub:'', grad:['#1a2d00','#446600','#66aa00'], filter: m => m.category==='hygiene' },
    { id:'kitchen',    label:'Kuhinja',      icon:'🍳', sub:'', grad:['#2d1a00','#7d4a00','#cc7a00'], filter: m => m.category==='kitchen' },
    { id:'organisation',label:'Organizacija',icon:'📦', sub:'', grad:['#1a002d','#550080','#8800cc'], filter: m => m.category==='organisation' },
    { id:'fitness',     label:'Telovadba',   icon:'💪', sub:'', grad:['#1a0d00','#5c3300','#994400'], filter: m => m.category==='fitness' },
  ],
  outdoor: [
    { id:'outdoor',    label:'Aktivnosti',   icon:'🏃', sub:'', grad:['#001a0d','#005530','#008844'], filter: m => m.category==='outdoor' || m.category==='body' },
    { id:'social',     label:'Socialne',     icon:'🤝', sub:'', grad:['#001a2d','#004a7d','#0077cc'], filter: m => m.category==='social' },
    { id:'fear',       label:'Strah',        icon:'⚡', sub:'', grad:['#1a0028','#550077','#880099'], filter: m => m.category==='fear' || m.category==='independence' },
  ],
};

let _curView = 'eq';
let _curTile  = { eq:0, indoor:0, outdoor:0 };

function switchView(v) {
  _curView = v;
  document.querySelectorAll('.view-tab').forEach(t =>
    t.classList.toggle('view-tab--active', t.classList.contains('view-tab--' + v))
  );
  document.querySelectorAll('.view').forEach(el =>
    el.classList.toggle('active', el.id === 'view-' + v)
  );
  if (v === 'all') _renderRibbon();
}

function _refreshCurrentView() {
  const v = _curView || 'eq';
  if (v === 'all') _renderRibbon();
  else _renderDrawer(v, _curTile[v] || 0);
  _renderDailyDots();
}

function _mkClr(hex, a) {
  try {
    const h = hex.startsWith('#') ? hex : '#5AAF7A';
    const r = parseInt(h.slice(1,3),16);
    const g = parseInt(h.slice(3,5),16);
    const b = parseInt(h.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
  } catch(e) { return `rgba(90,175,122,${a})`; }
}

// ── CAROUSEL ──────────────────────────────────────────────
function _renderCarousel(view) {
  const el = document.getElementById('carousel-' + view);
  if (!el) return;
  const tiles = CAT_TILES[view];
  const agentId = getCurrentAgent();
  el.innerHTML = tiles.map((t,i) => {
    const missions = Object.values(LONA_CONFIG.missions).filter(t.filter);
    const count = missions.length;
    return `<div class="cat-tile ${i===(_curTile[view]||0)?'active':''}" onclick="_tileClick('${view}',${i})">
      <div class="cat-tile__bg" style="background:linear-gradient(135deg,${t.grad[0]},${t.grad[1]},${t.grad[2]})"></div>
      <div class="cat-tile__overlay"></div>
      <div class="cat-tile__body">
        <span class="cat-tile__icon">${t.icon}</span>
        <p class="cat-tile__name">${t.label}</p>
        <p class="cat-tile__count">${count} misij</p>
      </div>
    </div>`;
  }).join('');
}

function _tileClick(view, idx) {
  _curTile[view] = idx;
  // Posodobi tile aktivno stanje
  document.querySelectorAll(`#carousel-${view} .cat-tile`).forEach((t,i) =>
    t.classList.toggle('active', i===idx)
  );
  _renderDrawer(view, idx);
}

// ── DRAWER ────────────────────────────────────────────────
function _renderDrawer(view, tileIdx) {
  const tiles   = CAT_TILES[view];
  if (!tiles) return;
  const tile    = tiles[tileIdx];
  if (!tile) return;
  const listEl = document.getElementById('list-' + view);
  if (!listEl) return; // Stran nima tega elementa

  const agentId = getCurrentAgent();
  const jokers  = typeof getJokers === 'function' ? getJokers(agentId) : 0;
  const daily   = typeof getDailyCount === 'function' ? getDailyCount(agentId) : 0;
  const locked  = typeof isDailyLocked === 'function' ? isDailyLocked(agentId) : false;

  const titleEl = document.getElementById('drawer-' + view + '-title');
  if (titleEl) titleEl.textContent = tile.icon + ' ' + tile.label;

  // Missions — za indoor/outdoor naključnih 5, za EQ vse
  const _hidden = window._hiddenMissions || JSON.parse(localStorage.getItem('lona_hidden_missions') || '[]');
  let missions = Object.values(LONA_CONFIG.missions).filter(m => tile.filter(m) && !_hidden.includes(m.id));
  if (view !== 'eq') missions = _shuffle(missions).slice(0, 5);



  const clr = {
    eq_akcija:'#CF8FFF', eq_ref:'#FF8C60',
    cleaning:'#007AFF', hygiene:'#34C759', kitchen:'#FF9500',
    organisation:'#AF52DE', outdoor:'#30D158', social:'#5AC8FA',
    fear:'#AF52DE', independence:'#007AFF',
  }[tile.id] || '#5AAF7A';

  listEl.innerHTML = missions.map((m,i) => {
    const onCD  = typeof isOnCooldown === 'function' && isOnCooldown(m.id);
    const isLocked = locked || onCD;
    const lockReason = locked ? '🔒 Dnevni limit' : onCD ? '⏱ 3-dnevni cooldown' : '';
    const isEqAction = m.eqType === 'akcija';
    const showJoker = jokers > 0 && !isLocked && !isEqAction;
    const xp = m.baseXp || m.xp || 0;

    const bg  = isLocked ? 'rgba(255,255,255,.04)' : _mkClr(clr, .12);
    const ibg = isLocked ? 'rgba(255,255,255,.07)' : _mkClr(clr, .2);
    const xpClr = isLocked ? 'rgba(247,244,239,.25)' : clr;

    return `<div class="mc ${isLocked?'mc-locked':''}" data-mission="${m.id}"
      style="background:${bg};border:1px solid ${isLocked?'rgba(255,255,255,.06)':clr+'33'};transition-delay:${i*50}ms">
      <div class="mc__icon" style="background:${ibg}">${m.icon||'📋'}</div>
      <div class="mc__body">
        <p class="mc__name">${m.label}</p>
        <p class="mc__desc">${isLocked ? lockReason : (m.desc || CAT_NAMES[m.category] || '')}</p>
      </div>
      <div class="mc__right">
        ${showJoker
          ? `<p class="mc__xp" style="color:${xpClr}">+${xp} XP</p>
             <button class="mc__joker-btn" onclick="event.stopPropagation();useJokerOnMission('${m.id}')">🃏 Preskoči</button>`
          : `<p class="mc__xp" style="color:${xpClr}">${isLocked?'—':'+'+xp+' XP'}</p>
             ${isEqAction && !isLocked ? '<p class="mc__joker">+1 🃏 Joker</p>' : ''}`
        }
      </div>
    </div>`;
  }).join('');

  // Event listenerji
  listEl.querySelectorAll('.mc[data-mission]:not(.mc-locked)').forEach(card => {
    card.addEventListener('click', () => {
      if (navigator.vibrate) navigator.vibrate(12);
      onMissionClick(card);
    });
  });

  // Staggered animacija
  console.log(`[PS5] _renderDrawer(${view}, ${tileIdx}) → ${missions.length} misij v #list-${view}`);
  setTimeout(() => {
    listEl.querySelectorAll('.mc').forEach(c => c.classList.add('mc-in'));
  }, 30);
}

// ── RIBBON (vse misije) ───────────────────────────────────
function _renderRibbon() {
  const el = document.getElementById('ribbon-all');
  if (!el) return;

  const agentId = getCurrentAgent();
  const daily   = typeof getDailyCount === 'function' ? getDailyCount(agentId) : 0;
  const locked  = typeof isDailyLocked === 'function' ? isDailyLocked(agentId) : false;

  const missions = Object.values({
    ...LONA_CONFIG.missions,
    ...(() => {
      const c = typeof customLoad==='function' ? customLoad() : [];
      return Object.fromEntries((Array.isArray(c)?c:Object.values(c)).map(m=>[m.id,m]));
    })()
  });

  const cntEl = document.getElementById('all-count');
  if (cntEl) cntEl.textContent = missions.length + ' misij';

  el.innerHTML = missions.map((m,i) => {
    const onCD = typeof isOnCooldown === 'function' && isOnCooldown(m.id);
    const isLocked = locked || onCD;
    const clr = (CAT_COLORS[m.category]) || '#5AAF7A';
    const bg  = isLocked ? 'rgba(255,255,255,.04)' : _mkClr(clr, .1);
    const ibg = isLocked ? 'rgba(255,255,255,.07)' : _mkClr(clr, .18);

    return `<div class="rb ${isLocked?'mc-locked':''}" data-mission="${m.id}"
      style="background:${bg};border:1px solid ${isLocked?'rgba(255,255,255,.06)':clr+'33'};transition-delay:${Math.min(i,20)*28}ms">
      <div class="rb__icon" style="background:${ibg}">${m.icon||'📋'}</div>
      <div class="rb__body">
        <p class="rb__name">${m.label}</p>
        <p class="rb__cat">${CAT_NAMES[m.category]||''}</p>
      </div>
      <span class="rb__xp" style="color:${isLocked?'rgba(247,244,239,.25)':clr}">${isLocked?'—':'+'+m.baseXp}</span>
    </div>`;
  }).join('');

  listEl_addEvents(el, '.rb');

  setTimeout(() => {
    el.querySelectorAll('.rb').forEach((c,i) => {
      setTimeout(() => c.classList.add('rb-in'), i * 22);
    });
  }, 30);
}

function listEl_addEvents(container, sel) {
  container.querySelectorAll(sel + '[data-mission]:not(.mc-locked)').forEach(card => {
    card.addEventListener('click', () => {
      if (navigator.vibrate) navigator.vibrate(12);
      onMissionClick(card);
    });
  });
}

// ── DAILY DOTS ────────────────────────────────────────────
function _renderDailyDots() {
  const agentId = getCurrentAgent();
  const done    = typeof getDailyCount === 'function' ? getDailyCount(agentId) : 0;
  const locked  = typeof isDailyLocked === 'function' ? isDailyLocked(agentId) : false;

  ['eq','indoor','outdoor'].forEach(v => {
    const el = document.getElementById('daily-dots-' + v);
    if (!el) return;
    el.innerHTML = Array.from({length: DAILY_MAX || 4}, (_,i) =>
      `<div class="daily-dot ${i < done ? (locked && i === done-1 ? 'locked' : 'done') : ''}"></div>`
    ).join('') + `<span style="font-size:10px;font-weight:700;color:${locked?'#FF3B30':'rgba(247,244,239,.35)'};margin-left:4px">${done}/${DAILY_MAX||4}</span>`;
  });
}

function shuffleIndoor()  { _renderDrawer('indoor',  _curTile.indoor  || 0); }
function shuffleOutdoor() { _renderDrawer('outdoor', _curTile.outdoor || 0); }

function _shuffle(arr) {
  const a = [...arr];
  for (let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}

// Override renderMissionsGrid
function renderMissionsGrid() {
  _refreshCurrentView();
}


// ══════════════════════════════════════════════════════════
//  COMMANDER POTRDITEV
// ══════════════════════════════════════════════════════════

function showCommanderConfirm(agentId, mission, onConfirm) {
  const coins = mission.coins || Math.round((mission.baseXp || mission.xp || 20) * (LONA_CONFIG.coinsPerXp || 0.4));
  const xp    = mission.baseXp || mission.xp || 20;
  const isEqAction = mission.eqType === "akcija";

  const d = document.createElement("div");
  d.className = "joker-dialog";
  d.innerHTML = `<div class="joker-dialog__box">
    <div style="font-size:2.5rem">${mission.icon || "📋"}</div>
    <p style="font-family:'DM Serif Display',serif;font-size:1.1rem;color:#F7F4EF;margin:0">${mission.label}</p>
    <p style="font-size:.82rem;color:rgba(247,244,239,.5);text-align:center;margin:4px 0 8px">${mission.desc || ""}</p>

    <div style="display:flex;gap:10px;width:100%;justify-content:center">
      <div style="text-align:center;padding:10px 16px;background:rgba(90,175,122,.12);border:1px solid rgba(90,175,122,.25);border-radius:14px">
        <p style="font-size:1.3rem;font-weight:800;color:#5AAF7A;margin:0">+${xp}</p>
        <p style="font-size:.65rem;color:rgba(247,244,239,.4);margin:0;text-transform:uppercase;letter-spacing:.08em">XP</p>
      </div>
      <div style="text-align:center;padding:10px 16px;background:rgba(255,214,10,.1);border:1px solid rgba(255,214,10,.25);border-radius:14px">
        <p style="font-size:1.3rem;font-weight:800;color:#FFD60A;margin:0">+${coins}</p>
        <p style="font-size:.65rem;color:rgba(247,244,239,.4);margin:0;text-transform:uppercase;letter-spacing:.08em">🪙 Kovanci</p>
      </div>
      ${isEqAction ? `<div style="text-align:center;padding:10px 16px;background:rgba(255,209,102,.1);border:1px solid rgba(255,209,102,.25);border-radius:14px">
        <p style="font-size:1.3rem;font-weight:800;color:#FFD60A;margin:0">+1</p>
        <p style="font-size:.65rem;color:rgba(247,244,239,.4);margin:0;text-transform:uppercase;letter-spacing:.08em">🃏 Joker</p>
      </div>` : ""}
    </div>

    <p style="font-size:.72rem;color:rgba(247,244,239,.35);text-align:center">Poveljnik potrdi opravljeno misijo</p>

    <div class="joker-dialog__btns">
      <button class="joker-dialog__cancel">Prekliči</button>
      <button class="joker-dialog__confirm">✓ Potrdi</button>
    </div>
  </div>`;
  document.body.appendChild(d);

  d.querySelector(".joker-dialog__cancel").addEventListener("click", () => d.remove());
  d.querySelector(".joker-dialog__confirm").addEventListener("click", () => {
    d.remove();
    onConfirm();
  });
}

// ── COMMANDER PANEL v home.html ────────────────────────────
function renderCmdPanel() {
  // Pokliče renderCmdAgents — commander panel je renderCmdAgents
  if (typeof renderCmdAgents === "function") renderCmdAgents();
}


// ══════════════════════════════════════════════════════════
//  RANDOM MISSION — Klikneš lokacijo, dobiš misijo
// ══════════════════════════════════════════════════════════

const CAT_GRADS = {
  hygiene:     ['#0d2b0d','#1e5c1e','#2d7d2d'],
  cleaning:    ['#00102d','#003580','#0055cc'],
  kitchen:     ['#2d1a00','#7d4a00','#c47000'],
  organisation:['#1a002d','#550080','#8800cc'],
  fitness:     ['#2d1200','#7d3500','#cc5500'],
  outdoor:     ['#001a0d','#005530','#008844'],
  eq:          ['#1a0028','#550077','#880099'],
  fear:        ['#1a0028','#550077','#880099'],
  creativity:  ['#001a2d','#004a7d','#0077cc'],
  social:      ['#001a2d','#004a7d','#0077cc'],
  custom:      ['#0d2b0d','#1e5c1e','#2d7d2d'],
};

let _rmcCurrentMission = null;

function pickLocation(loc) {
  // Posodobi aktivni gumb
  document.querySelectorAll('.loc-pick-btn').forEach(b => b.classList.remove('loc-pick-btn--active'));
  const activeBtn = document.querySelector('.loc-pick-btn--' + loc);
  if (activeBtn) activeBtn.classList.add('loc-pick-btn--active');

  // Skrij stare views, pokaži rmc
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const wrap = document.getElementById('random-mission-wrap');
  if (wrap) wrap.style.display = 'block';

  _showRandomMission(loc, false);
}

function _showRandomMission(loc, animate) {
  const agentId = getCurrentAgent();
  const hidden  = window._hiddenMissions || JSON.parse(localStorage.getItem('lona_hidden_missions') || '[]');
  const daily   = typeof isDailyLocked === 'function' ? isDailyLocked(agentId) : false;

  let pool = Object.values(LONA_CONFIG.missions).filter(m => {
    if (hidden.includes(m.id)) return false;
    if (typeof isOnCooldown === 'function' && isOnCooldown(m.id)) return false;
    if (loc === 'eq')      return m.category === 'eq';
    if (loc === 'indoor')  return m.location === 'indoor' && m.category !== 'eq';
    if (loc === 'outdoor') return (m.location === 'outdoor' || m.category === 'outdoor' || m.category === 'body' || m.category === 'fear') && m.category !== 'eq';
    return m.category !== 'eq';
  });

  if (typeof customLoad === 'function') {
    const customs = Array.isArray(customLoad()) ? customLoad() : Object.values(customLoad());
    customs.forEach(m => {
      if (!hidden.includes(m.id) && !(typeof isOnCooldown === 'function' && isOnCooldown(m.id)))
        if (loc === 'all') pool.push(m);
    });
  }

  if (!pool.length) { _showRmcEmpty(loc); return; }

  const card = document.getElementById('random-mission-card');

  // Animacija kocke
  if (animate && card && card.innerHTML) {
    card.classList.remove('rmc--rolling', 'rmc--flip');
    void card.offsetWidth;
    card.classList.add('rmc--rolling');

    // Hitri tresljaji med "vrtanjem"
    let ticks = 0;
    const maxTicks = 5;
    const interval = setInterval(() => {
      ticks++;
      // Med animacijo hitreje menjaj ikone (napetost)
      const tmp = pool[Math.floor(Math.random() * pool.length)];
      const ic = card.querySelector('.rmc__icon');
      const nm = card.querySelector('.rmc__name');
      if (ic) ic.textContent = tmp.icon || '📋';
      if (nm) { nm.style.opacity = '.3'; setTimeout(() => { if(nm) nm.style.opacity = '1'; }, 80); }
      if (ticks >= maxTicks) {
        clearInterval(interval);
        // Flip na koncu — pokaži pravo misijo
        setTimeout(() => {
          card.classList.remove('rmc--rolling');
          card.classList.add('rmc--flip');
          const mission = pool[Math.floor(Math.random() * pool.length)];
          _rmcCurrentMission = { mission, loc };
          setTimeout(() => _renderRmc(mission, agentId, daily), 220);
        }, 100);
      }
    }, 80);
  } else {
    const mission = pool[Math.floor(Math.random() * pool.length)];
    _rmcCurrentMission = { mission, loc };
    _renderRmc(mission, agentId, daily);
  }
}

function _renderRmc(mission, agentId, daily) {
  const wrap = document.getElementById('random-mission-wrap');
  const card = document.getElementById('random-mission-card');
  if (!card) return;

  const xp    = mission.baseXp || mission.xp || 20;
  const coins = mission.coins  || Math.round(xp * (LONA_CONFIG.coinsPerXp || 0.4));
  const g     = CAT_GRADS[mission.category] || CAT_GRADS.hygiene;
  const jokers = typeof getJokers === 'function' ? getJokers(agentId) : 0;
  const isEqAction = mission.eqType === 'akcija';

  // Reset animacije
  card.className = 'rmc';
  void card.offsetWidth;

  card.innerHTML = `
    <div class="rmc__bg" style="background:linear-gradient(135deg,${g[0]},${g[1]},${g[2]})"></div>
    <div class="rmc__overlay"></div>
    <div class="rmc__body">
      <span class="rmc__icon">${mission.icon || '📋'}</span>
      <p class="rmc__name">${mission.label}</p>
      <p class="rmc__desc">${mission.desc || CAT_NAMES[mission.category] || ''}</p>
      <p class="rmc__xp">+${xp} XP · 🪙 ${coins}${isEqAction ? ' · 🃏 +1 Joker' : ''}</p>
      <div class="rmc__actions">
        <button class="rmc__btn rmc__btn--do" onclick="_rmcDo()">✓ Opravi</button>
        ${jokers > 0 && !daily ? `<button class="rmc__btn rmc__btn--skip" onclick="_rmcSkip()">🃏 Preskoči</button>` : ''}
        <button class="rmc__btn rmc__btn--next" onclick="_rmcNext()">↻</button>
      </div>
    </div>`;
}

function _showRmcEmpty(loc) {
  const card = document.getElementById('random-mission-card');
  if (!card) return;
  card.className = 'rmc';
  card.innerHTML = `
    <div class="rmc__bg" style="background:linear-gradient(135deg,#1a1a2e,#2a2a4a)"></div>
    <div class="rmc__overlay"></div>
    <div class="rmc__body">
      <span class="rmc__icon">🔒</span>
      <p class="rmc__name">Vse misije na cooldownu</p>
      <p class="rmc__desc">Odlično! Vse opravljeno. Jutri spet!</p>
    </div>`;
}

function _rmcDo() {
  if (!_rmcCurrentMission) return;
  const { mission, loc } = _rmcCurrentMission;
  const agentId = getCurrentAgent();

  if (!isGatekeeperApproved()) {
    lonaToast("Najprej opravi Standard 0! 🔒", "red");
    return;
  }
  if (typeof isDailyLocked === 'function' && isDailyLocked(agentId)) {
    lonaToast("Dnevni limit dosežen! 🔒", "red");
    return;
  }

  showQualityCheck(agentId, mission, null, (compromised) => {
    const xp    = compromised ? Math.floor((mission.baseXp || mission.xp || 20) / 2) : (mission.baseXp || mission.xp || 20);
    const coins = mission.coins || Math.round(xp * (LONA_CONFIG.coinsPerXp || 0.4));

    addXp(agentId, xp);
    if (!compromised && mission.cooldownHrs) setCooldown(mission.id, mission.cooldownHrs);
    logMission(agentId, mission.id, xp, { label: mission.label }, compromised);
    if (typeof showXpFloat === 'function') showXpFloat(xp);
    lonaToast(compromised ? `⚠️ Površno — +${xp} XP` : `+${xp} XP  +${coins} 🪙 ✓`, compromised ? 'red' : 'green');

    // Naslednja misija
    setTimeout(() => {
      if (typeof renderCmdAgents === 'function') renderCmdAgents();
      _showRandomMission(loc, true);
    }, 400);
  });
}

function _rmcSkip() {
  if (!_rmcCurrentMission) return;
  const { mission, loc } = _rmcCurrentMission;
  const agentId = getCurrentAgent();
  if (typeof useJokerOnMission === 'function') {
    useJokerOnMission(mission.id);
  }
  setTimeout(() => _showRandomMission(loc), 300);
}

function _rmcNext() {
  if (!_rmcCurrentMission) return;
  if (navigator.vibrate) navigator.vibrate([15, 10, 15]);
  _showRandomMission(_rmcCurrentMission.loc, true);
}

document.addEventListener("DOMContentLoaded", () => {
  try {
    // Inicializiraj XP, jokerje in kovance PRVO
    if (typeof initXp     === "function") initXp();
    if (typeof initJokers === "function") initJokers();
    if (typeof initCoins  === "function") initCoins();

    // Naloži custom nagrade iz localStorage (dodane v commander)
    const _savedRewards = localStorage.getItem('lona_custom_rewards');
    if (_savedRewards) {
      try { Object.assign(LONA_CONFIG.rewards, JSON.parse(_savedRewards)); } catch(e) {}
    }

    // Naloži hidden misije
    window._hiddenMissions = JSON.parse(localStorage.getItem('lona_hidden_missions') || '[]');

    // Nastavi agenta če ni
    if (!localStorage.getItem("lona_current_agent")) {
      localStorage.setItem("lona_current_agent", LONA_CONFIG.agents[0].id);
    }

    // Osveži foto če je bila spremenjena na profilu
    localStorage.removeItem("lona_photo_updated");

    if (typeof initGatekeeper === "function") initGatekeeper();
    if (typeof initActionPrompt === "function") initActionPrompt();
    if (typeof initCooldownTicker === "function") initCooldownTicker();

    document.querySelectorAll(".mission-btn[data-mission]").forEach(btn => {
      btn.addEventListener("click", (e) => { addRipple(btn, e); popBtn(btn); onMissionClick(btn); });
    });

    if (typeof initMastery === "function") initMastery();
    if (typeof initScholar === "function") initScholar();
    if (typeof initRewards === "function") initRewards();

    setTimeout(updateMissionsBadge, 100);
    setTimeout(renderTreasury, 150);
    if (typeof initDoubleXpButton === "function") initDoubleXpButton();
    if (typeof renderCmdAgents === "function") renderCmdAgents();

    // Ponovni render avatarja po 100ms
    setTimeout(() => {
      if (typeof renderCmdAgents === "function") renderCmdAgents();
    }, 100);

    // Random mission init — EQ kot default
    if (typeof pickLocation === "function") {
      pickLocation('eq');
    }

    // Pokaži ime agenta v top baru
    const _agentEl = document.getElementById("current-agent-name");
    if (_agentEl) {
      const _a = LONA_CONFIG.agents.find(a => a.id === getCurrentAgent());
      if (_a) _agentEl.textContent = _a.avatar + " " + _a.name;
    }
    if (typeof initSeason === "function") initSeason();
    if (typeof initEquipment === "function") initEquipment();
    if (typeof initBank === "function") initBank();
    if (typeof initProgressive === "function") initProgressive();
    if (typeof initStreak === "function") initStreak();
    checkOnboarding();
    if (typeof initCustomMissions === 'function') initCustomMissions();
    initCategoryFilter();
    renderMissionsGrid('all');
    if (typeof initAttributes === "function") initAttributes();
  } catch(e) {
    console.error("Init error:", e);
  }
});

// ── REWARD CLAIMING ────────────────────────────────────────
function initRewards() {
  document.querySelectorAll(".reward-row, .reward-item").forEach(row => {
    row.style.cursor = "pointer";
    row.addEventListener("click", () => claimReward(row));
  });
}

function claimReward(row) {
  const cost   = parseInt(row.dataset.cost);
  const shared = row.dataset.shared === "true";
  const label  = row.querySelector(".reward-row__name, .reward-item__label")?.textContent?.trim() || "Nagrada";
  if (!cost) return;

  if (shared) {
    // Skupna nagrada — preveri skupne točke
    const total = Object.values(xpLoadState()).reduce((s,v) => s+v, 0);
    if (total < cost) { lonaToast(`Premalo skupnih točk! (${total}/${cost} XP)`, "red"); return; }
    _showClaimDialog(label, cost, true, null);
  } else {
    // Osebna nagrada — current agent plača
    const agentId = getCurrentAgent();
    if (getXp(agentId) < cost) {
      lonaToast(`Premalo točk! (${getXp(agentId)}/${cost} XP)`, "red");
      return;
    }
    _showClaimDialog(label, cost, false, agentId);
  }
}

function _showClaimDialog(label, cost, shared, agentId) {
  const name = agentId
    ? LONA_CONFIG.agents.find(a => a.id === agentId)?.name || agentId
    : "Ekipa";

  const d = document.createElement("div");
  d.className = "joker-dialog";
  d.innerHTML = `<div class="joker-dialog__box">
    <div class="joker-dialog__icon">🎁</div>
    <p class="joker-dialog__title">Vzemi nagrado?</p>
    <p class="joker-dialog__body">
      <strong>${label}</strong><br>
      ${name} plača <strong style="color:var(--neon-red)">−${cost} XP</strong>
    </p>
    <div class="joker-dialog__btns">
      <button class="joker-dialog__cancel">Prekliči</button>
      <button class="joker-dialog__confirm">Vzemi 🎁</button>
    </div>
  </div>`;
  document.body.appendChild(d);
  d.querySelector(".joker-dialog__cancel").addEventListener("click", () => d.remove());
  d.querySelector(".joker-dialog__confirm").addEventListener("click", () => {
    d.remove();
    if (shared) {
      // Odštej od obeh agentov proporcionalno
      const state = xpLoadState();
      const total = Object.values(state).reduce((s,v) => s+v, 0);
      LONA_CONFIG.agents.forEach(a => {
        const share = Math.round((state[a.id] / total) * cost);
        addXp(a.id, -share);
      });
    } else {
      addXp(agentId, -cost);
    }
    lonaToast(`${label} — uživaj! 🎁`, "gold");
    // Posodobi nagrade v profilu
    if (typeof renderRewards === "function") renderRewards();
  });
}

// ── RPG ZAKLADNICA — RADAR ─────────────────────────────────
function renderTreasury() {
  const el = document.getElementById("treasury");
  if (!el) return;

  const agentId = getCurrentAgent();
  const agentXp = getXp(agentId);
  const allXp   = Object.values(JSON.parse(localStorage.getItem("lona_xp_state") || "{}"))
                        .reduce((s,v) => s+v, 0);
  const rewards = LONA_CONFIG.rewards;
  if (!rewards) return;

  // Združi vse nagrade po XP pragu
  const allRewards = [
    ...rewards.personal.map(r => ({...r, shared: false, threshold: r.revealAt, buy: r.buyAt})),
    ...rewards.shared.map(r => ({...r, shared: true,  threshold: r.sharedRevealAt, buy: r.buyAt})),
  ].sort((a, b) => a.buy - b.buy);

  const currentXp   = (r) => r.shared ? allXp : agentXp;
  const nextLocked  = allRewards.find(r => currentXp(r) < r.threshold);
  const nextReveal  = allRewards.find(r => currentXp(r) >= r.threshold && currentXp(r) < r.buy);
  const buyable     = allRewards.filter(r => currentXp(r) >= r.buy);
  const revealed    = allRewards.filter(r => currentXp(r) >= r.threshold && currentXp(r) < r.buy);

  let html = `<div class="treasure-radar">`;

  // ── GLAVNA SKRINJA ──────────────────────────────────────
  const focus = nextReveal || nextLocked;
  const isLocked  = focus && currentXp(focus) < focus.threshold;
  const isBuyable = !isLocked && focus;

  if (focus) {
    const xp       = currentXp(focus);
    const target   = isLocked ? focus.threshold : focus.buy;
    const pct      = Math.min(100, Math.round((xp / target) * 100));
    const dist     = target - xp;
    const chestCls = isLocked ? "treasure-chest--locked" : "treasure-chest--buyable";
    const nameCls  = isLocked ? "treasure-info__name--hidden" : "";
    const nameText = isLocked ? "Neznana nagrada..." : focus.label;
    const icon     = isLocked ? "📦" : focus.icon;
    const label    = isLocked ? "Naslednja skrinja" : (focus.shared ? "Skupna nagrada" : "Osebna nagrada");

    html += `<div class="treasure-main">
      <div class="treasure-chest ${chestCls}">${icon}</div>
      <div class="treasure-info">
        <p class="treasure-info__label">${label}</p>
        <p class="treasure-info__name ${nameCls}">${nameText}</p>
        <div class="radar-bar-wrap">
          <div class="radar-bar"><div class="radar-bar__fill" style="width:${pct}%"></div></div>
          <span class="radar-xp">${xp}/${target}</span>
        </div>
      </div>
    </div>`;

    if (dist > 0) {
      html += `<div class="radar-next">
        <span class="radar-next__compass">🧭</span>
        <p class="radar-next__text">Naslednje odkritje: <strong>${isLocked ? "Presenečenje" : focus.label}</strong></p>
        <span class="radar-next__dist">še ${dist} XP</span>
      </div>`;
    }
  }

  // ── DOSTOPNE NAGRADE ────────────────────────────────────
  if (buyable.length > 0 || revealed.length > 0) {
    html += `<div class="revealed-list">`;

    buyable.forEach(r => {
      const xp = r.shared ? allXp : agentXp;
      html += `<div class="revealed-item revealed-item--buyable"
        data-reward-id="${r.id}" data-shared="${r.shared}"
        onclick="claimRpgReward(this)" data-reward-cost="${r.buy}">
        <span class="revealed-item__icon">${r.icon}</span>
        <span class="revealed-item__name">${r.label}${r.shared ? " 🤝" : ""}</span>
        <span class="revealed-item__cost">−${r.buy} XP ✓</span>
      </div>`;
    });

    revealed.forEach(r => {
      const xp  = r.shared ? allXp : agentXp;
      const dist = r.buy - xp;
      html += `<div class="revealed-item">
        <span class="revealed-item__icon">${r.icon}</span>
        <span class="revealed-item__name">${r.label}${r.shared ? " 🤝" : ""}</span>
        <span class="revealed-item__cost">še ${dist} XP</span>
      </div>`;
    });

    html += `</div>`;
  }

  html += `</div>`;
  el.innerHTML = html;
}


function claimRpgReward(el) {
  const rewardId = el.dataset.rewardId;
  const cost     = parseInt(el.dataset.rewardCost);
  const shared   = el.dataset.shared === "true";
  const agentId  = getCurrentAgent();
  const rewards  = shared ? LONA_CONFIG.rewards.shared : LONA_CONFIG.rewards.personal;
  const reward   = rewards.find(r => r.id === rewardId);
  if (!reward) return;

  const d = document.createElement("div");
  d.className = "joker-dialog";
  d.innerHTML = `<div class="joker-dialog__box">
    <div class="joker-dialog__icon">${reward.icon}</div>
    <p class="joker-dialog__title">${reward.label}</p>
    <p class="joker-dialog__body">
      ${shared ? "Skupaj porabita" : "Porabiš"} <strong style="color:#C4352A">−${cost} XP</strong>
    </p>
    <div class="joker-dialog__btns">
      <button class="joker-dialog__cancel">Prekliči</button>
      <button class="joker-dialog__confirm">Vzemi! 🎁</button>
    </div>
  </div>`;
  document.body.appendChild(d);
  d.querySelector(".joker-dialog__cancel").addEventListener("click", () => d.remove());
  d.querySelector(".joker-dialog__confirm").addEventListener("click", () => {
    d.remove();
    if (shared) {
      const state = JSON.parse(localStorage.getItem("lona_xp_state") || "{}");
      const total = Object.values(state).reduce((s,v) => s+v, 0);
      LONA_CONFIG.agents.forEach(a => {
        const share = Math.round(((state[a.id]||0) / total) * cost);
        addXp(a.id, -share);
      });
    } else {
      addXp(agentId, -cost);
    }
    showTreasureParticles();
    lonaToast(`${reward.label} — uživaj! 🎁`, "gold");
    setTimeout(renderTreasury, 300);
  });
}


// ── ZVOČNI EFEKTI (Web Audio API) ───────────────────────────
function _playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "success") {
      // Zmagovalen akord navzgor
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(554, ctx.currentTime + 0.1);
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === "fail") {
      // Padajoč ton
      osc.frequency.setValueAtTime(330, ctx.currentTime);
      osc.frequency.setValueAtTime(220, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === "coin") {
      // Kovanec (bonus XP)
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch(e) { /* Audio ni podprt */ }
}

// ── JUICE ANIMACIJE ─────────────────────────────────────────

/** Pečat animacija — mission complete */
function showStamp(text, color) {
  const color_cls = color === "red" ? "stamp--red" : color === "gold" ? "stamp--gold" : "";
  const overlay = document.createElement("div");
  overlay.className = "stamp-overlay";
  const stamp = document.createElement("div");
  stamp.className = `stamp ${color_cls}`;
  stamp.textContent = text;
  overlay.appendChild(stamp);
  document.body.appendChild(overlay);

  // Animacija noter
  stamp.style.animation = "stamp-in .35s cubic-bezier(.17,.67,.35,1.3) forwards";

  // Zvočni efekt
  if (navigator.vibrate) navigator.vibrate([30, 10, 20]);
  _playSound(color === "red" ? "fail" : "success");

  // Po 1.2s ven
  setTimeout(() => {
    stamp.style.animation = "stamp-out .3s ease forwards";
    setTimeout(() => overlay.remove(), 350);
  }, 1200);
}

/** XP float animacija — +25 XP leti navzgor */
function showXpFloat(amount, x, y) {
  const el = document.createElement("div");
  el.className = "xp-float";
  el.textContent = `+${amount} XP`;
  el.style.left = (x || window.innerWidth / 2) + "px";
  el.style.top  = (y || window.innerHeight / 2) + "px";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1300);
}

/** Ripple efekt na gumbu */
function addRipple(btn, e) {
  const rect   = btn.getBoundingClientRect();
  const size   = Math.max(rect.width, rect.height);
  const x      = (e?.clientX ?? rect.left + rect.width/2)  - rect.left - size/2;
  const y      = (e?.clientY ?? rect.top  + rect.height/2) - rect.top  - size/2;
  const ripple = document.createElement("span");
  ripple.className = "ripple";
  ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
  btn.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

/** Confetti za rank up */
function showConfetti() {
  const colors = ["#2D7D52","#C47D1A","#2563EB","#C4352A","#5AAF7A"];
  for (let i = 0; i < 40; i++) {
    setTimeout(() => {
      const el = document.createElement("div");
      el.className = "confetti-piece";
      el.style.cssText = `
        left:${Math.random()*100}vw;
        top:-10px;
        background:${colors[Math.floor(Math.random()*colors.length)]};
        animation-duration:${1.5 + Math.random()*2}s;
        animation-delay:${Math.random()*0.5}s;
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 4000);
    }, i * 30);
  }
}

// ── DOUBLE XP EVENT ─────────────────────────────────────────
let _doubleXpEnd = 0;
let _doubleXpTimer = null;

function isDoubleXpActive() {
  return Date.now() < _doubleXpEnd;
}

function activateDoubleXp(minutes) {
  _doubleXpEnd = Date.now() + minutes * 60000;
  _showDoubleXpBanner(minutes * 60);
  lonaToast(`⚡ DVOJNI XP za ${minutes} minut!`, "gold");
}

function _showDoubleXpBanner(seconds) {
  document.querySelector(".double-xp-banner")?.remove();
  const banner = document.createElement("div");
  banner.className = "double-xp-banner";
  banner.innerHTML = `
    <span class="double-xp-banner__icon">⚡</span>
    <span>DVOJNI XP</span>
    <span class="double-xp-timer" id="dxp-timer">${_fmtSeconds(seconds)}</span>
    <span>aktivno!</span>
  `;
  document.body.appendChild(banner);

  if (_doubleXpTimer) clearInterval(_doubleXpTimer);
  _doubleXpTimer = setInterval(() => {
    const rem = Math.max(0, Math.ceil((_doubleXpEnd - Date.now()) / 1000));
    const el  = document.getElementById("dxp-timer");
    if (el) el.textContent = _fmtSeconds(rem);
    if (rem <= 0) {
      clearInterval(_doubleXpTimer);
      banner.remove();
      lonaToast("Dvojni XP je potekel.", "cyan");
    }
  }, 1000);
}

function _fmtSeconds(s) {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${sec.toString().padStart(2,"0")}`;
}

// Settings panel — dodaj Double XP gumb
function initDoubleXpButton() {
  const panel = document.getElementById("settings-panel");
  if (!panel) return;
  const box = panel.querySelector("div");
  if (!box) return;
  const btn = document.createElement("button");
  btn.style.cssText = `padding:11px;border-radius:14px;background:#FDF3E3;border:1px solid rgba(196,125,26,.3);color:#C47D1A;font-size:.88rem;font-weight:600;font-family:inherit;width:100%`;
  btn.textContent = "⚡ Aktiviraj 2× XP (15 min)";
  btn.addEventListener("click", () => {
    panel.style.display = "none";
    activateDoubleXp(15);
  });
  // Vstavi pred "Zapri" gumb
  const closeBtn = box.lastElementChild;
  box.insertBefore(btn, closeBtn);
}

// ── COMMANDER PANEL ─────────────────────────────────────────
function renderCmdAgents() {
  const section = document.getElementById("cmd-panel-section");
  if (!section) return;

  const agentId = getCurrentAgent();
  const a       = LONA_CONFIG.agents.find(x => x.id === agentId);
  if (!a) return;

  const xp      = getXp(agentId);
  const maxXp   = getMaxXp(agentId);
  const rank    = getRank(maxXp);
  const jokers  = typeof getJokers === "function" ? getJokers(agentId) : 0;
  const coins   = typeof getCoins  === "function" ? getCoins(agentId)  : 0;
  const streak  = typeof getStreak === "function" ? getStreak(agentId) : { count: 0 };

  // XP bar
  const ranks  = LONA_CONFIG.ranks;
  const ci     = ranks.findIndex(r => r.minXp > maxXp);
  const lo     = ranks[Math.max(0, ci - 1)]?.minXp ?? 0;
  const hi     = ranks[ci]?.minXp ?? lo + 300;
  const pct    = Math.min(100, Math.round(((maxXp - lo) / (hi - lo)) * 100));

  const _savedPhoto = localStorage.getItem("lona_photo_" + agentId);
  const avatarHtml = (_savedPhoto || a.photo)
    ? `<img src="${_savedPhoto || a.photo}" alt="${a.name}" style="width:100%;height:100%;object-fit:cover;object-position:center top;border-radius:50%">`
    : `<span style="font-size:1.8rem">${a.avatar}</span>`;

  const flameCount = Math.min(streak.count || 0, 7);
  const flames = flameCount > 0 ? "🔥".repeat(flameCount) : "";

  section.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:rgba(255,255,255,.04);border-bottom:1px solid rgba(255,255,255,.06)">

      <!-- Avatar kompakten -->
      <div style="position:relative;width:44px;height:44px;flex-shrink:0">
        <svg style="position:absolute;inset:0;width:100%;height:100%" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r="20" fill="none" stroke="rgba(255,255,255,.1)" stroke-width="3"/>
          <circle cx="22" cy="22" r="20" fill="none" stroke="#FFD60A" stroke-width="3"
            stroke-dasharray="${Math.round(125 * pct / 100)} 125"
            stroke-linecap="round" transform="rotate(-90 22 22)"/>
        </svg>
        <div style="position:absolute;inset:4px;border-radius:50%;overflow:hidden;background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;font-size:1.1rem">
          ${avatarHtml}
        </div>
      </div>

      <!-- Info -->
      <div style="flex:1;min-width:0">
        <p style="font-size:.95rem;font-weight:800;color:#F7F4EF;margin:0;line-height:1">${a.name}</p>
        <p style="font-size:.62rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#FFD60A;margin:2px 0 0">${rank}</p>
      </div>

      <!-- Stats kompaktni -->
      <div style="display:flex;gap:10px;align-items:center;flex-shrink:0">
        <div style="text-align:center">
          <p style="font-size:.9rem;font-weight:800;color:#5AAF7A;margin:0;line-height:1">${xp}</p>
          <p style="font-size:.58rem;color:rgba(247,244,239,.4);margin:1px 0 0;text-transform:uppercase">XP</p>
        </div>
        <div style="text-align:center">
          <p style="font-size:.9rem;font-weight:800;color:#FFD60A;margin:0;line-height:1">${coins}</p>
          <p style="font-size:.58rem;color:rgba(247,244,239,.4);margin:1px 0 0;text-transform:uppercase">🪙</p>
        </div>
        <div style="text-align:center">
          <p style="font-size:.9rem;font-weight:800;color:#CF8FFF;margin:0;line-height:1">${jokers}</p>
          <p style="font-size:.58rem;color:rgba(247,244,239,.4);margin:1px 0 0;text-transform:uppercase">🃏</p>
        </div>
        ${streak.count > 1 ? `<div style="text-align:center">
          <p style="font-size:.9rem;font-weight:800;color:#FF9500;margin:0;line-height:1">${streak.count}</p>
          <p style="font-size:.58rem;color:rgba(247,244,239,.4);margin:1px 0 0;text-transform:uppercase">🔥</p>
        </div>` : ""}
      </div>

    </div>
  `;

  // Inicializiraj streak display
  if (typeof renderStreak === "function") renderStreak(agentId);
  if (typeof renderAttrsMini === "function") renderAttrsMini(agentId);
}


function switchAgent(agentId) {
  localStorage.setItem("lona_current_agent", agentId);
  // Posodobi active state
  document.querySelectorAll(".cmd-agent").forEach(el => {
    el.classList.toggle("cmd-agent--active", el.dataset.agent === agentId);
  });
  lonaToast(`Agent: ${LONA_CONFIG.agents.find(a=>a.id===agentId)?.name}`, "green");
}

function giveBonus(amount) {
  const agentId = getCurrentAgent();
  const name    = LONA_CONFIG.agents.find(a => a.id === agentId)?.name || agentId;

  // Vpraša kateremu agentu
  const d = document.createElement("div");
  d.className = "joker-dialog";
  const btns = LONA_CONFIG.agents.map(a =>
    `<button class="agent-pick-btn" data-id="${a.id}">${a.avatar} ${a.name}</button>`
  ).join("");
  d.innerHTML = `<div class="joker-dialog__box">
    <div class="joker-dialog__icon">⭐</div>
    <p class="joker-dialog__title">+${amount} XP Bonus</p>
    <p class="joker-dialog__body">Komu gre bonus?</p>
    <div class="joker-dialog__btns">${btns}</div>
    <button class="joker-dialog__cancel" style="margin-top:8px;width:100%">Prekliči</button>
  </div>`;
  document.body.appendChild(d);
  d.querySelector(".joker-dialog__cancel").addEventListener("click", () => d.remove());
  d.querySelectorAll(".agent-pick-btn").forEach(b => {
    b.addEventListener("click", () => {
      d.remove();
      addXp(b.dataset.id, amount);
      showStamp(`+${amount} XP`, "gold");
      showXpFloat(amount);
      const n = LONA_CONFIG.agents.find(a=>a.id===b.dataset.id)?.name;
      _playSound("coin");
      lonaToast(`${n} +${amount} XP bonus! ⭐`, "gold");
      renderCmdAgents();
  if (typeof initSeason === "function") initSeason();
  if (typeof initEquipment === "function") initEquipment();
    });
  });
}

// ── SEŽIG SVITKA (EpicWin animacija) ────────────────────────
function showScrollBurn(missionLabel, xp) {
  const overlay = document.createElement("div");
  overlay.className = "scroll-burn";
  overlay.innerHTML = `
    <div class="scroll-burn__inner">
      <div class="scroll-burn__parchment">📜</div>
      <p class="scroll-burn__label">${missionLabel}</p>
      <p class="scroll-burn__xp">+${xp} XP</p>
    </div>
  `;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 1800);
}

// ══════════════════════════════════════════════════════════
//  JUICE ANIMACIJE v2
// ══════════════════════════════════════════════════════════

/** Joker karta poleti čez zaslon */
function showJokerFly() {
  const el = document.createElement("div");
  el.className = "joker-fly";
  el.textContent = "🃏";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 800);
}

/** Screen flash ob rank up */
function showScreenFlash() {
  const el = document.createElement("div");
  el.className = "screen-flash";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 600);
}

/** Mission complete dim */
function showMissionDim(duration) {
  const el = document.createElement("div");
  el.className = "mission-dim";
  document.body.appendChild(el);
  setTimeout(() => el.remove(), duration || 1500);
}

/** Treasure particle eksplozija */
function showTreasureParticles(x, y) {
  const emojis = ["⭐","✨","💫","🌟","💛","🟡"];
  for (let i = 0; i < 10; i++) {
    const el  = document.createElement("div");
    el.className = "treasure-particle";
    const angle = (i / 10) * 360;
    const dist  = 80 + Math.random() * 60;
    const tx    = `translate(${Math.cos(angle*Math.PI/180)*dist}px, ${Math.sin(angle*Math.PI/180)*dist - 80}px)`;
    el.style.cssText = `left:${x||window.innerWidth/2}px;top:${y||window.innerHeight/2}px;
      --tx:${tx};--rot:${Math.random()*360}deg;
      animation-duration:${.6+Math.random()*.4}s;
      animation-delay:${i*.03}s;`;
    el.textContent = emojis[i % emojis.length];
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }
}

/** XP bar bounce animacija */
function animateXpBar(barEl) {
  if (!barEl) return;
  barEl.classList.remove("xp-bar-animate");
  void barEl.offsetWidth; // reflow
  barEl.classList.add("xp-bar-animate");
  setTimeout(() => barEl.classList.remove("xp-bar-animate"), 800);
}

/** Btn pop animacija */
function popBtn(btn) {
  if (!btn) return;
  btn.classList.remove("mission-btn--pop");
  void btn.offsetWidth;
  btn.classList.add("mission-btn--pop");
  setTimeout(() => btn.classList.remove("mission-btn--pop"), 400);
}

// ── SITUACIJSKE MISIJE ─────────────────────────────────────
function showSituationPicker() {
  const situations = [
    { id: "restavracija", label: "Restavracija",   icon: "🍽️", desc: "Čakamo na hrano" },
    { id: "zdravnik",     label: "Zdravnik",        icon: "🏥", desc: "Čakalna vrsta" },
    { id: "vrsta",        label: "Vrsta",           icon: "🛒", desc: "V trgovini" },
    { id: "dolgocas",     label: "Dolgčas",         icon: "🧩", desc: "Nič za početi" },
    { id: "avto",         label: "Avto",            icon: "🚗", desc: "Dolga vožnja" },
  ];

  const d = document.createElement("div");
  d.className = "joker-dialog";
  const btns = situations.map(s => `
    <button class="situation-btn" onclick="startSituationMission('${s.id}');this.closest('.joker-dialog').remove()">
      <span class="situation-btn__icon">${s.icon}</span>
      <div>
        <p class="situation-btn__label">${s.label}</p>
        <p class="situation-btn__desc">${s.desc}</p>
      </div>
      <span style="color:#C7C7CC;font-size:1rem">→</span>
    </button>
  `).join("");

  d.innerHTML = `<div class="joker-dialog__box" style="width:calc(100% - 32px);max-width:360px">
    <div class="joker-dialog__icon">📍</div>
    <p class="joker-dialog__title">Kje ste?</p>
    <div style="width:100%;display:flex;flex-direction:column;gap:6px">${btns}</div>
    <button class="joker-dialog__cancel" style="margin-top:4px;width:100%" onclick="this.closest('.joker-dialog').remove()">Prekliči</button>
  </div>`;
  document.body.appendChild(d);
}

function startSituationMission(situationId) {
  const missions = Object.values(LONA_CONFIG.missions).filter(m => m.situation === situationId);
  if (!missions.length) { lonaToast("Ni misij za to situacijo", "red"); return; }
  const mission  = missions[0];
  const agentId  = getCurrentAgent();
  const name     = LONA_CONFIG.agents.find(a => a.id === agentId)?.name || agentId;

  // Naključni izziv
  const challenges = mission.challenges || [];
  const challenge  = challenges[Math.floor(Math.random() * challenges.length)];

  const d = document.createElement("div");
  d.className = "joker-dialog";
  d.innerHTML = `<div class="joker-dialog__box">
    <div class="joker-dialog__icon">${mission.icon}</div>
    <p class="joker-dialog__title">${mission.label}</p>
    <div style="background:#F2F2F7;border-radius:16px;padding:14px 16px;width:100%;text-align:center;margin:4px 0">
      <p style="font-size:.65rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#8E8E93;margin-bottom:6px">Izziv za ${name}</p>
      <p style="font-size:.95rem;font-weight:700;color:#1C1C1E;line-height:1.4">${challenge}</p>
    </div>
    <p style="font-size:.72rem;color:#8E8E93;text-align:center">Starš potrdi ko je opravljeno.</p>
    <div class="joker-dialog__btns">
      <button class="joker-dialog__cancel" onclick="startSituationMission('${situationId}');this.closest('.joker-dialog').remove()">↻ Drug izziv</button>
      <button class="joker-dialog__confirm">+${mission.baseXp} XP ✓</button>
    </div>
  </div>`;
  document.body.appendChild(d);
  d.querySelector(".joker-dialog__confirm").addEventListener("click", () => {
    d.remove();
    addXp(agentId, mission.baseXp);
    logMission(agentId, mission.id, mission.baseXp, {label: mission.label}, false);
    if (typeof addSeasonXp === "function") addSeasonXp(agentId, mission.baseXp);
    if (typeof addAttrXp === "function") addAttrXp(agentId, mission.id, mission.baseXp);
    showScrollBurn(mission.label, mission.baseXp);
    setTimeout(() => showStamp("OPRAVLJENO", "green"), 400);
    showXpFloat(mission.baseXp);
    lonaToast(`${name} +${mission.baseXp} XP — ${mission.label}!`, "green");
  });
}

// ── SHUFFLE MISIJE ────────────────────────────────────────
function shuffleMissions() {
  const grid = document.querySelector(".missions-grid");
  if (!grid) return;
  const btns = [...grid.children];
  // Fisher-Yates shuffle
  for (let i = btns.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    grid.appendChild(btns[j]);
    btns.splice(j, 1);
  }
  // Animacija
  grid.querySelectorAll(".mission-btn").forEach((btn, i) => {
    btn.style.animation = "none";
    btn.style.opacity = "0";
    btn.style.transform = "scale(.8)";
    setTimeout(() => {
      btn.style.transition = "all .25s ease";
      btn.style.opacity = "1";
      btn.style.transform = "scale(1)";
    }, i * 40);
  });
  _playSound("coin");
}

// ── ONBOARDING ───────────────────────────────────────────────
function checkOnboarding() {
  if (localStorage.getItem("lona_onboarded")) return;
  localStorage.setItem("lona_onboarded", "1");

  const steps = [
    { icon: "🛡️", title: "Dobrodošel, Poveljnik!",   text: "Lona OS je tvoj taktični terminal.\nLea in Nejc izvajajo misije — ti potrjuješ." },
    { icon: "📋", title: "Standard 0",                text: "Vsak dan začnite z jutranjo rutino.\nZobje · Pižama · Miza — potem se misije odklenejo." },
    { icon: "🎯", title: "Misije",                    text: "Izberi misijo, agent jo opravi.\nTi potrdiš kakovost in dodelješ XP." },
    { icon: "🌙", title: "Strah & Samostojnost",       text: "3 stopnje — od skupaj do sam.\nVsaka stopnja gradi pravo samostojnost." },
    { icon: "🏆", title: "Podan je ROZKAZ!",          text: "Standard 0 → Misije → XP → Nagrade.\nZačni danes. 🔥" },
  ];

  let step = 0;

  function showStep() {
    document.querySelector(".onboarding-dialog")?.remove();
    if (step >= steps.length) return;
    const s = steps[step];
    const d = document.createElement("div");
    d.className = "joker-dialog onboarding-dialog";
    d.innerHTML = `<div class="joker-dialog__box" style="text-align:center">
      <div style="font-size:3rem;margin-bottom:8px">${s.icon}</div>
      <div style="font-size:.62rem;font-weight:900;letter-spacing:.15em;text-transform:uppercase;color:#8E8E93;margin-bottom:6px">
        ${step+1} / ${steps.length}
      </div>
      <p style="font-family:'Nunito',sans-serif;font-size:1.2rem;font-weight:900;color:#1C1C1E;margin-bottom:10px">${s.title}</p>
      <p style="font-size:.88rem;font-weight:600;color:#3A3A3C;line-height:1.6;margin-bottom:16px;white-space:pre-line">${s.text}</p>
      <div style="display:flex;gap:8px">
        ${step > 0 ? '<button class="joker-dialog__cancel" onclick="document.querySelector(\'.onboarding-dialog\').remove()">Preskoči</button>' : ''}
        <button class="joker-dialog__confirm" style="flex:2" onclick="onboardNext()">
          ${step < steps.length-1 ? 'Naprej →' : 'Začnimo! 🚀'}
        </button>
      </div>
    </div>`;
    document.body.appendChild(d);
  }

  window.onboardNext = function() {
    step++;
    if (step >= steps.length) {
      document.querySelector(".onboarding-dialog")?.remove();
    } else {
      showStep();
    }
  };

  setTimeout(showStep, 800);
}
