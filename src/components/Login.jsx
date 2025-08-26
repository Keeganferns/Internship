import React, { useState } from 'react';
import { signInWithGoogle, signInWithEmail } from '../firebase';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

const PLACEHOLDER_IMG =
  'https://i.postimg.cc/mgT1sj82/goaassembly.jpg'; // Goa/guest house scenic

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoogle = async () => {
    setError('');
    setShowError(false);
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      setError('Invalid credentials');
      setShowError(true);
    }
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    setError('');
    setShowError(false);
    try {
      await signInWithEmail(email, password);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials');
      setShowError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900">
      <div className="w-full max-w-4xl bg-slate-900 rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel */}
        <div className="block w-full md:w-1/2 relative h-64 md:h-auto">
          <img
            src={PLACEHOLDER_IMG}
            alt="Scenic Goa Guest House"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-6 md:p-8">
            <div className="text-white text-xl md:text-2xl font-bold drop-shadow-lg">Government Guest House Booking</div>
          </div>
        </div>
        {/* Right Panel (Form) */}
        <div className="flex-1 flex flex-col justify-center p-8 bg-slate-900">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Login to GovStay</h2>
          <div className="text-slate-300 mb-8 text-sm">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-blue-400 hover:underline">Sign Up</Link>
          </div>
          <button
            className="w-full mb-6 px-6 py-3 bg-white text-gray-700 font-medium rounded-lg shadow flex items-center justify-center gap-3 border border-gray-300 hover:bg-gray-50 transition"
            onClick={handleGoogle}
            type="button"
          >
            <span className="bg-white rounded-full p-1 shadow flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18">
                <g>
                  <path fill="#4285F4" d="M17.64 9.2045c0-.638-.0573-1.252-.1636-1.84H9v3.481h4.844c-.208 1.12-.834 2.07-1.78 2.71v2.254h2.877c1.684-1.553 2.659-3.844 2.659-6.605z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.47-.806 5.96-2.188l-2.877-2.254c-.8.537-1.82.857-3.083.857-2.37 0-4.377-1.602-5.096-3.764H.98v2.366C2.47 16.293 5.522 18 9 18z"/>
                  <path fill="#FBBC05" d="M3.904 10.651A5.41 5.41 0 0 1 3.5 9c0-.573.098-1.13.27-1.651V4.983H.98A8.996 8.996 0 0 0 0 9c0 1.418.34 2.754.94 3.933l2.964-2.282z"/>
                  <path fill="#EA4335" d="M9 3.579c1.32 0 2.5.454 3.43 1.346l2.572-2.572C13.47.806 11.43 0 9 0 5.522 0 2.47 1.707.98 4.983l2.964 2.366C4.623 5.181 6.63 3.579 9 3.579z"/>
                </g>
              </svg>
            </span>
            Sign in with Google
          </button>
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-slate-700" />
            <span className="mx-4 text-slate-400 text-sm">or</span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>
          <form className="w-full flex flex-col gap-4" onSubmit={handleEmail}>
            <div className="relative">
              <label className="block font-semibold mb-2 text-slate-200">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full border border-slate-700 bg-slate-800 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <span className="absolute right-3 top-10 text-slate-400">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/><path d="M22 6l-10 7L2 6"/></svg>
              </span>
            </div>
            <div className="relative">
              <label className="block font-semibold mb-2 text-slate-200">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="w-full border border-slate-700 bg-slate-800 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-10 text-slate-400 hover:text-blue-400"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                ) : (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.77 21.77 0 0 1 5.06-7.94M1 1l22 22"/></svg>
                )}
              </button>
            </div>
            <div className="flex justify-end mb-2">
              <Link to="#" className="text-blue-400 text-sm hover:underline">Forgot password?</Link>
            </div>
            {showError && error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center">
                <span className="flex-1 font-semibold">{error}</span>
                <button
                  className="ml-4 text-xl font-bold text-red-400 hover:text-red-700 focus:outline-none"
                  onClick={() => setShowError(false)}
                  aria-label="Close error popup"
                >
                  ×
                </button>
              </div>
            )}
            <button
              className="mt-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition text-lg"
              type="submit"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Registration (Sign Up) Component
export function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setShowError(false);
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setError('Invalid credentials');
      setShowError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900">
      <div className="w-full max-w-4xl bg-slate-900 rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel */}
        <div className="hidden md:block w-1/2 relative h-full">
          <img
            src={PLACEHOLDER_IMG}
            alt="Scenic Goa Guest House"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-8">
            <div className="text-white text-2xl font-bold drop-shadow-lg">Government Guest House Booking</div>
          </div>
        </div>
        {/* Right Panel (Form) */}
        <div className="flex-1 flex flex-col justify-center p-8 bg-slate-900">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Create an account</h2>
          <div className="text-slate-300 mb-8 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:underline">Log in</Link>
          </div>
          <button
            className="w-full mb-6 px-6 py-3 bg-white text-gray-700 font-medium rounded-lg shadow flex items-center justify-center gap-3 border border-gray-300 hover:bg-gray-50 transition"
            onClick={handleGoogle}
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <g>
                <path fill="#4285F4" d="M21.805 10.023h-9.765v3.977h5.617c-.242 1.242-1.484 3.648-5.617 3.648-3.375 0-6.125-2.789-6.125-6.148s2.75-6.148 6.125-6.148c1.922 0 3.211.82 3.953 1.523l2.703-2.633c-1.664-1.547-3.828-2.5-6.656-2.5-5.523 0-10 4.477-10 10s4.477 10 10 10c5.742 0 9.547-4.023 9.547-9.703 0-.648-.07-1.148-.156-1.617z"/>
                <path fill="#34A853" d="M3.545 7.545l3.273 2.402c.891-1.781 2.578-2.949 4.457-2.949 1.219 0 2.297.414 3.148 1.227l2.367-2.305c-1.453-1.352-3.305-2.17-5.515-2.17-3.672 0-6.75 2.484-7.867 5.795z"/>
                <path fill="#FBBC05" d="M12 22c2.484 0 4.57-.82 6.094-2.227l-2.844-2.32c-.789.555-2.242 1.188-3.25 1.188-2.5 0-4.617-1.68-5.375-3.953l-3.273 2.523c1.453 2.898 4.523 4.789 8.648 4.789z"/>
                <path fill="#EA4335" d="M21.805 10.023h-9.765v3.977h5.617c-.242 1.242-1.484 3.648-5.617 3.648-3.375 0-6.125-2.789-6.125-6.148s2.75-6.148 6.125-6.148c1.922 0 3.211.82 3.953 1.523l2.703-2.633c-1.664-1.547-3.828-2.5-6.656-2.5-5.523 0-10 4.477-10 10s4.477 10 10 10c5.742 0 9.547-4.023 9.547-9.703 0-.648-.07-1.148-.156-1.617z"/>
              </g>
            </svg>
            Sign up with Google
          </button>
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-slate-700" />
            <span className="mx-4 text-slate-400 text-sm">or</span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>
          <form className="w-full flex flex-col gap-4" onSubmit={handleSignup}>
            <div>
              <label className="block font-semibold mb-2 text-slate-200">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                className="w-full border border-slate-700 bg-slate-800 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <label className="block font-semibold mb-2 text-slate-200">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full border border-slate-700 bg-slate-800 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <span className="absolute right-3 top-10 text-slate-400">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/><path d="M22 6l-10 7L2 6"/></svg>
              </span>
            </div>
            <div className="relative">
              <label className="block font-semibold mb-2 text-slate-200">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                className="w-full border border-slate-700 bg-slate-800 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-10 text-slate-400 hover:text-blue-400"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>
                ) : (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.77 21.77 0 0 1 5.06-7.94M1 1l22 22"/></svg>
                )}
              </button>
            </div>
            {showError && error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg flex items-center">
                <span className="flex-1 font-semibold">{error}</span>
                <button
                  className="ml-4 text-xl font-bold text-red-400 hover:text-red-700 focus:outline-none"
                  onClick={() => setShowError(false)}
                  aria-label="Close error popup"
                >
                  ×
                </button>
              </div>
            )}
            <button
              className="mt-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition text-lg"
              type="submit"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login; 