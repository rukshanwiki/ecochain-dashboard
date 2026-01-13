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

  const buildDateMap = (type) => {
    const dateInfo = {};
    declarations.forEach((item) => {
      const start = type === "cultivation" ? item.cultivationStart : item.harvestingStart;
      const end = type === "cultivation" ? item.cultivationEnd : item.harvestingEnd;
      if (!start || !end) return;
      const startDate = new Date(start);
      const endDate = new Date(end);
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0];
        if (!dateInfo[dateStr]) dateInfo[dateStr] = [];
        dateInfo[dateStr].push(item.units || 0);
      }
    });
    return dateInfo;
  };

  const cultivationDates = buildDateMap("cultivation");
  const harvestDates = buildDateMap("harvest");

  const tileContent = (dateInfo) => ({ date, view }) => {
    if (view !== "month") return null;
    const dateStr = date.toISOString().split("T")[0];
    const totalUnits = dateInfo[dateStr]?.reduce((a, b) => a + b, 0);
    return totalUnits
      ? <div style={{ fontSize: "0.7rem", color: "#28a745" }}>{totalUnits} units</div>
      : null;
  };

  const tileClassName = (dateInfo, colorClass) => ({ date, view }) => {
    if (view !== "month") return null;
    const dateStr = date.toISOString().split("T")[0];
    return dateInfo[dateStr] ? colorClass : null;
  };

  return (
    <Container className="mt-5">
      <h2 className="fw-bold mb-4">Cultivation & Harvest Calendars</h2>

      <Row className="justify-content-center">
        <Col md={5}>
          <h5 className="text-center mb-3">Cultivation Calendar</h5>
          <Calendar
            tileClassName={tileClassName(cultivationDates, "cultivation-date")}
            tileContent={tileContent(cultivationDates)}
          />
        </Col>

        <Col md={5}>
          <h5 className="text-center mb-3">Harvesting Calendar</h5>
          <Calendar
            tileClassName={tileClassName(harvestDates, "harvest-date")}
            tileContent={tileContent(harvestDates)}
          />
        </Col>
      </Row>

      <div className="mt-4 text-center">
        <strong>Legend:</strong>
        <span style={{ color: "green", marginLeft: "10px" }}>● Cultivation Dates</span>
        <span style={{ color: "red", marginLeft: "10px" }}>● Harvest Dates</span>
      </div>
    </Container>
  );
};

export default CalendarPage;
