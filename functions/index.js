const functions = require("firebase-functions");
const admin = require("firebase-admin");

try {
  admin.initializeApp();
} catch (e) {
  // Already initialized
}

const db = admin.firestore();

// Mirrors bookings into hotels/{hotelId}/publicBookings with minimal, non-PII fields
exports.onBookingWriteMirrorAvailability = functions.firestore
    .document("bookings/{bookingId}")
    .onWrite(async (change, context) => {
      const bookingId = context.params.bookingId;

      // Handle delete - remove from public mirror
      if (!change.after.exists) {
        const before = change.before.data();
        if (before && before.hotelId) {
          try {
            await db
                .collection("hotels")
                .doc(before.hotelId)
                .collection("publicBookings")
                .doc(bookingId)
                .delete();
            console.log(`Deleted public booking mirror: ${bookingId}`);
          } catch (error) {
            console.error(`Error deleting public booking mirror: ${error}`);
          }
        }
        return null;
      }

      // Handle create/update - mirror minimal data
      const data = change.after.data() || {};
      const {hotelId, checkIn, checkOut, selectedRooms} = data;

      // Validate required fields
      if (!hotelId || !checkIn || !checkOut || !Array.isArray(selectedRooms)) {
        console.log(`Skipping mirror for booking ${bookingId}: missing required fields`);
        return null;
      }

      // Create public mirror with only availability data (no PII)
      const publicDoc = {
        hotelId,
        checkIn,
        checkOut,
        selectedRooms,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      try {
        await db
            .collection("hotels")
            .doc(hotelId)
            .collection("publicBookings")
            .doc(bookingId)
            .set(publicDoc, {merge: true});
        console.log(`Mirrored booking ${bookingId} to public availability for hotel ${hotelId}`);
      } catch (error) {
        console.error(`Error mirroring booking ${bookingId}:`, error);
      }

      return null;
    });
