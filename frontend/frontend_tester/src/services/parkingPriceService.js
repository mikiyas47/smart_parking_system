import api from './api';

const parkingPriceService = {
  /**
   * Get parking areas managed by an agent
   * @param {string} agentEmail - Agent's email address
   * @returns {Promise<Array>} List of parking areas
   */
  async getAgentParkingAreas(agentEmail) {
    try {
      if (!agentEmail) {
        throw new Error('Agent email is required');
      }

      const response = await api.post('/parking-slots/agent', {
        agent_email: agentEmail
      });

      if (!response.data) {
        console.warn('Empty response from getAgentParkingAreas');
        return [];
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching agent parking areas:', {
        error: error.message,
        endpoint: '/parking-slots/agent',
        email: agentEmail,
        stack: error.stack
      });
      throw new Error(error.response?.data?.message || 'Failed to fetch parking areas');
    }
  },

  /**
   * Set both reservation and hourly prices
   * @param {Object} params - Price parameters
   * @param {string} params.email - Agent email
   * @param {number} params.parking_slot_id - Parking slot ID
   * @param {number} params.reservation_price - Reservation price
   * @param {number} params.price_per_hour - Hourly price
   * @returns {Promise<Object>} Updated price data
   */
  async setReservationAndHourlyPrice({ email, parking_slot_id, reservation_price, price_per_hour }) {
    try {
      if (!email || !parking_slot_id) {
        throw new Error('Email and parking slot ID are required');
      }

      const numericPrices = {
        parking_slot_id: parseInt(parking_slot_id, 10),
        reservation_price: parseFloat(reservation_price) || 0,
        price_per_hour: parseFloat(price_per_hour) || 0
      };

      if (isNaN(numericPrices.parking_slot_id)) {
        throw new Error('Invalid parking slot ID');
      }

      const response = await api.post('/prices/reservationAndHourly/set', {
        email,
        ...numericPrices
      });

      return response.data;
    } catch (error) {
      console.error('Error setting prices:', {
        error: error.message,
        endpoint: '/prices/reservationAndHourly/set',
        params: { email, parking_slot_id },
        stack: error.stack
      });
      throw new Error(error.response?.data?.message || 'Failed to set prices');
    }
  },

  /**
   * Get all parking prices
   * @returns {Promise<Array>} List of all parking prices
   */
  async getParkingPrices() {
    try {
      const response = await api.get('/prices');
      
      if (!Array.isArray(response.data)) {
        console.warn('Expected array but got:', typeof response.data);
        return [];
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching all prices:', {
        error: error.message,
        endpoint: '/prices',
        stack: error.stack
      });
      throw new Error(error.response?.data?.message || 'Failed to fetch prices');
    }
  },

  /**
   * Get specific parking price by ID
   * @param {number} id - Price record ID
   * @returns {Promise<Object>} Price data
   */
  async getParkingPriceById(id) {
    try {
      if (!id) {
        throw new Error('Price ID is required');
      }

      const response = await api.get(`/prices/${id}`);
      
      if (!response.data) {
        throw new Error('Price not found');
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching price by ID:', {
        error: error.message,
        endpoint: `/prices/${id}`,
        stack: error.stack
      });
      throw new Error(error.response?.data?.message || 'Failed to fetch price');
    }
  },

  /**
   * Update parking price
   * @param {number} id - Price record ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated price data
   */
  async updateParkingPrice(id, data) {
    try {
      if (!id) {
        throw new Error('Price ID is required');
      }

      if (!data || (!data.reservation_price && !data.price_per_hour)) {
        throw new Error('At least one price value is required');
      }

      const numericData = {
        ...(data.reservation_price && { 
          reservation_price: parseFloat(data.reservation_price) 
        }),
        ...(data.price_per_hour && { 
          price_per_hour: parseFloat(data.price_per_hour) 
        })
      };

      const response = await api.put(`/prices/${id}`, numericData);
      return response.data;
    } catch (error) {
      console.error('Error updating price:', {
        error: error.message,
        endpoint: `/prices/${id}`,
        data,
        stack: error.stack
      });
      throw new Error(error.response?.data?.message || 'Failed to update price');
    }
  },


  /**
   * Update only reservation price
   * @param {Object} params - Update parameters
   * @param {string} params.email - Agent email
   * @param {number} params.parking_slot_id - Parking slot ID
   * @param {number} params.reservation_price - New reservation price
   * @returns {Promise<Object>} Updated price data
   */
  async updateReservationPrice({ email, parking_slot_id, reservation_price }) {
    try {
      if (!email || !parking_slot_id) {
        throw new Error('Email and parking slot ID are required');
      }

      const numericPrice = parseFloat(reservation_price);
      if (isNaN(numericPrice)) {
        throw new Error('Invalid reservation price');
      }

      const response = await api.put('/prices/reservation/update', {
        email,
        parking_slot_id: parseInt(parking_slot_id, 10),
        reservation_price: numericPrice
      });

      return response.data;
    } catch (error) {
      console.error('Error updating reservation price:', {
        error: error.message,
        endpoint: '/prices/reservation/update',
        params: { email, parking_slot_id },
        stack: error.stack
      });
      throw new Error(error.response?.data?.message || 'Failed to update reservation price');
    }
  },

  /**
   * Update only hourly price
   * @param {Object} params - Update parameters
   * @param {string} params.email - Agent email
   * @param {number} params.parking_slot_id - Parking slot ID
   * @param {number} params.price_per_hour - New hourly price
   * @returns {Promise<Object>} Updated price data
   */
  async updateHourlyPrice({ email, parking_slot_id, price_per_hour }) {
    try {
      if (!email || !parking_slot_id) {
        throw new Error('Email and parking slot ID are required');
      }

      const numericPrice = parseFloat(price_per_hour);
      if (isNaN(numericPrice)) {
        throw new Error('Invalid hourly price');
      }

      const response = await api.put('/prices/hourly/update', {
        email,
        parking_slot_id: parseInt(parking_slot_id, 10),
        price_per_hour: numericPrice
      });

      return response.data;
    } catch (error) {
      console.error('Error updating hourly price:', {
        error: error.message,
        endpoint: '/prices/hourly/update',
        params: { email, parking_slot_id },
        stack: error.stack
      });
      throw new Error(error.response?.data?.message || 'Failed to update hourly price');
    }
  },

  /**
   * Get all parking prices for a specific agent
   * @param {string} agentEmail - Agent's email address
   * @returns {Promise<Array>} List of parking prices
   */
  async getAgentParkingPrices(agentEmail) {
    try {
      if (!agentEmail) {
        throw new Error('Agent email is required');
      }

      console.debug('Requesting agent prices for:', agentEmail);
      const response = await api.post('/price/agent/viewprice', {
        email: agentEmail
      });

      if (!response.data) {
        console.warn('Empty response from getAgentParkingPrices');
        return [];
      }

      if (!Array.isArray(response.data)) {
        console.warn('Expected array but got:', typeof response.data);
        return [];
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching agent prices:', {
        error: error.message,
        endpoint: '/price/agent/viewprice',
        email: agentEmail,
        responseStatus: error.response?.status,
        responseData: error.response?.data,
        stack: error.stack
      });
      throw new Error(error.response?.data?.message || 'Failed to fetch agent prices');
    }
  }
};

export default parkingPriceService;