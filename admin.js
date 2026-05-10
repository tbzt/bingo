const gridEl = document.getElementById("adminGrid");
const statusEl = document.getElementById("status");

const CONFIG = {
  owner: "tbzt",
  repo: "bingo",
  workflow: "update.yml",
  branch: "main",
  token: "ghp_xxxxxxxxxxxxxxxxx",
};

function setStatus(msg) {
  statusEl.textContent = msg;
}

// ------------------------
// GRID UI
// ------------------------

function buildGrid() {
  gridEl.innerHTML = "";

  for (let i = 1; i <= 99; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = i;

    cell.addEventListener("click", () => {
      triggerNumber(i);
    });

    gridEl.appendChild(cell);
  }
}

// ------------------------
// TRIGGER WORKFLOW
// ------------------------

async function triggerNumber(number) {
  try {
    setStatus(`Envoi du ${number}...`);

    const url = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/actions/workflows/${CONFIG.workflow}/dispatches`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CONFIG.token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ref: CONFIG.branch,
        inputs: {
          number: String(number),
        },
      }),
    });

    const text = await res.text();

    if (!res.ok) {
      console.error("GitHub error:", res.status, text);
      setStatus(`❌ Erreur (${res.status})`);
      return;
    }

    setStatus(`✔ ${number} envoyé`);
    console.log("Workflow triggered:", number);
  } catch (err) {
    console.error(err);
    setStatus("Erreur réseau / GitHub API");
  }
}

document.getElementById("resetBtn").addEventListener("click", resetGame);

async function resetGame() {
  try {
    setStatus("Reset en cours...");

    const url = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/actions/workflows/${CONFIG.workflow}/dispatches`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CONFIG.token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ref: CONFIG.branch,
        inputs: {
          number: "reset",
        },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }

    setStatus("✔ Reset envoyé");
  } catch (err) {
    console.error(err);
    setStatus("❌ Erreur reset");
  }
}

// ------------------------
// INIT
// ------------------------

buildGrid();
setStatus("Prêt");
