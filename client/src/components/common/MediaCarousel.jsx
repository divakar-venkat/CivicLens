import { useState, useRef, useEffect } from "react";

export default function MediaCarousel({ media }) {
  const [current, setCurrent] = useState(0);
  const [mediaTypes, setMediaTypes] = useState({});
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadErrors, setLoadErrors] = useState({});

  // Detect if media is a URL or base64
  const isUrl = (str) => {
    if (!str) return false;
    return str.startsWith("http://") || str.startsWith("https://") || str.startsWith("data:");
  };

  // Optimize Cloudinary URL for performance
  const optimizeCloudinaryUrl = (url) => {
    if (!url || !url.includes("cloudinary.com")) return url;
    // Only add optimization params once, check if already optimized
    if (url.includes("/upload/f_auto")) return url; // Already optimized

    if (url.includes("/upload/")) {
      return url.replace("/upload/", "/upload/f_auto,q_auto,w_1000/");
    }
    return url;
  };

  // Detect media type from URL or try image first
  useEffect(() => {
    const item = media[current];
    if (item) {
      // If it's a URL, determine type from URL or default to image
      if (isUrl(item)) {
        // Cloudinary URLs can be both image and video, check extension or default to image
        if (item.includes("/video/") || item.includes(".mp4") || item.includes(".webm")) {
          setMediaTypes((prev) => ({ ...prev, [current]: "video" }));
        } else {
          setMediaTypes((prev) => ({ ...prev, [current]: "image" }));
        }
      }
    }
  }, [current, media]);

  // Smart autoplay - play when in viewport, pause when out
  useEffect(() => {
    if (!videoRef.current || mediaTypes[current] !== "video") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!videoRef.current) return;

        if (entry.isIntersecting) {
          // Play video with sound
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => setIsPlaying(true))
              .catch((error) => {
                // Suppress expected errors
                if (
                  error.name !== "AbortError" &&
                  error.name !== "NotAllowedError"
                ) {
                  console.warn("Video play error:", error);
                }
              });
          }
        } else {
          if (videoRef.current) {
            videoRef.current.pause();
          }
          setIsPlaying(false);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [current, mediaTypes]);

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
  // Determine if it's URL or base64
  const rawUrl = isUrl(item) ? item : `data:image/jpeg;base64,${item}`;
  const mediaSrc = isUrl(item) ? optimizeCloudinaryUrl(rawUrl) : rawUrl;
  const isVideo = mediaTypes[current] === "video";

  const handleImageError = () => {
    console.warn(`Image ${current} failed to load, trying as video`);
    setLoadErrors((prev) => ({ ...prev, [current]: "image" }));
    setMediaTypes((prev) => ({ ...prev, [current]: "video" }));
  };

  const handleVideoError = () => {
    console.warn(`Video ${current} failed to load, trying as image`);
    setLoadErrors((prev) => ({ ...prev, [current]: "video" }));
    setMediaTypes((prev) => ({ ...prev, [current]: "image" }));
  };

  const goToPrevious = () => {
    setCurrent((prev) => (prev - 1 + media.length) % media.length);
    setIsPlaying(false);
  };

  const goToNext = () => {
    setCurrent((prev) => (prev + 1) % media.length);
    setIsPlaying(false);
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

  // Prevent swipe gesture on video
  const handleVideoClick = (e) => {
    e.stopPropagation();
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
        {loadErrors[current] && mediaTypes[current] ? (
          // Show fallback if media failed to load from both image and video
          <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-600 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4v2m0 5v1m6-2a2 2 0 110-4 2 2 0 010 4zm0-6a2 2 0 110-4 2 2 0 010 4zM6 21h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <span className="text-gray-500 text-sm text-center">Media failed to load</span>
          </div>
        ) : isVideo ? (
          <video
            ref={videoRef}
            src={mediaSrc}
            onError={handleVideoError}
            onClick={handleVideoClick}
            autoPlay={true}
            muted={false}
            controlsList="nopictureinpicture"
            className="w-full h-full object-cover pointer-events-auto cursor-pointer"
            style={{ display: "block" }}
          />
        ) : (
          <img
            src={mediaSrc}
            alt="complaint media"
            onError={handleImageError}
            loading="lazy"
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
