import React from 'react';
import { useNavigate } from 'react-router-dom';

const statusColors = {
  available: 'bg-green-400 text-white',
  occupied: 'bg-red-400 text-white',
  booked: 'bg-red-400 text-white',
  selected: 'bg-blue-400 text-white',
};

function GoaBhavanRoomSelector({ rooms = [], selected = [], onSelect, hotelId }) {
  const navigate = useNavigate();

  // Group rooms by floor from the real rooms prop
  const floors = rooms.reduce((acc, room) => {
    acc[room.floor] = acc[room.floor] || [];
    acc[room.floor].push(room);
    return acc;
  }, {});
  const [selectedFloor, setSelectedFloor] = React.useState(1);
  const floorRooms = floors[selectedFloor] || [];
  const availableCount = floorRooms.filter(r => r.status === 'available').length;
  const occupiedCount = floorRooms.filter(r => r.status === 'occupied').length;
  const totalCount = floorRooms.length;

  const handleRoomClick = (room) => {
    if (room.status !== 'available') return;
    
    // Navigate to room details in the same tab
    const roomDetailsUrl = `/hotel/${hotelId || 'bhavan'}/room/${room.id}`;
    navigate(roomDetailsUrl);
  };

  return (
    <div className="w-full">
      {/* Floor selection tabs */}
      <div className="flex border-b mb-4">
        {Object.keys(floors).map(floor => (
          <button
            key={floor}
            className={`px-8 py-3 font-semibold text-lg focus:outline-none transition-colors duration-150 ${Number(floor) === selectedFloor ? 'border-b-4 border-blue-500 text-blue-700' : 'text-gray-500'}`}
            onClick={() => setSelectedFloor(Number(floor))}
          >
            Floor {floor}
          </button>
        ))}
      </div>
      {/* Availability summary */}
      <div className="flex items-center gap-8 mb-6 text-lg">
        <span className="flex items-center"><span className="w-5 h-5 bg-green-400 rounded mr-2 inline-block"></span>Available ({availableCount})</span>
        <span className="flex items-center"><span className="w-5 h-5 bg-red-400 rounded mr-2 inline-block"></span>Occupied ({occupiedCount})</span>
        <span>Total: {totalCount} rooms</span>
      </div>
      {/* Room grid */}
      <div className="grid grid-cols-5 gap-8 p-8 bg-gray-50 rounded-xl min-h-[300px]">
        {floorRooms.map(room => {
          const isSelected = selected.includes(room.id);
          let status = isSelected ? 'selected' : (room.status || 'available');
          if (status !== 'available' && status !== 'occupied' && status !== 'selected') status = 'available';
          const colorClass = statusColors[status];
          return (
            <button
              key={room.id}
              type="button"
              className={`flex flex-col items-center justify-center w-28 h-28 rounded-xl shadow-lg text-2xl font-bold focus:outline-none transition-colors duration-150 ${colorClass} ${room.status === 'available' ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
              disabled={room.status !== 'available'}
              onClick={() => handleRoomClick(room)}
            >
              {room.number}
              <span className="text-base font-normal mt-1">{room.type === 'Dorm' ? 'Dorm' : 'Room'}</span>
            </button>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex gap-8 mt-8 text-base">
        <span className="flex items-center"><span className="w-5 h-5 bg-green-400 rounded mr-2 inline-block"></span>Available</span>
        <span className="flex items-center"><span className="w-5 h-5 bg-red-400 rounded mr-2 inline-block"></span>Occupied</span>
        <span className="flex items-center"><span className="w-5 h-5 bg-blue-400 rounded mr-2 inline-block"></span>Selected</span>
      </div>
    </div>
  );
}

export default GoaBhavanRoomSelector; 