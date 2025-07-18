import { useState } from 'react'
import { carService } from '../../services/api'
import './UpdateCar.css'

function UpdateCar() {
  const [formData, setFormData] = useState({
    plate_number: '',
    make: '',
    model: '',
    color: ''
  })
  
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('search') // 'search' or 'update'
  const [carFound, setCarFound] = useState(null)
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }
  
  const handleSearch = async (e) => {
    e.preventDefault()
    
    if (!formData.plate_number.trim()) {
      setError('Please enter a plate number')
      return
    }
    
    setLoading(true)
    setError('')
    setMessage('')
    
    try {
      const response = await carService.searchCar(formData.plate_number)
      setCarFound(response.data)
      // Pre-fill the form with current car data
      setFormData({
        plate_number: response.data.plate_number,
        make: response.data.make || '',
        model: response.data.model || '',
        color: response.data.color || ''
      })
      setStep('update')
    } catch (err) {
      setError(err.response?.status === 404 
        ? 'Car not found' 
        : err.response?.data?.message || 'Error searching for car')
      console.error('Search error:', err)
    } finally {
      setLoading(false)
    }
  }
  
  const handleUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')
    
    try {
      const response = await carService.updateCar(formData)
      setMessage('Car information updated successfully')
      // Update the car found data with the new information
      setCarFound(response.data.car)
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating car information')
      console.error('Update error:', err)
    } finally {
      setLoading(false)
    }
  }
  
  const resetForm = () => {
    setFormData({
      plate_number: '',
      make: '',
      model: '',
      color: ''
    })
    setCarFound(null)
    setStep('search')
    setMessage('')
    setError('')
  }
  
  return (
    <div className="update-car-container">
      <h2>Update Car Information</h2>
      
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      
      {step === 'search' ? (
        <form onSubmit={handleSearch}>
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
          
          <button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Find Car'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label htmlFor="plate_number">Plate Number</label>
            <input
              type="text"
              id="plate_number"
              name="plate_number"
              value={formData.plate_number}
              readOnly
              className="readonly-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="make">Make</label>
            <input
              type="text"
              id="make"
              name="make"
              value={formData.make}
              onChange={handleChange}
              maxLength={50}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="model">Model</label>
            <input
              type="text"
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              maxLength={50}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="color">Color</label>
            <input
              type="text"
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              maxLength={20}
            />
          </div>
          
          <div className="button-group">
            <button type="button" onClick={resetForm}>
              Search Another Car
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Car'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default UpdateCar
