import { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { userService, parkingSlotService } from '../services/api';
import './AdminDashboard.css';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    agents: 0,
    totalParkingSlots: 0,
    availableParkingSlots: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const userName = localStorage.getItem('userName');
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
    
    // Redirect if not admin
    if (userRole !== 'admin') {
      navigate('/agent-dashboard');
      return;
    }
    
    fetchDashboardData();
  }, [navigate]);
  
  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch stats in parallel
      const [
        totalUsersRes,
        activeUsersRes, 
        agentsRes,
        totalParkingSlotsRes,
        availableParkingSlotsRes
      ] = await Promise.all([
        userService.countAllUsers(),
        userService.countActiveUsers(),
        userService.countAgents(),
        parkingSlotService.getAllParkingSlots(),
        parkingSlotService.countAvailableParkingSlots()
      ]);
      
      setStats({
        totalUsers: totalUsersRes.data.count || 0,
        activeUsers: activeUsersRes.data.count || 0,
        agents: agentsRes.data.count || 0,
        totalParkingSlots: totalParkingSlotsRes.data.parkingslotnumber || 0,
        availableParkingSlots: availableParkingSlotsRes.data.available_parking_slots || 0
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard statistics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard-container">
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
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
          <NavLink 
            to="/admin-dashboard"
            className={({ isActive }) => 
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">Dashboard</span>
          </NavLink>
          
          <NavLink 
            to="/users/list"
            className={({ isActive }) => 
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span className="nav-icon">👥</span>
            <span className="nav-text">Manage Users</span>
          </NavLink>
          
          <NavLink 
            to="/parking/list"
            className={({ isActive }) => 
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span className="nav-icon">🅿️</span>
            <span className="nav-text">Manage Parking Areas</span>
          </NavLink>
          
          <NavLink 
            to="/users/stats"
            className={({ isActive }) => 
              isActive ? "nav-item active" : "nav-item"
            }
          >
            <span className="nav-icon">📃</span>
            <span className="nav-text">View Stats</span>
          </NavLink>
        </nav>
      </div>
      
      <div className={`main-content ${sidebarOpen ? 'with-sidebar-open' : 'with-sidebar-closed'}`}>
        <header className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <div className="user-info">
            <span style={{fontWeight: 'bold', fontSize: '20px'}}>Welcome, {userName || 'Admin'}</span>
          </div>
        </header>
        
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading dashboard statistics...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p>{error}</p>
          </div>
        ) : (
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="stat-number">{stats.totalUsers}</p>
            </div>
            <div className="stat-card">
              <h3>Active Users</h3>
              <p className="stat-number">{stats.activeUsers}</p>
            </div>
            <div className="stat-card">
              <h3>Agents</h3>
              <p className="stat-number">{stats.agents}</p>
            </div>
            <div className="stat-card">
              <h3>Total Parking Slots</h3>
              <p className="stat-number">{stats.totalParkingSlots}</p>
            </div>
            <div className="stat-card">
              <h3>Available Slots</h3>
              <p className="stat-number">{stats.availableParkingSlots}</p>
            </div>
          </div>
        )}
        
        <footer className="dashboard-footer">
          <p> 2025 Smart Parking Management System</p>
        </footer>
      </div>
    </div>
  );
}

export default AdminDashboard;
