import { useState, useRef, useEffect } from "react";

export default function MediaCarousel({ media }) {
  const [current, setCurrent] = useState(0);
  const [mediaTypes, setMediaTypes] = useState({});
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  // Smart autoplay - play when in viewport, pause when out
  useEffect(() => {
    if (!videoRef.current || mediaTypes[current] !== "video") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !userInteracted) {
          videoRef.current?.play();
          setIsPlaying(true);
        } else {
          videoRef.current?.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [current, mediaTypes, userInteracted]);

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
    setIsPlaying(false);
    setUserInteracted(false);
  };

  const goToNext = () => {
    setCurrent((prev) => (prev + 1) % media.length);
    setIsPlaying(false);
    setUserInteracted(false);
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

  // Handle video play/pause toggle on click
  const handleVideoClick = (e) => {
    e.stopPropagation();
    setUserInteracted(true);
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
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
      {/* Media Display with smooth transition */}
      <div className="w-full h-full transition-opacity duration-300 overflow-hidden">
        {isVideo ? (
          <video
            ref={videoRef}
            src={videoSrc}
            onError={handleVideoError}
            onClick={handleVideoClick}
            autoPlay={false}
            controlsList="nopictureinpicture"
            className="w-full h-full object-cover pointer-events-auto cursor-pointer"
            style={{ display: "block" }}
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
      </div>

      {/* Counter Badge - Only show numbers, no dots */}
      {media.length > 1 && (
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs font-semibold px-3 py-1 rounded-full pointer-events-none">
          {current + 1} / {media.length}
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
