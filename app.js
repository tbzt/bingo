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

// ----------------------
// RENDER
// ----------------------

function render(history = [], current = null) {
  gridEl.innerHTML = "";

  history.forEach((n) => {
    const cell = document.createElement("div");

    cell.className = "cell";

    if (n === current) {
      cell.classList.add("latest");
    }

    cell.textContent = n;

    gridEl.appendChild(cell);
  });
}

// ----------------------
// LIVE FIREBASE
// ----------------------

onValue(stateRef, (snap) => {
  const state = snap.val();

  if (!state) return;

  numberEl.textContent = state.current || 0;

  render(state.history || [], state.current);
});
