import React from 'react';

// Dummy data for pricing options and images (replace with real data as needed)
const getRoomImages = (room, hotel) => {
  // Try to find images specific to this room, else fallback to hotel images
  return room.images && room.images.length > 0 ? room.images : hotel.images || [];
};

const getPricingOptions = (room) => [
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

function RoomDetailsModal({ room, hotel, onClose, onBookOption }) {
  const images = getRoomImages(room, hotel);
  const pricingOptions = getPricingOptions(room);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        <button
          className="absolute top-4 right-4 text-3xl text-gray-400 hover:text-gray-700 font-bold"
          onClick={onClose}
        >
          ×
        </button>
        <div className="flex flex-col md:flex-row gap-8 p-8">
          {/* Images Gallery */}
          <div className="md:w-1/2 flex flex-col gap-4">
            {images.length > 0 && (
              <img
                src={images[0]}
                alt={room.type + ' image'}
                className="rounded-lg shadow-lg w-full h-56 object-cover"
              />
            )}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.slice(1).map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={room.type + ' gallery ' + (i + 2)}
                    className="w-20 h-16 object-cover rounded border"
                  />
                ))}
              </div>
            )}
          </div>
          {/* Room Details and Pricing */}
          <div className="md:w-1/2 flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{room.type} {room.number ? `- ${room.number}` : ''}</h2>
              <div className="text-gray-600 mb-2">{hotel.name}</div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-700 mb-2">
                {room.size && <span>Size: {room.size}</span>}
                {room.bed && <span>Bed: {room.bed}</span>}
                <span>Floor: {room.floor}</span>
                <span>Type: {room.type}</span>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
                {/* Dummy amenities, replace with real data if available */}
                <span>Free Wi-Fi</span>
                <span>Air Conditioning</span>
                <span>Housekeeping</span>
                <span>Bathroom</span>
                <span>Mineral Water</span>
              </div>
            </div>
            {/* Pricing Options */}
            <div className="space-y-6">
              {pricingOptions.map((option, idx) => (
                <div key={idx} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="text-lg font-bold text-gray-800 mb-1">{option.label}</div>
                    <div className="text-blue-700 font-bold text-2xl mb-1">₹{option.price}</div>
                    <div className="text-gray-600 text-sm mb-1">+₹{option.taxes} Taxes & Fees per night</div>
                    <div className="text-green-700 text-xs mb-1">{option.special}</div>
                    <div className="text-gray-500 text-xs">{option.offer}</div>
                  </div>
                  <button
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-colors text-lg"
                    onClick={() => onBookOption(option)}
                  >
                    Book Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomDetailsModal;
