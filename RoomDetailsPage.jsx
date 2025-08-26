import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore"; // <-- Firestore functions imported.
import { db } from "./src/firebase"; // <-- db instance imported.

const amenities = [
  "Free Wi-Fi",
  "Air Conditioning",
  "Housekeeping",
  "Bathroom",
  "Mineral Water",
];

const getRoomImages = (room, hotel) => {
  // Try to find images specific to this room, else fallback to hotel images
  return room.images && room.images.length > 0 ? room.images : hotel.images || [];
};

export default function RoomDetailsPage() {
  const { id: hotelId, roomId } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // This is the Firestore code.
        const hotelRef = doc(db, 'hotels', hotelId);
        const hotelSnap = await getDoc(hotelRef);
        
        if (hotelSnap.exists()) {
          const hotelData = { id: hotelSnap.id, ...hotelSnap.data() };
          setHotel(hotelData);
          
          // Find the specific room
          const foundRoom = hotelData.rooms.find(r => r.id === roomId);
          if (foundRoom) {
            setRoom(foundRoom);
          } else {
            console.error('Room not found');
          }
        } else {
          console.error('Hotel not found');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    }
    
    if (hotelId && roomId) {
      fetchData();
    }
  }, [hotelId, roomId]);

  if (loading) {
    return (
      <div style={{
        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
        background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
      }}>
        <div style={{
          background: "#fff", borderRadius: 16, padding: 32, textAlign: "center"
        }}>
          <div style={{ fontSize: 24, color: "#1565c0" }}>Loading room details...</div>
        </div>
      </div>
    );
  }

  if (!hotel || !room) {
    return (
      <div style={{
        position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
        background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
      }}>
        <div style={{
          background: "#fff", borderRadius: 16, padding: 32, textAlign: "center"
        }}>
          <div style={{ fontSize: 24, color: "#d32f2f" }}>Room not found.</div>
        </div>
      </div>
    );
  }

  const images = getRoomImages(room, hotel);

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, padding: 32, width: 800, maxWidth: "95vw",
        boxShadow: "0 4px 24px rgba(0,0,0,0.18)", display: "flex", gap: 32
      }}>
        {/* Left: Images */}
        <div>
          {images.length > 0 ? (
            <img 
              src={images[0]} 
              alt={`${room.type} ${room.number || ''}`} 
              style={{ width: 320, height: 200, borderRadius: 12, objectFit: "cover" }} 
            />
          ) : (
            <div style={{ 
              width: 320, height: 200, borderRadius: 12, 
              background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center",
              color: "#999", fontSize: 16
            }}>
              No image available
            </div>
          )}
          {images.length > 1 && (
            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              {images.slice(1).map((img, index) => (
                <img 
                  key={index}
                  src={img} 
                  alt={`${room.type} ${room.number || ''} thumbnail ${index + 2}`} 
                  style={{ width: 60, height: 40, borderRadius: 6, objectFit: "cover" }} 
                />
              ))}
            </div>
          )}
        </div>
        {/* Right: Details */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 28, fontWeight: 600, marginBottom: 4 }}>
            {room.type} {room.number ? `- ${room.number}` : ''}
          </div>
          <div style={{ fontSize: 18, color: "#444" }}>{hotel.name}</div>
          <div style={{ margin: "8px 0", color: "#666" }}>
            Floor: {room.floor || 'N/A'} &nbsp; Type: {room.type}
          </div>
          <div style={{ marginBottom: 12, color: "#888", fontSize: 15 }}>
            {amenities.join("  ")}
          </div>
          {/* Room Only */}
          <div style={{
            border: "1px solid #e0e0e0", borderRadius: 12, padding: 18, marginBottom: 18,
            display: "flex", flexDirection: "column", gap: 8
          }}>
            <div style={{ fontWeight: 600, fontSize: 18 }}>Room Only</div>
            <div style={{ color: "#1565c0", fontSize: 28, fontWeight: 700 }}>₹{room.price}</div>
            <div style={{ color: "#888" }}>+₹{Math.round(room.price * 0.18)} Taxes & Fees per night</div>
            <div style={{ color: "green", fontSize: 14 }}>
              Longstay benefits Complimentary One-way Airport Transfer, Complimentary Hi-Tea +more
            </div>
            <div style={{ color: "#888", fontSize: 13 }}>No meals included. Non-Refundable.</div>
            <button style={{
              marginTop: 8, alignSelf: "flex-end", background: "#1976d2", color: "#fff",
              border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 16, fontWeight: 600, cursor: "pointer"
            }}>Book Now</button>
          </div>
          {/* Room with Breakfast */}
          <div style={{
            border: "1px solid #e0e0e0", borderRadius: 12, padding: 18,
            display: "flex", flexDirection: "column", gap: 8
          }}>
            <div style={{ fontWeight: 600, fontSize: 18 }}>Room with Breakfast</div>
            <div style={{ color: "#1565c0", fontSize: 28, fontWeight: 700 }}>₹{room.price + 400}</div>
            <div style={{ color: "#888" }}>+₹{Math.round((room.price + 400) * 0.18)} Taxes & Fees per night</div>
            <div style={{ color: "green", fontSize: 14 }}>
              Longstay benefits Complimentary One-way Airport Transfer, Complimentary Hi-Tea +more
            </div>
            <div style={{ color: "#888", fontSize: 13 }}>Breakfast included. Non-Refundable.</div>
            <button style={{
              marginTop: 8, alignSelf: "flex-end", background: "#1976d2", color: "#fff",
              border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 16, fontWeight: 600, cursor: "pointer"
            }}>Book Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}
