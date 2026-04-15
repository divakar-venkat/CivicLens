import MediaCarousel from "./MediaCarousel";

export default function ComplaintCard({ complaint }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "submitted":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryEmoji = (category) => {
    const emojiMap = {
      pothole: "🕳️",
      garbage: "🗑️",
      streetlight: "💡",
      water: "💧",
      parking: "🚗",
      dumping: "🚫",
      other: "📌",
    };
    return emojiMap[category] || "📌";
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mb-4">
      {/* Media Carousel */}
      <div className="p-4">
        <MediaCarousel media={complaint.media} />
      </div>

      {/* Content */}
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900">{complaint.title}</h2>
        <p className="text-gray-700 mt-2 text-sm">{complaint.description}</p>

        <div className="mt-4 flex flex-col gap-3">
          {complaint.location?.address && (
            <div className="flex items-start gap-2">
              <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
                📍 Location:
              </span>
              <span className="text-sm text-gray-600">{complaint.location.address}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-3 items-center">
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusColor(
                complaint.status
              )}`}
            >
              {complaint.status && complaint.status.charAt(0).toUpperCase() + complaint.status.slice(1).replace("_", " ")}
            </span>

            {complaint.category && (
              <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-1">
                <span>{getCategoryEmoji(complaint.category)}</span>
                <span>{complaint.category.charAt(0).toUpperCase() + complaint.category.slice(1)}</span>
              </span>
            )}

            {complaint.severity && (
              <span className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                🚨 Severity: {complaint.severity}/10
              </span>
            )}
          </div>
        </div>

        {complaint.upvotes > 0 && (
          <div className="mt-3 text-xs text-gray-500">
            👍 {complaint.upvotes} {complaint.upvotes === 1 ? "upvote" : "upvotes"}
          </div>
        )}
      </div>
    </div>
  );
}
