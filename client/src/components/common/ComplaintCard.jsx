import { useState, memo } from "react";
import API from "../../services/api";
import MediaCarousel from "./MediaCarousel";
import { calculateSLA } from "../../utils/slaHelper";

// SVG Icons
function ThumbsUpIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.646 7.289a2 2 0 01-1.789 1.106H7a2 2 0 01-2-2v-8a2 2 0 012-2h3.5a2 2 0 002-2V5a2 2 0 012-2h.5a2 2 0 012 2v7z" />
    </svg>
  );
}

function ChatBubbleIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function LocationIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function ClockIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function getStatusColor(status) {
  switch (status) {
    case "submitted":
      return "bg-orange-50 text-orange-700 border border-orange-100";
    case "in_progress":
      return "bg-blue-50 text-blue-700 border border-blue-100";
    case "resolved":
      return "bg-green-50 text-green-700 border border-green-100";
    default:
      return "bg-gray-50 text-gray-700 border border-gray-100";
  }
}

function getCategoryLabel(category) {
  const labels = {
    pothole: "Pothole",
    garbage: "Garbage",
    streetlight: "Streetlight",
    water: "Water",
    parking: "Parking",
    dumping: "Dumping",
    other: "Other",
  };
  return labels[category] || category;
}

function getDepartmentLabel(department) {
  return department || "Unassigned";
}

function getTimeAgo(date) {
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
}

function ComplaintCardComponent({ complaint }) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [localComplaint, setLocalComplaint] = useState(complaint);

  const handleUpvote = async () => {
    try {
      setLoading(true);
      // Optimistic update - increment upvotes immediately
      setLocalComplaint(prev => ({
        ...prev,
        upvotes: (prev.upvotes || 0) + 1
      }));
      // Confirm with backend
      await API.patch(`/complaints/${localComplaint._id}/upvote`);
    } catch (err) {
      console.error("Error upvoting:", err);
      // Revert on error
      setLocalComplaint(complaint);
      alert("Failed to upvote. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      alert("Please enter a comment");
      return;
    }

    try {
      setLoading(true);
      const newComment = {
        text: commentText,
        createdAt: new Date().toISOString()
      };
      // Optimistic update - add comment immediately
      setLocalComplaint(prev => ({
        ...prev,
        comments: [...(prev.comments || []), newComment]
      }));
      setCommentText("");
      // Confirm with backend
      await API.post(`/complaints/${localComplaint._id}/comment`, {
        text: commentText,
      });
    } catch (err) {
      console.error("Error adding comment:", err);
      // Revert on error
      setLocalComplaint(complaint);
      alert("Failed to add comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const slaInfo = calculateSLA(
    localComplaint.createdAt,
    localComplaint.resolvedAt,
    localComplaint.status
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
      {/* Media Carousel - Full width, no extra padding */}
      {localComplaint.media && localComplaint.media.length > 0 ? (
        <MediaCarousel media={localComplaint.media} />
      ) : (
        <div className="w-full h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-xl flex flex-col items-center justify-center border-b border-gray-200">
          <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-gray-500 text-sm font-medium">No media available</span>
        </div>
      )}

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h2 className="text-base font-semibold text-gray-900 line-clamp-2">
          {localComplaint.title}
        </h2>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {localComplaint.description}
        </p>

        {/* Location & Time Row */}
        <div className="flex items-center gap-3 text-xs text-gray-500">
          {localComplaint.location?.address && (
            <div className="flex items-center gap-1 min-w-0">
              <LocationIcon />
              <span className="truncate">{localComplaint.location.address}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <ClockIcon />
            <span>{getTimeAgo(localComplaint.createdAt)}</span>
          </div>
        </div>

        {/* Badges Row */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(localComplaint.status)}`}>
            {localComplaint.status.replace("_", " ").charAt(0).toUpperCase() +
             localComplaint.status.replace("_", " ").slice(1)}
          </span>

          {localComplaint.category && (
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              {getCategoryLabel(localComplaint.category)}
            </span>
          )}

          {localComplaint.severity && (
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
              Severity {localComplaint.severity}/10
            </span>
          )}

          {localComplaint.department && (
            <span className="text-xs font-medium px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
              {getDepartmentLabel(localComplaint.department)}
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

        {/* Action Row */}
        <div className="flex gap-2 pt-2 border-t border-gray-200">
          <button
            onClick={handleUpvote}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-50"
          >
            <ThumbsUpIcon size={16} />
            <span>{localComplaint.upvotes}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            <ChatBubbleIcon size={16} />
            <span>{localComplaint.comments?.length || 0}</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          {/* Add Comment Form */}
          <div className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
              />
              <button
                onClick={handleAddComment}
                disabled={loading || !commentText.trim()}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:bg-gray-400"
              >
                Post
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-2">
            {localComplaint.comments && localComplaint.comments.length > 0 ? (
              localComplaint.comments.map((comment, idx) => (
                <div key={idx} className="bg-white rounded p-3 border border-gray-200">
                  <p className="text-sm text-gray-900">{comment.text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(comment.createdAt).toLocaleDateString()}{" "}
                    {new Date(comment.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
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

export default memo(ComplaintCardComponent);
