import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './CarSidebar.css';

const CarSidebar = ({ isOpen, toggleSidebar }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebarWidth = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`car-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          {/* <span className="parking-icon">P</span> */}
          {/* {sidebarOpen && <span className="logo-text">Smart Parking</span>} */}
        </div>
        <button 
          className="sidebar-toggle" 
          onClick={toggleSidebarWidth}
        >
          {sidebarOpen ? '←' : '→'}
        </button>
      </div>
      
      <div className="sidebar-content">
        <nav className="sidebar-nav">
          <NavLink 
            to="/agent-dashboard" 
            className={({ isActive }) => 
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span className="nav-icon">📊</span>
            {sidebarOpen && <span className="nav-text">Dashboard</span>}
          </NavLink>
          
          <NavLink 
            to="/cars" 
            className={({ isActive }) => 
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span className="nav-icon">🚗</span>
            {sidebarOpen && <span className="nav-text">Manage Cars</span>}
          </NavLink>
          
          <NavLink 
            to="/slots" 
            className={({ isActive }) => 
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span className="nav-icon">🅿️</span>
            {sidebarOpen && <span className="nav-text">Manage Slots</span>}
          </NavLink>
          
          <NavLink 
            to="/checkins" 
            className={({ isActive }) => 
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span className="nav-icon">✓</span>
            {sidebarOpen && <span className="nav-text">Check-ins</span>}
          </NavLink>
          
          <NavLink 
            to="/viewreservations" 
            className={({ isActive }) => 
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span className="nav-icon">📅</span>
            {sidebarOpen && <span className="nav-text">Reservations</span>}
          </NavLink>

          {/* Added Pricing Link */}
          <NavLink 
            to="/viewagentprice" 
            className={({ isActive }) => 
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span className="nav-icon">💰</span>
            {sidebarOpen && <span className="nav-text">Pricing</span>}
          </NavLink>
        </nav>
        
        <div className="sidebar-footer">
          <NavLink 
            to="/agent-dashboard" 
            className="nav-item"
          >
            <i className="fas fa-home"></i>
            {sidebarOpen && <span>Agent Dashboard</span>}
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default CarSidebar;