import { useState, useEffect } from 'react';
import { parkingSlotService } from '../../services/api';
import paymentService from '../../services/paymentService';
import './CheckOutCar.css';

function CheckOutCar() {
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
  const [checkOutLoading, setCheckOutLoading] = useState(false);
  const [checkOutInfo, setCheckOutInfo] = useState(null);
  
  // Payment state
  const [hourlyPrice, setHourlyPrice] = useState(null);
  const [totalAmount, setTotalAmount] = useState(null);
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Fetch parking slots when component mounts
  useEffect(() => {
    const fetchParkingSlots = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get user ID from local storage
        const UserEmail = localStorage.getItem('UserEmail');
        
        if (!UserEmail) {
          throw new Error('User Email not found. Please login again.');
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
      setCheckOutInfo(null);
      
      // Get user ID from local storage
      const UserEmail = localStorage.getItem('UserEmail');
      
      if (!UserEmail) {
        showNotification('User Email not found. Please login again.', 'error');         
        setLoadingSlots(false);
        return;
      }
      
      // Fetch slots for the selected parking slot
      const response = await parkingSlotService.getAgentSlots(UserEmail, parkingSlot.id);
      
      if (response.data && response.data.slots) {
        // Add check-in information to occupied slots
        const slotsWithCheckIns = response.data.slots.map(slot => {
          if (slot.status === 'occupied' && slot.check_in_id) {
            return {
              ...slot,
              check_in: response.data.check_ins?.find(checkIn => checkIn.id === slot.check_in_id)
            };
          }
          return slot;
        });
        
        setSlots(slotsWithCheckIns);
        
        const occupiedSlotsCount = slotsWithCheckIns.filter(slot => slot.status === 'occupied').length;
        
        if (occupiedSlotsCount > 0) {
          showNotification(`Found ${occupiedSlotsCount} occupied slots available for check-out!`);
        } else {
          showNotification('No occupied slots found for this parking slot', 'warning');
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

  // Show notification message
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    
    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      setNotification(null);
    }, 10000);
  };
  
  // Handle check-out process
  const handleCheckOut = async (slotId) => {
    try {
      setCheckOutLoading(true);

      // Find the slot being checked out for reference
      const slotToCheckOut = slots.find(s => s.id === slotId);
      if (!slotToCheckOut) {
        throw new Error('Slot not found');
      }
      
      if (slotToCheckOut.status !== 'occupied') {
        throw new Error('Cannot check out a free slot');
      }

      // Call the check-out API with just the slot_id
      const response = await parkingSlotService.checkOutCar({
        slot_id: slotId
      });
      
      // Update the local state to reflect the change
      setSlots(prevSlots => 
        prevSlots.map(slot => 
          slot.id === slotId ? { ...slot, status: 'free' } : slot
        )
      );

      // Process and display checkout information with the slot ID
      const checkInData = response.data.check_in || response.data;
      await processCheckoutInfo({
        ...checkInData,
        slot_id: slotId,
        plate_number: slotToCheckOut.plate_number || checkInData.car_id || 'Unknown'
      });
      
      showNotification('Check-out successful!');
    } catch (err) {
      showNotification('Check-out failed: ' + (err.response?.data?.message || err.message), 'error');
      console.error('Check-out error:', err);
      setShowPaymentConfirmation(false);
    } finally {
      setCheckOutLoading(false);
    }
  };

  // Process checkout information for display
  const processCheckoutInfo = async (checkInData) => {
    if (!checkInData || !checkInData.check_in_time || !checkInData.check_out_time) {
      console.error('Invalid check-in data:', checkInData);
      return;
    }
    
    const checkInTime = new Date(checkInData.check_in_time);
    const checkOutTime = new Date(checkInData.check_out_time);
    
    const durationMs = checkOutTime - checkInTime;
    const durationHours = Math.ceil(durationMs / (1000 * 60 * 60)); // Round up to nearest hour
    const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const durationSeconds = Math.floor((durationMs % (1000 * 60)) / 1000);
    const ConvertedMinuteToHour = durationMinutes / 60;
    const ConvertedSecToHour = durationSeconds / 3600;
    const TotalConvertedHour = durationHours + ConvertedMinuteToHour + ConvertedSecToHour;
    
    // Get the slot ID from the check-in data
    const slotId = checkInData.slot_id;
    
    try {
      // Get hourly price for this slot
      const priceData = await paymentService.getHourlyPrice(slotId);
      setHourlyPrice(priceData.price_per_hour);
      
      // Calculate total amount
      const amount = priceData.price_per_hour * TotalConvertedHour;
      setTotalAmount(amount);
      
      setCheckOutInfo({
        carPlate: checkInData.car_id || checkInData.plate_number || 'Unknown',
        checkInTime: checkInData.check_in_time,
        checkOutTime: checkInData.check_out_time,
        durationHours,
        durationMinutes,
        durationSeconds,
        slotNumber: checkInData.slot_id,
        checkInId: checkInData.id,
        hourlyPrice: priceData.price_per_hour,
        totalAmount: amount,
        plateNumber: checkInData.car_id || checkInData.plate_number || 'Unknown'
      });
      
      // Show payment confirmation
      setShowPaymentConfirmation(true);
    } catch (error) {
      console.error('Error fetching hourly price:', error);
      showNotification('Failed to fetch hourly price. Please try again.', 'error');
      
      // Still set checkout info without price information
      setCheckOutInfo({
        carPlate: checkInData.car_id || checkInData.plate_number || 'Unknown',
        checkInTime: checkInData.check_in_time,
        checkOutTime: checkInData.check_out_time,
        durationHours,
        durationMinutes,
        durationSeconds,
        slotNumber: checkInData.slot_id,
        checkInId: checkInData.id,
        plateNumber: checkInData.car_id || checkInData.plate_number || 'Unknown'
      });
    }
  };
  
  // Process payment for checkout
  const handlePaymentConfirmation = async () => {
    if (!checkOutInfo) return;
    
    try {
      setPaymentProcessing(true);
      
      // Process payment
      await paymentService.payForCheckIn(
        checkOutInfo.plateNumber,
        checkOutInfo.slotNumber,
        totalAmount
      );
      
      setPaymentSuccess(true);
      setShowPaymentConfirmation(false);
      
      showNotification('Payment processed successfully!', 'success');
    } catch (error) {
      console.error('Error processing payment:', error);
      showNotification(
        error.response?.data?.message || 'Failed to process payment. Please try again.',
        'error'
      );
    } finally {
      setPaymentProcessing(false);
    }
  };
  
  // Cancel payment
  const handlePaymentCancel = () => {
    setShowPaymentConfirmation(false);
  };

  return (
    <div className="checkout-container">
      {/* Notification banner */}
      {notification && (
        <div className={`checkout-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      {/* Payment Confirmation Modal */}
      {showPaymentConfirmation && checkOutInfo && (
        <div className="payment-confirmation-modal">
          <div className="payment-confirmation-content">
            <h2>Confirm Check-Out Payment</h2>
            <p>Please confirm the payment for parking duration.</p>
            <div className="payment-details">
              <p><strong>Plate Number:</strong> {checkOutInfo.carPlate}</p>
              <p><strong>Slot Number:</strong> {checkOutInfo.slotNumber}</p>
              <p><strong>Duration:</strong> {checkOutInfo.durationHours} hour(s)</p>
              <p><strong>Hourly Rate:</strong> ${checkOutInfo.hourlyPrice}</p>
              <p><strong>Total Amount:</strong> ${checkOutInfo.totalAmount}</p>
            </div>
            <div className="payment-actions">
              <button 
                className="confirm-payment-button" 
                onClick={handlePaymentConfirmation}
                disabled={paymentProcessing}
              >
                {paymentProcessing ? 'Processing...' : 'Confirm Payment'}
              </button>
              <button 
                className="cancel-payment-button" 
                onClick={handlePaymentCancel}
                disabled={paymentProcessing}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="checkout-header">
        <h2>Car Check-Out Management</h2>
        <p>Check out cars from occupied parking area</p>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading parking area...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="checkout-content">
          {/* Display checkout result if available */}
          {checkOutInfo && !showPaymentConfirmation && (
            <div className="checkout-result compact">
              <div className="checkout-result-header">
                <span className="success-icon">✓</span>
                <span className="checkout-success-text">Car Successfully Checked Out</span>
              </div>
              <div className="checkout-details-compact">
                <div className="checkout-detail-row">
                  <div className="detail-col">
                    <span className="detail-label">Car:</span>
                    <span className="detail-value">{checkOutInfo.carPlate}</span>
                  </div>
                  <div className="detail-col">
                    <span className="detail-label">Slot:</span>
                    <span className="detail-value">{checkOutInfo.slotNumber}</span>
                  </div>
                </div>
                <div className="checkout-detail-row">
                  <div className="detail-col">
                    <span className="detail-label">In:</span>
                    <span className="detail-value">{new Date(checkOutInfo.checkInTime).toLocaleString()}</span>
                  </div>
                  <div className="detail-col">
                    <span className="detail-label">Out:</span>
                    <span className="detail-value">{new Date(checkOutInfo.checkOutTime).toLocaleString()}</span>
                  </div>
                </div>
                <div className="checkout-duration">
                  <span className="duration-value">Duration: {checkOutInfo.durationHours}h {checkOutInfo.durationMinutes}m {checkOutInfo.durationSeconds}s</span>
                </div>
                {hourlyPrice && (
                  <div className="checkout-detail-row">
                    <div className="detail-col">
                      <span className="detail-label">Hourly Rate:</span>
                      <span className="detail-value">${hourlyPrice}</span>
                    </div>
                    <div className="detail-col">
                      <span className="detail-label">Total Amount:</span>
                      <span className="detail-value">${totalAmount}</span>
                    </div>
                  </div>
                )}
                {paymentSuccess && (
                  <div className="checkout-detail-row">
                    <div className="detail-col">
                      <span className="detail-label">Payment Status:</span>
                      <span className="detail-value payment-success">Paid</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {!selectedParkingSlot ? (
            /* Step 1: Parking Slot Selection */
            <div className="parking-slots-selection">
              <h3>Select a Parking area:</h3>
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
            /* Step 2: Show Slots and Check-out interface */
            <div className="slots-management-container">
              {/* Selected Parking Slot Info */}
              <div className="selected-parking-slot-info">
                <h3>Selected Parking area</h3>
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

              {/* Occupied Slots Table */}
              <div className="slots-section">
                <h3>Occupied Slots Available for Check-out</h3>
                
                {loadingSlots ? (
                  <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading slots...</p>
                  </div>
                ) : slots.length === 0 ? (
                  <div className="no-slots-message">
                    No slots found for this parking slot.
                  </div>
                ) : !slots.some(slot => slot.status === 'occupied') ? (
                  <div className="no-slots-message">
                    No occupied slots available for check-out.
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
                        {slots
                          .filter(slot => slot.status === 'occupied')
                          .map((slot) => (
                            <tr key={slot.id} className="slot-row occupied">
                              <td>{slot.id}</td>
                              <td>{slot.slot_number}</td>
                              <td>
                                <span className="status-badge occupied">
                                  {slot.status}
                                </span>
                              </td>
                              <td>
                                <button
                                  className="checkout-button"
                                  onClick={() => handleCheckOut(slot.id)}
                                  disabled={checkOutLoading}
                                >
                                  {checkOutLoading ? 'Processing...' : 'Check Out'}
                                </button>
                              </td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CheckOutCar;