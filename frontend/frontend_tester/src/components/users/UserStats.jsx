import React, { useState, useEffect } from 'react';
import { userService, parkingSlotService } from '../../services/api';
import './UserStyles.css';

const UserStats = () => {
  const [statistics, setStatistics] = useState({
    allUsers: { count: 0 },
    activeUsers: { count: 0 },
    agents: { count: 0 },
    availableParkingSlots: 0,
    totalParkingSlots: 0,
    availableSlots: 0,
    unavailableSlots: 0,
    totalSlots: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: ''
  });

  useEffect(() => {
    fetchAllStatistics();
  }, []);

  const fetchAllStatistics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Make API calls in sequence to troubleshoot any particular issues
      // Users stats
      let stats = {
        allUsers: { count: 0 },
        activeUsers: { count: 0 },
        agents: { count: 0 },
        availableParkingSlots: 0,
        totalParkingSlots: 0,
        availableSlots: 0,
        unavailableSlots: 0,
        totalSlots: 0
      };
      
      try {
        console.log('Fetching all users count...');
        const allUsersResponse = await userService.countAllUsers();
        console.log('All users response:', allUsersResponse);
        
        if (allUsersResponse && allUsersResponse.data) {
          // If response is a direct number
          if (typeof allUsersResponse.data === 'number') {
            stats.allUsers = { count: allUsersResponse.data };
          }
          // If response has a count property
          else if (allUsersResponse.data.count !== undefined) {
            stats.allUsers = { count: allUsersResponse.data.count };
          }
          // If response is the actual data object
          else if (typeof allUsersResponse.data === 'object') {
            stats.allUsers = allUsersResponse.data;
            // Ensure count property exists
            if (!stats.allUsers.count && stats.allUsers.total) {
              stats.allUsers.count = stats.allUsers.total;
            }
          }
        }
      } catch (err) {
        console.error('Error fetching all users count:', err);
      }
      
      try {
        console.log('Fetching active users count...');
        const activeUsersResponse = await userService.countActiveUsers();
        console.log('Active users response:', activeUsersResponse);
        
        if (activeUsersResponse && activeUsersResponse.data) {
          if (typeof activeUsersResponse.data === 'number') {
            stats.activeUsers = { count: activeUsersResponse.data };
          }
          else if (activeUsersResponse.data.count !== undefined) {
            stats.activeUsers = { count: activeUsersResponse.data.count };
          }
          else if (typeof activeUsersResponse.data === 'object') {
            stats.activeUsers = activeUsersResponse.data;
            if (!stats.activeUsers.count && stats.activeUsers.total) {
              stats.activeUsers.count = stats.activeUsers.total;
            }
          }
        }
      } catch (err) {
        console.error('Error fetching active users count:', err);
      }
      
      try {
        console.log('Fetching agents count...');
        const agentsResponse = await userService.countAgents();
        console.log('Agents response:', agentsResponse);
        
        if (agentsResponse && agentsResponse.data) {
          if (typeof agentsResponse.data === 'number') {
            stats.agents = { count: agentsResponse.data };
          }
          else if (agentsResponse.data.count !== undefined) {
            stats.agents = { count: agentsResponse.data.count };
          }
          else if (typeof agentsResponse.data === 'object') {
            stats.agents = agentsResponse.data;
            if (!stats.agents.count && stats.agents.total) {
              stats.agents.count = stats.agents.total;
            }
          }
        }
      } catch (err) {
        console.error('Error fetching agents count:', err);
      }
      
      // Parking slots stats
      try {
        console.log('Fetching available parking slots...');
        const availableResponse = await parkingSlotService.countAvailableParkingSlots();
        console.log('Available slots response:', availableResponse);
        
        // Use the exact response format from the Laravel backend:
        // { message: 'Available parking slots', available_parking_slots: number }
        if (availableResponse && availableResponse.data) {
          if (availableResponse.data.available_parking_slots !== undefined) {
            stats.availableParkingSlots = availableResponse.data.available_parking_slots;
            console.log('Found available_parking_slots:', stats.availableParkingSlots);
          }
        }
      } catch (err) {
        console.error('Error fetching available parking slots:', err);
      }
      
      try {
        console.log('Fetching total parking slots...');
        const totalResponse = await parkingSlotService.countTotalParkingSlots();
        console.log('Total slots response:', totalResponse);
        
        // Use the exact response format from the Laravel backend:
        // { message: 'Total parking slots', total_parking_slots: number }
        if (totalResponse && totalResponse.data) {
          if (totalResponse.data.total_parking_slots !== undefined) {
            stats.totalParkingSlots = totalResponse.data.total_parking_slots;
            console.log('Found total_parking_slots:', stats.totalParkingSlots);
          }
        }
      } catch (err) {
        console.error('Error fetching total parking slots:', err);
      }
      
      // Fetch individual slots status (available and unavailable)
      try {
        console.log('Fetching individual slots status...');
        const slotsStatusResponse = await parkingSlotService.getAvailableAndUnavailableSlots();
        console.log('Slots status response:', slotsStatusResponse);
        
        if (slotsStatusResponse && slotsStatusResponse.data) {
          stats.availableSlots = slotsStatusResponse.data.available || 0;
          stats.unavailableSlots = slotsStatusResponse.data.unavailable || 0;
          stats.totalSlots = stats.availableSlots + stats.unavailableSlots;
          console.log('Found available slots:', stats.availableSlots);
          console.log('Found unavailable slots:', stats.unavailableSlots);
          console.log('Total slots:', stats.totalSlots);
        }
      } catch (err) {
        console.error('Error fetching slots status:', err);
      }
      
      console.log('Final stats:', stats);
      setStatistics(stats);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      setError('Failed to load user statistics. Please try again later.');
      setLoading(false);
      
      setNotification({
        show: true,
        message: 'Error loading statistics. Please try again.',
        type: 'error'
      });
      
      // Auto-dismiss notification after 10 seconds
      setTimeout(() => {
        setNotification({
          show: false,
          message: '',
          type: ''
        });
      }, 10000);
    }
  };

  const calculatePercentage = (part, total) => {
    if (total === 0) return 0;
    return Math.round((part / total) * 100);
  };

  if (loading) {
    return (
      <div className="user-component">
        <div className="loading">Loading user statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-component">
        {notification.show && (
          <div className={`notification ${notification.type}`}>
            {notification.message}
            <button 
              className="close-btn"
              onClick={() => setNotification({ show: false, message: '', type: '' })}
            >
              &times;
            </button>
          </div>
        )}
        <div className="error-message">{error}</div>
        <button 
          className="refresh-btn"
          onClick={fetchAllStatistics}
        >
          Try Again
        </button>
      </div>
    );
  }

  // Ensure all counts are at least 0 to prevent negative numbers
  const safeActiveUsers = Math.max(0, statistics.activeUsers.count || 0);
  const safeAllUsers = Math.max(1, statistics.allUsers.count || 0); // Minimum 1 to avoid division by zero
  const safeAgents = Math.max(0, statistics.agents.count || 0);
  const safeAvailableSlots = Math.max(0, statistics.availableParkingSlots || 0);
  const safeTotalSlots = Math.max(safeAvailableSlots, statistics.totalParkingSlots || 0); // Ensure total is at least as large as available
  
  // Ensure individual slot counts are at least 0
  const safeAvailableIndividualSlots = Math.max(0, statistics.availableSlots || 0);
  const safeUnavailableIndividualSlots = Math.max(0, statistics.unavailableSlots || 0);
  const safeTotalIndividualSlots = Math.max(safeAvailableIndividualSlots + safeUnavailableIndividualSlots, statistics.totalSlots || 0);
  
  // Calculate user percentages
  const activePercentage = calculatePercentage(safeActiveUsers, safeAllUsers);
  const agentsPercentage = calculatePercentage(safeAgents, safeAllUsers);
  
  // Calculate derived counts
  const inactiveCount = Math.max(0, safeAllUsers - safeActiveUsers);
  const inactivePercentage = calculatePercentage(inactiveCount, safeAllUsers);
  const nonAgentCount = Math.max(0, safeAllUsers - safeAgents);
  const nonAgentPercentage = calculatePercentage(nonAgentCount, safeAllUsers);
  
  // Calculate parking area statistics
  const availableSlotsPercentage = calculatePercentage(safeAvailableSlots, safeTotalSlots);
  const occupiedSlotsCount = Math.max(0, safeTotalSlots - safeAvailableSlots);
  const occupiedSlotsPercentage = calculatePercentage(occupiedSlotsCount, safeTotalSlots);
  
  // Calculate individual slots statistics
  const availableIndividualSlotsPercentage = calculatePercentage(safeAvailableIndividualSlots, safeTotalIndividualSlots);
  const unavailableIndividualSlotsPercentage = calculatePercentage(safeUnavailableIndividualSlots, safeTotalIndividualSlots);

  return (
    <div className="user-component">
      <h2>User Statistics Dashboard</h2>
      
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
          <button 
            className="close-btn"
            onClick={() => setNotification({ show: false, message: '', type: '' })}
          >
            &times;
          </button>
        </div>
      )}
      
      <button 
        className="refresh-btn"
        onClick={fetchAllStatistics}
      >
        Refresh Statistics
      </button>
      
      <div className="stats-overview">
        <div className="stats-card">
          <div className="stats-icon users-icon">👥</div>
          <div className="stats-content">
            <h3>Total Users</h3>
            <div className="stats-number">{statistics.allUsers.count}</div>
            <div className="stats-description">All registered users in the system</div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="stats-icon active-icon">✅</div>
          <div className="stats-content">
            <h3>Active Users</h3>
            <div className="stats-number">{statistics.activeUsers.count}</div>
            <div className="stats-description">{activePercentage}% of total users are active</div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="stats-icon agents-icon">🛡️</div>
          <div className="stats-content">
            <h3>Agents</h3>
            <div className="stats-number">{statistics.agents.count}</div>
            <div className="stats-description">{agentsPercentage}% of total users are agents</div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="stats-icon parking-icon">🅿️</div>
          <div className="stats-content">
            <h3>Parking Areas</h3>
            <div className="stats-number">{safeTotalSlots}</div>
            <div className="stats-description">{availableSlotsPercentage}% of areas are available</div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="stats-icon parking-icon">🚗</div>
          <div className="stats-content">
            <h3>Total Slots</h3>
            <div className="stats-number">{safeTotalIndividualSlots}</div>
            <div className="stats-description">Individual parking slots in system</div>
          </div>
        </div>
      </div>
      
      <div className="stats-details">
        <div className="stats-section">
          <h3>User Status Distribution</h3>
          <div className="progress-container">
            <div className="progress-info">
              <span>Active Users</span>
              <span>{activePercentage}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill active-fill" 
                style={{ width: `${activePercentage}%` }}
              ></div>
            </div>
            <div className="progress-count">{statistics.activeUsers.count} users</div>
          </div>
          
          <div className="progress-container">
            <div className="progress-info">
              <span>Inactive Users</span>
              <span>{inactivePercentage}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill inactive-fill" 
                style={{ width: `${inactivePercentage}%` }}
              ></div>
            </div>
            <div className="progress-count">{inactiveCount} users</div>
          </div>
        </div>
        
        <div className="stats-section">
          <h3>User Role Distribution</h3>
          <div className="progress-container">
            <div className="progress-info">
              <span>Agents</span>
              <span>{agentsPercentage}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill agents-fill" 
                style={{ width: `${agentsPercentage}%` }}
              ></div>
            </div>
            <div className="progress-count">{statistics.agents.count} users</div>
          </div>
          
          <div className="progress-container">
            <div className="progress-info">
              <span>Administrators</span>
              <span>{nonAgentPercentage}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill admin-fill" 
                style={{ width: `${nonAgentPercentage}%` }}
              ></div>
            </div>
            <div className="progress-count">{nonAgentCount} users</div>
          </div>
        </div>
        
        <div className="stats-section">
          <h3>Parking Areas Availability</h3>
          <div className="progress-container">
            <div className="progress-info">
              <span>Available Areas</span>
              <span>{availableSlotsPercentage}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill available-fill" 
                style={{ width: `${availableSlotsPercentage}%` }}
              ></div>
            </div>
            <div className="progress-count">{safeAvailableSlots} areas</div>
          </div>
          
          <div className="progress-container">
            <div className="progress-info">
              <span>Occupied Areas</span>
              <span>{occupiedSlotsPercentage}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill occupied-fill" 
                style={{ width: `${occupiedSlotsPercentage}%` }}
              ></div>
            </div>
            <div className="progress-count">{occupiedSlotsCount} areas</div>
          </div>
        </div>
        
        <div className="stats-section">
          <h3>Individual Slots Availability</h3>
          <div className="progress-container">
            <div className="progress-info">
              <span>Free Slots</span>
              <span>{availableIndividualSlotsPercentage}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill available-fill" 
                style={{ width: `${availableIndividualSlotsPercentage}%` }}
              ></div>
            </div>
            <div className="progress-count">{safeAvailableIndividualSlots} slots</div>
          </div>
          
          <div className="progress-container">
            <div className="progress-info">
              <span>Occupied Slots</span>
              <span>{unavailableIndividualSlotsPercentage}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill occupied-fill" 
                style={{ width: `${unavailableIndividualSlotsPercentage}%` }}
              ></div>
            </div>
            <div className="progress-count">{safeUnavailableIndividualSlots} slots</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStats;
