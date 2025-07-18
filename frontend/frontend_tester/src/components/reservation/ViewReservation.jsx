import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaChartBar, FaSyncAlt, FaHome, FaCheck } from 'react-icons/fa';
import Modal from '../Modal';
import reservationService from '../../services/reservationService';
import Notification from '../common/Notification';
import MakeReservation from './MakeReservation';
import ReservationReport from './ReservationReport';
import ReservationSidebar from './ReservationSidebar';
import './viewReservation.css';

const ViewReservation = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeReservations, setActiveReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [plateNumberFilter, setPlateNumberFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [showMakeReservation, setShowMakeReservation] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const clearNotification = () => {
    setNotification(null);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleGenerateReport = () => {
    setShowReport(true);
  };

  const handleMakeReservation = () => {
    setShowMakeReservation(true);
  };

  const closeModal = () => {
    setShowMakeReservation(false);
    setShowReport(false);
  };

  useEffect(() => {
    fetchActiveReservations();
  }, []);

  useEffect(() => {
    if (plateNumberFilter.trim() === '') {
      setFilteredReservations(activeReservations);
    } else {
      const filtered = activeReservations.filter(reservation => 
        reservation.plate_number.toLowerCase().includes(plateNumberFilter.toLowerCase())
      );
      setFilteredReservations(filtered);
    }
  }, [plateNumberFilter, activeReservations]);

  const handlePlateNumberFilterChange = (e) => {
    setPlateNumberFilter(e.target.value);
  };

  const fetchActiveReservations = async () => {
    try {
      setLoadingReservations(true);
      const userEmail = localStorage.getItem('UserEmail');
      if (!userEmail) {
        showNotification('User not found. Please log in again.', 'error');
        setLoadingReservations(false);
        return;
      }
      
      const response = await reservationService.getActiveReservationsByAgent(userEmail);
      const reservations = response.reservations || [];
      setActiveReservations(reservations);
      setFilteredReservations(reservations);
      setLoadingReservations(false);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      showNotification('Failed to fetch reservations: ' + (err.message || 'Unknown error'), 'error');
      setLoadingReservations(false);
    }
  };
  
  const handleCancelReservation = async (plateNumber) => {
    try {
      setLoading(true);
      await reservationService.cancelReservation(plateNumber);
      showNotification(`Reservation for ${plateNumber} cancelled successfully!`);
      setActiveReservations(prev => prev.filter(r => r.plate_number !== plateNumber));
      setFilteredReservations(prev => prev.filter(r => r.plate_number !== plateNumber));
      setLoading(false);
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
      showNotification('Failed to cancel reservation: ' + errorMessage, 'error');
      setLoading(false);
    }
  };
  
  const handleCheckIn = async (plateNumber) => {
    try {
      setLoading(true);
      const userEmail = localStorage.getItem('UserEmail');
      if (!userEmail) {
        showNotification('User not found. Please log in again.', 'error');
        setLoading(false);
        return;
      }
      
      await reservationService.checkInByReservation(userEmail, plateNumber);
      showNotification(`Check-in for ${plateNumber} completed successfully!`);
      setActiveReservations(prev => prev.filter(r => r.plate_number !== plateNumber));
      setFilteredReservations(prev => prev.filter(r => r.plate_number !== plateNumber));
      setLoading(false);
    } catch (err) {
      console.error('Error checking in:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
      showNotification('Failed to check in: ' + errorMessage, 'error');
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <ReservationSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="view-reservations-container">
          {notification && (
            <Notification
              message={notification.message}
              type={notification.type}
              onClose={clearNotification}
            />
          )}
          
          <div className="reservations-header">
            <div className="header-left">
              <button 
                className="report-btn"
                onClick={handleGenerateReport}
              >
                <FaChartBar className="icon" />
                <span>Generate Report</span>
              </button>
            </div>
            
            <div className="header-center">
              <div className="filter-section">
                <input
                  type="text"
                  id="plateNumberFilter"
                  value={plateNumberFilter}
                  onChange={handlePlateNumberFilterChange}
                  placeholder="Filter by plate number..."
                  className="plate-filter-input"
                />
                <button 
                  onClick={fetchActiveReservations}
                  disabled={loadingReservations}
                  className="refresh-button"
                >
                  <FaSyncAlt className={`icon ${loadingReservations ? 'spin' : ''}`} />
                </button>
              </div>
            </div>
            
            <div className="header-right">
              <button 
                className="make-reservation-btn"
                onClick={handleMakeReservation}
              >
                <FaPlus className="icon" />
                <span>Make Reservation</span>
              </button>
            </div>
          </div>
          
          <h2 className="page-title">View Active Reservations</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="reservations-section">
            {loadingReservations ? (
              <div className="loading-spinner"></div>
            ) : filteredReservations.length === 0 ? (
              <div className="no-reservations-message">
                No active reservations found.
              </div>
            ) : (
              <div className="reservations-table-container">
                <table className="reservations-table">
                  <thead>
                    <tr>
                      <th>Plate Number</th>
                      <th>Slot Number</th>
                      <th>Location</th>
                      <th>Reserved At</th>
                      <th>Expires At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReservations.map((reservation) => {
                      const reservedAt = new Date(reservation.reserved_at).toLocaleString();
                      const expiresAt = new Date(reservation.expires_at).toLocaleString();
                      
                      return (
                        <tr key={reservation.id} className="reservation-row">
                          <td>{reservation.plate_number}</td>
                          <td>{reservation.slot_number}</td>
                          <td className="location-cell">{`${reservation.city} > ${reservation.sub_city} > ${reservation.woreda} > ${reservation.location_name}`}</td>
                          <td>{reservedAt}</td>
                          <td>{expiresAt}</td>
                          <td className="action-buttons">
                            <button 
                              className="check-in-button"
                              onClick={() => handleCheckIn(reservation.plate_number)}
                              disabled={loading}
                            >
                              Check In
                            </button>
                            <button 
                              className="cancel-button"
                              onClick={() => handleCancelReservation(reservation.plate_number)}
                              disabled={loading}
                            >
                              Cancel
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showMakeReservation && (
        <Modal onClose={closeModal}>
          <MakeReservation />
          <button 
            className="done-button"
            onClick={closeModal}
          >
            <FaCheck className="icon" />
            Done
          </button>
        </Modal>
      )}
      
      {showReport && (
        <Modal onClose={closeModal}>
          <ReservationReport />
          <button 
            className="done-button"
            onClick={closeModal}
          >
            <FaCheck className="icon" />
            Done
          </button>
        </Modal>
      )}
    </div>
  );
};

export default ViewReservation;