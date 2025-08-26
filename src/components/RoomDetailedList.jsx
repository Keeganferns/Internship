import React, { useState } from 'react';

function RoomDetailedList({ rooms = [], dorms = [], onBookNow }) {
  const [selectedType, setSelectedType] = useState(null);

  // Calculate availability
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(room => room.status === 'available').length;
  
  const totalDorms = dorms.length;
  const availableDorms = dorms.filter(dorm => dorm.status === 'available').length;

  const handleBookNow = () => {
    if (selectedType && onBookNow) {
      onBookNow(selectedType);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Room Availability</h2>
      
      <div className="space-y-4 mb-6">
        {/* Room Option */}
        <label 
          className={`block cursor-pointer ${selectedType === 'room' ? 'ring-2 ring-blue-500' : ''}`}
        >
          <div className="bg-white rounded-lg p-6 flex items-center justify-between border hover:border-blue-500 transition-colors">
            <div className="flex items-center gap-4">
              <input
                type="radio"
                name="roomType"
                value="room"
                checked={selectedType === 'room'}
                onChange={() => setSelectedType('room')}
                className="h-4 w-4 text-blue-600"
              />
              <div className="text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 4v16M6 4v16M2 8h4M2 12h4M2 16h4M18 4v16M22 4v16M18 8h4M18 12h4M18 16h4M6 12h12v4H6z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Room</h3>
                <p className="text-gray-600">Total: {totalRooms} Rooms</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">₹1000</p>
              <p className="text-green-600 font-medium">Available: {availableRooms}</p>
            </div>
          </div>
        </label>

        {/* Dorm Option */}
        <label 
          className={`block cursor-pointer ${selectedType === 'dorm' ? 'ring-2 ring-blue-500' : ''}`}
        >
          <div className="bg-white rounded-lg p-6 flex items-center justify-between border hover:border-blue-500 transition-colors">
            <div className="flex items-center gap-4">
              <input
                type="radio"
                name="roomType"
                value="dorm"
                checked={selectedType === 'dorm'}
                onChange={() => setSelectedType('dorm')}
                className="h-4 w-4 text-blue-600"
              />
              <div className="text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 4v16M6 4v16M2 8h4M2 12h4M2 16h4M18 4v16M22 4v16M18 8h4M18 12h4M18 16h4M6 12h12v4H6z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Dorm</h3>
                <p className="text-gray-600">Total: {totalDorms} Dorms</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">₹2000</p>
              <p className="text-green-600 font-medium">Available: {availableDorms}</p>
            </div>
          </div>
        </label>
      </div>

      {/* Book Now Button */}
      <button
        onClick={handleBookNow}
        disabled={!selectedType}
        className={`w-full py-3 rounded-full font-semibold text-white text-lg
          ${selectedType
            ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600'
            : 'bg-gray-300 cursor-not-allowed'}
        `}
      >
        Book Now
      </button>
    </div>
  );
  

}

export default RoomDetailedList;