import React, { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'

export default function NewBookingForm({ currentUser, onBookingSuccess }) {
  const [eventDate, setEventDate] = useState('')
  const [pincode, setPincode] = useState('')
  const [guests, setGuests] = useState('')
  const [dishes, setDishes] = useState([
    { id: 1, name: 'Flame Wok Chicken Noodles' },
    { id: 2, name: 'Hand-Pulled Veggie Ramen' },
    { id: 3, name: 'Szechuan Pepper Paneer' },
    { id: 4, name: 'Signature Teppanyaki Rice' },
  ])
  const [selectedDishes, setSelectedDishes] = useState([])

  const toggleDish = (id) => {
    setSelectedDishes(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id])
  }

  const handleBookingSubmit = async (e) => {
    e.preventDefault()
    
    // Insert booking
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id: currentUser.id,
        event_date: eventDate,
        venue_pincode: pincode,
        guest_count: parseInt(guests),
        status: 'pending_admin'
      })
      .select()

    if (bookingError) {
      alert('Error making booking: ' + bookingError.message)
      return
    }

    const bookingId = bookingData[0].id

    // Insert selected menu items
    if (selectedDishes.length > 0) {
      const menuInserts = selectedDishes.map(dishId => ({
        booking_id: bookingId,
        menu_item_id: dishId
      }))
      const { error: menuError } = await supabase.from('booking_menu_items').insert(menuInserts)
      if (menuError) {
        alert('Error saving menu items: ' + menuError.message)
      }
    }

    alert('Your booking has been requested!')
    setEventDate('')
    setPincode('')
    setGuests('')
    setSelectedDishes([])
    if (onBookingSuccess) onBookingSuccess()
  }

  return (
    <div className="dash-card">
      <h3>Request a New Event</h3>
      
      <form className="space-y-4" onSubmit={handleBookingSubmit}>
        <div>
          <label className="form-label">Event Date</label>
          <input type="date" className="form-input" required value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
        </div>
        
        <div>
          <label className="form-label">Venue Pincode</label>
          <input type="text" className="form-input" placeholder="e.g. 560001" required value={pincode} onChange={(e) => setPincode(e.target.value)} />
        </div>
        
        <div>
          <label className="form-label">Estimated Guests</label>
          <input type="number" className="form-input" min="10" required value={guests} onChange={(e) => setGuests(e.target.value)} />
        </div>
        
        <div>
          <label className="form-label">Select Dishes</label>
          <div className="menu-select-box space-y-2">
            {dishes.map((dish) => (
              <label className="checkbox-label" key={dish.id}>
                <input type="checkbox" checked={selectedDishes.includes(dish.id)} onChange={() => toggleDish(dish.id)} />
                <span>{dish.name}</span>
              </label>
            ))}
          </div>
        </div>
        
        <button type="submit" className="submit-btn">
          Submit Booking Request
        </button>
      </form>
    </div>
  )
}
