import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuth, applyActionCode, sendEmailVerification, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function EmailVerification() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(60);
  const [email, setEmail] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getAuth();

  // Check verification status
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/signup', { replace: true });
      return;
    }

    setEmail(user.email);
    checkEmailVerification();

    // Set up a real-time listener for email verification status
    const interval = setInterval(checkEmailVerification, 3000);
    
    // Start countdown for resend button
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, [navigate]);

  const checkEmailVerification = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      // Force refresh the user's token to get the latest email verification status
      await user.reload();
      if (user.emailVerified) {
        setIsVerified(true);
        // Redirect to success page after a short delay
        setTimeout(() => {
          navigate('/verification-success', { replace: true });
        }, 2000);
      }
    } catch (err) {
      console.error('Error checking verification status:', err);
    }
  };

  const handleResendVerification = async () => {
    if (resendDisabled) return;
    
    const user = auth.currentUser;
    if (!user) {
      navigate('/signup', { replace: true });
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await sendEmailVerification(user);
      setResendDisabled(true);
      setCountdown(60);
      
      // Restart countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (err) {
      console.error('Failed to resend verification email:', err);
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendDisabled) return;
    
    try {
      setResendDisabled(true);
      setCountdown(60);
      setError('');
      
      // In a real app, you would resend the verification code here
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Start countdown again
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (err) {
      console.error('Failed to resend code:', err);
      setError('Failed to resend code. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900 p-4">
      <div className="w-full max-w-md bg-slate-900 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Verify Your Email Address</h1>
          <p className="text-slate-400">
            We've sent a verification link to <span className="font-medium text-blue-400">{email || 'your email'}</span>.
          </p>
          <p className="text-slate-400 mt-2">
            Please check your inbox and click the verification link to activate your account.
          </p>
        </div>

        {isVerified && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg text-sm">
            Email verified successfully! Redirecting...
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-400">Check your email</h3>
              <div className="mt-1 text-sm text-slate-400">
                <p>We've sent a verification link to your email address.</p>
                <p className="mt-1">The link will expire in 24 hours.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center space-y-4">
          <div>
            <button
              onClick={handleResendVerification}
              disabled={resendDisabled || loading}
              className={`text-sm font-medium ${
                resendDisabled || loading 
                  ? 'text-slate-600 cursor-not-allowed' 
                  : 'text-blue-400 hover:underline'
              }`}
            >
              {resendDisabled 
                ? `Resend email in ${countdown}s` 
                : "Didn't receive the email? Resend"}
            </button>
          </div>
          
          <div>
            <button
              onClick={() => navigate('/signup')}
              className="text-sm text-slate-400 hover:text-blue-400 hover:underline"
            >
              Entered the wrong email? Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
