import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import './Login.css';
import Header from './Header';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset error state
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      
      // Check response status
      if (response.data.status === 'success') {
        const userData = response.data.user;
        
        // Store user data in localStorage
        localStorage.setItem('UserEmail', userData.email);
        localStorage.setItem('userName', userData.name);
        localStorage.setItem('userRole', userData.role);
        
        // Redirect based on role
        if (userData.role === 'admin') {
          navigate('/admin-dashboard');
        } else if (userData.role === 'agent') {
          navigate('/agent-dashboard');
        } else {
          setError('Unknown user');
        }
      } else {
        // Handle unexpected success response format
        setError('Login failed: Unexpected response format');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (<>
  <Header/>
    <div className="login-container">
     
      <div className="login-card">
        <div className="card-logo">
          <span className="parking-icon">P</span>
        </div>
        <h1>Welcome to Smart Parking</h1>
        <h2>Login to your account</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
              <button 
                type="button" 
                className="password-toggle-btn" 
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <i className="eye-icon">{showPassword ? "👁️" : "👁️"}</i>
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          
          <div className="login-options">
            <Link to="/owner-landing" className="find-parking-link">Looking for parking? Click here</Link>
          </div>
        </form>
      </div>
      
      <footer className="login-footer">
        <p>© 2025 Smart Parking Management System</p>
      </footer>
    </div>
    </>
  );
}

export default Login;
