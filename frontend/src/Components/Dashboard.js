// import React, { useEffect, useState } from "react";
// import { Container, Row, Col, Button, Card, } from "react-bootstrap";
// import { useNavigate } from "react-router-dom";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
// import DistrictDataTable from "./DistrictDataTable";
// import "../CSS/Dashboard.css";

// const Dashboard = () => {
//   const [selectedVeg, setSelectedVeg] = useState("All");
//   const [allDeclarations, setAllDeclarations] = useState([]);
//   const [userName, setUserName] = useState("");
//   const navigate = useNavigate();

//   useEffect(() => {
//     const user = JSON.parse(localStorage.getItem("user"));
//     if (user && user.fullName) {
//       setUserName(user.fullName);
//     }

//     const load = () => {
//       const data = JSON.parse(localStorage.getItem("declarations") || "[]");
//       setAllDeclarations(data);
//     };
//     load();
//     window.addEventListener("declarationsUpdated", load);
//     return () => window.removeEventListener("declarationsUpdated", load);
//   }, []);

//   const productSet = new Set(allDeclarations.map(d => (d.product || "").trim()).filter(Boolean));
//   const productsFromData = Array.from(productSet).sort();

//   const defaultVegList = [
//     "Carrot","Tomato","Cabbage","Onion","Pumpkin","Brinjal (Eggplant)",
//     "Okra","Beans","Cucumber","Radish","Leeks","Spinach"
//   ];


//   // --- FILTER LOGIC ---
//   const filteredLocations = allDeclarations.filter(item => {
//     if (!item || !item.product) return false;
//     if (selectedVeg === "All") return true;
//     return item.product.trim().toLowerCase() === selectedVeg.trim().toLowerCase();
//   });

//   // --- GRAPH DATA PROCESSING HELPER ---
//   const getSortableKey = (dateStr, tf) => {
//     if (!dateStr) return null;
//     const d = new Date(dateStr);
//     const year = d.getFullYear();
//     const month = String(d.getMonth() + 1).padStart(2, '0');
//     if (tf === 'year') return `${year}`;
//     if (tf === 'month') return `${year}-${month}`;
//     if (tf === 'week') {
//       const firstDay = new Date(year, 0, 1);
//       const pastDays = (d - firstDay) / 86400000;
//       const weekNum = Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
//       return `${year}-W${String(weekNum).padStart(2, '0')}`;
//     }
//   };

//   const formatLabel = (key, tf) => {
//     if (tf === 'year') return key;
//     if (tf === 'month') {
//       const [y, m] = key.split('-');
//       const date = new Date(y, parseInt(m) - 1, 1);
//       return date.toLocaleString('default', { month: 'short', year: 'numeric' });
//     }
//     if (tf === 'week') return key;
//   };

//   const generateChartData = (data, dateField, tf) => {
//     const agg = {};
//     data.forEach(item => {
//       const key = getSortableKey(item[dateField], tf);
//       if (key) {
//         agg[key] = (agg[key] || 0) + (parseFloat(item.units) || 0);
//       }
//     });

//     return Object.keys(agg)
//       .sort()
//       .map(key => ({
//         name: formatLabel(key, tf),
//         Amount: agg[key]
//       }));
//   };

//   //const cultivationChartData = generateChartData(filteredLocations, "cultivationStart", timeframe);
//   //const harvestChartData = generateChartData(filteredLocations, "harvestingDate", timeframe);

//   return (
//     <Container className="mt-5 mb-1">
//       {/* 1. Greeting Section */}
//       <Row className="mb-3">
//         <Col>
//           <h2 className="fw-bold" style={{ color: "#1B5E20" }}>
//             Welcome {userName ? userName.split(" ")[0] : "Farmer"}!
//           </h2>
//         </Col>
//       </Row>

//       {/* 2. ✅ Pre-Declaration Workflow Guide Panel */}
//       <Row className="mb-4">
//         <Col>
//           <Card className="shadow-sm border-0 p-4 rounded-4 bg-white">
//             <Card.Body className="p-2">
//               <h4 className="fw-bold mb-2" style={{ color: "#1B5E20" }}>
//                 📋 Smart Farming Pre-Declaration Checklist
//               </h4>
//               <p className="text-muted mb-4">
//                 To maximize your profits and prevent oversupply in the market, we highly recommend checking existing agricultural data <strong>before declaring a new crop</strong>. Use the integrated platform steps below:
//               </p>

//               <Row className="g-3 text-start mb-4">
//                 <Col md={3}>
//                   <Card className="h-100 border-0 shadow-sm bg-light">
//                     <Card.Body className="p-3">
//                       <div className="d-flex align-items-center mb-2">
//                         <span className="fs-4 me-2">📊</span>
//                         <h6 className="fw-bold m-0" style={{ color: "#1B5E20" }}>1. Track Forecasting</h6>
//                       </div>
//                       <Card.Text className="text-muted small">
//                         Go to the <strong>Forecasting</strong> page to analyze real-time market supply predictions. Check for oversupply warnings to see if your crop choice matches target demands.
//                       </Card.Text>
//                     </Card.Body>
//                   </Card>
//                 </Col>

//                 <Col md={3}>
//                   <Card className="h-100 border-0 shadow-sm bg-light">
//                     <Card.Body className="p-3">
//                       <div className="d-flex align-items-center mb-2">
//                         <span className="fs-4 me-2">💰</span>
//                         <h6 className="fw-bold m-0" style={{ color: "#D84315" }}>2. Monitor Pricing</h6>
//                       </div>
//                       <Card.Text className="text-muted small">
//                         Check the <strong>Pricing</strong> tab to review seasonal price fluctuations. Understanding historical average spikes ensures you plant when yield revenue is at its highest.
//                       </Card.Text>
//                     </Card.Body>
//                   </Card>
//                 </Col>

//                 <Col md={3}>
//                   <Card className="h-100 border-0 shadow-sm bg-light">
//                     <Card.Body className="p-3">
//                       <div className="d-flex align-items-center mb-2">
//                         <span className="fs-4 me-2">📅</span>
//                         <h6 className="fw-bold m-0" style={{ color: "#2E7D32" }}>3. Review Calendar</h6>
//                       </div>
//                       <Card.Text className="text-muted small">
//                         Inspect the <strong>Calendar</strong> page to see currently active regional timelines. Coordinating dates helps avoid congested crop harvesting weeks.
//                       </Card.Text>
//                     </Card.Body>
//                   </Card>
//                 </Col>

//                 <Col md={3}>
//                   <Card className="h-100 border-0 shadow-sm bg-light">
//                     <Card.Body className="p-3">
//                       <div className="d-flex align-items-center mb-2">
//                         <span className="fs-4 me-2">📈</span>
//                         <h6 className="fw-bold m-0" style={{ color: "#0288D1" }}>4. Evaluate Crop Table</h6>
//                       </div>
//                       <Card.Text className="text-muted small">
//                         Verify regional metrics logs in the <strong>Crop Table</strong>. Compare exact kilograms currently cultivated against harvesting volumes for your vegetable selection.
//                       </Card.Text>
//                     </Card.Body>
//                   </Card>
//                 </Col>
//               </Row>

//               <div className="text-center">
//                 <Button 
//                   variant="success" 
//                   size="lg" 
//                   className="px-5 py-2 fw-bold rounded-pill shadow-sm"
//                   onClick={() => navigate("/product-declaration")}
//                   style={{ backgroundColor: "#34a65e", borderColor: "#34a65e" }}
//                 >
//                   🚀 Ready? Declare Your Product
//                 </Button>
//               </div>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
        
//       {/* 8. Cultivation Map */}
//       <div className="mt-5 mb-5">
//         <h4 className="fw-bold mb-3" style={{ color: "#1B5E20" }}>📊 District-wise Production</h4>
//         <Card className="p-3 shadow-sm border-0 rounded-4">
//           <DistrictDataTable locations={filteredLocations} />
//         </Card>
//       </div>

//       {/* {About Us Details} */}
//       <div>
//         {/* Vision & Mission Section */}
//         <section className="vision-mission-section glass-border mb-4">
//           <div className="section-content p-4">
//             <h2 style={{ color: "#1B5E20", fontWeight: "bold" }}>Our Vision</h2>
//             <p>To enhance Sri Lanka’s agricultural productivity through sustainable practices and modern solutions.</p>

//             <h2 className="mt-5" style={{ color: "#1B5E20", fontWeight: "bold" }}>Our Mission</h2>
//             <p>To support farmers nationwide, provide accurate agricultural information, and promote eco-friendly farming techniques.</p>
//           </div>
//         </section>

//         {/* Contact Details Section */}
//         <section className="contact-section glass-border mb-4">
//           <div className="section-content p-4">
//             <h2 style={{ color: "#1B5E20", fontWeight: "bold" }}>Contact Us</h2>
//             <p>Department of Agriculture, Peradeniya, Sri Lanka</p>
//             <p>Email: info@agri.gov.lk | Phone: +94 81 238 9000</p>
//           </div>
//         </section>

//         {/* Authorized by Government */}
//         <section className="authorization-section glass-border">
//           <div className="section-content p-4">
//             <h2 style={{ color: "#1B5E20", fontWeight: "bold" }}>Authorized By</h2>
//             <p>The Government of Sri Lanka - Department of Agriculture</p>
//           </div>
//         </section>
//       </div>
//     </Container>
//   );
// };

// export default Dashboard;








// import React, { useEffect, useState } from "react";
// import { Container, Row, Col, Button, Card, Spinner, Alert } from "react-bootstrap";
// import { useNavigate } from "react-router-dom";
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
// import DistrictDataTable from "./DistrictDataTable";
// import "../CSS/Dashboard.css";

// const Dashboard = () => {
//   const [selectedVeg, setSelectedVeg] = useState("All");
//   const [allDeclarations, setAllDeclarations] = useState([]);
//   const [userName, setUserName] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();

//   // ⚠️ REPLACE THIS STRING WITH YOUR ACTUAL RENDER LINK FROM YOUR RENDER DASHBOARD
//   // Example: "https://my-backend-app.onrender.com"
//   const BACKEND_URL = "https://ecochain-dashboard-backend.onrender.com";

//   useEffect(() => {
//     // Get logged-in user profile from localStorage
//     const user = JSON.parse(localStorage.getItem("user"));
//     if (user && user.fullName) {
//       setUserName(user.fullName);
//     }

//     // 🛠️ FETCH DECLARATIONS LIVE FROM THE DATABASE
//     const fetchDeclarations = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(`${BACKEND_URL}/api/declarations`);
//         const result = await response.json();
        
//         if (response.ok && result.success) {
//           setAllDeclarations(result.data);
//         } else {
//           throw new Error(result.error || "Failed to retrieve records");
//         }
//       } catch (err) {
//         console.error("Dashboard Fetch Error:", err);
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDeclarations();
//   }, [BACKEND_URL]);

//   const productSet = new Set(allDeclarations.map(d => (d.product || "").trim()).filter(Boolean));
//   const productsFromData = Array.from(productSet).sort();

//   const defaultVegList = [
//     "Carrot","Tomato","Cabbage","Onion","Pumpkin","Brinjal (Eggplant)",
//     "Okra","Beans","Cucumber","Radish","Leeks","Spinach"
//   ];

//   // --- FILTER LOGIC ---
//   const filteredLocations = allDeclarations.filter(item => {
//     if (!item || !item.product) return false;
//     if (selectedVeg === "All") return true;
//     return item.product.trim().toLowerCase() === selectedVeg.trim().toLowerCase();
//   });

//   // --- GRAPH DATA PROCESSING HELPER ---
//   const getSortableKey = (dateStr, tf) => {
//     if (!dateStr) return null;
//     const d = new Date(dateStr);
//     const year = d.getFullYear();
//     const month = String(d.getMonth() + 1).padStart(2, '0');
//     if (tf === 'year') return `${year}`;
//     if (tf === 'month') return `${year}-${month}`;
//     if (tf === 'week') {
//       const firstDay = new Date(year, 0, 1);
//       const pastDays = (d - firstDay) / 86400000;
//       const weekNum = Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
//       return `${year}-W${String(weekNum).padStart(2, '0')}`;
//     }
//   };

//   const formatLabel = (key, tf) => {
//     if (tf === 'year') return key;
//     if (tf === 'month') {
//       const [y, m] = key.split('-');
//       const date = new Date(y, parseInt(m) - 1, 1);
//       return date.toLocaleString('default', { month: 'short', year: 'numeric' });
//     }
//     if (tf === 'week') return key;
//   };

//   const generateChartData = (data, dateField, tf) => {
//     const agg = {};
//     data.forEach(item => {
//       const key = getSortableKey(item[dateField], tf);
//       if (key) {
//         agg[key] = (agg[key] || 0) + (parseFloat(item.units) || 0);
//       }
//     });

//     return Object.keys(agg)
//       .sort()
//       .map(key => ({
//         name: formatLabel(key, tf),
//         Amount: agg[key]
//       }));
//   };

//   return (
//     <Container className="mt-5 mb-1">
//       {/* 1. Greeting Section */}
//       <Row className="mb-3">
//         <Col>
//           <h2 className="fw-bold" style={{ color: "#1B5E20" }}>
//             Welcome {userName ? userName.split(" ")[0] : "Farmer"}!
//           </h2>
//         </Col>
//       </Row>

//       {/* 2. Pre-Declaration Workflow Guide Panel */}
//       <Row className="mb-4">
//         <Col>
//           <Card className="shadow-sm border-0 p-4 rounded-4 bg-white">
//             <Card.Body className="p-2">
//               <h4 className="fw-bold mb-2" style={{ color: "#1B5E20" }}>
//                 📋 Smart Farming Pre-Declaration Checklist
//               </h4>
//               <p className="text-muted mb-4">
//                 To maximize your profits and prevent oversupply in the market, we highly recommend checking existing agricultural data <strong>before declaring a new crop</strong>. Use the integrated platform steps below:
//               </p>

//               <Row className="g-3 text-start mb-4">
//                 <Col md={3}>
//                   <Card className="h-100 border-0 shadow-sm bg-light">
//                     <Card.Body className="p-3">
//                       <div className="d-flex align-items-center mb-2">
//                         <span className="fs-4 me-2">📊</span>
//                         <h6 className="fw-bold m-0" style={{ color: "#1B5E20" }}>1. Track Forecasting</h6>
//                       </div>
//                       <Card.Text className="text-muted small">
//                         Go to the <strong>Forecasting</strong> page to analyze real-time market supply predictions. Check for oversupply warnings to see if your crop choice matches target demands.
//                       </Card.Text>
//                     </Card.Body>
//                   </Card>
//                 </Col>

//                 <Col md={3}>
//                   <Card className="h-100 border-0 shadow-sm bg-light">
//                     <Card.Body className="p-3">
//                       <div className="d-flex align-items-center mb-2">
//                         <span className="fs-4 me-2">💰</span>
//                         <h6 className="fw-bold m-0" style={{ color: "#D84315" }}>2. Monitor Pricing</h6>
//                       </div>
//                       <Card.Text className="text-muted small">
//                         Check the <strong>Pricing</strong> tab to review seasonal price fluctuations. Understanding historical average spikes ensures you plant when yield revenue is at its highest.
//                       </Card.Text>
//                     </Card.Body>
//                   </Card>
//                 </Col>

//                 <Col md={3}>
//                   <Card className="h-100 border-0 shadow-sm bg-light">
//                     <Card.Body className="p-3">
//                       <div className="d-flex align-items-center mb-2">
//                         <span className="fs-4 me-2">📅</span>
//                         <h6 className="fw-bold m-0" style={{ color: "#2E7D32" }}>3. Review Calendar</h6>
//                       </div>
//                       <Card.Text className="text-muted small">
//                         Inspect the <strong>Calendar</strong> page to see currently active regional timelines. Coordinating dates helps avoid congested crop harvesting weeks.
//                       </Card.Text>
//                     </Card.Body>
//                   </Card>
//                 </Col>

//                 <Col md={3}>
//                   <Card className="h-100 border-0 shadow-sm bg-light">
//                     <Card.Body className="p-3">
//                       <div className="d-flex align-items-center mb-2">
//                         <span className="fs-4 me-2">📈</span>
//                         <h6 className="fw-bold m-0" style={{ color: "#0288D1" }}>4. Evaluate Crop Table</h6>
//                       </div>
//                       <Card.Text className="text-muted small">
//                         Verify regional metrics logs in the <strong>Crop Table</strong>. Compare exact kilograms currently cultivated against harvesting volumes for your vegetable selection.
//                       </Card.Text>
//                     </Card.Body>
//                   </Card>
//                 </Col>
//               </Row>

//               <div className="text-center">
//                 <Button 
//                   variant="success" 
//                   size="lg" 
//                   className="px-5 py-2 fw-bold rounded-pill shadow-sm"
//                   onClick={() => navigate("/product-declaration")}
//                   style={{ backgroundColor: "#34a65e", borderColor: "#34a65e" }}
//                 >
//                   🚀 Ready? Declare Your Product
//                 </Button>
//               </div>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
        
//       {/* 🛠️ ASYNC STATUS HANDLERS */}
//       {loading && (
//         <div className="text-center my-5">
//           <Spinner animation="border" variant="success" />
//           <p className="text-muted mt-2">Connecting to live cloud data environment...</p>
//         </div>
//       )}

//       {error && (
//         <Alert variant="danger" className="my-3">
//           ⚠️ Server Link Issue: {error}. Double-check that your Render service is active.
//         </Alert>
//       )}

//       {/* 8. Cultivation Map */}
//       {!loading && !error && (
//         <div className="mt-5 mb-5">
//           <h4 className="fw-bold mb-3" style={{ color: "#1B5E20" }}>📊 District-wise Production</h4>
//           <Card className="p-3 shadow-sm border-0 rounded-4">
//             <DistrictDataTable locations={filteredLocations} />
//           </Card>
//         </div>
//       )}

//       {/* About Us Details */}
//       <div>
//         {/* Vision & Mission Section */}
//         <section className="vision-mission-section glass-border mb-4">
//           <div className="section-content p-4">
//             <h2 style={{ color: "#1B5E20", fontWeight: "bold" }}>Our Vision</h2>
//             <p>To enhance Sri Lanka’s agricultural productivity through sustainable practices and modern solutions.</p>

//             <h2 className="mt-5" style={{ color: "#1B5E20", fontWeight: "bold" }}>Our Mission</h2>
//             <p>To support farmers nationwide, provide accurate agricultural information, and promote eco-friendly farming techniques.</p>
//           </div>
//         </section>

//         {/* Contact Details Section */}
//         <section className="contact-section glass-border mb-4">
//           <div className="section-content p-4">
//             <h2 style={{ color: "#1B5E20", fontWeight: "bold" }}>Contact Us</h2>
//             <p>Department of Agriculture, Peradeniya, Sri Lanka</p>
//             <p>Email: info@agri.gov.lk | Phone: +94 81 238 9000</p>
//           </div>
//         </section>

//         {/* Authorized by Government */}
//         <section className="authorization-section glass-border">
//           <div className="section-content p-4">
//             <h2 style={{ color: "#1B5E20", fontWeight: "bold" }}>Authorized By</h2>
//             <p>The Government of Sri Lanka - Department of Agriculture</p>
//           </div>
//         </section>
//       </div>
//     </Container>
//   );
// };

// export default Dashboard;


import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Card, Spinner, Alert, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import DistrictDataTable from "./DistrictDataTable";
import "../CSS/Dashboard.css";

const Dashboard = () => {
  const [selectedVeg, setSelectedVeg] = useState("All");
  const [timeframe, setTimeframe] = useState("month"); // ✨ Fixed: Added missing timeframe state
  const [allDeclarations, setAllDeclarations] = useState([]);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const BACKEND_URL = "https://ecochain-dashboard-backend.onrender.com";

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.fullName) {
      setUserName(user.fullName);
    }

    const fetchDeclarations = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BACKEND_URL}/api/declarations`);
        const result = await response.json();
        
        if (response.ok && result.success) {
          setAllDeclarations(result.data);
        } else {
          throw new Error(result.error || "Failed to retrieve records");
        }
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDeclarations();
  }, [BACKEND_URL]);

  const productSet = new Set(allDeclarations.map(d => (d.product || "").trim()).filter(Boolean));
  const productsFromData = Array.from(productSet).sort();

  // --- FILTER LOGIC ---
  const filteredLocations = allDeclarations.filter(item => {
    if (!item || !item.product) return false;
    if (selectedVeg === "All") return true;
    return item.product.trim().toLowerCase() === selectedVeg.trim().toLowerCase();
  });

  // --- GRAPH DATA PROCESSING HELPER ---
  const getSortableKey = (dateStr, tf) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null; 
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    if (tf === 'year') return `${year}`;
    if (tf === 'month') return `${year}-${month}`;
    if (tf === 'week') {
      const firstDay = new Date(year, 0, 1);
      const pastDays = (d - firstDay) / 86400000;
      const weekNum = Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
      return `${year}-W${String(weekNum).padStart(2, '0')}`;
    }
  };

  const formatLabel = (key, tf) => {
    if (tf === 'year') return key;
    if (tf === 'month') {
      const [y, m] = key.split('-');
      const date = new Date(y, parseInt(m) - 1, 1);
      return date.toLocaleString('default', { month: 'short', year: 'numeric' });
    }
    if (tf === 'week') return key;
  };

  const generateChartData = (data, dateField, tf) => {
    const agg = {};
    data.forEach(item => {
      const key = getSortableKey(item[dateField], tf);
      if (key) {
        // ✨ Fixed: Explicitly using item.units to match your DB schema
        agg[key] = (agg[key] || 0) + (parseFloat(item.units) || 0);
      }
    });

    return Object.keys(agg)
      .sort()
      .map(key => ({
        name: formatLabel(key, tf),
        Amount: agg[key]
      }));
  };

  // ✨ Fixed: Un-commented and activated chart generators
  const cultivationChartData = generateChartData(filteredLocations, "cultivationStart", timeframe);
  const harvestChartData = generateChartData(filteredLocations, "harvestingDate", timeframe);

  return (
    <Container className="mt-5 mb-1">
      {/* Greeting Section */}
      <Row className="mb-3">
        <Col>
          <h2 className="fw-bold" style={{ color: "#1B5E20" }}>
            Welcome {userName ? userName.split(" ")[0] : "Farmer"}!
          </h2>
        </Col>
      </Row>

      {/* Pre-Declaration Workflow Guide Panel */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm border-0 p-4 rounded-4 bg-white">
            <Card.Body className="p-2">
              <h4 className="fw-bold mb-2" style={{ color: "#1B5E20" }}>
                📋 Smart Farming Pre-Declaration Checklist
              </h4>
              <p className="text-muted mb-4">
                To maximize your profits and prevent oversupply in the market, we highly recommend checking existing agricultural data <strong>before declaring a new crop</strong>. Use the integrated platform steps below:
              </p>

              <Row className="g-3 text-start mb-4">
                <Col md={3}>
                  <Card className="h-100 border-0 shadow-sm bg-light">
                    <Card.Body className="p-3">
                      <div className="d-flex align-items-center mb-2">
                        <span className="fs-4 me-2">📊</span>
                        <h6 className="fw-bold m-0" style={{ color: "#1B5E20" }}>1. Track Forecasting</h6>
                      </div>
                      <Card.Text className="text-muted small">
                        Go to the <strong>Forecasting</strong> page to analyze real-time market supply predictions. Check for oversupply warnings to see if your crop choice matches target demands.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={3}>
                  <Card className="h-100 border-0 shadow-sm bg-light">
                    <Card.Body className="p-3">
                      <div className="d-flex align-items-center mb-2">
                        <span className="fs-4 me-2">💰</span>
                        <h6 className="fw-bold m-0" style={{ color: "#D84315" }}>2. Monitor Pricing</h6>
                      </div>
                      <Card.Text className="text-muted small">
                        Check the <strong>Pricing</strong> tab to review seasonal price fluctuations. Understanding historical average spikes ensures you plant when yield revenue is at its highest.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={3}>
                  <Card className="h-100 border-0 shadow-sm bg-light">
                    <Card.Body className="p-3">
                      <div className="d-flex align-items-center mb-2">
                        <span className="fs-4 me-2">📅</span>
                        <h6 className="fw-bold m-0" style={{ color: "#2E7D32" }}>3. Review Calendar</h6>
                      </div>
                      <Card.Text className="text-muted small">
                        Inspect the <strong>Calendar</strong> page to see currently active regional timelines. Coordinating dates helps avoid congested crop harvesting weeks.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={3}>
                  <Card className="h-100 border-0 shadow-sm bg-light">
                    <Card.Body className="p-3">
                      <div className="d-flex align-items-center mb-2">
                        <span className="fs-4 me-2">📈</span>
                        <h6 className="fw-bold m-0" style={{ color: "#0288D1" }}>4. Evaluate Crop Table</h6>
                      </div>
                      <Card.Text className="text-muted small">
                        Verify regional metrics logs in the <strong>Crop Table</strong>. Compare exact kilograms currently cultivated against harvesting volumes for your vegetable selection.
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <div className="text-center">
                <Button 
                  variant="success" 
                  size="lg" 
                  className="px-5 py-2 fw-bold rounded-pill shadow-sm"
                  onClick={() => navigate("/product-declaration")}
                  style={{ backgroundColor: "#34a65e", borderColor: "#34a65e" }}
                >
                  🚀 Ready? Declare Your Product
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Dynamic Controls Filter Strip */}
      {!loading && !error && (
        <Row className="mb-4 g-3 align-items-center bg-light p-3 rounded-4 shadow-sm mx-0">
          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-bold text-dark mb-1">Filter Dashboard Vegetable</Form.Label>
              <Form.Select value={selectedVeg} onChange={(e) => setSelectedVeg(e.target.value)}>
                <option value="All">All Declared Vegetables</option>
                {productsFromData.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-bold text-dark mb-1">Chart Time Frame</Form.Label>
              <Form.Select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
                <option value="week">Weekly Distribution</option>
                <option value="month">Monthly Distribution</option>
                <option value="year">Annual Distribution</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      )}
        
      {/* Async Load Status Block */}
      {loading && (
        <div className="text-center my-5">
          <Spinner animation="border" variant="success" />
          <p className="text-muted mt-2">Syncing database metrics components...</p>
        </div>
      )}

      {error && (
        <Alert variant="danger" className="my-3">
          ⚠️ Connection Interrupted: {error}
        </Alert>
      )}

      {/* Interactive Graph Components & Tables */}
      {!loading && !error && (
        <>
          <Row className="mb-5 g-4">
            <Col md={6}>
              <Card className="p-3 shadow-sm border-0 rounded-4 h-100">
                <h5 className="fw-bold mb-3" style={{ color: "#1B5E20" }}>📈 Cultivation Progression Trends (kg)</h5>
                <div style={{ width: '100%', height: 250 }}>
                  {cultivationChartData.length > 0 ? (
                    <ResponsiveContainer>
                      <LineChart data={cultivationChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="Amount" stroke="#2E7D32" strokeWidth={3} activeDot={{ r: 8 }} name="Cultivated Vol" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center text-muted py-5">No metrics available for this crop framework yet.</div>
                  )}
                </div>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card className="p-3 shadow-sm border-0 rounded-4 h-100">
                <h5 className="fw-bold mb-3" style={{ color: "#D84315" }}>📉 Anticipated Harvest Yields (kg)</h5>
                <div style={{ width: '100%', height: 250 }}>
                  {harvestChartData.length > 0 ? (
                    <ResponsiveContainer>
                      <LineChart data={harvestChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="Amount" stroke="#D84315" strokeWidth={3} name="Expected Harvest" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center text-muted py-5">No projected timeline data records found.</div>
                  )}
                </div>
              </Card>
            </Col>
          </Row>

          {/* District Output Metrics */}
          <div className="mt-4 mb-5">
            <h4 className="fw-bold mb-3" style={{ color: "#1B5E20" }}>📊 Detailed Yield Matrix Log</h4>
            <Card className="p-3 shadow-sm border-0 rounded-4">
              {filteredLocations.length > 0 ? (
                <DistrictDataTable locations={filteredLocations} />
              ) : (
                <div className="text-center text-muted py-4">No parameters logged for this vegetable frame.</div>
              )}
            </Card>
          </div>
        </>
      )}

      {/* Footer Branding Info */}
      <div>
        <section className="vision-mission-section glass-border mb-4">
          <div className="section-content p-4">
            <h2 style={{ color: "#1B5E20", fontWeight: "bold" }}>Our Vision</h2>
            <p>To enhance Sri Lanka’s agricultural productivity through sustainable practices and modern solutions.</p>
            <h2 className="mt-5" style={{ color: "#1B5E20", fontWeight: "bold" }}>Our Mission</h2>
            <p>To support farmers nationwide, provide accurate agricultural information, and promote eco-friendly farming techniques.</p>
          </div>
        </section>

        <section className="contact-section glass-border mb-4">
          <div className="section-content p-4">
            <h2 style={{ color: "#1B5E20", fontWeight: "bold" }}>Contact Us</h2>
            <p>Department of Agriculture, Peradeniya, Sri Lanka</p>
            <p>Email: info@agri.gov.lk | Phone: +94 81 238 9000</p>
          </div>
        </section>

        <section className="authorization-section glass-border">
          <div className="section-content p-4">
            <h2 style={{ color: "#1B5E20", fontWeight: "bold" }}>Authorized By</h2>
            <p>The Government of Sri Lanka - Department of Agriculture</p>
          </div>
        </section>
      </div>
    </Container>
  );
};

export default Dashboard;

