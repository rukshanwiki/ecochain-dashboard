import React, { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Dropdown, Alert, Card, Form, Button, InputGroup } from "react-bootstrap";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import CultivationMap from "./DistrictDataTable";
import PriceTrendsChart from "./PriceTrendsChart";
import "../CSS/Dashboard.css";
import "../CSS/CalendarPage.css"; 
import { useNavigate } from "react-router-dom";

// Coordinates for demo locations
const locationCoordinates = {
  "Nuwara Eliya": { lat: 6.9497, lng: 80.7891 },
  "Bandarawela": { lat: 6.8301, lng: 80.9991 },
  "Kandy": { lat: 7.2906, lng: 80.6337 },
  "Dambulla": { lat: 7.8731, lng: 80.7718 },
  "Jaffna": { lat: 9.6615, lng: 80.0255 },
  "Colombo": { lat: 6.9271, lng: 79.8612 }
};

// Region-specific suitable crops for alternative suggestions
const regionSuitableCrops = {
  "Nuwara Eliya": ["Carrot", "Cabbage", "Leeks", "Potato", "Beetroot", "Tomato"],
  "Bandarawela": ["Beans", "Tomato", "Carrot", "Cabbage", "Potato"],
  "Kandy": ["Tomato", "Beans", "Radish", "Spinach", "Cabbage"],
  "Dambulla": ["Onion", "Pumpkin", "Tomato", "Okra", "Beans"],
  "Jaffna": ["Onion", "Tomato", "Spinach", "Okra"],
  "Colombo": ["Spinach", "Radish", "Okra", "Cucumber"]
};

// Data Structure with default durations and Historical Monthly Prices (Rs/kg)
const productData = {
  Tomato:   { rate: 250, defaultDuration: 75, historicalPrices: { Jan: 300, Feb: 280, Mar: 250, Apr: 400, May: 450, Jun: 380, Jul: 320, Aug: 250, Sep: 200, Oct: 280, Nov: 350, Dec: 400 } },
  Carrot:   { rate: 180, defaultDuration: 45, historicalPrices: { Jan: 450, Feb: 420, Mar: 380, Apr: 300, May: 250, Jun: 300, Jul: 350, Aug: 400, Sep: 420, Oct: 450, Nov: 480, Dec: 500 } },
  Cabbage:  { rate: 200, defaultDuration: 80, historicalPrices: { Jan: 250, Feb: 240, Mar: 220, Apr: 200, May: 180, Jun: 220, Jul: 260, Aug: 280, Sep: 300, Oct: 320, Nov: 280, Dec: 260 } },
  Onion:    { rate: 150, defaultDuration: 120, historicalPrices: { Jan: 350, Feb: 300, Mar: 280, Apr: 250, May: 250, Jun: 280, Jul: 320, Aug: 350, Sep: 400, Oct: 450, Nov: 420, Dec: 380 } },
  Pumpkin:  { rate: 120, defaultDuration: 100, historicalPrices: { Jan: 150, Feb: 140, Mar: 120, Apr: 100, May: 110, Jun: 130, Jul: 160, Aug: 180, Sep: 200, Oct: 220, Nov: 190, Dec: 160 } },
  Beans:    { rate: 210, defaultDuration: 50, historicalPrices: { Jan: 400, Feb: 350, Mar: 300, Apr: 450, May: 500, Jun: 420, Jul: 380, Aug: 350, Sep: 320, Oct: 380, Nov: 450, Dec: 480 } },
  Okra:     { rate: 190, defaultDuration: 60, historicalPrices: { Jan: 200, Feb: 180, Mar: 160, Apr: 220, May: 250, Jun: 210, Jul: 190, Aug: 170, Sep: 150, Oct: 180, Nov: 220, Dec: 240 } },
  Spinach:  { rate: 300, defaultDuration: 30, historicalPrices: { Jan: 120, Feb: 100, Mar: 90, Apr: 150, May: 180, Jun: 140, Jul: 110, Aug: 100, Sep: 90, Oct: 120, Nov: 150, Dec: 140 } },
  Potato:   { rate: 170, defaultDuration: 90, historicalPrices: { Jan: 280, Feb: 260, Mar: 250, Apr: 240, May: 250, Jun: 280, Jul: 300, Aug: 320, Sep: 350, Oct: 380, Nov: 340, Dec: 300 } },
  Leeks:    { rate: 190, defaultDuration: 100, historicalPrices: { Jan: 320, Feb: 300, Mar: 280, Apr: 250, May: 240, Jun: 260, Jul: 280, Aug: 320, Sep: 350, Oct: 380, Nov: 360, Dec: 340 } },
  Radish:   { rate: 220, defaultDuration: 40, historicalPrices: { Jan: 180, Feb: 160, Mar: 150, Apr: 140, May: 150, Jun: 170, Jul: 190, Aug: 210, Sep: 230, Oct: 250, Nov: 220, Dec: 200 } },
  Beetroot: { rate: 200, defaultDuration: 65, historicalPrices: { Jan: 350, Feb: 320, Mar: 300, Apr: 280, May: 260, Jun: 290, Jul: 320, Aug: 360, Sep: 380, Oct: 400, Nov: 380, Dec: 360 } },
};

// --- SRI LANKA GEOGRAPHIC DATA (Province & Districts) ---
const locationData = {
  "Central": ["Kandy", "Matale", "Nuwara Eliya"],
  "Eastern": ["Ampara", "Batticaloa", "Trincomalee"],
  "North Central": ["Anuradhapura", "Polonnaruwa"],
  "North Western": ["Kurunegala", "Puttalam"],
  "Northern": ["Jaffna", "Kilinochchi", "Mannar", "Mullaitivu", "Vavuniya"],
  "Sabaragamuwa": ["Kegalle", "Ratnapura"],
  "Southern": ["Galle", "Hambantota", "Matara"],
  "Uva": ["Badulla", "Moneragala"],
  "Western": ["Colombo", "Gampaha", "Kalutara"]
};

// Static daily demand
const dailyDemand = {
  "Pumpkin": 270, "Tomato": 500, "Carrot": 350, "Cabbage": 400,
  "Onion": 600, "Brinjal (Eggplant)": 300, "Okra": 250, "Beans": 320,
  "Cucumber": 200, "Radish": 150, "Leeks": 450, "Spinach": 100,
  "Potato": 400, "Beetroot": 250
};

// Consumption Limits
const consumptionLimits = { Carrot: 1000, Tomato: 1200, Cabbage: 800, Onion: 2000, Pumpkin: 1500, Beans: 900, Okra: 750, Spinach: 500, Potato: 1500, Leeks: 1100, Radish: 600, Beetroot: 800 };

const Forecasting = () => {
  const navigate = useNavigate();

  const [baseDeclarations, setBaseDeclarations] = useState([]);
  const [visualizedData, setVisualizedData] = useState([]);
  const [isForecasting, setIsForecasting] = useState(false);
  const [selectedVeg, setSelectedVeg] = useState("All");
  const [chartVeg, setChartVeg] = useState("All");
  const [weekOffset, setWeekOffset] = useState(0);

  const [setShowSuccessModal] = useState(false);

  const [forecastForm, setForecastForm] = useState({
    product: "Carrot",
    area: "",
    units: "", 
    cultivationStart: "",
    cultivationDays: "",  
    cultivationEnd: "",
    province: "",      
    district: "",   
    growthDuration: "",   
    harvestingStart: "",  
    harvestingEnd: "",  
    harvestDuration: "7", 
    locationName: "Nuwara Eliya"
  });

  const [isDurationEditable, setIsDurationEditable] = useState(false);
  const durationInputRef = useRef(null);
  const daysArray = Array.from({ length: 31 }, (_, i) => i + 1);

  // --- Load Data ---
  useEffect(() => {
    const load = () => {
      const data = JSON.parse(localStorage.getItem("declarations") || "[]");
      setBaseDeclarations(data);
      if (!isForecasting) {
        setVisualizedData(data);
      }
    };
    load();
    const handler = () => load();
    window.addEventListener("declarationsUpdated", handler);
    return () => window.removeEventListener("declarationsUpdated", handler);
  }, [isForecasting]);

  // --- Auto-Calculate Units ---
  useEffect(() => {
    if (forecastForm.product) {
      const productInfo = productData[forecastForm.product] || { rate: 100, defaultDuration: 60 };
      const calculatedUnits = forecastForm.area ? forecastForm.area * productInfo.rate : "";
      setForecastForm(prev => ({ 
        ...prev, 
        units: calculatedUnits,
        growthDuration: productInfo.defaultDuration 
      }));
      setIsDurationEditable(false);
    }
  }, [forecastForm.product, forecastForm.area]);

  // --- Calculate Dates ---
  useEffect(() => {
    if (forecastForm.cultivationStart) {
      const startDate = new Date(forecastForm.cultivationStart);
      let calcCultivationEnd = "";
      if (forecastForm.cultivationDays) {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + parseInt(forecastForm.cultivationDays));
        calcCultivationEnd = endDate.toISOString().split('T')[0];
      }
      let calcHarvestStart = "";
      let calcHarvestEnd = "";
      if (forecastForm.growthDuration) {
        const hStart = new Date(startDate);
        hStart.setDate(hStart.getDate() + parseInt(forecastForm.growthDuration));
        calcHarvestStart = hStart.toISOString().split('T')[0];
        const hEnd = new Date(hStart);
        hEnd.setDate(hEnd.getDate() + parseInt(forecastForm.harvestDuration) - 1); 
        calcHarvestEnd = hEnd.toISOString().split('T')[0];
      }
      setForecastForm(prev => ({
        ...prev,
        cultivationEnd: calcCultivationEnd,
        harvestingStart: calcHarvestStart,
        harvestingEnd: calcHarvestEnd
      }));
    }
  }, [forecastForm.cultivationStart, forecastForm.cultivationDays, forecastForm.growthDuration, forecastForm.harvestDuration]);

  // --- Handlers ---
  const handleFormChange = (e) => setForecastForm({ ...forecastForm, [e.target.name]: e.target.value });

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Reset district if the province is changed
    if (name === "province") {
      setForecastForm({ ...forecastForm, province: value, district: "" });
    } else {
      setForecastForm({ ...forecastForm, [name]: value });
    }
  };

  const toggleDurationEdit = () => {
    setIsDurationEditable(!isDurationEditable);
    if (!isDurationEditable) setTimeout(() => durationInputRef.current?.focus(), 100);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!forecastForm.province || !forecastForm.district) {
      alert("Please select both a Province and a District.");
      return;
    }

    const newEntry = {
      id: Date.now(),
      ...forecastForm,
      locationText: `${forecastForm.district}, ${forecastForm.province}`
    };

    const existing = JSON.parse(localStorage.getItem("declarations") || "[]");
    existing.push(newEntry);
    localStorage.setItem("declarations", JSON.stringify(existing));

    window.dispatchEvent(new Event("declarationsUpdated"));
    setShowSuccessModal(true); 
  };

  const handleForecastClick = () => {
    if (!forecastForm.area || !forecastForm.cultivationStart || !forecastForm.cultivationEnd || !forecastForm.harvestingStart) {
        alert("Please fill in all fields correctly.");
        return;
    }
    const coords = locationCoordinates[forecastForm.locationName] || { lat: 7.8731, lng: 80.7718 };
    const newEntry = {
      id: "simulated-" + Date.now(),
      product: forecastForm.product,
      area: forecastForm.area,
      units: parseFloat(forecastForm.units) || 0,
      cultivationStart: forecastForm.cultivationStart,
      cultivationEnd: forecastForm.cultivationEnd,
      harvestingStart: forecastForm.harvestingStart,
      harvestingEnd: forecastForm.harvestingEnd,
      location: coords,
      locationText: forecastForm.locationName,
      comments: "Simulated Forecast Entry"
    };
    setVisualizedData([...baseDeclarations, newEntry]);
    setSelectedVeg(forecastForm.product); 
    setChartVeg(forecastForm.product);
    setIsForecasting(true);
  };

  const handleClearForecast = () => {
    setIsForecasting(false);
    setVisualizedData(baseDeclarations);
    setSelectedVeg("All");
    setChartVeg("All");
    setWeekOffset(0);
    setForecastForm({ product: "Carrot", area: "", units: "", cultivationStart: "", cultivationDays: "", province: "", district: "", cultivationEnd: "", growthDuration: "", harvestingStart: "", harvestingEnd: "", harvestDuration: "7", locationName: "Nuwara Eliya" });
    setIsDurationEditable(false);
  };

  const filteredLocations = visualizedData.filter((item) => {
    if (!item || !item.product) return false;
    if (selectedVeg === "All") return true;
    return (item.product || "").trim().toLowerCase() === (selectedVeg || "").trim().toLowerCase();
  });

  // --- ADVANCED SUGGESTION ENGINE & PROPORTIONAL FINANCIAL MODEL ---
  let forecastSuggestion = null;
  let financialImpact = null;
  let marketState = 'balanced';
  let limit = consumptionLimits[selectedVeg] || 1000;
  let currentTotalUnits = filteredLocations.reduce((sum, item) => sum + (parseFloat(item.units) || 0), 0);
  let projectedTotal = currentTotalUnits;

  if (isForecasting) {
      const baseProductData = baseDeclarations.filter(item => (item.product || "").trim().toLowerCase() === forecastForm.product.toLowerCase());
      const currentSupply = baseProductData.reduce((sum, item) => sum + (parseFloat(item.units) || 0), 0);
      limit = consumptionLimits[forecastForm.product] || 1000;
      
      const newUnits = parseFloat(forecastForm.units) || 0;
      const harvestDays = parseInt(forecastForm.harvestDuration) || 7;
      
      const effectiveWeeklyUnits = newUnits / (harvestDays / 7);
      projectedTotal = currentSupply + effectiveWeeklyUnits;
      
      const supplyRatio = projectedTotal / limit;
      
      if (supplyRatio < 0.9) marketState = 'undersupply';
      else if (supplyRatio > 1.1) marketState = 'oversupply';
      else marketState = 'balanced';

      // Proportional Financial Calculation
      const harvestDate = new Date(forecastForm.harvestingStart);
      const harvestMonth = harvestDate.toLocaleString('en-US', { month: 'short' }); 
      const historicalMonthlyPrice = productData[forecastForm.product]?.historicalPrices?.[harvestMonth] || 100;
      
      let predictedPrice = historicalMonthlyPrice;
      
      if (marketState === 'oversupply') {
          // PROPORTIONAL DROP: e.g., 20% oversupply = 10% price drop. Capped to not hit floor immediately.
          const overSupplyPercentage = (projectedTotal - limit) / limit;
          const priceDropFactor = overSupplyPercentage * 0.5; 
          predictedPrice = Math.max(historicalMonthlyPrice * 0.3, historicalMonthlyPrice * (1 - priceDropFactor)); 
      } else if (marketState === 'undersupply') {
          // PROPORTIONAL PREMIUM: Undersupply increases prices safely up to 30%
          const underSupplyPercentage = (limit - projectedTotal) / limit;
          const priceIncreaseFactor = underSupplyPercentage * 0.3;
          predictedPrice = Math.min(historicalMonthlyPrice * 1.5, historicalMonthlyPrice * (1 + priceIncreaseFactor));
      }

      const expectedRevenue = newUnits * historicalMonthlyPrice;
      const predictedRevenue = newUnits * predictedPrice;
      const diff = predictedRevenue - expectedRevenue;

      financialImpact = {
          harvestMonth,
          basePrice: historicalMonthlyPrice,
          predictedPrice: Math.round(predictedPrice),
          expectedRevenue: expectedRevenue.toLocaleString(),
          predictedRevenue: Math.round(predictedRevenue).toLocaleString(),
          diff: Math.round(Math.abs(diff)).toLocaleString(),
          state: marketState
      };

      // Comprehensive Suggestion Engine
      const suitableCrops = regionSuitableCrops[forecastForm.locationName] || [];
      const alternatives = suitableCrops.filter(c => c !== forecastForm.product);
      const altText = alternatives.length > 0 ? alternatives.join(", ") : "other local crops";

      if (marketState === 'oversupply') {
          const safeAdditionalUnits = Math.max(0, limit - currentSupply);
          const productYieldRate = productData[forecastForm.product]?.rate || 1;
          const safeArea = (safeAdditionalUnits / productYieldRate).toFixed(2);
          const originalArea = parseFloat(forecastForm.area) || 0;
          const excessArea = Math.max(0, originalArea - safeArea).toFixed(2);

          if (safeAdditionalUnits > 0 && excessArea > 0) {
              forecastSuggestion = { type: 'partial', safeArea, excessArea, alternatives: altText };
          } else {
              forecastSuggestion = { type: 'full', alternatives: altText };
          }
      } else if (marketState === 'balanced') {
          forecastSuggestion = { 
              type: 'balanced', 
              message: `Your harvest fits perfectly into current demand! To ensure the safest return, consider increasing your "Days to Harvest" to ${harvestDays + 5} days. This creates a buffer against sudden market changes.` 
          };
      } else if (marketState === 'undersupply') {
          const roomForMoreUnits = limit - projectedTotal;
          const productYieldRate = productData[forecastForm.product]?.rate || 1;
          const additionalArea = (roomForMoreUnits / productYieldRate).toFixed(2);
          forecastSuggestion = { 
              type: 'undersupply', 
              message: `High Demand Alert! The market needs more ${forecastForm.product}. You have room to safely cultivate up to ${additionalArea} MORE Hectares before the price begins to drop.` 
          };
      }
  }

  // --- Dynamic Alert UI Generation ---
  let statusUI = null;

  if (!isForecasting) {
    if (currentTotalUnits > limit * 1.1) {
      statusUI = <Alert variant="danger" className="shadow-sm mb-0 p-4 fs-5 fw-bold">⚠ Oversupply Risk! Total Projected: {currentTotalUnits} (Limit: {limit})</Alert>;
    } else if (currentTotalUnits >= limit * 0.9) {
      statusUI = <Alert variant="warning" className="shadow-sm mb-0 p-4 fs-5 fw-bold">⚠ Market near margin ({currentTotalUnits}/{limit}). Monitor closely.</Alert>;
    } else {
      statusUI = <Alert variant="success" className="shadow-sm mb-0 p-4 fs-5 fw-bold">Supply and demand are safely balanced ✅</Alert>;
    }
  } else {
    // UI When Forecasting
    if (marketState === 'oversupply') {
      statusUI = (
        <Alert variant="danger" className="shadow-sm mb-0 p-4 text-center">
            <div className="fs-4 fw-bold mb-1">⚠ Oversupply Risk Detected</div>
            <div className="fs-6 mb-3">Projected Market Supply: {Math.round(projectedTotal)} (Safe Limit: {limit})</div>
            
            {financialImpact && (
                <div className="mb-3 p-3 bg-danger bg-opacity-10 text-danger rounded border border-danger shadow-sm text-start mx-auto" style={{ maxWidth: "800px" }}>
                    <h5 className="fw-bold border-bottom border-danger pb-2">📉 Financial Impact Warning</h5>
                    <p className="mb-2">
                      Because supply exceeds demand, the standard price of <strong>Rs {financialImpact.basePrice}/kg</strong> for {financialImpact.harvestMonth} is predicted to drop proportionally to <strong>Rs {financialImpact.predictedPrice}/kg</strong>.
                    </p>
                    <ul className="mb-0">
                        <li>Expected Income (Normal Market): <strong>Rs {financialImpact.expectedRevenue}</strong></li>
                        <li>Predicted Income (Oversupplied): <strong>Rs {financialImpact.predictedRevenue}</strong></li>
                        <li className="text-dark fw-bold mt-1">Estimated Loss: Rs {financialImpact.diff}</li>
                    </ul>
                </div>
            )}
            {forecastSuggestion && (
              <div className="mt-2 p-3 bg-white text-danger rounded border border-danger shadow-sm text-start mx-auto" style={{ maxWidth: "800px" }}>
                <h5 className="fw-bold mb-3">💡 Smart Cultivation Suggestion:</h5>
                {forecastSuggestion.type === 'partial' ? (
                  <p className="mb-0 fs-6">Reduce your <strong>{forecastForm.product}</strong> area to <strong>{forecastSuggestion.safeArea} Hectares</strong>. Use the remaining <strong>{forecastSuggestion.excessArea} Hectares</strong> for <strong className="text-success">{forecastSuggestion.alternatives}</strong>.</p>
                ) : (
                  <p className="mb-0 fs-6">The market is heavily oversupplied. We recommend dedicating your full <strong>{forecastForm.area} Hectares</strong> to alternative crops like <strong className="text-success">{forecastSuggestion.alternatives}</strong>.</p>
                )}
              </div>
            )}
        </Alert>
      );
    } else if (marketState === 'balanced') {
      statusUI = (
        <Alert variant="info" className="shadow-sm mb-0 p-4 text-center">
            <div className="fs-4 fw-bold mb-2" style={{ color: "#0c5460" }}>⚖ Market is Perfectly Balanced</div>
            <div className="p-3 bg-white text-dark rounded border shadow-sm mx-auto fs-6" style={{ maxWidth: "800px", borderLeft: "5px solid #17a2b8" }}>
                <p className="mb-0 fw-bold">{forecastSuggestion?.message}</p>
            </div>
        </Alert>
      );
    } else if (marketState === 'undersupply') {
      statusUI = (
        <Alert variant="success" className="shadow-sm mb-0 p-4 text-center">
            <div className="fs-4 fw-bold mb-2 text-success">🚀 Undersupply - Great Opportunity!</div>
            <div className="p-3 bg-white text-dark rounded border shadow-sm mx-auto fs-6" style={{ maxWidth: "800px", borderLeft: "5px solid #28a745" }}>
                <p className="mb-0 fw-bold">{forecastSuggestion?.message}</p>
            </div>
            {financialImpact && financialImpact.basePrice < financialImpact.predictedPrice && (
                <div className="mt-3 fs-6 text-success fw-bold">
                    * Due to high demand, predicted prices may jump from Rs {financialImpact.basePrice}/kg up to Rs {financialImpact.predictedPrice}/kg!
                </div>
            )}
        </Alert>
      );
    }
  }

  // --- Calendar & Chart Data Helpers ---
  const buildDateMap = (type) => {
    const dateInfo = {};
    filteredLocations.forEach((item) => {
      const start = type === "cultivation" ? item.cultivationStart : item.harvestingStart;
      const end = type === "cultivation" ? item.cultivationEnd : item.harvestingEnd;
      if (!start || !end) return;
      const startDate = new Date(start);
      const endDate = new Date(end);
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0];
        if (!dateInfo[dateStr]) dateInfo[dateStr] = [];
        const durationInDays = Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        const dailyUnits = (parseFloat(item.units) || 0) / (durationInDays || 1);
        dateInfo[dateStr].push(dailyUnits);
      }
    });
    return dateInfo;
  };

  const cultivationDates = buildDateMap("cultivation");
  const harvestDates = buildDateMap("harvest");

  const getWeeklyComparisonData = () => {
    const chartFilteredLocations = visualizedData.filter((item) => {
        if (!item || !item.product) return false;
        if (chartVeg === "All") return true;
        return (item.product || "").trim().toLowerCase() === (chartVeg || "").trim().toLowerCase();
    });

    const chartHarvestMap = {};
    chartFilteredLocations.forEach((item) => {
        if (!item.harvestingStart || !item.harvestingEnd) return;
        const startDate = new Date(item.harvestingStart);
        const endDate = new Date(item.harvestingEnd);
        const durationInDays = Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        const dailyUnits = (parseFloat(item.units) || 0) / (durationInDays || 1);

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split("T")[0];
            chartHarvestMap[dateStr] = (chartHarvestMap[dateStr] || 0) + dailyUnits;
        }
    });

    const data = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + (weekOffset * 7)); 

    for (let i = 0; i < 4; i++) {
      const wStart = new Date(baseDate);
      wStart.setDate(baseDate.getDate() + (i * 7));
      const wEnd = new Date(wStart);
      wEnd.setDate(wStart.getDate() + 6);

      let weeklyHarvest = 0;
      for (let d = new Date(wStart); d <= wEnd; d.setDate(d.getDate() + 1)) {
        const dStr = d.toISOString().split("T")[0];
        if (chartHarvestMap[dStr]) weeklyHarvest += chartHarvestMap[dStr];
      }

      let weeklyDemand = chartVeg === "All" ? Object.values(dailyDemand).reduce((a, b) => a + b, 0) * 7 : (dailyDemand[chartVeg] || 0) * 7;
      const formatStr = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      data.push({ weekRange: `${formatStr(wStart)} - ${formatStr(wEnd)}`, Harvest: Math.round(weeklyHarvest), Demand: Math.round(weeklyDemand) });
    }
    return data;
  };

  const tileContent = (dateInfo) => ({ date, view }) => {
    if (view !== "month") return null;
    const dateStr = date.toISOString().split("T")[0];
    const dailyTotal = dateInfo[dateStr]?.reduce((a, b) => a + b, 0);
    return dailyTotal ? <div style={{ fontSize: "0.6rem", color: "#28a745" }}>{Math.round(dailyTotal)}</div> : null;
  };

  const tileClassName = (dateInfo, colorClass) => ({ date, view }) => {
    if (view !== "month") return null;
    return dateInfo[date.toISOString().split("T")[0]] ? colorClass : null;
  };

  // --- Dynamic Graph Data Generation ---
  const activeChartVeg = chartVeg === "All" ? "Carrot" : chartVeg; 
  const historicalDataForChart = productData[activeChartVeg]?.historicalPrices || {};
  
  const dynamicChartData = Object.keys(historicalDataForChart).map(month => {
      let dataPoint = { month, HistoricalPrice: historicalDataForChart[month] };
      if (isForecasting && financialImpact && activeChartVeg === forecastForm.product && month === financialImpact.harvestMonth) {
          dataPoint.PredictedPrice = financialImpact.predictedPrice;
      }
      return dataPoint;
  });

  return (
    <Container className="mt-5 mb-5">
      {/* SECTION 1: FORECAST INPUT FORM */}
      <Card className="p-4 shadow mb-4" style={{ borderLeft: "5px solid #1B5E20" }}>
        <h3 className="fw-bold mb-4" style={{ color: "#1B5E20" }}>Forecast Your Product</h3>
        <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Product</Form.Label>
                        <Form.Select name="product" value={forecastForm.product} onChange={handleFormChange}>
                            {Object.keys(productData).map((p, i) => <option key={i} value={p}>{p}</option>)}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Area (Hectares)</Form.Label>
                        <Form.Control type="number" name="area" placeholder="e.g. 2" min="0.1" step="0.1" value={forecastForm.area} onChange={handleFormChange} />
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Calculated Units</Form.Label>
                        <Form.Control type="number" value={forecastForm.units} readOnly className="bg-light" />
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Province</Form.Label>
                        <Form.Select 
                          name="province" 
                          value={forecastForm.province} 
                          onChange={handleChange} 
                          required
                        >
                          <option value="">-- Select Province --</option>
                          {Object.keys(locationData).sort().map((prov, i) => (
                            <option key={i} value={prov}>{prov} Province</option>
                          ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Cultivation Start Date</Form.Label>
                        <Form.Control type="date" name="cultivationStart" value={forecastForm.cultivationStart} onChange={handleFormChange} />
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Days to Cultivate (Window)</Form.Label>
                        <Form.Select name="cultivationDays" value={forecastForm.cultivationDays} onChange={handleFormChange}>
                            <option value="">Select (1-31)...</option>
                            {daysArray.map(d => <option key={d} value={d}>{d} Days</option>)}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group>
                         <Form.Label>Cultivation Ends On</Form.Label>
                         <Form.Control type="date" value={forecastForm.cultivationEnd} readOnly className="bg-light" />
                    </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>District</Form.Label>
                    <Form.Select 
                      name="district" 
                      value={forecastForm.district} 
                      onChange={handleChange} 
                      disabled={!forecastForm.province}
                      required
                    >
                      <option value="">
                        {!forecastForm.province ? "Select Province First" : "-- Select District --"}
                      </option>
                      {forecastForm.province && locationData[forecastForm.province].sort().map((dist, i) => (
                        <option key={i} value={dist}>{dist}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Growth Duration (Days)</Form.Label>
                        <InputGroup>
                            <Form.Control 
                                ref={durationInputRef} type="number" name="growthDuration" value={forecastForm.growthDuration}
                                onChange={handleFormChange} readOnly={!isDurationEditable}
                                className={isDurationEditable ? "bg-white border-primary" : "bg-light"}
                            />
                            <Button variant={isDurationEditable ? "primary" : "outline-secondary"} onClick={toggleDurationEdit}>✏️</Button>
                        </InputGroup>
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group>
                        <Form.Label className="text-success fw-bold">Harvest Start Date</Form.Label>
                        <Form.Control type="date" value={forecastForm.harvestingStart} readOnly className="bg-success bg-opacity-25 text-success fw-bold" />
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Days to Harvest</Form.Label>
                        <Form.Select name="harvestDuration" value={forecastForm.harvestDuration} onChange={handleFormChange}>
                            {daysArray.map(d => <option key={d} value={d}>{d} Days</option>)}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Harvest Ends On</Form.Label>
                        <Form.Control type="date" value={forecastForm.harvestingEnd} readOnly className="bg-light" />
                    </Form.Group>
                </Col>
            </Row>

            <Row className="mt-4">
                <Col>
                    <Button variant="success" size="lg" className="me-2" onClick={handleForecastClick}>Generate Forecast</Button>
                    {isForecasting && <Button variant="outline-secondary" size="lg" onClick={handleClearForecast}>Reset</Button>}
                </Col>
            </Row>
        </Form>
      </Card>

      {/* SECTION 2: RESULTS DASHBOARD */}
      <div className={isForecasting ? "fade-in-section" : ""}>
          <Row className="mb-4 align-items-center">
            <Col>
              <h2 className="fw-bold" style={{ color: "#1B5E20" }}>
                  {isForecasting ? "Simulated Market Analysis" : "Current Market Status"}
              </h2>
            </Col>
            <Col md={3}>
               <Dropdown onSelect={(k) => setSelectedVeg(k)}>
                 <Dropdown.Toggle variant="success" className="w-100">{selectedVeg === "All" ? "Global Filter: All" : `Global Filter: ${selectedVeg}`}</Dropdown.Toggle>
                 <Dropdown.Menu>
                   <Dropdown.Item eventKey="All">Show All</Dropdown.Item>
                   {Object.keys(productData).map((v, i) => <Dropdown.Item key={i} eventKey={v}>{v}</Dropdown.Item>)}
                 </Dropdown.Menu>
               </Dropdown>
            </Col>
          </Row>

          {/* Dynamic Status Alert Container */}
          <Row className="mb-4">
            <Col>
              {statusUI}
            </Col>
          </Row>

          {/* Bar Chart Section */}
          <Row className="mb-5">
            <Col>
              <Card className="p-4 shadow border-0">
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-4">
                    <h4 className="fw-bold text-dark mb-0">📊 Harvest vs. Market Demand</h4>
                    <div className="d-flex align-items-center gap-3 flex-wrap mt-2 mt-md-0">
                        <div className="d-flex align-items-center border rounded p-1">
                            <Button variant="light" size="sm" onClick={() => setWeekOffset(w => w - 1)} className="fw-bold">&larr; Prev</Button>
                            <span className="mx-2 fw-bold text-muted text-center" style={{ minWidth: "90px" }}>
                                {weekOffset === 0 ? "This Week" : weekOffset > 0 ? `+${weekOffset} Weeks` : `${weekOffset} Weeks`}
                            </span>
                            <Button variant="light" size="sm" onClick={() => setWeekOffset(w => w + 1)} className="fw-bold">Next &rarr;</Button>
                        </div>
                        <Form.Select size="sm" style={{ width: "180px", fontWeight: "bold", border: "2px solid #1B5E20", color: "#1B5E20" }} value={chartVeg} onChange={(e) => setChartVeg(e.target.value)}>
                            <option value="All">All Vegetables</option>
                            {Object.keys(productData).map((v, i) => <option key={i} value={v}>{v}</option>)}
                        </Form.Select>
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getWeeklyComparisonData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="weekRange" />
                    <YAxis />
                    <Tooltip cursor={{ fill: '#f4f4f4' }} />
                    <Legend />
                    <Bar dataKey="Harvest" fill="#dc3545" name="Harvest Amount (kg)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Demand" fill="#28a745" name="Market Demand (kg)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          {/* Calendars Section */}
          <Row className="mb-5">
            <Col md={6} className="mb-4">
                 <Card className="p-3 shadow h-100 border-0">
                    <h5 className="text-center text-success fw-bold">🌱 Cultivation Schedule</h5>
                    <div className="d-flex justify-content-center">
                        <Calendar tileClassName={tileClassName(cultivationDates, "cultivation-date")} tileContent={tileContent(cultivationDates)} />
                    </div>
                 </Card>
            </Col>
            <Col md={6} className="mb-4">
                 <Card className="p-3 shadow h-100 border-0">
                    <h5 className="text-center text-danger fw-bold">🌾 Harvesting Schedule</h5>
                    <div className="d-flex justify-content-center">
                        <Calendar tileClassName={tileClassName(harvestDates, "harvest-date")} tileContent={tileContent(harvestDates)} />
                    </div>
                 </Card>
            </Col>
          </Row>

          {/* Map Section */}
          <Row className="mb-5">
            <Col>
              <Card className="p-3 shadow border-0">
                <h4 className="mb-3">🗺 {isForecasting ? "Simulated Distribution Map" : "Current Cultivation Map"}</h4>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <CultivationMap locations={filteredLocations} />
                </div>
              </Card>
            </Col>
          </Row>

          {/* Dynamic Graph Section */}          
          <Row className="mb-5">
          <Col>
            <PriceTrendsChart 
              activeChartVeg={activeChartVeg}
              dynamicChartData={dynamicChartData}
              isForecasting={isForecasting}
              financialImpact={financialImpact}
              forecastProduct={forecastForm.product} 
            />
          </Col>
        </Row>
          {/* {Button to navigate to ProductDeclaration form} */}
          <Row className="mt-5 mb-3 justify-content-center">
            <Col xs="auto">
                <Button 
                    variant="primary" 
                    size="lg" 
                    className="px-5 shadow rounded-pill fw-bold"
                    style={{ backgroundColor: "#1B5E20", borderColor: "#1B5E20" }}
                    onClick={() => navigate('/product-declaration')}
                >
                    ➕ Add your product
                </Button>
            </Col>
          </Row>
      </div>
    </Container>
  );
};

export default Forecasting;

