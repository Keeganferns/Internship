# Firebase Setup Guide for GovStay

This guide will help you set up and deploy the Firebase configuration for the GovStay application.

## Prerequisites

1. Node.js and npm installed
2. Firebase CLI installed globally: `npm install -g firebase-tools`
3. Firebase project created at [Firebase Console](https://console.firebase.google.com/)

## Setup Steps

### 1. Initialize Firebase in your project

```bash
# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init

# Select the following services:
# - Firestore
# - Storage
# - Hosting
```

### 2. Configure Firebase Project

Make sure your `firebase.json` file includes the following configuration:

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ]
  }
}
```

### 3. Deploy Firebase Rules and Indexes

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Deploy Storage rules
firebase deploy --only storage
```

### 4. Build and Deploy the Application

```bash
# Build the application
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

## Collections Structure

### Hotels Collection
- **Document ID**: Hotel ID (e.g., "niwas", "sadan", "bhavan")
- **Fields**:
  - `name`: Hotel name
  - `description`: Hotel description
  - `images`: Array of image URLs
  - `amenities`: Array of amenities
  - `location`: Hotel location
  - `rooms`: Array of room objects with status
  - `createdAt`: Timestamp
  - `updatedAt`: Timestamp

### Bookings Collection
- **Document ID**: Auto-generated
- **Fields**:
  - `userId`: User's Firebase UID
  - `userName`: User's display name
  - `userEmail`: User's email
  - `hotelId`: Hotel ID
  - `hotelName`: Hotel name
  - `roomType`: Type of room (Room/Dorm)
  - `selectedRooms`: Array of selected room IDs
  - `checkIn`: Check-in date
  - `checkOut`: Check-out date
  - `guests`: Number of guests
  - `applicantName`: Applicant's name
  - `applicantAddress`: Applicant's address
  - `guestNames`: Array of guest names
  - `govtServant`: Whether applicant is government servant
  - `purpose`: Purpose of stay (official/private)
  - `status`: Booking status (pending/confirmed/cancelled)
  - `createdAt`: Timestamp

### Users Collection
- **Document ID**: User's Firebase UID
- **Fields**:
  - `email`: User's email
  - `displayName`: User's display name
  - `photoURL`: Profile photo URL
  - `isAdmin`: Whether user is admin
  - `createdAt`: Timestamp
  - `updatedAt`: Timestamp

## Security Rules

### Firestore Rules
- **Hotels**: Readable by all authenticated users, writable by admin only
- **Bookings**: Users can read/write their own bookings, admin can read/write all
- **Users**: Users can read/write their own profile, admin can read all

### Storage Rules
- **Profile Images**: Users can upload their own profile images (5MB limit)
- **Hotel Images**: Admin only, public read access (10MB limit)
- **Booking Documents**: Users can upload their own documents (10MB limit)

## Admin Access

The admin user is identified by the email: `admin@govstay.goa.gov.in`

To set up admin access:
1. Create a user account with this email
2. The application will automatically detect admin status
3. Admin users have access to the admin dashboard and can manage all bookings

## Troubleshooting

### Common Issues

1. **Permission Denied Errors**
   - Ensure you're logged in with the correct Firebase account
   - Check that your Firebase project is properly configured
   - Verify that the security rules are deployed correctly

2. **Collection Not Found**
   - Run the application once to initialize the collections
   - Check the browser console for initialization messages

3. **Storage Upload Failures**
   - Verify Storage rules are deployed
   - Check file size limits (5MB for profile, 10MB for others)
   - Ensure file types are allowed (images for profile/hotel, PDF/images for documents)

### Useful Commands

```bash
# View Firebase project info
firebase projects:list

# Switch Firebase project
firebase use <project-id>

# View deployment history
firebase hosting:history

# Clear cache and redeploy
firebase deploy --force
```

## Environment Variables

Make sure your Firebase configuration in `src/firebase.js` matches your Firebase project settings. The configuration should include:

- `apiKey`
- `authDomain`
- `projectId`
- `storageBucket`
- `messagingSenderId`
- `appId`
- `measurementId`

## Support

If you encounter any issues:
1. Check the Firebase Console for error logs
2. Verify your Firebase project settings
3. Ensure all rules and indexes are properly deployed
4. Check the browser console for client-side errors 