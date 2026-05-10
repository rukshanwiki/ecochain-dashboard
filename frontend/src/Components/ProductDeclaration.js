import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Form, Button, InputGroup, Modal } from "react-bootstrap";
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
  const [showSuccessModal, setShowSuccessModal] = useState(false); // NEW: State for Success Popup
  
  const [formData, setFormData] = useState({
    product: "",
    area: "",
    units: "",
    cultivationStart: "",
    cultivationDays: "",
    cultivationEnd: "",
    growthDuration: "", // Days until Harvest starts
    harvestDays: "",    // How many days the harvest will take (Dropdown)
    harvestingDate: "", // Harvest Start Date
    harvestingEnd: "",  // Calculated: Start Date + harvestDays
    locationText: "",
    comments: "",
  });

  const [selectedLocation, setSelectedLocation] = useState(null);

  const daysArray = Array.from({ length: 31 }, (_, i) => i + 1);

  // 1. Auto-Calculate Units & Fill Default Duration on Product Change
  useEffect(() => {
    if (formData.product) {
      const productInfo = productData[formData.product];
      setFormData(prev => ({ 
        ...prev, 
        units: prev.area ? prev.area * productInfo.rate : "",
        growthDuration: productInfo.defaultDuration
      }));
      setIsDurationEditable(false);
    }
  }, [formData.product, formData.area]);

  // 2. MAIN LOGIC: Calculate Dates
  useEffect(() => {
    if (formData.cultivationStart) {
      const startDate = new Date(formData.cultivationStart);

      // A. Calculate Cultivation End
      let calculatedCultivationEnd = "";
      if (formData.cultivationDays) {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + parseInt(formData.cultivationDays));
        calculatedCultivationEnd = endDate.toISOString().split('T')[0];
      }

      // B. Calculate Harvest Dates
      if (formData.growthDuration) {
        // Harvest Start Date
        const harvestDate = new Date(startDate);
        harvestDate.setDate(harvestDate.getDate() + parseInt(formData.growthDuration));

        // Harvest End Date (Based on user selection for "harvestDays")
        let calculatedHarvestEnd = "";
        if (formData.harvestDays) {
          const harvestEndDate = new Date(harvestDate);
          harvestEndDate.setDate(harvestEndDate.getDate() + parseInt(formData.harvestDays));
          calculatedHarvestEnd = harvestEndDate.toISOString().split('T')[0];
        }

        setFormData(prev => ({
          ...prev,
          cultivationEnd: calculatedCultivationEnd,
          harvestingDate: harvestDate.toISOString().split('T')[0],
          harvestingEnd: calculatedHarvestEnd
        }));
      }
    }
  }, [formData.cultivationStart, formData.cultivationDays, formData.growthDuration, formData.harvestDays]);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const toggleDurationEdit = () => {
    setIsDurationEditable(!isDurationEditable);
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
      cultivationEnd: formData.cultivationEnd, 
      harvestingStart: formData.harvestingDate, 
      harvestingEnd: formData.harvestingEnd,
      location: {
        lat: Number(selectedLocation.lat),
        lng: Number(selectedLocation.lng),
      }
    };

    const existing = JSON.parse(localStorage.getItem("declarations") || "[]");
    existing.push(newEntry);
    localStorage.setItem("declarations", JSON.stringify(existing));

    window.dispatchEvent(new Event("declarationsUpdated"));
    
    // NEW: Show popup instead of navigating instantly
    setShowSuccessModal(true); 
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate("/dashboard"); // Navigate away after user acknowledges success
  };

  const handleCancel = () => {
    setFormData({
      product: "", area: "", units: "", cultivationStart: "", cultivationDays: "", cultivationEnd: "", growthDuration: "", harvestDays: "", harvestingDate: "", harvestingEnd: "", locationText: "", comments: "",
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
        <Col xs={12} className="text-center">
          <Button 
            variant="success" 
            onClick={() => navigate("/forecasting")}
            className="shadow-sm"
            style={{ 
              fontSize: "1.1rem",      
              padding: "12px 0",        
              width: "100%",          
              maxWidth: "700px",
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
        
        {/* --- Form Section 1: Product Details --- */}
        <h5 className="text-muted mb-3 border-bottom pb-2">1. Crop Details</h5>
        <Row className="mb-4">
          <Col xs={12} md={6} className="mb-3 mb-md-0">
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

          <Col xs={12} md={6}>
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
              <Form.Control type="number" value={formData.units} readOnly className="bg-light text-muted" />
            </Form.Group>
          </Col>
        </Row>

        {/* --- Form Section 2: Timeline Estimates --- */}
        <h5 className="text-muted mb-3 mt-4 border-bottom pb-2">2. Timeline Estimates</h5>
        <Row className="mb-4">
          
          {/* Cultivation Column */}
          <Col xs={12} md={6} className="mb-4 mb-md-0 pe-md-4">
            <Form.Group className="mb-3">
              <Form.Label className="text-primary fw-semibold">Cultivation Start Date</Form.Label>
              <Form.Control
                type="date"
                name="cultivationStart"
                value={formData.cultivationStart}
                onChange={handleChange}
                required
              />
            </Form.Group>

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
                        <option key={d} value={d}>{d} {d === 1 ? 'Day' : 'Days'}</option>
                    ))}
                </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Cultivation End Date</Form.Label>
              <Form.Control 
                  type="date" 
                  value={formData.cultivationEnd} 
                  readOnly 
                  className="bg-light text-muted" 
              />
            </Form.Group>
          </Col>

          {/* Harvest Column */}
          <Col xs={12} md={6}>
            <Form.Group className="mb-3">
                <Form.Label>Days until Harvest Starts (Growth Duration)</Form.Label>
                <InputGroup>
                    <Form.Control 
                        ref={durationInputRef}
                        type="number"
                        name="growthDuration"
                        value={formData.growthDuration}
                        onChange={handleChange}
                        readOnly={!isDurationEditable}
                        className={isDurationEditable ? "bg-white border-primary" : "bg-light text-muted"}
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
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label className="text-dark fw-semibold">Days needed for Harvesting</Form.Label>
                <Form.Select 
                    name="harvestDays"
                    value={formData.harvestDays}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select days (1-31)...</option>
                    {daysArray.map(d => (
                        <option key={d} value={d}>{d} {d === 1 ? 'Day' : 'Days'}</option>
                    ))}
                </Form.Select>
            </Form.Group>

            <Row>
              <Col xs={6}>
                <Form.Group className="mb-3">
                    <Form.Label className="text-success fw-semibold">Harvest Start</Form.Label>
                    <Form.Control 
                        type="date" 
                        value={formData.harvestingDate} 
                        readOnly 
                        className="bg-success text-white fw-bold border-success"
                    />
                </Form.Group>
              </Col>
              <Col xs={6}>
                <Form.Group className="mb-3">
                    <Form.Label className="text-danger fw-semibold">Harvest End</Form.Label>
                    <Form.Control 
                        type="date" 
                        value={formData.harvestingEnd} 
                        readOnly 
                        className="bg-danger text-white fw-bold border-danger"
                    />
                </Form.Group>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* --- Form Section 3: Location & Comments --- */}
        <h5 className="text-muted mb-3 mt-4 border-bottom pb-2">3. Location & Additional Info</h5>
        <Row className="mb-4">
          <Col xs={12}>
            <Form.Label>Select Location on Map (click to place marker)</Form.Label>
            <div style={{ height: "400px", border: "1px solid #ced4da", borderRadius: "8px", overflow: "hidden" }}>
              <MapContainer center={[7.8731, 80.7718]} zoom={7} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
                <LocationPicker setSelectedLocation={setSelectedLocation} />
                {selectedLocation && <Marker position={selectedLocation} icon={redIcon} />}
              </MapContainer>
            </div>
            {selectedLocation && (
              <p className="mt-2 text-muted fw-semibold">
                📍 Selected Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </p>
            )}
          </Col>
        </Row>

        <Row className="mb-4">
          <Col xs={12} md={6}>
            <Form.Group>
              <Form.Label>Comments</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                placeholder="Optional comments about this batch"
              />
            </Form.Group>
          </Col>
        </Row>

        {/* --- Form Actions --- */}
        <Row className="mt-2">
          <Col xs={12} className="d-flex gap-3">
            <Button variant="secondary" onClick={handleCancel} className="px-4">Cancel</Button>
            <Button variant="primary" type="submit" className="px-5">Submit Declaration</Button>
          </Col>
        </Row>
      </Form>

      {/* --- SUCCESS MODAL --- */}
      <Modal show={showSuccessModal} onHide={handleCloseModal} centered backdrop="static">
        <Modal.Header closeButton className="border-0 pb-0">
        </Modal.Header>
        <Modal.Body className="text-center pb-4">
          <div className="mb-3">
            <span style={{ fontSize: "3rem" }}>✅</span>
          </div>
          <h4 className="text-success fw-bold">Declaration Submitted!</h4>
          <p className="text-muted mt-2">
            Your product declaration for <strong>{formData.product}</strong> has been successfully saved to the system.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 d-flex justify-content-center pb-4">
          <Button variant="success" onClick={handleCloseModal} className="px-5 rounded-pill">
            Go to Dashboard
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default ProductDeclaration;