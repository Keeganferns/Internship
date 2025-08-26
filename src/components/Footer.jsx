import React, { useEffect, useRef } from 'react';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

function useFadeInOnScroll() {
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new window.IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
          }
        });
      },
      { threshold: 0.1 }
    );
    ref.current.classList.add('opacity-0', 'translate-y-8');
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function Footer() {
  const fadeRef = useFadeInOnScroll();
  return (
    <footer ref={fadeRef} className="mt-16 bg-gradient-to-r from-blue-100 via-pink-100 to-green-100 py-8 px-4 text-center rounded-t-3xl shadow-2xl transition-all duration-700 opacity-0 translate-y-8">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-lg font-bold text-blue-700 font-serif">Gov Stay &copy; {new Date().getFullYear()}</div>
        <div className="flex gap-6 justify-center">
          <a
            href="https://www.facebook.com/officialgoatourism/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-pink-500 transition-colors text-2xl"
          >
            <FaFacebook />
          </a>
          <a
            href="https://x.com/TourismGoa"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-pink-500 transition-colors text-2xl"
          >
            <FaTwitter />
          </a>
          <a
            href="https://www.instagram.com/goatourism/?hl=en"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-pink-500 transition-colors text-2xl"
          >
            <FaInstagram />
          </a>
        </div>
        <div className="text-gray-500 text-sm">Department of Tourism, Government of Goa</div>
      </div>
    </footer>
  );
} 