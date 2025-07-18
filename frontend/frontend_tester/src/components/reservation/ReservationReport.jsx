import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import reservationService from '../../services/reservationService';
import './ReservationReport.css';

// Register chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ReservationReport = () => {
  const userEmail = localStorage.getItem('UserEmail') || '';

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const data = await reservationService.getReservationReport(
        userEmail,
        startDate,
        endDate
      );
      setReport(data.report || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const labels = report.map((item) => item.parking_area.location_name);
  const statuses = ['active', 'cancelled', 'expired', 'checked_in'];
  const colors = {
    active: '#28a745',
    cancelled: '#dc3545',
    expired: '#fd7e14',
    checked_in: '#0d6efd',
  };

  const datasets = statuses.map((status) => ({
    label: status.replace('_', ' ').toUpperCase(),
    data: report.map((item) => item.reservation_summary[status]),
    backgroundColor: colors[status],
  }));

  const chartData = {
    labels,
    datasets,
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Reservation Summary',
      },
    },
  };

  return (
    <div className="reservation-report">
      <h2>Reservation Report</h2>
      <p className="agent-email">Agent: {userEmail}</p>

      <form className="date-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="startDate">Start Date</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="endDate">End Date</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Loading...' : 'Generate'}
        </button>
      </form>

      {error && <div className="error-msg">{error}</div>}

      {report.length > 0 && (
        <>
          <div className="chart-wrapper">
            <Bar data={chartData} options={chartOptions} />
          </div>

          <div className="report-table-wrapper">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Location</th>
                  <th>Total</th>
                  <th>Active</th>
                  <th>Cancelled</th>
                  <th>Expired</th>
                  <th>Checked In</th>
                </tr>
              </thead>
              <tbody>
                {report.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.parking_area.location_name}</td>
                    <td>{item.reservation_summary.total}</td>
                    <td>{item.reservation_summary.active}</td>
                    <td>{item.reservation_summary.cancelled}</td>
                    <td>{item.reservation_summary.expired}</td>
                    <td>{item.reservation_summary.checked_in}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ReservationReport;
