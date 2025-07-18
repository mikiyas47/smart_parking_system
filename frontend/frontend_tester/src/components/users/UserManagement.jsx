import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import UserSidebar from './UserSidebar';
import './UserManagement.css';

const UserManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Toggle sidebar open/closed
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Check if Font Awesome is already loaded, if not load it
  useEffect(() => {
    if (!document.getElementById('font-awesome-css')) {
      const link = document.createElement('link');
      link.id = 'font-awesome-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
      link.integrity = 'sha512-1ycn6IcaQQ40/MKBW2W4Rhis/DbILU74C1vSrLJxCq57o941Ym01SwNsOMqvEBFlcgUa6xLiPY/NS5R+E6ztJQ==';
      link.crossOrigin = 'anonymous';
      link.referrerPolicy = 'no-referrer';
      document.head.appendChild(link);
    }
  }, []);
  
  return (
    <div className="user-management-container">
      <UserSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className={`user-management-content ${sidebarOpen ? 'with-sidebar-open' : 'with-sidebar-closed'}`}>
        {/* <div className="content-header">
          <h1>Welcome to User Management</h1>
        </div> */}
        <div className="content-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
