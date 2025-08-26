import React, { useEffect, useState, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import HotelList from './components/HotelList';
import HotelDetails from './components/HotelDetails';
import BookingPage from './components/BookingPage';
import RoomPricing from './components/RoomPricing';
import Login, { Signup } from './components/Login';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import AdminSetup from './components/AdminSetup';
import MyBookings from './components/MyBookings';
import Footer from './components/Footer';
import { auth, db, observeUser } from './firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Info from './components/Info';
import Help from './components/Help';
import { FaHotel, FaInfoCircle, FaQuestionCircle } from 'react-icons/fa';
import StorageTest from "./components/StorageTest";
import RoomDetailsPage from './components/RoomDetailsPage';
import RoomImageManager from './components/RoomImageManager';

function App() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const hotelCardsRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingScroll, setPendingScroll] = useState(false);

  useEffect(() => {
    const unsub = observeUser(async (u) => {
      setUser(u);
      if (u) {
        // Check if user is admin
        setIsAdmin(u.email === 'admin@govstay.goa.gov.in');
        // Fetch bookings for this user (only if not admin)
        if (u.email !== 'admin@govstay.goa.gov.in') {
          const q = query(collection(db, 'bookings'), where('userId', '==', u.uid));
          const snap = await getDocs(q);
          setBookings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } else {
          setBookings([]);
        }
      } else {
        setBookings([]);
        setIsAdmin(false);
      }
    });
    return () => unsub();
  }, []);

  const handleScrollToHotels = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      setPendingScroll(true);
      navigate('/');
    } else if (hotelCardsRef.current) {
      hotelCardsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (pendingScroll && location.pathname === '/') {
      setPendingScroll(false);
      setTimeout(() => {
        if (hotelCardsRef.current) {
          hotelCardsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [pendingScroll, location.pathname]);

  const isBookingPage = /^\/hotel\/[^/]+\/book$/.test(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header - hidden on booking page */}
      {!isBookingPage && (
        <header className="w-full bg-white border-b border-gray-200 py-4 px-8 flex items-center justify-between shadow-sm">
          {/* Left: Logo and Brand */}
          <div className="flex items-center gap-3">
            <img 
              src="/government-of-goa-logo.png" 
              alt="Government of Goa Official Logo" 
              className="h-12 w-auto object-contain"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold text-blue-600">Gov</span>
                <span className="text-2xl font-bold text-gray-700">Stay</span>
              </div>
              <span className="text-sm text-gray-500">Government Guest Houses</span>
            </div>
          </div>
          {/* Center: Navigation */}
          <nav className="flex items-center gap-8 bg-gray-50 px-6 py-2 rounded-full border border-gray-200 shadow-sm">
            <a href="#hotels" onClick={handleScrollToHotels} className="flex items-center gap-2 text-gray-700 font-semibold hover:text-red-600 transition-colors cursor-pointer">
              <FaHotel className="text-lg" /> Accommodations
            </a>
            <Link to="/info" className="flex items-center gap-2 text-gray-700 font-semibold hover:text-red-600 transition-colors">
              <FaInfoCircle className="text-lg" /> Info
            </Link>
            <Link to="/help" className="flex items-center gap-2 text-gray-700 font-semibold hover:text-red-600 transition-colors">
              <FaQuestionCircle className="text-lg" /> Help
            </Link>
            {user && !isAdmin && (
              <Link to="/bookings" className="text-gray-700 font-medium hover:text-blue-600 transition-colors">My Bookings</Link>
            )}
            {isAdmin && (
              <Link to="/admin/dashboard" className="text-red-600 font-medium hover:text-red-700 transition-colors">Admin Dashboard</Link>
            )}
          </nav>
          {/* Right: Login/Sign Out */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {isAdmin && (
                  <span className="text-sm text-red-600 font-medium">Admin</span>
                )}
                <button
                  onClick={async () => { await import('./firebase').then(m => m.logout()); }}
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-full shadow hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 13v-2H7V8l-5 4 5 4v-3z"/>
                    <path d="M20 3H4c-1.1 0-2 .9-2 2v4h2V5h16v14H4v-4H2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                  </svg>
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-full shadow hover:bg-blue-700 transition flex items-center gap-2">
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                  Login
                </Link>
                <Link to="/admin/login" className="px-6 py-2 bg-red-600 text-white font-semibold rounded-full shadow hover:bg-red-700 transition flex items-center gap-2">
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                  </svg>
                  Admin
                </Link>
              </>
            )}
          </div>
        </header>
      )}
      {/* Main Content */}
      <div className="flex-1 w-full">
        <main className="w-full max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HotelList ref={hotelCardsRef} />} />
            <Route path="/hotel/:id" element={<HotelDetails user={user} />} />
            <Route path="/hotel/:id/book" element={<BookingPage user={user} />} />
            <Route path="/hotel/:id/room/:roomId" element={<RoomDetailsPage user={user} />} />
            <Route path="/hotel/:id/room/:roomId/pricing" element={<RoomPricing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={isAdmin ? <AdminDashboard /> : <Login />} />
            <Route path="/admin/images" element={isAdmin ? <RoomImageManager /> : <Login />} />
            <Route path="/admin/setup" element={<AdminSetup />} />
            <Route path="/bookings" element={<MyBookings bookings={bookings} />} />
            <Route path="/info" element={<Info />} />
            <Route path="/help" element={<Help />} />
          </Routes>
        </main>
      </div>
      {/* Footer - hidden on booking page */}
      {!isBookingPage && <Footer />}
    </div>
  );
}

export default App;