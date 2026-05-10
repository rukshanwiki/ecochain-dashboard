import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import axios from "axios";

const RegisterModal = ({ show, handleClose, openLogin }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    nic: "",
    farmerRegNo: "",
    province: "",
    district: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle register button
  const handleRegister = async () => {
    setError("");
    setSuccess(false);

    // Validation: check all fields
    for (let key of Object.keys(formData)) {
      if (!formData[key]) {
        setError(`❌ ${key} is required`);
        return;
      }
    }

    // Password match check
    if (formData.password !== formData.confirmPassword) {
      setError("❌ Passwords do not match");
      return;
    }

    try {
      // Prepare payload (remove confirmPassword)
      const payload = { ...formData };
      delete payload.confirmPassword;

      // ✅ Send POST with JSON header
      const res = await axios.post(
        "https://ecochain-dashboard-backend.onrender.com/api/auth/register",
        payload,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.data.success) {
        setSuccess(true);
        setError("");
        setTimeout(() => {
          setSuccess(false);
          handleClose();
          openLogin(); // open login modal after registration
        }, 2000);
      } else {
        setError(res.data.message || "❌ Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "❌ Registration failed");
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Register (Farmers Only)</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          {/* Form Fields */}
          {[
            { label: "Full Name", name: "fullName" },
            { label: "NIC Number", name: "nic" },
            { label: "Farmer Registration Number", name: "farmerRegNo" },
            { label: "Province", name: "province" },
            { label: "District", name: "district" },
            { label: "Email", name: "email", type: "email" },
            { label: "Mobile Number", name: "mobile" },
            { label: "Password", name: "password", type: "password" },
            { label: "Confirm Password", name: "confirmPassword", type: "password" },
          ].map((field) => (
            <Form.Group className="mb-3" key={field.name}>
              <Form.Label>{field.label} *</Form.Label>
              <Form.Control
                type={field.type || "text"}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                required
              />
            </Form.Group>
          ))}

          {/* Alerts */}
          {error && <Alert variant="danger">{error}</Alert>}
          {success && (
            <Alert variant="success">
              ✅ Registration successful! Redirecting to login...
            </Alert>
          )}
        </Form>

        <p className="mt-3 text-center">
          Already have an account?{" "}
          <span
            style={{ color: "#007bff", cursor: "pointer" }}
            onClick={() => {
              handleClose();
              openLogin();
            }}
          >
            Login
          </span>
        </p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleRegister}>
          Register
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RegisterModal;

