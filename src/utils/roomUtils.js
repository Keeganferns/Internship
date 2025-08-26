// Utility function to get room display name with room number
export function getRoomDisplayName(booking, hotelData) {
  try {
    // If we have hotel data and selected rooms, try to get the room number
    if (hotelData && booking.selectedRooms && booking.selectedRooms.length > 0) {
      const selectedRoom = hotelData.rooms?.find(room => room.id === booking.selectedRooms[0]);
      if (selectedRoom && selectedRoom.number) {
        return `${selectedRoom.type} ${selectedRoom.number}`;
      }
    }
    // Fallback to just room type
    return booking.roomType || 'Room';
  } catch (error) {
    console.error('Error getting room display name:', error);
    return booking.roomType || 'Room';
  }
} 