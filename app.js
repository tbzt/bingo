import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {
  getDatabase,
  ref,
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

const gridEl = document.getElementById("grid");
const numberEl = document.getElementById("number");
const lastNumbersEl = document.getElementById("lastNumbers");

const cells = {};

// ----------------------
// BUILD GRID
// ----------------------

function buildGrid() {
  gridEl.innerHTML = "";

  for (let i = 1; i <= 99; i++) {
    const cell = document.createElement("div");

    cell.className = "cell";
    cell.textContent = i;

    gridEl.appendChild(cell);

    cells[i] = cell;
  }
}

buildGrid();

// ----------------------
// UPDATE GRID
// ----------------------

function render(history = [], current = null) {
  const set = new Set(history);

  Object.entries(cells).forEach(([n, cell]) => {
    const num = Number(n);

    const active = set.has(num);

    cell.classList.toggle("active", active);

    cell.classList.toggle("latest", num === current);
  });
}

// ----------------------
// LIVE FIREBASE
// ----------------------

onValue(stateRef, (snap) => {
  const state = snap.val();
  if (!state) return;

  const history = state.history || [];

  // 3 derniers tirages
  const last3 = history.slice(-3).reverse();

  lastNumbersEl.innerHTML = "";

  last3.forEach((n) => {
    const el = document.createElement("div");
    el.className = "last-chip";
    el.textContent = n;
    lastNumbersEl.appendChild(el);
  });

  render(state.history || [], state.current);
});
