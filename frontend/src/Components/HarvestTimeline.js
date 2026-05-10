import React, { useState } from "react";
import { Card, Button, Row, Col } from "react-bootstrap";
import { FaChevronLeft, FaChevronRight, FaTractor } from "react-icons/fa";

// 🛑 STATIC DEMAND DATA: Replace this with your actual DB/Backend data later!
const dailyDemand = {
  "Pumpkin": 270,
  "Tomato": 500,
  "Carrot": 350,
  "Cabbage": 400,
  "Onion": 600,
  "Brinjal (Eggplant)": 300,
  "Okra": 250,
  "Beans": 320,
  "Cucumber": 200,
  "Radish": 150,
  "Leeks": 450,
  "Spinach": 100
};

const HarvestTimeline = ({ declarations }) => {
  const [centerDate, setCenterDate] = useState(new Date());

  const getDateStr = (date) => date.toISOString().split("T")[0];

  const isSameDay = (d1, d2) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const getStatsForDate = (date) => {
    const dateStr = getDateStr(date);
    const dailyStats = {};
    
    declarations.forEach((item) => {
      if (!item.harvestingStart || !item.harvestingEnd || !item.units || !item.product) return;

      if (dateStr >= item.harvestingStart && dateStr <= item.harvestingEnd) {
        const start = new Date(item.harvestingStart);
        const end = new Date(item.harvestingEnd);
        const diffTime = Math.abs(end - start);
        const durationInDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 

        const dailyUnits = parseFloat(item.units) / (durationInDays || 1);

        if (!dailyStats[item.product]) {
          dailyStats[item.product] = 0;
        }
        dailyStats[item.product] += dailyUnits;
      }
    });

    return dailyStats;
  };

  const shiftDate = (days) => {
    const newDate = new Date(centerDate);
    newDate.setDate(newDate.getDate() + days);
    setCenterDate(newDate);
  };

  const generateDays = () => {
    const days = [];
    for (let i = -3; i <= 3; i++) { 
      const d = new Date(centerDate);
      d.setDate(d.getDate() + i);
      days.push({ date: d, offset: i });
    }
    return days;
  };

  return (
    <div className="timeline-container mb-4">
      <div className="d-flex justify-content-between align-items-center mb-2 px-4">
        <h4 className="fw-bold text-dark"><FaTractor className="me-2" />Harvest Timeline</h4>
        <Button variant="outline-success" size="sm" onClick={() => setCenterDate(new Date())}>
          Jump to Today
        </Button>
      </div>

      <div className="d-flex align-items-center justify-content-center p-3 position-relative">
        <Button variant="link" className="text-decoration-none fs-2 text-dark" onClick={() => shiftDate(-1)}>
          <FaChevronLeft />
        </Button>

        <div className="w-100 overflow-hidden" style={{ minHeight: "200px", padding: "10px 0" }}>
          <Row className="flex-nowrap justify-content-center align-items-center h-100">
            {generateDays().map((item) => {
              const { date, offset } = item;
              const isCenter = offset === 0;
              
              const stats = getStatsForDate(date);
              const hasData = Object.keys(stats).length > 0;
              
              const realToday = new Date();
              const isActuallyToday = isSameDay(date, realToday);
              const dayName = isActuallyToday ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" });
              const dateDisplay = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

              return (
                <Col 
                  key={getDateStr(date)} 
                  className="d-flex justify-content-center transition-col"
                  style={{ 
                    flex: "0 0 auto", 
                    width: isCenter ? "170px" : "115px", 
                    transition: "all 0.5s ease" 
                  }}
                >
                  <Card 
                    className={`timeline-card w-100 ${isCenter ? "timeline-center" : "timeline-side"}`}
                    onClick={() => shiftDate(offset)}
                    style={{ minHeight: "150px" }}
                  >
                    <Card.Body className="d-flex flex-column align-items-center p-2 text-center">
                      <small className="text-uppercase fw-bold mb-1" style={{ opacity: 0.7 }}>
                        {dayName}
                      </small>
                      <div className="fw-bold" style={{ fontSize: isCenter ? "1.2rem" : "0.9rem" }}>
                        {dateDisplay}
                      </div>
                      <hr style={{ width: "50%", margin: "8px 0", opacity: 0.3, borderColor: isCenter ? '#28a745' : '#6c757d' }} />
                      
                      {/* ✅ Added 'kg' to both actual data and default empty states */}
                      {hasData ? (
                        <div className="w-100 d-flex flex-column align-items-center mt-1" style={{ overflowY: "auto", maxHeight: "80px" }}>
                          {Object.entries(stats).map(([product, amount]) => {
                            const target = dailyDemand[product] || 0;
                            const isOverSupply = amount > target;
                            
                            return (
                              <div key={product} className={`fw-bold ${isOverSupply ? "text-danger" : "text-success"}`} style={{ fontSize: isCenter ? "1.6rem" : "1.1rem", lineHeight: "1.2" }}>
                                {amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                <span className="text-muted ms-1" style={{ fontSize: isCenter ? "1rem" : "0.75rem", fontWeight: "normal" }}>
                                  / {target} kg
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-muted mt-1" style={{ fontWeight: "bold", fontSize: isCenter ? "1.6rem" : "1.1rem" }}>
                          0 <small style={{ fontSize: "0.7rem", opacity: 0.8, fontWeight:"normal" }}>kg</small>
                        </div>
                      )}

                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </div>

        <Button variant="link" className="text-decoration-none fs-2 text-dark" onClick={() => shiftDate(1)}>
          <FaChevronRight />
        </Button>
      </div>
    </div>
  );
};

export default HarvestTimeline;