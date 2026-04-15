import { useState } from "react";

export default function MediaCarousel({ media }) {
  const [current, setCurrent] = useState(0);

  // Show placeholder if no media
  if (!media || media.length === 0) {
    return (
      <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-500">No media attached</span>
      </div>
    );
  }

  const item = media[current];
  // Media items are now plain base64 strings - assume images for display
  const src = `data:image/jpeg;base64,${item}`;

  const goToPrevious = () => {
    setCurrent((prev) => (prev - 1 + media.length) % media.length);
  };

  const goToNext = () => {
    setCurrent((prev) => (prev + 1) % media.length);
  };

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden">
      {/* Media Display */}
      <img src={src} alt="complaint media" className="w-full h-48 object-cover" />

      {/* Counter Badge */}
      {media.length > 1 && (
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs font-semibold px-3 py-1 rounded-full">
          {current + 1} / {media.length}
        </div>
      )}

      {/* Navigation Buttons */}
      {media.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full transition"
            title="Previous"
          >
            ◀
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full transition"
            title="Next"
          >
            ▶
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {media.length > 1 && (
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex gap-1">
          {media.map((_, index) => (
            <div
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-2 h-2 rounded-full cursor-pointer transition ${
                index === current ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
