import { useState, useRef } from "react";

export default function MediaCarousel({ media }) {
  const [current, setCurrent] = useState(0);
  const [mediaTypes, setMediaTypes] = useState({});
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  // Show placeholder if no media
  if (!media || media.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-t-xl flex flex-col items-center justify-center border-b border-gray-200">
        <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-gray-500 text-sm font-medium">No media available</span>
      </div>
    );
  }

  const item = media[current];
  const imgSrc = `data:image/jpeg;base64,${item}`;
  const videoSrc = `data:video/mp4;base64,${item}`;
  const isVideo = mediaTypes[current] === "video";

  const handleImageError = () => {
    setMediaTypes((prev) => ({ ...prev, [current]: "video" }));
  };

  const handleVideoError = () => {
    setMediaTypes((prev) => ({ ...prev, [current]: "image" }));
  };

  const goToPrevious = () => {
    setCurrent((prev) => (prev - 1 + media.length) % media.length);
  };

  const goToNext = () => {
    setCurrent((prev) => (prev + 1) % media.length);
  };

  // Swipe/Drag handlers
  const handleMouseDown = (e) => {
    if (media.length <= 1) return;
    setIsDragging(true);
    setStartX(e.clientX || e.touches?.[0]?.clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || media.length <= 1) return;
  };

  const handleMouseUp = (e) => {
    if (!isDragging || media.length <= 1) {
      setIsDragging(false);
      return;
    }

    const endX = e.clientX || e.changedTouches?.[0]?.clientX;
    const diff = startX - endX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }

    setIsDragging(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-64 bg-black rounded-t-xl overflow-hidden cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      onTouchMove={handleMouseMove}
    >
      {/* Media Display */}
      {isVideo ? (
        <video
          src={videoSrc}
          controls
          onError={handleVideoError}
          className="w-full h-full object-cover pointer-events-none"
        />
      ) : (
        <img
          src={imgSrc}
          alt="complaint media"
          onError={handleImageError}
          className="w-full h-full object-cover pointer-events-none select-none"
          draggable={false}
        />
      )}

      {/* Counter Badge */}
      {media.length > 1 && (
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs font-semibold px-3 py-1 rounded-full pointer-events-none">
          {current + 1} / {media.length}
        </div>
      )}

      {/* Dot Indicators (No buttons, just dots for pagination) */}
      {media.length > 1 && (
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1.5 pointer-events-auto">
          {media.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-2 h-2 rounded-full transition ${
                index === current ? "bg-white" : "bg-white/50"
              }`}
              title={`Image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Swipe hint for single image */}
      {media.length > 1 && (
        <div className="absolute inset-0 flex items-center justify-between opacity-0 pointer-events-none">
          {/* Hint that you can swipe */}
        </div>
      )}
    </div>
  );
}
