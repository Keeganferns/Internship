import React, { useState, useEffect } from 'react';

function AdminSetup() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState({ hotels: 0, bookings: 0, users: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    // Simple stats loading - you can implement this based on your needs
    setStats({ hotels: 0, bookings: 0, users: 0 });
  };

  const handleSetupCollections = async () => {
    setLoading(true);
    setMessage('');
    try {
      setMessage('✅ Database setup functionality removed - use Firebase Console for manual setup');
      await loadStats(); // Refresh stats
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
    setLoading(false);
  };

  const handleResetCollections = async () => {
    if (window.confirm('Are you sure you want to reset all collections? This will overwrite existing data.')) {
      setLoading(true);
      setMessage('');
      try {
        setMessage('✅ Reset functionality removed - use Firebase Console for manual reset');
        await loadStats(); // Refresh stats
      } catch (error) {
        setMessage(`❌ Error: ${error.message}`);
      }
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    setLoading(true);
    setMessage('');
    try {
      setMessage('✅ Sample data seeding removed - add real data through the app');
      await loadStats(); // Refresh stats
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Database Setup & Management</h1>
        
        {/* Database Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Hotels</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.hotels}</p>
            <p className="text-sm text-blue-600">Total Hotels</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Bookings</h3>
            <p className="text-3xl font-bold text-green-600">{stats.bookings}</p>
            <p className="text-sm text-green-600">Total Bookings</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-lg font-semibold text-purple-800 mb-2">Users</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.users}</p>
            <p className="text-sm text-purple-600">Total Users</p>
          </div>
        </div>

        {/* Setup Actions */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            className="bg-gray-400 text-white font-bold py-3 px-6 rounded-lg shadow cursor-not-allowed"
            disabled={true}
          >
            Setup Collections (Removed)
          </button>
          <button
            className="bg-gray-400 text-white font-bold py-3 px-6 rounded-lg shadow cursor-not-allowed"
            disabled={true}
          >
            Reset Collections (Removed)
          </button>
          <button
            className="bg-gray-400 text-white font-bold py-3 px-6 rounded-lg shadow cursor-not-allowed"
            disabled={true}
          >
            Seed Rich Data (Removed)
          </button>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`mt-6 p-4 rounded-lg ${
            message.includes('✅') ? 'bg-green-50 border border-green-200 text-green-800' : 
            message.includes('❌') ? 'bg-red-50 border border-red-200 text-red-800' : 
            'bg-blue-50 border border-blue-200 text-blue-800'
          }`}>
            {message}
          </div>
        )}

        {/* Collection Information */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Database Management</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-blue-700">Sample Data Removed</h3>
              <p className="text-sm text-blue-600">All sample data and automatic seeding has been removed. Your database will only contain real user data.</p>
            </div>
            <div>
              <h3 className="font-semibold text-blue-700">Manual Management</h3>
              <p className="text-sm text-blue-600">Use Firebase Console to manually manage your database collections and data.</p>
            </div>
            <div>
              <h3 className="font-semibold text-blue-700">Data Persistence</h3>
              <p className="text-sm text-blue-600">Your real bookings, room status, and user data will persist naturally without automatic resets.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminSetup; 