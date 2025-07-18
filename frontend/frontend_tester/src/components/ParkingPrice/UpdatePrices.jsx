import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import parkingPriceService from '../../services/parkingPriceService';
import Notification from '../common/Notification';
import './ParkingPriceManagement.css';

const UpdatePrices = () => {
  const [formData, setFormData] = useState({
    parking_slot_id: '',
    updateType: 'reservation', // 'reservation' or 'hourly'
    price: ''
  });
  
  const [parkingAreas, setParkingAreas] = useState([]);
  const [agentName, setAgentName] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Check authentication and fetch parking areas for the current agent
  useEffect(() => {
    console.log('UpdatePrices mounted');
    // Note: The key is 'UserEmail' (with capital U) as set in the Login component
    const agentEmail = localStorage.getItem('UserEmail');
    const userRole = localStorage.getItem('userRole');
    console.log('User email:', agentEmail);
    console.log('User role:', userRole);
    
    if (!agentEmail || userRole !== 'agent') {
      console.error('Authentication check failed - redirecting to login');
      navigate('/login');
      return;
    }

    const fetchParkingAreas = async () => {
      try {
        setLoading(true);
        console.log('Fetching parking areas for agent:', agentEmail);
        
        const response = await parkingPriceService.getAgentParkingAreas(agentEmail);
        setParkingAreas(response.parking_slots || []);
        setAgentName(response.agent?.name || '');
        
        if (response.parking_slots && response.parking_slots.length > 0) {
          setFormData(prev => ({
            ...prev,
            parking_slot_id: response.parking_slots[0].id.toString()
          }));
        }
      } catch (err) {
        showNotification(err.response?.data?.message || 'Failed to fetch parking areas', 'error');
        console.error('Error fetching parking areas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchParkingAreas();
  }, []);

  const showNotification = (message, type = 'error') => {
    setNotification({ message, type });
    const timer = setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 15000);
    return () => clearTimeout(timer);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setNotification({ message: '', type: '' });

    try {
      const agentEmail = localStorage.getItem('UserEmail');
      if (!agentEmail) {
        throw new Error('User not authenticated');
      }

      const data = {
        email: agentEmail,
        parking_slot_id: formData.parking_slot_id,
        [formData.updateType === 'reservation' ? 'reservation_price' : 'price_per_hour']: parseFloat(formData.price) || 0
      };

      let response;
      if (formData.updateType === 'reservation') {
        response = await parkingPriceService.updateReservationPrice(data);
      } else {
        response = await parkingPriceService.updateHourlyPrice(data);
      }
      
      showNotification(`${formData.updateType === 'reservation' ? 'Reservation' : 'Hourly'} price updated successfully!`, 'success');
      
      // Reset form but keep the selected parking area and update type
      setFormData(prev => ({
        ...prev,
        price: ''
      }));
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || `Failed to update ${formData.updateType} price`;
      showNotification(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading parking areas...</p>
      </div>
    );
  }

  return (
    <div className="update-prices">
      {notification.message && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: '', type: '' })}
        />
      )}
      
      <form onSubmit={handleSubmit} className="price-form">
        <h2>Update Prices</h2>
        
        <div className="form-group">
          <label htmlFor="parking_slot_id">Parking Area</label>
          <select
            id="parking_slot_id"
            name="parking_slot_id"
            value={formData.parking_slot_id}
            onChange={handleChange}
            className="form-control parking-area-select"
            required
            disabled={isSubmitting || loading}
          >
            {parkingAreas.map(area => (
              <option key={area.id} value={area.id}>
                {area.name} - {area.location_name || 'N/A'}
                {area.city || area.sub_city || area.woreda ? ' (' : ''}
                {area.city ? `${area.city}` : ''}
                {area.sub_city ? `, ${area.sub_city}` : ''}
                {area.woreda ? `, Woreda ${area.woreda}` : ''}
                {area.city || area.sub_city || area.woreda ? ')' : ''}
              </option>
            ))}
          </select>
          {agentName && (
            <div className="agent-info">
              <small>Agent: {agentName}</small>
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label>Update Type</label>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="updateType"
                value="reservation"
                checked={formData.updateType === 'reservation'}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <span>Reservation Price</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="updateType"
                value="hourly"
                checked={formData.updateType === 'hourly'}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <span>Hourly Price</span>
            </label>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="price">
            {formData.updateType === 'reservation' ? 'Reservation Price' : 'Price Per Hour'} (ETB)
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="form-control"
            min="0"
            step="0.01"
            required
            disabled={isSubmitting}
            placeholder={`Enter ${formData.updateType === 'reservation' ? 'reservation' : 'hourly'} price`}
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : `Update ${formData.updateType === 'reservation' ? 'Reservation' : 'Hourly'} Price`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdatePrices;
