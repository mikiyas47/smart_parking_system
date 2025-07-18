import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import SlotSidebar from './SlotSidebar';
import '../parkingslot/ParkingManagement.css';

function SlotManagement() {
  const [activeTab, setActiveTab] = useState('agent');
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
    if (currentTab === 'total' || currentTab === 'agent' || currentTab === 'register') {
      setActiveTab(currentTab);
    }
  }, [location]);
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/slots/${tab}`);
  };

  return (
    <div className="layout-container">
      <SlotSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <header className="content-header">
          <h1>welcome to Parking area Management</h1>
        </header>
        
        
        
        <main className="content-body">
          <Outlet />
        </main>
        
        <footer className="content-footer">
          <p>&copy; 2025 Slot Management System</p>
        </footer>
      </div>
    </div>
  );
}

export default SlotManagement;
