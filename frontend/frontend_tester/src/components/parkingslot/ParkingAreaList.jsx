import { useState, useEffect } from 'react';
import { parkingSlotService } from '../../services/api';
import { FaSearch, FaPlus, FaUserPlus, FaEdit } from 'react-icons/fa';
import './ParkingAreaList.css';
import Modal from '../Modal';
import CreateParkingSlot from './CreateParkingSlot';
import UpdateParkingSlot from './UpdateParkingSlot';
import AgentParkingSlots from './AgentParkingSlots';

function ParkingAreaList() {
  const [parkingAreas, setParkingAreas] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState({
    show: false,
    type: '',
    data: null
  });

  useEffect(() => {
    fetchParkingAreas();
  }, []);

  useEffect(() => {
    const results = parkingAreas.filter(area =>
      area.location_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.sub_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.woreda.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAreas(results);
  }, [searchTerm, parkingAreas]);

  const fetchParkingAreas = async () => {
    try {
      setLoading(true);
      const response = await parkingSlotService.getAllParkingSlots();
      setParkingAreas(response.data.parking_slots || []);
      setFilteredAreas(response.data.parking_slots || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching parking areas:', err);
      setError(err.response?.data?.message || 'Error loading parking areas');
      setLoading(false);
    }
  };

  const handleCreateArea = () => {
    setModal({
      show: true,
      type: 'create'
    });
  };

  const handleAgentArea = () => {
    setModal({
      show: true,
      type: 'agent'
    });
  };

  const handleUpdateArea = () => {
    setModal({
      show: true,
      type: 'update'
    });
  };

  const closeModal = () => {
    setModal({
      show: false,
      type: ''
    });
  };

  const handleModalSuccess = () => {
    fetchParkingAreas();
    closeModal();
  };

  return (
    <div className="parking-area-list-container">
      <div className="parking-area-header">
        <div className="header-content">
          <h2>Parking Areas List</h2>
        </div>
        
        <div className="action-buttons">
          <button 
            className="action-btn create-btn"
            onClick={handleCreateArea}
          >
            <FaPlus className="btn-icon" />
            Create Area
          </button>
          
          <button 
            className="action-btn agent-btn"
            onClick={handleAgentArea}
          >
            <FaUserPlus className="btn-icon" />
            Agent Areas
          </button>

          <button 
            className="action-btn update-btn"
            onClick={handleUpdateArea}
          >
            <FaEdit className="btn-icon" />
            Update Area
          </button>
        </div>
      </div>

      <div className="search-container">
        <div className="search-input-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search parking areas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-spinner"></div>
      ) : filteredAreas.length === 0 ? (
        <div className="no-results">
          <p>No parking areas found matching your search.</p>
        </div>
      ) : (
        <div className="parking-area-table-container">
          <table className="parking-area-table">
            <thead>
              <tr>
                
                <th>Location Name</th>
                <th>City</th>
                <th>Sub-City</th>
                <th>Woreda</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAreas.map((area) => (
                <tr 
                  key={area.id} 
                  className={area.status === 'available' ? 'available-row' : 'unavailable-row'}
                >
                  
                  <td>{area.location_name}</td>
                  <td>{area.city}</td>
                  <td>{area.sub_city}</td>
                  <td>{area.woreda}</td>
                  <td>
                    <span className={`status-badge ${area.status}`}>
                      {area.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal.show && (
        <Modal show={modal.show} onClose={closeModal}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>{
                modal.type === 'create' ? 'Create Parking Area' :
                modal.type === 'agent' ? 'Agent Parking Areas' :
                modal.type === 'update' ? 'Update Parking Area' :
                ''
              }</h3>
            </div>
            
            <div className="modal-body">
              {modal.type === 'create' && (
                <CreateParkingSlot 
                  onClose={closeModal} 
                  onSuccess={handleModalSuccess} 
                />
              )}
              {modal.type === 'agent' && (
                <AgentParkingSlots 
                  onClose={closeModal} 
                />
              )}
              {modal.type === 'update' && (
                <UpdateParkingSlot 
                  onClose={closeModal} 
                  onSuccess={handleModalSuccess} 
                />
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default ParkingAreaList;