// ============================================================
//  LONA OS — engine/attributes.js
//  Gibalni atributi — moč, koordinacija, hitrost...
// ============================================================

function attrKey(agentId, attrId) {
  return `lona_attr_${agentId}_${attrId}`;
}

function getAttrXp(agentId, attrId) {
  return parseInt(localStorage.getItem(attrKey(agentId, attrId)) || "0");
}

function getAttrLevel(agentId, attrId) {
  const attr = LONA_CONFIG.attributes[attrId];
  if (!attr) return 0;
  return Math.floor(getAttrXp(agentId, attrId) / attr.xpPerLevel);
}

function getAttrTitle(agentId, attrId) {
  const attr  = LONA_CONFIG.attributes[attrId];
  if (!attr) return "";
  const level = Math.min(getAttrLevel(agentId, attrId), attr.titles.length - 1);
  return attr.titles[level];
}

function addAttrXp(agentId, missionId, xpAmount) {
  const attrs = LONA_CONFIG.attributes;
  Object.values(attrs).forEach(attr => {
    if ((attr.missions || []).includes(missionId)) {
      const prev  = getAttrXp(agentId, attr.id);
      const added = Math.round(xpAmount * 0.5); // 50% misijskega XP gre v atribut
      localStorage.setItem(attrKey(agentId, attr.id), String(prev + added));

      // Level up check
      const prevLvl = Math.floor(prev / attr.xpPerLevel);
      const newLvl  = Math.floor((prev + added) / attr.xpPerLevel);
      if (newLvl > prevLvl) {
        const title = attr.titles[Math.min(newLvl, attr.titles.length - 1)];
        lonaToast(`${attr.icon} ${attr.label}: ${title}!`, "gold");
      }
    }
  });
}

function renderAttrsMini(agentId) {
  const el = document.getElementById("attrs-mini");
  if (!el) return;

  const attrs = LONA_CONFIG.attributes;
  el.innerHTML = Object.values(attrs).map(attr => {
    const xp    = getAttrXp(agentId, attr.id);
    const level = getAttrLevel(agentId, attr.id);
    const pct   = Math.round((xp % attr.xpPerLevel) / attr.xpPerLevel * 100);
    const title = getAttrTitle(agentId, attr.id);
    return `<div class="attr-mini" title="${attr.label}: ${title}">
      <span class="attr-mini__icon">${attr.icon}</span>
      <div class="attr-mini__bar">
        <div class="attr-mini__fill" style="width:${pct}%;background:${attr.color}"></div>
      </div>
      <span class="attr-mini__lvl">${level}</span>
    </div>`;
  }).join("");
}

function renderAttrsPanel(agentId) {
  const el = document.getElementById("attrs-panel");
  if (!el) return;

  const attrs = LONA_CONFIG.attributes;
  el.innerHTML = `
    <div class="attrs-panel">
      <p class="attrs-panel__title">⚡ Atributi</p>
      <div class="attrs-grid">
        ${Object.values(attrs).map(attr => {
          const xp    = getAttrXp(agentId, attr.id);
          const level = getAttrLevel(agentId, attr.id);
          const pct   = Math.round((xp % attr.xpPerLevel) / attr.xpPerLevel * 100);
          const title = getAttrTitle(agentId, attr.id);
          return `<div class="attr-card">
            <span class="attr-card__icon" style="color:${attr.color}">${attr.icon}</span>
            <div class="attr-card__info">
              <p class="attr-card__name">${attr.label}</p>
              <p class="attr-card__title" style="color:${attr.color}">${title}</p>
              <div class="attr-bar">
                <div class="attr-bar__fill" style="width:${pct}%;background:${attr.color}"></div>
              </div>
            </div>
            <span class="attr-card__lvl">Lv${level}</span>
          </div>`;
        }).join("")}
      </div>
    </div>
  `;
}

function initAttributes() {
  const agentId = typeof getCurrentAgent === "function" ? getCurrentAgent() : null;
  if (!agentId) return;
  renderAttrsMini(agentId);
  renderAttrsPanel(agentId);
}
