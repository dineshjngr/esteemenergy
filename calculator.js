/**
 * Solar Savings Calculator Logic
 * Esteem Energy Landing Page Integration
 */

(() => {
  // --- CONFIGURABLE CONSTANTS ---
  const ASSUMED_ELECTRICITY_RATE = 0.32; // $0.32 per kWh
  const SYSTEM_EFFICIENCY = 0.82;        // 82% system efficiency
  const PANEL_WATTAGE = 440;             // 440W per panel
  const SELF_CONSUMPTION_RATE = 0.65;    // 65% of generated energy is self-consumed
  const FEED_IN_TARIFF = 0.07;           // $0.07 per kWh export rate

  // Daily solar yield (hours of peak sun per day) per state/territory
  const STATE_SOLAR_YIELD = {
    NSW: 4.2,
    VIC: 3.8,
    QLD: 4.8,
    WA: 5.0,
    SA: 4.5,
    TAS: 3.5,
    ACT: 4.1,
    NT: 5.2
  };

  // Approximate cost of system sizes (configured as systemSize => cost in AUD)
  const SYSTEM_COSTS = {
    3.3: 4500,
    5.0: 5500,
    6.6: 6500,
    8.0: 8000,
    10.0: 10000,
    13.2: 13000
  };

  // Standard available residential solar system capacities in kW
  const AVAILABLE_SYSTEM_SIZES = [3.3, 5.0, 6.6, 8.0, 10.0, 13.2];

  // --- DOM REFERENCES ---
  let locationSelect;
  let billSlider;
  let billNumberInput;
  let billLabel;
  let billDisplay;
  let resSystemSize;
  let resPanelCount;
  let resSavings;
  let resPayback;
  let periodRadios;

  const initCalculator = () => {
    locationSelect = document.getElementById("calc-location");
    billSlider = document.getElementById("calc-bill-slider");
    billNumberInput = document.getElementById("calc-bill-number");
    billLabel = document.getElementById("calc-bill-label");
    billDisplay = document.getElementById("calc-bill-display");
    resSystemSize = document.getElementById("calc-res-system");
    resPanelCount = document.getElementById("calc-res-panels");
    resSavings = document.getElementById("calc-res-savings");
    resPayback = document.getElementById("calc-res-payback");
    periodRadios = document.querySelectorAll('input[name="bill-period"]');

    if (!locationSelect || !billSlider || !billNumberInput) return;

    // Synchronize inputs on change
    billSlider.addEventListener("input", handleSliderInput);
    billNumberInput.addEventListener("input", handleNumberInput);
    locationSelect.addEventListener("change", calculateSavings);

    periodRadios.forEach((radio) => {
      radio.addEventListener("change", handlePeriodChange);
    });

    // Run initial calculation
    calculateSavings();
  };

  const handleSliderInput = (e) => {
    const value = parseFloat(e.target.value) || 0;
    billNumberInput.value = value;
    updateBillDisplay(value);
    calculateSavings();
  };

  const handleNumberInput = (e) => {
    let value = parseFloat(e.target.value);
    if (isNaN(value) || value < 0) return; // Prevent invalid entries

    // Constrain to slider min/max bounds
    const min = parseFloat(billSlider.min);
    const max = parseFloat(billSlider.max);
    
    // We update the slider position
    billSlider.value = Math.min(Math.max(value, min), max);
    updateBillDisplay(value);
    calculateSavings();
  };

  const handlePeriodChange = (e) => {
    const period = e.target.value;
    const isMonthly = period === "monthly";

    // Update range bounds and labels based on period
    if (isMonthly) {
      billLabel.textContent = "Monthly Electricity Bill";
      billSlider.min = "50";
      billSlider.max = "1000";
      billSlider.step = "10";
      
      // Scale current value (e.g. quarterly $500 -> monthly $160)
      const currentVal = parseFloat(billNumberInput.value) || 500;
      const newVal = Math.round((currentVal / 3) / 10) * 10;
      billSlider.value = Math.min(Math.max(newVal, 50), 1000);
    } else {
      billLabel.textContent = "Quarterly Electricity Bill";
      billSlider.min = "100";
      billSlider.max = "2500";
      billSlider.step = "25";
      
      // Scale current value (e.g. monthly $160 -> quarterly $480 -> rounded to nearest 25 = $500)
      const currentVal = parseFloat(billNumberInput.value) || 160;
      const newVal = Math.round((currentVal * 3) / 25) * 25;
      billSlider.value = Math.min(Math.max(newVal, 100), 2500);
    }

    billNumberInput.min = billSlider.min;
    billNumberInput.max = billSlider.max;
    billNumberInput.step = billSlider.step;
    billNumberInput.value = billSlider.value;

    updateBillDisplay(billSlider.value);
    calculateSavings();
  };

  const updateBillDisplay = (val) => {
    billDisplay.textContent = new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      maximumFractionDigits: 0
    }).format(val);
  };

  // --- CALCULATION LOGIC ---
  const calculateSavings = () => {
    const state = locationSelect.value;
    const billAmount = parseFloat(billNumberInput.value) || 0;
    
    // Get selected period (monthly vs quarterly)
    const selectedPeriodEl = document.querySelector('input[name="bill-period"]:checked');
    const period = selectedPeriodEl ? selectedPeriodEl.value : "quarterly";

    // 1. Convert entered bill into annual bill
    const billMultiplier = period === "monthly" ? 12 : 4;
    const annualBill = billAmount * billMultiplier;

    // 2. Estimate annual electricity consumption (kWh)
    const estimatedAnnualConsumption = annualBill / ASSUMED_ELECTRICITY_RATE;

    // 3. Estimate system size based on electricity usage and state solar yield
    const stateYield = STATE_SOLAR_YIELD[state] || 4.2;
    const rawSystemSize = estimatedAnnualConsumption / (stateYield * 365 * SYSTEM_EFFICIENCY);

    // Find nearest standard residential system size
    const systemSize = AVAILABLE_SYSTEM_SIZES.reduce((prev, curr) => {
      return Math.abs(curr - rawSystemSize) < Math.abs(prev - rawSystemSize) ? curr : prev;
    });

    // 4. Panel count
    const panelCount = Math.ceil((systemSize * 1000) / PANEL_WATTAGE);

    // 5. Estimated annual savings
    const annualGeneration = systemSize * stateYield * 365 * SYSTEM_EFFICIENCY;
    
    // Self-consumed solar energy vs exported energy
    const selfConsumedEnergy = Math.min(annualGeneration * SELF_CONSUMPTION_RATE, estimatedAnnualConsumption);
    const exportedEnergy = Math.max(0, annualGeneration - selfConsumedEnergy);

    // Calculate dollar savings
    const selfConsumptionSavings = selfConsumedEnergy * ASSUMED_ELECTRICITY_RATE;
    const feedInSavings = exportedEnergy * FEED_IN_TARIFF;
    let estimatedAnnualSavings = selfConsumptionSavings + feedInSavings;

    // Ensure savings do not exceed the user's estimated annual electricity bill
    estimatedAnnualSavings = Math.min(estimatedAnnualSavings, annualBill);

    // 6. Payback estimate
    const estimatedSystemCost = SYSTEM_COSTS[systemSize] || 6500;
    const paybackYears = estimatedAnnualSavings > 0 ? (estimatedSystemCost / estimatedAnnualSavings) : 0;

    // --- DOM UPDATES ---
    resSystemSize.textContent = `${systemSize.toFixed(1).replace(".0", "")} kW`;
    resPanelCount.textContent = `Approx. ${panelCount} Panels`;
    
    resSavings.textContent = new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      maximumFractionDigits: 0
    }).format(estimatedAnnualSavings);

    resPayback.textContent = paybackYears > 0 ? `${paybackYears.toFixed(1)} Years` : "0 Years";
  };

  // Wait for DOM content to load before initializing
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCalculator, { once: true });
  } else {
    initCalculator();
  }
})();
