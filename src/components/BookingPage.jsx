import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { FaMapMarkerAlt, FaPhoneAlt, FaBed, FaCheckCircle, FaArrowLeft } from 'react-icons/fa';
import BookingForm from './BookingForm';

function BookingPage({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.email === 'admin@govstay.goa.gov.in';
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectedPricingOption, setSelectedPricingOption] = useState(null);
  // Date range to compute availability
  const today = new Date();
  const toLocalISODate = (d) => {
    const t = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return t.toISOString().split('T')[0];
  };
  const [checkInDate, setCheckInDate] = useState(toLocalISODate(today));
  const [checkOutDate, setCheckOutDate] = useState(toLocalISODate(new Date(today.getTime() + 24*60*60*1000)));
  const [bookings, setBookings] = useState([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState(null);
  const parseLocalDate = (s) => {
    if (!s) return new Date('Invalid');
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };

  useEffect(() => {
    async function fetchHotel() {
      try {
        const docRef = doc(db, 'hotels', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setHotel({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log('Hotel not found in database');
        }
      } catch (error) {
        console.error('Error fetching hotel:', error);
      }
      setLoading(false);
    }
    fetchHotel();
  }, [id]);

  // Fetch bookings for this hotel (admins only)
  const fetchBookings = async () => {
    if (!id) return;
    if (!isAdmin) {
      // Regular users do not fetch bookings; no red states
      setBookings([]);
      return;
    }
    try {
      const q = query(collection(db, 'bookings'), where('hotelId', '==', id));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setBookings(data);
    } catch (e) {
      console.error('Error fetching bookings (admin):', e);
    }
  };

  // Re-fetch on date range changes
  useEffect(() => {
    fetchBookings();
  }, [id, checkInDate, checkOutDate, isAdmin]);

  const isValidDateRange = useMemo(() => {
    const inDate = parseLocalDate(checkInDate);
    const outDate = parseLocalDate(checkOutDate);
    return !isNaN(inDate) && !isNaN(outDate) && outDate > inDate;
  }, [checkInDate, checkOutDate]);

  // Auto-open booking form if redirected from login
  useEffect(() => {
    if (location.state) {
      // Preselect rooms if passed from RoomDetailsPage
      if (Array.isArray(location.state.selectedRooms) && location.state.selectedRooms.length > 0) {
        setSelectedRooms(location.state.selectedRooms);
      }
      // Open booking form if requested
      if (location.state.openBooking) {
        setShowBookingForm(true);
      }
      // Seed dates if passed in navigation state
      if (location.state.checkInDate) setCheckInDate(location.state.checkInDate);
      if (location.state.checkOutDate) setCheckOutDate(location.state.checkOutDate);
      // Capture pricing option (e.g., Room with Breakfast)
      if (location.state.pricingOption) setSelectedPricingOption(location.state.pricingOption);
    }
  }, [location.state]);

  const handleRoomSelect = (roomId) => {
    setSelectedRooms(prev => {
      if (prev.includes(roomId)) {
        return prev.filter(id => id !== roomId);
      } else {
        return [...prev, roomId];
      }
    });
  };

  const getRoomsByFloor = (floor) => {
    if (!hotel || !hotel.rooms) return [];
    return hotel.rooms.filter(room => room.floor === floor);
  };

  // Compute overlapping bookings for selected date range
  const occupiedRoomIds = useMemo(() => {
    const inDate = parseLocalDate(checkInDate);
    const outDate = parseLocalDate(checkOutDate);
    // Overlap if booking.checkIn < out && booking.checkOut > in
    const overlaps = (b) => {
      try {
        const bIn = parseLocalDate(b.checkIn);
        const bOut = parseLocalDate(b.checkOut);
        return bIn < outDate && bOut > inDate;
      } catch {
        return false;
      }
    };
    const set = new Set();
    bookings.filter(overlaps).forEach(b => {
      (b.selectedRooms || []).forEach(rid => set.add(rid));
    });
    return set;
  }, [bookings, checkInDate, checkOutDate]);

  const getAvailableRooms = (floor) => {
    return getRoomsByFloor(floor).filter(room => !occupiedRoomIds.has(room.id));
  };

  const getOccupiedRooms = (floor) => {
    // Occupied if room-id is in derived occupied set
    return getRoomsByFloor(floor).filter(room => occupiedRoomIds.has(room.id));
  };

  const getRoomTypeCount = (floor, type) => {
    return getRoomsByFloor(floor).filter(room => room.type === type).length;
  };

  const getAvailableRoomTypeCount = (floor, type) => {
    return getAvailableRooms(floor).filter(room => room.type === type).length;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-2xl text-blue-600 font-bold">Loading hotel details...</div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-2xl text-red-600 font-bold">Hotel not found.</div>
      </div>
    );
  }

  const currentFloorRooms = getRoomsByFloor(selectedFloor);
  const availableRooms = getAvailableRooms(selectedFloor);
  const occupiedRooms = getOccupiedRooms(selectedFloor);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* In-page Title Bar */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <FaArrowLeft />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{hotel.name}</h1>
            <p className="text-gray-600 flex items-center gap-1">
              <FaMapMarkerAlt className="text-sm" />
              {hotel.location}
            </p>
          </div>
        </div>

      </div>
      {/* Main Booking UI */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Date and Floor Selection */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Dates and Floor</h2>
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Check-in</label>
              <input type="date" className="border rounded px-3 py-2"
                value={checkInDate}
                min={toLocalISODate(new Date())}
                onChange={e => setCheckInDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Check-out</label>
              <input type="date" className="border rounded px-3 py-2"
                value={checkOutDate}
                min={checkInDate}
                onChange={e => setCheckOutDate(e.target.value)} />
            </div>
            <div className="flex gap-2">
              {[1, 2].map(floor => (
                <button
                  key={floor}
                  onClick={() => setSelectedFloor(floor)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    selectedFloor === floor
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Floor {floor}
                </button>
              ))}
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={async () => {
                  setCheckingAvailability(true);
                  await fetchBookings();
                  setCheckingAvailability(false);
                  setLastCheckedAt(new Date());
                }}
                disabled={!isValidDateRange || checkingAvailability}
                className={`px-5 py-3 rounded-lg font-semibold transition-colors ${
                  (!isValidDateRange || checkingAvailability)
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {checkingAvailability ? 'Checking…' : 'Check availability'}
              </button>
              {lastCheckedAt && (
                <span className="text-xs text-gray-500">Last checked {lastCheckedAt.toLocaleTimeString()}</span>
              )}
            </div>
          </div>
          {!isValidDateRange && (
            <div className="mt-3 text-sm text-red-600">Please select a valid date range.</div>
          )}
        </div>
        {/* Availability Legend */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Room Availability</h2>
          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm font-medium">Available ({availableRooms.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm font-medium">Occupied ({occupiedRooms.length})</span>
            </div>
            <div className="text-sm text-gray-600">
              Total: {currentFloorRooms.length} rooms
            </div>
          </div>
          {/* Room Type Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">Rooms</h3>
              <p className="text-2xl font-bold text-blue-600">
                {getAvailableRoomTypeCount(selectedFloor, 'Room')}
              </p>
              <p className="text-sm text-blue-600">
                Available of {getRoomTypeCount(selectedFloor, 'Room')} total
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">Dorms</h3>
              <p className="text-2xl font-bold text-green-600">
                {getAvailableRoomTypeCount(selectedFloor, 'Dorm')}
              </p>
              <p className="text-sm text-green-600">
                Available of {getRoomTypeCount(selectedFloor, 'Dorm')} total
              </p>
            </div>
          </div>
        </div>
        {/* Room Grid */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Floor {selectedFloor} - Select Your Rooms</h2>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
            {currentFloorRooms.map(room => (
              <button
                key={room.id}
                onClick={() => {
                  // Navigate to room details in the same tab
                  const roomDetailsUrl = `/hotel/${id}/room/${room.id}`;
                  navigate(roomDetailsUrl, { state: { checkInDate, checkOutDate } });
                }}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  occupiedRoomIds.has(room.id)
                    ? 'bg-red-100 border-red-300 hover:bg-red-200'
                    : selectedRooms.includes(room.id)
                    ? 'bg-blue-100 border-blue-500 shadow-md'
                    : 'bg-green-100 border-green-300 hover:bg-green-200'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-800">{room.number}</div>
                  <div className="text-sm text-gray-600">{room.type}</div>
                  <div className="text-xs text-gray-500">₹{room.price}</div>
                  {selectedRooms.includes(room.id) && (
                    <div className="absolute top-1 right-1">
                      <FaCheckCircle className="text-blue-600 text-lg" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
        {/* Room Selection Confirmation Modal */}
        {showBookingForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Complete Your Booking</h2>
                  <button
                    onClick={() => setShowBookingForm(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Selected Rooms</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedRooms.map(roomId => {
                        const room = currentFloorRooms.find(r => r.id === roomId);
                        return (
                          <span key={roomId} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                            {room?.number} ({room?.type})
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      Please complete your booking details in the form below.
                    </p>
                    <button
                      onClick={() => {
                        setShowBookingForm(false);
                        setShowFormModal(true);
                      }}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Continue to Booking Form
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Booking Form Popup Modal */}
        {showFormModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto">
              <BookingForm 
                hotel={hotel}
                onClose={() => setShowFormModal(false)}
                user={user}
                onBookingComplete={async () => {
                  await fetchBookings();
                  setSelectedRooms([]);
                }}
                defaultCheckIn={checkInDate}
                defaultCheckOut={checkOutDate}
                selectedRooms={selectedRooms}
                pricingOption={selectedPricingOption}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingPage;
