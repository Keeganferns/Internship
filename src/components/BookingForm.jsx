import React, { useState, useMemo, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, runTransaction } from 'firebase/firestore';
import BookingReceipt from './BookingReceipt';
import { useNavigate } from 'react-router-dom';

function BookingForm({ hotel, onClose, user, onBookingComplete, selectedRooms: preSelectedRooms = [], defaultCheckIn, defaultCheckOut, pricingOption = null }) {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState(defaultCheckIn || '');
  const [checkOut, setCheckOut] = useState(defaultCheckOut || '');
  const [guests, setGuests] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [applicantName, setApplicantName] = useState('');
  const [applicantAddress, setApplicantAddress] = useState('');
  const [guestNames, setGuestNames] = useState(['']);
  const [govtServant, setGovtServant] = useState(''); // 'yes' or 'no'
  const [purpose, setPurpose] = useState(''); // 'official' or 'private'
  const [selectedRooms, setSelectedRooms] = useState(preSelectedRooms);
  const [showReceipt, setShowReceipt] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  const toLocalISODate = (d) => {
    const t = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return t.toISOString().split('T')[0];
  };
  const today = toLocalISODate(new Date());

  // Seed from defaults only if the fields are empty (do not overwrite user's edits)
  useEffect(() => {
    if (defaultCheckIn && !checkIn) setCheckIn(defaultCheckIn);
    if (defaultCheckOut && !checkOut) setCheckOut(defaultCheckOut);
  }, [defaultCheckIn, defaultCheckOut]);

  // Get room type from the first selected room
  const roomType = useMemo(() => {
    if (selectedRooms.length > 0) {
      const selectedRoom = hotel.rooms.find(room => room.id === selectedRooms[0]);
      return selectedRoom ? selectedRoom.type : '';
    }
    return '';
  }, [selectedRooms, hotel.rooms]);

  const handleGuestsChange = (value) => {
    // Clamp value between 1 and 10
    const clamped = Math.max(1, Math.min(10, value));
    setGuests(clamped);
    // Adjust guestNames array length
    let arr = [...guestNames];
    if (clamped > arr.length) {
      arr = arr.concat(Array(clamped - arr.length).fill(''));
    } else {
      arr = arr.slice(0, clamped);
    }
    setGuestNames(arr);
  };

  const handleGuestNameChange = (idx, value) => {
    const arr = [...guestNames];
    arr[idx] = value;
    setGuestNames(arr);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Require at least one selected room
      if (!selectedRooms || selectedRooms.length === 0) {
        throw new Error('Please select at least one room before booking.');
      }
      // Validate dates are not in the past
      if (checkIn < today || checkOut < today) {
        throw new Error('Check-in and check-out dates cannot be in the past.');
      }
      if (checkOut < checkIn) {
        throw new Error('Check-out date cannot be before check-in date.');
      }
      if (!applicantName.trim()) throw new Error('Applicant name is required.');
      if (!applicantAddress.trim()) throw new Error('Applicant address is required.');
      if (!govtServant) throw new Error('Please select if you are a government servant.');
      if (!purpose) throw new Error('Please select the purpose for accommodation.');
      if (guestNames.length !== Number(guests) || guestNames.some(n => !n.trim())) {
        throw new Error('Please enter names for all guests.');
      }
      // Legacy room.status update removed: we now rely on bookings overlap to determine availability.
      // Concurrency control can be added here with a bookings-overlap transaction if needed.
      // Add booking
      const bookingRef = await addDoc(collection(db, 'bookings'), {
        userId: user.uid,
        userName: user.displayName || 'Guest User',
        userEmail: user.email,
        hotelId: hotel.id,
        hotelName: hotel.name,
        roomType,
        selectedRooms,
        checkIn,
        checkOut,
        guests: Number(guests),
        applicantName,
        applicantAddress,
        guestNames,
        govtServant,
        purpose,
        pricingOption, // carry selected pricing (e.g., Room with Breakfast)
        createdAt: serverTimestamp(),
      });
      
      // Store booking data for receipt
      setBookingData({
        id: bookingRef.id,
        userId: user.uid,
        userName: user.displayName || 'Guest User',
        userEmail: user.email,
        hotelId: hotel.id,
        hotelName: hotel.name,
        roomType,
        selectedRooms,
        checkIn,
        checkOut,
        guests: Number(guests),
        applicantName,
        applicantAddress,
        guestNames,
        govtServant,
        purpose,
        pricingOption,
        createdAt: new Date(),
      });
      
      setSuccess(true);
      
      // Show receipt immediately after successful booking
      setTimeout(() => {
        setSuccess(false);
        setShowReceipt(true);
        console.log('Showing receipt with booking data:', bookingData);
      }, 1000);
      
      // Call the callback to refresh hotel data (but don't close the modal yet)
      // We'll let the receipt handle the closing
    } catch (err) {
      setError(err.message || 'Booking failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="p-10">
      {showReceipt && bookingData && (
        <BookingReceipt 
          booking={bookingData} 
          hotel={hotel} 
          onClose={() => {
            setShowReceipt(false);
            setBookingData(null);
            if (onBookingComplete) {
              onBookingComplete();
            }
            onClose();
            // Navigate to Home after closing the receipt
            navigate('/');
          }} 
        />
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Book Your Stay</h2>
        <button
          className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      {/* Form starts directly from Applicant Name */}
      {success ? (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div className="text-2xl font-bold text-green-600 text-center">Booking Confirmed!</div>
          <p className="text-gray-600 text-center mt-2">Your reservation has been successfully created.</p>
          <div className="mt-4">
            <button
              onClick={() => setShowReceipt(true)}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Receipt
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {/* Applicant Name */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700">Applicant Name</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={applicantName}
              onChange={e => setApplicantName(e.target.value)}
              required
            />
          </div>
          {/* Applicant Address */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700">Applicant Address</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={applicantAddress}
              onChange={e => setApplicantAddress(e.target.value)}
              required
            />
          </div>

              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold mb-2 text-gray-700">Check-in</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={checkIn}
                    onChange={e => setCheckIn(e.target.value)}
                    required
                    min={today}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2 text-gray-700">Check-out</label>
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={checkOut}
                    onChange={e => setCheckOut(e.target.value)}
                    required
                    min={checkIn || today}
                  />
                </div>
              </div>
              
              <div>
                <label className="block font-semibold mb-2 text-gray-700">Number of Guests</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={guests}
                  onChange={e => handleGuestsChange(Number(e.target.value))}
                  required
                />
              </div>
              {/* Guest Names */}
              <div>
                <label className="block font-semibold mb-2 text-gray-700">Names of All Guests</label>
                <div className="space-y-2">
                  {guestNames.map((name, idx) => (
                    <input
                      key={idx}
                      type="text"
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Guest ${idx + 1} Name`}
                      value={name}
                      onChange={e => handleGuestNameChange(idx, e.target.value)}
                      required
                    />
                  ))}
                </div>
              </div>
              {/* Govt Servant */}
              <div>
                <label className="block font-semibold mb-2 text-gray-700">Are you a Government Servant?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="govtServant"
                      value="yes"
                      checked={govtServant === 'yes'}
                      onChange={() => setGovtServant('yes')}
                      required
                    />
                    Yes
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="govtServant"
                      value="no"
                      checked={govtServant === 'no'}
                      onChange={() => setGovtServant('no')}
                      required
                    />
                    No
                  </label>
                </div>
              </div>
              {/* Purpose */}
              <div>
                <label className="block font-semibold mb-2 text-gray-700">Purpose for Accommodation</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="purpose"
                      value="official"
                      checked={purpose === 'official'}
                      onChange={() => setPurpose('official')}
                      required
                    />
                    Official
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="purpose"
                      value="private"
                      checked={purpose === 'private'}
                      onChange={() => setPurpose('private')}
                      required
                    />
                    Private
                  </label>
                </div>
              </div>
              
          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Confirm Booking'}
          </button>
        </form>
      )}
    </div>
  );
}

export default BookingForm; 