import { useState, useEffect } from 'react';
import { parkingSlotService } from '../../services/api';

const AgentParkingSlots = () => {
  const [agentEmail, setAgentEmail] = useState('');
  const [parkingSlots, setParkingSlots] = useState([]);
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize with empty agentEmail
  useEffect(() => {
    setAgentEmail('');
    setParkingSlots([]);
    setAgent(null);
  }, []);

  const fetchParkingSlots = async (email) => {
    if (!email) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await parkingSlotService.getAgentParkingSlots(email);
      setParkingSlots(response.data.parking_slots);
      setAgent(response.data.agent);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch parking slots');
      setParkingSlots([]);
      setAgent(null);
      console.error('Error fetching parking slots:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    fetchParkingSlots(agentEmail);
  };

  return (
    <div className="agent-parking-slots">
      <h2>Agent Parking Areas</h2>
      
      <form onSubmit={handleSearch}>
        <div className="form-group">
          <label>Agent Email:</label>
          <input
            type="email"
            value={agentEmail}
            onChange={(e) => setAgentEmail(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      
      {error && <div className="error-message">{error}</div>}
      
      {agent && (
        <div className="agent-info">
          <h3>Agent Information</h3>
          <p><strong>Name:</strong> {agent.name}</p>
          <p><strong>Email:</strong> {agent.email}</p>
        </div>
      )}
      
      {parkingSlots.length > 0 ? (
        <div className="parking-slots-list">
          <h3>Parking Areas ({parkingSlots.length})</h3>
          <table>
            <thead>
              <tr>
                <th style={{display:'none'}}>ID</th>
                <th>City</th>
                <th>Sub City</th>
                <th>Woreda</th>
                <th>Location</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {parkingSlots.map((slot) => (
                <tr key={slot.id}>
                  <td style={{display:'none'}}>{slot.id}</td>
                  <td>{slot.city}</td>
                  <td>{slot.sub_city}</td>
                  <td>{slot.woreda}</td>
                  <td>{slot.location_name}</td>
                  <td className={slot.status === 'available' ? 'status-available' : 'status-unavailable'}>
                    {slot.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : agent && (
        <p>No parking slots found for this agent.</p>
      )}
    </div>
  );
};

export default AgentParkingSlots;
