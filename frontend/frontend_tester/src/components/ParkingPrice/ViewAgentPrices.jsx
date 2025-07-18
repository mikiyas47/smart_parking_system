import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import parkingPriceService from '../../services/parkingPriceService';
import Notification from '../common/Notification';
import Modal from '../Modal';
import ReservationAndHourlyPriceSetter from './ReservationAndHourlyPriceSetter';
import PaymentReport from './PaymentReport';
import PriceSidebar from './PriceSidebar';
import './ParkingPriceManagement.css';

const ViewAgentPrices = () => {
  const [prices, setPrices] = useState([]);
  const [filteredPrices, setFilteredPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [showPriceSetter, setShowPriceSetter] = useState(false);
  const [showUpdatePriceModal, setShowUpdatePriceModal] = useState(false);
  const [showPaymentReport, setShowPaymentReport] = useState(false);
  const [agentName, setAgentName] = useState('');
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowPriceSetter(false);
    setShowUpdatePriceModal(false);
    setShowPaymentReport(false);
    setSelectedPrice(null);
    fetchPrices(); // Refresh data when closing modals
  };

  const handleNewPriceClick = () => {
    setShowPriceSetter(true);
  };

  const handlePaymentReportClick = () => {
    setShowPaymentReport(true);
  };

  const handleUpdatePriceClick = () => {
    setShowUpdatePriceModal(true);
  };

  // Fetch parking prices on component mount with optimized loading
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        setNotification({ message: '', type: '' });
        
        const agentEmail = localStorage.getItem('UserEmail');
        if (!agentEmail) {
          throw new Error('User not authenticated');
        }

        // Add a timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        try {
          const response = await parkingPriceService.getAgentParkingPrices(agentEmail, {
            signal: controller.signal
          });
          
          if (!Array.isArray(response)) {
            throw new Error('Invalid data received from server');
          }
          
          setPrices(response);
          setFilteredPrices(response);
          
          if (response.length > 0 && response[0].agent) {
            setAgentName(response[0].agent.name || '');
          }
        } catch (err) {
          if (err.name !== 'AbortError') throw err;
        }
        
        clearTimeout(timeoutId);
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch parking prices';
        setError(errorMsg);
        setNotification({ message: errorMsg, type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array

  const fetchPrices = async () => {
    try {
      setLoading(true);
      setError('');
      setNotification({ message: '', type: '' });
      
      const agentEmail = localStorage.getItem('UserEmail');
      if (!agentEmail) {
        throw new Error('User not authenticated');
      }

      const response = await parkingPriceService.getAgentParkingPrices(agentEmail);
      
      if (!Array.isArray(response)) {
        throw new Error('Invalid data received from server');
      }
      
      setPrices(response);
      setFilteredPrices(response);
      
      if (response.length > 0 && response[0].agent) {
        setAgentName(response[0].agent.name || '');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to fetch parking prices';
      setError(errorMsg);
      setNotification({ message: errorMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    const filtered = prices.filter(item => 
      item.parking_slot?.location_name?.toLowerCase().includes(term) ||
      item.parking_slot?.city?.toLowerCase().includes(term) ||
      item.parking_slot?.sub_city?.toLowerCase().includes(term) ||
      item.parking_slot?.woreda?.toString().includes(term)
    );
    
    setFilteredPrices(filtered);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setFilteredPrices(prices);
  };

  if (loading && prices.length === 0) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading parking prices...</p>
      </div>
    );
  }

  if (error && prices.length === 0) {
    return (
      <div className="error-state">
        <div className="error-icon">
          <i className="fas fa-exclamation-circle"></i>
        </div>
        <h3>Error Loading Prices</h3>
        <p className="error-message">{error}</p>
        <button 
          className="btn btn-primary"
          onClick={fetchPrices}
        >
          <i className="fas fa-sync-alt"></i> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PriceSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="view-prices-container">
          {notification.message && (
            <Notification
              message={notification.message}
              type={notification.type}
              onClose={() => setNotification({ message: '', type: '' })}
            />
          )}
          <div className="view-prices-header">
            <h2 className="page-title">View Parking Prices</h2>
            
            <div className="header-content">
              <div className="header-left">
                <button 
                  className={`btn-payment ${loading ? 'disabled' : ''}`}
                  onClick={handlePaymentReportClick}
                  disabled={loading}
                >
                  <i className="fas fa-file-invoice-dollar"></i> Payment Report
                </button>
              </div>
              
              {agentName && (
                <div className="agent-info">
                  <small>Agent: {agentName}</small>
                </div>
              )}
              
              <div className="header-right">
                <button 
                  className={`btn-update ${loading ? 'disabled' : ''}`}
                  onClick={handleUpdatePriceClick}
                  disabled={loading}
                >
                  <i className="fas fa-edit"></i> Update Price
                </button>
                <button 
                  className={`btn-new ${loading ? 'disabled' : ''}`}
                  onClick={handleNewPriceClick}
                  disabled={loading}
                >
                  <i className="fas fa-plus"></i> Set New Price
                </button>
              </div>
            </div>
          </div>

          <div className="search-bar">
            <div className="input-group">
              <input
                type="text"
                placeholder="Search by location, city, sub-city, or woreda..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="form-control"
                disabled={loading}
              />
              {searchTerm && (
                <button 
                  className="btn btn-outline-secondary"
                  onClick={clearSearch}
                  disabled={loading}
                  title="Clear Search"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          </div>

          <div className="prices-grid">
            {filteredPrices.length > 0 ? (
              <table className="prices-table">
                <thead>
                  <tr>
                    <th>Location</th>
                    <th>City</th>
                    <th>Sub City</th>
                    <th>Woreda</th>
                    <th>Reservation Price (ETB)</th>
                    <th>Hourly Price (ETB)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrices.map((item) => (
                    <tr key={item.id}>
                      <td>{item.parking_slot?.location_name || 'N/A'}</td>
                      <td>{item.parking_slot?.city || 'N/A'}</td>
                      <td>{item.parking_slot?.sub_city || 'N/A'}</td>
                      <td>{item.parking_slot?.woreda ? `Woreda ${item.parking_slot.woreda}` : 'N/A'}</td>
                      <td className="text-right">
                        <span className="price-badge">
                          {item.reservation_price?.toLocaleString() || 'N/A'}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className="price-badge">
                          {item.price_per_hour?.toLocaleString() || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-results">
                <i className="fas fa-info-circle"></i>
                <p>{searchTerm ? 'No matching prices found' : 'No prices available'}</p>
                {searchTerm && (
                  <button 
                    className="btn btn-link"
                    onClick={clearSearch}
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>

          {/* New Price Setter Modal */}
          {showPriceSetter && (
            <Modal 
              onClose={handleCloseModal} 
              title="Set New Price"
              size="lg"
            >
              <ReservationAndHourlyPriceSetter onSuccess={handleCloseModal} />
              <div className="modal-footer">
                <button 
                  className="btn btn-primary done-btn"
                  onClick={handleCloseModal}
                >
                  Done
                </button>
              </div>
            </Modal>
          )}

          {/* Update Price Modal */}
          {showUpdatePriceModal && (
            <Modal 
              onClose={handleCloseModal} 
              title="Update Price"
              size="lg"
            >
              <ReservationAndHourlyPriceSetter 
                isUpdate={true}
                onSuccess={handleCloseModal} 
              />
              <div className="modal-footer">
                <button 
                  className="btn btn-primary done-btn"
                  onClick={handleCloseModal}
                >
                  Done
                </button>
              </div>
            </Modal>
          )}

          {/* Payment Report Modal */}
          {showPaymentReport && (
            <Modal 
              onClose={handleCloseModal} 
              title="Payment Report"
              size="lg"
            >
              <PaymentReport />
              <div className="modal-footer">
                <button 
                  className="btn btn-primary done-btn"
                  onClick={handleCloseModal}
                >
                  Done
                </button>
              </div>
            </Modal>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewAgentPrices;