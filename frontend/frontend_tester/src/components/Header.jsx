import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { authService } from '../services/api';
import './Header.css';

function Header() {
  const [isLoading, setIsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const userName = localStorage.getItem('userName');
  const userRole = localStorage.getItem('userRole');
  
  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      await authService.logout();
      // Clear local storage
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
      
      // Redirect to login page, but stay on the same page so the header remains
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      
      // Even if the API call fails, clear local storage and redirect
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  const getHomeRoute = () => {
    return userRole === 'admin' ? '/admin-dashboard' : '/agent-dashboard';
  };

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="logo-container">
          <span className="parking-icon">P</span>
          <span className="logo-text">Smart Parking</span>
          
          <button 
            className="mobile-menu-toggle" 
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
          >
            <span className="menu-icon"></span>
          </button>
        </div>
        
        <nav className={`main-nav ${mobileMenuOpen ? 'open' : ''}`}>
          <ul className="nav-links">
            {/* {userRole === 'admin' && (
              <>
                <li><Link to="/admin-dashboard" className={window.location.pathname === '/admin-dashboard' ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Dashboard</Link></li>
                <li><Link to="/users/list" className={window.location.pathname.includes('/users') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Users</Link></li>
                <li><Link to="/parking/list" className={window.location.pathname.includes('/parking') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Parking Areas</Link></li>
              </>
            )} */}
            
            {/* {userRole === 'agent' && (
              <>
                <li><Link to="/agent-dashboard" className={window.location.pathname === '/agent-dashboard' ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Dashboard</Link></li>
                <li><Link to="/cars" className={window.location.pathname.includes('/cars') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Cars</Link></li>
                <li><Link to="/slots" className={window.location.pathname.includes('/slots') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Parking Areas</Link></li>
                <li><Link to="/viewagentprice" className={window.location.pathname.includes('/viewagentprice') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Pricing</Link></li>
                <li><Link to="/checkins" className={window.location.pathname.includes('/checkins') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Check-ins</Link></li>
                <li><Link to="/viewreservations" className={window.location.pathname.includes('/viewreservations') ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Reservations</Link></li>
              </>
            )} */}
            
            <li><Link to="/about" className={window.location.pathname === '/about' ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>About Us</Link></li>
            <li><Link to="/contact" className={window.location.pathname === '/contact' ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Contact</Link></li>
           {isLoading? <li><Link to="/owner-landing" className={window.location.pathname === '/owner-landing' ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>Find Parking</Link></li>:null}
          </ul>
        </nav>
        
        <div className="user-section">
          {!userRole ? (
            <Link to="/login" className="login-link">Login</Link>
          ) : (
            <button 
              className="logout-button"  
              onClick={handleLogout} 
              disabled={isLoading} 
            >
              {isLoading ? 'Logging out...' : 'Logout'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
