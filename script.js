// Utility helpers for concise DOM access and element creation.
const $ = (selector) => document.querySelector(selector);
const create = (tag, className) => {
  const el = document.createElement(tag);
  if (className) el.className = className;
  return el;
};

let currentCurrency = "USD";
let recalcBudget = null;
let recalcInvestment = null;

const getCurrencyLabel = () => currentCurrency;

// Format numbers as currency using the selected code for consistent display.
const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currentCurrency,
    currencyDisplay: "code",
    maximumFractionDigits: 2,
  }).format(isFinite(value) ? value : 0);

// Currency selector: update labels and recalculate summaries when changed.
function setupCurrencySelector() {
  const currencySelect = $("#currency");
  if (!currencySelect) return;

  const updateCurrency = () => {
    currentCurrency = currencySelect.value || "USD";
    document.querySelectorAll(".currency-symbol").forEach((span) => {
      span.textContent = getCurrencyLabel();
    });

    if (typeof recalcBudget === "function") recalcBudget();
    if (typeof recalcInvestment === "function") recalcInvestment();
  };

  currencySelect.addEventListener("change", updateCurrency);
  updateCurrency();
}

// Tabs: show one panel at a time based on the selected tab.
function setupTabs() {
  const buttons = document.querySelectorAll(".tab-button");
  const panels = document.querySelectorAll(".tab-panel");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      buttons.forEach((b) => b.classList.toggle("active", b === btn));
      panels.forEach((p) => p.classList.toggle("active", p.id === tab));
    });
  });
}

// Budget calculator: add bill rows, total expenses, and update the summary UI.
function setupBudgetCalculator() {
  const billsList = $("#bills-list");
  const addBillBtn = $("#add-bill");
  const calcBtn = $("#calculate-budget");

  // Start with a couple of sample rows to make the UI feel alive.
  addBillRow("Rent / Mortgage", 0);
  addBillRow("Groceries", 0);

  addBillBtn.addEventListener("click", () => addBillRow());
  calcBtn.addEventListener("click", calculateBudget);

  // Build a single bill row (name + amount + remove).
  function addBillRow(name = "", amount = "") {
    const row = create("div", "bill-row");

    const nameInput = create("input");
    nameInput.type = "text";
    nameInput.placeholder = "Bill name";
    nameInput.value = name;

    const amountWrap = create("div", "input-prefix");
    const span = create("span", "currency-symbol");
    span.textContent = getCurrencyLabel();
    const amountInput = create("input");
    amountInput.type = "number";
    amountInput.min = "0";
    amountInput.step = "0.01";
    amountInput.placeholder = "0.00";
    amountInput.value = amount;
    amountWrap.append(span, amountInput);

    // Remove the row from the list when clicked.
    const removeBtn = create("button", "bill-remove");
    removeBtn.type = "button";
    removeBtn.textContent = "x";
    removeBtn.addEventListener("click", () => {
      billsList.removeChild(row);
    });

    row.append(nameInput, amountWrap, removeBtn);
    billsList.appendChild(row);
  }

  // Sum income, bills, and target savings, then update the summary and chart.
  function calculateBudget() {
    const income = parseFloat($("#income").value) || 0;
    const targetSavings = parseFloat($("#target-savings").value) || 0;

    let totalBills = 0;
    billsList.querySelectorAll(".bill-row").forEach((row) => {
      const amountInput = row.querySelector('input[type="number"]');
      const val = parseFloat(amountInput.value) || 0;
      totalBills += val;
    });

    const leftoverAfterBills = income - totalBills;
    const leftoverAfterSavings = leftoverAfterBills - targetSavings;

    $("#summary-income").textContent = formatCurrency(income);
    $("#summary-bills").textContent = formatCurrency(totalBills);
    $("#summary-savings").textContent = formatCurrency(targetSavings);
    $("#summary-leftover").textContent = formatCurrency(leftoverAfterBills);
    $("#summary-discretionary").textContent = formatCurrency(leftoverAfterSavings);

    updateBudgetBar(income, totalBills, targetSavings, leftoverAfterBills);
  }

  recalcBudget = calculateBudget;

  // Update the allocation bar chart based on current values.
  function updateBudgetBar(income, bills, savings, leftover) {
    const barBills = $("#bar-bills");
    const barSavings = $("#bar-savings");
    const barLeftover = $("#bar-leftover");
    const label = $("#allocation-percentages");

    // Avoid divide-by-zero if income is empty or 0.
    if (income <= 0) {
      barBills.style.width = "0%";
      barSavings.style.width = "0%";
      barLeftover.style.width = "0%";
      label.textContent = "";
      return;
    }

    const safeLeftover = Math.max(leftover, 0);
    const totalForChart = Math.max(bills, 0) + Math.max(savings, 0) + safeLeftover || 1;

    const billsPct = (Math.max(bills, 0) / totalForChart) * 100;
    const savingsPct = (Math.max(savings, 0) / totalForChart) * 100;
    const leftoverPct = (safeLeftover / totalForChart) * 100;

    barBills.style.width = `${billsPct}%`;
    barSavings.style.width = `${savingsPct}%`;
    barLeftover.style.width = `${leftoverPct}%`;

    label.textContent = `${billsPct.toFixed(0)}% Bills | ${savingsPct.toFixed(
      0
    )}% Savings | ${leftoverPct.toFixed(0)}% Leftover`;
  }
}

// Investment calculator: simulate growth with contributions over time.
function setupInvestmentCalculator() {
  const calcBtn = $("#calculate-investment");
  calcBtn.addEventListener("click", calculateInvestment);

  // Run the projection based on user inputs.
  function calculateInvestment() {
    const initial = parseFloat($("#initial-amount").value) || 0;
    const monthly = parseFloat($("#monthly-contribution").value) || 0;
    const annualRate = (parseFloat($("#annual-rate").value) || 0) / 100;
    const years = parseFloat($("#years").value) || 0;
    const n = parseFloat($("#compounding-frequency").value) || 1;
    const contribFrequency = $("#contribution-frequency").value; // 'month' or 'year'
    const timing = document.querySelector(
      'input[name="contribution-timing"]:checked'
    )?.value || "end"; // 'begin' or 'end'

    const totalYears = Math.max(years, 0);
    const totalMonths = Math.round(totalYears * 12);
    const ratePerYear = Math.max(annualRate, 0);

    // Simulate month by month using a constant annual rate split into monthly steps.
    const monthlyRate = ratePerYear / 12;
    let balance = initial;
    let totalContributions = initial;

    for (let m = 1; m <= totalMonths; m++) {
      const isContributionMonth =
        contribFrequency === "month" ? true : m % 12 === 0; // yearly at month 12,24,...

      if (isContributionMonth && timing === "begin") {
        const add =
          contribFrequency === "month" ? monthly : monthly * 12; // treat input as "per month"
        balance += add;
        totalContributions += add;
      }

      // Apply interest for this month.
      if (monthlyRate > 0) {
        balance *= 1 + monthlyRate;
      }

      if (isContributionMonth && timing === "end") {
        const add =
          contribFrequency === "month" ? monthly : monthly * 12;
        balance += add;
        totalContributions += add;
      }
    }

    const finalBalance = balance;
    const growth = finalBalance - totalContributions;

    $("#inv-contributions").textContent = formatCurrency(totalContributions);
    $("#inv-final-balance").textContent = formatCurrency(finalBalance);
    $("#inv-growth").textContent = formatCurrency(growth);

    updateInvestmentBar(totalContributions, growth);
  }

  recalcInvestment = calculateInvestment;

  // Update the contributions vs growth bar.
  function updateInvestmentBar(contributions, growth) {
    const barContrib = $("#bar-contributions");
    const barGrowth = $("#bar-growth");

    const contribSafe = Math.max(contributions, 0);
    const growthSafe = Math.max(growth, 0);
    const total = contribSafe + growthSafe || 1;

    const contribPct = (contribSafe / total) * 100;
    const growthPct = (growthSafe / total) * 100;

    barContrib.style.width = `${contribPct}%`;
    barGrowth.style.width = `${growthPct}%`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  setupBudgetCalculator();
  setupInvestmentCalculator();
  setupCurrencySelector();
});


