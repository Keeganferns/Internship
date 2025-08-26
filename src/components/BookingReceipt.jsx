import React from 'react';
import jsPDF from 'jspdf';
import { getRoomDisplayName } from '../utils/roomUtils';

function BookingReceipt({ booking, hotel, onClose }) {
  // Generate a unique booking ID
  const generateBookingId = () => {
    const date = new Date();
    const dateStr = date.getFullYear().toString() + 
                   (date.getMonth() + 1).toString().padStart(2, '0') + 
                   date.getDate().toString().padStart(2, '0');
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `GS-${dateStr}-${randomStr}`;
  };

  // Calculate number of nights (defensive against invalid dates)
  const calculateNights = () => {
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const diffMs = checkOut - checkIn;
    const days = Number.isFinite(diffMs) ? Math.round(diffMs / (1000 * 60 * 60 * 24)) : 1;
    return Math.max(1, days);
  };

  // Get day of week
  const getDayOfWeek = (dateStr) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date(dateStr).getDay()];
  };

  // Calculate total amount (prefer selected pricing option if available)
  const calculateTotal = () => {
    const selectedRoomData = hotel.rooms.find(room => room.id === booking.selectedRooms?.[0]);
    const basePrice = selectedRoomData
      ? selectedRoomData.price
      : (selectedRoomData?.type === 'Dorm' ? 2000 : 1000);
    const pricePerNight = booking.pricingOption?.price ?? basePrice;
    const nights = calculateNights();
    const roomsCount = Math.max(1, booking.selectedRooms?.length || 0);
    const subtotal = pricePerNight * nights * roomsCount;
    const gst = subtotal * 0.18; // 18% GST
    return { pricePerNight, nights, roomsCount, subtotal, gst, total: subtotal + gst };
  };

  const bookingId = generateBookingId();
  const nights = calculateNights();
  const amounts = calculateTotal();
  // Debug aid for mismatched totals
  if (process.env.NODE_ENV === 'development') {
    const selectedRoomData = hotel.rooms.find(room => room.id === booking.selectedRooms?.[0]);
    const basePrice = selectedRoomData ? selectedRoomData.price : (selectedRoomData?.type === 'Dorm' ? 2000 : 1000);
    console.debug('[Receipt calc]', {
      selectedPricing: booking.pricingOption,
      basePrice,
      pricePerNight: amounts.pricePerNight,
      nights,
      roomsCount: amounts.roomsCount,
      subtotal: amounts.subtotal,
      gst: amounts.gst,
      total: amounts.total,
      booking
    });
  }

  const handlePrint = () => {
    window.print();
  };



  const handleDownloadPDF = async () => {
    try {
      // Show loading state
      const downloadBtn = document.querySelector('[data-pdf-download]');
      if (downloadBtn) {
        downloadBtn.disabled = true;
        downloadBtn.textContent = 'Generating Receipt...';
      }

      // Create PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Set font styles
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      
      // Header
      pdf.text('GOVSTAY - BOOKING CONFIRMATION', 105, 20, { align: 'center' });
      
      // Add line under header
      pdf.setDrawColor(0, 102, 204);
      pdf.setLineWidth(0.5);
      pdf.line(60, 25, 150, 25);
      
      // Reset font for content
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      let yPosition = 40;
      
      // Booking Details Section
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Booking Details:', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Booking ID: ${bookingId}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Booking Date: ${new Date().toLocaleDateString()}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Guest Name: ${booking.applicantName}`, 20, yPosition);
      yPosition += 15;
      
      // Accommodation Details Section
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Accommodation Details:', 20, yPosition);
      yPosition += 10;
      
      // Get the actual room data from hotel
      let actualRoomType;
      const selectedRoom = hotel.rooms.find(room => room.id === booking.selectedRooms[0]);
      if (selectedRoom && selectedRoom.type === 'Dorm') {
        actualRoomType = 'Dorm';
      } else {
        actualRoomType = getRoomDisplayName(booking, hotel);
      }
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Room Number(s): ${booking.selectedRooms.join(', ')}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Room Type: ${actualRoomType}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Check-in Date: ${booking.checkIn} (${getDayOfWeek(booking.checkIn)})`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Check-out Date: ${booking.checkOut} (${getDayOfWeek(booking.checkOut)})`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Number of Nights: ${nights}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Hotel: ${hotel.name}`, 20, yPosition);
      yPosition += 15;
      
      // Guest Information Section
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Guest Information:', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Applicant Address: ${booking.applicantAddress}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Government Servant: ${booking.govtServant}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Purpose: ${booking.purpose}`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Number of Guests: ${booking.guests}`, 20, yPosition);
      yPosition += 6;
      
      if (booking.guestNames && booking.guestNames.length > 0) {
        pdf.text('Guest Names:', 20, yPosition);
        yPosition += 6;
        booking.guestNames.forEach((name, index) => {
          pdf.text(`${index + 1}. ${name}`, 25, yPosition);
          yPosition += 5;
        });
        yPosition += 5;
      }
      
      // Payment Summary Section
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Payment Summary:', 20, yPosition);
      yPosition += 10;
      
      // Price per night (prefer selected pricing option)
      const basePrice = selectedRoom ? selectedRoom.price : (actualRoomType === 'Dorm' ? 2000 : 1000);
      const pricePerRoom = booking.pricingOption?.price ?? basePrice;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Price per Room per Night: ${pricePerRoom} INR`, 20, yPosition);
      yPosition += 6;
      if (booking.pricingOption?.label) {
        pdf.text(`Selected Plan: ${booking.pricingOption.label}`, 20, yPosition);
        yPosition += 6;
      }
      pdf.text(`Subtotal: ${amounts.subtotal} INR`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Taxes & Fees (18% GST): ${amounts.gst} INR`, 20, yPosition);
      yPosition += 6;
      
      // Total amount in bold
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text(`Total Amount Paid: ${amounts.total} INR`, 20, yPosition);
      yPosition += 15;
      
      // Contact Information Section
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Contact Information:', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`GovStay Support: support@govstay.goa.gov.in`, 20, yPosition);
      yPosition += 6;
      pdf.text(`Address: Government Guest House, Goa`, 20, yPosition);
      yPosition += 15;
      
      // Closing message
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'italic');
      pdf.text('Thank you for choosing GovStay! We look forward to your stay.', 105, yPosition, { align: 'center' });
      
      // Save the PDF
      pdf.save(`booking-receipt-${bookingId}.pdf`);
      
      // Reset button state
      if (downloadBtn) {
        downloadBtn.disabled = false;
        downloadBtn.textContent = 'Download Receipt';
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
      
      // Reset button state
      const downloadBtn = document.querySelector('[data-pdf-download]');
      if (downloadBtn) {
        downloadBtn.disabled = false;
        downloadBtn.textContent = 'Download Receipt';
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">GOVSTAY - BOOKING CONFIRMATION</h1>
            <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
          </div>

          {/* Booking Details Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              Booking Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="font-semibold text-gray-700">Booking ID:</span>
                <span className="ml-2 text-blue-600 font-mono">{bookingId}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Booking Date:</span>
                <span className="ml-2">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="md:col-span-2">
                <span className="font-semibold text-gray-700">Guest Name:</span>
                <span className="ml-2">{booking.applicantName}</span>
              </div>
            </div>
          </div>

          {/* Accommodation Details Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              Accommodation Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {booking.selectedRooms && booking.selectedRooms.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-700">Room Number(s):</span>
                  <span className="ml-2">{booking.selectedRooms.join(', ')}</span>
                </div>
              )}
              <div>
                <span className="font-semibold text-gray-700">Room Type:</span>
                <span className="ml-2">{
                  (() => {
                    const selectedRoom = hotel.rooms.find(room => room.id === booking.selectedRooms?.[0]);
                    if (selectedRoom && selectedRoom.type === 'Dorm') {
                      return 'Dorm';
                    }
                    const display = getRoomDisplayName(booking, hotel);
                    return display || 'N/A';
                  })()
                }</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Check-in Date:</span>
                <span className="ml-2">{booking.checkIn} ({getDayOfWeek(booking.checkIn)})</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Check-out Date:</span>
                <span className="ml-2">{booking.checkOut} ({getDayOfWeek(booking.checkOut)})</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Number of Nights:</span>
                <span className="ml-2">{nights}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Hotel:</span>
                <span className="ml-2">{hotel.name}</span>
              </div>
            </div>
          </div>

          {/* Guest Information */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              Guest Information
            </h2>
            <div className="space-y-2">
              <div>
                <span className="font-semibold text-gray-700">Applicant Address:</span>
                <span className="ml-2">{booking.applicantAddress}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Government Servant:</span>
                <span className="ml-2 capitalize">{booking.govtServant}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Purpose:</span>
                <span className="ml-2 capitalize">{booking.purpose}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Number of Guests:</span>
                <span className="ml-2">{booking.guests}</span>
              </div>
              {booking.guestNames && booking.guestNames.length > 0 && (
                <div>
                  <span className="font-semibold text-gray-700">Guest Names:</span>
                  <div className="ml-2 mt-1">
                    {booking.guestNames.map((name, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        {index + 1}. {name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Summary Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              Payment Summary
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-700">Price per Room per Night:</span>
                  <span className="font-semibold">{amounts.pricePerNight} INR</span>
                </div>
                {booking.pricingOption?.label && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">Selected Plan:</span>
                    <span className="font-semibold">{booking.pricingOption.label}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="font-semibold">{amounts.subtotal} INR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Taxes & Fees (18% GST):</span>
                  <span className="font-semibold">{amounts.gst} INR</span>
                </div>
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-800">Total Amount Paid:</span>
                    <span className="text-lg font-bold text-blue-600">{amounts.total} INR</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
              Contact Information
            </h2>
            <div className="space-y-2">
              <div>
                <span className="font-semibold text-gray-700">GovStay Support:</span>
                <span className="ml-2">support@govstay.goa.gov.in</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Address:</span>
                <span className="ml-2">Government Guest House, Goa</span>
              </div>
            </div>
          </div>

          {/* Closing Message */}
          <div className="text-center py-6 border-t border-gray-200">
            <p className="text-gray-600 italic">
              Thank you for choosing GovStay! We look forward to your stay.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button
              onClick={handlePrint}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Receipt
            </button>
            <button
              onClick={handleDownloadPDF}
              data-pdf-download
              className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Receipt
            </button>

            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close & Return
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingReceipt; 