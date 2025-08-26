# Pricing Update Instructions

## Overview
The pricing has been updated to:
- **Rooms**: 1000 INR per night
- **Dorms**: 2000 INR per night

## What was changed

### 1. Sample Data (`src/sampleData.js`)
- Added `price` field to all room objects
- Rooms: 1000 INR
- Dorms: 2000 INR

### 2. Booking Receipt (`src/components/BookingReceipt.jsx`)
- Updated to use actual room prices from hotel data
- Removed hardcoded 12000 INR pricing
- Now dynamically displays correct price based on room type

### 3. Database Update Scripts
- Created `updatePricing.js` - Node.js script
- Created `updatePricing.html` - Browser-based update tool

## How to Update the Database

### Option 1: Using the HTML Tool (Recommended)
1. Open `updatePricing.html` in your browser
2. Click the "Update Pricing" button
3. Wait for the confirmation message

### Option 2: Using Node.js Script
1. Make sure you have Node.js installed
2. Run: `node updatePricing.js`

### Option 3: Manual Update
If you prefer to update manually, you can:
1. Go to your Firebase Console
2. Navigate to Firestore Database
3. Update each hotel document's rooms array
4. Add `price: 1000` for rooms and `price: 2000` for dorms

## Running the Application

To start the development server:
```bash
npm start
# or
npm run dev
```

## Verification

After updating the pricing:
1. Start the application
2. Browse to any hotel
3. Check that the pricing shows correctly:
   - Rooms should show 1000 INR
   - Dorms should show 2000 INR
4. Make a test booking to verify the receipt shows correct pricing

## Files Modified
- `src/sampleData.js` - Added price fields
- `src/components/BookingReceipt.jsx` - Updated pricing logic
- `package.json` - Added start script
- `updatePricing.js` - Database update script
- `updatePricing.html` - Browser-based update tool 