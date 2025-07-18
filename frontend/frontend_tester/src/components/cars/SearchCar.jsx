import { useState, useEffect } from 'react';
import { carService } from '../../services/api';
import RegisterCar from './RegisterCar';
import Modal from '../Modal';
import './SearchCar.css';

function SearchCar() {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    plate_number: '',
    make: '',
    model: '',
    color: ''
  });

  // Modal visibility state
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAllCars();
  }, []);

  useEffect(() => {
    const filtered = cars.filter(car => {
      const searchLower = searchTerm.toLowerCase();
      return (
        car.plate_number?.toLowerCase().includes(searchLower) ||
        car.make?.toLowerCase().includes(searchLower) ||
        car.model?.toLowerCase().includes(searchLower) ||
        car.color?.toLowerCase().includes(searchLower)
      );
    });
    setFilteredCars(filtered);
  }, [searchTerm, cars]);

  const fetchAllCars = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await carService.getAllCars();
      if (!response.data) {
        throw new Error('No data received from server');
      }
      setCars(response.data);
      setFilteredCars(response.data);
    } catch (err) {
      let errorMessage = 'Error fetching cars';
      if (err.response) {
        errorMessage = err.response.data?.message || 
                      `Server error: ${err.response.status}`;
      } else if (err.request) {
        errorMessage = 'Network error - no response from server';
      } else {
        errorMessage = err.message || 'Unknown error occurred';
      }
      setError(errorMessage);
      setCars([]);
      setFilteredCars([]);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (car) => {
    setEditingId(car.plate_number);
    setEditFormData({
      plate_number: car.plate_number,
      make: car.make,
      model: car.model,
      color: car.color
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  const handleCancelClick = () => {
    setEditingId(null);
  };

  const handleSaveClick = async () => {
    try {
      setLoading(true);
      // Update the car in the database
      await carService.updateCar(editFormData);
      
      // Update the local state
      const updatedCars = cars.map(car => 
        car.plate_number === editingId ? editFormData : car
      );
      
      setCars(updatedCars);
      setEditingId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating car');
      console.error('Update error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    fetchAllCars();
  };

  // Open modal handler
  const openModal = () => setIsModalOpen(true);
  // Close modal handler
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="car-list-container">
      <div className="car-list-header">
        <h2>Car Management</h2>
        {/* Replace NavLink with button */}
        <button 
          onClick={openModal} 
          className="register-btn"
          title="Register Car"
          type="button"
        >
          <i className="fas fa-plus-circle"></i>
          Register New Car
        </button>
      </div>
      
      <div className="search-filter">
        <input
          type="text"
          placeholder="Search by plate, make, model or color..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {error && (
        <div className="error-message">
          {error}
          <button onClick={handleRetry} className="retry-btn">
            Retry
          </button>
        </div>
      )}
      
      {loading ? (
        <div className="loading-message">Loading cars...</div>
      ) : (
        <table className="cars-table">
          <thead>
            <tr>
              <th>Plate Number</th>
              <th>Make</th>
              <th>Model</th>
              <th>Color</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCars.length > 0 ? (
              filteredCars.map(car => (
                <tr key={car.plate_number}>
                  <td>
                    {editingId === car.plate_number ? (
                      <input
                        type="text"
                        name="plate_number"
                        value={editFormData.plate_number}
                        onChange={handleEditFormChange}
                        disabled // Plate number shouldn't be editable
                      />
                    ) : (
                      car.plate_number
                    )}
                  </td>
                  <td>
                    {editingId === car.plate_number ? (
                      <input
                        type="text"
                        name="make"
                        value={editFormData.make}
                        onChange={handleEditFormChange}
                      />
                    ) : (
                      car.make
                    )}
                  </td>
                  <td>
                    {editingId === car.plate_number ? (
                      <input
                        type="text"
                        name="model"
                        value={editFormData.model}
                        onChange={handleEditFormChange}
                      />
                    ) : (
                      car.model
                    )}
                  </td>
                  <td>
                    {editingId === car.plate_number ? (
                      <input
                        type="text"
                        name="color"
                        value={editFormData.color}
                        onChange={handleEditFormChange}
                      />
                    ) : (
                      car.color
                    )}
                  </td>
                  <td>
                    {editingId === car.plate_number ? (
                      <>
                        <button onClick={handleSaveClick} className="save-btn">
                          Save
                        </button>
                        <button onClick={handleCancelClick} className="cancel-btn">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => handleEditClick(car)}
                        className="edit-btn"
                      >
                        <i className="fas fa-edit"></i>
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">
                  {searchTerm ? 'No matching cars found' : 'No cars available'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Modal for RegisterCar */}
      {isModalOpen && (
        <Modal onClose={closeModal}>
          <RegisterCar />
          <div style={{ marginTop: '20px', textAlign: 'right' }}>
            <button onClick={closeModal} className="done-btn" type="button">
              Done
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default SearchCar;
