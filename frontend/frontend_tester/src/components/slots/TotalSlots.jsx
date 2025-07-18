import { useState, useEffect } from 'react';
import axios from 'axios';
import './TotalSlots.css';

function TotalSlots() {
  const [totalSlots, setTotalSlots] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTotalSlots = async () => {
      try {
        setLoading(true);
        // Create a baseURL for the API
        const apiClient = axios.create({
          baseURL: 'http://localhost:8000',
        });
        const response = await apiClient.get('/api/slots/total');
        setTotalSlots(response.data.total);
        setError(null);
      } catch (err) {
        setError('Failed to fetch total slots: ' + (err.response?.data?.message || err.message));
        console.error('Error fetching total slots:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTotalSlots();
  }, []);

  return (
    <div className="total-slots-container">
      <h2>Total slots</h2>
      
      {loading && (
        <div className="loading-spinner">
          <p></p>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      {!loading && !error && totalSlots !== null && (
        <div className="total-count-card">
          <h3>Current Area Count</h3>
          <div className="count-display">
            <span className="count-number">{totalSlots}</span>
            <span className="count-label">Total Slots</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default TotalSlots;
