// ============================================================
//  LONA OS — engine/equipment.js
//  Oprema = Licence — odklenjena z mastery nivojem
// ============================================================

function eqKey(agentId) {
  return `lona_equipment_${agentId}`;
}

function getEquippedItems(agentId) {
  return JSON.parse(localStorage.getItem(eqKey(agentId)) || "[]");
}

function isEquipmentUnlocked(agentId, itemId) {
  const item = (LONA_CONFIG.equipment || []).find(e => e.id === itemId);
  if (!item) return false;
  const skill = item.unlockedBy?.skill;
  const level = item.unlockedBy?.level ?? 0;
  if (!skill) return true;
  return getMasteryLevel(agentId, skill) >= level;
}

function getUnlockedEquipment(agentId) {
  return (LONA_CONFIG.equipment || []).filter(e => isEquipmentUnlocked(agentId, e.id));
}

function equipItem(agentId, itemId) {
  if (!isEquipmentUnlocked(agentId, itemId)) {
    lonaToast("Predmet ni odklenjen!", "red");
    return;
  }
  const equipped = getEquippedItems(agentId);
  const item = (LONA_CONFIG.equipment || []).find(e => e.id === itemId);
  if (!item) return;

  // Zamenjaj item istega slota
  const filtered = equipped.filter(id => {
    const e = (LONA_CONFIG.equipment || []).find(x => x.id === id);
    return e?.slot !== item.slot;
  });
  filtered.push(itemId);
  localStorage.setItem(eqKey(agentId), JSON.stringify(filtered));
  lonaToast(`${item.label} opremljeno! ${item.icon}`, "gold");
}

function getXpBonus(agentId) {
  const equipped = getEquippedItems(agentId);
  return equipped.reduce((sum, id) => {
    const item = (LONA_CONFIG.equipment || []).find(e => e.id === id);
    return sum + (item?.xpBonus || 0);
  }, 0);
}

function renderEquipmentPanel(agentId) {
  const el = document.getElementById("equipment-panel");
  if (!el) return;

  const unlocked = getUnlockedEquipment(agentId);
  const equipped = getEquippedItems(agentId);
  const all      = LONA_CONFIG.equipment || [];

  el.innerHTML = `
    <div class="eq-panel">
      <p class="eq-panel__title">🛡️ Oprema & Licence</p>
      <div class="eq-grid">
        ${all.map(item => {
          const isUnlocked = isEquipmentUnlocked(agentId, item.id);
          const isOn = equipped.includes(item.id);
          return `<div class="eq-item ${isUnlocked ? "eq-item--unlocked" : "eq-item--locked"} ${isOn ? "eq-item--equipped" : ""}"
            onclick="${isUnlocked ? `equipItem('${agentId}','${item.id}')` : ""}">
            <span class="eq-item__icon">${isUnlocked ? item.icon : "🔒"}</span>
            <span class="eq-item__name">${isUnlocked ? item.label : "???"}</span>
            ${isOn ? '<span class="eq-item__badge">✓</span>' : ""}
          </div>`;
        }).join("")}
      </div>
    </div>
  `;
}

function initEquipment() {
  const agentId = typeof getCurrentAgent === "function" ? getCurrentAgent() : null;
  if (agentId) renderEquipmentPanel(agentId);
}
