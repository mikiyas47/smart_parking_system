import api from './api';

const paymentService = {
  // Get reservation price for a specific slot
  async getReservationPrice(slotId) {
    try {
      const response = await api.get('/prices/reservation', {
        params: { slot_id: slotId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching reservation price:', error);
      throw error;
    }
  },

  // Get hourly price for a specific slot
  async getHourlyPrice(slotId) {
    try {
      const response = await api.get('/prices/hourly', {
        params: { slot_id: slotId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching hourly price:', error);
      throw error;
    }
  },

  // Process payment for a reservation
  async payForReservation(plateNumber, slotId) {
    try {
      const response = await api.post('/payment/reservation', {
        plate_number: plateNumber,
        slot_id: slotId
      });
      return response.data;
    } catch (error) {
      console.error('Error processing reservation payment:', error);
      throw error;
    }
  },

  // Process payment for a check-in (after checkout)
  async getPaymentReport(email, startDate, endDate) {
    try {
      const response = await api.post('/payments/report', {
        email,
        start_date: startDate,
        end_date: endDate
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching payment report:', error);
      throw error;
    }
  },

  async payForCheckIn(plateNumber, slotId, amount) {
    try {
      const response = await api.post('/payment/check-in', {
        plate_number: plateNumber,
        slot_id: slotId,
        amount: amount
      });
      return response.data;
    } catch (error) {
      console.error('Error processing check-in payment:', error);
      throw error;
    }
  }
};

export default paymentService;