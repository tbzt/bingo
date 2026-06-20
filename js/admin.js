import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCJgW4LkBkMzdeJJA8LStFnE3AoMQ1E4S4",
  authDomain: "bingo-14eda.firebaseapp.com",
  databaseURL:
    "https://bingo-14eda-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "bingo-14eda",
  storageBucket: "bingo-14eda.firebasestorage.app",
  messagingSenderId: "942041596394",
  appId: "1:942041596394:web:261f18776fc28a88753293",
  measurementId: "G-14KXTD29EV",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const stateRef = ref(db, "bingo");

const gridEl = document.getElementById("adminGrid");
const statusEl = document.getElementById("status");

// ----------------------
// STATUS
// ----------------------

function setStatus(msg) {
  statusEl.textContent = msg;
}

// ----------------------
// SUPPRESSION EN ATTENTE
// ----------------------

let pendingRemove = null;
let pendingRemoveTimeout = null;

function cancelPendingRemove() {
  pendingRemove = null;
  clearTimeout(pendingRemoveTimeout);
  document
    .querySelectorAll(".cell.pending-remove")
    .forEach((c) => c.classList.remove("pending-remove"));
}

async function removeNumber(n, cell) {
  if (pendingRemove === n) {
    // 2e clic : confirmation — on supprime
    clearTimeout(pendingRemoveTimeout);
    pendingRemove = null;

    setStatus(`Suppression de ${n}...`);

    const snap = await get(stateRef);
    const state = snap.exists() ? snap.val() : { current: 0, history: [] };

    state.history = (state.history || []).filter((x) => x !== n);

    // Si c'était le numéro courant, on revient au dernier de l'historique
    if (state.current === n) {
      state.current =
        state.history.length > 0 ? state.history[state.history.length - 1] : 0;
    }

    await set(stateRef, state);
    setStatus(`✔ ${n} supprimé`);
  } else {
    // 1er clic : on arme la suppression
    cancelPendingRemove();
    pendingRemove = n;
    cell.classList.add("pending-remove");
    setStatus(`⚠ Reclique sur ${n} pour annuler ce tirage`);

    // Auto-annulation après 3s
    pendingRemoveTimeout = setTimeout(() => {
      cancelPendingRemove();
      setStatus("Prêt");
    }, 3000);
  }
}

// ----------------------
// RENDER GRILLE
// ----------------------

function render(state) {
  gridEl.innerHTML = "";

  const used = new Set(state.history || []);

  for (let i = 1; i <= 90; i++) {
    const cell = document.createElement("div");

    cell.className = "cell";
    cell.textContent = i;

    if (used.has(i)) {
      cell.classList.add("used");
      cell.style.cursor = "pointer";

      // Clic sur tiré = propose de l'annuler
      cell.addEventListener("click", () => removeNumber(i, cell));
    } else {
      cell.addEventListener("click", () => {
        cancelPendingRemove();
        sendNumber(i);
      });
    }

    if (i === state.current) {
      cell.classList.add("latest");
    }

    // Mise en évidence si ce numéro est en attente de suppression
    if (i === pendingRemove) {
      cell.classList.add("pending-remove");
    }

    gridEl.appendChild(cell);
  }
}

// ----------------------
// RENDER PROGRESSION
// ----------------------

function renderProgress(step) {
  const order = ["waiting", "quine", "doubleQuine", "bingo"];
  const lines = document.querySelectorAll(".progress .line");

  order.forEach((s, index) => {
    const el = document.getElementById(`step-${s}`);
    if (!el) return;

    el.classList.remove("active", "done");

    const currentIndex = order.indexOf(step);

    if (index < currentIndex) el.classList.add("done");
    if (index === currentIndex) el.classList.add("active");

    if (lines[index]) {
      lines[index].classList.toggle("filled", index < currentIndex);
    }
  });
}

// ----------------------
// SEND NUMBER
// ----------------------

async function sendNumber(n) {
  setStatus(`Envoi ${n}...`);

  const snap = await get(stateRef);
  const state = snap.exists() ? snap.val() : { current: 0, history: [] };

  state.history = state.history || [];
  state.current = n;

  if (!state.history.includes(n)) {
    state.history.push(n);
  }

  await set(stateRef, state);
  setStatus(`✔ ${n} envoyé`);
}

// ----------------------
// RESET
// ----------------------

let resetArmed = false;

async function resetGame() {
  if (!resetArmed) {
    resetArmed = true;
    setStatus("⚠ Reclique pour confirmer le reset");

    setTimeout(() => {
      resetArmed = false;
      setStatus("Prêt");
    }, 3000);

    return;
  }

  await set(stateRef, {
    current: 0,
    history: [],
    rules: { step: "waiting" },
  });

  resetArmed = false;
  setStatus("✔ Partie réinitialisée !");
}

// ----------------------
// TOGGLE RULE
// ----------------------

async function toggleRule(ruleName) {
  const snap = await get(stateRef);
  const state = snap.exists()
    ? snap.val()
    : { current: 0, history: [], rules: {} };

  state.rules = state.rules || {};
  state.rules[ruleName] = !state.rules[ruleName];

  await set(stateRef, state);
  setStatus(`✔ Règle mise à jour : ${ruleName}`);
}

window.toggleRule = toggleRule;

// ----------------------
// SET STEP
// ----------------------

async function setStep(step) {
  const snap = await get(stateRef);
  const state = snap.val() || {};

  state.rules = { step };

  await set(stateRef, state);
  setStatus(`✔ Étape : ${step}`);
}

window.setStep = setStep;

// ----------------------
// RENDER RULES ADMIN
// ----------------------

function renderRulesAdmin(rules = {}) {
  const current = rules.current;
  const completed = rules.completed || [];

  document.querySelectorAll(".rule-admin").forEach((el) => {
    const rule = el.dataset.rule;
    el.classList.remove("active", "completed");

    if (rule === current) el.classList.add("active");
    if (completed.includes(rule)) el.classList.add("completed");
  });
}

// ----------------------
// LIVE SYNC
// ----------------------

onValue(stateRef, (snap) => {
  const state = snap.val();
  if (!state) return;

  render(state);
  renderRulesAdmin(state.rules || {});
  renderProgress(state.rules?.step || "quine");
});

// ----------------------
// INIT
// ----------------------

document.getElementById("resetBtn").addEventListener("click", resetGame);
setStatus("Prêt");
