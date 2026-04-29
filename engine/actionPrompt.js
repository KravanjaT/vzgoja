// ============================================================
//  LONA OS — engine/actionPrompt.js
//  Gibalni modifikatorji pred misijami
// ============================================================

let _apActive = null;
let _apTimeout = null;

function getRandomActionPrompt() {
  const prompts = LONA_CONFIG.actionPrompts;
  if (!prompts || !prompts.length) return null;
  return prompts[Math.floor(Math.random() * prompts.length)];
}

function showActionPrompt(onDone) {
  const prompt = getRandomActionPrompt();
  if (!prompt) { onDone && onDone(); return; }

  const el = document.getElementById("action-prompt-bar");
  if (!el) { onDone && onDone(); return; }

  _apActive = prompt;

  el.innerHTML = `
    <div class="ap-bar__inner">
      <span class="ap-bar__icon">${prompt.icon}</span>
      <div class="ap-bar__text">
        <p class="ap-bar__label">${prompt.label}</p>
        <p class="ap-bar__desc">${prompt.text}</p>
      </div>
      <button class="ap-bar__done" onclick="confirmActionPrompt()">✓</button>
    </div>
  `;
  el.style.display = "block";
  el.classList.add("ap-bar--visible");

  // Auto dismiss po 30s
  if (_apTimeout) clearTimeout(_apTimeout);
  _apTimeout = setTimeout(() => {
    hideActionPrompt();
    onDone && onDone();
  }, 30000);
}

function confirmActionPrompt() {
  if (_apTimeout) clearTimeout(_apTimeout);
  hideActionPrompt();
}

function hideActionPrompt() {
  const el = document.getElementById("action-prompt-bar");
  if (!el) return;
  el.classList.remove("ap-bar--visible");
  setTimeout(() => { el.style.display = "none"; }, 300);
  _apActive = null;
}

function initActionPrompt() {
  // Ustvari element če ne obstaja
  if (!document.getElementById("action-prompt-bar")) {
    const el = document.createElement("div");
    el.id = "action-prompt-bar";
    el.style.display = "none";
    el.className = "ap-bar";
    document.body.appendChild(el);
  }
}
