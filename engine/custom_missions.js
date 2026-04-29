// ============================================================
//  LONA OS — engine/custom_missions.js
//  Lastne misije — starš doda svojo misijo
// ============================================================

const CUSTOM_KEY = "lona_custom_missions";

function customLoad() {
  return JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]");
}

function customSave(missions) {
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(missions));
}

function customAdd(label, icon, xp) {
  if (!label || !label.trim()) { lonaToast("Vnesi naziv misije!", "red"); return; }
  const missions = customLoad();
  const id = "custom_" + Date.now();
  missions.push({
    id,
    label:    label.trim(),
    icon:     icon || "⭐",
    baseXp:   parseInt(xp) || 20,
    category: "custom",
    state:    "available",
  });
  customSave(missions);
  lonaToast(`Misija "${label}" dodana! ✓`, "green");
  if (typeof renderMissionsGrid === "function") renderMissionsGrid(window.currentCat || "all");
}

function customDelete(id) {
  const missions = customLoad().filter(m => m.id !== id);
  customSave(missions);
  if (typeof renderMissionsGrid === "function") renderMissionsGrid(window.currentCat || "all");
}

function showCustomMissionDialog() {
  const d = document.createElement("div");
  d.className = "joker-dialog";
  d.innerHTML = `<div class="joker-dialog__box">
    <div class="joker-dialog__icon">✏️</div>
    <p class="joker-dialog__title">Nova Misija</p>
    <div style="width:100%;display:flex;flex-direction:column;gap:8px">
      <input id="cm-icon" type="text" placeholder="Emoji ikona (npr. 🌟)"
        style="padding:10px;border-radius:10px;border:1px solid #ddd;font-size:1.1rem;text-align:center;width:100%;box-sizing:border-box">
      <input id="cm-label" type="text" placeholder="Naziv misije..."
        style="padding:10px;border-radius:10px;border:1px solid #ddd;font-size:.9rem;width:100%;box-sizing:border-box">
      <input id="cm-xp" type="number" placeholder="XP vrednost (npr. 20)"
        style="padding:10px;border-radius:10px;border:1px solid #ddd;font-size:.9rem;width:100%;box-sizing:border-box"
        value="20" min="5" max="100">
    </div>
    <div class="joker-dialog__btns" style="margin-top:8px">
      <button class="joker-dialog__cancel" onclick="this.closest('.joker-dialog').remove()">Prekliči</button>
      <button class="joker-dialog__confirm" id="cm-confirm">Dodaj ✓</button>
    </div>
  </div>`;
  document.body.appendChild(d);
  document.getElementById("cm-confirm").addEventListener("click", () => {
    const icon  = document.getElementById("cm-icon").value.trim() || "⭐";
    const label = document.getElementById("cm-label").value;
    const xp    = document.getElementById("cm-xp").value;
    customAdd(label, icon, xp);
    d.remove();
  });
}

function initCustomMissions() {
  // Gumb za dodajanje misije — na category "custom" tab
  const customBtnId = "add-custom-mission-btn";
  if (document.getElementById(customBtnId)) return;

  // Gumb se doda dinamično ko je custom kategprija aktivna
  // Logika je v renderMissionsGrid
}
