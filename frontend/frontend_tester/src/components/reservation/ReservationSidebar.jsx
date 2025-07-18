import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';

const ReservationSidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <div className={`reservation-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          {/* Empty logo container */}
        </div>
        <button 
          className="sidebar-toggle" 
          onClick={toggleSidebar}
        >
          {isOpen ? '←' : '→'}
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
            {isOpen && <span className="nav-text">Dashboard</span>}
          </NavLink>
          
          <NavLink 
            to="/cars" 
            className={({ isActive }) => 
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span className="nav-icon">🚗</span>
            {isOpen && <span className="nav-text">Manage Cars</span>}
          </NavLink>
          
          <NavLink 
            to="/slots" 
            className={({ isActive }) => 
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span className="nav-icon">🅿️</span>
            {isOpen && <span className="nav-text">Manage Slots</span>}
          </NavLink>
          
          <NavLink 
            to="/checkins" 
            className={({ isActive }) => 
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span className="nav-icon">✓</span>
            {isOpen && <span className="nav-text">Check-ins</span>}
          </NavLink>
          
          <NavLink 
            to="/viewreservations" 
            className={({ isActive }) => 
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span className="nav-icon">📅</span>
            {isOpen && <span className="nav-text">Reservations</span>}
          </NavLink>
          
          <NavLink 
            to="/viewagentprice" 
            className={({ isActive }) => 
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span className="nav-icon">💰</span>
            {isOpen && <span className="nav-text">Pricing</span>}
          </NavLink>
        </nav>
        
        <div className="sidebar-footer">
          <NavLink 
            to="/agent-dashboard" 
            className="nav-item"
          >
            <FaHome className="nav-icon" />
            {isOpen && <span>Agent Dashboard</span>}
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default ReservationSidebar;