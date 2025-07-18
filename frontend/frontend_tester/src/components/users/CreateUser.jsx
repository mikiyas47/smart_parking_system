import React, { useState } from 'react';
import { userService } from '../../services/api';
import './UserStyles.css';

const CreateUser = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'agent',
    phone: '',
    status: 'active'
  });
  
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdUser, setCreatedUser] = useState(null);
  const [showUserCard, setShowUserCard] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Clear the error for this field when user changes the value
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Name cannot exceed 255 characters';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    } else if (formData.email.length > 255) {
      newErrors.email = 'Email cannot exceed 255 characters';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    // Role validation
    if (!['admin', 'agent'].includes(formData.role)) {
      newErrors.role = 'Role must be either admin or agent';
    }
    
    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.length > 15) {
      newErrors.phone = 'Phone number cannot exceed 15 characters';
    }
    
    // Status validation
    if (!['active', 'inactive'].includes(formData.status)) {
      newErrors.status = 'Status must be either active or inactive';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await userService.createUser(formData);
      
      setNotification({
        show: true,
        message: response.data.message || 'User registered successfully',
        type: 'success'
      });
      
      // Store the created user data and show the user card
      const userData = {
        ...formData,
        id: response.data.user ? response.data.user.id : 'N/A'
      };
      setCreatedUser(userData);
      setShowUserCard(true);
      
      // Auto-dismiss notification after 10 seconds
      setTimeout(() => {
        setNotification({
          show: false,
          message: '',
          type: ''
        });
      }, 10000);
      
    } catch (error) {
      
      console.error('Error creating user:', error);
      
      let errorMessage = 'Failed to create user';
      
      // Handle Laravel validation errors
      if (error.response && error.response.data && error.response.data.errors) {
        const serverErrors = error.response.data.errors;
        const newErrors = {};
        
        Object.keys(serverErrors).forEach(field => {
          newErrors[field] = serverErrors[field][0];
        });
        
        setErrors(newErrors);
        errorMessage = 'Please correct the errors in the form';
      } else if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCardOk = () => {
    // Hide the user card and reset the form for new entry
    setShowUserCard(false);
    setCreatedUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'agent',
      phone: '',
      status: 'active'
    });
  };

  return (
    <div className="user-component">
      <h2>Create New User</h2>
      
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
      
      {showUserCard && createdUser ? (
        <div className="user-card">
          <h3>User Created Successfully</h3>
          <div className="user-details">
           
            <p><strong>Name:</strong> {createdUser.name}</p>
            <p><strong>Email:</strong> {createdUser.email}</p>
            <p><strong>Role:</strong> {createdUser.role}</p>
            <p><strong>Phone:</strong> {createdUser.phone}</p>
            <p><strong>Status:</strong> {createdUser.status}</p>
          </div>
          <button className="submit-btn" onClick={handleCardOk}>OK</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="user-form">
        <div className="form-group">
          <label htmlFor="name">Full Name*</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          {errors.name && <div className="error-message">{errors.name}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email*</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {errors.email && <div className="error-message">{errors.email}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password*</label>
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button 
              type="button" 
              className="password-toggle" 
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? 
                <i className="password-eye">🙈</i> : 
                <i className="password-eye-slash">👁️</i>}
            </button>
          </div>
          {errors.password && <div className="error-message">{errors.password}</div>}
          <small className="helper-text">Must be at least 8 characters long</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="role">Role*</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="agent">Agent</option>
            <option value="admin">Admin</option>
          </select>
          {errors.role && <div className="error-message">{errors.role}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Phone Number*</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          {errors.phone && <div className="error-message">{errors.phone}</div>}
        </div>
        
        <div className="form-group">
          <label htmlFor="status">Status*</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {errors.status && <div className="error-message">{errors.status}</div>}
        </div>
        
        <button 
          type="submit" 
          className="submit-btn" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create User'}
        </button>
      </form>
      )}
    </div>
  );
};

export default CreateUser;
