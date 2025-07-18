import { useState, useEffect } from 'react';
import { parkingSlotService } from '../../services/api';
import RegisterSlots from './RegisterSlot';
import Modal from '../Modal';
import './AgentSlots.css';

function AgentSlots() {
  const [parkingAreas, setParkingAreas] = useState([]);
  const [selectedAreaIndex, setSelectedAreaIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [parkingSlots, setParkingSlots] = useState([]);
  const [selectedParkingSlotId, setSelectedParkingSlotId] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Modal state for RegisterSlots
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const openRegisterModal = () => setShowRegisterModal(true);
  const closeRegisterModal = () => setShowRegisterModal(false);

  const updateSlotStatus = async (slotId, newStatus) => {
    try {
      const UserEmail = localStorage.getItem('UserEmail');
      if (!UserEmail) {
        showNotification('User ID not found. Please login again.', 'error');
        return;
      }

      await parkingSlotService.updateSlotStatus(slotId, UserEmail, newStatus);

      setSlots(prevSlots =>
        prevSlots.map(slot =>
          slot.id === slotId ? { ...slot, status: newStatus } : slot
        )
      );

      showNotification(`Slot ${slotId} status updated to ${newStatus} successfully!`);
    } catch (err) {
      showNotification('Failed to update slot status: ' + (err.response?.data?.message || err.message), 'error');
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  useEffect(() => {
    const fetchAgentParkingSlots = async () => {
      try {
        const UserEmail = localStorage.getItem('UserEmail');
        if (!UserEmail) {
          setError('User ID not found. Please login again.');
          setLoading(false);
          return;
        }

        const response = await parkingSlotService.getAgentParkingSlots(UserEmail);

        if (response.data && response.data.parking_slots) {
          setParkingSlots(response.data.parking_slots);
          if (response.data.parking_slots.length > 0) {
            showNotification('Parking slots loaded successfully!');
          } else {
            showNotification('No parking slots found for this agent', 'warning');
          }
        } else {
          setError('Unexpected API response format. Check console for details.');
        }

        setLoading(false);
      } catch (err) {
        setError('Failed to fetch parking slots: ' + (err.response?.data?.message || err.message));
        setLoading(false);
      }
    };

    fetchAgentParkingSlots();
  }, []);

  const handleParkingSlotSelect = async (parkingSlotId) => {
    try {
      setSelectedParkingSlotId(parkingSlotId);
      setLoadingSlots(true);
      setSlots([]);

      const UserEmail = localStorage.getItem('UserEmail');
      if (!UserEmail) {
        showNotification('User not found. Please login again.', 'error');
        setLoadingSlots(false);
        return;
      }

      const response = await parkingSlotService.getAgentSlots(UserEmail, parkingSlotId);
      if (response.data && response.data.slots) {
        setSlots(response.data.slots);
        if (response.data.slots.length > 0) {
          showNotification('Slots loaded successfully!');
        } else {
          showNotification('No slots found for this parking slot', 'warning');
        }
      } else {
        showNotification('Failed to load slots: Unexpected response format', 'error');
      }

      setLoadingSlots(false);
    } catch (err) {
      showNotification('Failed to fetch slots: ' + (err.response?.data?.message || err.message), 'error');
      setLoadingSlots(false);
    }
  };

  const filteredParkingSlots = parkingSlots.filter((slot) => 
    slot.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    slot.sub_city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    slot.woreda?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    slot.location_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="agent-slots-loading">Loading parking areas and slots...</div>;
  if (error) return <div className="agent-slots-error">{error}</div>;

  return (
    <div className="agent-slots-container">
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="agent-slots-header">
        <h2>Parking Area Management</h2>
        <div className="search-bar-container">
          <input
            type="text"
            placeholder="Search parking areas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button
          className="sidebar-link register-link"
          onClick={openRegisterModal}
          type="button"
        >
          <i className="fas fa-exchange-alt"></i>
          <span className="register-text">Register Parking Slot</span>
        </button>
      </div>

      {parkingSlots.length === 0 ? (
        <div className="no-slots-message">No parking Area found for this agent.</div>
      ) : (
        <div className="agent-slots-management">
          <div className="parking-slots-section">
            <h3>Select a Parking Area:</h3>
            <div className="parking-slots-table-container">
              <table className="parking-slots-table">
                <thead>
                  <tr>
                    <th>Number</th>
                    <th>City</th>
                    <th>Sub City</th>
                    <th>Woreda</th>
                    <th>Location</th>
                   
                  </tr>
                </thead>
                <tbody>
                  {filteredParkingSlots.map((parkingSlot) => (
                    <tr 
                      key={parkingSlot.id}
                      className={`parking-slot-row ${selectedParkingSlotId === parkingSlot.id ? 'active' : ''}`}
                      onClick={() => handleParkingSlotSelect(parkingSlot.id)}
                    >
                      <td>{parkingSlot.id}</td>
                      <td>{parkingSlot.city || 'N/A'}</td>
                      <td>{parkingSlot.sub_city || 'N/A'}</td>
                      <td>{parkingSlot.woreda || 'N/A'}</td>
                      <td>{parkingSlot.location_name || 'N/A'}</td>
                      <td>
                        
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="slots-section">
            <h3>Individual Area</h3>
            {selectedParkingSlotId ? (
              loadingSlots ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading Area...</p>
                </div>
              ) : slots.length === 0 ? (
                <div className="no-slots-message">
                  No area found for this parking Area.
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
                        <tr key={slot.id} className={`slot-row ${slot.status}`}>
                          <td>{slot.id}</td>
                          <td>{slot.slot_number}</td>
                          <td>
                            <span className={`status-badge ${slot.status || 'unknown'}`}>
                              {slot.status}
                            </span>
                          </td>
                          <td className="action-buttons">
                            <button
                              className="status-button free"
                              onClick={() => updateSlotStatus(slot.id, 'free')}
                              disabled={slot.status === 'free'}
                            >
                              Set Free
                            </button>
                            <button
                              className="status-button occupied"
                              onClick={() => updateSlotStatus(slot.id, 'occupied')}
                              disabled={slot.status === 'occupied'}
                            >
                              Set Occupied
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <div className="selection-prompt">
                Please select a parking Area to view its individual area.
              </div>
            )}
          </div>
        </div>
      )}

      {showRegisterModal && (
        <Modal onClose={closeRegisterModal}>
          <RegisterSlots onClose={closeRegisterModal} />
          <div style={{ marginTop: '1rem', textAlign: 'right' }}>
            <button onClick={closeRegisterModal} className="done-button" type="button">
              Done
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default AgentSlots;
