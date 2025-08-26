import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoomDetailedList from './RoomDetailedList';

function RoomDetailedListDemo() {
  const navigate = useNavigate();
  
  // Sample room data - simplified to just have the right counts
  const sampleRooms = Array(14).fill().map((_, i) => ({
    id: `room-${i+1}`,
    status: 'available',
    price: 1000
  }));
  
  // Sample dorm data - simplified to just have the right counts
  const sampleDorms = Array(6).fill().map((_, i) => ({
    id: `dorm-${i+1}`,
    status: 'available',
    price: 2000
  }));

  const [notification, setNotification] = useState('');

  const handleBookNow = (selectedType) => {
    const typeInfo = {
      room: { price: 1000, available: sampleRooms.length },
      dorm: { price: 2000, available: sampleDorms.length }
    }[selectedType];

    setNotification(`Selected ${selectedType} - Price: ₹${typeInfo.price}, Available: ${typeInfo.available}`);
    // Here you would typically navigate to booking page or show booking modal
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
      </div>
      
      {notification && (
        <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-lg">
          {notification}
        </div>
      )}

      <RoomDetailedList 
        rooms={sampleRooms} 
        dorms={sampleDorms} 
        onBookNow={handleBookNow}
      />
    </div>
  );
}

export default RoomDetailedListDemo;