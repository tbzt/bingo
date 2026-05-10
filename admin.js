// =====================
// CONFIG (à remplir une fois)
// =====================

const CONFIG = {
  token: "ghp_xxxxxxxxxxxxxxxxxxxxx",
  owner: "tonUserGithub",
  repo: "tonRepo",
};

// =====================

const gridEl = document.getElementById("adminGrid");
const statusEl = document.getElementById("status");

let currentState = {
  current: 0,
  history: [],
};

let currentSha = null;

function setStatus(text) {
  statusEl.textContent = text;
}

// =====================
// GRID UI
// =====================

function buildGrid() {
  gridEl.innerHTML = "";

  for (let i = 1; i <= 99; i++) {
    const cell = document.createElement("div");

    cell.className = "cell";
    cell.textContent = i;
    cell.dataset.number = i;

    cell.addEventListener("click", () => {
      if (currentState.history.includes(i)) return;
      updateState(i);
    });

    gridEl.appendChild(cell);
  }
}

function refreshGrid() {
  document.querySelectorAll(".cell").forEach((cell) => {
    const num = parseInt(cell.dataset.number);

    cell.classList.remove("active", "latest");

    if (currentState.history.includes(num)) {
      cell.classList.add("active");
    }

    if (num === currentState.current) {
      cell.classList.add("latest");
    }
  });
}

// =====================
// GITHUB STATE LOAD
// =====================

async function loadState() {
  try {
    setStatus("Chargement...");

    const res = await fetch(
      `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/state.json`,
      {
        headers: {
          Authorization: `Bearer ${CONFIG.token}`,
          Accept: "application/vnd.github+json",
        },
      },
    );

    if (!res.ok) throw new Error("Erreur lecture state.json");

    const file = await res.json();

    currentSha = file.sha;

    currentState = JSON.parse(atob(file.content));

    refreshGrid();

    setStatus("OK");
  } catch (e) {
    console.error(e);
    setStatus(e.message);
  }
}

// =====================
// UPDATE STATE (push GitHub)
// =====================

async function updateState(number) {
  try {
    setStatus(`Envoi ${number}...`);

    currentState.current = number;
    currentState.history.push(number);

    const encoded = btoa(JSON.stringify(currentState, null, 2));

    const res = await fetch(
      `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/state.json`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${CONFIG.token}`,
          Accept: "application/vnd.github+json",
        },
        body: JSON.stringify({
          message: `Bingo ${number}`,
          content: encoded,
          sha: currentSha,
        }),
      },
    );

    if (!res.ok) throw new Error("Erreur GitHub update");

    const data = await res.json();

    currentSha = data.content.sha;

    refreshGrid();

    setStatus(`✔ ${number} envoyé`);
  } catch (e) {
    console.error(e);
    setStatus(e.message);
  }
}

// =====================
// INIT
// =====================

buildGrid();
loadState();
