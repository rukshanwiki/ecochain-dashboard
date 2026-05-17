import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Form, Button, InputGroup, Modal, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "../CSS/ProductDeclaration.css"; 

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

// --- SRI LANKA GEOGRAPHIC DATA (Province & Districts) ---
const locationData = {
  "Central": ["Kandy", "Matale", "Nuwara Eliya"],
  "Eastern": ["Ampara", "Batticaloa", "Trincomalee"],
  "North Central": ["Anuradhapura", "Polonnaruwa"],
  "North Western": ["Kurunegala", "Puttalam"],
  "Northern": ["Jaffna", "Kilinochchi", "Mannar", "Mullaitivu", "Vavuniya"],
  "Sabaragamuwa": ["Kegalle", "Ratnapura"],
  "Southern": ["Galle", "Hambantota", "Matara"],
  "Uva": ["Badulla", "Moneragala"],
  "Western": ["Colombo", "Gampaha", "Kalutara"]
};

const ProductDeclaration = () => {
  const navigate = useNavigate();
  const durationInputRef = useRef(null);

  const [isDurationEditable, setIsDurationEditable] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  
  const [formData, setFormData] = useState({
    product: "", area: "", units: "", cultivationStart: "", cultivationDays: "", cultivationEnd: "", 
    growthDuration: "", harvestDays: "", harvestingDate: "", harvestingEnd: "", province: "", district: "", comments: "",
  });

  const daysArray = Array.from({ length: 31 }, (_, i) => i + 1);

  // 1. Auto-Calculate Units & Fill Default Duration
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

      let calculatedCultivationEnd = "";
      if (formData.cultivationDays) {
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + parseInt(formData.cultivationDays));
        calculatedCultivationEnd = endDate.toISOString().split('T')[0];
      }

      if (formData.growthDuration) {
        const harvestDate = new Date(startDate);
        harvestDate.setDate(harvestDate.getDate() + parseInt(formData.growthDuration));

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
    const { name, value } = e.target;
    if (name === "province") {
      setFormData({ ...formData, province: value, district: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const toggleDurationEdit = () => {
    setIsDurationEditable(!isDurationEditable);
    if (!isDurationEditable) {
      setTimeout(() => durationInputRef.current?.focus(), 100);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.province || !formData.district) {
      alert("Please select both a Province and a District.");
      return;
    }

    const newEntry = {
      id: Date.now(),
      ...formData,
      locationText: `${formData.district}, ${formData.province}`
    };

    const existing = JSON.parse(localStorage.getItem("declarations") || "[]");
    existing.push(newEntry);
    localStorage.setItem("declarations", JSON.stringify(existing));

    window.dispatchEvent(new Event("declarationsUpdated"));
    setShowSuccessModal(true); 
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    navigate("/dashboard");
  };

  const handleCancel = () => {
    setFormData({
      product: "", area: "", units: "", cultivationStart: "", cultivationDays: "", cultivationEnd: "", 
      growthDuration: "", harvestDays: "", harvestingDate: "", harvestingEnd: "", province: "", district: "", comments: "",
    });
    setIsDurationEditable(false);
  };

  return (
    <div className="declaration-wrapper pt-4">
      <Container>
        <Row className="mb-4 text-center">
          <Col>
            <h2 className="fw-bold" style={{ color: "#1B5E20" }}>New Crop Declaration</h2>
            <p className="text-muted">Register your planting schedules to help predict market supply</p>
          </Col>
        </Row>

        {/* ✅ FIX 2: Dynamic Insights Banner explaining WHY they should check the forecast */}
        <Row className="mb-5 justify-content-center">
          <Col lg={10}>
            <Card className="border-0 shadow-sm p-4" style={{ backgroundColor: "#E8F5E9", borderRadius: "15px" }}>
              <Row className="align-items-center">
                <Col md={8} className="mb-3 mb-md-0 text-start">
                  <h5 className="fw-bold text-success mb-2">💡 Avoid Market Crashes & Maximize Profit</h5>
                  <p className="text-muted mb-0" style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>
                    Before finalizing your crop choice, see what other farmers in Sri Lanka are growing this month. 
                    If too many people declare the same crop, prices will drop. Use the forecasting tool to find profitable shortages!
                  </p>
                </Col>
                <Col md={4} className="text-md-end">
                  <Button 
                    variant="success" 
                    onClick={() => navigate("/forecasting")}
                    className="w-100 fw-bold py-2 btn-custom-primary"
                    style={{ borderRadius: "12px", fontSize: "0.95rem" }}
                  >
                    📊 View Live Market Trends
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
        
        <Row className="justify-content-center">
          <Col lg={10}>
            <Card className="declaration-card p-4 p-md-5">
              <Form onSubmit={handleSubmit}>
                
                {/* SECTION 1: CROP DETAILS */}
                <h5 className="section-header">🌱 1. Crop Details</h5>
                
                {/* ✅ FIX 1a: Product Dropdown on its own separate row */}
                <Row className="mb-3">
                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Select Product</Form.Label>
                      <Form.Select className="custom-input" name="product" value={formData.product} onChange={handleChange} required>
                        <option value="">Select a product...</option>
                        {Object.keys(productData).map((prod, i) => (
                          <option key={i} value={prod}>{prod}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {/* ✅ FIX 1b: Cultivating Area and Calculated Yield combined side-by-side in one row */}
                <Row className="mb-4">
                  <Col xs={12} md={6} className="mb-3 mb-md-0">
                    <Form.Group>
                      <Form.Label className="fw-semibold">Area of Cultivating (Hectares)</Form.Label>
                      <Form.Control className="custom-input" type="number" name="area" value={formData.area} onChange={handleChange} min="0.1" step="0.1" placeholder="Ex: 2" required />
                    </Form.Group>
                  </Col>

                  <Col xs={12} md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold text-muted">Calculated Yield (Units)</Form.Label>
                      <Form.Control className="custom-input read-only-input" type="number" value={formData.units} readOnly />
                    </Form.Group>
                  </Col>
                </Row>

                {/* SECTION 2: TIMELINE */}
                <h5 className="section-header mt-5">⏳ 2. Timeline Estimates</h5>
                <Row className="mb-4">
                  <Col xs={12} md={6} className="mb-4 mb-md-0 pe-md-4 border-end-md border-light">
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold text-success">Cultivation Start Date</Form.Label>
                      <Form.Control className="custom-input" type="date" name="cultivationStart" value={formData.cultivationStart} onChange={handleChange} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Days to finish Cultivation</Form.Label>
                        <Form.Select className="custom-input" name="cultivationDays" value={formData.cultivationDays} onChange={handleChange} required>
                            <option value="">Select days...</option>
                            {daysArray.map(d => (
                                <option key={d} value={d}>{d} {d === 1 ? 'Day' : 'Days'}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold text-muted">Cultivation End Date</Form.Label>
                      <Form.Control className="custom-input read-only-input" type="date" value={formData.cultivationEnd} readOnly />
                    </Form.Group>
                  </Col>

                  <Col xs={12} md={6} className="ps-md-4">
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Days until Harvest Starts</Form.Label>
                        <InputGroup>
                            <Form.Control 
                                ref={durationInputRef} type="number" name="growthDuration" value={formData.growthDuration} 
                                onChange={handleChange} readOnly={!isDurationEditable}
                                className={`custom-input ${!isDurationEditable ? 'read-only-input' : 'border-success'}`} required
                                style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                            />
                            <Button variant={isDurationEditable ? "success" : "outline-secondary"} onClick={toggleDurationEdit} style={{ borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>
                                ✏️ {isDurationEditable ? "Save" : "Edit"}
                            </Button>
                        </InputGroup>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Days needed for Harvesting</Form.Label>
                        <Form.Select className="custom-input" name="harvestDays" value={formData.harvestDays} onChange={handleChange} required>
                            <option value="">Select days...</option>
                            {daysArray.map(d => (
                                <option key={d} value={d}>{d} {d === 1 ? 'Day' : 'Days'}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Row>
                      <Col xs={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="text-success fw-bold">Harvest Start</Form.Label>
                            <Form.Control type="date" value={formData.harvestingDate} readOnly className="custom-input bg-success bg-opacity-10 text-success fw-bold border-success" />
                        </Form.Group>
                      </Col>
                      <Col xs={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="text-danger fw-bold">Harvest End</Form.Label>
                            <Form.Control type="date" value={formData.harvestingEnd} readOnly className="custom-input bg-danger bg-opacity-10 text-danger fw-bold border-danger" />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Col>
                </Row>

                {/* SECTION 3: LOCATION */}
                <h5 className="section-header mt-5">📍 3. Location Details</h5>
                <Row className="mb-4">
                  <Col xs={12} md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label className="fw-semibold">Province</Form.Label>
                      <Form.Select className="custom-input" name="province" value={formData.province} onChange={handleChange} required>
                        <option value="">-- Select Province --</option>
                        {Object.keys(locationData).sort().map((prov, i) => (
                          <option key={i} value={prov}>{prov} Province</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col xs={12} md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label className="fw-semibold">District</Form.Label>
                      <Form.Select className="custom-input" name="district" value={formData.district} onChange={handleChange} disabled={!formData.province} required>
                        <option value="">{!formData.province ? "Select Province First" : "-- Select District --"}</option>
                        {formData.province && locationData[formData.province].sort().map((dist, i) => (
                          <option key={i} value={dist}>{dist}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mb-5">
                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Comments</Form.Label>
                      <Form.Control className="custom-input" as="textarea" rows={3} name="comments" value={formData.comments} onChange={handleChange} placeholder="Any special notes about this crop? (Optional)" />
                    </Form.Group>
                  </Col>
                </Row>

                <Row className="mt-4 pt-3 border-top">
                  <Col xs={12} className="d-flex justify-content-end gap-3">
                    <Button type="button" className="btn-custom-secondary" onClick={handleCancel}>Clear Form</Button>
                    <Button type="submit" className="btn-custom-primary">🚀 Submit Declaration</Button>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Col>
        </Row>

        {/* MODAL */}
        <Modal show={showSuccessModal} onHide={handleCloseModal} centered backdrop="static">
          <Modal.Header closeButton className="border-0 pb-0"></Modal.Header>
          <Modal.Body className="text-center pb-4">
            <div className="mb-3"><span style={{ fontSize: "3rem" }}>✅</span></div>
            <h4 className="text-success fw-bold">Declaration Submitted!</h4>
            <p className="text-muted mt-2">
              Your product declaration for <strong>{formData.product}</strong> has been successfully saved.
            </p>
          </Modal.Body>
          <Modal.Footer className="border-0 d-flex justify-content-center pb-4">
            <Button variant="success" onClick={handleCloseModal} className="px-5 rounded-pill">Go to Dashboard</Button>
          </Modal.Footer>
        </Modal>

      </Container>
    </div>
  );
};

export default ProductDeclaration;