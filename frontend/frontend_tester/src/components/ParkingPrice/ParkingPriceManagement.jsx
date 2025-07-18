import React, { useState } from 'react';
import { Routes, Route, Outlet, useNavigate, useLocation } from 'react-router-dom';
import PriceSidebar from './PriceSidebar';
import ReservationAndHourlyPriceSetter from './ReservationAndHourlyPriceSetter';
import UpdatePrices from './UpdatePrices';
import ViewAgentPrices from './ViewAgentPrices';
import PaymentReport from './PaymentReport';
import './ParkingPriceManagement.css';

const ParkingPriceManagement = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="layout-container">
      <PriceSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <header className="content-header">
          <h1>Welcome to Parking Price Management</h1>
        </header>
        
        <main className="content-body">
          <Routes>
            <Route path="set-price" element={<ReservationAndHourlyPriceSetter />} />
            <Route path="update-prices" element={<UpdatePrices />} />
            <Route path="view-prices" element={<ViewAgentPrices />} />
            <Route path="payment-report" element={<PaymentReport />} />
            <Route index element={<ReservationAndHourlyPriceSetter />} />
          </Routes>
          <Outlet />
        </main>
        
        <footer className="content-footer">
          <p>&copy; 2025 Parking Management System</p>
        </footer>
      </div>
    </div>
  );
};

export default ParkingPriceManagement;
