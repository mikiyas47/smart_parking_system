import React, { useState, useEffect } from 'react';
import { parkingSlotService } from '../../services/api';
import './TodayCheckInsWidget.css';

function TodayCheckInsWidget() {
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTodayCheckIns = async () => {
      const UserEmail = localStorage.getItem('UserEmail'); // stored email, e.g., girma@example.com

      if (!UserEmail) {
        console.warn('No user email found in localStorage. Please login again.');
        setError('User email not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Updated: POST request with email payload
        const response = await parkingSlotService.getTodayCheckIns({ UserEmail });

        setTodayCount(response.data.check_ins);
        setError(null);
      } catch (err) {
        setError("Failed to load today's check-ins");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayCheckIns();
  }, []);

  return (
    <div className="today-checkins-widget">
      <h3>Cars Parked Today</h3>
      {loading ? (
        <p className="loading">Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <div className="count-display">
          <span className="count">{todayCount}</span>
          <span className="label">vehicle{todayCount !== 1 ? 's' : ''} today</span>
        </div>
      )}
    </div>
  );
}

export default TodayCheckInsWidget;
