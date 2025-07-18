import React, { useEffect } from 'react';
import './Notification.css';

const Notification = ({ message, type, onClose, duration = 15000 }) => {
  useEffect(() => {
    if (!message) return;
    
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);
  
  if (!message) return null;
  
  return (
    <div className={`notification ${type}`}>
      <div className="notification-content">
        <span className="notification-message">{message}</span>
        <button className="notification-close" onClick={onClose}>
          &times;
        </button>
      </div>
    </div>
  );
};

export default Notification;
