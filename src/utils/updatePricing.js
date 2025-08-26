import { db } from '../firebase.js';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

export async function updatePricing() {
  try {
    const hotelsSnapshot = await getDocs(collection(db, 'hotels'));
    
    for (const hotelDoc of hotelsSnapshot.docs) {
      const hotelData = hotelDoc.data();
      const updatedRooms = hotelData.rooms.map(room => ({
        ...room,
        price: room.type === 'Dorm' ? 2000 : 1000
      }));
      
      await updateDoc(doc(db, 'hotels', hotelDoc.id), {
        rooms: updatedRooms
      });
      
      console.log(`Updated pricing for hotel: ${hotelData.name}`);
    }
    
    console.log('Pricing update completed successfully!');
  } catch (error) {
    console.error('Error updating pricing:', error);
  }
} 