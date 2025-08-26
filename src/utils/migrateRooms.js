// Firestore migration script: Convert hotel rooms to individual room/dorm objects with IDs and statuses
// Usage: node migrateRooms.js (after installing firebase-admin and adding your service account key)

const admin = require('firebase-admin');
const serviceAccount = require('./delhi-maximalistic-booking-firebase-adminsdk-fbsvc-cd2720533c.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateRooms() {
  const hotelsSnapshot = await db.collection('hotels').get();

  for (const hotelDoc of hotelsSnapshot.docs) {
    const hotelData = hotelDoc.data();
    const oldRooms = hotelData.rooms || [];
    let newRooms = [];

    oldRooms.forEach(roomTypeObj => {
      const { type, price, available = 0 } = roomTypeObj;
      for (let i = 1; i <= available; i++) {
        newRooms.push({
          id: `${type}-${i}`,
          type,
          price,
          status: 'available'
        });
      }
    });

    // Optionally, add any already booked rooms here if you have that info

    await hotelDoc.ref.update({ rooms: newRooms });
    console.log(`Migrated hotel ${hotelDoc.id}: ${newRooms.length} rooms`);
  }

  console.log('Migration complete!');
}

migrateRooms().catch(console.error); 