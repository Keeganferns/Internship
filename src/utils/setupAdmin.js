import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export async function setupAdmin() {
  try {
    const adminEmail = 'admin@govstay.goa.gov.in';
    const adminPassword = 'admin123456';
    
    // Create admin user
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    console.log('Admin user created successfully:', userCredential.user.email);
    
    return userCredential.user;
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Admin user already exists');
    } else {
      console.error('Error creating admin user:', error);
    }
  }
}

// Run this function once to set up the admin account
// setupAdmin(); 