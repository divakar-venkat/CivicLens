import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { calculateSLA } from "../utils/slaHelper";
import { useAuth } from "../context/AuthContext";
import MediaCarousel from "../components/common/MediaCarousel";

// SVG Icons
function FileIcon() {
  return (
    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function ThumbsUpIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.646 7.289a2 2 0 01-1.789 1.106H7a2 2 0 01-2-2v-8a2 2 0 012-2h3.5a2 2 0 002-2V5a2 2 0 012-2h.5a2 2 0 012 2v7z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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

function ClockIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ChatBubbleIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

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

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const response = await API.get("/complaints");
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

  const stats = {
    totalReports: complaints.length,
    totalUpvotes: complaints.reduce((sum, c) => sum + (c.upvotes || 0), 0),
    totalResolved: complaints.filter((c) => c.status === "resolved").length,
  };

  const badges = getBadges(stats);

  const handleSettingChange = (key, value) => {
    setUserSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0 text-3xl">
              {user?.avatar || "👤"}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900">{user?.name || "User"}</h1>
              <p className="text-sm text-gray-600 mt-1">{user?.email || "Not specified"}</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <div className="flex justify-center mb-2">
              <FileIcon />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalReports}</p>
            <p className="text-sm text-gray-600 mt-1">Reports</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <div className="flex justify-center mb-2">
              <ThumbsUpIcon />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalUpvotes}</p>
            <p className="text-sm text-gray-600 mt-1">Upvotes</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <div className="flex justify-center mb-2">
              <CheckIcon />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalResolved}</p>
            <p className="text-sm text-gray-600 mt-1">Resolved</p>
          </div>
        </div>

        {/* Badges Section */}
        {badges.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
              Achievements
            </h3>
            <div className="flex flex-wrap gap-2">
              {badges.map((badge, idx) => (
                <div
                  key={idx}
                  className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm font-medium text-blue-700"
                >
                  {badge.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-t-xl shadow-sm border border-gray-200 fixed top-20 left-0 right-0 z-40 border-b">
          <div className="max-w-5xl mx-auto px-4 flex border-b border-gray-200">
            <TabButton
              label="My Reports"
              active={activeTab === "reports"}
              onClick={() => setActiveTab("reports")}
            />
            <TabButton
              label="Settings"
              active={activeTab === "settings"}
              onClick={() => setActiveTab("settings")}
            />
            <TabButton
              label="Tech Info"
              active={activeTab === "tech"}
              onClick={() => setActiveTab("tech")}
            />
          </div>
        </div>

        {/* Tab Content - Add top padding to account for fixed tab bar */}
        <div className="mt-16">
          {activeTab === "reports" && (
            <MyReportsTab complaints={complaints} loading={loading} />
          )}
          {activeTab === "settings" && (
            <SettingsTab settings={userSettings} onSettingChange={handleSettingChange} />
          )}
          {activeTab === "tech" && <TechInfoTab />}
        </div>
      </div>
    </div>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
        active
          ? "border-blue-600 text-blue-600 bg-blue-50"
          : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
      }`}
    >
      {label}
    </button>
  );
}

function MyReportsTab({ complaints, loading }) {
  const [sortBy, setSortBy] = useState("newest");

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading your reports...</p>
      </div>
    );
  }

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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="upvotes">Most Upvotes</option>
        </select>
      </div>

      {sorted.length > 0 ? (
        sorted.map((complaint) => (
          <ReportCard key={complaint._id} complaint={complaint} />
        ))
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-600 font-medium">No reports yet</p>
          <p className="text-gray-500 text-sm mt-1">
            Start by reporting an issue on the Report page
          </p>
        </div>
      )}
    </div>
  );
}

function ReportCard({ complaint }) {
  const [showComments, setShowComments] = useState(false);
  const statusColors = {
    submitted: "bg-orange-50 text-orange-700 border border-orange-100",
    in_progress: "bg-blue-50 text-blue-700 border border-blue-100",
    resolved: "bg-green-50 text-green-700 border border-green-100",
  };

  const categoryLabels = {
    pothole: "Pothole",
    garbage: "Garbage",
    streetlight: "Streetlight",
    water: "Water",
    parking: "Parking",
    dumping: "Dumping",
    other: "Other",
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
      {/* Media Section with MediaCarousel */}
      {complaint.media && complaint.media.length > 0 ? (
        <MediaCarousel media={complaint.media} />
      ) : (
        <div className="w-full h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-xl flex flex-col items-center justify-center border-b border-gray-200">
          <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-gray-500 text-sm font-medium">No media available</span>
        </div>
      )}

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-semibold text-gray-900 line-clamp-2 flex-1">
            {complaint.title}
          </h3>
          <span className="text-xs text-gray-500 whitespace-nowrap flex items-center gap-1">
            <ClockIcon />
            {getTimeAgo(complaint.createdAt)}
          </span>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2">
          {complaint.description}
        </p>

        {complaint.location?.address && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <LocationIcon />
            <span className="truncate">{complaint.location.address}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-2 items-center">
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${statusColors[complaint.status]}`}>
            {complaint.status.replace("_", " ")}
          </span>

          {complaint.category && (
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              {categoryLabels[complaint.category]}
            </span>
          )}

          {complaint.severity && (
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
              Severity {complaint.severity}/10
            </span>
          )}

          <span
            className={`text-xs font-medium px-3 py-1 rounded-full ${
              slaInfo.isMet
                ? "bg-green-50 text-green-700 border border-green-100"
                : "bg-red-50 text-red-700 border border-red-100"
            }`}
          >
            {slaInfo.text}
          </span>
        </div>

        <div className="flex gap-4 pt-2 border-t border-gray-200">
          <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <ThumbsUpIcon />
            {complaint.upvotes || 0}
          </span>
          <button
            onClick={() => setShowComments(!showComments)}
            className="text-sm font-medium text-gray-700 flex items-center gap-2 hover:text-blue-600 transition cursor-pointer"
          >
            <ChatBubbleIcon />
            {complaint.comments?.length || 0}
          </button>
        </div>
      </div>

      {/* Comments Section - Expandable */}
      {showComments && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="space-y-2">
            {complaint.comments && complaint.comments.length > 0 ? (
              complaint.comments.map((comment, idx) => (
                <div key={idx} className="bg-white rounded p-3 border border-gray-200">
                  <p className="text-sm text-gray-900">{comment.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-3">No comments yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsTab({ settings, onSettingChange }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Username
        </label>
        <input
          type="text"
          value={settings.username}
          onChange={(e) => onSettingChange("username", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
        <p className="text-xs text-gray-500 mt-2">Changes saved locally only</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Language
        </label>
        <select
          value={settings.language}
          onChange={(e) => onSettingChange("language", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="English">English</option>
          <option value="Tamil">Tamil</option>
          <option value="Hindi">Hindi</option>
          <option value="Spanish">Spanish</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Theme
        </label>
        <select
          value={settings.theme}
          onChange={(e) => onSettingChange("theme", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="auto">Auto</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          Notifications
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm text-gray-700">Push notifications</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm text-gray-700">Email updates</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-sm text-gray-700">Weekly digest</span>
          </label>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="w-full px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 font-semibold rounded-lg transition border border-red-200"
      >
        Logout
      </button>
    </div>
  );
}

function TechInfoTab() {
  const techStack = [
    { label: "Frontend", description: "React + Vite + Tailwind CSS" },
    { label: "Backend", description: "Express.js + MongoDB" },
    { label: "AI", description: "Smart classification & detection" },
    { label: "Maps", description: "Leaflet + Geolocation API" },
    { label: "Media", description: "Multi-file upload support" },
    { label: "Filtering", description: "Advanced search & filters" },
    { label: "Community", description: "Upvotes, comments, SLA" },
    { label: "Real-time", description: "Instant sync updates" },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Technology Stack</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {techStack.map((item, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-3">
              <h4 className="font-semibold text-gray-900 text-sm">{item.label}</h4>
              <p className="text-xs text-gray-600 mt-1">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Key Features</h3>
        <ul className="space-y-2 text-sm">
          <li className="text-gray-700">AI-powered category & severity detection</li>
          <li className="text-gray-700">Multi-file media upload with base64 encoding</li>
          <li className="text-gray-700">Interactive map visualization with heatmap</li>
          <li className="text-gray-700">Community features: upvotes, comments, SLA tracking</li>
          <li className="text-gray-700">Admin dashboard for complaint management</li>
          <li className="text-gray-700">Role-based access control and authentication</li>
          <li className="text-gray-700">Mobile responsive design</li>
        </ul>
      </div>
    </div>
  );
}

function getBadges(stats) {
  const badges = [];

  if (stats.totalReports >= 5) {
    badges.push({ label: "Active Reporter (5+ reports)" });
  }

  if (stats.totalResolved >= 3) {
    badges.push({ label: "Clean City Hero (3+ resolved)" });
  }

  if (stats.totalUpvotes >= 10) {
    badges.push({ label: "Top Contributor (10+ upvotes)" });
  }

  return badges;
}
