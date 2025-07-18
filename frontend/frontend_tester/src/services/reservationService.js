import api from './api';

const reservationService = {
  async makeReservation(plateNumber, slotId) {
    try {
      const response = await api.post('/reservations/make', {
        plate_number: plateNumber,
        slot_id: slotId
      });
      return response.data;
    } catch (error) {
      console.error('Error making reservation:', error);
      throw error;
    }
  },

  async getAgentParkingAreas() {
    try {
      const userEmail = localStorage.getItem('UserEmail');
      if (!userEmail) {
        throw new Error('User not found. Please log in again.');
      }
      
      const response = await api.post('/parking-slots/agent', {
        agent_email: userEmail
      });
      
      // Transform the data to include full location path
      const areas = response.data.parking_slots || [];
      return areas.map(area => ({
        ...area,
        locationPath: `${area.city} > ${area.sub_city} > ${area.woreda} > ${area.location_name}`
      }));
    } catch (error) {
      console.error('Error fetching agent parking areas:', error);
      throw error;
    }
  },

  async getAgentSlots(parkingAreaId) {
    try {
      const userEmail = localStorage.getItem('UserEmail');
      if (!userEmail) {
        throw new Error('User not found. Please log in again.');
      }
      
      const response = await api.post('/agent/slots', {
        UserEmail: userEmail,
        parking_slot_id: parkingAreaId
      });
      
      return response.data.slots || [];
    } catch (error) {
      console.error('Error fetching agent slots:', error);
      // If the endpoint doesn't exist yet, return a mock response for testing
      if (error.response?.status === 404) {
        console.warn('Using mock slots data - endpoint not implemented');
        return [];
      }
      throw error;
    }
  },

  // Legacy method - keeping for backward compatibility
  async getParkingSlots(parkingAreaId) {
    return this.getAgentSlots(parkingAreaId);
  },

  // Get active reservations for an agent
  async getActiveReservationsByAgent(email) {
    try {
      const response = await api.post('/reservations/agent/active', {
        email: email
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching active reservations:', error);
      throw error;
    }
  },
  
  // Get reservations by parking area
  async getReservationsByParkingArea(email, parkingAreaId) {
    try {
      const response = await api.post('/reservations/area', {
        email: email,
        parking_area_id: parkingAreaId
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching reservations by area:', error);
      throw error;
    }
  },

  // Cancel a reservation by plate number
  async cancelReservation(plateNumber) {
    try {
      const response = await api.post('/reservations/cancel', {
        plate_number: plateNumber
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      throw error;
    }
  },

  // Check in a car with an active reservation
  async checkInByReservation(email, plateNumber) {
    try {
      const response = await api.post('/check-in/from-reservation', {
        email,
        plate_number: plateNumber
      });
      return response.data;
    } catch (error) {
      console.error('Error checking in by reservation:', error);
      throw error;
    }
  },

  async getReservationPrice(slotId) {
    try {
      const response = await api.get('/prices/reservation', { params: { slot_id: slotId } });
      return response.data.reservation_price;
    } catch (error) {
      console.error('Error getting reservation price:', error);
      throw error;
    }
  },

  async payForReservation(slotId, plateNumber) {
    try {
      const response = await api.post('/payment/reservation', {
        slot_id: slotId,
        plate_number: plateNumber
      });
      return response.data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  },

  // Fetch reservation report for the agent between the specified date range
  async getReservationReport(email, startDate, endDate) {
    try {
      const response = await api.post('/reservations/report', {
        email,
        start_date: startDate,
        end_date: endDate
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching reservation report:', error);
      throw error;
    }
  }
};

export default reservationService;
