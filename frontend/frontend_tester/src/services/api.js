import axios from 'axios';

// Create axios instance with base URL
// Replace with your actual API base URL
const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Authentication API services
export const authService = {
  // Login user
  login: (email, password) => {
    return apiClient.post('/login', { email, password });
  },
  
  // Logout user
  logout: () => {
    return apiClient.post('/logout');
  }
};

// User API services
export const userService = {
  // Find a user by email
  findUserByEmail: (email) => {
    return apiClient.post('/users/find', { email });
  },
  // Get all users
  getUsers: () => {
    return apiClient.get('/users');
  },
  
  // Search users by name
  searchUsersByName: (name) => {
    return apiClient.get('/users/search', {
      params: { name }
    });
  },
  
  // Get a single user by email
  getUser: (data) => {
    return apiClient.get(`/users/find`,data);
  },
  
  // Create a new user
  createUser: (data) => {
    return apiClient.post('/users', data);
  },
  
  // Update a user
  updateUser: (data) => {
    return apiClient.post('/users/update', data);
  },
  
  // Delete a user
  deleteUser: (id) => {
    return apiClient.delete(`/users/${id}`);
  },
  
  // Update user status
  updateUserStatus: (id, status) => {
    return apiClient.patch(`/users/${id}/status`, { status });
  },
  
  // Count all users
  countAllUsers: () => {
    return apiClient.post('/users/count');
  },
  
  // Count active users
  countActiveUsers: () => {
    return apiClient.post('/users/active/count');
  },
  
  // Count agents
  countAgents: () => {
    return apiClient.post('/users/agents/count');
  }
};

// Parking slot API services
export const parkingSlotService = {
  // Create a new parking slot
  createParkingSlot: (data) => {
    return apiClient.post('/parking-slots', data);
  },
  getAllParkingSlots: () => {
    return apiClient.get('/parking-slots');
  },
  
  // Get parking slots for a specific agent
  getAgentParkingSlots: (agentEmail) => {
    return apiClient.post('/parking-slots/agent', { 
      agent_email: agentEmail 
    });
  },

  // Find parking area by location name, city, sub-city, and woreda
  findParkingArea: (data) => {
    return apiClient.post('/parking-slots/area', {
      city: data.city,
      sub_city: data.sub_city,
      woreda: data.woreda,
      location_name: data.location_name
    });
  },

  // Find parking area by parking slot ID
  findParkingAreaBySlotId: (parkingSlotId) => {
    return apiClient.post('/parking-slots/area/parking-slot-id', { 
      parking_slot_id: parkingSlotId 
    });
  },
  
  // Find a specific parking slot by ID
  findParkingSlotById: (id) => {
    return apiClient.get(`/parking-slots/${id}`);
  },
  
  // Update a parking slot
  updateParkingSlot: (id, data) => {
    return apiClient.post('/parking-slots/update', {
      parking_slot_id: id,
      agent_email: data.agent_email,
      city: data.city,
      sub_city: data.sub_city,
      woreda: data.woreda,
      location_name: data.location_name,
      status: data.status
    });
  },
  
  // Count available parking slots
  countAvailableParkingSlots: () => {
    return apiClient.get('/parking-slots/available/count');
  },
  
  // Count total parking slots
  countTotalParkingSlots: () => {
    return apiClient.get('/parking-slots/total/count');
  },
  
  // Get all parking areas and slots for a specific agent
  getAgentSlots: (agentId) => {
    return apiClient.get('/parking-slots/agent', { 
      params: { agent_id: agentId } 
    });
  },
  
  // Register a new slot
  registerSlot: (data) => {
    return apiClient.post('/slots', data);
  },
  
  // Update slot status
  updateSlotStatus: (slotId, UserEmail, status) => {
    return apiClient.post('/slots/update-status', {
      slot_id: slotId,
      UserEmail: UserEmail,
      status: status
    });
  },
  
  // Check in a car to a parking slot
  checkInCar: (carId, slotId) => {
    return apiClient.post('/check-ins', {
      car_id: carId,
      slot_id: slotId
    });
  },
  
  // Check out a car from a parking slot
  checkOutCar: (data) => {
    return apiClient.post('/check-outs', data);
  },
  
  // Get slots for a specific parking slot
  getAgentSlots: (UserEmail, parkingSlotId) => {
    return apiClient.post('/agent/slots', {
      UserEmail: UserEmail,
      parking_slot_id: parkingSlotId
    });
  },
  
  // Get check-in report by date range
  getCheckInReport: (startDate, endDate, UserEmail) => {
    return apiClient.post('/agent/slots/report', {
      start_date: startDate,
      end_date: endDate,
      UserEmail: UserEmail
    });
  },
  
  // Get today's check-ins count for a specific agent
  getTodayCheckIns: (UserEmail) => {
    return apiClient.post('/today/check-ins', {
      UserEmail: UserEmail
    });
  },
  
  // Get count of available and unavailable slots
  getAvailableAndUnavailableSlots: () => {
    return apiClient.post('/slots/available/count');
  }
};

// Car API services
export const carService = {
  // Register a new car
  registerCar: (data) => {
    return apiClient.post('/cars', data);
  },
  
  // Search for a car by plate number
  searchCar: (plateNumber) => {
    return apiClient.get('/cars/search', {
      params: { plate_number: plateNumber }
    });
  },

  getAllCars: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/cars`);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  // Check if a car is already checked in and not checked out
  checkIfCarAlreadyCheckedIn: (plateNumber) => {
    return apiClient.post('/cars/in-checkins', {
      plate_number: plateNumber
    });
  },
  
  // Update car information based on plate number
  updateCar: (data) => {
    return apiClient.put('/cars/update', data);
  }
};

export default apiClient;
/**
 * import axios from 'axios';
This imports the Axios library, which is used to make HTTP requests (GET, POST, PUT, etc.) in JavaScript.



// Create axios instance with base URL
// Replace with your actual API base URL
const API_BASE_URL = 'http://localhost:8000/api';
A constant API_BASE_URL is declared and assigned the base URL for the backend API.

In this case, it's pointing to a Laravel backend running locally on port 8000.

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});
This creates an Axios instance called apiClient using the axios.create() method.

It sets the default baseURL for all requests.

Also sets HTTP headers so that the client sends and accepts JSON data by default.

// Parking slot API services
export const parkingSlotService = {
You are defining and exporting a parkingSlotService object that holds methods to interact with your backend API related to parking slots.


  // Create a new parking slot
  createParkingSlot: (data) => {
    return apiClient.post('/parking-slots', data);
  },
This method sends a POST request to /parking-slots to create a new slot.

data is the body of the request, containing slot information.


  // Get parking slots for a specific agent
  getAgentParkingSlots: (agentId) => {
    return apiClient.get('/parking-slots/agent', { 
      params: { agent_id: agentId } 
    });
  },
This sends a GET request to /parking-slots/agent.

It passes the agentId as a query parameter (e.g., /parking-slots/agent?agent_id=5).

Used to fetch parking slots assigned to a specific agent.

  // Update a parking slot
  updateParkingSlot: (id, data) => {
    return apiClient.put(`/parking-slots/${id}`, data);
  },
Sends a PUT request to update a specific parking slot using its id.

data contains the new values for the slot.

  // Count available parking slots
  countAvailableParkingSlots: () => {
    return apiClient.get('/parking-slots/available/count');
  }
Sends a GET request to get the count of available parking slots.

No parameters are needed.


};
Closes the parkingSlotService object.


export default apiClient;
Exports the apiClient as the default export, so it can be used in other files (e.g., for requests unrelated to parking slots).
 */
