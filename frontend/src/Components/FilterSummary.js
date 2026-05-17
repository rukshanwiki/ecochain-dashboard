import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";

const FilterSummary = ({ selectedVeg = "All" }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [summary, setSummary] = useState(null);

  const handleFilter = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    const declarations = JSON.parse(localStorage.getItem("declarations") || "[]");

    let totalCultivated = 0;
    let totalHarvested = 0;

    // Set local midnights to prevent timezone shift bugs
    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T00:00:00");

    // 1. Filter data by the globally selected vegetable first
    const targetCrops = selectedVeg === "All" 
      ? declarations 
      : declarations.filter(item => item.product?.trim().toLowerCase() === selectedVeg.trim().toLowerCase());

    targetCrops.forEach((item) => {
      const totalUnits = parseFloat(item.units) || 0;

      // 2. Precise Cultivation Range Calculation
      if (item.cultivationStart && item.cultivationEnd) {
        const cStart = new Date(item.cultivationStart + "T00:00:00");
        const cEnd = new Date(item.cultivationEnd + "T00:00:00");

        // Check if item timeline overlaps with chosen filter range
        if (cStart <= end && cEnd >= start) {
          // Find the exact subset of days matching inside your range
          const intersectStart = new Date(Math.max(cStart, start));
          const intersectEnd = new Date(Math.min(cEnd, end));
          
          const overlapDays = Math.ceil((intersectEnd - intersectStart) / (1000 * 60 * 60 * 24)) + 1;
          const totalDuration = Math.ceil((cEnd - cStart) / (1000 * 60 * 60 * 24)) + 1;

          // Pro-rate: Only add units matching the duration inside the range
          totalCultivated += (overlapDays / (totalDuration || 1)) * totalUnits;
        }
      }

      // 3. Precise Harvesting Range Calculation
      if (item.harvestingStart && item.harvestingEnd) {
        const hStart = new Date(item.harvestingStart + "T00:00:00");
        const hEnd = new Date(item.harvestingEnd + "T00:00:00");

        if (hStart <= end && hEnd >= start) {
          const intersectStart = new Date(Math.max(hStart, start));
          const intersectEnd = new Date(Math.min(hEnd, end));

          const overlapDays = Math.ceil((intersectEnd - intersectStart) / (1000 * 60 * 60 * 24)) + 1;
          const totalDuration = Math.ceil((hEnd - hStart) / (1000 * 60 * 60 * 24)) + 1;

          totalHarvested += (overlapDays / (totalDuration || 1)) * totalUnits;
        }
      }
    });

    setSummary({ totalCultivated, totalHarvested });
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setSummary(null);
  };

  return (
    <Container className="mt-5 mb-5 p-0">
      <h4 className="fw-bold mb-4" style={{ color: "#1B5E20" }}>
        🔍 Filter Volume by Date Range ({selectedVeg === "All" ? "All Crops" : selectedVeg})
      </h4>
      <Row className="align-items-end g-3">
        <Col md={3}>
          <Form.Group>
            <Form.Label className="fw-semibold text-secondary">Start Date</Form.Label>
            <Form.Control type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label className="fw-semibold text-secondary">End Date</Form.Label>
            <Form.Control type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </Form.Group>
        </Col>
        
        <Col md="auto">
          <Button 
            variant="success" 
            onClick={handleFilter} 
            className="px-4 fw-bold"
            style={{ backgroundColor: "#1B5E20", borderColor: "#1B5E20" }}
          >
            Filter Data
          </Button>
        </Col>
        
        <Col md="auto">
          <Button variant="outline-secondary" onClick={handleReset} className="px-4 fw-bold">
            Reset Fields
          </Button>
        </Col>
      </Row>

      {summary && (
        <Alert variant="info" className="mt-4 border-0 shadow-sm rounded-3 bg-light text-dark" style={{ borderLeft: "5px solid #1B5E20" }}>
          {/* ✅ CHANGED: Replaced 'units' label text with 'kg' */}
          <p className="mb-2">🌱 <strong>Total Cultivated Amount:</strong> {summary.totalCultivated.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg</p>
          <p className="mb-0">🌾 <strong>Total Harvested Amount:</strong> {summary.totalHarvested.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg</p>
        </Alert>
      )}
    </Container>
  );
};

export default FilterSummary;