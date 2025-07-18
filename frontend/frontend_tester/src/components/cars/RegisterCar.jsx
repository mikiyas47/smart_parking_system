import { useState } from 'react'
import { carService } from '../../services/api'
import './RegisterCar.css'

function RegisterCar() {
  const [formData, setFormData] = useState({
    plate_number: '',
    make: '',
    model: '',
    color: ''
  })
  
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')
    
    try {
      const response = await carService.registerCar(formData)
      setMessage('Car registered successfully')
      setFormData({
        plate_number: '',
        make: '',
        model: '',
        color: ''
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Error registering car')
      console.error('Registration error:', err)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="register-car-container">
      <h2>Register New Car</h2>
      
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="plate_number">Plate Number*</label>
          <input
            type="text"
            id="plate_number"
            name="plate_number"
            value={formData.plate_number}
            onChange={handleChange}
            required
            maxLength={20}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="make">Make*</label>
          <input
            type="text"
            id="make"
            name="make"
            value={formData.make}
            onChange={handleChange}
            required
            maxLength={50}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="model">Model*</label>
          <input
            type="text"
            id="model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
            maxLength={50}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="color">Color*</label>
          <input
            type="text"
            id="color"
            name="color"
            value={formData.color}
            onChange={handleChange}
            required
            maxLength={20}
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register Car'}
        </button>
      </form>
    </div>
  )
}

export default RegisterCar
