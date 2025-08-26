import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const RoomPricing = () => {
  const location = useLocation();
  const { room, hotel } = location.state || {};
  if (!room || !hotel) return <div className="text-center text-red-600 font-bold text-xl mt-10">Room not found.</div>;
  const images = room.images && room.images.length > 0 ? room.images : hotel.images || [];
  const pricingOptions = [
    {
      label: 'Room Only',
      price: room.price,
      taxes: Math.round(room.price * 0.18),
      offer: 'No meals included. Non-Refundable.',
      special: 'Longstay benefits Complimentary One-way Airport Transfer, Complimentary Hi-Tea +more',
    },
    {
      label: 'Room with Breakfast',
      price: room.price + 400,
      taxes: Math.round((room.price + 400) * 0.18),
      offer: 'Breakfast included. Non-Refundable.',
      special: 'Longstay benefits Complimentary One-way Airport Transfer, Complimentary Hi-Tea +more',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center py-10 px-2">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Room Image */}
          <div className="flex-1 flex flex-col items-center">
            {images.length > 0 && (
              <img
                src={images[0]}
                alt={room.type + ' image'}
                className="rounded-xl w-full max-w-xs object-cover shadow-md mb-4"
              />
            )}
            <div className="text-lg font-semibold text-gray-700">{room.type} {room.number ? `- ${room.number}` : ''}</div>
            <div className="text-gray-500">{hotel.name}</div>
            <div className="text-gray-500">Floor: {room.floor} | Type: {room.type}</div>
            <div className="text-gray-500">{room.size ? `Size: ${room.size}` : ''} {room.bed ? `| Bed: ${room.bed}` : ''}</div>
            <ul className="text-gray-600 text-sm mt-2 list-disc list-inside">
              <li>Free Wi-Fi</li>
              <li>Air Conditioning</li>
              <li>Housekeeping</li>
              <li>Bathroom</li>
              <li>Mineral Water</li>
            </ul>
          </div>
          {/* Pricing Options */}
          <div className="flex-1 flex flex-col gap-8">
            {pricingOptions.map((option, idx) => (
              <div key={idx} className="border rounded-xl p-6 shadow-sm bg-blue-50 mb-4">
                <div className="text-xl font-semibold text-gray-800 mb-2">{option.label}</div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold text-green-700">₹{option.price}</span>
                  <span className="text-gray-500 text-sm">+₹{option.taxes} Taxes & Fees/night</span>
                </div>
                <div className="text-green-700 text-xs mb-1">{option.special}</div>
                <div className="text-gray-500 text-xs mb-1">{option.offer}</div>
                <Link
                  to="/book"
                  state={{ room, hotel, pricingOption: option }}
                  className="inline-block text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow transition mt-2"
                >
                  Book Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomPricing;
