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
const waitingScreenEl = document.getElementById("waitingScreen");

const cells = {};

const overlayEl = document.getElementById("drawOverlay");
const drawBallEl = document.getElementById("drawBall");
const fullscreenBtn = document.getElementById("fullscreenBtn");

const ruleQuine = document.getElementById("rule-quine");
const ruleDoubleQuine = document.getElementById("rule-doublequine");
const ruleBingo = document.getElementById("rule-bingo");

let previousCurrent = null;
let previousStep = null;

// ----------------------
// GRID
// ----------------------

function buildGrid() {
  gridEl.innerHTML = "";

  for (let i = 1; i <= 90; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = i;
    cell.style.setProperty(
      "--shimmer-delay",
      `${(Math.random() * 2).toFixed(2)}s`,
    );
    gridEl.appendChild(cell);
    cells[i] = cell;
  }
}

buildGrid();

// ----------------------
// ÉCRAN D'ATTENTE
// ----------------------

function renderWaiting(isWaiting) {
  if (isWaiting) {
    waitingScreenEl.classList.remove("hidden");
    waitingScreenEl.classList.add("visible");
  } else {
    waitingScreenEl.classList.remove("visible");
    waitingScreenEl.classList.add("hidden");
  }
}

// ----------------------
// UPDATE GRID
// ----------------------

function render(history = [], current = null) {
  const activeSet = new Set(history);

  Object.entries(cells).forEach(([n, cell]) => {
    const num = Number(n);
    const wasActive = cell.classList.contains("active");
    const isActive = activeSet.has(num);

    if (isActive && !wasActive) {
      cell.classList.add("active");
      cell.classList.remove("popping");
      void cell.offsetWidth;
      cell.classList.add("popping");
      cell.addEventListener(
        "animationend",
        () => {
          cell.classList.remove("popping");
        },
        { once: true },
      );
    } else if (!isActive) {
      cell.classList.remove("active", "popping");
    }

    cell.classList.toggle("latest", num === current);
  });
}

function renderRules(rules = {}) {
  const step = rules.step || "waiting";
  const order = ["quine", "doubleQuine", "bingo"];

  const elements = {
    quine: ruleQuine,
    doubleQuine: ruleDoubleQuine,
    bingo: ruleBingo,
  };

  order.forEach((rule, index) => {
    const el = elements[rule];
    if (!el) return;

    el.classList.remove("current-rule", "completed");

    const stepIndex = order.indexOf(step);

    if (index < stepIndex) el.classList.add("completed");
    if (rule === step) el.classList.add("current-rule");
  });
}

// ----------------------
// FIREBASE
// ----------------------

onValue(stateRef, (snap) => {
  const state = snap.val();
  if (!state) return;

  const history = state.history || [];
  const step = state.rules?.step || "waiting";
  const isWaiting = step === "waiting";

  // Écran d'attente
  renderWaiting(isWaiting);

  // Animation nouveau tirage (seulement hors attente)
  if (
    !isWaiting &&
    previousCurrent !== null &&
    state.current !== previousCurrent
  ) {
    animateDraw(state.current);
  }

  previousCurrent = state.current;
  previousStep = step;

  // Derniers numéros
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

// ----------------------
// ANIMATION BOULE
// ----------------------

function animateDraw(number) {
  const isStart = number === 0;

  drawBallEl.textContent = isStart ? "🎱 Début" : number;
  drawBallEl.classList.toggle("start-mode", isStart);

  drawBallEl.classList.remove("dropping", "exiting");
  overlayEl.classList.remove("hidden");

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlayEl.classList.add("show");
      drawBallEl.classList.add("dropping");
    });
  });

  const duration = isStart ? 2200 : 1400;

  setTimeout(() => {
    drawBallEl.classList.remove("dropping");
    drawBallEl.classList.add("exiting");

    setTimeout(() => {
      overlayEl.classList.remove("show");
      overlayEl.classList.add("hidden");
      drawBallEl.classList.remove("exiting", "start-mode");
    }, 400);
  }, duration);
}

// ----------------------
// FULLSCREEN
// ----------------------

fullscreenBtn.addEventListener("click", async () => {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen();
  } else {
    await document.exitFullscreen();
  }
});
