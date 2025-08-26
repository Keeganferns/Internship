import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Update room images in Firestore
 * @param {string} hotelId - The hotel ID (e.g., 'niwas', 'sadan', 'bhavan')
 * @param {string} roomId - The room ID (e.g., 'Room-1', 'Dorm-1')
 * @param {Array<string>} images - Array of image URLs
 */
export const updateRoomImages = async (hotelId, roomId, images) => {
  try {
    // Get the current hotel document
    const hotelRef = doc(db, 'hotels', hotelId);
    const hotelSnap = await getDoc(hotelRef);
    
    if (!hotelSnap.exists()) {
      throw new Error(`Hotel ${hotelId} not found`);
    }
    
    const hotelData = hotelSnap.data();
    const rooms = hotelData.rooms || [];
    
    // Find the specific room and update its images
    const roomIndex = rooms.findIndex(room => room.id === roomId);
    
    if (roomIndex === -1) {
      throw new Error(`Room ${roomId} not found in hotel ${hotelId}`);
    }
    
    // Update the room with new images
    rooms[roomIndex] = {
      ...rooms[roomIndex],
      images: images
    };
    
    // Update the hotel document
    await updateDoc(hotelRef, {
      rooms: rooms,
      updatedAt: new Date()
    });
    
    console.log(`Successfully updated images for room ${roomId} in hotel ${hotelId}`);
    return true;
    
  } catch (error) {
    console.error('Error updating room images:', error);
    throw error;
  }
};

/**
 * Get room images from Firestore
 * @param {string} hotelId - The hotel ID
 * @param {string} roomId - The room ID
 * @returns {Array<string>} Array of image URLs
 */
export const getRoomImages = async (hotelId, roomId) => {
  try {
    const hotelRef = doc(db, 'hotels', hotelId);
    const hotelSnap = await getDoc(hotelRef);
    
    if (!hotelSnap.exists()) {
      throw new Error(`Hotel ${hotelId} not found`);
    }
    
    const hotelData = hotelSnap.data();
    const rooms = hotelData.rooms || [];
    
    const room = rooms.find(r => r.id === roomId);
    
    if (!room) {
      throw new Error(`Room ${roomId} not found in hotel ${hotelId}`);
    }
    
    return room.images || [];
    
  } catch (error) {
    console.error('Error getting room images:', error);
    throw error;
  }
};

/**
 * Example usage for updating room images
 * You can call this function from your admin panel or console
 */
export const exampleUpdateRoomImages = async () => {
  // Example: Update Room-1 in Goa Niwas with new images
  const hotelId = 'niwas';
  const roomId = 'Room-1';
  const newImages = [
    'https://example.com/room1-main.jpg',
    'https://example.com/room1-thumb1.jpg',
    'https://example.com/room1-thumb2.jpg'
  ];
  
  try {
    await updateRoomImages(hotelId, roomId, newImages);
    console.log('Room images updated successfully!');
  } catch (error) {
    console.error('Failed to update room images:', error);
  }
};

