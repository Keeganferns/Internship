import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import BookingReceipt from './BookingReceipt';
import { getRoomDisplayName } from '../utils/roomUtils';

function MyBookings({ bookings }) {
  const [hotelData, setHotelData] = useState({});
  const [loadingId, setLoadingId] = useState(null);
  const [successId, setSuccessId] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);

  useEffect(() => {
    async function fetchHotels() {
      const hotelIds = Array.from(new Set(bookings.map(b => b.hotelId)));
      const data = {};
      for (const id of hotelIds) {
        if (!id) continue;
        const snap = await getDoc(doc(db, 'hotels', id));
        if (snap.exists()) data[id] = snap.data();
      }
      setHotelData(data);
    }
    if (bookings && bookings.length > 0) fetchHotels();
  }, [bookings]);

  function getAmount(booking) {
    const hotel = hotelData[booking.hotelId];
    if (!hotel) return null;
    
    // Find the actual selected room from hotel data
    const selectedRoom = hotel.rooms.find(room => room.id === booking.selectedRooms[0]);
    if (!selectedRoom) return null;
    
    // Calculate nights
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const nights = Math.max(1, Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24)));
    
    // Calculate total amount including GST (same logic as receipt)
    const subtotal = selectedRoom.price * nights * booking.selectedRooms.length;
    const gst = subtotal * 0.18; // 18% GST
    const total = subtotal + gst;
    
    return total;
  }

  const handleCancelRequest = async (bookingId) => {
    setLoadingId(bookingId);
    try {
      await updateDoc(doc(db, 'bookings', bookingId), { cancellationRequested: true });
      setSuccessId(bookingId);
      setTimeout(() => setSuccessId(null), 2000);
    } catch (e) {
      alert('Failed to request cancellation. Please try again.');
    }
    setLoadingId(null);
  };

  const handleViewReceipt = (booking) => {
    const hotel = hotelData[booking.hotelId];
    if (hotel) {
      setSelectedBooking(booking);
      setSelectedHotel(hotel);
      setShowReceipt(true);
    }
  };

  if (!bookings || bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <div className="text-2xl font-bold text-gray-800 mb-4">No bookings yet</div>
        <p className="text-gray-600 mb-6">Start exploring our guest houses and make your first booking!</p>
        <Link
          to="/"
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition text-lg"
        >
          Browse Guest Houses
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {showReceipt && selectedBooking && selectedHotel && (
        <BookingReceipt 
          booking={selectedBooking} 
          hotel={selectedHotel} 
          onClose={() => {
            setShowReceipt(false);
            setSelectedBooking(null);
            setSelectedHotel(null);
          }} 
        />
      )}
      <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">My Bookings</h1>
      <div className="grid gap-6">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-800 mb-3">{booking.hotelName}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-base">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4 21V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14h-2v-2H6v2H4zm2-4h12V7H6zm2-2v-2h2v2zm4 0v-2h2v2zm4 0v-2h2v2z"/>
                    </svg>
                    <span className="font-medium text-gray-700">{getRoomDisplayName(booking, hotelData[booking.hotelId])}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
                    </svg>
                    <span className="font-medium text-gray-700">
                      {new Date(booking.checkIn).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
                    </svg>
                    <span className="font-medium text-gray-700">
                      {new Date(booking.checkOut).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01 1l-4.7 6.3c-.3.4-.49.9-.49 1.4V20c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2z"/>
                    </svg>
                    <span className="font-medium text-gray-700">{booking.guests} Guest{booking.guests > 1 ? 's' : ''}</span>
                  </div>
                </div>
                {booking.createdAt && (
                  <div className="mt-4 text-sm text-gray-500">
                    Booked on: {booking.createdAt.toDate ? 
                      booking.createdAt.toDate().toLocaleDateString() : 
                      new Date(booking.createdAt).toLocaleDateString()}
                  </div>
                )}
                {booking.guestNames && Array.isArray(booking.guestNames) && booking.guestNames.length > 0 && (
                  <div className="mt-4">
                    <div className="font-semibold text-gray-700 mb-1">Guest List:</div>
                    <ul className="list-disc list-inside text-gray-600 text-sm">
                      {booking.guestNames.map((name, idx) => (
                        <li key={idx}>{name}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {/* Amount Section */}
                <div className="mt-4">
                  <span className="font-semibold text-gray-700">Amount:</span>{' '}
                  {getAmount(booking) !== null ? (
                    <span>₹{getAmount(booking)}</span>
                  ) : (
                    <span className="text-gray-500">(Amount info not available)</span>
                  )}
                </div>
                {/* Cancellation Button */}
                <div className="mt-4">
                  <button
                    className={`px-5 py-2 rounded-full font-semibold shadow transition-colors text-white ${booking.cancelled ? 'bg-gray-400 cursor-not-allowed' : booking.cancellationRequested ? 'bg-yellow-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
                    disabled={booking.cancelled || booking.cancellationRequested || loadingId === booking.id}
                    onClick={() => handleCancelRequest(booking.id)}
                  >
                    {booking.cancelled
                      ? 'Cancelled'
                      : booking.cancellationRequested
                        ? 'Cancellation Requested'
                        : loadingId === booking.id
                          ? 'Requesting...'
                          : 'Apply for Cancellation'}
                  </button>
                  {successId === booking.id && (
                    <span className="ml-4 text-green-600 font-semibold">Request sent!</span>
                  )}
                </div>
              </div>
              {!booking.cancelled && (
              <div className="flex flex-col items-center gap-3">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold text-sm">
                  Confirmed
                </div>
                  <button
                    onClick={() => handleViewReceipt(booking)}
                    className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition text-sm"
                  >
                    View Receipt
                  </button>
                <Link
                  to={`/hotel/${booking.hotelId}`}
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition text-sm"
                >
                  View Hotel
                </Link>
              </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyBookings; 