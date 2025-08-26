import React, { useRef, useEffect } from 'react';

const timeline = [
  {
    title: 'Goa Bhavan',
    date: 'Established 1980',
    description: 'Goa Bhavan serves as a prestigious guest house for Goan officials and visitors in Delhi. It offers premium accommodation, conference facilities, and a taste of Goan hospitality in the heart of the capital.',
    color: 'bg-blue-500',
    image: 'https://i.postimg.cc/nzs1GG2c/goabhavanpic1.jpg',
  },
  {
    title: 'Goa Sadan',
    date: 'Established 1995',
    description: 'Goa Sadan is known for its modern amenities and comfortable stay for government officials and tourists. Located in a prime area, it provides easy access to major landmarks and a serene environment.',
    color: 'bg-pink-500',
    image: ' https://i.postimg.cc/RhyQY6PQ/goaniwas2.jpg',
  },
  {
    title: 'Goa Niwas',
    date: 'Established 2005',
    description: 'Goa Niwas is a boutique guest house offering personalized service and vibrant interiors. It is a preferred choice for both official and private visitors seeking a homely atmosphere.',
    color: 'bg-green-500',
    image: 'https://i.postimg.cc/d0YnvCJ5/goaniwas1.jpg',
  },
];

function getConnector(idx, len, color) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="flex items-center text-3xl font-mono text-gray-400 select-none font-bold">
        <span>{'<-'}</span>
        <span className={`mx-3 w-8 h-8 ${color} rounded-full border-4 border-white shadow`} />
      </div>
    </div>
  );
}

function useFadeInOnScroll() {
  const ref = useRef([]);
  useEffect(() => {
    const observer = new window.IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
          }
        });
      },
      { threshold: 0.2 }
    );
    ref.current.forEach(el => {
      if (el) {
        el.classList.add('opacity-0', 'translate-y-8');
        observer.observe(el);
      }
    });
    return () => observer.disconnect();
  }, []);
  return ref;
}

export default function Info() {
  const fadeRefs = useFadeInOnScroll();
  return (
    <div className="w-full max-w-6xl mx-auto py-14 px-2">
      <h1 className="mb-14 text-4xl font-bold text-blue-700 text-center tracking-wide font-serif" style={{ fontFamily: 'Playfair Display, serif' }}>
        Our Accommodations
      </h1>
      <div className="flex flex-col gap-20 w-full">
        {timeline.map((item, idx) => (
          <div
            key={item.title}
            ref={el => (fadeRefs.current[idx] = el)}
            className="flex flex-col md:flex-row items-center w-full gap-6 md:gap-12 group transition-all duration-700 ease-out opacity-0 translate-y-8"
          >
            {/* Image Card */}
            <div className="flex-1 flex justify-center md:justify-end">
              <div className="bg-white rounded-3xl shadow-2xl flex items-center justify-center h-80 w-80 md:w-[380px] md:h-80 overflow-hidden border-2 border-gray-100 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-blue-200 hover:scale-110 hover:shadow-xl">
                <img src={item.image} alt={item.title} className="object-cover w-full h-full transition-transform duration-300 hover:scale-105" loading="lazy" />
              </div>
            </div>
            {/* Connector */}
            <div className="flex items-center justify-center h-80">
              {getConnector(idx, timeline.length, item.color)}
            </div>
            {/* Text Card */}
            <div className="flex-1 flex justify-center md:justify-start">
              <div className="bg-white rounded-3xl shadow-2xl h-80 w-full max-w-2xl flex flex-col justify-center p-12 border-2 border-gray-100 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-blue-200 hover:scale-105 hover:shadow-xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{item.title}</h2>
                <div className="text-base text-gray-500 mb-3">{item.date}</div>
                <p className="text-gray-700 text-lg leading-relaxed">{item.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 1100px) {
          .w-80, .h-80, .md\:w-\[380px\], .md\:h-80 { width: 180px !important; height: 180px !important; }
          .max-w-2xl { max-width: 100% !important; }
        }
        @media (max-width: 768px) {
          .flex-1 { flex: none !important; }
          .w-80, .h-80, .md\:w-\[380px\], .md\:h-80 { width: 120px !important; height: 120px !important; }
          .max-w-2xl { max-width: 100% !important; }
          .p-12 { padding: 1.5rem !important; }
        }
      `}</style>
    </div>
  );
}
