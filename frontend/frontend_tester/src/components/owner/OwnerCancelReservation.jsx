import React, { useState } from 'react';
import reservationService from '../../services/reservationService';
import './OwnerCancelReservation.css';

const OwnerCancelReservation = ({ onClose }) => {
  const [plate, setPlate] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleCancel = async () => {
    if (!plate) return;
    try {
      setLoading(true);
      await reservationService.cancelReservation(plate);
      setMessage('Reservation cancelled');
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Failed to cancel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-body">
        <h3>Cancel Reservation</h3>
        {message && <div className="info-msg">{message}</div>}
        <input
          type="text"
          placeholder="Plate number"
          value={plate}
          onChange={(e) => setPlate(e.target.value)}
        />
        <div className="actions">
          <button className="btn" onClick={onClose}>Close</button>
          <button className="btn-danger" onClick={handleCancel} disabled={loading || !plate}>
            {loading ? 'Processing...' : 'Cancel Reservation'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OwnerCancelReservation;
