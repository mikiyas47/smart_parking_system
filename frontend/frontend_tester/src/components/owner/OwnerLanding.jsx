import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './OwnerLanding.css';
import OwnerReservationFlow from './OwnerReservationFlow';
import OwnerCancelReservation from './OwnerCancelReservation';

function OwnerLanding() {
  // States for location selection
  const [cities, setCities] = useState([]);
  const [subCities, setSubCities] = useState([]);
  const [woredas, setWoredas] = useState([]);
  const [locations, setLocations] = useState([]);
  
  // Selected location states
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedSubCity, setSelectedSubCity] = useState('');
  const [selectedWoreda, setSelectedWoreda] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  
  // Polling timer
  const [pollId, setPollId] = useState(null);

  // Results and loading states
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showReserve, setShowReserve] = useState(false);
  const [reserveSlot, setReserveSlot] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [showCancel, setShowCancel] = useState(false);

  // All parking slots data
  const [allParkingSlots, setAllParkingSlots] = useState([]);
  
  // Fetch all parking slots on component mount
  useEffect(() => {
    fetchParkingSlots();
  }, []);
  
  // Extract unique cities when parking slots data is loaded
  useEffect(() => {
    if (allParkingSlots.length > 0) {
      const uniqueCities = [...new Set(allParkingSlots.map(slot => slot.city))];
      setCities(uniqueCities);
    }
  }, [allParkingSlots]);
  
  // Update sub-cities when city is selected
  useEffect(() => {
    if (selectedCity) {
      const citySlots = allParkingSlots.filter(slot => slot.city === selectedCity);
      const uniqueSubCities = [...new Set(citySlots.map(slot => slot.sub_city))];
      setSubCities(uniqueSubCities);
      setSelectedSubCity('');
      setSelectedWoreda('');
      setSelectedLocation('');
      setWoredas([]);
      setLocations([]);
    }
  }, [selectedCity, allParkingSlots]);
  
  // Update woredas when sub-city is selected
  useEffect(() => {
    if (selectedSubCity) {
      const subCitySlots = allParkingSlots.filter(
        slot => slot.city === selectedCity && slot.sub_city === selectedSubCity
      );
      const uniqueWoredas = [...new Set(subCitySlots.map(slot => slot.woreda))];
      setWoredas(uniqueWoredas);
      setSelectedWoreda('');
      setSelectedLocation('');
      setLocations([]);
    }
  }, [selectedSubCity, selectedCity, allParkingSlots]);
  
  // Update locations when woreda is selected
  useEffect(() => {
    if (selectedWoreda) {
      const woredaSlots = allParkingSlots.filter(
        slot => 
          slot.city === selectedCity && 
          slot.sub_city === selectedSubCity &&
          slot.woreda === selectedWoreda
      );
      const uniqueLocations = [...new Set(woredaSlots.map(slot => slot.location_name))];
      setLocations(uniqueLocations);
      
      setSelectedLocation('');
    }
  }, [selectedWoreda, selectedSubCity, selectedCity, allParkingSlots]);
  
  // Fetch all parking slots from API
  const fetchParkingSlots = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get('http://localhost:8000/api/parking-slots');
      
      if (response.data && response.data.parking_slots) {
        setAllParkingSlots(response.data.parking_slots);
      } else {
        setError('No parking slots data found');
      }
    } catch (err) {
      console.error('Error fetching parking slots:', err);
      setError('Failed to load parking slots data. Please try again later.');
      
      // For demo purposes, use sample data if API fails
      const sampleData = generateSampleData();
      setAllParkingSlots(sampleData);
    } finally {
      setLoading(false);
    }
  };
  
  // Generate sample hierarchical data for demo
  const generateSampleData = () => {
    return [
      { id: 1, city: 'Addis Ababa', sub_city: 'Bole', woreda: 'Woreda 3', location_name: 'Bole Airport', status: 'available', price_per_hour: 50, total_spaces: 30, available_spots: 15 },
      ];
  };
  
  // Handle search for available parking spots
  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!selectedLocation) {
      setError('Please select a specific location');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Use the first API endpoint to find parking areas by location
      const parkingAreasResponse = await axios.post('http://localhost:8000/api/parking-slots/area/car-owner', {
        city: selectedCity,
        sub_city: selectedSubCity,
        woreda: selectedWoreda,
        location_name: selectedLocation
      });
      
      if (parkingAreasResponse.data && parkingAreasResponse.data.parking_slots) {
        const parkingAreas = parkingAreasResponse.data.parking_slots;
        const availableParkingAreas = [];
        const unavailableParkingAreas = [];
        
        // Sort parking areas into available and unavailable
        parkingAreas.forEach(area => {
          if (area.status === 'available') {
            availableParkingAreas.push(area);
          } else {
            unavailableParkingAreas.push(area);
          }
        });
        
        // If we have available parking areas, get slots for each one
        if (availableParkingAreas.length > 0) {
          const allSlots = [];
          
          // For each available parking area, get its slots
          for (const area of availableParkingAreas) {
            try {
              // Use the second API endpoint to get slots by parking slot ID
              const slotsResponse = await axios.post('http://localhost:8000/api/slots/parking-slot-id', {
                parking_slot_id: area.id
              });
              
              if (slotsResponse.data) {
                // Use the new response format with counts
                const { free, occupied, total, slots } = slotsResponse.data;
                
                // Add to our results
                allSlots.push({
                  id: area.id,
                  name: area.location_name,
                  address: `${area.woreda}, ${area.sub_city}, ${area.city}`,
                  freeSpots: free,
                  occupiedSpots: occupied,
                  totalSpaces: total,
                  status: area.status,
                  distance: 'Nearby', // Would need geolocation to calculate actual distance
                  parkingAreaId: area.id,
                  slotDetails: slots
                });
              }
            } catch (slotError) {
              console.error('Error fetching slots for parking area:', slotError);
              
              // If we can't get slots, still show the area with unknown availability
              allSlots.push({
                id: area.id,
                name: area.location_name,
                address: `${area.woreda}, ${area.sub_city}, ${area.city}`,
                freeSpots: 'Unknown',
                occupiedSpots: 'Unknown',
                totalSpaces: 'Unknown',
                status: area.status,
                distance: 'Nearby',
                parkingAreaId: area.id
              });
            }
          }
          
          // Add unavailable parking areas with closed status
          const closedAreas = unavailableParkingAreas.map(area => ({
            id: area.id,
            name: area.location_name,
            address: `${area.woreda}, ${area.sub_city}, ${area.city}`,
            freeSpots: 0,
            occupiedSpots: 0,
            totalSpaces: 'N/A',
            status: 'closed',
            distance: 'Nearby',
            parkingAreaId: area.id
          }));
          
          // Combine and set results
          setSearchResults([...allSlots, ...closedAreas]);
        } else if (unavailableParkingAreas.length > 0) {
          // If we only have unavailable parking areas
          const closedAreas = unavailableParkingAreas.map(area => ({
            id: area.id,
            name: area.location_name,
            address: `${area.woreda}, ${area.sub_city}, ${area.city}`,
            freeSpots: 0,
            occupiedSpots: 0,
            totalSpaces: 'N/A',
            status: 'closed',
            distance: 'Nearby',
            parkingAreaId: area.id
          }));
          
          setSearchResults(closedAreas);
        } else {
          // No parking areas found
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching for parking areas:', error);
      setError('Failed to search for parking areas. Please try again.');
      
      // For demo/testing purposes, use sample data if API fails
      const sampleResults = [
        {
          id: 1,
          name: selectedLocation,
          address: `${selectedWoreda}, ${selectedSubCity}, ${selectedCity}`,
          freeSpots: 15,
          occupiedSpots: 15,
          totalSpaces: 30,
          status: 'available',
          distance: 'Nearby',
          parkingAreaId: 1,
          slotDetails: [
            { id: 1, slot_number: 'A1', status: 'free' },
            { id: 2, slot_number: 'A2', status: 'occupied' },
            // More slots would be here in real data
          ]
        },
        {
          id: 2,
          name: `${selectedLocation} Central`,
          address: `${selectedWoreda}, ${selectedSubCity}, ${selectedCity}`,
          freeSpots: 0,
          occupiedSpots: 0,
          totalSpaces: 25,
          status: 'closed',
          distance: 'Nearby',
          parkingAreaId: 2
        }
      ];
      
      setSearchResults(sampleResults);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="owner-landing-container">
      
      <main className="owner-main">
        <section className="hero-section">
          <div className="hero-content">
            <h1>Find the Perfect Parking Spot</h1>
            <p>Quickly locate available parking near your destination</p>
            
            <form onSubmit={handleSearch} className="location-form">
              <div className="location-selectors">
                {/* City Selection */}
                <div className="selector">
                  <label htmlFor="city">City</label>
                  <select 
                    id="city" 
                    value={selectedCity} 
                    onChange={(e) => setSelectedCity(e.target.value)}
                    required
                  >
                    <option value="">Select City</option>
                    {cities.map((city, index) => (
                      <option key={index} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
                
                {/* Sub-City Selection - only enabled if city is selected */}
                <div className="selector">
                  <label htmlFor="subCity">Sub-City</label>
                  <select 
                    id="subCity" 
                    value={selectedSubCity} 
                    onChange={(e) => setSelectedSubCity(e.target.value)}
                    disabled={!selectedCity}
                    required
                  >
                    <option value="">Select Sub-City</option>
                    {subCities.map((subCity, index) => (
                      <option key={index} value={subCity}>{subCity}</option>
                    ))}
                  </select>
                </div>
                
                {/* Woreda Selection - only enabled if sub-city is selected */}
                <div className="selector">
                  <label htmlFor="woreda">Woreda</label>
                  <select 
                    id="woreda" 
                    value={selectedWoreda} 
                    onChange={(e) => setSelectedWoreda(e.target.value)}
                    disabled={!selectedSubCity}
                    required
                  >
                    <option value="">Select Woreda</option>
                    {woredas.map((woreda, index) => (
                      <option key={index} value={woreda}>{woreda}</option>
                    ))}
                  </select>
                </div>
                
                {/* Specific Location Selection - only enabled if woreda is selected */}
                <div className="selector">
                  <label htmlFor="location">Location</label>
                  <select 
                    id="location" 
                    value={selectedLocation} 
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    disabled={!selectedWoreda}
                    required
                  >
                    <option value="">Select Location</option>
                    {locations.map((location, index) => (
                      <option key={index} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
                
                <button type="submit" className="search-button" disabled={loading || !selectedLocation}>
                  {loading ? 'Searching...' : 'Find Parking'}
                </button>
              </div>
              
              {error && <div className="error-message">{error}</div>}
            <button type="button" className="btn-secondary" onClick={() => setShowCancel(true)} style={{marginLeft:'10px'}}>Cancel Reservation</button>
      </form>
          </div>
        </section>
        
        {searchResults && (
          <section className="search-results">
            <h2>Available Parking in {selectedLocation}</h2>
            <p className="location-path">{selectedCity} {' > '} {selectedSubCity} {' > '} {selectedWoreda} {' > '} {selectedLocation}</p>
            
            {searchResults.length > 0 ? (
              <div className="results-list">
                {searchResults.map(spot => (
                  <div key={spot.id} className={`parking-spot-card ${spot.status === 'closed' ? 'closed' : ''}`}>
                    <div className="spot-details">
                      <h3>{spot.name}</h3>
                      <p className="address">{spot.address}</p>
                      
                      {spot.status === 'closed' ? (
                        <div className="spot-status closed">
                          <span className="status-icon">🚫</span>
                          <span className="status-text">Parking Area Closed</span>
                          <p className="status-message">This parking area is currently unavailable. Please try another location.</p>
                        </div>
                      ) : (
                        <>
                          <div className="spot-info">
                            <div className="slot-counts">
                              <div className="slot-count free">
                                <span className="count-value">{spot.freeSpots}</span>
                                <span className="count-label">Free Spots</span>
                              </div>
                              <div className="slot-count occupied">
                                <span className="count-value">{spot.occupiedSpots}</span>
                                <span className="count-label">Occupied Spots</span>
                              </div>
                              <div className="slot-count total">
                                <span className="count-value">{spot.totalSpaces}</span>
                                <span className="count-label">Total Spots</span>
                              </div>
                            </div>
                            <span className="distance">
                              <strong>{spot.distance}</strong>
                            </span>
                          </div>
                          
                          {spot.slotDetails && spot.slotDetails.length > 0 && (
                            <div className="slot-details">
                              <h4>Available Slots:</h4>
                              <div className="slot-numbers">
                                {spot.slotDetails
                                  .filter(slot => slot.status === 'free')
                                  
                                  .map(slot => (
                                    <span key={slot.id} className={`slot-number ${slot.status === 'free' ? 'free' : 'occupied'} ${selectedSlotId===slot.id ? 'selected' : ''}`} onClick={() => {setReserveSlot(slot); setShowReserve(true); setSelectedSlotId(slot.id);}} title="Reserve this slot">{slot.slot_number}</span>
                                  ))}
                                {spot.slotDetails.filter(slot => slot.status === 'free').length > 5 && (
                                  <span className="more-slots">+{spot.slotDetails.filter(slot => slot.status === 'free').length - 5} more</span>
                                )}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-results">
                <h3>No available parking spots found</h3>
                <p>Try selecting a different location or checking back later.</p>
              </div>
            )}
          </section>
        )}
        
        <section className="features-section">
          <h2>Why Use Smart Parking?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔍</div>
              <h3>Easy Search</h3>
              <p>Find parking spots near your destination with just a few clicks</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Save Money</h3>
              <p>Compare prices and find the most affordable parking options</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⏱️</div>
              <h3>Save Time</h3>
              <p>No more driving around looking for parking spots</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Easy Booking</h3>
              <p>Reserve your spot in advance and pay online</p>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="owner-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <span className="parking-icon">P</span>
            <span className="logo-text">Smart Parking</span>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Company</h4>
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact Us</Link>
              <Link to="/careers">Careers</Link>
            </div>
            
            
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Smart Parking Management System. All rights reserved.</p>
        </div>
      </footer>

      {showReserve && reserveSlot && (
        <OwnerReservationFlow slot={reserveSlot} onClose={() => { setShowReserve(false); setReserveSlot(null); handleSearch(); }}/>
      )}
      {showCancel && <OwnerCancelReservation onClose={() => setShowCancel(false)} />}

    </div>
  );
}

export default OwnerLanding;
