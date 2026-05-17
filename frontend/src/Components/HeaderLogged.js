import React from 'react'
import logo from '../Images/LOGO.png'
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap'
import { Link } from 'react-router-dom'

const HeaderLogged = ({setIsLoggedIn}) => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container fluid>
        <Navbar.Brand as={Link} to='/dashboard' className="ms-3">
          <div>
            <img src={logo} alt="ecoChain Logo" width="200" height="50" style={{ objectFit: 'contain' }} />
          </div>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center">
              <div className='d-flex' style={{marginRight:'50px'}}>
                <Nav.Link as={Link} to='/dashboard' className='px-4'>Dashboard</Nav.Link>
                <Nav.Link as={Link} to='/pricing' className='px-4'>Pricing</Nav.Link>
                <Nav.Link as={Link} to='/calendar-page' className='px-4'>Calendar</Nav.Link>
                {/* ✅ Added Crop Table link here */}
                <Nav.Link as={Link} to='/crop-table' className='px-4'>Crop Table</Nav.Link>
                <Nav.Link as={Link} to='/forecasting' className='px-4'>Forecasting</Nav.Link>
                <Nav.Link as={Link} to='/product-declaration' className='px-4'>Product Decleration</Nav.Link>
              </div>

              <NavDropdown
                title={
                    /* ✅ Fixed: Changed <image> to <img> to ensure cross-browser compatibility */
                    <img
                        src="https://via.placeholder.com/40" 
                        alt="Profile"
                        className="rounded-circle"
                        style={{width: '40px', height: '40px', objectFit: 'cover'}}
                    />
                }
                id="profile-dropdown"
                align="end"
              >
                
                {/* User info section */}
              <NavDropdown.Header>
                <strong>John Doe</strong> <br />
                Farmer ID: <span style={{ fontSize: '0.9rem' }}>AG12345</span>
              </NavDropdown.Header>
              <NavDropdown.Divider />

              {/* Options */}
              <NavDropdown.Item href="#settings">⚙️ Settings</NavDropdown.Item>
              <NavDropdown.Item href="#profile">👤 Profile</NavDropdown.Item>
              <NavDropdown.Divider />

              <Nav.Link onClick={() => setIsLoggedIn(false)} className="px-4 text-danger fw-bold">
                Logout
              </Nav.Link>

              </NavDropdown>
            </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default HeaderLogged