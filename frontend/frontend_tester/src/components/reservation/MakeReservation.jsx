import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiAlertCircle, FiClock } from 'react-icons/fi';
import reservationService from '../../services/reservationService';
import Notification from '../common/Notification';
import './makeReservation.css';

function MakeReservation() {
  // State for parking areas and slots
  const [parkingAreas, setParkingAreas] = useState([]);
  const [selectedParkingArea, setSelectedParkingArea] = useState(null);
  const [slots, setSlots] = useState([]);
  
  // State for car information
  const [plateNumber, setPlateNumber] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  
  // State for pricing and payment
  const [price, setPrice] = useState(null);
  const [isPaying, setIsPaying] = useState(false);
  
  
  // State for UI feedback
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [notification, setNotification] = useState(null);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [reservationData, setReservationData] = useState(null);
  
  const navigate = useNavigate();

  // Friendly error mapping
  const getFriendlyError = (errMsg) => {
    if (errMsg?.toLowerCase().includes('plate number') && errMsg.toLowerCase().includes('invalid')) {
      return 'Plate number is not registered.';
    }
    return errMsg;
  };

  // Show notification message
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };
  
  // Clear notification
  const clearNotification = () => {
    setNotification(null);
  };

  // Auto-dismiss notifications after 7 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        clearNotification();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Fetch parking areas when component mounts
  useEffect(() => {
    const fetchParkingAreas = async () => {
      try {
        setLoading(true);
        const areas = await reservationService.getAgentParkingAreas();
        setParkingAreas(areas);
      } catch (err) {
        console.error('Error fetching parking areas:', err);
        showNotification('Failed to fetch parking areas: ' + (err.message || 'Unknown error'), 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchParkingAreas();
  }, []);

  // Fetch slots when parking area is selected
  const handleParkingAreaChange = async (e) => {
    const areaId = Number(e.target.value);
    const selectedArea = parkingAreas.find(area => area.id === areaId);
    
    setSelectedParkingArea(selectedArea || null);
    setSelectedSlot(null);
    setPrice(null);
    
    if (!areaId) {
      setSlots([]);
      return;
    }

    try {
      setLoadingSlots(true);
      const slotsData = await reservationService.getAgentSlots(areaId);
      setSlots(slotsData);
    } catch (err) {
      console.error('Error fetching slots:', err);
      showNotification('Failed to fetch parking slots', 'error');
    } finally {
      setLoadingSlots(false);
    }
  };

  // Handle slot selection and get price
  const handleSlotSelect = async (slot) => {
    setSelectedSlot(slot);
    
    try {
      const slotPrice = await reservationService.getReservationPrice(slot.id);
      setPrice(slotPrice);
    } catch (err) {
      console.error('Error fetching price:', err);
      showNotification('Failed to get reservation price', 'error');
    }
  };

  // Handle payment then reservation
  const handlePayAndReserve = async () => {
    if (!plateNumber.trim()) {
      showNotification('Please enter a valid plate number', 'error');
      return;
    }

    if (!selectedSlot) {
      showNotification('Please select a parking slot', 'error');
      return;
    }

    try {
      setIsPaying(true);
      
      // Process payment
      await reservationService.payForReservation(selectedSlot.id, plateNumber);

      // Payment ok -> create reservation
      const reservation = await reservationService.makeReservation(plateNumber, selectedSlot.id);

      // Live-update slot status locally
      setSlots(prev => prev.map(s => (s.id === selectedSlot.id ? { ...s, status: 'reserved' } : s)));
      setSelectedSlot(null);
      setPrice(null);

      setReservationData(reservation);
      setReservationSuccess(true);
      showNotification('Reservation created successfully!', 'success');

      // redirect after 2 sec
      setTimeout(()=>navigate('/reservations'),2000);
    } catch (err) {
      console.error('Error processing payment:', err);
      showNotification(
        getFriendlyError(err.response?.data?.message) || 'Failed to process reservation',
        'error'
      );
    } finally {
      setIsPaying(false);
    }
  };



  // Handle back button
  const handleBack = () => {
    if (selectedSlot) {
      setSelectedSlot(null);
      setPrice(null);
    } else if (selectedParkingArea) {
      setSelectedParkingArea(null);
      setSlots([]);
    } else {
      navigate(-1);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="make-reservation">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading parking areas...</p>
        </div>
      </div>
    );
  }

  // // Success state
  // if (reservationSuccess && reservationData) {
  //   return (
  //     <div className="reservation-success">
  //       <div className="success-card">
  //         <div className="success-icon">✓</div>
  //         <h2>Reservation Successful!</h2>
  //         <div className="reservation-details">
  //           <p><strong>Reservation ID:</strong> {reservationData.id}</p>
  //           <p><strong>Slot Number:</strong> {reservationData.slot_number}</p>
  //           <p><strong>Plate Number:</strong> {reservationData.plate_number}</p>
  //           <p><strong>Expires at:</strong> {new Date(reservationData.expires_at).toLocaleString()}</p>
  //         </div>
  //         <p className="redirect-message">You will be redirected to reservations page shortly...</p>
  //         <button 
  //           className="btn btn-primary"
  //           onClick={() => navigate('/reservations')}
  //         >
  //           View All Reservations
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  // Format price for display
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 2
    }).format(price);
  };

  // Loading state
  if (loading) {
    return (
      <div className="make-reservation">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading parking areas...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="make-reservation">
      <div className="reservation-header">
        <h2>Make a Reservation</h2>
      </div>
      
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.type === 'error' ? <FiAlertCircle /> : <FiCheckCircle />}
          <span>{notification.message}</span>
          <button onClick={clearNotification} className="close-notification">×</button>
        </div>
      )}

      <div className="reservation-content">
        <div className="form-group">
          <label htmlFor="plateNumber">License Plate Number *</label>
          <input
            type="text"
            id="plateNumber"
            value={plateNumber}
            onChange={(e) => setPlateNumber(e.target.value)}
            placeholder="Enter license plate number"
            className="form-control"
            disabled={isPaying}
          />
        </div>

        <div className="form-group">
          <label>Select Parking Area *</label>
          <select 
            value={selectedParkingArea?.id || ''}
            onChange={handleParkingAreaChange}
            disabled={loading || isPaying}
            className="form-control"
          >
            <option value="">Select a parking area</option>
            {parkingAreas.map(area => (
              <option key={area.id} value={area.id}>
                {area.locationPath || `Parking Area ${area.id}`}
              </option>
            ))}
          </select>
        </div>

        {selectedParkingArea && (
          <div className="form-group">
            <label>Select a Parking Slot *</label>
            {loadingSlots ? (
              <div className="loading-slots">
                <div className="spinner"></div>
                <p>Loading available slots...</p>
              </div>
            ) : (
              <div className="slots-grid">
                {slots.length === 0 ? (
                  <div className="no-slots">No slots available in this area</div>
                ) : (
                  slots.map(slot => (
                    <div 
                      key={slot.id}
                      className={`slot ${slot.status} ${selectedSlot?.id === slot.id ? 'selected' : ''}`}
                      onClick={() => handleSlotSelect(slot)}
                    >
                      <span className="slot-number">{slot.slot_number}</span>
                      <span className="slot-status">{slot.status}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {price !== null && (
          <div className="price-summary">
            <h3>Reservation Summary</h3>
            <div className="price-row">
              <span>Reservation Price:</span>
              <span>{formatPrice(price)}</span>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button 
            type="button"
            className="btn btn-secondary"
            onClick={handleBack}
            disabled={isPaying}
          >
            Back
          </button>
<button
              type="button"
              className="btn btn-primary"
              onClick={handlePayAndReserve}
              disabled={!selectedSlot || !plateNumber.trim() || isPaying}
            >
              {isPaying ? 'Processing...' : 'Pay & Reserve'}
            </button>
        </div>
      </div>
    </div>
  );
}

export default MakeReservation;