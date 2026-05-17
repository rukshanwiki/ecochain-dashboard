import React, { useState, useEffect } from "react";
import { Card, Table, ButtonGroup, Button, Row, Col, Container, Dropdown } from "react-bootstrap";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const AmountSummaryTable = ({ declarations: propsDeclarations, selectedVeg: propsSelectedVeg }) => {
  const [localDeclarations, setLocalDeclarations] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState("All");
  const [timeframe, setTimeframe] = useState("month"); // 'week', 'month', 'year'

  // ✅ Automatically load declarations from localStorage if not passed as props (Standalone mode)
  useEffect(() => {
    if (!propsDeclarations) {
      const loadData = () => {
        const data = JSON.parse(localStorage.getItem("declarations") || "[]");
        setLocalDeclarations(data);
      };
      loadData();
      window.addEventListener("declarationsUpdated", loadData);
      return () => window.removeEventListener("declarationsUpdated", loadData);
    }
  }, [propsDeclarations]);

  // ✅ Keep internal crop selection synchronized if the parent dashboard passes a default filter
  useEffect(() => {
    if (propsSelectedVeg) {
      setSelectedCrop(propsSelectedVeg);
    }
  }, [propsSelectedVeg]);

  // Choose the data source cleanly based on whether it is rendered standalone or in Dashboard
  const rawDeclarations = propsDeclarations !== undefined ? propsDeclarations : localDeclarations;

  // Extract unique crops from current declarations to populate the dropdown dynamically
  const productsFromData = Array.from(
    new Set(rawDeclarations.map((d) => (d.product || "").trim()).filter(Boolean))
  ).sort();
  
  const defaultVegList = [
    "Carrot", "Tomato", "Cabbage", "Onion", "Pumpkin", "Brinjal (Eggplant)",
    "Okra", "Beans", "Cucumber", "Radish", "Leeks", "Spinach"
  ];
  const vegetables = [...new Set([...productsFromData, ...defaultVegList])];

  // --- FILTER METRICS BY COMPONENT'S DROPDOWN SELECTION ---
  const filteredDeclarations = rawDeclarations.filter((item) => {
    if (!item || !item.product) return false;
    if (selectedCrop === "All") return true;
    return item.product.trim().toLowerCase() === selectedCrop.trim().toLowerCase();
  });

  // --- PROCESSING LOGIC FOR DATE TIMEFRAMES ---
  const getSortableKey = (dateStr, tf) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    
    if (tf === "year") return `${year}`;
    if (tf === "month") return `${year}-${month}`;
    if (tf === "week") {
      const firstDay = new Date(year, 0, 1);
      const pastDays = (d - firstDay) / 86400000;
      const weekNum = Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
      return `${year}-W${String(weekNum).padStart(2, "0")}`;
    }
    return null;
  };

  const formatLabel = (key, tf) => {
    if (tf === "year") return key;
    if (tf === "month") {
      const [y, m] = key.split("-");
      const date = new Date(y, parseInt(m) - 1, 1);
      return date.toLocaleString("default", { month: "short", year: "numeric" });
    }
    if (tf === "week") {
      return `Week ${key.split("-W")[1]} (${key.split("-W")[0]})`;
    }
    return key;
  };

  // Compile synchronized analytics data mapping
  const cultAgg = {};
  const harvAgg = {};
  const allPeriods = new Set();

  filteredDeclarations.forEach((item) => {
    const units = parseFloat(item.units) || 0;

    // Process Cultivation
    const cultKey = getSortableKey(item.cultivationStart, timeframe);
    if (cultKey) {
      cultAgg[cultKey] = (cultAgg[cultKey] || 0) + units;
      allPeriods.add(cultKey);
    }

    // Process Harvesting
    const harvKey = getSortableKey(item.harvestingDate, timeframe);
    if (harvKey) {
      harvAgg[harvKey] = (harvAgg[harvKey] || 0) + units;
      allPeriods.add(harvKey);
    }
  });

  // Prepare chronological timeline arrays for table & chart data streams
  const sortedPeriods = Array.from(allPeriods).sort();
  
  const summaryTableData = sortedPeriods.map((periodKey) => ({
    periodLabel: formatLabel(periodKey, timeframe),
    cultivated: cultAgg[periodKey] || 0,
    harvested: harvAgg[periodKey] || 0,
  }));

  const cultivationChartData = sortedPeriods
    .filter((p) => cultAgg[p] !== undefined)
    .map((p) => ({ name: formatLabel(p, timeframe), Amount: cultAgg[p] }));

  const harvestChartData = sortedPeriods
    .filter((p) => harvAgg[p] !== undefined)
    .map((p) => ({ name: formatLabel(p, timeframe), Amount: harvAgg[p] }));

  const renderContent = () => (
    <>
      {/* 1. Header Control Panel Card */}
      <Card className="shadow-sm border-0 rounded-4 p-4 mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div>
            <h4 className="fw-bold mb-1" style={{ color: "#1B5E20" }}>
              📊 Crop Metrics & Amount Summary
            </h4>
            <p className="text-muted mb-0 small">
              Analyzing data logs for: <strong className="text-success">{selectedCrop === "All" ? "All Crops Combined" : selectedCrop}</strong>
            </p>
          </div>
          
          <div className="d-flex gap-3 align-items-center flex-wrap">
            {/* ✅ ALWAYS VISIBLE DROPDOWN FILTER FOR SELECTING VEGETABLES */}
            <Dropdown onSelect={(val) => setSelectedCrop(val)}>
              <Dropdown.Toggle variant="outline-success" className="fw-bold py-2 px-3 shadow-sm d-flex align-items-center gap-2">
                {selectedCrop === "All" ? "🌱 Filter: All Crops" : `🌱 Crop: ${selectedCrop}`}
              </Dropdown.Toggle>
              <Dropdown.Menu style={{ maxHeight: "250px", overflowY: "auto" }} className="shadow border-0 mt-2">
                <Dropdown.Item eventKey="All" className="fw-bold text-success">Show All Crops Combined</Dropdown.Item>
                <Dropdown.Divider />
                {vegetables.map((veg, i) => (
                  <Dropdown.Item key={i} eventKey={veg}>{veg}</Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>

            {/* Timeframe Controls Switcher */}
            <ButtonGroup className="shadow-sm">
              <Button
                variant={timeframe === "week" ? "success" : "outline-success"}
                onClick={() => setTimeframe("week")}
                className="fw-bold py-2 px-3"
              >
                Weekly
              </Button>
              <Button
                variant={timeframe === "month" ? "success" : "outline-success"}
                onClick={() => setTimeframe("month")}
                className="fw-bold py-2 px-3"
              >
                Monthly
              </Button>
              <Button
                variant={timeframe === "year" ? "success" : "outline-success"}
                onClick={() => setTimeframe("year")}
                className="fw-bold py-2 px-3"
              >
                Yearly
              </Button>
            </ButtonGroup>
          </div>
        </div>
      </Card>

      {/* 2. Unified Trends Visualization Graphs */}
      <Row className="mb-4 g-4">
        {/* Left Graph: Cultivation Trends */}
        <Col lg={6}>
          <Card className="p-3 shadow-sm border-0 rounded-4 bg-white h-100">
            <h5 className="text-center fw-bold mb-3" style={{ color: "#2E7D32" }}>
              📈 Cultivation Trends ({selectedCrop})
            </h5>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={cultivationChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Amount" name="Cultivated (kg)" stroke="#2E7D32" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Right Graph: Harvesting Trends */}
        <Col lg={6}>
          <Card className="p-3 shadow-sm border-0 rounded-4 bg-white h-100">
            <h5 className="text-center fw-bold mb-3" style={{ color: "#D84315" }}>
              🌾 Harvesting Trends ({selectedCrop})
            </h5>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={harvestChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Amount" name="Harvested (kg)" stroke="#D84315" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 3. Detailed Summary Yield Matrix Table */}
      <Card className="shadow-sm border-0 rounded-4 p-4 bg-white">
        <h5 className="fw-bold mb-3" style={{ color: "#1B5E20" }}>
          📅 Detailed Yield Matrix Log
        </h5>
        {summaryTableData.length > 0 ? (
          <Table responsive bordered hover className="text-center align-middle mb-0">
            <thead className="table-success">
              <tr>
                <th style={{ width: '34%' }}>
                  {timeframe === "year" ? "Year" : timeframe === "month" ? "Month" : "Week"}
                </th>
                <th>Total Cultivated (kg)</th>
                <th>Expected Harvest (kg)</th>
              </tr>
            </thead>
            <tbody>
              {summaryTableData.map((data, index) => (
                <tr key={index}>
                  <td className="fw-bold text-dark">{data.periodLabel}</td>
                  <td className="text-success fw-semibold">
                    {data.cultivated.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg
                  </td>
                  <td className="text-danger fw-semibold">
                    {data.harvested.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p className="text-center text-muted my-4">No logged cultivation parameters exist for this selected crop frame.</p>
        )}
      </Card>
    </>
  );

  // Layout wrapper switcher based on layout context 
  return propsDeclarations === undefined ? (
    <Container className="mt-5 mb-5">{renderContent()}</Container>
  ) : (
    <div className="mt-2">{renderContent()}</div>
  );
};

export default AmountSummaryTable;