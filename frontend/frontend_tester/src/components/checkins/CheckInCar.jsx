import { useState, useEffect } from 'react';
import { parkingSlotService, carService } from '../../services/api';
import Modal from '../Modal';
import './CheckInCar.css';

function CheckInCar() {
  // Parking slots data
  const [parkingSlots, setParkingSlots] = useState([]);
  const [selectedParkingSlot, setSelectedParkingSlot] = useState(null);
  
  // Slots within the selected parking slot
  const [slots, setSlots] = useState([]);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  
  // Car check-in state
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [plateNumber, setPlateNumber] = useState('');
  const [carVerification, setCarVerification] = useState({
    status: null, // null, 'loading', 'verified', 'error'
    message: '',
    data: null
  });
  const [checkInLoading, setCheckInLoading] = useState(false);

  // Fetch parking slots when component mounts
  useEffect(() => {
    const fetchParkingSlots = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get user ID from local storage
        const UserEmail = localStorage.getItem('UserEmail');
        
        if (!UserEmail) {
          throw new Error('User email not found. Please login again.');
        }
        
        // Fetch parking slots for this agent
        const response = await parkingSlotService.getAgentParkingSlots(UserEmail);
        
        if (response.data && response.data.parking_slots) {
          setParkingSlots(response.data.parking_slots);
        } else {
          throw new Error('No parking slots found or unexpected response format');
        }
      } catch (err) {
        console.error('Error fetching parking slots:', err);
        setError(err.response?.data?.message || err.message || 'Failed to fetch parking slots');
      } finally {
        setLoading(false);
      }
    };
    
    fetchParkingSlots();
  }, []);
  
  // Handle parking slot selection and fetch its slots
  const handleParkingSlotSelect = async (parkingSlotId) => {
    try {
      const parkingSlot = parkingSlots.find(slot => slot.id === parkingSlotId);
      if (!parkingSlot) return;
      
      setSelectedParkingSlot(parkingSlot);
      setLoadingSlots(true);
      setSlots([]);
      setSelectedSlot(null);
      setPlateNumber('');
      setCarVerification({
        status: null,
        message: '',
        data: null
      });
      
      // Get user ID from local storage
      const UserEmail = localStorage.getItem('UserEmail');
      
      if (!UserEmail) {
        showNotification('User ID not found. Please login again.', 'error');
        setLoadingSlots(false);
        return;
      }
      
      // Fetch slots for the selected parking slot
      const response = await parkingSlotService.getAgentSlots(UserEmail, parkingSlot.id);
      
      if (response.data && response.data.slots) {
        setSlots(response.data.slots);
        
        if (response.data.slots.length > 0) {
          showNotification('Slots loaded successfully!');
        } else {
          showNotification('No slots found for this parking slot', 'warning');
        }
      } else {
        console.error('Unexpected slots API response format:', response.data);
        showNotification('Failed to load slots: Unexpected response format', 'error');
      }
    } catch (err) {
      console.error('Error fetching slots:', err);
      showNotification('Failed to fetch slots: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setLoadingSlots(false);
    }
  };
  
  // Handle selecting a slot for check-in
  const handleSlotSelect = (slot) => {
    if (slot.status !== 'free') {
      showNotification('Cannot select an occupied slot for check-in', 'warning');
      return;
    }
    
    setSelectedSlot(slot);
    setPlateNumber('');
    setCarVerification({
      status: null,
      message: '',
      data: null
    });
    setShowCheckInModal(true);
  };

  // Show notification message
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    
    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      setNotification(null);
    }, 10000);
  };
  
  // Handle plate number input change
  const handlePlateNumberChange = (e) => {
    setPlateNumber(e.target.value);
    // Reset verification status when plate number changes
    if (carVerification.status) {
      setCarVerification({
        status: null,
        message: '',
        data: null
      });
    }
  };
  
  // Verify if the car is registered and not already checked in somewhere else
  const verifyCarRegistration = async () => {
    if (!plateNumber.trim()) {
      showNotification('Please enter a plate number', 'error');
      return;
    }
    
    try {
      setCarVerification({
        status: 'loading',
        message: 'Verifying car...',
        data: null
      });

      // First, check if the car is registered
      const response = await carService.searchCar(plateNumber);
      
      // Now check if the car is already checked in somewhere
      try {
        const alreadyCheckedInResponse = await carService.checkIfCarAlreadyCheckedIn(plateNumber);
        
        // If we get a successful response, it means the car is already checked in somewhere
        if (alreadyCheckedInResponse.data && alreadyCheckedInResponse.data.data) {
          const checkinData = alreadyCheckedInResponse.data.data[0];
          setCarVerification({
            status: 'error',
            message: `This car is already checked in at slot #${checkinData.slot_id} and has not been checked out yet.`,
            data: null
          });
          
          showNotification(`Cannot check in: Car is already checked in at slot #${checkinData.slot_id}. Please check out first.`, 'error');
          return false;
        }
      } catch (checkinErr) {
        // If we get a 404, it means the car is not checked in, which is good
        // Continue with the registration process
        if (checkinErr.response && checkinErr.response.status !== 404) {
          console.error('Error checking if car is already checked in:', checkinErr);
        }
      }
      
      // If we get here, the car exists and is not already checked in
      setCarVerification({
        status: 'verified',
        message: 'Car verified successfully!',
        data: response.data.car
      });
      
      showNotification('Car verified successfully!', 'success');
      return true;
    } catch (err) {
      // Car not found or other error
      setCarVerification({
        status: 'error',
        message: 'Car not registered in the system. Please register the car first.',
        data: null
      });
      
      showNotification('Car not registered in the system.', 'error');
      return false;
    }
  };

  // Handle the check-in process
  const handleCheckIn = async () => {
    if (!selectedSlot) {
      showNotification('Please select a slot for check-in', 'error');
      return;
    }
    
    if (!plateNumber.trim()) {
      showNotification('Please enter a plate number', 'error');
      return;
    }
    
    if (carVerification.status !== 'verified') {
      // If not already verified, attempt to verify
      const isVerified = await verifyCarRegistration();
      if (!isVerified) {
        return;
      }
    }
    
    try {
      setCheckInLoading(true);
      
      // Call the check-in API with car_id and slot_id
      await parkingSlotService.checkInCar(plateNumber, selectedSlot.id);

      // Update the local state to reflect the change
      setSlots(prevSlots => 
        prevSlots.map(slot => 
          slot.id === selectedSlot.id ? { ...slot, status: 'occupied' } : slot
        )
      );
      
      // Reset the selection and form
      setSelectedSlot(null);
      setPlateNumber('');
      setCarVerification({
        status: null,
        message: '',
        data: null
      });
      setShowCheckInModal(false);

      // Show success notification
      showNotification('Car checked in successfully!', 'success');
      
    } catch (err) {
      showNotification('Check-in failed: ' + (err.response?.data?.message || err.message), 'error');
      console.error('Check-in error:', err);
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedSlot(null);
    setPlateNumber('');
    setCarVerification({
      status: null,
      message: '',
      data: null
    });
    setShowCheckInModal(false);
  };

  return (
    <div className="checkin-container">
      {/* Notification banner */}
      {notification && (
        <div className={`check-in-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      <div className="checkin-header">
        <h2>Car Check-In Management</h2>
        <p>Check in cars to available parking area</p>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading parking area...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="checkin-content">
          {!selectedParkingSlot ? (
            /* Step 1: Parking Slot Selection */
            <div className="parking-slots-selection">
              <h3>Select a Parking Area:</h3>
              {parkingSlots.length === 0 ? (
                <div className="no-slots-message">
                  No parking area found for this agent.
                </div>
              ) : (
                <div className="parking-slots-dropdown">
                  <select
                    className="parking-area-select"
                    onChange={(e) => handleParkingSlotSelect(parseInt(e.target.value))}
                    defaultValue=""
                  >
                    <option value="" disabled>Select a parking area</option>
                    {parkingSlots.map((parkingSlot) => (
                      <option key={parkingSlot.id} value={parkingSlot.id}>
                        {parkingSlot.name || `Parking Area #${parkingSlot.id}`} - {parkingSlot.location_name || 'N/A'}
                        {parkingSlot.city ? ` (${parkingSlot.city}` : ''}
                        {parkingSlot.sub_city ? `, ${parkingSlot.sub_city}` : ''}
                        {parkingSlot.woreda ? `, Woreda ${parkingSlot.woreda}` : ''}
                        {parkingSlot.city ? ')' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ) : (
            /* Step 2: Show Slots and Check-in Form */
            <div className="slots-management-container">
              {/* Selected Parking Slot Info */}
              <div className="selected-parking-slot-info">
                <h3>Selected Parking Slot</h3>
                <div className="parking-slot-info">
                  <p><strong>Name:</strong> {selectedParkingSlot.name || `Parking Area #${selectedParkingSlot.id}`}</p>
                  <p><strong>City:</strong> {selectedParkingSlot.city || 'N/A'}</p>
                  <p><strong>Location:</strong> {selectedParkingSlot.location_name || 'N/A'}</p>
                </div>
                <button 
                  type="button" 
                  className="back-button"
                  onClick={() => setSelectedParkingSlot(null)}
                >
                  &larr; Change Parking area
                </button>
              </div>

              {/* Slots Table and Check-in Form */}
              <div className="slots-and-checkin">
                {/* Slots Table */}
                <div className="slots-section">
                  <h3>Available Slots</h3>
                  
                  {loadingSlots ? (
                    <div className="loading-container">
                      <div className="loading-spinner"></div>
                      <p>Loading slots...</p>
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="no-slots-message">
                      No slots found for this parking slot.
                    </div>
                  ) : (
                    <div className="slots-table-container">
                      <table className="slots-table">
                        <thead>
                          <tr>
                            <th>Slot ID</th>
                            <th>Slot Number</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {slots.map((slot) => (
                            <tr 
                              key={slot.id} 
                              className={`slot-row ${slot.status}`}
                              onClick={() => handleSlotSelect(slot)}
                            >
                              <td data-label="Slot ID">{slot.id}</td>
                              <td data-label="Slot Number">{slot.slot_number}</td>
                              <td data-label="Status">
                                <span className={`status-badge ${slot.status || 'unknown'}`}>
                                  {slot.status}
                                </span>
                              </td>
                              <td data-label="Actions" className="action-buttons">
                                {selectedSlot?.id === slot.id ? (
                                  <button
                                    className="select-button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCloseModal();
                                    }}
                                  >
                                    Cancel
                                  </button>
                                ) : (
                                  <button
                                    className="select-button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSlotSelect(slot);
                                    }}
                                  >
                                    Select
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {showCheckInModal && selectedSlot && (
                  <Modal onClose={handleCloseModal}>
                    <div className="check-in-modal-content">
                      <h3>Check-in Car to Slot #{selectedSlot.slot_number}</h3>
                      <div className="check-in-form">
                        <div className="form-group">
                          <label htmlFor="plateNumber">Car Plate Number *</label>
                          <div className="plate-input-group">
                            <input
                              type="text"
                              id="plateNumber"
                              value={plateNumber}
                              onChange={handlePlateNumberChange}
                              placeholder="Enter car plate number"
                              disabled={checkInLoading}
                            />
                            <button 
                              className="verify-button"
                              onClick={verifyCarRegistration}
                              disabled={!plateNumber.trim() || checkInLoading || carVerification.status === 'loading'}
                            >
                              {carVerification.status === 'loading' ? 'Verifying...' : 'Verify'}
                            </button>
                          </div>
                        </div>

                        {/* Car Verification Status */}
                        {carVerification.status && (
                          <div className={`verification-status ${carVerification.status}`}>
                            <p className="verification-message">{carVerification.message}</p>
                            {carVerification.data && (
                              <div className="car-details">
                                <h4>Car Details:</h4>
                                <p><strong>Model:</strong> {carVerification.data.model || 'N/A'}</p>
                                <p><strong>Owner:</strong> {carVerification.data.owner_name || 'N/A'}</p>
                              </div>
                            )}
                          </div>
                        )}

                        <button
                          className="check-in-button"
                          onClick={handleCheckIn}
                          disabled={checkInLoading || carVerification.status !== 'verified'}
                        >
                          {checkInLoading ? 'Processing...' : 'Check In Car'}
                        </button>
                      </div>
                    </div>
                  </Modal>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CheckInCar;