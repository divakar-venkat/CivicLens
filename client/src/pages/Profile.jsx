import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { calculateSLA } from "../utils/slaHelper";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("reports");
  const [userSettings, setUserSettings] = useState({
    username: user?.name || "User",
    language: "English",
    theme: "light",
  });

  // Fetch user's complaints
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const response = await API.get("/complaints");
        // Filter complaints by current user's ID
        const userComplaints = response.data.filter(
          (complaint) => complaint.createdBy === user?.id
        );
        setComplaints(userComplaints);
      } catch (err) {
        console.error("Error fetching complaints:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchComplaints();
    }
  }, [user?.id]);

  // Calculate user stats
  const stats = {
    totalReports: complaints.length,
    totalUpvotes: complaints.reduce((sum, c) => sum + (c.upvotes || 0), 0),
    totalResolved: complaints.filter((c) => c.status === "resolved").length,
  };

  // Calculate badges
  const badges = getBadges(stats);

  const handleSettingChange = (key, value) => {
    setUserSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-4 pb-24">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-24"></div>
        <div className="px-4 pb-4 -mt-12 relative z-10">
          <div className="flex items-end gap-4 mb-4">
            <div className="w-24 h-24 bg-white rounded-lg shadow-lg flex items-center justify-center text-5xl border-4 border-white">
              {user?.avatar || "👤"}
            </div>
            <div className="pb-2">
              <h1 className="text-2xl font-bold text-gray-900">{user?.name || "User"}</h1>
              <p className="text-gray-600 text-sm">📍 {user?.email || "Not specified"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard
          icon="📋"
          label="Reports"
          value={stats.totalReports}
          color="blue"
        />
        <StatCard
          icon="👍"
          label="Upvotes"
          value={stats.totalUpvotes}
          color="purple"
        />
        <StatCard
          icon="✅"
          label="Resolved"
          value={stats.totalResolved}
          color="green"
        />
      </div>

      {/* Badges Section */}
      {badges.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">🏆 Achievements</h3>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 flex items-center gap-2"
              >
                <span>{badge.icon}</span>
                <span>{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow mb-6 sticky top-4 z-20">
        <div className="flex border-b">
          <TabButton
            icon="📄"
            label="My Reports"
            active={activeTab === "reports"}
            onClick={() => setActiveTab("reports")}
          />
          <TabButton
            icon="⚙️"
            label="Settings"
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
          />
          <TabButton
            icon="🧪"
            label="Tech Info"
            active={activeTab === "tech"}
            onClick={() => setActiveTab("tech")}
          />
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "reports" && (
        <MyReportsTab complaints={complaints} loading={loading} />
      )}
      {activeTab === "settings" && (
        <SettingsTab settings={userSettings} onSettingChange={handleSettingChange} />
      )}
      {activeTab === "tech" && <TechInfoTab />}
    </div>
  );
}

// ============================================
// STAT CARD COMPONENT
// ============================================
function StatCard({ icon, label, value, color }) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200",
    purple: "bg-purple-50 border-purple-200",
    green: "bg-green-50 border-green-200",
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-3 text-center`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-600 mt-1">{label}</div>
    </div>
  );
}

// ============================================
// TAB BUTTON COMPONENT
// ============================================
function TabButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-4 py-3 font-semibold transition flex items-center justify-center gap-2 ${
        active
          ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50"
          : "text-gray-600 hover:text-gray-900"
      }`}
    >
      <span>{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// ============================================
// MY REPORTS TAB
// ============================================
function MyReportsTab({ complaints, loading }) {
  const [sortBy, setSortBy] = useState("newest");

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading your reports...</p>
      </div>
    );
  }

  // Sort complaints
  let sorted = [...complaints];
  if (sortBy === "newest") {
    sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortBy === "oldest") {
    sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (sortBy === "upvotes") {
    sorted.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
  }

  return (
    <div className="space-y-4">
      {/* Sort Controls */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Sort by:
        </label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="newest">🕒 Newest First</option>
          <option value="oldest">🕖 Oldest First</option>
          <option value="upvotes">👍 Most Upvotes</option>
        </select>
      </div>

      {/* Reports List */}
      {sorted.length > 0 ? (
        sorted.map((complaint) => (
          <ReportCard key={complaint._id} complaint={complaint} />
        ))
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500 text-lg">No reports yet</p>
          <p className="text-gray-400 text-sm mt-2">
            Start by reporting an issue on the Report page
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================
// REPORT CARD COMPONENT (FOR PROFILE)
// ============================================
function ReportCard({ complaint }) {
  const categoryEmojis = {
    pothole: "🕳️",
    garbage: "🗑️",
    streetlight: "💡",
    water: "💧",
    parking: "🚗",
    dumping: "🚫",
    other: "📌",
  };

  const statusColors = {
    submitted: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    resolved: "bg-green-100 text-green-800",
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
  };

  const slaInfo = calculateSLA(
    complaint.createdAt,
    complaint.resolvedAt,
    complaint.status
  );

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
      {/* Media Preview */}
      {complaint.media && complaint.media.length > 0 && (
        <div className="w-full h-40 bg-gray-200 overflow-hidden relative">
          <img
            src={`data:image/jpeg;base64,${complaint.media[0]}`}
            alt="complaint"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback for videos
              e.target.style.display = "none";
              const parent = e.target.parentElement;
              parent.innerHTML =
                '<div class="w-full h-full flex items-center justify-center bg-gray-300"><span class="text-4xl">🎬</span></div>';
            }}
          />
          {complaint.media.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-semibold">
              +{complaint.media.length - 1}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-semibold text-gray-900 flex-1 line-clamp-2">
            {complaint.title}
          </h3>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {getTimeAgo(complaint.createdAt)}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {complaint.description}
        </p>

        {complaint.location?.address && (
          <p className="text-sm text-gray-600 mb-3">
            📍 {complaint.location.address}
          </p>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColors[complaint.status]}`}
          >
            {complaint.status.replace("_", " ")}
          </span>

          {complaint.category && (
            <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {categoryEmojis[complaint.category]} {complaint.category}
            </span>
          )}

          <span
            className={`text-xs font-semibold px-2 py-1 rounded-full ${
              slaInfo.isMet
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {slaInfo.text}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-600 border-t pt-3">
          <span>👍 {complaint.upvotes || 0} upvotes</span>
          <span>💬 {complaint.comments?.length || 0} comments</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SETTINGS TAB
// ============================================
function SettingsTab({ settings, onSettingChange }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="space-y-4">
      {/* Username Setting */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Username
        </label>
        <input
          type="text"
          value={settings.username}
          onChange={(e) => onSettingChange("username", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-2">
          Note: Changes saved locally only (no backend persistence)
        </p>
      </div>

      {/* Language Setting */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Language 🌍
        </label>
        <select
          value={settings.language}
          onChange={(e) => onSettingChange("language", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="English">🇺🇸 English</option>
          <option value="Tamil">🇮🇳 Tamil (தமிழ்)</option>
          <option value="Hindi">🇮🇳 Hindi (हिन्दी)</option>
          <option value="Spanish">🇪🇸 Spanish (Español)</option>
        </select>
      </div>

      {/* Theme Setting */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Theme 🎨
        </label>
        <select
          value={settings.theme}
          onChange={(e) => onSettingChange("theme", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="light">☀️ Light</option>
          <option value="dark">🌙 Dark</option>
          <option value="auto">🔄 Auto</option>
        </select>
      </div>

      {/* Notification Setting */}
      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Notifications 🔔
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm text-gray-700">Push notifications</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm text-gray-700">Email updates</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-sm text-gray-700">Weekly digest</span>
          </label>
        </div>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg transition flex items-center justify-center gap-2"
      >
        <span>🚪</span>
        <span>Logout</span>
      </button>

      {/* About Section */}
      <div className="bg-white rounded-lg shadow p-4 text-center">
        <p className="text-xs text-gray-600">
          CivicLens v1.0 | AI-Powered Civic Issue Tracker
        </p>
        <p className="text-xs text-gray-500 mt-1">
          © 2024 CivicLens. All rights reserved.
        </p>
      </div>
    </div>
  );
}

// ============================================
// TECH INFO TAB
// ============================================
function TechInfoTab() {
  const techStack = [
    {
      icon: "⚛️",
      label: "Frontend Framework",
      description: "React + Vite + Tailwind CSS",
    },
    {
      icon: "🖥️",
      label: "Backend",
      description: "Express.js + MongoDB",
    },
    {
      icon: "🤖",
      label: "AI Classification",
      description: "Smart category & severity detection",
    },
    {
      icon: "🗺️",
      label: "Location Tracking",
      description: "Leaflet maps + Geolocation API",
    },
    {
      icon: "📸",
      label: "Media Handling",
      description: "Multi-file upload (images & videos)",
    },
    {
      icon: "🔍",
      label: "Filtering",
      description: "Category, status, severity filters",
    },
    {
      icon: "👍",
      label: "Community Features",
      description: "Upvotes, comments, SLA tracking",
    },
    {
      icon: "📊",
      label: "Real-time Updates",
      description: "Instant status & upvote sync",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🧠 Technology Stack
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {techStack.map((item, idx) => (
            <div
              key={idx}
              className="border rounded-lg p-3 hover:shadow-md transition"
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <h4 className="font-semibold text-gray-900 text-sm">
                {item.label}
              </h4>
              <p className="text-xs text-gray-600 mt-1">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features List */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          ✨ Key Features
        </h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span>
              <strong>AI-Powered:</strong> Automatic issue classification &
              severity detection
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span>
              <strong>Media Support:</strong> Upload images and videos with
              base64 encoding
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span>
              <strong>Map Integration:</strong> Visual complaint tracking on
              interactive maps
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span>
              <strong>Community Engagement:</strong> Upvotes, comments, and
              real-time updates
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span>
              <strong>Admin Dashboard:</strong> Manage complaints & assign to
              departments
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span>
              <strong>SLA Tracking:</strong> 7-day resolution deadline tracking
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span>
              <strong>Mobile Responsive:</strong> Works seamlessly on all
              devices
            </span>
          </li>
        </ul>
      </div>

      {/* API Endpoints */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🔌 API Endpoints
        </h3>
        <div className="space-y-2 text-xs font-mono bg-gray-50 p-3 rounded">
          <div>
            <span className="text-green-600 font-bold">GET</span>{" "}
            <span className="text-gray-700">/api/complaints</span>
          </div>
          <div>
            <span className="text-blue-600 font-bold">POST</span>{" "}
            <span className="text-gray-700">/api/complaints</span>
          </div>
          <div>
            <span className="text-yellow-600 font-bold">PUT</span>{" "}
            <span className="text-gray-700">/api/complaints/:id</span>
          </div>
          <div>
            <span className="text-purple-600 font-bold">PATCH</span>{" "}
            <span className="text-gray-700">/api/complaints/:id/upvote</span>
          </div>
          <div>
            <span className="text-orange-600 font-bold">POST</span>{" "}
            <span className="text-gray-700">/api/complaints/:id/comment</span>
          </div>
        </div>
      </div>

      {/* Database Schema */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          💾 Database Schema
        </h3>
        <p className="text-xs text-gray-600 mb-2">Complaint Model includes:</p>
        <ul className="text-xs space-y-1 text-gray-700">
          <li>• title, description, location (lat, lng, address)</li>
          <li>• media (base64 encoded images/videos)</li>
          <li>• category (8 types), severity (1-10), status (3 states)</li>
          <li>• upvotes, comments, department assignment</li>
          <li>• timestamps (createdAt, updatedAt, resolvedAt)</li>
        </ul>
      </div>
    </div>
  );
}

// ============================================
// UTILITY: GET BADGES
// ============================================
function getBadges(stats) {
  const badges = [];

  if (stats.totalReports >= 5) {
    badges.push({
      icon: "🥇",
      label: "Active Reporter",
    });
  }

  if (stats.totalResolved >= 3) {
    badges.push({
      icon: "🧹",
      label: "Clean City Hero",
    });
  }

  if (stats.totalUpvotes >= 10) {
    badges.push({
      icon: "🔥",
      label: "Top Contributor",
    });
  }

  return badges;
}
