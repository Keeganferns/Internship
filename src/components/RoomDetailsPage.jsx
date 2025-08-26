import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { FaArrowLeft, FaCheckCircle, FaRuler, FaBed, FaUsers, FaWifi, FaSnowflake, FaBroom, FaBath, FaTint } from 'react-icons/fa';

const getRoomImages = (room, hotel) => {
  // Try to find images specific to this room, else fallback to hotel images
  return room.images && room.images.length > 0 ? room.images : hotel.images || [];
};

const getPricingOptions = (room) => [
  {
    label: 'Room Only',
    price: room.price,
    taxes: Math.round(room.price * 0.18),
    offer: 'No meals included. Non-Refundable.',
    special: 'Longstay benefits Complimentary One-way Airport Transfer, Complimentary Hi-Tea +more',
  },
  {
    label: 'Room with Breakfast',
    price: room.price + 400,
    taxes: Math.round((room.price + 400) * 0.18),
    offer: 'Breakfast included. Non-Refundable.',
    special: 'Longstay benefits Complimentary One-way Airport Transfer, Complimentary Hi-Tea +more',
  },
];

export default function RoomDetailsPage({ user }) {
  const { id: hotelId, roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [bookings, setBookings] = useState([]);

  // Dates passed from BookingPage; may be undefined if opened directly
  const passedCheckIn = location.state?.checkInDate || '';
  const passedCheckOut = location.state?.checkOutDate || '';

  const toLocalISODate = (d) => {
    const t = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return t.toISOString().split('T')[0];
  };
  const parseLocalDate = (s) => {
    if (!s) return new Date('Invalid');
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch hotel data
        const hotelRef = doc(db, 'hotels', hotelId);
        const hotelSnap = await getDoc(hotelRef);
        
        if (hotelSnap.exists()) {
          const hotelData = { id: hotelSnap.id, ...hotelSnap.data() };
          setHotel(hotelData);
          
          // Find the specific room
          const foundRoom = hotelData.rooms.find(r => r.id === roomId);
          if (foundRoom) {
            setRoom(foundRoom);
          } else {
            console.error('Room not found');
          }
          // Fetch bookings for this hotel for occupancy checks
          try {
            const q = query(collection(db, 'bookings'), where('hotelId', '==', hotelId));
            const snap = await getDocs(q);
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            setBookings(data);
          } catch (e) {
            console.error('Error fetching bookings:', e);
          }
        } else {
          console.error('Hotel not found');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    }
    
    fetchData();
  }, [hotelId, roomId]);

  // Determine if occupied for the passed dates
  const isOccupiedForPassedDates = useMemo(() => {
    const inDate = parseLocalDate(passedCheckIn);
    const outDate = parseLocalDate(passedCheckOut);
    if (isNaN(inDate) || isNaN(outDate) || !room) return false; // no dates passed => allow booking
    const overlaps = (b) => {
      try {
        const bIn = parseLocalDate(b.checkIn);
        const bOut = parseLocalDate(b.checkOut);
        const involvesThisRoom = (b.selectedRooms || []).includes(room.id);
        return involvesThisRoom && bIn < outDate && bOut > inDate;
      } catch {
        return false;
      }
    };
    return bookings.some(overlaps);
  }, [bookings, passedCheckIn, passedCheckOut, room]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-2xl text-blue-600 font-bold">Loading room details...</div>
        </div>
      </div>
    );
  }

  if (!hotel || !room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏨</div>
          <div className="text-2xl text-red-600 font-bold">Room not found.</div>
        </div>
      </div>
    );
  }

  const images = getRoomImages(room, hotel);
  const pricingOptions = getPricingOptions(room);

  const handleBookOption = (option) => {
    // Navigate to booking page with room pre-selected
    navigate(`/hotel/${hotelId}/book`, {
      state: {
        selectedRooms: [room.id],
        openBooking: true,
        // keep the same dates when coming back
        checkInDate: passedCheckIn,
        checkOutDate: passedCheckOut,
        pricingOption: {
          label: option.label,
          price: option.price,
          taxes: option.taxes,
        },
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(`/hotel/${hotelId}/book`)}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors bg-white/60 hover:bg-white/80 px-4 py-2 rounded-lg border border-gray-200 hover:border-blue-300 shadow-sm"
          >
            <FaArrowLeft />
            Back to Booking
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Room Header Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {room.type} {room.number ? `- ${room.number}` : ''}
            </h1>
            <div className="text-2xl text-blue-600 font-semibold mb-2">{hotel.name}</div>
            <div className="text-gray-600">Floor {room.floor} • {room.type}</div>
          </div>
          
          {/* Room Specifications Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-100">
              <FaRuler className="text-blue-500 text-2xl mx-auto mb-2" />
              <div className="text-sm text-gray-600">Size</div>
              <div className="text-lg font-bold text-blue-700">
                {room.size || 'Standard'} {room.dimensions ? `(${room.dimensions})` : ''}
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl border border-green-100">
              <FaBed className="text-green-500 text-2xl mx-auto mb-2" />
              <div className="text-sm text-gray-600">Bed Type</div>
              <div className="text-lg font-bold text-green-700">
                {room.bed || 'Queen Bed'}
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-100">
              <FaUsers className="text-purple-500 text-2xl mx-auto mb-2" />
              <div className="text-sm text-gray-600">Capacity</div>
              <div className="text-lg font-bold text-purple-700">
                {room.capacity || '2 Adults'}
              </div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-100">
              <div className="text-orange-500 text-2xl mx-auto mb-2">₹</div>
              <div className="text-sm text-gray-600">Price</div>
              <div className="text-lg font-bold text-orange-700">
                ₹{room.price}/night
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Images Gallery */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Room Gallery</h2>
                <div className="space-y-4">
                  {images.length > 0 && (
                    <img
                      src={images[0]}
                      alt={`${room.type} ${room.number} image`}
                      className="w-full h-80 object-cover rounded-xl shadow-lg cursor-pointer"
                      onClick={() => { setViewerIndex(0); setViewerOpen(true); }}
                    />
                  )}
                  {images.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {images.slice(1).map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt={`${room.type} ${room.number} gallery ${i + 2}`}
                          className="w-24 h-20 object-cover rounded-lg border-2 border-gray-200 flex-shrink-0 hover:border-blue-400 transition-colors cursor-pointer"
                          onClick={() => { setViewerIndex(i + 1); setViewerOpen(true); }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Amenities Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                  <FaWifi className="text-green-500 text-xl" />
                  <span className="text-gray-700 font-medium">Free Wi-Fi</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <FaSnowflake className="text-blue-500 text-xl" />
                  <span className="text-gray-700 font-medium">Air Conditioning</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <FaBroom className="text-purple-500 text-xl" />
                  <span className="text-gray-700 font-medium">Housekeeping</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <FaBath className="text-orange-500 text-xl" />
                  <span className="text-gray-700 font-medium">Private Bathroom</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg border border-pink-100">
                  <FaTint className="text-pink-500 text-xl" />
                  <span className="text-gray-700 font-medium">Mineral Water</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                  <FaCheckCircle className="text-indigo-500 text-xl" />
                  <span className="text-gray-700 font-medium">24/7 Support</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Pricing Options */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Booking Options</h2>
              <div className="space-y-4">
                {pricingOptions.map((option, idx) => (
                  <div key={idx} className="border-2 border-gray-100 rounded-xl p-6 hover:border-blue-200 transition-all hover:shadow-lg">
                    <div className="flex flex-col gap-4">
                      <div className="flex-1">
                        <div className="text-xl font-bold text-gray-800 mb-3">{option.label}</div>
                        <div className="text-blue-700 font-bold text-4xl mb-2">₹{option.price}</div>
                        <div className="text-gray-600 text-sm mb-3">+₹{option.taxes} Taxes & Fees per night</div>
                        <div className="text-green-700 text-sm mb-3 bg-green-50 p-3 rounded-lg border border-green-100">
                          {option.special}
                        </div>
                      </div>
                      <button
                        disabled={isOccupiedForPassedDates}
                        className={`w-full px-8 py-4 text-white font-bold rounded-xl shadow-lg text-lg transition-all ${
                          isOccupiedForPassedDates
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transform hover:scale-105'
                        }`}
                        onClick={() => handleBookOption(option)}
                      >
                        {isOccupiedForPassedDates ? 'Unavailable for selected dates' : 'Book Now'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Info Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl p-6 border border-blue-100">
              <h3 className="text-xl font-bold text-blue-800 mb-4">Room Highlights</h3>
              <div className="space-y-3 text-blue-700">
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-blue-500" />
                  <span>Spacious and comfortable accommodation</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-blue-500" />
                  <span>Modern amenities and facilities</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-blue-500" />
                  <span>Prime location with easy access</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-blue-500" />
                  <span>Professional housekeeping service</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Image Lightbox */}
      {viewerOpen && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
          onClick={() => setViewerOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl"
            aria-label="Close"
            onClick={(e) => { e.stopPropagation(); setViewerOpen(false); }}
          >
            ×
          </button>
          {/* Prev */}
          <button
            className="absolute left-4 text-white text-3xl px-3 py-2 bg-black/40 rounded"
            onClick={(e) => { e.stopPropagation(); setViewerIndex((viewerIndex - 1 + images.length) % images.length); }}
            aria-label="Previous image"
          >
            ‹
          </button>
          {/* Image */}
          <img
            src={images[viewerIndex]}
            alt={`Gallery image ${viewerIndex + 1}`}
            className="max-h-[85vh] max-w-[90vw] object-contain rounded shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          {/* Next */}
          <button
            className="absolute right-4 text-white text-3xl px-3 py-2 bg-black/40 rounded"
            onClick={(e) => { e.stopPropagation(); setViewerIndex((viewerIndex + 1) % images.length); }}
            aria-label="Next image"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
