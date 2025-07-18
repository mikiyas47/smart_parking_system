import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { userService } from '../../services/api';
import './UserStyles.css';

const UpdateUser = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    phone: '',
    status: ''
  });

  const [emailInput, setEmailInput] = useState('');
  const [userId, setUserId] = useState(null); // To store the ID for the update payload
  const [userFound, setUserFound] = useState(false);
  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(false); // Start with false
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: ''
  });

  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the user email from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const urlUserEmail = queryParams.get('email');

  useEffect(() => {
    if (urlUserEmail) {
      fetchUser(urlUserEmail);
    } else {
      // No email in URL, wait for user to search
      setLoading(false);
    }
  }, [urlUserEmail]);

  const handleEmailSearch = (e) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setNotification({
        show: true,
        message: 'Please enter an email address',
        type: 'error',
      });
      return;
    }
    fetchUser(emailInput);
  };

  const fetchUser = async (email) => {
    setSearching(true);
    setLoading(true);
    setUserFound(false);
    setError(null);

    try {
      const response = await userService.findUserByEmail(email);
      const userData = response.data;

      if (!userData) {
        throw new Error('User not found');
      }

      const { password, ...restData } = userData;

      setFormData(restData);
      setOriginalData(restData);
      setUserId(userData.id); // Store the user's ID for the update
      setUserFound(true);

      // Update URL with the email for consistency
      if (email !== urlUserEmail) {
        navigate(`/users/update?email=${email}`, { replace: true });
      }

      setNotification({
        show: true,
        message: 'User found successfully',
        type: 'success',
      });
      
      setTimeout(() => {
        setNotification({
          show: false,
          message: '',
          type: ''
        });
      }, 5000);
      
    } catch (error) {
      console.error('Error fetching user:', error);
      
      let errorMessage = 'Failed to load user details.';
      
      // Handle 404 Not Found
      if (error.response && error.response.status === 404) {
        errorMessage = `User with ID ${id} not found.`;
      }
      
      setError(errorMessage);
      setUserFound(false);
      
      setNotification({
        show: true,
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when field changes
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Only validate fields that have changed
    const changedFields = Object.keys(formData).filter(
      key => formData[key] !== originalData[key]
    );
    
    if (changedFields.length === 0) {
      setNotification({
        show: true,
        message: 'No changes to save',
        type: 'error'
      });
      return false;
    }
    
    // Validate changed fields
    changedFields.forEach(field => {
      switch (field) {
        case 'name':
          if (formData.name && formData.name.length > 255) {
            newErrors.name = 'Name cannot exceed 255 characters';
          }
          break;
          
        case 'email':
          if (formData.email) {
            if (!/\S+@\S+\.\S+/.test(formData.email)) {
              newErrors.email = 'Email is invalid';
            } else if (formData.email.length > 255) {
              newErrors.email = 'Email cannot exceed 255 characters';
            }
          }
          break;
          
        case 'password':
          if (formData.password && formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
          }
          break;
          
        case 'role':
          if (formData.role && !['admin', 'agent'].includes(formData.role)) {
            newErrors.role = 'Role must be either admin or agent';
          }
          break;
          
        case 'phone':
          if (formData.phone && formData.phone.length > 15) {
            newErrors.phone = 'Phone number cannot exceed 15 characters';
          }
          break;
          
        case 'status':
          if (formData.status && !['active', 'inactive'].includes(formData.status)) {
            newErrors.status = 'Status must be either active or inactive';
          }
          break;
        
        default:
          break;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const updatedData = Object.keys(formData).reduce((acc, key) => {
        if (formData[key] !== originalData[key]) {
          acc[key] = formData[key];
        }
        return acc;
      }, {});

      if (updatedData.password === '') {
        delete updatedData.password;
      }

      // The backend identifies the user by email, so we send the original email
      // for lookup, along with any fields that have been updated.
      const payload = { ...updatedData, email: originalData.email };

      await userService.updateUser(payload);

      setNotification({
        show: true,
        message: 'User updated successfully!',
        type: 'success',
      });

      setTimeout(() => {
        navigate('/users/list');
      }, 2000);
    } catch (error) {
      console.error('Error updating user:', error);
      let errorMessage = 'Failed to update user.';
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
        errorMessage = 'Please correct the validation errors.';
      } else if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      setError(errorMessage);
      setNotification({
        show: true,
        message: errorMessage,
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/users/list');
  };

  if (loading && !userFound) {
    return <div className="loading">Loading...</div>;
  }

  // If no user is found yet (and not loading), show the email search form
  if (!userFound) {
    return (
      <div className="user-component">
        <h2>Find User to Update</h2>
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

        <form onSubmit={handleEmailSearch} className="search-form">
          <div className="form-group">
            <label htmlFor="emailInput">User Email</label>
            <div className="search-container">
              <input
                type="email"
                id="emailInput"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter user's email..."
                className="search-input"
                required
              />
              <button type="submit" className="search-btn" disabled={searching}>
                {searching ? 'Searching...' : 'Find User'}
              </button>
            </div>
          </div>
        </form>

        {error && <div className="error-message">{error}</div>}

        <button className="back-btn" onClick={handleCancel}>
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

  return (
    <div className="user-component">
      <h2>Update User</h2>
      
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
      
      <form onSubmit={handleSubmit} className="user-form">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <div className="error-message">{errors.name}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled // Email is used as the identifier and cannot be changed here.
          />
          {errors.email && <div className="error-message">{errors.email}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password (leave blank to keep current)</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password || ''}
            onChange={handleChange}
            placeholder="Leave blank to keep current password"
          />
          {errors.password && <div className="error-message">{errors.password}</div>}
          <small className="helper-text">Must be at least 8 characters if provided</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
          </select>
          {errors.role && <div className="error-message">{errors.role}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
          />
          {errors.phone && <div className="error-message">{errors.phone}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {errors.status && <div className="error-message">{errors.status}</div>}
        </div>
        
        <div className="form-footer">
          <button
            type="button"
            className="cancel-btn"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={submitting}
          >
            {submitting ? 'Updating...' : 'Update User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateUser;
