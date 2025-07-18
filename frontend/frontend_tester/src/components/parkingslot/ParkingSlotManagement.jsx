import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import ParkingSlotSidebar from './ParkingSlotSidebar'
import './ParkingManagement.css'

function ParkingSlotManagement() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }
  

 
  
  return (
    <div className="layout-container">
      <ParkingSlotSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <header className="content-header">
          <h1>Parking Area Management</h1>
        </header>
        
        
        
        <main className="content-body">
          {/* This is where the nested routes will be rendered */}
          <Outlet />
        </main>
        
        <footer className="content-footer">
          <p>&copy; 2025 Parking Area Management System</p>
        </footer>
      </div>
    </div>
  )
}

export default ParkingSlotManagement
