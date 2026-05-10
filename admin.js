import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
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

let state = { current: 0, history: [] };

// ----------------------
// STATUS
// ----------------------

function setStatus(msg) {
  statusEl.textContent = msg;
}

// ----------------------
// GRID
// ----------------------

const cells = {};

function buildGrid() {
  gridEl.innerHTML = "";

  for (let i = 1; i <= 99; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = i;

    cell.addEventListener("click", () => {
      if (cell.classList.contains("used")) return;
      sendNumber(i);
    });

    gridEl.appendChild(cell);
    cells[i] = cell;
  }
}

// ----------------------
// UPDATE UI STATE
// ----------------------

function render(state) {
  const history = new Set(state.history || []);

  Object.entries(cells).forEach(([n, cell]) => {
    const num = Number(n);

    const used = history.has(num);

    cell.classList.toggle("used", used);
    cell.classList.toggle("latest", num === state.current);
  });
}

// ----------------------
// SEND NUMBER
// ----------------------

async function sendNumber(n) {
  setStatus(`Envoi ${n}...`);

  const snap = await get(stateRef);
  const data = snap.exists() ? snap.val() : { current: 0, history: [] };

  data.current = n;

  if (!data.history.includes(n)) {
    data.history.push(n);
  }

  await set(stateRef, data);

  setStatus(`✔ ${n} envoyé`);
}

// ----------------------
// RESET (DOUBLE CLICK SAFE)
// ----------------------

let resetArmed = false;
let resetTimeout = null;

async function resetGame() {
  if (!resetArmed) {
    resetArmed = true;
    setStatus("⚠ Re-clique pour confirmer reset");

    resetTimeout = setTimeout(() => {
      resetArmed = false;
      setStatus("Prêt");
    }, 3000);

    return;
  }

  clearTimeout(resetTimeout);

  await set(stateRef, {
    current: 0,
    history: [],
  });

  setStatus("✔ reset effectué");
  resetArmed = false;
}

// ----------------------
// LIVE SYNC (si modifié ailleurs)
// ----------------------

onValue(stateRef, (snap) => {
  const newState = snap.val();
  if (!newState) return;

  state = newState;
  render(state);
});

// ----------------------
// INIT
// ----------------------

document.getElementById("resetBtn").addEventListener("click", resetGame);

buildGrid();
setStatus("Prêt");
