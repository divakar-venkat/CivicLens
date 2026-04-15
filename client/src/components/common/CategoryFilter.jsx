export default function CategoryFilter({ selectedCategory, onSelect }) {
  const categories = [
    { value: "all", label: "All Issues", icon: "🔍" },
    { value: "pothole", label: "Potholes", icon: "🕳️" },
    { value: "garbage", label: "Garbage", icon: "🗑️" },
    { value: "streetlight", label: "Streetlight", icon: "💡" },
    { value: "water", label: "Water", icon: "💧" },
    { value: "parking", label: "Parking", icon: "🚗" },
    { value: "dumping", label: "Dumping", icon: "🚫" },
  ];

  return (
    <div className="w-full">
      <p className="text-sm font-semibold text-gray-700 mb-3">Filter by Category:</p>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.value}
            onClick={() => onSelect(category.value)}
            className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
              selectedCategory === category.value
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            <span>{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
