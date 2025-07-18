import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { userService } from '../../services/api';
import './UserStyles.css';

const ViewUser = () => {
  const [user, setUser] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: ''
  });

  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the user email from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const userEmail = queryParams.get('email');

  useEffect(() => {
    if (userEmail) {
      fetchUser(userEmail);
    } else {
      // If no email is provided, switch to search mode
      setSearchMode(true);
      setLoading(false);
    }
  }, [userEmail]);

  const fetchUser = async (email) => {
    try {
      setLoading(true);
      const response = await userService.findUserByEmail(email);
      setUser(response.data);
      setSearchMode(false);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user:', error);
      
      let errorMessage = 'Failed to load user details.';
      
      // Handle 404 Not Found
      if (error.response && error.response.status === 404) {
        errorMessage = 'User not found.';
      }
      
      setError(errorMessage);
      setLoading(false);
      
      setNotification({
        show: true,
        message: errorMessage,
        type: 'error'
      });
      
      // Auto-dismiss notification after 10 seconds
      setTimeout(() => {
        setNotification({
          show: false,
          message: '',
          type: ''
        });
      }, 10000);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setNotification({
        show: true,
        message: 'Please enter an email address',
        type: 'error'
      });
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSearchResults([]);
      
      // Search by email only
      const response = await userService.findUserByEmail(searchTerm.trim());
      if (response.data) {
        setSearchResults([response.data]);
      } else {
        setSearchResults([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error searching user by email:', error);
      setError('Failed to search user by email');
      setLoading(false);
      
      setNotification({
        show: true,
        message: 'no user found. Please try again.',
        type: 'error'
      });
      
      setTimeout(() => {
        setNotification({
          show: false,
          message: '',
          type: ''
        });
      }, 10000);
    }
  };

  const handleSelectUser = (selectedUser) => {
    setUser(selectedUser);
    setSearchMode(false);
    // Update the URL to include the user email for bookmarking/sharing
    navigate(`/users/view?email=${encodeURIComponent(selectedUser.email)}`, { replace: true });
  };

  const handleBackToList = () => {
    navigate('/users/list');
  };

  const handleEditUser = () => {
    navigate(`/users/update?id=${userId}`);
  };

  // Render the search form
  if (searchMode) {
    return (
      <div className="user-component">
        <h2>Search Users</h2>
        
        {notification.show && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
            <button 
              className="close-btn"
              onClick={() => setNotification({ show: false, message: '', type: '' })}
            >
              &times;
            </button>
          </div>
        )}
        
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-container">
            <input
              type="email"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by email..."
              className="search-input"
              autoComplete="email"
            />
            <button type="submit" className="search-btn" disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
        
        <div className="search-results">
          {loading ? (
            <div className="loading">Searching...</div>
          ) : searchResults.length > 0 ? (
            <>
              <h3>Search Results ({searchResults.length})</h3>
              <div className="table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge ${user.role}`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${user.status}`}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="view-btn"
                            onClick={() => handleSelectUser(user)}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : searchTerm && !error ? (
            <div className="empty-message">{searchTerm}</div>
          ) : null}
        </div>
        
        <button className="back-btn" onClick={handleBackToList}>
          Back to User List
        </button>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="user-component">
        <div className="loading">Loading user details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-component">
        {notification.show && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
            <button 
              className="close-btn"
              onClick={() => setNotification({ show: false, message: '', type: '' })}
            >
              &times;
            </button>
          </div>
        )}
        <div className="error-message">{error}</div>
        <button className="back-btn" onClick={handleBackToList}>
          Back to User List
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="user-component">
        <div className="error-message">No user data found.</div>
        <button className="back-btn" onClick={handleBackToList}>
          Back to User List
        </button>
      </div>
    );
  }

  return (
    <div className="user-component">
      <h2>User Details</h2>
      
      <button className="search-toggle-btn" onClick={() => setSearchMode(true)}>
        Search Different User
      </button>
      
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
          <button 
            className="close-btn"
            onClick={() => setNotification({ show: false, message: '', type: '' })}
          >
            &times;
          </button>
        </div>
      )}
      
      <div className="user-details-container">
        <div className="user-detail-row">
          <div className="detail-label">ID:</div>
          <div className="detail-value">{user.id}</div>
        </div>
        
        <div className="user-detail-row">
          <div className="detail-label">Name:</div>
          <div className="detail-value">{user.name}</div>
        </div>
        
        <div className="user-detail-row">
          <div className="detail-label">Email:</div>
          <div className="detail-value">{user.email}</div>
        </div>
        
        <div className="user-detail-row">
          <div className="detail-label">Role:</div>
          <div className="detail-value">
            <span className={`role-badge ${user.role}`}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          </div>
        </div>
        
        <div className="user-detail-row">
          <div className="detail-label">Phone:</div>
          <div className="detail-value">{user.phone || 'N/A'}</div>
        </div>
        
        <div className="user-detail-row">
          <div className="detail-label">Status:</div>
          <div className="detail-value">
            <span className={`status-badge ${user.status}`}>
              {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
            </span>
          </div>
        </div>
        
        <div className="user-detail-row">
          <div className="detail-label">Created At:</div>
          <div className="detail-value">
            {new Date(user.created_at).toLocaleString()}
          </div>
        </div>
        
        <div className="user-detail-row">
          <div className="detail-label">Updated At:</div>
          <div className="detail-value">
            {new Date(user.updated_at).toLocaleString()}
          </div>
        </div>
      </div>
      
      <div className="user-actions">
        <button className="back-btn" onClick={handleBackToList}>
          Back to List
        </button>
        <button className="edit-btn" onClick={handleEditUser}>
          Edit User
        </button>
      </div>
    </div>
  );
};

export default ViewUser;
