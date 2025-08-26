import React, { useEffect, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

function useFadeInOnScroll() {
  const ref = useRef([]);
  useEffect(() => {
    if (!window.IntersectionObserver) return; // Fallback for unsupported browsers
    const observer = new window.IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-8');
          }
        });
      },
      { threshold: 0.2 }
    );
    ref.current.forEach(el => {
      if (el) {
        el.classList.add('opacity-0', 'translate-y-8');
        observer.observe(el);
      }
    });
    return () => observer.disconnect();
  }, []);
  return ref;
}

const HotelList = React.forwardRef((props, ref) => {
  const [hotels, setHotels] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();
  const fadeRefs = useFadeInOnScroll();

  React.useEffect(() => {
    async function fetchHotels() {
      const querySnapshot = await getDocs(collection(db, 'hotels'));
      const hotelList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHotels(hotelList);
      setLoading(false);
    }
    fetchHotels();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="text-2xl text-blue-600 font-bold">Loading hotels...</div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Why Choose GovStay Section */}
      <div className="bg-gradient-to-r from-blue-50 via-pink-50 to-green-50 rounded-xl shadow-lg p-8 mb-12 border border-blue-100">
        <h2 className="text-3xl font-bold text-blue-800 mb-4 text-center font-serif tracking-wide">Why Choose GovStay?</h2>
        <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
          Experience hassle-free booking with our secure platform designed specifically for government accommodations
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Secure Booking */}
          <div className="text-center p-6 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Secure Booking</h3>
            <p className="text-gray-600 leading-relaxed">Government-verified accommodations with secure payment processing</p>
          </div>
          
          {/* Easy Booking */}
          <div className="text-center p-6 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Easy Booking</h3>
            <p className="text-gray-600 leading-relaxed">Simple calendar-based booking with instant confirmation</p>
          </div>
          
          {/* Quality Assured */}
          <div className="text-center p-6 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Quality Assured</h3>
            <p className="text-gray-600 leading-relaxed">Maintained government facilities with modern amenities</p>
          </div>
        </div>
      </div>

      

      {/* Hotel Cards Section - add ref here */}
      <h1 ref={ref} className="text-4xl font-bold text-gray-800 mb-8 text-center font-serif tracking-wide">Available Guest Houses</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
        {hotels.map((hotel, i) => {
          const lowestPrice = Math.min(...hotel.rooms.map(room => room.price));
          const rating = 4.5; // You can add rating to your hotel data
          const reviewCount = 342; // You can add review count to your hotel data
          
          return (
            <div
              key={hotel.id}
              ref={el => {
                fadeRefs.current[i] = el;
                if (el) {
                  el.classList.add('opacity-100', 'translate-y-0'); // Fallback: always visible
                }
              }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer transform group border-2 border-blue-100 flex flex-col h-full"
              onClick={() => navigate(`/hotel/${hotel.id}`)}
            >
                              {/* Image Section */}
                <div className="relative">
                  <img
                    src={hotel.images[0]}
                    alt={hotel.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

              {/* Content Section */}
              <div className="p-6 flex flex-col flex-1 justify-between">
                {/* Hotel Name and Location */}
                <h2 className="text-xl font-bold text-blue-600 mb-1 font-serif">{hotel.name}</h2>
                <p className="text-gray-500 text-sm mb-3">{hotel.location}</p>
                
                {/* Price */}
                <p className="text-lg mb-3">
                  <span className="text-gray-600">From </span>
                  <span className="text-blue-600 font-bold">₹{lowestPrice}</span>
                  <span className="text-gray-600"> per night</span>
                </p>

                {/* Description */}
                <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                  {hotel.description}
                </p>

                {/* Amenities */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>WiFi</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Parking</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>Restaurant</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>AC</span>
                  </div>
                  <span className="text-gray-400">+2 more</span>
                </div>

                {/* Room Types */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {hotel.rooms.slice(0, 3).map((room, index) => (
                    <div
                      key={index}
                      className={`px-3 py-1 rounded text-sm font-medium ${
                        index === 0 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {room.type} - ₹{room.price}
                    </div>
                  ))}
                </div>

                {/* Check-in/Check-out Times */}
                <div className="text-gray-500 text-sm mb-4">
                  Check-in: 2:00 PM • Check-out: 11:00 AM
                </div>

                {/* Book Now Button */}
                <div className="mt-auto">
                  <button
                    className="w-full bg-gradient-to-r from-blue-600 to-pink-500 text-white font-semibold py-3 px-4 rounded-full shadow-lg hover:from-pink-500 hover:to-blue-600 transition-colors"
                    onClick={e => { e.stopPropagation(); navigate(`/hotel/${hotel.id}`); }}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default HotelList; 