import React, { useEffect, useState } from "react";
import { Container, Row, Col, Dropdown, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import CultivationMap from "./CultivationMap";
import CalendarPage from "./CalendarPage";
import FilterSummary from "./FilterSummary";
import "../CSS/Dashboard.css";

const Dashboard = () => {
  const [selectedVeg, setSelectedVeg] = useState("All");
  const [allDeclarations, setAllDeclarations] = useState([]);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ Load user name from localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.fullName) {
      setUserName(user.fullName);
    }

    // ✅ Load declarations
    const load = () => {
      const data = JSON.parse(localStorage.getItem("declarations") || "[]");
      setAllDeclarations(data);
    };
    load();
    window.addEventListener("declarationsUpdated", load);
    return () => window.removeEventListener("declarationsUpdated", load);
  }, []);

  const productSet = new Set(allDeclarations.map(d => (d.product || "").trim()).filter(Boolean));
  const productsFromData = Array.from(productSet).sort();

  const defaultVegList = [
    "Carrot","Tomato","Cabbage","Onion","Pumpkin","Brinjal (Eggplant)",
    "Okra","Beans","Cucumber","Radish","Leeks","Spinach"
  ];
  const vegetables = [...new Set([...productsFromData, ...defaultVegList])];

  const handleSelect = (eventKey) => setSelectedVeg(eventKey);

  const filteredLocations = allDeclarations.filter(item => {
    if (!item || !item.product) return false;
    if (selectedVeg === "All") return true;
    return item.product.trim().toLowerCase() === selectedVeg.trim().toLowerCase();
  });

  return (
    <Container className="mt-5">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">
            Welcome {userName ? userName.split(" ")[0] : "Farmer"}
          </h2>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={6}>
          <Dropdown onSelect={handleSelect}>
            <Dropdown.Toggle variant="success" id="dropdown-basic" className="custom-dropdown" style={{ textAlign: "left" }}>
              {selectedVeg === "All" ? "Show All" : selectedVeg}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item eventKey="All">Show All</Dropdown.Item>
              {vegetables.map((veg, i) => (
                <Dropdown.Item key={i} eventKey={veg}>{veg}</Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Col>

        <Col className="text-end">
          <Button variant="primary" size="lg" onClick={() => navigate("/product-declaration")}>
            ➕ Add Your Product
          </Button>
        </Col>
      </Row>

      <div style={{ textAlign: "left", margin: "4rem 30px" }}>
        <h2 style={{ marginBottom: "1rem", marginLeft: "4rem" }}>Cultivation Map</h2>
        <div style={{ display: "flex", justifyContent: "center", margin: "2rem 0" }}>
          <CultivationMap locations={filteredLocations} />
        </div>
      </div>

      <FilterSummary />
      <CalendarPage />
    </Container>
  );
};

export default Dashboard;
