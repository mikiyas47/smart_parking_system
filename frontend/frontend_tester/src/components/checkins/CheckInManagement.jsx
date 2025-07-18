import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import TodayCheckInsWidget from './TodayCheckInsWidget';
import CheckInSidebar from './CheckInSidebar';
import '../parkingslot/ParkingManagement.css';
import './CheckInManagement.css';

function CheckInManagement() {
  const [activeTab, setActiveTab] = useState('car');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  // Update active tab based on current path
  useEffect(() => {
    const path = location.pathname.split('/');
    const currentTab = path[path.length - 1];
    if (currentTab === 'car' || currentTab === 'checkout' || currentTab === 'reports') {
      setActiveTab(currentTab);
    }
  }, [location]);
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/checkins/${tab}`);
  };

  return (
    <div className="layout-container">
      <CheckInSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <header className="content-header">
          <h1>Welcome to Check-In Management</h1>
        
        </header>
        
        
        <main className="content-body">
          <Outlet />
        </main>
        
        <footer className="content-footer">
          <p>&copy; 2025 Parking Check-In System</p>
        </footer>
      </div>
    </div>
  );
}

export default CheckInManagement;
