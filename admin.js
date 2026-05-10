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
// RENDER
// ----------------------

function render(state) {
  gridEl.innerHTML = "";

  const used = new Set(state.history || []);

  for (let i = 1; i <= 99; i++) {
    const cell = document.createElement("div");

    cell.className = "cell";
    cell.textContent = i;

    // numéro déjà tiré
    if (used.has(i)) {
      cell.classList.add("used");

      cell.style.pointerEvents = "none";
    } else {
      cell.addEventListener("click", () => {
        sendNumber(i);
      });
    }

    // dernier numéro
    if (i === state.current) {
      cell.classList.add("latest");
    }

    gridEl.appendChild(cell);
  }
}

// ----------------------
// SEND NUMBER
// ----------------------

async function sendNumber(n) {
  setStatus(`Envoi ${n}...`);

  const snap = await get(stateRef);

  const state = snap.exists() ? snap.val() : { current: 0, history: [] };

  // sécurité si history absent
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

    setStatus("⚠ Reclique pour confirmer");

    setTimeout(() => {
      resetArmed = false;
      setStatus("Prêt");
    }, 3000);

    return;
  }

  await set(stateRef, {
    current: 0,
    history: [],
  });

  resetArmed = false;

  setStatus("✔ On démarque !");
}

// ----------------------
// LIVE SYNC
// ----------------------

onValue(stateRef, (snap) => {
  const state = snap.val();

  if (!state) return;

  render(state);
});

// ----------------------
// INIT
// ----------------------

document.getElementById("resetBtn").addEventListener("click", resetGame);

setStatus("Prêt");
