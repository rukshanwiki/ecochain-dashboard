// import React, { useEffect, useState } from "react";
// import Calendar from "react-calendar";
// import "react-calendar/dist/Calendar.css";
// import { Container, Row, Col, Dropdown } from "react-bootstrap";
// import "../CSS/CalendarPage.css"; 
// import FilterSummary from "./FilterSummary";

// const CalendarPage = ({ selectedVeg, setSelectedVeg, vegetables }) => {
//   const [declarations, setDeclarations] = useState([]);
  
//   // ✅ Fallback state just in case this page is opened outside of the Dashboard
//   const [localSelectedVeg, setLocalSelectedVeg] = useState("All");

//   useEffect(() => {
//     const loadData = () => {
//       const data = JSON.parse(localStorage.getItem("declarations") || "[]");
//       setDeclarations(data);
//     };
//     loadData();
//     window.addEventListener("declarationsUpdated", loadData);
//     return () => window.removeEventListener("declarationsUpdated", loadData);
//   }, []);

//   // ✅ 1. Determine which state to use (Dashboard Props OR Local State)
//   const currentVeg = selectedVeg !== undefined ? selectedVeg : localSelectedVeg;
//   const handleSetVeg = setSelectedVeg !== undefined ? setSelectedVeg : setLocalSelectedVeg;

//   // ✅ 2. Mandatory fixed list of vegetables requested
//   const defaultVegList = [
//     "Carrot", "Tomato", "Cabbage", "Onion", "Pumpkin", "Brinjal (Eggplant)",
//     "Okra", "Beans", "Cucumber", "Radish", "Leeks", "Spinach"
//   ];

//   // ✅ 3. Merge default list with any unique items existing in local storage declarations
//   const currentVegetables = vegetables || [...new Set([
//     ...defaultVegList,
//     ...declarations.map(item => item.product).filter(Boolean)
//   ])].sort();

//   // ✅ HELPER: Get strictly local date string "YYYY-MM-DD"
//   const getLocalStr = (date) => {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");
//     return `${year}-${month}-${day}`;
//   };

//   const buildDateMap = (type) => {
//     const dateMap = {};

//     // Filter based on the currently selected dropdown value
//     const filtered = currentVeg === "All" 
//       ? declarations 
//       : declarations.filter(item => item.product?.trim().toLowerCase() === currentVeg.trim().toLowerCase());

//     filtered.forEach((item) => {
//       const startStr = type === "cultivation" ? item.cultivationStart : (item.harvestingDate || item.harvestingStart);
//       const endStr = type === "cultivation" ? item.cultivationEnd : item.harvestingEnd;
//       const totalUnits = parseFloat(item.units) || 0;

//       if (!startStr || !endStr) return;

//       // Create Date objects (Force local time to avoid shifts)
//       const startDate = new Date(startStr + "T00:00:00");
//       const endDate = new Date(endStr + "T00:00:00");

//       const diffTime = Math.abs(endDate - startDate);
//       const durationInDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
//       const dailyUnits = totalUnits / (durationInDays || 1);

//       const current = new Date(startDate);
//       while (current <= endDate) {
//         const dateKey = getLocalStr(current);
//         if (!dateMap[dateKey]) dateMap[dateKey] = 0;
//         dateMap[dateKey] += dailyUnits;
//         current.setDate(current.getDate() + 1);
//       }
//     });
//     return dateMap;
//   };

//   const cultivationData = buildDateMap("cultivation");
//   const harvestData = buildDateMap("harvesting");

//   // Render the daily weight inside the calendar box
//   const renderTileContent = (dataMap) => ({ date, view }) => {
//     if (view !== "month") return null;
//     const dateStr = getLocalStr(date);
//     const amount = dataMap[dateStr];
//     return amount ? (
//       <div style={{ fontSize: "0.75rem", fontWeight: "bold", marginTop: "5px", lineHeight: "1" }}>
//         {amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 1 })}
//         <span style={{ fontSize: "0.55rem", fontWeight: "normal", marginLeft: "2px", opacity: 0.8 }}>kg</span>
//       </div>
//     ) : null;
//   };

//   // Add CSS classes for coloring the tiles
//   const renderTileClass = (dataMap, baseClass) => ({ date, view }) => {
//     if (view !== "month") return null;
//     const dateStr = getLocalStr(date);
//     return dataMap[dateStr] ? baseClass : null;
//   };

//   return (
//     <Container className="mt-5 mb-5 p-0">
//       <h2 className="fw-bold mb-4 text-left" style={{ color: "#1B5E20" }}>Cultivation & Harvest Calendars</h2>

//       {/* Dropdown Container */}
//       <Row className="justify-content-left mb-4">
//         <Col md={4} className="text-center">
//           <Dropdown onSelect={(val) => handleSetVeg(val)}>
//             <Dropdown.Toggle variant="outline-success" className="w-100 fw-bold">
//               {currentVeg === "All" ? "All Crops Combined" : `🌱 ${currentVeg}`}
//             </Dropdown.Toggle>
//             <Dropdown.Menu className="w-100" style={{ maxHeight: "300px", overflowY: "auto" }}>
//               <Dropdown.Item eventKey="All" className="fw-bold text-success">All Crops Combined</Dropdown.Item>
//               <Dropdown.Divider />
//               {currentVegetables.map((veg, i) => (
//                 <Dropdown.Item key={i} eventKey={veg}>{veg}</Dropdown.Item>
//               ))}
//             </Dropdown.Menu>
//           </Dropdown>
//         </Col>
//       </Row>

//       <Row className="justify-content-center">
//         <Col md={6} lg={5} className="mb-4">
//           <div className="p-3 shadow-sm rounded bg-white border border-2" style={{ borderColor: "#E8F5E9" }}>
//             <h5 className="text-center mb-3 text-success fw-bold">Cultivation Phase</h5>
//             <Calendar
//               tileClassName={renderTileClass(cultivationData, "cultivation-tile")}
//               tileContent={renderTileContent(cultivationData)}
//             />
//           </div>
//         </Col>

//         <Col md={6} lg={5} className="mb-4">
//           <div className="p-3 shadow-sm rounded bg-white border border-2" style={{ borderColor: "#FFEBEE" }}>
//             <h5 className="text-center mb-3 text-danger fw-bold">Harvesting Phase</h5>
//             <Calendar
//               tileClassName={renderTileClass(harvestData, "harvest-tile")}
//               tileContent={renderTileContent(harvestData)}
//             />
//           </div>
//         </Col>
//       </Row>

//       {/* ✅ FIX: Changed selectedVeg={selectedVeg} to selectedVeg={currentVeg} */}
//       <FilterSummary selectedVeg={currentVeg} />
//     </Container>
//   );
// };

// export default CalendarPage;



import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Container, Row, Col, Dropdown } from "react-bootstrap";
import "../CSS/CalendarPage.css"; 
import FilterSummary from "./FilterSummary";

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

  // ✅ 2. Mandatory fixed list of vegetables requested
  const defaultVegList = [
    "Carrot", "Tomato", "Cabbage", "Onion", "Pumpkin", "Brinjal (Eggplant)",
    "Okra", "Beans", "Cucumber", "Radish", "Leeks", "Spinach"
  ];

  // ✅ 3. Merge default list with any unique items existing in local storage declarations
  const currentVegetables = vegetables || [...new Set([
    ...defaultVegList,
    ...declarations.map(item => item.product).filter(Boolean)
  ])].sort();

  // ✅ HELPER: Get strictly local date string "YYYY-MM-DD"
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
      : declarations.filter(item => item.product?.trim().toLowerCase() === currentVeg.trim().toLowerCase());

    filtered.forEach((item) => {
      // 1. Get Start Date
      const startStr = type === "cultivation" ? item.cultivationStart : (item.harvestingDate || item.harvestStart);
      
      // 2. Get End Date, but FALLBACK to Start Date if it's missing (fixes old broken test data!)
      let endStr = type === "cultivation" ? item.cultivationEnd : item.harvestingEnd;
      if (!endStr) {
        endStr = startStr; 
      }

      const totalUnits = parseFloat(item.units) || 0;

      // Skip if there's no valid start date at all
      if (!startStr) return;

      // 3. Create Date objects (Force local time to avoid shifts)
      const startDate = new Date(startStr + "T00:00:00");
      const endDate = new Date(endStr + "T00:00:00");

      // 4. Calculate accurate daily distribution
      const diffTime = Math.abs(endDate - startDate);
      const durationInDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const dailyUnits = totalUnits / (durationInDays || 1);

      // 5. Apply the math to the calendar dates
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
      <h2 className="fw-bold mb-4 text-left" style={{ color: "#1B5E20" }}>Cultivation & Harvest Calendars</h2>

      {/* Dropdown Container */}
      <Row className="justify-content-left mb-4">
        <Col md={4} className="text-center">
          <Dropdown onSelect={(val) => handleSetVeg(val)}>
            <Dropdown.Toggle variant="outline-success" className="w-100 fw-bold">
              {currentVeg === "All" ? "All Crops Combined" : `🌱 ${currentVeg}`}
            </Dropdown.Toggle>
            <Dropdown.Menu className="w-100" style={{ maxHeight: "300px", overflowY: "auto" }}>
              <Dropdown.Item eventKey="All" className="fw-bold text-success">All Crops Combined</Dropdown.Item>
              <Dropdown.Divider />
              {currentVegetables.map((veg, i) => (
                <Dropdown.Item key={i} eventKey={veg}>{veg}</Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>

      <Row className="justify-content-center">
        <Col md={6} lg={5} className="mb-4">
          <div className="p-3 shadow-sm rounded bg-white border border-2" style={{ borderColor: "#E8F5E9" }}>
            <h5 className="text-center mb-3 text-success fw-bold">Cultivation Phase</h5>
            <Calendar
              tileClassName={renderTileClass(cultivationData, "cultivation-tile")}
              tileContent={renderTileContent(cultivationData)}
            />
          </div>
        </Col>

        <Col md={6} lg={5} className="mb-4">
          <div className="p-3 shadow-sm rounded bg-white border border-2" style={{ borderColor: "#FFEBEE" }}>
            <h5 className="text-center mb-3 text-danger fw-bold">Harvesting Phase</h5>
            <Calendar
              tileClassName={renderTileClass(harvestData, "harvest-tile")}
              tileContent={renderTileContent(harvestData)}
            />
          </div>
        </Col>
      </Row>

      {/* ✅ FIX: Changed selectedVeg={selectedVeg} to selectedVeg={currentVeg} */}
      <FilterSummary selectedVeg={currentVeg} />
    </Container>
  );
};

export default CalendarPage;