import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import API from "../services/api";
import CategoryFilter from "../components/common/CategoryFilter";

// Fix Leaflet marker icons (required for react-leaflet)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Tamil Nadu center coordinates
const TAMIL_NADU_CENTER = [11.1271, 78.6569];
const ZOOM_LEVEL = 8;

export default function Map() {
  const [complaints, setComplaints] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const query = selectedCategory !== "all" ? `?category=${selectedCategory}` : "";
        const response = await API.get(`/complaints${query}`);
        setComplaints(response.data);
      } catch (err) {
        console.error("Error fetching complaints for map:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [selectedCategory]);

  // Generate coordinates based on complaint data (with randomness for demo)
  const getCoordinates = (complaint, index) => {
    // If complaint has lat/lng, use them
    if (complaint.location?.lat && complaint.location?.lng) {
      return {
        lat: complaint.location.lat,
        lng: complaint.location.lng,
      };
    }

    // Otherwise, scatter points across Tamil Nadu with some randomness
    // Tamil Nadu bounds approximately: lat 8-13, lng 77-80
    const lat = 11.1271 + (Math.random() - 0.5) * 4;
    const lng = 78.6569 + (Math.random() - 0.5) * 3;

    return { lat, lng };
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      pothole: "#ff6b6b",
      garbage: "#feca57",
      streetlight: "#48dbfb",
      water: "#1dd1a1",
      parking: "#ee5a6f",
      dumping: "#c44569",
      other: "#95a5a6",
    };
    return colorMap[category] || "#95a5a6";
  };

  const createCustomIcon = (category) => {
    return L.divIcon({
      html: `<div style="background-color: ${getCategoryColor(category)}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">📍</div>`,
      iconSize: [30, 30],
      className: "custom-marker",
    });
  };

  return (
    <div className="flex flex-col h-screen pb-24">
      {/* Filter Bar */}
      <div className="bg-white shadow p-4 z-10">
        <CategoryFilter selectedCategory={selectedCategory} onSelect={setSelectedCategory} />
        {loading && <p className="text-xs text-gray-500 mt-2">Loading complaints...</p>}
      </div>

      {/* Map Container */}
      <div className="flex-1 w-full">
        <MapContainer
          center={TAMIL_NADU_CENTER}
          zoom={ZOOM_LEVEL}
          style={{ width: "100%", height: "100%" }}
          className="rounded-lg"
        >
          {/* OpenStreetMap Tile Layer */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {/* Markers for Complaints */}
          {complaints.map((complaint, index) => {
            const coords = getCoordinates(complaint, index);
            return (
              <Marker
                key={complaint._id}
                position={[coords.lat, coords.lng]}
                icon={createCustomIcon(complaint.category)}
              >
                <Popup className="custom-popup">
                  <div className="w-48">
                    <h3 className="font-semibold text-sm mb-1">{complaint.title}</h3>
                    <p className="text-xs text-gray-700 mb-2">{complaint.description.slice(0, 100)}...</p>

                    <div className="flex flex-col gap-1 text-xs mb-2">
                      {complaint.location?.address && (
                        <div>
                          <span className="font-semibold">📍 Location:</span> {complaint.location.address}
                        </div>
                      )}

                      <div>
                        <span className="font-semibold">Category:</span>{" "}
                        <span className="capitalize">{complaint.category}</span>
                      </div>

                      <div>
                        <span className="font-semibold">Status:</span>{" "}
                        <span
                          className={`px-2 py-0.5 rounded-full text-white ${
                            complaint.status === "submitted"
                              ? "bg-yellow-500"
                              : complaint.status === "in_progress"
                              ? "bg-blue-500"
                              : "bg-green-500"
                          }`}
                        >
                          {complaint.status}
                        </span>
                      </div>

                      {complaint.severity && (
                        <div>
                          <span className="font-semibold">Severity:</span> {complaint.severity}/10
                        </div>
                      )}
                    </div>

                    {complaint.media && complaint.media.length > 0 && (
                      <div className="text-xs text-blue-600">
                        📷 {complaint.media.length} attachment(s)
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* No Data Message */}
      {!loading && complaints.length === 0 && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow">
          <p className="text-gray-600 text-sm">No complaints in this category</p>
        </div>
      )}
    </div>
  );
}
