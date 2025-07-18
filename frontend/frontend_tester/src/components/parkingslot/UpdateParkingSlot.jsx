import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { parkingSlotService } from '../../services/api';
import './UpdateParkingSlot.css';

const UpdateParkingSlot = () => {
  const { id } = useParams(); // Get the parking slot ID from URL params
    
  // Search parameters state
  const [searchParams, setSearchParams] = useState({
    agent_email: ''
  });
  
  // Agent information state
  const [agentInfo, setAgentInfo] = useState(null);
  
  // Parking slot data state
  const [parkingSlotData, setParkingSlotData] = useState(null);
  
  // Form data for updating
  const [formData, setFormData] = useState({
    id: '',
    agent_id: '',
    agent_email: '',
    city: '',
    sub_city: '',
    woreda: '',
    location_name: '',
    status: 'available'
  });
  
  // State for UI handling
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [updateCompleted, setUpdateCompleted] = useState(false);

  // Handle search parameter changes
  const handleSearchParamChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form input changes for updating
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle search submission
  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchLoading(true);
    setSearchError(null);
    setParkingSlotData(null);
    setAgentInfo(null);
    setUpdateCompleted(false);

    try {
      const response = await parkingSlotService.getAgentParkingSlots(searchParams.agent_email);
      if (response.data && response.data.parking_slots && response.data.parking_slots.length > 0) {
        setParkingSlotData(response.data.parking_slots);
        if (response.data.agent) {
          setAgentInfo(response.data.agent);
        }
      } else {
        setSearchError(response.data?.message || 'No parking slots found for this agent');
      }
    } catch (err) {
      setSearchError(err.response?.data?.message || 'Error searching for parking slots');
      console.error('Search error:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  // Select parking slot for updating
  const selectForUpdate = (slot) => {
    setFormData({
      id: slot.id,
      agent_id: slot.agent_id,
      agent_email: slot.agent ? slot.agent.email : (agentInfo ? agentInfo.email : ''),
      city: slot.city || '',
      sub_city: slot.sub_city || '',
      woreda: slot.woreda || '',
      location_name: slot.location_name || '',
      status: slot.status || 'available'
    });
    setUpdateCompleted(false);
    setError(null);
    setSuccess(null);
  };

  // Handle update submission
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setUpdateCompleted(false);

    try {
      const response = await parkingSlotService.updateParkingSlot(formData.id, formData);
      setSuccess(response.data.message || 'Parking slot updated successfully');
      setUpdateCompleted(true);
      
      // Update the displayed data with the new information
      if (parkingSlotData) {
        setParkingSlotData(parkingSlotData.map(slot => 
          slot.id === formData.id ? { ...formData } : slot
        ));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update parking slot');
      console.error('Error updating parking slot:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-parking-slot-container">
      <h2>Update Parking Area</h2>
      
      {/* Search Form */}
      <div className="search-form-section">
        <h3>Search by Agent Email</h3>
        <form onSubmit={handleSearch}>
          <div className="form-group">
            <label>Agent Email:</label>
            <input
              type="email"
              name="agent_email"
              value={searchParams.agent_email}
              onChange={handleSearchParamChange}
              required
              placeholder="Enter agent's email address"
            />
          </div>
          
          <button type="submit" disabled={searchLoading}>
            {searchLoading ? 'Searching...' : 'Search Parking Slots'}
          </button>
        </form>
        
        {searchError && <div className="error-message">{searchError}</div>}
      </div>
      
      {/* Search Results */}
      {parkingSlotData && parkingSlotData.length > 0 && (
        <div className="search-results-section">
          <h3>Search Results</h3>
          <div className="parking-slot-cards">
            {parkingSlotData.map(slot => (
              <div 
                key={slot.id} 
                className={`parking-slot-card ${formData.id === slot.id ? 'selected' : ''}`}
                onClick={() => selectForUpdate(slot)}
              >
                <h4>Parking Area #{slot.id}</h4>
                <p><strong>Agent:</strong> {slot.agent ? slot.agent.name + (slot.agent.email ? ` (${slot.agent.email})` : '') : (agentInfo ? agentInfo.name : `ID: ${slot.agent_id}`)}</p>
                <p><strong>Location:</strong> {slot.city}, {slot.sub_city}, {slot.woreda}</p>
                <p><strong>Name:</strong> {slot.location_name}</p>
                <p><strong>Status:</strong> <span className={`status-${slot.status}`}>{slot.status}</span></p>
                <button 
                  type="button" 
                  className="select-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    selectForUpdate(slot);
                  }}
                >
                  Select for Update
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Update Form - Only show when a parking slot is selected after search */}
      {formData.id && parkingSlotData && (
        <div className="update-form-section">
          <h3>Update Parking Slot</h3>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label>Parking Slot ID:</label>
              <input
                type="text"
                name="id"
                value={formData.id}
                readOnly
                disabled
              />
            </div>
            
            <div className="form-group">
              <label>Agent Email:</label>
              <input
                type="email"
                name="agent_email"
                value={formData.agent_email}
                onChange={handleFormChange}
                required
                placeholder="Enter agent's email address"
              />
            </div>
            
            <div className="form-group" style={{display:'none'}}>
              <label>Agent ID (Read-only):</label>
              <input
                type="text"
                name="agent_id"
                value={formData.agent_id}
                readOnly
                disabled
              />
            </div>
            
            <div className="form-group">
              <label>City:</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleFormChange}
                required
                maxLength={100}
              />
            </div>
            
            <div className="form-group">
              <label>Sub City:</label>
              <input
                type="text"
                name="sub_city"
                value={formData.sub_city}
                onChange={handleFormChange}
                required
                maxLength={100}
              />
            </div>
            
            <div className="form-group">
              <label>Woreda:</label>
              <input
                type="text"
                name="woreda"
                value={formData.woreda}
                onChange={handleFormChange}
                required
                maxLength={100}
              />
            </div>
            
            <div className="form-group">
              <label>Location Name:</label>
              <input
                type="text"
                name="location_name"
                value={formData.location_name}
                onChange={handleFormChange}
                required
                maxLength={100}
              />
            </div>
            
            <div className="form-group">
              <label>Status:</label>
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleFormChange}
                required
              >
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
            
            <button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Parking Slot'}
            </button>
          </form>
        </div>
      )}
      
      {/* Updated Information Card - Only show after successful update */}
      {updateCompleted && parkingSlotData && (
        <div className="updated-info-section">
          <h3>Updated Parking Slot Information</h3>
          <div className="updated-info-card">
            <h4>Parking Slot #{formData.id}</h4>
            <p><strong>Agent:</strong> {agentInfo ? agentInfo.name : formData.agent_id}</p>
            <p><strong>Location:</strong> {formData.city}, {formData.sub_city}, {formData.woreda}</p>
            <p><strong>Name:</strong> {formData.location_name}</p>
            <p><strong>Status:</strong> <span className={`status-${formData.status}`}>{formData.status}</span></p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateParkingSlot;