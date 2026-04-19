import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

// SVG Icons
function ImageIcon() {
  return (
    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export default function Report() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    category: "",
    latitude: null,
    longitude: null,
  });
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [locatingUser, setLocatingUser] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getCurrentLocation = () => {
    setLocatingUser(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLocatingUser(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          latitude,
          longitude,
        }));
        setLocatingUser(false);
      },
      (error) => {
        let errorMsg = "Failed to get location";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "Permission denied. Please enable location access.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = "Location information is unavailable.";
        }
        setError(errorMsg);
        setLocatingUser(false);
      }
    );
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length + mediaFiles.length > 3) {
      setError("Maximum 3 files allowed");
      return;
    }

    setMediaFiles([...mediaFiles, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setMediaPreviews((prev) => [
          ...prev,
          {
            src: event.target.result,
            type: file.type,
            name: file.name,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    setError(null);
  };

  const removeMedia = (index) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!formData.title.trim() || !formData.description.trim()) {
        setError("Title and description are required");
        setLoading(false);
        return;
      }

      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("category", formData.category || "");

      const location = {
        address: formData.address || "Not specified",
        lat: formData.latitude || null,
        lng: formData.longitude || null,
      };
      submitData.append("location", JSON.stringify(location));

      mediaFiles.forEach((file) => {
        submitData.append("media", file);
      });

      const response = await API.post("/complaints", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Complaint submitted successfully:", response.data);

      setSuccess(true);
      setFormData({
        title: "",
        description: "",
        address: "",
        category: "",
        latitude: null,
        longitude: null,
      });
      setMediaFiles([]);
      setMediaPreviews([]);

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit complaint. Please try again.");
      console.error("Error submitting complaint:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 flex items-start gap-3">
            <CheckIcon />
            <div>
              <p className="text-green-900 font-semibold">Report submitted successfully!</p>
              <p className="text-green-700 text-sm mt-1">Redirecting to home...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">
          {/* Media Upload */}
          <div>
            <label htmlFor="media" className="block text-sm font-semibold text-gray-900 mb-3">
              Upload Photos/Videos (max 3 files, up to 5MB each)
            </label>
            <div className="relative">
              <input
                type="file"
                id="media"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label
                htmlFor="media"
                className="w-full px-6 py-8 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition flex flex-col items-center gap-3"
              >
                <ImageIcon />
                <div>
                  <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, MP4, MOV, etc.</p>
                </div>
              </label>
            </div>
          </div>

          {/* Media Previews */}
          {mediaPreviews.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-3">
                Selected Media ({mediaPreviews.length}/3)
              </p>
              <div className="grid grid-cols-2 gap-3">
                {mediaPreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    {preview.type.startsWith("image") ? (
                      <img
                        src={preview.src}
                        alt="preview"
                        className="w-full h-32 object-cover rounded-lg border border-gray-300"
                      />
                    ) : (
                      <video
                        src={preview.src}
                        className="w-full h-32 object-cover rounded-lg border border-gray-300"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-sm font-bold"
                    >
                      ✕
                    </button>
                    <p className="text-xs text-gray-600 mt-2 truncate">{preview.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
              Issue Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Pothole on Main Street"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Description Input */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the issue in detail..."
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-gray-900 mb-2">
              Category (optional - auto-detected if not selected)
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            >
              <option value="">Auto-Detect</option>
              <option value="pothole">Pothole</option>
              <option value="garbage">Roadside Garbage</option>
              <option value="streetlight">Broken Streetlight</option>
              <option value="water">Water Logging</option>
              <option value="parking">Illegal Parking</option>
              <option value="dumping">Illegal Dumping</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Address & Geolocation */}
          <div>
            <label htmlFor="address" className="block text-sm font-semibold text-gray-900 mb-2">
              Location / Address
            </label>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter the address or location of the issue"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={locatingUser}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-semibold rounded-lg transition whitespace-nowrap"
              >
                {locatingUser ? "Locating..." : "Use My Location"}
              </button>
            </div>

            {(formData.latitude !== null || formData.longitude !== null) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-900 text-sm font-semibold flex items-center gap-2">
                  <CheckIcon />
                  Location Detected
                </p>
                <p className="text-blue-700 text-xs mt-2">
                  Latitude: {formData.latitude?.toFixed(4)} | Longitude: {formData.longitude?.toFixed(4)}
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2.5 rounded-lg transition duration-200 mt-2"
          >
            {loading ? "Submitting..." : "Submit Report"}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Fields marked with * are required
          </p>
        </form>
      </div>
    </div>
  );
}
