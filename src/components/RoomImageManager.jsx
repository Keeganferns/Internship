import React, { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { updateRoomImages, getRoomImages } from '../utils/updateRoomImages';

function RoomImageManager() {
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [roomImages, setRoomImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load all hotels from Firestore so nothing is hardcoded
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const snap = await getDocs(collection(db, 'hotels'));
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setHotels(list);
      } catch (error) {
        console.error('Error fetching hotels:', error);
        setMessage('Error fetching hotels');
      }
    };
    fetchHotels();
  }, []);

  const handleRoomSelect = async (roomId) => {
    setSelectedRoom(roomId);
    if (selectedHotel && roomId) {
      try {
        const images = await getRoomImages(selectedHotel, roomId);
        setRoomImages(images);
      } catch (error) {
        setRoomImages([]);
      }
    }
  };

  const addImage = () => {
    if (newImageUrl.trim()) {
      setRoomImages([...roomImages, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const removeImage = (index) => {
    setRoomImages(roomImages.filter((_, i) => i !== index));
  };

  const saveImages = async () => {
    if (!selectedHotel || !selectedRoom) {
      setMessage('Please select both hotel and room');
      return;
    }

    setLoading(true);
    try {
      await updateRoomImages(selectedHotel, selectedRoom, roomImages);
      setMessage('Room images updated successfully!');
    } catch (error) {
      setMessage('Error updating room images: ' + error.message);
    }
    setLoading(false);
  };

  const currentHotel = hotels.find(h => h.id === selectedHotel);
  const currentRoom = currentHotel?.rooms?.find(r => r.id === selectedRoom);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Room Image Manager</h2>
      
      {/* Hotel Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Hotel
        </label>
        <select
          value={selectedHotel}
          onChange={(e) => setSelectedHotel(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">Choose a hotel...</option>
          {hotels.map(h => (
            <option key={h.id} value={h.id}>
              {h.name || h.id}
            </option>
          ))}
        </select>
      </div>

      {/* Room Selection */}
      {selectedHotel && currentHotel && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Room
          </label>
          <select
            value={selectedRoom}
            onChange={(e) => handleRoomSelect(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Choose a room...</option>
            {currentHotel.rooms?.map(room => (
              <option key={room.id} value={room.id}>
                {room.type} {room.number || ''} - ₹{room.price}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Image Management */}
      {selectedRoom && currentRoom && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">
              Current Images for {currentRoom.type} {currentRoom.number || ''}
            </h3>
            
            {/* Add New Image */}
            <div className="flex gap-2 mb-4">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Enter image URL"
                className="flex-1 p-2 border border-gray-300 rounded-md"
              />
              <button
                onClick={addImage}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>

            {/* Current Images */}
            {roomImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {roomImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Room image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="hidden group-hover:block absolute top-2 right-2">
                      <button
                        onClick={() => removeImage(index)}
                        className="bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                    <div className="hidden bg-gray-200 w-full h-32 rounded-lg border flex items-center justify-center text-gray-500">
                      Invalid Image
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No images added yet</p>
            )}

            {/* Save Button */}
            <button
              onClick={saveImages}
              disabled={loading}
              className="mt-4 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Images'}
            </button>
          </div>
        </div>
      )}

      {/* Message Display */}
      {message && (
        <div className={`mt-4 p-3 rounded-md ${
          message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}

export default RoomImageManager;

