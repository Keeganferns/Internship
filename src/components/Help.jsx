import React, { useState } from 'react';
import { FaRegCalendarAlt, FaUserCircle, FaClipboardList, FaCreditCard, FaRegClock, FaGlobe, FaQuestionCircle } from 'react-icons/fa';

const helpSections = [
  {
    title: 'How to Book a Room',
    icon: <FaRegCalendarAlt className="text-white" />, color: 'bg-blue-500',
    content: (
      <ul className="list-disc list-inside">
        <li>Search for available guest houses using the search or browse feature.</li>
        <li>Click on a hotel to view details and available rooms.</li>
        <li>Click "Book Now" and fill in the required details.</li>
        <li>Submit your booking and check your bookings in the "My Bookings" section.</li>
      </ul>
    ),
  },
  {
    title: 'Account & Login Help',
    icon: <FaUserCircle className="text-white" />, color: 'bg-green-500',
    content: (
      <ul className="list-disc list-inside">
        <li>Create an account using Google or your email address.</li>
        <li>Reset your password using the "Forgot password?" link on the login page.</li>
        <li>If you have trouble logging in, ensure your credentials are correct or contact support.</li>
      </ul>
    ),
  },
  {
    title: 'Booking Management',
    icon: <FaClipboardList className="text-yellow-500" />, // icon is yellow
    color: 'bg-white border-yellow-400', // card is white, border is yellow
    content: (
      <ul className="list-disc list-inside">
        <li>View all your bookings in the "My Bookings" section.</li>
        <li>See guest lists, booking details, and amount for each booking.</li>
        <li>Contact support to modify or cancel a booking if needed.</li>
      </ul>
    ),
  },
  {
    title: 'Payment & Pricing',
    icon: <FaCreditCard className="text-white" />, color: 'bg-pink-500',
    content: (
      <ul className="list-disc list-inside">
        <li>The total amount is calculated based on room price, number of nights, and number of guests.</li>
        <li>Check the booking details for the exact amount.</li>
        <li>Contact support for payment-related queries.</li>
      </ul>
    ),
  },
  {
    title: 'Eligibility & Rules',
    icon: <FaRegClock className="text-white" />, color: 'bg-indigo-500',
    content: (
      <ul className="list-disc list-inside">
        <li>Government servants and private individuals can book accommodations.</li>
        <li>Provide accurate information and required documents if asked.</li>
      </ul>
    ),
  },
  {
    title: 'Contact Information',
    icon: <FaGlobe className="text-white" />, color: 'bg-red-500',
    content: (
      <ul className="list-disc list-inside">
        <li>Email: support@govstay.com</li>
        <li>Phone: 1800-000-0000</li>
        <li>Support hours: 9:00 AM – 6:00 PM (Mon–Sat)</li>
      </ul>
    ),
  },
  {
    title: 'Frequently Asked Questions (FAQ)',
    icon: <FaQuestionCircle className="text-white" />, color: 'bg-cyan-500',
    content: (
      <ul className="list-disc list-inside">
        <li>Can I book for someone else? Yes, enter their details in the booking form.</li>
        <li>What if I need to change my dates? Contact support for assistance.</li>
        <li>How do I know my booking is confirmed? You will see a confirmation in "My Bookings".</li>
      </ul>
    ),
  },
];

export default function Help() {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-pink-50 to-green-50 py-10 px-2 flex flex-col items-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-10 text-center font-serif tracking-wide">Help & Support</h1>
      <div className="w-full max-w-2xl space-y-6">
        {helpSections.map((section, idx) => (
          <div
            key={idx}
            className={`relative rounded-2xl shadow-lg transition-all duration-300 border-l-8 ${section.color} ${openIdx === idx ? 'bg-white scale-105 shadow-2xl' : 'bg-white/90 hover:scale-102 hover:shadow-xl'} group`}
            style={{ borderLeftColor: section.color.replace('bg-', '').replace('-500', '') }}
          >
            <button
              className="w-full flex items-center gap-4 p-6 focus:outline-none text-left"
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
              aria-expanded={openIdx === idx}
            >
              <span className={`flex items-center justify-center w-10 h-10 rounded-full ${section.color} shadow-md`}>{section.icon}</span>
              <span className="text-xl font-semibold text-gray-800 flex-1 font-serif tracking-wide">
                {section.title}
              </span>
              <svg className={`w-6 h-6 ml-2 transition-transform ${openIdx === idx ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7"/></svg>
            </button>
            <div
              className={`overflow-hidden transition-all duration-500 ${openIdx === idx ? 'max-h-96 opacity-100 py-4 px-8' : 'max-h-0 opacity-0 py-0 px-8'}`}
              style={{ background: openIdx === idx ? 'rgba(245,245,255,0.7)' : 'transparent' }}
            >
              <div className="text-gray-700 text-base">
                {section.content}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 