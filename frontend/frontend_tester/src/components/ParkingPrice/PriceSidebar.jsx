import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './PriceSidebar.css';

const PriceSidebar = ({ isOpen, toggleSidebar }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebarWidth = () => {
    setSidebarOpen(!sidebarOpen);
    toggleSidebar(); // Call the parent toggle function if needed
  };

  return (
    <div className={`price-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          {/* Empty logo container to match CarSidebar */}
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

export default PriceSidebar;