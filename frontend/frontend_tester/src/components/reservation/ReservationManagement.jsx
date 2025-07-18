import React, { useState, useEffect } from 'react';
import { Routes, Route, Outlet, useNavigate, useLocation } from 'react-router-dom';
import ReservationSidebar from './ReservationSidebar';
import MakeReservation from './MakeReservation';

const ReservationManagement = () => {
  console.log('Rendering ReservationManagement');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  console.log('Current location:', location.pathname);

  const toggleSidebar = () => {
    console.log('Toggling sidebar');
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Debug: Log the current user role and authentication status
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    console.log('Current user role:', userRole);
    console.log('Is user authenticated?', !!localStorage.getItem('token'));
  }, []);

  return (
    <div className="layout-container">
      
      <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <header className="content-header">
          <h1>Welcome to Reservation Management</h1>
        </header>
        
        <main className="content-body">
          <Outlet />
        </main>
        
        <footer className="content-footer">
          <p>&copy; 2025 Parking Reservation System</p>
        </footer>
      </div>
    </div>
  );
};

export default ReservationManagement;
