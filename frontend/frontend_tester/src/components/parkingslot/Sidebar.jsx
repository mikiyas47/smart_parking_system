import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname.split('/')[1] || '';

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Parking System</h3>
      </div>
      <div className="sidebar-menu">
        <ul>
          <li className={currentPath === '' ? 'active' : ''}>
            <Link to="/">
              <i className="fas fa-home"></i>
              <span>Home</span>
            </Link>
          </li>
          <li className={currentPath === 'parking' ? 'active' : ''}>
            <Link to="/parking">
              <i className="fas fa-parking"></i>
              <span>Parking Areas</span>
            </Link>
          </li>
          <li className={currentPath === 'cars' ? 'active' : ''}>
            <Link to="/cars">
              <i className="fas fa-car"></i>
              <span>Car Management</span>
            </Link>
          </li>
          <li className={currentPath === 'slots' ? 'active' : ''}>
            <Link to="/slots">
              <i className="fas fa-map-marker-alt"></i>
              <span>Slot Management</span>
            </Link>
          </li>
          <li className={currentPath === 'checkins' ? 'active' : ''}>
            <Link to="/checkins">
              <i className="fas fa-clipboard-check"></i>
              <span>Check-In Management</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
