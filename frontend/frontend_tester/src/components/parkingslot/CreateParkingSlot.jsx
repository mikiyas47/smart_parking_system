import { useState } from 'react';
import { parkingSlotService } from '../../services/api';

const CreateParkingSlot = () => {
  const [formData, setFormData] = useState({
    email: '',
    city: '',
    sub_city: '',
    woreda: '',
    location_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [createdSlot, setCreatedSlot] = useState(null);
  const[Agent_name,setAgentname]=useState(null);
  const [showForm, setShowForm] = useState(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await parkingSlotService.createParkingSlot(formData);
      setSuccess(response.data.message);
      setCreatedSlot(response.data.parking_slot);
      setAgentname(response.data.Agent_name);
      setShowForm(false);
      // Form will be reset when returning to it
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create parking slot');
      console.error('Error creating parking slot:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleReturnToForm = () => {
    setShowForm(true);
    setCreatedSlot(null);
    setAgentname(null);
    setSuccess(null);
    setFormData({
      email: '',
      city: '',
      sub_city: '',
      woreda: '',
      location_name: ''
    });
  };

  return (
    <div className="create-parking-slot">
      <h2>Create New Parking Area</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {!showForm && createdSlot ? (
        <div className="parking-slot-card">
          <div className="success-message">{success}</div>
          <h3>Parking Area Created Successfully</h3>
          <div className="slot-details">
           
            <div className="detail-item">
              <span className="detail-label">Agent Name:</span>
              <span className="detail-value">{Agent_name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">City:</span>
              <span className="detail-value">{createdSlot.city}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Sub City:</span>
              <span className="detail-value">{createdSlot.sub_city}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Woreda:</span>
              <span className="detail-value">{createdSlot.woreda}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Location:</span>
              <span className="detail-value">{createdSlot.location_name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status:</span>
              <span className="detail-value status-{createdSlot.status}">{createdSlot.status}</span>
            </div>
          </div>
          <button 
            type="button" 
            className="ok-button" 
            onClick={handleReturnToForm}
          >
            OK
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Agent Email:</label>
          <input
            type="text"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>City:</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
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
            onChange={handleChange}
            required
            maxLength={100}
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Parking Area'}
        </button>
      </form>
      )}
    </div>
  );
};

export default CreateParkingSlot;
