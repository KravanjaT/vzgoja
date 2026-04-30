// ============================================================
//  LONA OS — config.js  (v3.0)
//  51 osnovnih misij + kovanci + sezone
// ============================================================

const LONA_CONFIG = {

  version: "3.0",
  appName: "LONA OS",
  subtitle: "Poveljniški Center",

  // ── AGENTS ─────────────────────────────────────────────────
  agents: [
    { id:"lea",  name:"Lea",  xp:240, avatar:"⚡",  photo:null, jokers:2, coins:50 },
    { id:"nejc", name:"Nejc", xp:195, avatar:"🛡️", photo:null, jokers:1, coins:30 },
  ],

  // ── COMMANDER ──────────────────────────────────────────────
  commander: {
    confirmLabel: "Potrdi ✓",
  },

  // ── KOVANCI + XP RAZMERJE ───────────────────────────────────
  // Vsaka misija dobi XP in kovance
  // EQ misije dobijo bonus kovance
  coinsPerXp: 0.4,  // 25 XP → 10 🪙

  // ── RANGI → odklenejo mojstrstvo ───────────────────────────
  ranks: [
    { label:"Regrut I",    minXp:0,    unlocks:[] },
    { label:"Regrut II",   minXp:100,  unlocks:["kuhanje_vajenec"] },
    { label:"Vojak I",     minXp:250,  unlocks:["sesanje_mojster"] },
    { label:"Vojak II",    minXp:450,  unlocks:["kuhanje_pomocnik"] },
    { label:"Desetnik I",  minXp:700,  unlocks:["organizacija_pro"] },
    { label:"Desetnik II", minXp:1000, unlocks:["kuhanje_mojster"] },
    { label:"Narednik I",  minXp:1400, unlocks:["eq_specialist"] },
    { label:"Narednik II", minXp:1900, unlocks:[] },
    { label:"Vodnik",      minXp:2500, unlocks:[] },
    { label:"Poročnik",    minXp:3200, unlocks:[] },
    { label:"Kapitan",     minXp:4200, unlocks:[] },
    { label:"Poveljnik",   minXp:5500, unlocks:[] },
  ],

  // ── GATEKEEPER ─────────────────────────────────────────────
  gatekeeper: {
    label:    "Standard 0",
    subtitle: "Jutranja rutina",
    checks: [
      { id:"zobje",   label:"Zobje",    icon:"🦷" },
      { id:"postelja",label:"Postelja", icon:"🛏️" },
      { id:"miza",    label:"Miza",     icon:"🪑" },
    ],
  },

  // ── NAGRADE (kovanci) ───────────────────────────────────────
  rewards: {
    personal: [
      { id:"igra_15",   label:"15 min igre",       icon:"🎮", cost:15  },
      { id:"cokolada",  label:"Čokolada",           icon:"🍫", cost:25  },
      { id:"sladoled",  label:"Sladoled",           icon:"🍦", cost:40  },
      { id:"kosilo",    label:"Izbira kosila",      icon:"🍽️", cost:80  },
      { id:"trgovina",  label:"Izbira v trgovini",  icon:"🛒", cost:150 },
      { id:"igraca",    label:"Nova igrača",        icon:"🧸", cost:300 },
    ],
    shared: [
      { id:"risanka",   label:"Risanka skupaj",      icon:"📺", cost:50  },
      { id:"tabor",     label:"Tabor v dnevni sobi", icon:"🏕️", cost:120 },
      { id:"kino",      label:"Kino večer",          icon:"🎬", cost:300 },
      { id:"izlet",     label:"Izlet po izbiri",     icon:"🗺️", cost:600 },
    ],
  },

  // ── SEZONE ─────────────────────────────────────────────────
  seasons: [
    { id:"osnovno",  label:"Osnovno",  icon:"📋", active:true  },
    { id:"zima",     label:"Zima",     icon:"❄️", active:false },
    { id:"pomlad",   label:"Pomlad",   icon:"🌸", active:false },
    { id:"poletje",  label:"Poletje",  icon:"☀️", active:false },
    { id:"jesen",    label:"Jesen",    icon:"🍂", active:false },
  ],

  // ── ACTION PROMPTS ──────────────────────────────────────────
  actionPrompts: [], // Odstranjeno — telovadba je posebna kategorija misij

  // ── MISIJE ─────────────────────────────────────────────────
  missions: {

    // ════════════════════════════════════════════════════════
    //  HIGIENA (5)
    // ════════════════════════════════════════════════════════
    tus: {
      id:"tus", label:"Tuš", icon:"🚿",
      xp:15, coins:6, cooldownHrs:48,
      category:"hygiene", location:"indoor",
      season:"osnovno", visible:true, state:"available",
      desc:"Umij se temeljito",
    },
    lase: {
      id:"lase", label:"Umij Lase", icon:"💆",
      xp:10, coins:4, cooldownHrs:48,
      category:"hygiene", location:"indoor",
      season:"osnovno", visible:true, state:"available",
      desc:"Šampon + sušenje",
    },
    nohti: {
      id:"nohti", label:"Postriži Nohte", icon:"✂️",
      xp:10, coins:4, cooldownHrs:168,
      category:"hygiene", location:"indoor",
      season:"osnovno", visible:true, state:"available",
      desc:"Roke in noge",
    },
    roke: {
      id:"roke", label:"Umij Roke", icon:"🙌",
      xp:5, coins:2, cooldownHrs:24,
      category:"hygiene", location:"indoor",
      season:"osnovno", visible:true, state:"available",
      desc:"Pred jedjo in po WC",
    },
    obraz: {
      id:"obraz", label:"Umij Obraz", icon:"💧",
      xp:8, coins:3, cooldownHrs:24,
      category:"hygiene", location:"indoor",
      season:"osnovno", visible:true, state:"available",
      desc:"Zjutraj in zvečer",
    },

    // ════════════════════════════════════════════════════════
    //  ČIŠČENJE (8)
    // ════════════════════════════════════════════════════════
    sesanje: {
      id:"sesanje", label:"Sesanje", icon:"🌬️",
      xp:25, coins:10, cooldownHrs:72,
      category:"cleaning", location:"indoor",
      season:"osnovno", visible:true, state:"available",
      desc:"Cel hodnik ali soba",
    },
    posoda: {
      id:"posoda", label:"Pomivalni Stroj", icon:"🍽️",
      xp:15, coins:6, cooldownHrs:24,
      category:"cleaning", location:"indoor",
      season:"osnovno", visible:true, state:"available",
      desc:"Naloži ali razloži",
    },
    perilo: {
      id:"perilo", label:"Gora Perila", icon:"🧺",
      xp:30, coins:12, cooldownHrs:72,
      category:"cleaning", location:"indoor",
      season:"osnovno", visible:true, state:"available",
      desc:"Zloži in spravi",
    },
    wc: {
      id:"wc", label:"WC Čiščenje", icon:"🚽",
      xp:20, coins:8, cooldownHrs:72,
      category:"cleaning", location:"indoor",
      season:"osnovno", visible:true, state:"available",
      desc:"WC + umivalnik",
    },
    prah: {
      id:"prah", label:"Obrisi Prah", icon:"🪣",
      xp:20, coins:8, cooldownHrs:72,
      category:"cleaning", location:"indoor",
      season:"osnovno", visible:true, state:"available",
      desc:"Police in pohištvo",
    },
    okna: {
      id:"okna", label:"Okna", icon:"🪟",
      xp:25, coins:10, cooldownHrs:168,
      category:"cleaning", location:"indoor",
      season:"osnovno", visible:true, state:"available",
      desc:"Vsaj 2 okni",
    },
    kopalnica: {
      id:"kopalnica", label:"Kopalnica", icon:"🛁",
      xp:30, coins:12, cooldownHrs:72,
      category:"cleaning", location:"indoor",
      season:"osnovno", visible:true, state:"available",
      desc:"Kad + tla + ogledalo",
    },
    kuhinja_ciscenje: {
      id:"kuhinja_ciscenje", label:"Počisti Kuhinjo", icon:"🫧",
      xp:20, coins:8, cooldownHrs:48,
      category:"cleaning", location:"indoor",
      season:"osnovno", visible:true, state:"available",
      desc:"Pulti + štedilnik",
    },

    // ════════════════════════════════════════════════════════
    //  KUHINJA (6)
    // ════════════════════════════════════════════════════════
    kuhanje: {
      id:"kuhanje", label:"Kuhanje", icon:"🍳",
      xp:40, coins:16, cooldownHrs:48,
      category:"kitchen", location:"indoor",
      season:"osnovno", visible:true, state:"available",
      desc:"Pripravi pravi obrok",
    },
    zajtrk: {
      id:"zajtrk", label:"Pripravi Zajtrk", icon:"🥣",
      xp:15, coins:6, cooldownHrs:24,
      category:"kitchen", location:"indoor",
      season:"osnovno", visible:true, state:"available",
      desc:"Za sebe ali vse",
    },
    kosilo_prep: {
      id:"kosilo_prep", label:"Pomagaj pri Kosilu", icon:"🥗",
      xp:20, coins:8, cooldownHrs:48,
      category:"kitchen", location:"indoor",
      season:"osnovno", visible:true, state:"available",
      desc:"Rezanje, mešanje...",
    },
    pospraviti_po: {
      id:"pospraviti_po", label:"Pospravi po Kuhanju", icon:"🧹",
      xp:15, coins:6, cooldownHrs:24,
      category:"kitchen", location:"indoor",
      season:"osnovno", visible:true, state:"available",
      desc:"Pospravi vse po sebi",
    },
    nakupi: {
      id:"nakupi", label:"Nakupovalni Seznam", icon:"📝",
      xp:15, coins:6, cooldownHrs:72,
      category:"kitchen", location:"any",
      season:"osnovno", visible:true, state:"available",
      desc:"Napiši kaj manjka",
    },
    sladica: {
      id:"sladica", label:"Naredi Sladico", icon:"🍰",
      xp:30, coins:12, cooldownHrs:72,
      category:"kitchen", location:"indoor",
      season:"osnovno", visible:true, state:"available",
      desc:"Pecivo, palačinke...",
    },

    // ════════════════════════════════════════════════════════
    //  ORGANIZACIJA (5)
    // ════════════════════════════════════════════════════════
    soba: {
      id:"soba", label:"Pospravi Sobo", icon:"📦",
      xp:20, coins:8, cooldownHrs:48,
      category:"organisation", location:"indoor",
      season:"osnovno", visible:true, state:"available",
      desc:"Vse na svoje mesto",
    },
    torba: {
      id:"torba", label:"Pripravi Torbo", icon:"🎒",
      xp:10, coins:4, cooldownHrs:24,
      category:"organisation", location:"indoor",
      season:"osnovno", visible:true, state:"available",
      desc:"Za jutri",
    },
    omare: {
      id:"omare", label:"Uredi Omare", icon:"🗄️",
      xp:25, coins:10, cooldownHrs:168,
      category:"organisation", location:"indoor",
      season:"osnovno", visible:true, state:"available",
      desc:"Obleke po vrsti",
    },
    pisalna_miza: {
      id:"pisalna_miza", label:"Uredi Pisalno Mizo", icon:"🖊️",
      xp:15, coins:6, cooldownHrs:72,
      category:"organisation", location:"indoor",
      season:"osnovno", visible:true, state:"available",
      desc:"Čista in urejena",
    },
    skupni_prostori: {
      id:"skupni_prostori", label:"Skupni Prostori", icon:"🛋️",
      xp:20, coins:8, cooldownHrs:48,
      category:"organisation", location:"indoor",
      season:"osnovno", visible:true, state:"available",
      desc:"Dnevna soba, hodnik",
    },

    // ════════════════════════════════════════════════════════
    //  EQ AKCIJA (7) — +Joker
    // ════════════════════════════════════════════════════════
    nevtralizator: {
      id:"nevtralizator", label:"Nevtralizator", icon:"🧘",
      xp:40, coins:20, cooldownHrs:24,
      category:"eq", location:"any",
      eqType:"akcija", jokerReward:1,
      season:"osnovno", visible:true, state:"available",
      desc:"Upravljaj čustvo v realnem trenutku",
    },
    narocanje: {
      id:"narocanje", label:"Naroči Sam", icon:"🍽️",
      xp:50, coins:25, cooldownHrs:48,
      category:"eq", location:"outdoor",
      eqType:"akcija", jokerReward:1,
      season:"osnovno", visible:true, state:"available",
      desc:"Sam naroči v kavarni ali gostilni",
    },
    telefon_tujec: {
      id:"telefon_tujec", label:"Telefonski Klic", icon:"📞",
      xp:60, coins:30, cooldownHrs:72,
      category:"eq", location:"any",
      eqType:"akcija", jokerReward:1,
      season:"osnovno", visible:true, state:"available",
      desc:"Pokliči tujca — zobozdravnik, pizza...",
    },
    opravicilo: {
      id:"opravicilo", label:"Opravičilo", icon:"🙏",
      xp:50, coins:25, cooldownHrs:48,
      category:"eq", location:"any",
      eqType:"akcija", jokerReward:1,
      season:"osnovno", visible:true, state:"available",
      desc:"Pristno se opraviči",
    },
    pohvala: {
      id:"pohvala", label:"Pohvali Nekoga", icon:"⭐",
      xp:35, coins:15, cooldownHrs:24,
      category:"eq", location:"any",
      eqType:"akcija", jokerReward:1,
      season:"osnovno", visible:true, state:"available",
      desc:"Iskrena pohvala — ne samo super",
    },
    nova_stvar: {
      id:"nova_stvar", label:"Nova Stvar", icon:"🎯",
      xp:45, coins:20, cooldownHrs:72,
      category:"eq", location:"any",
      eqType:"akcija", jokerReward:1,
      season:"osnovno", visible:true, state:"available",
      desc:"Poskusi nekaj kar te je strah",
    },
    pomoc_tujcu: {
      id:"pomoc_tujcu", label:"Pomoč Tujcu", icon:"🤲",
      xp:40, coins:20, cooldownHrs:48,
      category:"eq", location:"any",
      eqType:"akcija", jokerReward:1,
      season:"osnovno", visible:true, state:"available",
      desc:"Ponudi pomoč neznani osebi",
    },

    // ════════════════════════════════════════════════════════
    //  EQ REFLEKSIJA (5)
    // ════════════════════════════════════════════════════════
    debriefing: {
      id:"debriefing", label:"Debriefing", icon:"📋",
      xp:30, coins:12, cooldownHrs:24,
      category:"eq", location:"any",
      eqType:"refleksija",
      season:"osnovno", visible:true, state:"available",
      desc:"Pogovor o tem kaj se je danes zgodilo",
    },
    advokat: {
      id:"advokat", label:"Advokat", icon:"⚖️",
      xp:35, coins:14, cooldownHrs:48,
      category:"eq", location:"any",
      eqType:"refleksija",
      season:"osnovno", visible:true, state:"available",
      desc:"Vidik druge osebe",
    },
    intel_report: {
      id:"intel_report", label:"Intel Report", icon:"🤝",
      xp:25, coins:10, cooldownHrs:168,
      category:"eq", location:"any",
      eqType:"refleksija",
      season:"osnovno", visible:true, state:"available",
      desc:"Zahvala — konkretna",
    },
    situacijski_izziv: {
      id:"situacijski_izziv", label:"Situacijski Izziv", icon:"🎭",
      xp:45, coins:18, cooldownHrs:72,
      category:"eq", location:"any",
      eqType:"refleksija",
      season:"osnovno", visible:true, state:"available",
      desc:"Kako bi reagiral v tej situaciji?",
    },
    hvaleznost: {
      id:"hvaleznost", label:"Hvaležnost", icon:"💛",
      xp:20, coins:8, cooldownHrs:24,
      category:"eq", location:"any",
      eqType:"refleksija",
      season:"osnovno", visible:true, state:"available",
      desc:"3 stvari za katere si hvaležen danes",
    },

    // ════════════════════════════════════════════════════════
    //  OUTDOOR (6)
    // ════════════════════════════════════════════════════════
    sprehod: {
      id:"sprehod", label:"Sprehod", icon:"🚶",
      xp:20, coins:8, cooldownHrs:24,
      category:"outdoor", location:"outdoor",
      season:"osnovno", visible:true, state:"available",
      desc:"Vsaj 20 minut hoje",
    },
    kolesarjenje: {
      id:"kolesarjenje", label:"Kolesarjenje", icon:"🚴",
      xp:30, coins:12, cooldownHrs:48,
      category:"outdoor", location:"outdoor",
      season:"osnovno", visible:true, state:"available",
      desc:"Vsaj 20 minut",
    },
    tek: {
      id:"tek", label:"Tek", icon:"🏃",
      xp:35, coins:14, cooldownHrs:48,
      category:"outdoor", location:"outdoor",
      season:"osnovno", visible:true, state:"available",
      desc:"Vsaj 10 minut",
    },
    plavanje: {
      id:"plavanje", label:"Plavanje", icon:"🏊",
      xp:35, coins:14, cooldownHrs:48,
      category:"outdoor", location:"outdoor",
      season:"osnovno", visible:true, state:"available",
      desc:"Vsaj 30 minut",
    },
    sport: {
      id:"sport", label:"Šport", icon:"⚽",
      xp:30, coins:12, cooldownHrs:48,
      category:"outdoor", location:"outdoor",
      season:"osnovno", visible:true, state:"available",
      desc:"Kakršenkoli šport z drugimi",
    },
    narava: {
      id:"narava", label:"V Naravi", icon:"🌲",
      xp:25, coins:10, cooldownHrs:48,
      category:"outdoor", location:"outdoor",
      season:"osnovno", visible:true, state:"available",
      desc:"Gozd, park, travnik",
    },

    // ════════════════════════════════════════════════════════
    //  STRAH (6)
    // ════════════════════════════════════════════════════════
    strah_tema: {
      id:"strah_tema", label:"Strah: Tema", icon:"🌑",
      xp:35, coins:15, cooldownHrs:72,
      category:"fear", location:"any",
      season:"osnovno", visible:true, state:"available",
      desc:"5 minut sam v temi",
    },
    strah_visina: {
      id:"strah_visina", label:"Strah: Višina", icon:"🧗",
      xp:40, coins:18, cooldownHrs:72,
      category:"fear", location:"outdoor",
      season:"osnovno", visible:true, state:"available",
      desc:"Pojdi višje kot ponavadi",
    },
    strah_tujci: {
      id:"strah_tujci", label:"Strah: Tujci", icon:"👥",
      xp:45, coins:20, cooldownHrs:72,
      category:"fear", location:"any",
      season:"osnovno", visible:true, state:"available",
      desc:"Povej si z neznano osebo",
    },
    strah_neuspeh: {
      id:"strah_neuspeh", label:"Strah: Neuspeh", icon:"💪",
      xp:40, coins:18, cooldownHrs:72,
      category:"fear", location:"any",
      season:"osnovno", visible:true, state:"available",
      desc:"Poskusi stvar kjer verjetno ne uspeš",
    },
    strah_zmota: {
      id:"strah_zmota", label:"Strah: Zmota", icon:"🙋",
      xp:35, coins:15, cooldownHrs:72,
      category:"fear", location:"any",
      season:"osnovno", visible:true, state:"available",
      desc:"Prizaj napako pred drugimi",
    },
    strah_novo: {
      id:"strah_novo", label:"Novo Okolje", icon:"🗺️",
      xp:40, coins:18, cooldownHrs:168,
      category:"fear", location:"any",
      season:"osnovno", visible:true, state:"available",
      desc:"Pojdi sam na novo mesto",
    },

    // ════════════════════════════════════════════════════════
    //  BRANJE (3)
    // ════════════════════════════════════════════════════════
    branje_knjiga: {
      id:"branje_knjiga", label:"Branje", icon:"📚",
      xp:25, coins:10, cooldownHrs:24,
      category:"creativity", location:"any",
      season:"osnovno", visible:true, state:"available",
      desc:"Vsaj 20 minut",
    },
    branje_glasno: {
      id:"branje_glasno", label:"Glasno Branje", icon:"📖",
      xp:30, coins:14, cooldownHrs:48,
      category:"creativity", location:"any",
      season:"osnovno", visible:true, state:"available",
      desc:"Beri mlajšemu ali staršu",
    },
    branje_strip: {
      id:"branje_strip", label:"Strip / Revija", icon:"📰",
      xp:15, coins:6, cooldownHrs:48,
      category:"creativity", location:"any",
      season:"osnovno", visible:true, state:"available",
      desc:"Kakršnokoli branje",
    },

    // ════════════════════════════════════════════════════════
    //  TELOVADBA (8)
    // ════════════════════════════════════════════════════════
    preval: {
      id:"preval", label:"Preval", icon:"🤸",
      xp:15, coins:6, cooldownHrs:24,
      category:"fitness", location:"indoor",
      season:"osnovno", visible:true, state:"available",
      desc:"5× preval naprej ali nazaj",
    },
    storklja: {
      id:"storklja", label:"Štorklja", icon:"🦩",
      xp:10, coins:4, cooldownHrs:24,
      category:"fitness", location:"any",
      season:"osnovno", visible:true, state:"available",
      desc:"Stoj na eni nogi 30 sekund",
    },
    sklece: {
      id:"sklece", label:"Sklece", icon:"💪",
      xp:20, coins:8, cooldownHrs:48,
      category:"fitness", location:"any",
      season:"osnovno", visible:true, state:"available",
      desc:"10× sklece",
    },
    trebusnjaki: {
      id:"trebusnjaki", label:"Trebušnjaki", icon:"🏋️",
      xp:20, coins:8, cooldownHrs:48,
      category:"fitness", location:"any",
      season:"osnovno", visible:true, state:"available",
      desc:"20× trebušnjaki",
    },
    raztezanje: {
      id:"raztezanje", label:"Raztezanje", icon:"🧘",
      xp:15, coins:6, cooldownHrs:24,
      category:"fitness", location:"any",
      season:"osnovno", visible:true, state:"available",
      desc:"10 minut raztezanja",
    },
    poskok: {
      id:"poskok", label:"Poskoki", icon:"⚡",
      xp:15, coins:6, cooldownHrs:24,
      category:"fitness", location:"any",
      season:"osnovno", visible:true, state:"available",
      desc:"50× poskoki",
    },
    plank: {
      id:"plank", label:"Plank", icon:"🪨",
      xp:20, coins:8, cooldownHrs:48,
      category:"fitness", location:"any",
      season:"osnovno", visible:true, state:"available",
      desc:"Drži plank 30 sekund",
    },
    joga: {
      id:"joga", label:"Mini Joga", icon:"🌸",
      xp:25, coins:10, cooldownHrs:48,
      category:"fitness", location:"any",
      season:"osnovno", visible:true, state:"available",
      desc:"10 minut joge ali meditacije",
    },

  }, // konec missions

  // ── MOJSTRSTVO (odklenejo rangi) ────────────────────────────
  masterySkills: {
    kuhanje: {
      id:"kuhanje", label:"Mojster Kuhinje", icon:"👨‍🍳",
      levels:[
        { label:"Začetnik",  icon:"🥄", xpCost:0,   xpReward:0,   description:"Znaš pripraviti preprost zajtrk." },
        { label:"Pomočnik",  icon:"🍴", xpCost:50,  xpReward:0,   description:"Pomagaš pri kuhanju. Znaš rezati in mešati." },
        { label:"Kuhar",     icon:"🍳", xpCost:100, xpReward:0,   description:"Sam kuhaš preproste obroke." },
        { label:"Šef Kuhar", icon:"👨‍🍳", xpCost:200, xpReward:0,   description:"Kuhaš za vso družino." },
        { label:"Mojster",   icon:"⭐", xpCost:350, xpReward:0,   description:"Izumljаš lastne recepte." },
      ],
    },
    ciscenje: {
      id:"ciscenje", label:"Mojster Čiščenja", icon:"🧹",
      levels:[
        { label:"Nered",     icon:"💨", xpCost:0,   xpReward:0,   description:"Iščeš izgovore." },
        { label:"Pomočnik",  icon:"🧹", xpCost:40,  xpReward:0,   description:"Poseseš svojo sobo." },
        { label:"Čistilec",  icon:"✨", xpCost:80,  xpReward:0,   description:"Čistiš brez opomina." },
        { label:"Mojster",   icon:"🏆", xpCost:150, xpReward:0,   description:"Znaš čistiti vse prostore." },
      ],
    },
    organizacija: {
      id:"organizacija", label:"Organizator", icon:"📦",
      levels:[
        { label:"Kaos",        icon:"🌀", xpCost:0,   xpReward:0,   description:"Stvari povsod." },
        { label:"Urejen",      icon:"📦", xpCost:50,  xpReward:0,   description:"Svoja soba urejena." },
        { label:"Organizator", icon:"🗂️", xpCost:120, xpReward:0,   description:"Veš kje je vse." },
        { label:"Pro",         icon:"⭐", xpCost:250, xpReward:0,   description:"Organiziraš za vso družino." },
      ],
    },
    eq_skill: {
      id:"eq_skill", label:"EQ Specialist", icon:"🧠",
      levels:[
        { label:"Začetnik",   icon:"😐", xpCost:0,   xpReward:0,   description:"Čustva te obvladajo." },
        { label:"Opazovalec", icon:"👁️", xpCost:60,  xpReward:0,   description:"Prepoznaš svoja čustva." },
        { label:"Specialist", icon:"🧘", xpCost:150, xpReward:0,   description:"Upravljaš čustva v težkih situacijah." },
        { label:"Mojster EQ", icon:"🧠", xpCost:300, xpReward:0,   description:"Pomagaš drugim z njihovimi čustvi." },
      ],
    },
    fitness: {
      id:"fitness", label:"Športnik", icon:"💪",
      levels:[
        { label:"Kavčnik",   icon:"🛋️", xpCost:0,   xpReward:0,   description:"Raje sediš." },
        { label:"Aktiven",   icon:"🚶", xpCost:40,  xpReward:0,   description:"Redna telesna aktivnost." },
        { label:"Atlet",     icon:"🏃", xpCost:100, xpReward:0,   description:"Vsak dan se potrudi." },
        { label:"Prvak",     icon:"🏆", xpCost:200, xpReward:0,   description:"Reden trening, zdrav slog." },
      ],
    },
  },

}; // konec LONA_CONFIG
