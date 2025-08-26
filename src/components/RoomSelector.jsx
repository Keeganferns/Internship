import React from 'react';
import { useNavigate } from 'react-router-dom';

const statusColors = {
  available: 'bg-green-400 border-green-600',
  booked: 'bg-red-400 border-red-600 cursor-not-allowed',
  selected: 'bg-blue-400 border-blue-600',
};

function RoomSelector({ rooms = [], selectedType, selected = [], onSelect, hotelId }) {
  const navigate = useNavigate();

  // Filter rooms by selectedType
  const filteredRooms = rooms.filter(r => r.type === selectedType);

  // Optionally, group by floor if 'floor' property exists
  let grouped = [{ floor: null, units: filteredRooms }];
  if (filteredRooms.length > 0 && filteredRooms[0].floor) {
    const byFloor = {};
    filteredRooms.forEach(r => {
      byFloor[r.floor] = byFloor[r.floor] || [];
      byFloor[r.floor].push(r);
    });
    grouped = Object.entries(byFloor).map(([floor, units]) => ({ floor, units }));
  }

  const handleSelect = (unit) => {
    if (unit.status === 'booked') return;
    
    // Navigate to room details in the same tab
    const roomDetailsUrl = `/hotel/${hotelId || 'hotel'}/room/${unit.id}`;
    navigate(roomDetailsUrl);
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Select {selectedType}(s)</h2>
      {grouped.map((group, idx) => (
        <div key={group.floor || idx} className="mb-8">
          {group.floor && <h3 className="text-lg font-semibold mb-2">Floor {group.floor}</h3>}
          <div className="grid grid-cols-4 gap-4">
            {group.units.map((unit) => {
              const isSelected = selected.includes(unit.id);
              const status = isSelected ? 'selected' : unit.status;
              return (
                <button
                  key={unit.id}
                  className={`flex flex-col items-center justify-center border-2 rounded-lg p-4 text-sm font-medium transition-colors duration-150 focus:outline-none ${statusColors[status]}`}
                  disabled={unit.status === 'booked'}
                  onClick={() => handleSelect(unit)}
                  type="button"
                >
                  <span>{unit.label || unit.id}</span>
                  <span className="text-xs mt-1 text-gray-600">{unit.type}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {/* Legend */}
      <div className="flex items-center gap-6 mt-8">
        <div className="flex items-center gap-2">
          <span className="inline-block w-5 h-5 bg-green-400 border-2 border-green-600 rounded"></span>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-5 h-5 bg-red-400 border-2 border-red-600 rounded"></span>
          <span>Occupied</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-5 h-5 bg-blue-400 border-2 border-blue-600 rounded"></span>
          <span>Selected</span>
        </div>
      </div>
      {/* Selected summary */}
      {selected.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <strong>Selected:</strong> {selected.join(', ')}
        </div>
      )}
    </div>
  );
}

export default RoomSelector; 