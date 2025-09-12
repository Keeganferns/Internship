import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import BookingReceipt from './BookingReceipt';
import { getRoomDisplayName } from '../utils/roomUtils';

// Helper to reset room status to available when booking is deleted
async function resetRoomStatus(hotelId, selectedRooms) {
  const hotelRef = doc(db, 'hotels', hotelId);
  const hotelSnap = await getDoc(hotelRef);
  if (!hotelSnap.exists()) return;
  const hotelData = hotelSnap.data();
  const rooms = hotelData.rooms.map(room => {
    if (selectedRooms.includes(room.id)) {
      return { ...room, status: 'available' };
    }
    return room;
  });
  await updateDoc(hotelRef, { rooms });
}

function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [hotelData, setHotelData] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingBooking, setEditingBooking] = useState(null);
  const [activeBookings, setActiveBookings] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const openEditModal = (booking) => {
    console.log('Opening edit modal for booking:', booking);
    try {
      const checkInDate = booking.checkIn?.toDate ? booking.checkIn.toDate() : new Date(booking.checkIn);
      const checkOutDate = booking.checkOut?.toDate ? booking.checkOut.toDate() : new Date(booking.checkOut);
      
      // Ensure we have a valid status
      const status = booking.status || 'Active';
      
      setEditingBooking({
        ...booking,
        status,
        cancelled: status === 'Cancelled',
        checkIn: checkInDate.toISOString().split('T')[0],
        checkOut: checkOutDate.toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error preparing booking data for edit:', error);
      alert('Error loading booking data. Please try again.');
    }
  };

  const handleCancelBooking = async (bookingId, hotelId, selectedRooms) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const bookingRef = doc(db, 'bookings', bookingId);
        
        // First update the local state immediately for better UX
        setBookings(bookings.map(booking => 
          booking.id === bookingId
            ? { 
                ...booking, 
                cancelled: true, 
                status: 'Cancelled', 
                updatedAt: new Date() 
              }
            : booking
        ));
        
        // Then update Firestore
        await updateDoc(bookingRef, {
          cancelled: true,
          status: 'Cancelled',
          updatedAt: new Date()
        });

        // Reset room status if needed
        if (selectedRooms?.length > 0 && hotelId) {
          await resetRoomStatus(hotelId, selectedRooms);
        }
        
        alert('Booking has been cancelled successfully.');
      } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Failed to cancel booking. Please try again.');
      }
    }
  };

  // Function to normalize date to YYYY-MM-DD format and handle different date formats
  const normalizeDate = (date) => {
    if (!date) return null;
    try {
      let d;
      if (date.toDate) {
        d = date.toDate();
      } else if (typeof date === 'string') {
        // Handle different date string formats
        if (date.includes('T')) {
          d = new Date(date);
        } else {
          // Assume YYYY-MM-DD format
          const [year, month, day] = date.split('-').map(Number);
          d = new Date(year, month - 1, day);
        }
      } else if (date instanceof Date) {
        d = new Date(date);
      } else {
        console.error('Unsupported date format:', date);
        return null;
      }
      
      if (isNaN(d.getTime())) {
        console.error('Invalid date:', date);
        return null;
      }
      
      const pad = num => num.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    } catch (e) {
      console.error('Error normalizing date:', e, 'Input date:', date);
      return null;
    }
  };

  // Function to compare dates without timezone issues
  const compareDates = (date1, date2) => {
    // Convert both dates to YYYY-MM-DD strings and compare
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    const date1Str = `${d1.getFullYear()}-${String(d1.getMonth() + 1).padStart(2, '0')}-${String(d1.getDate()).padStart(2, '0')}`;
    const date2Str = `${d2.getFullYear()}-${String(d2.getMonth() + 1).padStart(2, '0')}-${String(d2.getDate()).padStart(2, '0')}`;
    
    if (date1Str < date2Str) return -1;
    if (date1Str > date2Str) return 1;
    return 0;
  };

  // Function to calculate status based on dates and cancellation status
  const calculateStatus = (booking) => {
    // If booking is cancelled, return 'Cancelled' status
    if (booking.cancelled === true) {
      return 'Cancelled';
    }

    try {
      // Get current date in local timezone
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to start of day
      
      // Convert check-out to Date object
      let checkOutDate = new Date(booking.checkOut);
      
      // If date is a Firestore timestamp, convert it
      if (typeof booking.checkOut?.toDate === 'function') {
        checkOutDate = booking.checkOut.toDate();
      }
      
      // Normalize to start of day for comparison
      checkOutDate.setHours(0, 0, 0, 0);
      
      // If today is after check-out date, it's 'Completed'
      if (today > checkOutDate) {
        return 'Completed';
      }
      
      // Otherwise, it's 'Active'
      return 'Active';
      
    } catch (error) {
      console.error('Error calculating status for booking:', booking.id, error);
      return 'Unknown';
    }
  };

  const fetchBookings = async () => {
    try {
      const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      let activeCount = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const bookingsList = [];
      
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        
        // Convert Firestore timestamps to Date objects if needed
        const checkIn = data.checkIn?.toDate ? data.checkIn.toDate() : new Date(data.checkIn);
        const checkOut = data.checkOut?.toDate ? data.checkOut.toDate() : new Date(data.checkOut);
        
        // Ensure cancelled status is properly set
        const isCancelled = data.cancelled === true;
        
        // Calculate status based on current date and booking dates
        let status;
        if (isCancelled) {
          status = 'Cancelled';
        } else {
          const checkOutDate = new Date(checkOut);
          checkOutDate.setHours(0, 0, 0, 0);
          
          if (today > checkOutDate) {
            status = 'Completed';
          } else {
            status = 'Active';
            activeCount++;
          }
        }

        // Create the booking object with consistent status
        const booking = {
          id: doc.id,
          ...data,
          checkIn,
          checkOut,
          cancelled: isCancelled,
          status: status,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date()
        };
        
        console.log('Booking loaded:', { 
          id: booking.id, 
          status: booking.status, 
          cancelled: booking.cancelled,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut
        });
        
        bookingsList.push(booking);
      }
      
      // Update the active bookings count in the state
      setBookings(bookingsList);
      setActiveBookings(activeCount);
      
      // Fetch hotel data for all bookings
      const hotelIds = Array.from(new Set(bookingsList.map(b => b.hotelId).filter(Boolean)));
      const hotelDataObj = {};
      for (const id of hotelIds) {
        const hotelSnap = await getDoc(doc(db, 'hotels', id));
        if (hotelSnap.exists()) {
          hotelDataObj[id] = hotelSnap.data();
        }
      }
      setHotelData(hotelDataObj);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        // Find the booking to reset room status
        const booking = bookings.find(b => b.id === bookingId);
        if (booking && booking.hotelId && booking.selectedRooms) {
          await resetRoomStatus(booking.hotelId, booking.selectedRooms);
        }
        await deleteDoc(doc(db, 'bookings', bookingId));
        setBookings(bookings.filter(booking => booking.id !== bookingId));
        alert('Booking deleted successfully');
      } catch (error) {
        console.error('Error deleting booking:', error);
        alert('Error deleting booking');
      }
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingBooking) return;
    
    // Check if check-in and check-out dates are the same
    if (editingBooking.checkIn === editingBooking.checkOut) {
      alert('Check-out date must be after check-in date');
      return;
    }
    
    try {
      const bookingRef = doc(db, 'bookings', editingBooking.id);
      const updatedData = { ...editingBooking };
      
      // Remove any Firestore-specific fields that shouldn't be updated
      delete updatedData.id;
      delete updatedData.hotelId;
      
      // Handle room status if cancelling
      const originalBooking = bookings.find(b => b.id === editingBooking.id);
      if (originalBooking && !originalBooking.cancelled && updatedData.cancelled) {
        await resetRoomStatus(originalBooking.hotelId, originalBooking.selectedRooms);
      }
      
      // Determine status based on cancellation
      let newStatus;
      if (updatedData.cancelled) {
        newStatus = 'Cancelled';
      } else {
        // Only calculate status if not cancelled
        newStatus = calculateStatus({
          ...updatedData,
          checkIn: updatedData.checkIn,
          checkOut: updatedData.checkOut
        });
      }
      
      // Prepare the update with the new status
      const bookingUpdate = {
        ...updatedData,
        status: newStatus,
        cancelled: newStatus === 'Cancelled', // Ensure cancelled flag matches status
        updatedAt: new Date()
      };
      
      // Update Firestore
      await updateDoc(bookingRef, bookingUpdate);
      
      // Update local state with the new data and status
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === editingBooking.id 
            ? { 
                ...booking, 
                ...updatedData,
                status: newStatus,
                updatedAt: new Date()
              }
            : booking
        )
      );
      
      // Update active bookings count if needed
      if (originalBooking?.status !== newStatus) {
        const activeCount = bookings.reduce((count, b) => {
          return count + (b.status === 'Active' && b.id !== editingBooking.id ? 1 : 0);
        }, newStatus === 'Active' ? 1 : 0);
        setActiveBookings(activeCount);
      }
      
      setEditingBooking(null);
      alert('Booking updated successfully');
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking. Please try again.');
    }
  };

  const handleViewReceipt = async (booking) => {
    try {
      const hotelRef = doc(db, 'hotels', booking.hotelId);
      const hotelSnap = await getDoc(hotelRef);
      if (hotelSnap.exists()) {
        const hotelData = { id: hotelSnap.id, ...hotelSnap.data() };
        setSelectedBooking(booking);
        setSelectedHotel(hotelData);
        setShowReceipt(true);
      }
    } catch (error) {
      console.error('Error fetching hotel data:', error);
      alert('Error loading receipt');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.hotelName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.roomType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.applicantName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || booking.status === filterStatus;
    const matchesDate = !filterDate ||
      (booking.checkIn && new Date(booking.checkIn).toISOString().slice(0, 10) === filterDate) ||
      (booking.checkOut && new Date(booking.checkOut).toISOString().slice(0, 10) === filterDate);
    
    return matchesSearch && matchesFilter && matchesDate;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-2xl text-blue-600 font-bold">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
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
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage all bookings and reservations</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
        >
          Back to Site
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex-shrink-0 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex-shrink-0 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active Bookings</p>
              <p className="text-2xl font-bold text-gray-900">
                {activeBookings}
              </p>
            </div>
          </div>
        </div>

        {/* Cancellation Requests Stat */}
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex-shrink-0 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l2 2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Cancellation Requests</p>
              <p className="text-2xl font-bold text-gray-900">
                {bookings.filter(b => b.cancellationRequested && !b.cancelled).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-orange-600 rounded-lg flex-shrink-0 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Bookings</p>
              <p className="text-2xl font-bold text-gray-900">
                {(() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const todayStr = today.toISOString().split('T')[0];
                  
                  const todayBookings = bookings.filter(b => {
                    try {
                      // Skip cancelled bookings
                      if (b.cancelled) return false;
                      
                      // Handle Firestore timestamp or Date object
                      const bookingDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                      bookingDate.setHours(0, 0, 0, 0);
                      
                      const bookingDateStr = bookingDate.toISOString().split('T')[0];
                      const isToday = todayStr === bookingDateStr;
                      
                      if (isToday) {
                        console.log('Found today\'s booking:', {
                          id: b.id,
                          createdAt: b.createdAt,
                          bookingDate: bookingDate.toISOString(),
                          today: today.toISOString()
                        });
                      }
                      
                      return isToday;
                    } catch (e) {
                      console.error('Error processing booking date:', b.id, e);
                      return false;
                    }
                  });
                  
                  return todayBookings.length;
                })()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by hotel name, room type, guest name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="md:w-48">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Bookings</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="md:w-56">
            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guest Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 border-b border-gray-100">
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-gray-900">{booking.hotelName}</div>
                      <div className="text-sm text-gray-600">{getRoomDisplayName(booking, hotelData[booking.hotelId])}</div>
                      <div className="text-sm text-gray-500">{booking.guests} guests</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-gray-900">{booking.userName || 'Guest User'}</div>
                      <div className="text-sm text-blue-600">{booking.userEmail}</div>
                      {booking.applicantName && (
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Applicant:</span> {booking.applicantName}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        Created: {new Date(booking.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-900">
                        <span className="text-gray-500">Check-in:</span> 
                        <span className="font-medium ml-1">
                          {new Date(booking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="text-sm text-gray-900">
                        <span className="text-gray-500">Check-out:</span> 
                        <span className="font-medium ml-1">
                          {new Date(booking.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'Cancelled' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : booking.status === 'Completed' 
                            ? 'bg-gray-100 text-gray-800' 
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {booking.status || 'Active'}
                      </span>
                      {booking.cancellationRequested && !booking.cancelled && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                          Cancellation Requested
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => handleViewReceipt(booking)}
                        className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors flex items-center"
                      >
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Receipt
                      </button>
                      <button
                        onClick={() => openEditModal(booking)}
                        disabled={booking.status === 'Completed'}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center ${
                          booking.status === 'Completed'
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleCancelBooking(booking.id, booking.hotelId, booking.selectedRooms, booking.checkIn, booking.checkOut)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center ${
                          booking.cancelled || booking.status === 'Completed' 
                            ? 'text-gray-400 bg-gray-50 cursor-not-allowed' 
                            : 'text-red-600 bg-red-50 hover:bg-red-100'
                        }`}
                        disabled={booking.cancelled || booking.status === 'Completed'}
                      >
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        {booking.cancelled ? 'Cancelled' : 'Cancel'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Edit Booking</h3>
                <button 
                  onClick={() => setEditingBooking(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleSaveEdit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Guests
                    </label>
                    <input
                      type="number"
                      value={editingBooking.guests || ''}
                      onChange={(e) => setEditingBooking({...editingBooking, guests: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-in Date
                    </label>
                    <input
                      type="date"
                      value={editingBooking.checkIn}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        const today = new Date().toISOString().split('T')[0];
                        const selectedDate = e.target.value;
                        
                        if (selectedDate < today) {
                          alert('Cannot select past dates');
                          return;
                        }
                        
                        setEditingBooking(prev => ({
                          ...prev, 
                          checkIn: selectedDate,
                          // If check-out is before or same as new check-in, clear it
                          checkOut: (prev.checkOut && prev.checkOut <= selectedDate) ? '' : prev.checkOut
                        }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-out Date
                    </label>
                    <input
                      type="date"
                      value={editingBooking.checkOut}
                      min={(() => {
                        if (!editingBooking.checkIn) return new Date().toISOString().split('T')[0];
                        const nextDay = new Date(editingBooking.checkIn);
                        nextDay.setDate(nextDay.getDate() + 1);
                        return nextDay.toISOString().split('T')[0];
                      })()}
                      onChange={(e) => {
                        const today = new Date().toISOString().split('T')[0];
                        const selectedDate = e.target.value;
                        
                        // Ensure check-out is after check-in and not in the past
                        if (selectedDate < today) {
                          alert('Cannot select past dates');
                          return;
                        }
                        if (editingBooking.checkIn && selectedDate <= editingBooking.checkIn) {
                          alert('Check-out date must be after check-in date');
                          return;
                        }
                        setEditingBooking({...editingBooking, checkOut: selectedDate});
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={editingBooking.status || 'Active'}
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        setEditingBooking({
                          ...editingBooking, 
                          status: newStatus,
                          cancelled: newStatus === 'Cancelled'
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingBooking(null)}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard; 