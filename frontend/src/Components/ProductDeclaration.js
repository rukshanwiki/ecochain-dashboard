import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useNavigate } from "react-router-dom";

const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function LocationPicker({ setSelectedLocation }) {
  useMapEvents({
    click(e) {
      setSelectedLocation(e.latlng);
    },
  });
  return null;
}

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

const ProductDeclaration = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    product: "",
    area: "",
    units: "",
    cultivationStart: "",
    cultivationEnd: "",
    harvestingYear: "",
    harvestingMonth: "",
    harvestingWeek: "",
    locationText: "",
    comments: "",
  });

  const [selectedLocation, setSelectedLocation] = useState(null);

  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  // Automatically calculate units when area or product changes
  useEffect(() => {
    if (formData.product && formData.area) {
      const rate = conversionRates[formData.product] || 100;
      setFormData(prev => ({ ...prev, units: formData.area * rate }));
    }
  }, [formData.product, formData.area]);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const getHarvestingRange = () => {
    const { harvestingYear, harvestingMonth, harvestingWeek } = formData;
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedLocation) {
      alert("Please pick a location on the map before submitting.");
      return;
    }

    const harvestRange = getHarvestingRange();

    const newEntry = {
      id: Date.now(),
      ...formData,
      harvestingStart: harvestRange ? harvestRange.start.toISOString().split("T")[0] : "",
      harvestingEnd: harvestRange ? harvestRange.end.toISOString().split("T")[0] : "",
      location: {
        lat: Number(selectedLocation.lat),
        lng: Number(selectedLocation.lng),
      }
    };

    const existing = JSON.parse(localStorage.getItem("declarations") || "[]");
    existing.push(newEntry);
    localStorage.setItem("declarations", JSON.stringify(existing));

    window.dispatchEvent(new Event("declarationsUpdated"));
    navigate("/dashboard");
  };

  const handleCancel = () => {
    setFormData({
      product: "",
      area: "",
      units: "",
      cultivationStart: "",
      cultivationEnd: "",
      harvestingYear: "",
      harvestingMonth: "",
      harvestingWeek: "",
      locationText: "",
      comments: "",
    });
    setSelectedLocation(null);
  };

  return (
    <Container className="mt-5 mb-5">
      
      {/* --- ROW 1: TITLE --- */}
      <Row className="mb-3">
        <Col>
          <h3 className="fw-bold text-secondary">Product Declaration</h3>
        </Col>
      </Row>

      {/* --- ROW 2: CENTERED BUTTON --- */}
      <Row className="mb-5 justify-content-center">
        <Col xs="auto">
          <Button 
            variant="success" 
            onClick={() => navigate("/forecasting")}
            className="shadow-sm"
            style={{ 
              fontSize: "1.1rem",       
              padding: "12px 0",         // Thin vertical padding
              width: "700px",           // Wide fixed width
              borderRadius: "25px",     
              border: "1px solid #145c26", 
              fontWeight: "600",
              letterSpacing: "1px"
            }}
          >
            📊 Check Forecasting
          </Button>
        </Col>
      </Row>
      {/* ----------------------------------------------- */}

      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={4} className="me-5">
            <Form.Group>
              <Form.Label>Select Product</Form.Label>
              <Form.Select name="product" value={formData.product} onChange={handleChange} required>
                <option value="">Select a product</option>
                {Object.keys(conversionRates).map((prod, i) => (
                  <option key={i} value={prod}>{prod}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3} style={{ marginLeft: "189px" }}>
            <Form.Group>
              <Form.Label>Area of Cultivating (Hectares)</Form.Label>
              <Form.Control
                type="number"
                name="area"
                value={formData.area}
                onChange={handleChange}
                min="0.1"
                step="0.1"
                placeholder="Ex: 2"
                required
              />
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>Calculated Units</Form.Label>
              <Form.Control type="number" value={formData.units} readOnly />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={5} className="me-5">
            <Form.Group>
              <Form.Label>Cultivation Period</Form.Label>
              <div className="d-flex align-items-center gap-2">
                <Form.Control
                  type="date"
                  name="cultivationStart"
                  value={formData.cultivationStart}
                  onChange={handleChange}
                  required
                />
                <span>to</span>
                <Form.Control
                  type="date"
                  name="cultivationEnd"
                  min={formData.cultivationStart}
                  value={formData.cultivationEnd}
                  onChange={handleChange}
                  required
                />
              </div>
            </Form.Group>
          </Col>

          <Col md={5} style={{ marginLeft: "94px" }}>
            <Form.Group>
              <Form.Label>Harvesting Period (Year, Month, Week)</Form.Label>
              <div className="d-flex align-items-center gap-2">
                <Form.Select name="harvestingYear" value={formData.harvestingYear} onChange={handleChange} required>
                  <option value="">Year</option>
                  {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
                </Form.Select>
                <Form.Select name="harvestingMonth" value={formData.harvestingMonth} onChange={handleChange} required>
                  <option value="">Month</option>
                  {months.map((m, i) => <option key={i} value={m}>{m}</option>)}
                </Form.Select>
                <Form.Select name="harvestingWeek" value={formData.harvestingWeek} onChange={handleChange} required>
                  <option value="">Week</option>
                  {[1,2,3,4].map((w) => <option key={w} value={w}>Week {w}</option>)}
                </Form.Select>
              </div>
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-4">
          <Col>
            <Form.Label>Select Location on Map (click to place marker)</Form.Label>
            <div style={{ height: "450px", border: "2px solid #333", borderRadius: 10, overflow: "hidden" }}>
              <MapContainer center={[7.8731, 80.7718]} zoom={7} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
                <LocationPicker setSelectedLocation={setSelectedLocation} />
                {selectedLocation && <Marker position={selectedLocation} icon={redIcon} />}
              </MapContainer>
            </div>
            {selectedLocation && (
              <p className="mt-2 text-muted">
                📍 Selected: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            )}
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Comments</Form.Label>
              <Form.Control
                as="textarea"
                rows={1}
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                placeholder="Optional comments"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col>
            <Button variant="secondary" className="me-3" onClick={handleCancel}>Cancel</Button>
            <Button variant="primary" type="submit">Submit</Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default ProductDeclaration;