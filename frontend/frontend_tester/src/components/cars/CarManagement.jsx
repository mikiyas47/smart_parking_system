import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import CarSidebar from './CarSidebar'
import '../parkingslot/ParkingManagement.css'
import './CarManagement.css'


function CarManagement() {
  const [activeTab, setActiveTab] = useState('search')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }
  
  // Update active tab based on current path
  useEffect(() => {
    const path = location.pathname.split('/')
    const currentTab = path[path.length - 1]
    if (currentTab === 'register' || currentTab === 'search' || currentTab === 'update') {
      setActiveTab(currentTab)
    }
  }, [location])
  
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    navigate(`/cars/${tab}`)
  }
  
  return (
    <div className="layout-container">
      <CarSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        
        
        
        
        <main className="content-body">
          {/* This is where the nested routes will be rendered */}
          <Outlet />
        </main>
        
        <footer className="content-footer">
          <p>&copy; 2025 Smart parking Management System</p>
        </footer>
      </div>
    </div>
  )
}

export default CarManagement
