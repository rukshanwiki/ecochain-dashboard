import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './CSS/App.css';

import Header from './Components/Header';
import HeaderAdmin from './Components/HeaderAdmin';
import Admin from './Components/Admin';
import Hero from './Components/Hero';
import Footer from './Components/Footer';
import HeaderLogged from './Components/HeaderLogged';
import Dashboard from './Components/Dashboard';
import ProductDeclaration from './Components/ProductDeclaration'; // new page
import Forecasting from './Components/Forecasting';
import PrivateRoute from './Components/PrivateRoute';
import CultivationMap from './Components/CultivationMap';
import CalendarPage from './Components/CalendarPage';
import AboutUs from './Components/AboutUs';
import ScrollToTop from './Components/ScrollToTop';
import { Navigate } from 'react-router-dom';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
      return localStorage.getItem("isLoggedIn") === "true";
    });

    const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem("role") || null; // "farmer" or "admin"
    });


    useEffect(() => {
      localStorage.setItem("isLoggedIn", isLoggedIn);
      if (userRole){
        localStorage.setItem('role',userRole);
      }
    }, [isLoggedIn, userRole]);

    const locations = [
      { crop : "Tomato", area: "Gampaha", position: [7.0917, 79.9947]},
      { crop: "Carrot", area: "Nuwara Eliya", position: [6.9707, 80.7829] },
      { crop: "Pumpkin", area: "Anuradhapura", position: [8.3114, 80.4037] },
    ];


  return (
    <Router>
      <ScrollToTop />
      <div className="App" style={{ backgroundColor: "rgb(216 213 213)", minHeight: "100vh" }}>
        {isLoggedIn ? (
          <>
            {userRole === "admin" ? (
              <HeaderAdmin setIsLoggedIn={setIsLoggedIn} />
            ) : (
              <HeaderLogged setIsLoggedIn={setIsLoggedIn} />
            )}

            <div className="main-content">
              <Routes>
                <Route path="/dashboard" element={
                  <PrivateRoute isLoggedIn={isLoggedIn && userRole === 'farmer'}>
                    <Dashboard />
                  </PrivateRoute>
                } />

                <Route path="/calendar-page" element={
                  <PrivateRoute isLoggedIn={isLoggedIn && userRole === 'farmer'}>
                    <CalendarPage />
                  </PrivateRoute>
                } />

                <Route path="/about-us" element={
                  <PrivateRoute isLoggedIn={isLoggedIn && userRole === 'farmer'}>
                    <AboutUs />
                  </PrivateRoute>
                } />

                <Route path="/product-declaration" element={
                  <PrivateRoute isLoggedIn={isLoggedIn && userRole === "farmer"}>
                    <ProductDeclaration />
                  </PrivateRoute>
                } />

                <Route path="/forecasting" element={
                  <PrivateRoute isLoggedIn={isLoggedIn && userRole === "farmer"}>
                    <Forecasting />
                  </PrivateRoute>
                } />

                {/* Admin route */}
                <Route path="/admin" element={
                    <PrivateRoute isLoggedIn={isLoggedIn && userRole === "admin"}>
                      <Admin />
                      <div style={{ textAlign: "left", margin: "4rem 30px" }}>
                        <h2 style={{ marginBottom: "1rem", marginLeft:'4rem' }}>Cultivation Map</h2>
                        
                        <div style={{ display: "flex", justifyContent: "center", margin: "2rem 0" }}>
                          <CultivationMap locations={locations} />
                        </div>
                      </div>
                    </PrivateRoute>
                  }
                />

                {/* Redirect any unknown routes */}
                <Route path="*" element={<Navigate to={userRole === "admin" ? "/admin" : "/dashboard"} />} />
              </Routes>

            </div>
            <Footer />
          </>
        ) : (
          <>
            <Header setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} />
            <Hero setIsLoggedIn={setIsLoggedIn} setUserRole={setUserRole} />
            <div style={{ textAlign: "left", margin: "4rem 30px" }}>
              <h2 style={{ marginBottom: "1rem", marginLeft:'4rem' }}>Cultivation Map</h2>
              
              <div style={{ display: "flex", justifyContent: "center", margin: "2rem 0" }}>
                <CultivationMap locations={locations} />
              </div>
            </div>
            <Footer />
          </>
        )}
      </div>
    </Router>
  );
}

export default App;




