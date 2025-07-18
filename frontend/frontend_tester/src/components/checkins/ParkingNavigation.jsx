import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import CheckInSidebar from './CheckInSidebar';
import Modal from '../Modal';
import './ParkingNavigation.css';

function ParkingNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeModal, setActiveModal] = useState(null);

  // Sync modal state with current route
  useEffect(() => {
    if (location.pathname.includes('/checkins/')) {
      setActiveModal(location.pathname);
    } else {
      setActiveModal(null);
    }
  }, [location.pathname]);

  const openModal = (path) => {
    navigate(path);
  };

  const closeModal = () => {
    setActiveModal(null);
    navigate('/checkins'); // Navigate to the parent checkins route
  };

  return (
    <div className="checkin-container">
      <div className="checkin-header">
        <h2>Parking Operations</h2>
      </div>
      
      <div className="checkin-content">
        <div className="checkin-layout">
          <div className="sidebar">
            <CheckInSidebar />
          </div>
          
          <div className="main-content">
            <div className="button-group">
              <button 
                onClick={() => openModal('/checkins/car')}
                className={`nav-button ${activeModal === '/checkins/car' ? 'active' : ''}`}
              >
                <div className="button-icon">
                  <i className="fas fa-car"></i>
                </div>
                <div className="button-content">
                  <h3>Check In Car</h3>
                 
                </div>
                <div className="button-badge">
                 
                </div>
              </button>
              <button 
                onClick={() => openModal('/checkins/checkout')}
                className={`nav-button ${activeModal === '/checkins/checkout' ? 'active' : ''}`}
              >
                <div className="button-icon">
                  <i className="fas fa-car-side"></i>
                </div>
                <div className="button-content">
                  <h3>Check Out Car</h3>
                 
                </div>
                <div className="button-badge">
                 
                </div>
              </button>
              <button 
                onClick={() => openModal('/checkins/reports')}
                className={`nav-button ${activeModal === '/checkins/reports' ? 'active' : ''}`}
              >
                <div className="button-icon">
                  <i className="fas fa-file-alt"></i>
                </div>
                <div className="button-content">
                  <h3>Check In Report</h3>
                 
                </div>
                <div className="button-badge">
                 
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal with Done button */}
      {activeModal && (
        <Modal onClose={closeModal}>
          <div className="modal-content">
            <Outlet context={{ closeModal }} />
            <div className="modal-footer">
              <button 
                className="done-button"
                onClick={(e) => {
                  e.preventDefault();
                  closeModal();
                }}
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default ParkingNavigation;