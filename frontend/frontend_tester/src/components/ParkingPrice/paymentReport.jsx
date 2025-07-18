import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import paymentService from '../../services/paymentService';
import './paymentReport.css';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const PaymentReport = () => {
  const email = localStorage.getItem('UserEmail') || '';
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      setError('Please select start and end dates');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await paymentService.getPaymentReport(email, startDate, endDate);
      setReport(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  const chartData = report
    ? {
        labels: ['Reservation', 'Check-In'],
        datasets: [
          {
            label: 'Total Amount (ETB)',
            data: [
              report.summary.by_reason.reservation.total,
              report.summary.by_reason.check_in.total,
            ],
            backgroundColor: ['#0d6efd', '#28a745'],
            hoverOffset: 40,
          },
        ],
      }
    : null;

  const amountFormat = (val) =>
    new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
    }).format(val);

  return (
    <div className="payment-report">
      <h2>Payment Report</h2>
      <p className="agent-email">Agent: {email}</p>

      <form className="date-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="start">Start</label>
          <input
            type="date"
            id="start"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="end">End</label>
          <input
            type="date"
            id="end"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <button className="btn-primary" disabled={loading} type="submit">
          {loading ? 'Loading...' : 'Generate'}
        </button>
      </form>

      {error && <div className="error-msg">{error}</div>}

      {report && (
        <>
          <div className="chart-wrapper">
            <Pie data={chartData} options={{ plugins: { title: { display: true, text: 'Payments by Reason' } } }} />
          </div>

          <div className="summary-cards">
            <div className="card total">
              <h4>Total Amount</h4>
              <p>{amountFormat(report.summary.total_amount)}</p>
            </div>
            <div className="card reservation">
              <h4>Reservation Payments</h4>
              <p>{amountFormat(report.summary.by_reason.reservation.total)}</p>
            </div>
            <div className="card checkin">
              <h4>Check-In Payments</h4>
              <p>{amountFormat(report.summary.by_reason.check_in.total)}</p>
            </div>
          </div>

          <table className="report-table">
            <thead>
              <tr>
                <th>Reason</th>
                <th>Count</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Reservation</td>
                <td>{report.summary.by_reason.reservation.count}</td>
                <td>{amountFormat(report.summary.by_reason.reservation.total)}</td>
              </tr>
              <tr>
                <td>Check-In</td>
                <td>{report.summary.by_reason.check_in.count}</td>
                <td>{amountFormat(report.summary.by_reason.check_in.total)}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default PaymentReport;
