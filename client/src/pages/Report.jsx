import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

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

    // Create previews
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

      // Create FormData for multipart/form-data
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("category", formData.category || "");

      // Include location with lat/lng if available
      const location = {
        address: formData.address || "Not specified",
        lat: formData.latitude || null,
        lng: formData.longitude || null,
      };
      submitData.append("location", JSON.stringify(location));

      // Add media files
      mediaFiles.forEach((file) => {
        submitData.append("media", file);
      });

      const response = await API.post("/complaints", submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Complaint submitted successfully:", response.data);

      // Success
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

      // Redirect after 2 seconds
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
    <div className="p-4 pb-24 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-2 text-gray-900">Report an Issue</h1>
      <p className="text-gray-600 mb-6">Help improve your community by reporting civic issues</p>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-800 font-semibold">✓ Report submitted successfully!</p>
          <p className="text-green-700 text-sm mt-1">Redirecting to home...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-5">
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
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
            rows="5"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
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
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          >
            <option value="">Auto-Detect</option>
            <option value="pothole">🕳️ Pothole</option>
            <option value="garbage">🗑️ Roadside Garbage</option>
            <option value="streetlight">💡 Broken Streetlight</option>
            <option value="water">💧 Water Logging</option>
            <option value="parking">🚗 Illegal Parking</option>
            <option value="dumping">🚫 Illegal Dumping</option>
            <option value="other">📌 Other</option>
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
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={locatingUser}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition whitespace-nowrap"
            >
              {locatingUser ? "📍 Locating..." : "📍 Use My Location"}
            </button>
          </div>

          {/* Location Status Display */}
          {(formData.latitude !== null || formData.longitude !== null) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <p className="text-blue-900 font-semibold">✓ Location Detected</p>
              <p className="text-blue-700 text-xs mt-1">
                Latitude: {formData.latitude?.toFixed(4)} | Longitude: {formData.longitude?.toFixed(4)}
              </p>
            </div>
          )}
        </div>

        {/* Media Upload */}
        <div>
          <label htmlFor="media" className="block text-sm font-semibold text-gray-900 mb-2">
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
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition flex flex-col items-center gap-2"
            >
              <span className="text-2xl">📸 📹</span>
              <span className="text-sm font-medium text-gray-700">
                Click to upload or drag and drop
              </span>
              <span className="text-xs text-gray-500">PNG, JPG, MP4, MOV, etc.</span>
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
                      className="w-full h-24 object-cover rounded-lg border border-gray-300"
                    />
                  ) : (
                    <video
                      src={preview.src}
                      className="w-full h-24 object-cover rounded-lg border border-gray-300"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                  <p className="text-xs text-gray-600 mt-1 truncate">{preview.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition duration-200 mt-6"
        >
          {loading ? "Submitting..." : "Submit Report"}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Fields marked with * are required
        </p>
      </form>
    </div>
  );
}
