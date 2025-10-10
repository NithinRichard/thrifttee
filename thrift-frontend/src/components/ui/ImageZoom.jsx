import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ImageZoom = ({ src, alt, className = '' }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const imageRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!imageRef.current || !isZoomed) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <>
      <div className={`relative overflow-hidden rounded-lg ${className}`}>
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className={`w-full h-full object-cover cursor-zoom-in transition-transform duration-200 ${
            isZoomed ? 'scale-150' : 'scale-100'
          }`}
          style={{
            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
          }}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={toggleFullscreen}
        />

        {/* Zoom Icon */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full opacity-0 hover:opacity-100 transition-opacity">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Zoom Hint */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm opacity-0 hover:opacity-100 transition-opacity">
          Click to zoom • Hover for detail
        </div>
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-90 z-[100] flex items-center justify-center p-4"
              onClick={toggleFullscreen}
            >
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-[101]"
                onClick={toggleFullscreen}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Fullscreen Image */}
              <motion.img
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                src={src}
                alt={alt}
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ImageZoom;