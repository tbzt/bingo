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
const lastNumbersEl = document.getElementById("lastNumbers");

const cells = {};

const overlayEl = document.getElementById("drawOverlay");
const drawBallEl = document.getElementById("drawBall");
const fullscreenBtn = document.getElementById("fullscreenBtn");

const ruleQuine = document.getElementById("rule-Quine");
const ruleDoubleQuine = document.getElementById("rule-doubleQuine");
const ruleBingo = document.getElementById("rule-bingo");

let previousCurrent = null;

// ----------------------
// GRID
// ----------------------

function buildGrid() {
  gridEl.innerHTML = "";

  for (let i = 1; i <= 90; i++) {
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

    cell.classList.toggle("active", set.has(num));
    cell.classList.toggle("latest", num === current);
  });
}

function renderRules(rules = {}) {
  const mapping = {
    quine: ruleQuine,
    doubleQuine: ruleDoubleQuine,
    bingo: ruleBingo,
  };

  Object.entries(mapping).forEach(([key, el]) => {
    if (!el) return;

    const active = rules[key];

    el.classList.toggle("completed", active);
  });

  // règle active

  if (!rules.quine) {
    ruleQuine.classList.add("current-rule");
    ruleDoubleQuine.classList.remove("current-rule");
    ruleBingo.classList.remove("current-rule");
  } else if (!rules.doubleQuine) {
    ruleQuine.classList.remove("current-rule");
    ruleDoubleQuine.classList.add("current-rule");
    ruleBingo.classList.remove("current-rule");
  } else {
    ruleQuine.classList.remove("current-rule");
    ruleDoubleQuine.classList.remove("current-rule");
    ruleBingo.classList.add("current-rule");
  }
}

// ----------------------
// FIREBASE
// ----------------------

onValue(stateRef, (snap) => {
  const state = snap.val();
  if (!state) return;

  const history = state.history || [];

  // animation nouveau tirage
  if (previousCurrent !== null && state.current !== previousCurrent) {
    animateDraw(state.current);
  }

  previousCurrent = state.current;

  // derniers numéros
  const last3 = history.slice(-3).reverse();

  lastNumbersEl.innerHTML = "";

  last3.forEach((n) => {
    const el = document.createElement("div");
    el.className = "last-chip";
    el.textContent = n;
    lastNumbersEl.appendChild(el);
  });

  render(history, state.current);
  renderRules(state.rules || {});
});

function animateDraw(number) {
  drawBallEl.textContent = number;

  overlayEl.classList.remove("hidden");
  overlayEl.classList.add("show");

  setTimeout(() => {
    overlayEl.classList.remove("show");

    setTimeout(() => {
      overlayEl.classList.add("hidden");
    }, 400);
  }, 1800);
}

fullscreenBtn.addEventListener("click", async () => {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen();
  } else {
    await document.exitFullscreen();
  }
});
