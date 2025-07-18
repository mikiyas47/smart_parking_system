import React, { useEffect, useState } from 'react';
import reservationService from '../../services/reservationService';
import paymentService from '../../services/paymentService';
import api from '../../services/api';
import './OwnerReservationFlow.css';

/**
 * Modal wizard that handles: get price -> pay -> reserve.
 * Props:
 *  - slot (object with id, price_per_hour, etc.)
 *  - onClose() : called when flow finished or cancelled
 */
const OwnerReservationFlow = ({ slot, onClose }) => {
  const [step, setStep] = useState('plate'); // plate | price | pay | done | register
  const [plate, setPlate] = useState('');
  const [price, setPrice] = useState(null);
  const [carData, setCarData] = useState({ brand: '', color: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!slot) {
      onClose();
    }
  }, [slot, onClose]);

  const handleFetchPrice = async () => {
    try {
      setLoading(true);
      const p = await reservationService.getReservationPrice(slot.id);
      setPrice(p);
      setStep('price');
    } catch (err) {
      setMessage(err.message || 'Failed to get price');
    } finally {
      setLoading(false);
    }
  };

  const handlePayAndReserve = async () => {
    try {
      setLoading(true);
      // 1. pay
      await paymentService.payForReservation(plate, slot.id);
      // 2. make reservation
      await reservationService.makeReservation(plate, slot.id);
      setStep('done');
    } catch (err) {
      // If backend says car not registered
      if (err.response?.data?.code === 'CAR_NOT_FOUND') {
        setStep('register');
      } else {
        setMessage(err.response?.data?.message || err.message || 'Payment failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterCar = async () => {
    try {
      setLoading(true);
      await api.post('/cars/register', {
        plate_number: plate,
        brand: carData.brand,
        color: carData.color,
      });
      // after registering, try payment again
      handlePayAndReserve();
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Car registration failed');
    } finally {
      setLoading(false);
    }
  };

  const renderPlateStep = () => (
    <div className="step-wrapper">
      <h3>Enter Plate Number</h3>
      <input
        type="text"
        value={plate}
        onChange={(e) => setPlate(e.target.value)}
        placeholder="Plate number"
      />
      <div className="actions">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn-primary" disabled={!plate || loading} onClick={handleFetchPrice}>
          {loading ? 'Loading...' : 'Next'}
        </button>
      </div>
    </div>
  );

  const renderPriceStep = () => (
    <div className="step-wrapper">
      <h3>Reservation Price</h3>
      <p>Reservation fee: <strong>{price} ETB</strong></p>
      <div className="actions">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={handlePayAndReserve} disabled={loading}>
          {loading ? 'Processing...' : 'Pay & Reserve'}
        </button>
      </div>
    </div>
  );

  const renderRegisterStep = () => (
    <div className="step-wrapper">
      <h3>Register Car</h3>
      <p>This plate is not yet registered. Please add car details.</p>
      <input
        type="text"
        placeholder="Brand"
        value={carData.brand}
        onChange={(e) => setCarData({ ...carData, brand: e.target.value })}
      />
      <input
        type="text"
        placeholder="Color"
        value={carData.color}
        onChange={(e) => setCarData({ ...carData, color: e.target.value })}
      />
      <div className="actions">
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={handleRegisterCar} disabled={loading}>
          {loading ? 'Saving...' : 'Register & Continue'}
        </button>
      </div>
    </div>
  );

  const renderDoneStep = () => (
    <div className="step-wrapper">
      <h3>Reservation Confirmed!</h3>
      <p>Your reservation is booked. Thank you.</p>
      <div className="actions">
        <button className="btn-primary" onClick={onClose}>Close</button>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay">
      <div className="modal-body">
        {message && <div className="error-msg">{message}</div>}
        {step === 'plate' && renderPlateStep()}
        {step === 'price' && renderPriceStep()}
        {step === 'register' && renderRegisterStep()}
        {step === 'done' && renderDoneStep()}
      </div>
    </div>
  );
};

export default OwnerReservationFlow;
