import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore'; // <-- Firestore functions are imported here.
import { db } from '../firebase'; // <-- The db instance is imported here.
import BookingForm from './BookingForm';
import RoomSelector from './RoomSelector';
import { FaMapMarkerAlt, FaPhoneAlt, FaBed, FaCheckCircle } from 'react-icons/fa';

function HotelDetails({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [lightboxImg, setLightboxImg] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function fetchHotel() {
      try {
        // This is the Firestore code to get a document.
        const docRef = doc(db, 'hotels', id); // Creates a reference to the document.
        const docSnap = await getDoc(docRef); // Fetches the document data.
        if (docSnap.exists()) {
          setHotel({ id: docSnap.id, ...docSnap.data() });
        } else {
          // Hotel not found in database
          console.log('Hotel not found in database');
        }
      } catch (error) {
        console.error('Error fetching hotel:', error);
      }
      setLoading(false);
    }
    fetchHotel();
  }, [id, refreshKey]);

  // Open booking modal if redirected from login
  useEffect(() => {
    if (location.state && location.state.openBooking) {
      setShowBooking(true);
    }
  }, [location.state]);

  // Auto-refresh hotel data when booking modal is closed
  useEffect(() => {
    if (!showBooking) {
      // Refresh hotel data when booking modal is closed
      setRefreshKey(prev => prev + 1);
    }
  }, [showBooking]);

  // Auto-refresh hotel data when page becomes visible (user navigates back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Refresh hotel data when page becomes visible
        setRefreshKey(prev => prev + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

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

  const roomTypes = hotel.rooms.reduce((acc, room) => {
    if (!acc[room.type]) {
      acc[room.type] = {
        type: room.type,
        price: room.price,
        total: 0,
        available: 0,
        rooms: [],
      };
    }
    acc[room.type].total++;
    if (room.status === 'available') {
      acc[room.type].available++;
    }
    acc[room.type].rooms.push(room);
    return acc;
  }, {});

  const handleRoomTypeClick = (roomType) => {
    const firstAvailableRoom = roomType.rooms.find(r => r.status === 'available');
    if (firstAvailableRoom) {
      navigate(`/hotel/${hotel.id}/room/${firstAvailableRoom.id}/pricing`, { state: { room: firstAvailableRoom, hotel } });
    } else {
      alert(`No ${roomType.type}s are currently available.`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {showBooking && <BookingForm hotel={hotel} onClose={() => setShowBooking(false)} user={user} onBookingComplete={() => setRefreshKey(prev => prev + 1)} />}
      {lightboxImg && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" onClick={() => setLightboxImg(null)}>
          <img
            src={lightboxImg}
            alt="Enlarged hotel"
            className="max-w-4xl max-h-[80vh] rounded-xl shadow-2xl"
            onClick={e => e.stopPropagation()}
          />
          <button
            className="absolute top-8 right-8 text-4xl text-white font-bold bg-black bg-opacity-40 rounded-full w-12 h-12 flex items-center justify-center hover:bg-opacity-70 transition"
            onClick={() => setLightboxImg(null)}
          >
            ×
          </button>
        </div>
      )}
      {/* Back Button */}
      <button
        className="mb-4 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg shadow hover:bg-gray-200 transition flex items-center gap-2"
        onClick={() => navigate(-1)}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
        Back
      </button>
      {/* Main Content */}
      <div className="bg-gradient-to-br from-blue-50 via-pink-50 to-green-50 rounded-3xl shadow-2xl overflow-hidden animate-fadeInUp flex flex-col md:flex-row gap-8 p-8 border border-blue-100">
        {/* Left Column: Images and Info */}
        <div className="flex-1 p-4 flex flex-col gap-4">
          {/* Hotel Images Gallery */}
          <div className="flex gap-3 mb-4 overflow-x-auto">
            {hotel.images.map((img, i) => (
              <div key={i} className="group rounded-xl overflow-hidden cursor-pointer flex-shrink-0 border-2 border-gray-200 hover:border-blue-400 transition" onClick={() => setLightboxImg(img)}>
                <img
                  src={img}
                  alt={hotel.name + ' image ' + (i + 1)}
                  className="w-48 h-36 object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
          {/* Hotel Info */}
          <h1 className="text-3xl font-bold text-gray-800 mb-1 font-serif">{hotel.name}</h1>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.location)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-lg text-blue-600 hover:underline mb-1"
          >
            <FaMapMarkerAlt className="text-blue-500" />
            {hotel.location}
          </a>
          {hotel.phone && (
            <div className="flex items-center gap-2 text-md text-gray-700 mb-2">
              <FaPhoneAlt className="text-green-500" />
              <span className="font-semibold">Phone:</span> {hotel.phone}
            </div>
          )}
          <p className="text-gray-700 mb-3 leading-relaxed">{hotel.description}</p>
          {/* Amenities */}
          <div className="mb-2">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {hotel.amenities.map((amenity, i) => (
                <span key={i} className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium shadow hover:bg-blue-200 transition">
                  <FaCheckCircle className="text-blue-400" /> {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>
        {/* Right Column: Room Counts and Booking */}
        <div className="flex-1 p-4 bg-white rounded-2xl shadow-lg flex flex-col justify-between animate-fadeInUp2">
          <h3 className="text-xl font-bold text-gray-800 mb-4 font-serif">Room Availability</h3>
          <div className="space-y-4 mb-6">
            {Object.values(roomTypes).map((roomType) => (
              <div
                key={roomType.type}
                className="bg-gray-50 rounded-xl p-4 border border-gray-200 shadow-sm cursor-pointer hover:border-blue-400 transition"
                onClick={() => handleRoomTypeClick(roomType)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <FaBed className="text-blue-400 text-3xl flex-shrink-0" />
                    <div>
                      <h4 className="text-xl font-bold text-gray-800">{roomType.type}</h4>
                      <p className="text-sm text-gray-600">Total: {roomType.total} {roomType.type}s</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">₹{roomType.price}</div>
                    <div className={`text-sm font-semibold ${roomType.available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      Available: {roomType.available}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Book Now Button */}
          <div className="text-center mt-4">
            {user ? (
              <Link
                to={`/hotel/${hotel.id}/book`}
                className="block w-full px-6 py-3 bg-gradient-to-r from-green-600 to-blue-500 text-white font-bold rounded-full shadow-lg hover:from-blue-500 hover:to-green-600 transition text-lg animate-bounce-slow"
              >
                Book Now
              </Link>
            ) : (
              <button
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-pink-500 text-white font-bold rounded-full shadow-lg hover:from-pink-500 hover:to-blue-600 transition text-lg animate-bounce-slow"
                onClick={() => navigate('/login', { state: { from: location.pathname, openBooking: true } })}
              >
                Book Now
              </button>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.7s both;
        }
        @keyframes fadeInUp2 {
          from { opacity: 0; transform: translateY(60px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp2 {
          animation: fadeInUp2 1s both;
        }
        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}

export default HotelDetails;