import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useNavigate } from "react-router-dom";

// --- Map Marker Icon ---
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

// --- PRODUCT DATA (Default Growth Durations) ---
const productData = {
  Tomato:   { rate: 250, defaultDuration: 75 },
  Carrot:   { rate: 180, defaultDuration: 45 },
  Cabbage:  { rate: 200, defaultDuration: 80 },
  Onion:    { rate: 150, defaultDuration: 120 },
  Pumpkin:  { rate: 120, defaultDuration: 100 },
  Beans:    { rate: 210, defaultDuration: 50 },
  Okra:     { rate: 190, defaultDuration: 60 },
  Spinach:  { rate: 300, defaultDuration: 30 },
  Potato:   { rate: 170, defaultDuration: 90 },
  Leeks:    { rate: 190, defaultDuration: 100 },
  Radish:   { rate: 220, defaultDuration: 40 },
  Beetroot: { rate: 200, defaultDuration: 65 },
};

const ProductDeclaration = () => {
  const navigate = useNavigate();
  const durationInputRef = useRef(null);

  const [isDurationEditable, setIsDurationEditable] = useState(false);
  
  const [formData, setFormData] = useState({
    product: "",
    area: "",
    units: "",
    
    cultivationStart: "", // The Date Picker
    cultivationDays: "",  // The 1-31 Dropdown
    cultivationEnd: "",   // Calculated (Start + 1-31 days)

    growthDuration: "",   // Auto-filled, but editable
    
    harvestingDate: "",   // Calculated (Start + Growth Duration)
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

  // Array for 1-31 Dropdown
  const daysArray = Array.from({ length: 31 }, (_, i) => i + 1);

  // 1. Auto-Calculate Units & Fill Default Duration on Product Change
  useEffect(() => {
    if (formData.product) {
      const productInfo = productData[formData.product];
      setFormData(prev => ({ 
        ...prev, 
        units: prev.area ? prev.area * productInfo.rate : "",
        growthDuration: productInfo.defaultDuration // Auto-fill default
      }));
      setIsDurationEditable(false); // Reset edit state when product changes
    }
  }, [formData.product, formData.area]);

  // 2. MAIN LOGIC: Calculate Dates
  useEffect(() => {
    if (formData.cultivationStart) {
      const startDate = new Date(formData.cultivationStart);

      // A. Calculate "Cultivation End" (Start + The 1-31 Dropdown)
      let calculatedCultivationEnd = "";
      if (formData.cultivationDays) {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + parseInt(formData.cultivationDays));
        calculatedCultivationEnd = endDate.toISOString().split('T')[0];
      }

      // B. Calculate "Harvest Date" (Start + Growth Duration)
      // This runs if cultivationStart exists AND growthDuration exists (even if edited)
      if (formData.growthDuration) {
        const harvestDate = new Date(startDate);
        harvestDate.setDate(harvestDate.getDate() + parseInt(formData.growthDuration));

        // Extract Details
        const year = harvestDate.getFullYear();
        const monthName = months[harvestDate.getMonth()];
        
        // Week Logic
        const dayOfMonth = harvestDate.getDate();
        const weekNum = Math.ceil(dayOfMonth / 7);
        const validWeek = weekNum > 4 ? 4 : weekNum;

        setFormData(prev => ({
          ...prev,
          cultivationEnd: calculatedCultivationEnd,
          harvestingDate: harvestDate.toISOString().split('T')[0],
          harvestingYear: year,
          harvestingMonth: monthName,
          harvestingWeek: validWeek
        }));
      }
    }
  }, [formData.cultivationStart, formData.cultivationDays, formData.growthDuration]);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const toggleDurationEdit = () => {
    setIsDurationEditable(!isDurationEditable);
    // Automatically focus the input when unlocked
    if (!isDurationEditable) {
      setTimeout(() => durationInputRef.current?.focus(), 100);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedLocation) {
      alert("Please pick a location on the map before submitting.");
      return;
    }

    const newEntry = {
      id: Date.now(),
      ...formData,
      // We send the "Cultivation End" (based on the 1-31 logic) 
      // and "Harvesting Start" (based on the growth duration logic)
      cultivationEnd: formData.cultivationEnd, 
      harvestingStart: formData.harvestingDate, 
      harvestingEnd: new Date(new Date(formData.harvestingDate).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
      cultivationDays: "",
      cultivationEnd: "",
      growthDuration: "",
      harvestingDate: "",
      harvestingYear: "",
      harvestingMonth: "",
      harvestingWeek: "",
      locationText: "",
      comments: "",
    });
    setSelectedLocation(null);
    setIsDurationEditable(false);
  };

  return (
    <Container className="mt-5 mb-5">
      
      <Row className="mb-3">
        <Col>
          <h3 className="fw-bold text-secondary">Product Declaration</h3>
        </Col>
      </Row>

      <Row className="mb-5 justify-content-center">
        <Col xs="auto">
          <Button 
            variant="success" 
            onClick={() => navigate("/forecasting")}
            className="shadow-sm"
            style={{ 
              fontSize: "1.1rem",       
              padding: "12px 0",         
              width: "700px",           
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
      
      <Form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col md={4} className="me-5">
            <Form.Group>
              <Form.Label>Select Product</Form.Label>
              <Form.Select name="product" value={formData.product} onChange={handleChange} required>
                <option value="">Select a product</option>
                {Object.keys(productData).map((prod, i) => (
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

        {/* --- ROW: Cultivation Start & Duration --- */}
        <Row className="mb-3">
          <Col md={5} className="me-5" style={{marginTop:"-77px"}}>
            {/* 1. Cultivation Start Date */}
            <Form.Group className="mb-3">
              <Form.Label>Cultivation Start Date</Form.Label>
              <Form.Control
                type="date"
                name="cultivationStart"
                value={formData.cultivationStart}
                onChange={handleChange}
                required
              />
            </Form.Group>

            {/* 2. Cultivation Active Days (1-31) */}
            <Form.Group className="mb-3">
                <Form.Label>Days to finish Cultivation</Form.Label>
                <Form.Select 
                    name="cultivationDays" 
                    value={formData.cultivationDays} 
                    onChange={handleChange}
                    required
                >
                    <option value="">Select days (1-31)...</option>
                    {daysArray.map(d => (
                        <option key={d} value={d}>{d} Days</option>
                    ))}
                </Form.Select>
                {formData.cultivationEnd && (
                    <Form.Text className="text-muted">
                        Cultivation activity ends on: {formData.cultivationEnd}
                    </Form.Text>
                )}
            </Form.Group>

               
             {/* 3. Growth Duration with Edit Icon */}
            <Form.Group className="mb-3">
                <Form.Label>Growth Duration (Days)</Form.Label>
                <InputGroup>
                    <Form.Control 
                        ref={durationInputRef}
                        type="number"
                        name="growthDuration"
                        value={formData.growthDuration}
                        onChange={handleChange}
                        readOnly={!isDurationEditable}
                        className={isDurationEditable ? "bg-white border-primary" : "bg-light"}
                        required
                    />
                    <Button 
                        variant={isDurationEditable ? "primary" : "outline-secondary"} 
                        onClick={toggleDurationEdit}
                        title="Edit Duration"
                    >
                        ✏️ {isDurationEditable ? "Save" : "Edit"}
                    </Button>
                </InputGroup>
                <Form.Text className="text-muted">
                    {isDurationEditable 
                        ? "Editing this updates the Expected Harvest Date." 
                        : "Default for this product. Click Edit to change."}
                </Form.Text>
            </Form.Group>
          </Col>

          <Col md={5} style={{ marginLeft: "94px", marginTop:"4rem" }}>
            {/* 4. Expected Harvest Date */}
            <Form.Label className="fw-bold text-success">Expected Harvest Date</Form.Label>
            <Form.Group className="mb-2">
                <Form.Control 
                    type="date" 
                    value={formData.harvestingDate} 
                    readOnly 
                    className="bg-success text-white fw-bold"
                />
            </Form.Group>

            {/* Read Only Year/Month/Week */}
            <div className="d-flex align-items-center gap-2">
              <Form.Control value={formData.harvestingYear || "Year"} readOnly className="bg-light" />
              <Form.Control value={formData.harvestingMonth || "Month"} readOnly className="bg-light" />
              <Form.Control value={formData.harvestingWeek ? `Week ${formData.harvestingWeek}` : "Week"} readOnly className="bg-light" />
            </div>
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