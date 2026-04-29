// ============================================================
//  LONA OS — engine/bank.js
//  Lona Banka — depoziti + obresti po 7 dneh
// ============================================================

function bankKey(agentId) {
  return `lona_bank_${agentId}`;
}

function getBankDeposits(agentId) {
  return JSON.parse(localStorage.getItem(bankKey(agentId)) || "[]");
}

function saveBankDeposits(agentId, deposits) {
  localStorage.setItem(bankKey(agentId), JSON.stringify(deposits));
}

function bankDeposit(agentId, amount) {
  const cfg = LONA_CONFIG.bank;
  if (amount < cfg.minDeposit) { lonaToast(`Minimum depozit: ${cfg.minDeposit} XP`, "red"); return; }
  if (amount > cfg.maxDeposit) { lonaToast(`Maksimum depozit: ${cfg.maxDeposit} XP`, "red"); return; }
  if (getXp(agentId) < amount) { lonaToast("Premalo XP!", "red"); return; }

  addXp(agentId, -amount);

  const deposits = getBankDeposits(agentId);
  deposits.push({
    amount,
    deposited: Date.now(),
    matures:   Date.now() + cfg.durationDays * 86400000,
    claimed:   false,
  });
  saveBankDeposits(agentId, deposits);
  lonaToast(`💰 Depozit ${amount} XP → obresti po ${cfg.durationDays} dneh!`, "gold");
  renderBankPanel(agentId);
}

function bankClaim(agentId, depositIdx) {
  const deposits = getBankDeposits(agentId);
  const d = deposits[depositIdx];
  if (!d || d.claimed) return;
  if (Date.now() < d.matures) {
    lonaToast(`Depozit dozori ${new Date(d.matures).toLocaleDateString("sl")}`, "red");
    return;
  }

  const interest = Math.round(d.amount * LONA_CONFIG.bank.interestRate);
  const total    = d.amount + interest;
  d.claimed = true;
  saveBankDeposits(agentId, deposits);
  addXp(agentId, total);
  if (typeof showXpFloat === "function") showXpFloat(total);
  lonaToast(`💰 Dvignjen depozit! +${total} XP (${interest} XP obresti)`, "gold");
  renderBankPanel(agentId);
}

function renderBankPanel(agentId) {
  const el = document.getElementById("bank-panel");
  if (!el) return;

  const deposits = getBankDeposits(agentId).filter(d => !d.claimed);
  const cfg      = LONA_CONFIG.bank;
  const now      = Date.now();

  el.innerHTML = `
    <div class="bank-panel">
      <p class="bank-panel__title">🏦 Lona Banka — ${cfg.interestRate * 100}% po ${cfg.durationDays} dneh</p>
      ${deposits.length === 0 ? '<p class="bank-panel__empty">Ni aktivnih depozitov.</p>' : ""}
      ${deposits.map((d, i) => {
        const matured = now >= d.matures;
        const interest = Math.round(d.amount * cfg.interestRate);
        return `<div class="bank-deposit ${matured ? "bank-deposit--ready" : ""}">
          <span class="bank-deposit__amount">${d.amount} XP</span>
          <span class="bank-deposit__interest">+${interest} XP</span>
          ${matured
            ? `<button class="bank-deposit__claim" onclick="bankClaim('${agentId}',${i})">Dvigni ✓</button>`
            : `<span class="bank-deposit__date">${new Date(d.matures).toLocaleDateString("sl")}</span>`
          }
        </div>`;
      }).join("")}
      <div class="bank-deposit-form">
        <input type="number" id="bank-input-${agentId}" placeholder="XP znesek" min="${cfg.minDeposit}" max="${cfg.maxDeposit}"
          style="width:100px;padding:6px;border-radius:8px;border:1px solid #ccc;font-size:.85rem">
        <button onclick="bankDeposit('${agentId}', parseInt(document.getElementById('bank-input-${agentId}').value))"
          style="padding:6px 12px;border-radius:8px;background:#007AFF;color:white;border:none;font-weight:700;font-size:.85rem;cursor:pointer">
          Deponiraj
        </button>
      </div>
    </div>
  `;
}

function initBank() {
  const agentId = typeof getCurrentAgent === "function" ? getCurrentAgent() : null;
  if (!agentId) return;

  // Preveri dozorele depozite ob zagonu
  const deposits = getBankDeposits(agentId);
  const now = Date.now();
  const readyCount = deposits.filter(d => !d.claimed && now >= d.matures).length;
  if (readyCount > 0) {
    lonaToast(`🏦 ${readyCount} depozit${readyCount > 1 ? "i" : ""} čakajo na dvig!`, "gold");
  }

  renderBankPanel(agentId);
}
