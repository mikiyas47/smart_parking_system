import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import './LandingPage.css'

function LandingPage() {
  const navigate = useNavigate()
  const [hoverButton, setHoverButton] = useState(null)
  
  const handleNavigation = (path) => {
    navigate(path)
  }
  
  return (
    <div className="landing-container">
      <header className="landing-header">
        <h1>Vehicle Management System</h1>
        <p>Welcome to the unified vehicle management platform</p>
      </header>
      
      <div className="landing-buttons">
        <div 
          className={`landing-card ${hoverButton === 'users' ? 'hover' : ''}`}
          onMouseEnter={() => setHoverButton('users')}
          onMouseLeave={() => setHoverButton(null)}
          onClick={() => handleNavigation('/users')}
        >
          <div className="card-icon">👥</div>
          <h2>User Management</h2>
          <p>Create, view, and manage user accounts and access statistics</p>
          <button>Enter User Management</button>
        </div>
        
        <div 
          className={`landing-card ${hoverButton === 'parking' ? 'hover' : ''}`}
          onMouseEnter={() => setHoverButton('parking')}
          onMouseLeave={() => setHoverButton(null)}
          onClick={() => handleNavigation('/parking/available')}
        >
          <div className="card-icon">🅿️</div>
          <h2>Parking Area Management</h2>
          <p>Create, view, and manage parking slots across different locations</p>
          <button>Enter Parking Management</button>
        </div>
       
        <div 
          className={`landing-card ${hoverButton === 'car' ? 'hover' : ''}`}
          onMouseEnter={() => setHoverButton('car')}
          onMouseLeave={() => setHoverButton(null)}
          onClick={() => handleNavigation('/cars/search')}
        >
          <div className="card-icon">🚗</div>
          <h2>Car Management</h2>
          <p>Register, search, and update vehicle information in the system</p>
          <button>Enter Car Management</button>
        </div>
        
        <div 
          className={`landing-card ${hoverButton === 'slot' ? 'hover' : ''}`}
          onMouseEnter={() => setHoverButton('slot')}
          onMouseLeave={() => setHoverButton(null)}
          onClick={() => handleNavigation('/slots')}
        >
          <div className="card-icon">🎫</div>
          <h2>Slot Management</h2>
          <p>Create, view, and manage slot allocation in the system</p>
          <button>Enter Slot Management</button>
        </div>
        
        <div 
          className={`landing-card ${hoverButton === 'checkin' ? 'hover' : ''}`}
          onMouseEnter={() => setHoverButton('checkin')}
          onMouseLeave={() => setHoverButton(null)}
          onClick={() => handleNavigation('/checkins')}
        >
          <div className="card-icon">🚘</div>
          <h2>Check-In Management</h2>
          <p>Check in vehicles to available parking slots in the system</p>
          <button>Enter Check-In Management</button>
        </div>
      </div>
      
      <footer className="landing-footer">
        <p>&copy; 2025 Vehicle Management System</p>
      </footer>
    </div>
  )
}

export default LandingPage
