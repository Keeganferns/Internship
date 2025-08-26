import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Add images to existing rooms in Firestore
 * This script helps you add images to rooms that don't have them yet
 */

// Example room images - you can customize these
const sampleRoomImages = {
  'Room': [
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800', // Modern hotel room
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400', // Room detail
    'https://images.unsplash.com/photo-1582719478250-c89cae4cb85b?w=400'  // Bathroom
  ],
  'Dorm': [
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', // Dormitory style
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400', // Bunk beds
    'https://images.unsplash.com/photo-1582719478250-c89cae4cb85b?w=400'  // Shared space
  ]
};

/**
 * Add images to all rooms in a specific hotel
 */
export const addImagesToHotelRooms = async (hotelId) => {
  try {
    console.log(`Adding images to rooms in hotel: ${hotelId}`);
    
    // Get the hotel document
    const hotelRef = doc(db, 'hotels', hotelId);
    const hotelSnap = await getDoc(hotelRef);
    
    if (!hotelSnap.exists()) {
      throw new Error(`Hotel ${hotelId} not found`);
    }
    
    const hotelData = hotelSnap.data();
    const rooms = hotelData.rooms || [];
    
    if (rooms.length === 0) {
      console.log(`No rooms found in hotel ${hotelId}`);
      return;
    }
    
    // Update each room with images based on its type
    const updatedRooms = rooms.map(room => {
      if (!room.images || room.images.length === 0) {
        const roomType = room.type || 'Room';
        const images = sampleRoomImages[roomType] || sampleRoomImages['Room'];
        
        return {
          ...room,
          images: images
        };
      }
      return room; // Keep existing images if they exist
    });
    
    // Update the hotel document
    await updateDoc(hotelRef, {
      rooms: updatedRooms,
      updatedAt: new Date()
    });
    
    console.log(`Successfully updated ${updatedRooms.length} rooms in hotel ${hotelId}`);
    return updatedRooms;
    
  } catch (error) {
    console.error(`Error updating hotel ${hotelId}:`, error);
    throw error;
  }
};

/**
 * Add images to a specific room
 */
export const addImagesToSpecificRoom = async (hotelId, roomId, customImages = null) => {
  try {
    console.log(`Adding images to room ${roomId} in hotel ${hotelId}`);
    
    // Get the hotel document
    const hotelRef = doc(db, 'hotels', hotelId);
    const hotelSnap = await getDoc(hotelRef);
    
    if (!hotelSnap.exists()) {
      throw new Error(`Hotel ${hotelId} not found`);
    }
    
    const hotelData = hotelSnap.data();
    const rooms = hotelData.rooms || [];
    
    // Find the specific room
    const roomIndex = rooms.findIndex(room => room.id === roomId);
    
    if (roomIndex === -1) {
      throw new Error(`Room ${roomId} not found in hotel ${hotelId}`);
    }
    
    const room = rooms[roomIndex];
    const roomType = room.type || 'Room';
    
    // Use custom images if provided, otherwise use sample images
    const images = customImages || sampleRoomImages[roomType] || sampleRoomImages['Room'];
    
    // Update the room with images
    rooms[roomIndex] = {
      ...room,
      images: images
    };
    
    // Update the hotel document
    await updateDoc(hotelRef, {
      rooms: rooms,
      updatedAt: new Date()
    });
    
    console.log(`Successfully updated room ${roomId} with ${images.length} images`);
    return rooms[roomIndex];
    
  } catch (error) {
    console.error(`Error updating room ${roomId}:`, error);
    throw error;
  }
};

/**
 * Add images to all hotels (niwas, sadan, bhavan)
 */
export const addImagesToAllHotels = async () => {
  const hotelIds = ['niwas', 'sadan', 'bhavan'];
  
  for (const hotelId of hotelIds) {
    try {
      await addImagesToHotelRooms(hotelId);
      console.log(`✅ Completed hotel: ${hotelId}`);
    } catch (error) {
      console.error(`❌ Failed hotel: ${hotelId}`, error);
    }
  }
  
  console.log('🎉 Finished processing all hotels!');
};

/**
 * Example usage - you can call these functions from your console or admin panel
 */
export const exampleUsage = async () => {
  // Add images to a specific hotel
  // await addImagesToHotelRooms('niwas');
  
  // Add images to a specific room
  // await addImagesToSpecificRoom('niwas', 'Room-1');
  
  // Add images to all hotels
  // await addImagesToAllHotels();
  
  // Add custom images to a room
  // const customImages = [
  //   'https://your-domain.com/room1-main.jpg',
  //   'https://your-domain.com/room1-thumb1.jpg',
  //   'https://your-domain.com/room1-thumb2.jpg'
  // ];
  // await addImagesToSpecificRoom('niwas', 'Room-1', customImages);
  
  console.log('Check the console for example usage functions');
};

