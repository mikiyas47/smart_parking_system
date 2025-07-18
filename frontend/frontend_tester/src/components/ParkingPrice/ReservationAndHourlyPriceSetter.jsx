import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import parkingPriceService from '../../services/parkingPriceService';
import Notification from '../common/Notification';
import './ParkingPriceManagement.css';

const ReservationAndHourlyPriceSetter = () => {
  const [formData, setFormData] = useState({
    parking_slot_id: '',
    reservation_price: '',
    price_per_hour: ''
  });
  
  const [parkingAreas, setParkingAreas] = useState([]);
  const [agentName, setAgentName] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Fetch parking areas for the current agent
  useEffect(() => {
    const fetchParkingAreas = async () => {
      try {
        setLoading(true);
        const agentEmail = localStorage.getItem('UserEmail');
        if (!agentEmail) {
          setError('User not authenticated');
          return;
        }
        
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
        setError(err.response?.data?.message || 'Failed to fetch parking areas');
        console.error('Error fetching parking areas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchParkingAreas();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showNotification = (message, type = 'error') => {
    setNotification({ message, type });
    const timer = setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 15000);
    return () => clearTimeout(timer);
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
        email: agentEmail, // Using 'email' to match backend expectation
        parking_slot_id: formData.parking_slot_id,
        reservation_price: parseFloat(formData.reservation_price) || 0,
        price_per_hour: parseFloat(formData.price_per_hour) || 0
      };

      const response = await parkingPriceService.setReservationAndHourlyPrice(data);
      
      // Show success notification
      showNotification('Prices set successfully!', 'success');
      
      // Reset form but keep the selected parking area
      setFormData(prev => ({
        ...prev,
        reservation_price: '',
        price_per_hour: ''
      }));
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to set prices';
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
    <div className="reservation-price-setter">
      {notification.message && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ message: '', type: '' })}
        />
      )}
      <form onSubmit={handleSubmit} className="price-form">
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
            <label htmlFor="reservation_price">Reservation Price (ETB)</label>
            <input
              type="number"
              id="reservation_price"
              name="reservation_price"
              value={formData.reservation_price}
              onChange={handleChange}
              className="form-control"
              min="0"
              step="0.01"
              required
              disabled={isSubmitting}
              placeholder="Enter reservation price"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="price_per_hour">Price Per Hour (ETB)</label>
            <input
              type="number"
              id="price_per_hour"
              name="price_per_hour"
              value={formData.price_per_hour}
              onChange={handleChange}
              className="form-control"
              min="0"
              step="0.01"
              required
              disabled={isSubmitting}
              placeholder="Enter price per hour"
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Prices'}
            </button>
          </div>
        </form>
    </div>
  );
};

export default ReservationAndHourlyPriceSetter;
