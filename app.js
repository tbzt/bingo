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

// ----------------------
// GRID INIT
// ----------------------

const gridEl = document.getElementById("grid");

function buildGrid() {
  gridEl.innerHTML = "";

  for (let i = 1; i <= 99; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = i;
    gridEl.appendChild(cell);
  }
}

buildGrid();

// ----------------------
// LIVE SYNC
// ----------------------

onValue(stateRef, (snap) => {
  const state = snap.val();
  if (!state) return;

  document.getElementById("number").textContent = state.current;

  const history = new Set(state.history || []);

  document.querySelectorAll(".cell").forEach((cell) => {
    const n = Number(cell.textContent);

    cell.classList.toggle("active", history.has(n));
    cell.classList.toggle("latest", n === state.current);
  });
});
