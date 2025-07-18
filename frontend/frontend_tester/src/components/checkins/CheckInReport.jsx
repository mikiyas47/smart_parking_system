import { useState, useEffect } from 'react';
import { parkingSlotService } from '../../services/api';
import './CheckInReport.css';

function CheckInReport() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [notification, setNotification] = useState(null);
  const [todayCheckins, setTodayCheckins] = useState(null);
  const [activeParkingArea, setActiveParkingArea] = useState(null);

  // Format date and time helpers
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Fetch today's  -ins count
  useEffect(() => {
    const fetchTodayCheckins = async () => {
      try {
        // Get user ID from local storage
        const UserEmail = localStorage.getItem('UserEmail');
        
        if (!UserEmail) {
          console.error('User ID not found. Please login again.');
          return;
        }
        
        const response = await parkingSlotService.getTodayCheckIns(UserEmail);
        setTodayCheckins(response.data.check_ins);
      } catch (err) {
        console.error('Error fetching today\'s check-ins:', err);
      }
    };
    
    fetchTodayCheckins();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      setNotification({
        type: 'error',
        message: 'Please select both start and end dates'
      });
      
      setTimeout(() => {
        setNotification(null);
      }, 10000);
      
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setActiveParkingArea(null);
      
      // Get user ID from local storage
      const UserEmail = localStorage.getItem('UserEmail');
      
      if (!UserEmail) {
        setError('User not found. Please login again.');
        setLoading(false);
        return;
      }
      
      // Format dates in YYYY-MM-DD format for the API
      const formattedStartDate = startDate; // already in YYYY-MM-DD format from input
      const formattedEndDate = endDate;
      
      // Call API to get report
      const response = await parkingSlotService.getCheckInReport(formattedStartDate, formattedEndDate, UserEmail);
      setReportData(response.data);
      
      // Show success notification
      setNotification({
        type: 'success',
        message: 'Report generated successfully!'
      });
      
      setTimeout(() => {
        setNotification(null);
      }, 10000);
      
    } catch (err) {
      setError('Failed to generate report: ' + (err.response?.data?.message || err.message));
      
      // Show error notification
      setNotification({
        type: 'error',
        message: 'Failed to generate report: ' + (err.response?.data?.message || err.message)
      });
      
      setTimeout(() => {
        setNotification(null);
      }, 10000);
      
    } finally {
      setLoading(false);
    }
  };

  const handleClearReport = () => {
    setReportData(null);
    setActiveParkingArea(null);
  };
  
  const viewParkingAreaDetails = (parkingArea) => {
    setActiveParkingArea(parkingArea);
  };
  
  const goBackToOverview = () => {
    setActiveParkingArea(null);
  };

  return (
    <div className="report-container">
      {notification && (
        <div className={`report-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      
      <div className="report-header">
        <h2>Check-In Reports</h2>
        <p>Track and analyze parking check-ins across your managed locations</p>
      </div>
      
      {/* Today's Check-ins Overview */}
      <div className="todays-checkins-card">
        <div className="card-icon">
          <span className="material-icons">today</span>
        </div>
        <div className="card-content">
          <h3>Today's Check-ins</h3>
          <div className="count-display">{todayCheckins !== null ? todayCheckins : 'Loading...'}</div>
        </div>
      </div>
      
      <div className="report-form-container">
        <h3 className="section-title">Date Range Report</h3>
        <form onSubmit={handleSubmit} className="report-form">
          <div className="form-group">
            <label htmlFor="startDate">Start Date:</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="date-input"
              max={endDate || undefined}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="endDate">End Date:</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="date-input"
              min={startDate || undefined}
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="generate-button"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
            
            {reportData && (
              <button 
                type="button" 
                className="clear-button"
                onClick={handleClearReport}
              >
                Clear Report
              </button>
            )}
          </div>
        </form>
      </div>
      
      {error && <div className="report-error">{error}</div>}
      
      {reportData && !activeParkingArea && (
        <div className="report-results">
          <div className="report-summary">
            <h3>Overall Report Summary</h3>
            <div className="period-banner">
              <span className="date-range">{formatDate(reportData.period.start_date)} - {formatDate(reportData.period.end_date)}</span>
            </div>
            
            <div className="summary-stats-grid">
              <div className="stat-card">
                <div className="stat-icon"><span className="material-icons">location_on</span></div>
                <div className="stat-content">
                  <div className="stat-value">{reportData.overall_stats.total_parking_areas}</div>
                  <div className="stat-label">Parking Areas</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon"><span className="material-icons">space_dashboard</span></div>
                <div className="stat-content">
                  <div className="stat-value">{reportData.overall_stats.total_slots}</div>
                  <div className="stat-label">Total Slots</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon"><span className="material-icons">local_parking</span></div>
                <div className="stat-content">
                  <div className="stat-value">{reportData.overall_stats.total_check_ins}</div>
                  <div className="stat-label">Total Check-ins</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon"><span className="material-icons">logout</span></div>
                <div className="stat-content">
                  <div className="stat-value">{reportData.overall_stats.completed_check_outs}</div>
                  <div className="stat-label">Completed Check-outs</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon"><span className="material-icons">directions_car</span></div>
                <div className="stat-content">
                  <div className="stat-value">{reportData.overall_stats.currently_parked}</div>
                  <div className="stat-label">Currently Parked</div>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon"><span className="material-icons">check_circle</span></div>
                <div className="stat-content">
                  <div className="stat-value">{reportData.overall_stats.available_slots}</div>
                  <div className="stat-label">Available Slots</div>
                </div>
              </div>
            </div>
          </div>
          
          {reportData.parking_areas && reportData.parking_areas.length > 0 ? (
            <div className="parking-areas-section">
              <h3>Parking Areas</h3>
              <div className="parking-areas-grid">
                {reportData.parking_areas.map((area, index) => (
                  <div key={index} className="parking-area-card" onClick={() => viewParkingAreaDetails(area)}>
                    <div className="area-header">
                      <h4>{area.location_name || `Parking Area #${area.id}`}</h4>
                      <div className="area-location">{area.city}{area.sub_city ? `, ${area.sub_city}` : ''}</div>
                    </div>
                    <div className="area-stats">
                      <div className="area-stat">
                        <span className="stat-label">Slots:</span>
                        <span className="stat-value">{area.stats.total_slots}</span>
                      </div>
                      <div className="area-stat">
                        <span className="stat-label">Check-ins:</span>
                        <span className="stat-value">{area.stats.check_ins_during_period}</span>
                      </div>
                      <div className="area-stat">
                        <span className="stat-label">Currently Parked:</span>
                        <span className="stat-value">{area.stats.currently_parked}</span>
                      </div>
                    </div>
                    <div className="view-details">View Details →</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-data-message">
              <div className="message-icon"><span className="material-icons">info</span></div>
              <p>No parking areas found for this agent.</p>
            </div>
          )}
        </div>
      )}
      
      {reportData && activeParkingArea && (
        <div className="parking-area-details">
          <button className="back-to-overview" onClick={goBackToOverview}>
            <span className="material-icons">arrow_back</span> Back to Overview
          </button>
          
          <div className="area-detail-header">
            <h3>{activeParkingArea.location_name || `Parking Area #${activeParkingArea.id}`}</h3>
            <div className="area-location-detail">{activeParkingArea.city}{activeParkingArea.sub_city ? `, ${activeParkingArea.sub_city}` : ''}{activeParkingArea.woreda ? ` - Woreda ${activeParkingArea.woreda}` : ''}</div>
          </div>
          
          <div className="area-stats-container">
            <div className="stat-detail-card">
              <div className="stat-detail-label">Total Slots</div>
              <div className="stat-detail-value">{activeParkingArea.stats.total_slots}</div>
            </div>
            <div className="stat-detail-card">
              <div className="stat-detail-label">Available</div>
              <div className="stat-detail-value">{activeParkingArea.stats.available_slots}</div>
            </div>
            <div className="stat-detail-card">
              <div className="stat-detail-label">Occupied</div>
              <div className="stat-detail-value">{activeParkingArea.stats.occupied_slots}</div>
            </div>
            <div className="stat-detail-card">
              <div className="stat-detail-label">Check-ins</div>
              <div className="stat-detail-value">{activeParkingArea.stats.check_ins_during_period}</div>
            </div>
            <div className="stat-detail-card">
              <div className="stat-detail-label">Check-outs</div>
              <div className="stat-detail-value">{activeParkingArea.stats.completed_check_outs}</div>
            </div>
          </div>
          
          {activeParkingArea.check_ins && activeParkingArea.check_ins.length > 0 ? (
            <div className="checkins-detail-section">
              <h4>Check-in Records</h4>
              <div className="details-table-container">
                <table className="details-table">
                  <thead>
                    <tr>
                      <th>Car Plate</th>
                      <th>Slot</th>
                      <th>Check-in Time</th>
                      <th>Check-out Time</th>
                      <th>Duration</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeParkingArea.check_ins.map((checkin, index) => (
                      <tr key={index} className={checkin.status === 'checked_out' ? 'completed-row' : 'active-row'}>
                        <td className="plate-cell">{checkin.car_plate}</td>
                        <td>{checkin.slot_number || `#${checkin.id}`}</td>
                        <td>{formatDateTime(checkin.check_in_time)}</td>
                        <td>{formatDateTime(checkin.check_out_time)}</td>
                        <td>{checkin.duration}</td>
                        <td>
                          <span className={`status-badge ${checkin.status}`}>
                            {checkin.status === 'checked_out' ? 'Checked Out' : 'Parked'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="no-checkins-message">
              <p>No check-in records found for this parking area during the selected period.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CheckInReport;