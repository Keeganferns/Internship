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

  const fetchBookings = async () => {
    try {
      const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const bookingsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      setBookings(bookingsList);
      
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

  const handleEdit = async (bookingId, updatedData) => {
    try {
      // If booking is being cancelled, reset room status
      const booking = bookings.find(b => b.id === bookingId);
      if (booking && !booking.cancelled && updatedData.cancelled) {
        await resetRoomStatus(booking.hotelId, booking.selectedRooms);
      }
      await updateDoc(doc(db, 'bookings', bookingId), updatedData);
      setBookings(bookings.map(booking => 
        booking.id === bookingId 
          ? { ...booking, ...updatedData }
          : booking
      ));
      setEditingBooking(null);
      alert('Booking updated successfully');
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Error updating booking');
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Bookings</p>
              <p className="text-2xl font-bold text-gray-900">
                {bookings.filter(b => !b.cancelled).length}
              </p>
            </div>
          </div>
        </div>

        {/* Cancellation Requests Stat */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l2 2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cancellation Requests</p>
              <p className="text-2xl font-bold text-gray-900">
                {bookings.filter(b => b.cancellationRequested && !b.cancelled).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Bookings</p>
              <p className="text-2xl font-bold text-gray-900">
                {bookings.filter(b => {
                  const today = new Date();
                  const bookingDate = b.createdAt;
                  return bookingDate.toDateString() === today.toDateString();
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
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
              <option value="active">Active</option>
              <option value="cancelled">Cancelled</option>
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
              <tr>
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
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{booking.hotelName}</div>
                      <div className="text-sm text-gray-500">{getRoomDisplayName(booking, hotelData[booking.hotelId])}</div>
                      <div className="text-sm text-gray-500">{booking.guests} guests</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {booking.applicantName && (
                      <div className="text-sm font-bold text-blue-700">Applicant: {booking.applicantName}</div>
                    )}
                    <div className="text-sm font-medium text-gray-900">{booking.userName || 'Guest User'}</div>
                    <div className="text-sm text-gray-600">{booking.userEmail}</div>
                    <div className="text-sm text-gray-500">
                      Created: {booking.createdAt.toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      Check-in: {new Date(booking.checkIn).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      Check-out: {new Date(booking.checkOut).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      booking.cancelled 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {booking.cancelled ? 'Cancelled' : 'Active'}
                    </span>
                    {booking.cancellationRequested && !booking.cancelled && (
                      <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300 animate-pulse">
                        Cancellation Requested
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2 items-center">
                      <button
                        onClick={() => handleViewReceipt(booking)}
                        className="text-green-600 hover:text-green-900 text-sm font-medium"
                      >
                        Receipt
                      </button>
                      <button
                        onClick={() => setEditingBooking(booking)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(booking.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Delete
                      </button>
                      {/* Approve/Decline for cancellation requests */}
                      {booking.cancellationRequested && !booking.cancelled && (
                        <>
                          <label className="flex items-center gap-1 text-xs font-medium text-green-700 cursor-pointer">
                            <input
                              type="checkbox"
                              onChange={async () => {
                                await handleEdit(booking.id, { cancelled: true, cancellationRequested: false });
                              }}
                            /> Approve
                          </label>
                          <label className="flex items-center gap-1 text-xs font-medium text-red-700 cursor-pointer">
                            <input
                              type="checkbox"
                              onChange={async () => {
                                await handleEdit(booking.id, { cancellationRequested: false });
                              }}
                            /> Decline
                          </label>
                        </>
                      )}
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
              <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Booking</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleEdit(editingBooking.id, {
                  roomType: formData.get('roomType'),
                  guests: parseInt(formData.get('guests')),
                  checkIn: formData.get('checkIn'),
                  checkOut: formData.get('checkOut'),
                  cancelled: formData.get('cancelled') === 'true'
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Room Type
                    </label>
                    <input
                      type="text"
                      name="roomType"
                      defaultValue={editingBooking.roomType}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Guests
                    </label>
                    <input
                      type="number"
                      name="guests"
                      defaultValue={editingBooking.guests}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-in Date
                    </label>
                    <input
                      type="date"
                      name="checkIn"
                      defaultValue={editingBooking.checkIn}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-out Date
                    </label>
                    <input
                      type="date"
                      name="checkOut"
                      defaultValue={editingBooking.checkOut}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="cancelled"
                      defaultValue={editingBooking.cancelled ? 'true' : 'false'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="false">Active</option>
                      <option value="true">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingBooking(null)}
                    className="flex-1 bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
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