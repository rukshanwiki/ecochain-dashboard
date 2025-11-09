import React, { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";

const FilterSummary = () => {
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

    const start = new Date(startDate);
    const end = new Date(endDate);

    declarations.forEach((item) => {
      const cStart = new Date(item.cultivationStart);
      const cEnd = new Date(item.cultivationEnd);
      const hStart = new Date(item.harvestingStart);
      const hEnd = new Date(item.harvestingEnd);

      // cultivation overlap
      if (cStart <= end && cEnd >= start) {
        totalCultivated += parseFloat(item.units);
      }

      // harvesting overlap
      if (hStart <= end && hEnd >= start) {
        totalHarvested += parseFloat(item.units);
      }
    });

    setSummary({ totalCultivated, totalHarvested });
  };

  return (
    <Container className="mt-5">
      <h3 className="fw-bold mb-4">Filter by Date Range</h3>
      <Row className="align-items-end">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Start Date</Form.Label>
            <Form.Control type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <Form.Label>End Date</Form.Label>
            <Form.Control type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </Form.Group>
        </Col>
        <Col md="auto">
          <Button variant="primary" onClick={handleFilter}>
            Filter
          </Button>
        </Col>
      </Row>

      {summary && (
        <Alert variant="info" className="mt-4">
          🌱 <strong>Total Cultivated Area:</strong> {summary.totalCultivated} acres <br />
          🌾 <strong>Total Harvested Area:</strong> {summary.totalHarvested} acres
        </Alert>
      )}
    </Container>
  );
};

export default FilterSummary;
