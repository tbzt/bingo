const numberEl = document.getElementById("number");
const gridEl = document.getElementById("grid");

let lastNumber = null;

function buildGrid(history, current) {
  gridEl.innerHTML = "";

  for (let i = 1; i <= 99; i++) {
    const cell = document.createElement("div");

    cell.className = "cell";

    cell.textContent = i;

    if (history.includes(i)) {
      cell.classList.add("active");
    }

    if (i === current) {
      cell.classList.add("latest");
    }

    gridEl.appendChild(cell);
  }
}

function animateNumber(number) {
  numberEl.textContent = number;

  numberEl.classList.remove("animate");

  void numberEl.offsetWidth;

  numberEl.classList.add("animate");
}

async function loadState() {
  try {
    const response = await fetch(`./state.json?t=${Date.now()}`);

    const data = await response.json();

    if (data.current !== lastNumber) {
      animateNumber(data.current);

      lastNumber = data.current;
    }

    buildGrid(data.history || [], data.current);
  } catch (err) {
    console.error(err);
  }
}

loadState();

setInterval(loadState, 2000);
