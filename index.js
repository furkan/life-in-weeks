const years = 90;
let periods = [];

function createWeekNumbers() {
  const weekNumbersContainer = document.getElementById("week-numbers");
  for (let i = 4; i <= 52; i += 4) {
    const weekNumber = document.createElement("div");
    weekNumber.className = "week-number";
    weekNumber.textContent = i;
    weekNumbersContainer.appendChild(weekNumber);
  }
}

function createRowLabels() {
  const rowLabels = document.getElementById("row-labels");
  rowLabels.innerHTML = "";
  for (let i = 0; i < years; i++) {
    let label = document.createElement("div");
    if (i % 5 === 0) {
      label.textContent = i;
    } else {
      label.textContent = "\n";
    }
    rowLabels.appendChild(label);
  }
}

function generateGrid(birthday) {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  // Create grid boxes (weeks)
  const totalWeeks = years * 52;
  const today = new Date();
  const birthDate = new Date(birthday);
  const weeksSinceBirth = Math.floor(
    (today - birthDate) / (1000 * 60 * 60 * 24 * 7),
  );

  const sortedPeriods = [...periods].sort(
    (a, b) => new Date(a.endDate) - new Date(b.endDate),
  );

  for (let i = 0; i < totalWeeks; i++) {
    let box = document.createElement("div");
    box.className = "box";

    // Calculate the date for this week
    const weekDate = new Date(birthDate);
    weekDate.setDate(weekDate.getDate() + i * 7);

    // Format the date
    const formattedDate = weekDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    // Add tooltip content
    box.title = `Week ${i + 1}\n${formattedDate}`;

    // Find the applicable period for this week
    const colors = ["#4A004A", "#003500", "#000047", "#4A2400", "#250047"];
    let periodColor = null;
    let periodName = null;

    for (let j = 0; j < sortedPeriods.length; j++) {
      const endDate = new Date(sortedPeriods[j].endDate);
      if (weekDate <= endDate) {
        periodColor = colors[j % colors.length];
        periodName = sortedPeriods[j].name;
        break; // Use the first (earliest) period that applies
      }
    }

    colorable = Boolean(periodColor); // && i < weeksSinceBirth

    // Color boxes based on priority
    if (i === weeksSinceBirth) {
      box.style.backgroundColor = "#4682B4";
      box.title = "YOU ARE HERE";
    } else if (colorable) {
      box.style.backgroundColor = periodColor;
      box.title = `${periodName}`;
    } else if (i < weeksSinceBirth) {
      box.style.backgroundColor = "#8B0000";
    } else {
      box.style.backgroundColor = "#444";
    }

    grid.appendChild(box);
  }

  // Update localStorage with the new year value and birthday
  localStorage.setItem("lifeInWeeksBirthday", birthday);
}

function updateGrid() {
  const birthday = document.getElementById("birthday").value;
  generateGrid(birthday);
}

function updatePeriodsList() {
  const list = document.querySelector(".period-list");
  list.innerHTML = "";

  periods.forEach((period) => {
    const item = document.createElement("div");
    item.className = "period-item";
    item.innerHTML = `
            <button onclick="removePeriod(${period.id})">×</button>
            <span>${period.name} (until ${period.endDate})</span>
        `;
    list.appendChild(item);
  });
}

function addPeriod() {
  const nameInput = document.getElementById("period-name");
  const dateInput = document.getElementById("period-end");

  if (!nameInput.value || !dateInput.value) return;

  const newEndDate = new Date(dateInput.value);

  for (const period of periods) {
    const existingEndDate = new Date(period.endDate);
    const diffTime = Math.abs(existingEndDate - newEndDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 7) {
      alert("Period end dates must be at least one week apart from each other");
      return;
    }
  }

  const period = {
    name: nameInput.value,
    endDate: dateInput.value,
    id: Date.now(), // unique identifier
  };

  periods.push(period);
  localStorage.setItem("lifeInWeeksPeriods", JSON.stringify(periods));

  // Clear inputs
  nameInput.value = "";
  dateInput.value = "";

  updatePeriodsList();
  updateGrid();
}

function removePeriod(id) {
  periods = periods.filter((p) => p.id !== id);
  localStorage.setItem("lifeInWeeksPeriods", JSON.stringify(periods));
  updatePeriodsList();
  updateGrid();
}

function toggleControls() {
  const controls = document.querySelector(".controls");
  const container = document.querySelector(".container");
  const controlsToggler = document.querySelector("#controls-toggler");

  if (controlsToggler.textContent === "x") {
    controlsToggler.textContent = "≡";
  } else {
    controlsToggler.textContent = "x";
  }
  container.classList.toggle("hidden-content");
  controls.classList.toggle("hidden-content");
}

function updateBirthday() {
  updateGrid();
  toggleControls();
}

window.onload = function () {
  const savedBirthday = localStorage.getItem("lifeInWeeksBirthday");
  const savedPeriods = localStorage.getItem("lifeInWeeksPeriods");

  if (savedPeriods) {
    periods = JSON.parse(savedPeriods);
    updatePeriodsList();
  }

  if (savedBirthday) {
    document.getElementById("birthday").value = savedBirthday;
    generateGrid(savedBirthday);
  } else {
    const defaultBirthday = "2000-01-01";
    document.getElementById("birthday").value = defaultBirthday;
    generateGrid(new Date(defaultBirthday));
  }

  createWeekNumbers();
  createRowLabels();
};
