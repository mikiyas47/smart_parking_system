import { useState, useEffect } from 'react';
import { parkingSlotService } from '../../services/api';

const AvailableParkingSlots = () => {
  const [availableSlots, setAvailableSlots] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAvailableSlots();
  }, []);

  const fetchAvailableSlots = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await parkingSlotService.countAvailableParkingSlots();
      setAvailableSlots(response.data.available_parking_slots);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch available parking slots');
      console.error('Error fetching available slots:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="available-parking-slots">
      <h2>Available Parking Areas</h2>
      
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-count">{availableSlots}</div>
            <div className="stat-label">Available Parking areas</div>
          </div>
          <button 
            onClick={fetchAvailableSlots} 
            className="refresh-button"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
};

export default AvailableParkingSlots;
