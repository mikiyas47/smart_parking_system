import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import './UserSidebar.css';

function UserSidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const userName = localStorage.getItem('userName');
  const navigate = useNavigate();
  const location = useLocation();
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  useEffect(() => {
    // Check if user is logged in
    const userRole = localStorage.getItem('userRole');
    
    if (!userRole) {
      navigate('/login');
      return;
    }
    
    // Redirect if not admin
    if (userRole !== 'admin') {
      navigate('/agent-dashboard');
      return;
    }
  }, [navigate]);

  return (
    <div className={`user-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="logo-container">
          <span className="parking-icon">P</span>
          <span className="logo-text">Smart Parking</span>
        </div>
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {sidebarOpen ? '←' : '→'}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <Link to="/admin-dashboard" className={`nav-item ${location.pathname === '/admin-dashboard' ? 'active' : ''}`}>
          <span className="nav-icon">📊</span>
          <span className="nav-text">Dashboard</span>
        </Link>
        <Link to="/users/list" className={`nav-item ${location.pathname === '/users/list' ? 'active' : ''}`}>
          <span className="nav-icon">👥</span>
          <span className="nav-text">Manage Users</span>
        </Link>
        <Link to="/parking/list" className={`nav-item ${location.pathname === '/parking/list' ? 'active' : ''}`}>
          <span className="nav-icon">🅿️</span>
          <span className="nav-text">Manage Parking Areas</span>
        </Link>
        <Link to="/users/stats" className={`nav-item ${location.pathname === '/users/stats' ? 'active' : ''}`}>
          <span className="nav-icon">📃</span>
          <span className="nav-text">View Stats</span>
        </Link>
      </nav>
    </div>
  );
}

export default UserSidebar;
