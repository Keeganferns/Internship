import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

// Upload profile image
export const uploadProfileImage = async (userId, file) => {
  try {
    const storageRef = ref(storage, `profile-images/${userId}/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

// Upload hotel image
export const uploadHotelImage = async (hotelId, file) => {
  try {
    const storageRef = ref(storage, `hotel-images/${hotelId}/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading hotel image:', error);
    throw error;
  }
};

// Upload booking document
export const uploadBookingDocument = async (bookingId, file, userId) => {
  try {
    const storageRef = ref(storage, `booking-documents/${bookingId}/${file.name}`);
    const metadata = {
      customMetadata: {
        userId: userId,
        uploadedAt: new Date().toISOString()
      }
    };
    const snapshot = await uploadBytes(storageRef, file, metadata);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading booking document:', error);
    throw error;
  }
};

// Delete file from storage
export const deleteFile = async (filePath) => {
  try {
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Get file download URL
export const getFileURL = async (filePath) => {
  try {
    const storageRef = ref(storage, filePath);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error getting file URL:', error);
    throw error;
  }
}; 