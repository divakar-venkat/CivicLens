import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import API from "../services/api";
import ComplaintCard from "../components/common/ComplaintCard";
import CategoryFilter from "../components/common/CategoryFilter";

// Sort Icon
function SortIcon() {
  return (
    <svg width={16} height={16} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h5a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM14 4a1 1 0 011-1h5a1 1 0 011 1v2a1 1 0 01-1 1h-5a1 1 0 01-1-1V4zM3 14a1 1 0 011-1h5a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM14 14a1 1 0 011-1h5a1 1 0 011 1v2a1 1 0 01-1 1h-5a1 1 0 01-1-1v-2z" />
    </svg>
  );
}

// Helper function to apply filter and sort locally
function applyFilterAndSort(data, category, sort) {
  let filtered = data;

  // Apply category filter
  if (category !== "all") {
    filtered = data.filter((c) => c.category === category);
  }

  // Apply sorting
  let sorted = [...filtered];
  if (sort === "upvotes") {
    sorted.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
  } else if (sort === "severity") {
    sorted.sort((a, b) => (b.severity || 0) - (a.severity || 0));
  } else {
    sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return sorted;
}

export default function Home() {
  const [allComplaints, setAllComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const focusRef = useRef(null);
  const locationState = useLocation();

  // Fetch data only once on mount
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const response = await API.get("/complaints");
        setAllComplaints(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch complaints");
        console.error("Error fetching complaints:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  // Scroll to focused complaint when view is loaded
  useEffect(() => {
    if (locationState.state?.focusComplaintId && focusRef.current) {
      setTimeout(() => {
        focusRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  }, [locationState, allComplaints]);

  // Filter and sort locally (no API call) - instant updates, no flicker
  const complaints = applyFilterAndSort(allComplaints, selectedCategory, sortBy);

  const getSortLabel = (sort) => {
    switch (sort) {
      case "upvotes":
        return "Most Upvoted";
      case "severity":
        return "High Severity";
      default:
        return "Latest";
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Category Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <CategoryFilter selectedCategory={selectedCategory} onSelect={setSelectedCategory} />
        </div>

        {/* Sort Options */}
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <SortIcon />
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
          </div>
          <div className="flex gap-2">
            {["latest", "upvotes", "severity"].map((sort) => (
              <button
                key={sort}
                onClick={() => setSortBy(sort)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                  sortBy === sort
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {getSortLabel(sort)}
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-gray-200 h-80 animate-pulse"
              ></div>
            ))}
          </div>
        ) : (
          <>
            {/* Complaints Feed */}
            {complaints.length > 0 ? (
              <div className="space-y-4">
                {complaints.map((complaint) => (
                  <div
                    key={complaint._id}
                    ref={locationState.state?.focusComplaintId === complaint._id ? focusRef : null}
                  >
                    <ComplaintCard
                      complaint={complaint}
                    />
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 py-12 text-center">
                <p className="text-base font-medium text-gray-900">No civic issues reported yet</p>
                <p className="text-sm text-gray-600 mt-2">
                  {selectedCategory !== "all"
                    ? "No issues found in this category"
                    : "Be the first to report an issue using the Report page"}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}