import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB6fGDtjbuA3SgZhiuPKEAbD6VdUIYChoo",
  authDomain: "internship-48a2e.firebaseapp.com",
  projectId: "internship-48a2e",
  storageBucket: "internship-48a2e.appspot.com",
  messagingSenderId: "116293893386",
  appId: "1:116293893386:web:b2007aa6ed441c07848ef3",
  measurementId: "G-R3WPMXBWP4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function updatePricing() {
  try {
    console.log('Starting pricing update...');
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
    console.log('New pricing: Rooms = 1000 INR, Dorms = 2000 INR');
  } catch (error) {
    console.error('Error updating pricing:', error);
  }
}

// Run the update
updatePricing(); 