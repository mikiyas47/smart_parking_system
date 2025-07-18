import React from 'react';
import { NavLink } from 'react-router-dom';
import './ParkingSlotSidebar.css';

const ParkingSlotSidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <div className={`parkingslot-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <span className="parking-icon">P</span>
          <span className="logo-text">Smart Parking</span>
        </div>
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {isOpen ? '←' : '→'}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink 
          to="/admin-dashboard"
          className={({ isActive }) => 
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="nav-icon">📊</span>
          <span className="nav-text">Dashboard</span>
        </NavLink>
        
        <NavLink 
          to="/users/list"
          className={({ isActive }) => 
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="nav-icon">👥</span>
          <span className="nav-text">Manage Users</span>
        </NavLink>
        
        <NavLink 
          to="/parking/list"
          className={({ isActive }) => 
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="nav-icon">🅿️</span>
          <span className="nav-text">Manage Parking Areas</span>
        </NavLink>
        
        <NavLink 
          to="/users/stats"
          className={({ isActive }) => 
            isActive ? "nav-item active" : "nav-item"
          }
        >
          <span className="nav-icon">📃</span>
          <span className="nav-text">View Stats</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default ParkingSlotSidebar;
