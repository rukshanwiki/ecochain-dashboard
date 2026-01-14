import React, { useEffect, useState } from "react";
import { Container, Row, Col, Dropdown, Alert, Card, Form, Button } from "react-bootstrap";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import CultivationMap from "./CultivationMap";
import "../CSS/Dashboard.css";
import "../CSS/CalendarPage.css"; 

// Coordinates for demo locations
const locationCoordinates = {
  "Nuwara Eliya": { lat: 6.9497, lng: 80.7891 },
  "Bandarawela": { lat: 6.8301, lng: 80.9991 },
  "Kandy": { lat: 7.2906, lng: 80.6337 },
  "Dambulla": { lat: 7.8731, lng: 80.7718 },
  "Jaffna": { lat: 9.6615, lng: 80.0255 },
  "Colombo": { lat: 6.9271, lng: 79.8612 }
};

// Rates copied from ProductDeclaration to ensure consistent logic
const conversionRates = {
  Tomato: 250,
  Carrot: 180,
  Cabbage: 200,
  Onion: 150,
  Pumpkin: 120,
  Beans: 210,
  Okra: 190,
  Spinach: 300,
  Potato: 170,
  Leeks: 190,
  Radish: 220,
  Beetroot: 200,
};

const Forecasting = () => {
  // --- State for Base Data (from LocalStorage) ---
  const [baseDeclarations, setBaseDeclarations] = useState([]);
  
  // --- State for Visualization (Base + Forecasted Entry) ---
  const [visualizedData, setVisualizedData] = useState([]);
  const [isForecasting, setIsForecasting] = useState(false);

  // --- State for Dropdown Filter ---
  const [selectedVeg, setSelectedVeg] = useState("All");

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  // --- State for "Forecast Your Product" Form (Updated to match Declaration) ---
  const [forecastForm, setForecastForm] = useState({
    product: "Carrot",
    area: "",
    units: "", // Calculated automatically
    cultivationStart: "",
    cultivationEnd: "",
    harvestingYear: "",
    harvestingMonth: "",
    harvestingWeek: "",
    locationName: "Nuwara Eliya"
  });

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

  // --- Auto-Calculate Units based on Area & Product ---
  useEffect(() => {
    if (forecastForm.product && forecastForm.area) {
      const rate = conversionRates[forecastForm.product] || 100;
      setForecastForm(prev => ({ ...prev, units: forecastForm.area * rate }));
    }
  }, [forecastForm.product, forecastForm.area]);

  // --- Form Handlers ---
  const handleFormChange = (e) => {
    setForecastForm({ ...forecastForm, [e.target.name]: e.target.value });
  };

  // --- Helper to convert Year/Month/Week to Date Range ---
  const getHarvestingRange = () => {
    const { harvestingYear, harvestingMonth, harvestingWeek } = forecastForm;
    if (!harvestingYear || !harvestingMonth || !harvestingWeek) return null;

    const monthIndex = months.indexOf(harvestingMonth);
    const firstDay = new Date(harvestingYear, monthIndex, 1);
    const lastDay = new Date(harvestingYear, monthIndex + 1, 0);

    const weeks = [];
    let start = new Date(firstDay);
    while (start <= lastDay) {
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      if (end > lastDay) end.setDate(lastDay.getDate());
      weeks.push({ start: new Date(start), end });
      start.setDate(start.getDate() + 7);
    }

    const selectedWeek = weeks[parseInt(harvestingWeek) - 1];
    return selectedWeek || null;
  };

  const handleForecastClick = () => {
    // 1. Calculate dates from dropdowns
    const harvestRange = getHarvestingRange();

    if (!forecastForm.area || !forecastForm.cultivationStart || !forecastForm.cultivationEnd || !harvestRange) {
        alert("Please fill in all fields correctly.");
        return;
    }

    const coords = locationCoordinates[forecastForm.locationName] || { lat: 7.8731, lng: 80.7718 };
    
    // 2. Create the new simulated entry
    const newEntry = {
      id: "simulated-" + Date.now(),
      product: forecastForm.product,
      area: forecastForm.area,
      units: parseFloat(forecastForm.units) || 0,
      cultivationStart: forecastForm.cultivationStart,
      cultivationEnd: forecastForm.cultivationEnd,
      harvestingStart: harvestRange.start.toISOString().split("T")[0],
      harvestingEnd: harvestRange.end.toISOString().split("T")[0],
      location: coords,
      locationText: forecastForm.locationName,
      comments: "Simulated Forecast Entry"
    };

    // 3. Combine with existing data
    const combinedData = [...baseDeclarations, newEntry];
    
    // 4. Update State
    setVisualizedData(combinedData);
    setSelectedVeg(forecastForm.product); 
    setIsForecasting(true);
  };

  const handleClearForecast = () => {
    setIsForecasting(false);
    setVisualizedData(baseDeclarations);
    setSelectedVeg("All");
    setForecastForm({
        product: "Carrot",
        area: "",
        units: "",
        cultivationStart: "",
        cultivationEnd: "",
        harvestingYear: "",
        harvestingMonth: "",
        harvestingWeek: "",
        locationName: "Nuwara Eliya"
    });
  };

  // --- Filtering Logic ---
  const filteredLocations = visualizedData.filter((item) => {
    if (!item || !item.product) return false;
    if (selectedVeg === "All") return true;
    return (item.product || "").trim().toLowerCase() === (selectedVeg || "").trim().toLowerCase();
  });

  // --- Supply & Demand Logic ---
  const consumptionLimits = { Carrot: 1000, Tomato: 1200, Cabbage: 800, Onion: 2000, Pumpkin: 1500 };
  const totalUnits = filteredLocations.reduce((sum, item) => sum + (parseFloat(item.units) || 0), 0);
  const limit = consumptionLimits[selectedVeg] || 1000;

  let status = { color: "success", message: "Supply and demand are balanced ✅" };
  if (totalUnits > limit * 1.2) {
    status = { color: "danger", message: `⚠ Oversupply risk! Total: ${totalUnits} (Limit: ${limit}). Prices may drop.` };
  } else if (totalUnits >= limit * 0.9) {
    status = { color: "warning", message: `⚠ Near consumption margin (${totalUnits}/${limit}). Monitor closely.` };
  }

  // --- Calendar Logic ---
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
        dateInfo[dateStr].push(parseFloat(item.units) || 0);
      }
    });
    return dateInfo;
  };

  const cultivationDates = buildDateMap("cultivation");
  const harvestDates = buildDateMap("harvest");

  const tileContent = (dateInfo) => ({ date, view }) => {
    if (view !== "month") return null;
    const dateStr = date.toISOString().split("T")[0];
    const dailyTotal = dateInfo[dateStr]?.reduce((a, b) => a + b, 0);
    return dailyTotal ? <div style={{ fontSize: "0.6rem", color: "#28a745" }}>{dailyTotal}</div> : null;
  };

  const tileClassName = (dateInfo, colorClass) => ({ date, view }) => {
    if (view !== "month") return null;
    const dateStr = date.toISOString().split("T")[0];
    return dateInfo[dateStr] ? colorClass : null;
  };

  // --- Chart Data (Mock) ---
  const chartData = [
    { month: "Jan", price: 150 }, { month: "Feb", price: 140 }, { month: "Mar", price: 160 },
    { month: "Apr", price: 120 }, { month: "May", price: 170 }, { month: "Jun", price: 155 }
  ];

  return (
    <Container className="mt-5 mb-5">
      
      {/* --- SECTION 1: FORECAST INPUT FORM --- */}
      <Card className="p-4 shadow mb-5" style={{ borderLeft: "5px solid #1B5E20" }}>
        <h3 className="fw-bold mb-4" style={{ color: "#1B5E20" }}>Forecast Your Product</h3>
        <Form>
            {/* ROW 1: Product, Area, Units, Location */}
            <Row className="mb-3">
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Product</Form.Label>
                        <Form.Select name="product" value={forecastForm.product} onChange={handleFormChange}>
                            {Object.keys(conversionRates).map((p, i) => <option key={i} value={p}>{p}</option>)}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group>
                        <Form.Label>Area (Hectares)</Form.Label>
                        <Form.Control 
                            type="number" 
                            name="area" 
                            placeholder="e.g. 2" 
                            min="0.1" 
                            step="0.1"
                            value={forecastForm.area} 
                            onChange={handleFormChange} 
                        />
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
                        <Form.Label>Region</Form.Label>
                        <Form.Select name="locationName" value={forecastForm.locationName} onChange={handleFormChange}>
                             {Object.keys(locationCoordinates).map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>

            {/* ROW 2: Cultivation Period */}
            <Row className="mb-3">
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Cultivation Period</Form.Label>
                        <div className="d-flex align-items-center gap-2">
                            <Form.Control 
                                type="date" 
                                name="cultivationStart" 
                                value={forecastForm.cultivationStart} 
                                onChange={handleFormChange} 
                            />
                            <span>to</span>
                            <Form.Control 
                                type="date" 
                                name="cultivationEnd" 
                                value={forecastForm.cultivationEnd} 
                                min={forecastForm.cultivationStart}
                                onChange={handleFormChange} 
                            />
                        </div>
                    </Form.Group>
                </Col>
                
                {/* ROW 2 Continued: Harvesting Period */}
                <Col md={6}>
                    <Form.Group>
                        <Form.Label>Harvesting Period</Form.Label>
                        <div className="d-flex align-items-center gap-2">
                            <Form.Select name="harvestingYear" value={forecastForm.harvestingYear} onChange={handleFormChange}>
                                <option value="">Year</option>
                                {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
                            </Form.Select>
                            <Form.Select name="harvestingMonth" value={forecastForm.harvestingMonth} onChange={handleFormChange}>
                                <option value="">Month</option>
                                {months.map((m, i) => <option key={i} value={m}>{m}</option>)}
                            </Form.Select>
                            <Form.Select name="harvestingWeek" value={forecastForm.harvestingWeek} onChange={handleFormChange}>
                                <option value="">Week</option>
                                {[1,2,3,4].map((w) => <option key={w} value={w}>Week {w}</option>)}
                            </Form.Select>
                        </div>
                    </Form.Group>
                </Col>
            </Row>

            <Row className="mt-4">
                <Col>
                    <Button variant="success" size="lg" className="me-2" onClick={handleForecastClick}>
                        Generate Forecast
                    </Button>
                    {isForecasting && (
                        <Button variant="outline-secondary" size="lg" onClick={handleClearForecast}>
                            Reset
                        </Button>
                    )}
                </Col>
            </Row>
        </Form>
      </Card>

      {/* --- SECTION 2: RESULTS DASHBOARD --- */}
      <div className={isForecasting ? "fade-in-section" : ""}>
          
          <Row className="mb-4 align-items-center">
            <Col>
              <h2 className="fw-bold" style={{ color: "#1B5E20" }}>
                  {isForecasting ? "Simulated Market Analysis" : "Current Market Status"}
              </h2>
            </Col>
            {/* Filter Dropdown */}
            <Col md={3}>
               <Dropdown onSelect={(k) => setSelectedVeg(k)}>
                 <Dropdown.Toggle variant="success" className="w-100">{selectedVeg === "All" ? "Filter: All" : `Filter: ${selectedVeg}`}</Dropdown.Toggle>
                 <Dropdown.Menu>
                   <Dropdown.Item eventKey="All">Show All</Dropdown.Item>
                   {Object.keys(conversionRates).map((v, i) => <Dropdown.Item key={i} eventKey={v}>{v}</Dropdown.Item>)}
                 </Dropdown.Menu>
               </Dropdown>
            </Col>
          </Row>

          {/* Status Alert */}
          <Row className="mb-4">
            <Col>
              <Alert variant={status.color} className="text-center fs-5 fw-bold shadow-sm">
                {status.message}
              </Alert>
            </Col>
          </Row>

          {/* Calendars Section */}
          <Row className="mb-5">
            <Col md={6} className="mb-4">
                 <Card className="p-3 shadow h-100 border-0">
                    <h5 className="text-center text-success fw-bold">🌱 Cultivation Schedule</h5>
                    <div className="d-flex justify-content-center">
                        <Calendar 
                            tileClassName={tileClassName(cultivationDates, "cultivation-date")}
                            tileContent={tileContent(cultivationDates)}
                        />
                    </div>
                 </Card>
            </Col>
            <Col md={6} className="mb-4">
                 <Card className="p-3 shadow h-100 border-0">
                    <h5 className="text-center text-danger fw-bold">🌾 Harvesting Schedule</h5>
                    <div className="d-flex justify-content-center">
                        <Calendar 
                            tileClassName={tileClassName(harvestDates, "harvest-date")}
                            tileContent={tileContent(harvestDates)}
                        />
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

          {/* Graph Section */}
          <Row className="mb-5">
            <Col>
              <Card className="p-3 shadow border-0">
                <h4 className="mb-3">📈 Price Prediction (Based on Supply)</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="price" stroke="#1B5E20" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>
      </div>
    </Container>
  );
};

export default Forecasting;