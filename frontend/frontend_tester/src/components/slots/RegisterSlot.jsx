import { useState, useEffect } from 'react';
import { parkingSlotService } from '../../services/api';
import './RegisterSlot.css';

function RegisterSlot() {
  // Form input states
  const [slotNumber, setSlotNumber] = useState('');
  const [status, setStatus] = useState('free');
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [loadingParkingSlots, setLoadingParkingSlots] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Parking slots data
  const [parkingSlots, setParkingSlots] = useState([]);
  const [selectedParkingSlot, setSelectedParkingSlot] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Fetch parking slots when component mounts
  useEffect(() => {
    const fetchParkingSlots = async () => {
      try {
        setLoadingParkingSlots(true);
        setError(null);
        
        // Get user ID from local storage
        const userId = localStorage.getItem('UserEmail');
       
        
        if (!userId) {
          throw new Error('User ID not found. Please login again.');
        }
        
        // Fetch parking slots for this agent
        const response = await parkingSlotService.getAgentParkingSlots(userId);
        
        if (response.data && response.data.parking_slots) {
          setParkingSlots(response.data.parking_slots);
        } else {
          throw new Error('No parking slots found or unexpected response format');
        }
      } catch (err) {
        console.error('Error fetching parking slots:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch parking slots');
      } finally {
        setLoadingParkingSlots(false);
      }
    };
    
    fetchParkingSlots();
  }, []);
  
  // Handle parking slot selection
  const handleParkingSlotSelect = (parkingSlot) => {
    setSelectedParkingSlot(parkingSlot);
    setShowForm(true);
    // Reset form and error/success messages
    setSlotNumber('');
    setStatus('free');
    setError(null);
    setSuccess(null);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Get user ID from local storage
      const userId = localStorage.getItem('UserEmail');
      
      if (!userId) {
        throw new Error('User ID not found. Please login again.');
      }
      
      if (!selectedParkingSlot) {
        throw new Error('No parking slot selected');
      }

      // Prepare data for API call
      const slotData = {
        agent_email: userId,
        parking_slot_id: selectedParkingSlot.id,
        slot_number: slotNumber,
        status: status
      };

      // Make API call to register the slot
      const response = await parkingSlotService.registerSlot(slotData);
      
      // Handle success
      setSuccess('Slot registered successfully!');
      setSlotNumber(''); // Reset form
      
      console.log('Slot registered:', response.data.slot);
    } catch (err) {
      // Handle error
      setError(
        err.response?.data?.message || 
        err.message || 
        'An error occurred while registering the slot'
      );
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Go back to parking slot selection
  const handleBackToSelection = () => {
    setShowForm(false);
    setSelectedParkingSlot(null);
  };

  return (
    <div className="register-slot-container">
      <h2>Register New Slot</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {success && (
        <div className="success-message">
          {success}
        </div>
      )}
      
      {loadingParkingSlots ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading parking Area...</p>
        </div>
      ) : parkingSlots.length === 0 ? (
        <div className="no-slots-message">
          No parking area found for this agent. You need to create a parking area first.
        </div>
      ) : !showForm ? (
        <div className="parking-slots-selection">
          <h3>Select a Parking Area:</h3>
          <div className="parking-slots-grid">
            {parkingSlots.map((parkingSlot) => (
              <div 
                key={parkingSlot.id}
                className="parking-slot-card"
                onClick={() => handleParkingSlotSelect(parkingSlot)}
              >
                <div className="parking-slot-header">
                  <h4>Parking area #{parkingSlot.id}</h4>
                </div>
                <div className="parking-slot-details">
                  <p><strong>City:</strong> {parkingSlot.city || 'N/A'}</p>
                  <p><strong>Location:</strong> {parkingSlot.location_name || 'N/A'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="slot-registration-form">
          <div className="selected-parking-slot-info">
            <h3>Selected Parking Area</h3>
            <div className="parking-slot-info">
              <p><strong>ID:</strong> {selectedParkingSlot.id}</p>
              <p><strong>City:</strong> {selectedParkingSlot.city || 'N/A'}</p>
              <p><strong>Sub City:</strong> {selectedParkingSlot.sub_city || 'N/A'}</p>
              <p><strong>Woreda:</strong> {selectedParkingSlot.woreda || 'N/A'}</p>
              <p><strong>Location:</strong> {selectedParkingSlot.location_name || 'N/A'}</p>
            </div>
            <button 
              type="button" 
              className="back-button"
              onClick={handleBackToSelection}
            >
              &larr; Change Parking area
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="register-slot-form">
            <div className="form-group">
              <label htmlFor="slotNumber">Slot Number *</label>
              <input
                type="text"
                id="slotNumber"
                value={slotNumber}
                onChange={(e) => setSlotNumber(e.target.value)}
                placeholder="Enter unique slot number"
                required
                disabled={loading}
              />
              <small>This must be unique across all slots</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                disabled={loading}
              >
                <option value="free">Free</option>
                <option value="occupied">Occupied</option>
              </select>
            </div>
            
            <button 
              type="submit" 
              className="register-button" 
              disabled={loading || !slotNumber.trim()}
            >
              {loading ? 'Registering...' : 'Register Slot'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default RegisterSlot;
