import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { getAuth, signOut } from 'firebase/auth';

export default function VerificationSuccess() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || 'your email';
  const auth = getAuth();

  useEffect(() => {
    const checkVerification = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error('No user found. Please log in again.');
        }

        // Force refresh the user's token to get the latest email verification status
        await user.reload();
        
        if (!user.emailVerified) {
          // If not verified, sign out and redirect to login
          await signOut(auth);
          navigate('/login', { 
            state: { 
              email: user.email,
              error: 'Please verify your email before logging in.'
            },
            replace: true 
          });
          return;
        }

        // If verified, set loading to false
        setLoading(false);
        
        // Redirect to login after a delay
        const timer = setTimeout(() => {
          signOut(auth).then(() => {
            navigate('/login', { 
              state: { 
                email: user.email,
                success: 'Email verified successfully! You can now log in.'
              },
              replace: true 
            });
          });
        }, 5000);
        
        return () => clearTimeout(timer);
      } catch (err) {
        console.error('Verification error:', err);
        setError(err.message || 'An error occurred during verification.');
        setLoading(false);
      }
    };

    checkVerification();
  }, [navigate, email]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900 p-4">
        <div className="w-full max-w-md bg-slate-900 rounded-2xl shadow-xl p-8 text-center">
          <div className="flex flex-col items-center">
            <FaSpinner className="animate-spin h-12 w-12 text-blue-500 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Verifying your email...</h2>
            <p className="text-slate-400">Please wait while we verify your email address.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900 p-4">
        <div className="w-full max-w-md bg-slate-900 rounded-2xl shadow-xl p-8 text-center">
          <div className="text-red-500 mb-6">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
          <p className="text-slate-300 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900 p-4">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
            <FaCheckCircle className="text-4xl text-green-500" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">Email Verified!</h1>
        
        <div className="bg-slate-800/50 p-4 rounded-lg mb-6">
          <p className="text-slate-300">
            Your email <span className="font-medium text-blue-400">{email}</span> has been successfully verified.
          </p>
        </div>
        
        <p className="text-slate-400 text-sm mb-6">
          You will be automatically redirected to the login page in a few seconds.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => {
              signOut(auth).then(() => {
                navigate('/login', { 
                  state: { 
                    email,
                    success: 'Email verified successfully! You can now log in.'
                  },
                  replace: true 
                });
              });
            }}
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            Continue to Login
          </button>
          
          <p className="text-xs text-slate-500 mt-4">
            Having trouble?{' '}
            <button 
              onClick={() => window.location.reload()}
              className="text-blue-400 hover:underline focus:outline-none"
            >
              Click here
            </button>{' '}
            if you're not redirected automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
