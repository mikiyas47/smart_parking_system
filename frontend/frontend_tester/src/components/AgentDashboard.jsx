import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { parkingSlotService } from '../services/api';
import './AgentDashboard.css';

function AgentDashboard() {
  const [stats, setStats] = useState({
    availableSpots: 0,
    unavailableSpots: 0,
    carsParkedToday: 0,
    revenueToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const userName = localStorage.getItem('userName');
  const UserEmail = localStorage.getItem('UserEmail');
  const navigate = useNavigate();
  
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
    
    // Redirect if not agent
    if (userRole !== 'agent') {
      navigate('/admin-dashboard');
      return;
    }
    
    fetchDashboardData();
  }, [navigate, UserEmail]);
  
  const fetchDashboardData = async () => {
    if (!UserEmail) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Get system-wide available and unavailable slots count
      const slotsCountResponse = await parkingSlotService.getAvailableAndUnavailableSlots();
      
      // Get today's check-ins
      const todayCheckInsResponse = await parkingSlotService.getTodayCheckIns(UserEmail);
      
      setStats({
        availableSpots: slotsCountResponse.data.available || 0,
        unavailableSpots: slotsCountResponse.data.unavailable || 0,
        carsParkedToday: todayCheckInsResponse.data.check_ins || 0,
        revenueToday: 0 // This would come from a real API in a production system
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard statistics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="agent-dashboard-container">
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            
          </div>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/agent-dashboard" className="nav-item active">
            <span className="nav-icon">📊</span>
            <span className="nav-text">Dashboard</span>
          </Link>
          <Link to="/cars" className="nav-item">
            <span className="nav-icon">🚗</span>
            <span className="nav-text">Manage Cars</span>
          </Link>
          <Link to="/slots" className="nav-item">
            <span className="nav-icon">🅿️</span>
            <span className="nav-text">Manage Slots</span>
          </Link>
          <Link to="/checkins" className="nav-item">
            <span className="nav-icon">✓</span>
            <span className="nav-text">Check-ins</span>
          </Link>
          <Link to="/viewreservations" className="nav-item">
            <span className="nav-icon">📅</span>
            <span className="nav-text">Reservations</span>
          </Link>
          <Link to="/viewagentprice" className="nav-item">
            <span className="nav-icon">💰</span>
            <span className="nav-text">Pricing</span>
          </Link>
        </nav>
      </div>
      
      <div className="main-content" >
        <header className="dashboard-header">
          <h1>Agent Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {userName || 'Agent'}</span>
           
          </div>
        </header>
        
        {error && <div className="dashboard-error">{error}</div>}
        
        <div className="dashboard-welcome">
          <h2>Welcome, Agent!</h2>
          <p>Here's your parking management overview for today</p>
        </div>
        
        {loading ? (
          <div className="loading-indicator">Loading dashboard data...</div>
        ) : (
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Available Spots</h3>
              <div className="stat-value">{stats.availableSpots}</div>
            </div>
            
            <div className="stat-card">
              <h3>Occupied Spots</h3>
              <div className="stat-value">{stats.unavailableSpots}</div>
            </div>
            
            <div className="stat-card">
              <h3>Cars Parked Today</h3>
              <div className="stat-value">{stats.carsParkedToday}</div>
            </div>
            
            {/* <div className="stat-card">
              <h3>Revenue Today</h3>
              <div className="stat-value">${stats.revenueToday}</div>
            </div> */}
          </div>
        )}
        
        
        
        <footer className="dashboard-footer">
          <p>© 2025 User Management System</p>
        </footer>
      </div>
    </div>
  );
}

export default AgentDashboard;
