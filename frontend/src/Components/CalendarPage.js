// import React, { useEffect, useState } from "react";
// import Calendar from "react-calendar";
// import "react-calendar/dist/Calendar.css";
// import { Container, Row, Col, Form } from "react-bootstrap"; // Added Form
// import "../CSS/CalendarPage.css"; 

// const CalendarPage = () => {
//   const [declarations, setDeclarations] = useState([]);
//   const [selectedProduct, setSelectedProduct] = useState("All"); // NEW: State for selected crop

//   useEffect(() => {
//     const loadData = () => {
//       const data = JSON.parse(localStorage.getItem("declarations") || "[]");
//       setDeclarations(data);
//     };
//     loadData();
//     window.addEventListener("declarationsUpdated", loadData);
//     return () => window.removeEventListener("declarationsUpdated", loadData);
//   }, []);

//   // NEW: Get a list of unique products for the dropdown
//   const uniqueProducts = [...new Set(declarations.map(item => item.product).filter(Boolean))];

//   // ✅ HELPER: Get strictly local date string "YYYY-MM-DD"
//   const getLocalStr = (date) => {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");
//     return `${year}-${month}-${day}`;
//   };

//   const buildDateMap = (type) => {
//     const dateMap = {};

//     // NEW: Filter declarations based on the selected dropdown value
//     const filteredDeclarations = selectedProduct === "All" 
//       ? declarations 
//       : declarations.filter((item) => item.product === selectedProduct);

//     filteredDeclarations.forEach((item) => {
//       // 1. Get string dates (e.g., "2026-02-07")
//       const startStr = type === "cultivation" ? item.cultivationStart : item.harvestingStart;
//       const endStr = type === "cultivation" ? item.cultivationEnd : item.harvestingEnd;
//       const totalUnits = parseFloat(item.units) || 0;

//       if (!startStr || !endStr) return;

//       // 2. Create Date objects (Force local time to avoid shifts)
//       const startDate = new Date(startStr + "T00:00:00");
//       const endDate = new Date(endStr + "T00:00:00");

//       // 3. Calculate Duration
//       const diffTime = Math.abs(endDate - startDate);
//       const durationInDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

//       // 4. Calculate Daily Amount
//       const dailyUnits = totalUnits / (durationInDays || 1);

//       // 5. Loop through dates
//       const current = new Date(startDate);
//       while (current <= endDate) {
//         const dateKey = getLocalStr(current);

//         if (!dateMap[dateKey]) dateMap[dateKey] = 0;
//         dateMap[dateKey] += dailyUnits;

//         // Move to next day
//         current.setDate(current.getDate() + 1);
//       }
//     });

//     return dateMap;
//   };

//   const cultivationData = buildDateMap("cultivation");
//   const harvestData = buildDateMap("harvesting");

//   // Helper: Render content inside the tile
//   const renderTileContent = (dataMap) => ({ date, view }) => {
//     if (view !== "month") return null;
    
//     const dateStr = getLocalStr(date);
//     const amount = dataMap[dateStr];

//     return amount ? (
//       <div style={{ fontSize: "0.75rem", fontWeight: "bold", marginTop: "5px", lineHeight: "1" }}>
//         {amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}
//         <span style={{ fontSize: "0.55rem", fontWeight: "normal", marginLeft: "2px", opacity: 0.8 }}>
//           kg
//         </span>
//       </div>
//     ) : null;
//   };

//   // Helper: Assign classes for colors
//   const renderTileClass = (dataMap, baseClass) => ({ date, view }) => {
//     if (view !== "month") return null;
//     const dateStr = getLocalStr(date);
//     return dataMap[dateStr] ? baseClass : null;
//   };

//   return (
//     <Container className="mt-5 mb-5">
//       <h2 className="fw-bold mb-4 text-center">Cultivation & Harvest Calendars</h2>

//       {/* --- NEW: Filter Dropdown Section --- */}
//       <Row className="justify-content-center mb-4">
//         <Col md={4}>
//           <Form.Group className="shadow-sm p-3 rounded bg-white border">
//             <Form.Label className="fw-semibold text-secondary mb-2">Filter by Crop:</Form.Label>
//             <Form.Select 
//               value={selectedProduct} 
//               onChange={(e) => setSelectedProduct(e.target.value)}
//               className="fw-bold text-primary border-primary"
//             >
//               <option value="All">🌽 All Crops Combined</option>
//               {uniqueProducts.map((prod, index) => (
//                 <option key={index} value={prod}>{prod}</option>
//               ))}
//             </Form.Select>
//           </Form.Group>
//         </Col>
//       </Row>

//       <Row className="justify-content-center">
//         <Col md={5} className="mb-4">
//           <div className="p-3 shadow-sm rounded bg-white">
//             <h5 className="text-center mb-3 text-success fw-bold">Cultivation Phase</h5>
//             <Calendar
//               tileClassName={renderTileClass(cultivationData, "cultivation-tile")}
//               tileContent={renderTileContent(cultivationData)}
//             />
//           </div>
//         </Col>

//         <Col md={5} className="mb-4">
//           <div className="p-3 shadow-sm rounded bg-white">
//             <h5 className="text-center mb-3 text-danger fw-bold">Harvesting Phase</h5>
//             <Calendar
//               tileClassName={renderTileClass(harvestData, "harvest-tile")}
//               tileContent={renderTileContent(harvestData)}
//             />
//           </div>
//         </Col>
//       </Row>

//       <div className="mt-4 text-center p-3 bg-light rounded shadow-sm border">
//         <strong>Legend:</strong>
//         <span className="mx-3 text-success">
//           ● <strong>Cultivation:</strong> Daily expected activity
//         </span>
//         <span className="mx-3 text-danger">
//           ● <strong>Harvesting:</strong> Daily yield (Total / Days)
//         </span>
//       </div>
//     </Container>
//   );
// };

// export default CalendarPage;


import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Container, Row, Col, Dropdown } from "react-bootstrap";
import "../CSS/CalendarPage.css"; 

const CalendarPage = ({ selectedVeg, setSelectedVeg, vegetables }) => {
  const [declarations, setDeclarations] = useState([]);
  
  // ✅ Fallback state just in case this page is opened outside of the Dashboard
  const [localSelectedVeg, setLocalSelectedVeg] = useState("All");

  useEffect(() => {
    const loadData = () => {
      const data = JSON.parse(localStorage.getItem("declarations") || "[]");
      setDeclarations(data);
    };
    loadData();
    window.addEventListener("declarationsUpdated", loadData);
    return () => window.removeEventListener("declarationsUpdated", loadData);
  }, []);

  // ✅ 1. Determine which state to use (Dashboard Props OR Local State)
  const currentVeg = selectedVeg !== undefined ? selectedVeg : localSelectedVeg;
  const handleSetVeg = setSelectedVeg !== undefined ? setSelectedVeg : setLocalSelectedVeg;

  // ✅ 2. Provide a fallback vegetable list if props are missing
  const currentVegetables = vegetables || [...new Set(declarations.map(item => item.product).filter(Boolean))].sort();

  // ✅ HELPER: Get strictly local date string "YYYY-MM-DD"
  // This prevents the "missing day" bug caused by timezone shifts
  const getLocalStr = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const buildDateMap = (type) => {
    const dateMap = {};

    // Filter based on the currently selected dropdown value
    const filtered = currentVeg === "All" 
      ? declarations 
      : declarations.filter(item => item.product === currentVeg);

    filtered.forEach((item) => {
      const startStr = type === "cultivation" ? item.cultivationStart : item.harvestingStart;
      const endStr = type === "cultivation" ? item.cultivationEnd : item.harvestingEnd;
      const totalUnits = parseFloat(item.units) || 0;

      if (!startStr || !endStr) return;

      // Create Date objects (Force local time to avoid shifts)
      const startDate = new Date(startStr + "T00:00:00");
      const endDate = new Date(endStr + "T00:00:00");

      const diffTime = Math.abs(endDate - startDate);
      const durationInDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const dailyUnits = totalUnits / (durationInDays || 1);

      const current = new Date(startDate);
      while (current <= endDate) {
        const dateKey = getLocalStr(current);
        if (!dateMap[dateKey]) dateMap[dateKey] = 0;
        dateMap[dateKey] += dailyUnits;
        current.setDate(current.getDate() + 1);
      }
    });
    return dateMap;
  };

  const cultivationData = buildDateMap("cultivation");
  const harvestData = buildDateMap("harvesting");

  // Render the daily weight inside the calendar box
  const renderTileContent = (dataMap) => ({ date, view }) => {
    if (view !== "month") return null;
    const dateStr = getLocalStr(date);
    const amount = dataMap[dateStr];
    return amount ? (
      <div style={{ fontSize: "0.75rem", fontWeight: "bold", marginTop: "5px", lineHeight: "1" }}>
        {amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}
        <span style={{ fontSize: "0.55rem", fontWeight: "normal", marginLeft: "2px", opacity: 0.8 }}>kg</span>
      </div>
    ) : null;
  };

  // Add CSS classes for coloring the tiles
  const renderTileClass = (dataMap, baseClass) => ({ date, view }) => {
    if (view !== "month") return null;
    const dateStr = getLocalStr(date);
    return dataMap[dateStr] ? baseClass : null;
  };

  return (
    <Container className="mt-5 mb-5 p-0">
      <hr className="mb-5" />
      <h2 className="fw-bold mb-4 text-center">Cultivation & Harvest Calendars</h2>

      <Row className="justify-content-center mb-4">
        <Col md={4} className="text-center">
          <p className="text-muted mb-2 fw-semibold">Filter Calendar View:</p>
          <Dropdown onSelect={(val) => handleSetVeg(val)}>
            <Dropdown.Toggle variant="outline-primary" className="w-100 fw-bold">
              {currentVeg === "All" ? "All Crops Combined" : currentVeg}
            </Dropdown.Toggle>
            <Dropdown.Menu className="w-100" style={{ maxHeight: "300px", overflowY: "auto" }}>
              <Dropdown.Item eventKey="All">All Crops Combined</Dropdown.Item>
              {currentVegetables.map((veg, i) => (
                <Dropdown.Item key={i} eventKey={veg}>{veg}</Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col md={6} lg={5} className="mb-4">
          <div className="p-3 shadow-sm rounded bg-white border">
            <h5 className="text-center mb-3 text-success fw-bold">Cultivation Phase</h5>
            <Calendar
              tileClassName={renderTileClass(cultivationData, "cultivation-tile")}
              tileContent={renderTileContent(cultivationData)}
            />
          </div>
        </Col>

        <Col md={6} lg={5} className="mb-4">
          <div className="p-3 shadow-sm rounded bg-white border">
            <h5 className="text-center mb-3 text-danger fw-bold">Harvesting Phase</h5>
            <Calendar
              tileClassName={renderTileClass(harvestData, "harvest-tile")}
              tileContent={renderTileContent(harvestData)}
            />
          </div>
        </Col>
      </Row>

      <div className="mt-4 text-center p-3 bg-light rounded shadow-sm border">
        <strong>Legend:</strong>
        <span className="mx-3 text-success">● <strong>Cultivation:</strong> Expected Activity</span>
        <span className="mx-3 text-danger">● <strong>Harvesting:</strong> Daily Yield Estimate</span>
      </div>
    </Container>
  );
};

export default CalendarPage;