import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Container, Row, Col } from "react-bootstrap";
import "../CSS/CalendarPage.css"; 

const CalendarPage = () => {
  const [declarations, setDeclarations] = useState([]);

  useEffect(() => {
    const loadData = () => {
      const data = JSON.parse(localStorage.getItem("declarations") || "[]");
      setDeclarations(data);
    };
    loadData();
    window.addEventListener("declarationsUpdated", loadData);
    return () => window.removeEventListener("declarationsUpdated", loadData);
  }, []);

  // ✅ HELPER: Get strictly local date string "YYYY-MM-DD"
  // This prevents the "missing day" bug caused by timezone shifts (toISOString)
  const getLocalStr = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const buildDateMap = (type) => {
    const dateMap = {};

    declarations.forEach((item) => {
      // 1. Get string dates (e.g., "2026-02-07")
      const startStr = type === "cultivation" ? item.cultivationStart : item.harvestingStart;
      const endStr = type === "cultivation" ? item.cultivationEnd : item.harvestingEnd;
      const totalUnits = parseFloat(item.units) || 0;

      if (!startStr || !endStr) return;

      // 2. Create Date objects (Force local time to avoid shifts)
      // appending "T00:00:00" ensures browser treats it as local start of day
      const startDate = new Date(startStr + "T00:00:00");
      const endDate = new Date(endStr + "T00:00:00");

      // 3. Calculate Duration
      const diffTime = Math.abs(endDate - startDate);
      const durationInDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      // 4. Calculate Daily Amount
      const dailyUnits = totalUnits / (durationInDays || 1);

      // 5. Loop through dates
      const current = new Date(startDate);
      while (current <= endDate) {
        // Use the FIX here: getLocalStr instead of toISOString
        const dateKey = getLocalStr(current);

        if (!dateMap[dateKey]) dateMap[dateKey] = 0;
        dateMap[dateKey] += dailyUnits;

        // Move to next day
        current.setDate(current.getDate() + 1);
      }
    });

    return dateMap;
  };

  const cultivationData = buildDateMap("cultivation");
  const harvestData = buildDateMap("harvesting");

  // Helper: Render content inside the tile
  const renderTileContent = (dataMap) => ({ date, view }) => {
    if (view !== "month") return null;
    
    // Use the same helper to match keys
    const dateStr = getLocalStr(date);
    const amount = dataMap[dateStr];

    // ✅ FIX: Show 1 decimal place AND added "kg" with slightly smaller font to fit the box
    return amount ? (
      <div style={{ fontSize: "0.75rem", fontWeight: "bold", marginTop: "5px", lineHeight: "1" }}>
        {amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}
        <span style={{ fontSize: "0.55rem", fontWeight: "normal", marginLeft: "2px", opacity: 0.8 }}>
          kg
        </span>
      </div>
    ) : null;
  };

  // Helper: Assign classes for colors
  const renderTileClass = (dataMap, baseClass) => ({ date, view }) => {
    if (view !== "month") return null;
    const dateStr = getLocalStr(date);
    return dataMap[dateStr] ? baseClass : null;
  };

  return (
    <Container className="mt-5 mb-5">
      <h2 className="fw-bold mb-4 text-center">Cultivation & Harvest Calendars</h2>

      <Row className="justify-content-center">
        <Col md={5} className="mb-4">
          <div className="p-3 shadow-sm rounded bg-white">
            <h5 className="text-center mb-3 text-success fw-bold">Cultivation Phase</h5>
            <Calendar
              tileClassName={renderTileClass(cultivationData, "cultivation-tile")}
              tileContent={renderTileContent(cultivationData)}
            />
          </div>
        </Col>

        <Col md={5} className="mb-4">
          <div className="p-3 shadow-sm rounded bg-white">
            <h5 className="text-center mb-3 text-danger fw-bold">Harvesting Phase</h5>
            <Calendar
              tileClassName={renderTileClass(harvestData, "harvest-tile")}
              tileContent={renderTileContent(harvestData)}
            />
          </div>
        </Col>
      </Row>

      <div className="mt-4 text-center p-3 bg-light rounded">
        <strong>Legend:</strong>
        <span className="mx-3 text-success">
          ● <strong>Cultivation:</strong> Daily expected activity
        </span>
        <span className="mx-3 text-danger">
          ● <strong>Harvesting:</strong> Daily yield (Total / Days)
        </span>
      </div>
    </Container>
  );
};

export default CalendarPage;