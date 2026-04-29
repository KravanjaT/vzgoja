// ============================================================
//  LONA OS — engine/joker.js
//  Joker sistem — getJokers, spendJoker, earnJoker
// ============================================================

function jokerKey(agentId) {
  return "lona_jokers_" + agentId;
}

function getJokers(agentId) {
  const stored = localStorage.getItem(jokerKey(agentId));
  if (stored !== null) return parseInt(stored);
  // Default iz config
  return LONA_CONFIG.agents.find(a => a.id === agentId)?.jokers ?? 0;
}

function spendJoker(agentId) {
  const current = getJokers(agentId);
  if (current <= 0) return false;
  localStorage.setItem(jokerKey(agentId), String(current - 1));
  if (typeof renderCmdAgents === "function") renderCmdAgents();
  return true;
}

function earnJoker(agentId, amount) {
  const current = getJokers(agentId);
  localStorage.setItem(jokerKey(agentId), String(current + (amount || 1)));
  if (typeof renderCmdAgents === "function") renderCmdAgents();
  lonaToast(`🃏 +${amount || 1} Joker${(amount||1) > 1 ? "ji" : ""} za ${LONA_CONFIG.agents.find(a=>a.id===agentId)?.name}!`, "gold");
}

function initJokers() {
  // Inicializiraj iz config če ni v localStorage
  LONA_CONFIG.agents.forEach(a => {
    if (localStorage.getItem(jokerKey(a.id)) === null) {
      localStorage.setItem(jokerKey(a.id), String(a.jokers ?? 0));
    }
  });
}
