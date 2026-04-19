import { useState, useEffect } from "react";
import API from "../services/api";

// SVG Icons
function BarChartIcon() {
  return (
    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function ClipboardIcon() {
  return (
    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function ThumbsUpIcon() {
  return (
    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.646 7.289a2 2 0 01-1.789 1.106H7a2 2 0 01-2-2v-8a2 2 0 012-2h3.5a2 2 0 002-2V5a2 2 0 012-2h.5a2 2 0 012 2v7z" />
    </svg>
  );
}

export default function Admin() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState({});
  const [editDepartment, setEditDepartment] = useState({});

  const departmentMap = {
    pothole: "PWD",
    garbage: "Waste Management",
    streetlight: "Electricity",
    water: "Water Supply",
    parking: "Traffic Police",
    dumping: "Municipal Corp",
    other: "Unassigned",
  };

  const departmentColors = {
    "PWD": "bg-slate-50 text-slate-700 border border-slate-100",
    "Waste Management": "bg-slate-50 text-slate-700 border border-slate-100",
    "Electricity": "bg-slate-50 text-slate-700 border border-slate-100",
    "Water Supply": "bg-slate-50 text-slate-700 border border-slate-100",
    "Traffic Police": "bg-slate-50 text-slate-700 border border-slate-100",
    "Municipal Corp": "bg-slate-50 text-slate-700 border border-slate-100",
    "Unassigned": "bg-slate-50 text-slate-700 border border-slate-100",
  };

  const statusColors = {
    submitted: "bg-yellow-50 text-yellow-700 border border-yellow-100",
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

  const categories = Object.keys(categoryLabels);
  const departments = Object.values(departmentMap);
  const statuses = ["submitted", "in_progress", "resolved"];

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const response = await API.get("/complaints");
        setComplaints(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch complaints");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const filteredComplaints = complaints.filter((c) => {
    const statusMatch = statusFilter === "all" || c.status === statusFilter;
    const categoryMatch = categoryFilter === "all" || c.category === categoryFilter;
    const departmentMatch = departmentFilter === "all" || c.department === departmentFilter;
    return statusMatch && categoryMatch && departmentMatch;
  });

  const stats = {
    total: complaints.length,
    submitted: complaints.filter((c) => c.status === "submitted").length,
    inProgress: complaints.filter((c) => c.status === "in_progress").length,
    resolved: complaints.filter((c) => c.status === "resolved").length,
  };

  const handleQuickUpdate = async (complaintId, newStatus, newDepartment) => {
    try {
      const response = await API.put(`/complaints/${complaintId}`, {
        status: newStatus,
        department: newDepartment,
      });

      setComplaints((prev) =>
        prev.map((c) => (c._id === complaintId ? response.data : c))
      );
      setEditingId(null);
      setEditStatus({});
      setEditDepartment({});
    } catch (err) {
      console.error("Failed to update complaint:", err);
      alert("Failed to update complaint");
    }
  };

  if (loading) {
    return (
      <div className="p-4 pb-24">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Title Card */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard Icon={BarChartIcon} label="Total" value={stats.total} color="red" />
          <StatCard Icon={ClipboardIcon} label="Submitted" value={stats.submitted} color="yellow" />
          <StatCard Icon={GearIcon} label="In Progress" value={stats.inProgress} color="blue" />
          <StatCard Icon={CheckCircleIcon} label="Resolved" value={stats.resolved} color="green" />
        </div>

        {/* Quick Insights */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Most Reported</p>
              <p className="font-semibold text-gray-900 mt-1">
                {complaints.length > 0
                  ? Object.entries(
                      complaints.reduce((acc, c) => {
                        acc[c.category] = (acc[c.category] || 0) + 1;
                        return acc;
                      }, {})
                    ).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Resolution Rate</p>
              <p className="font-semibold text-green-600 mt-1">
                {complaints.length > 0
                  ? Math.round((stats.resolved / stats.total) * 100) + "%"
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Pending Issues</p>
              <p className="font-semibold text-orange-600 mt-1">
                {stats.submitted + stats.inProgress}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-4">
            <SearchIcon />
            <h3 className="text-sm font-semibold text-gray-900">Filter Complaints</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {categoryLabels[cat]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Department</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredComplaints.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 font-medium">No complaints to manage</p>
              <p className="text-gray-500 text-sm mt-2">
                All issues have been resolved or no complaints match your filters
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Department</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Upvotes</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredComplaints.map((complaint) => (
                    <tr key={complaint._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{complaint.title}</p>
                          {complaint.location?.address && (
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <LocationIcon />
                              {complaint.location.address}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {categoryLabels[complaint.category]}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {editingId === complaint._id ? (
                          <select
                            value={editStatus[complaint._id] || complaint.status}
                            onChange={(e) =>
                              setEditStatus({
                                ...editStatus,
                                [complaint._id]: e.target.value,
                              })
                            }
                            className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                            {statuses.map((status) => (
                              <option key={status} value={status}>
                                {status.replace("_", " ")}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className={`inline-block text-xs font-semibold px-3 py-1 rounded-full cursor-pointer transition ${
                              statusColors[complaint.status]
                            }`}
                            onClick={() => setEditingId(complaint._id)}
                          >
                            {complaint.status.replace("_", " ")}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {editingId === complaint._id ? (
                          <select
                            value={editDepartment[complaint._id] || complaint.department || "Unassigned"}
                            onChange={(e) =>
                              setEditDepartment({
                                ...editDepartment,
                                [complaint._id]: e.target.value,
                              })
                            }
                            className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                            {departments.map((dept) => (
                              <option key={dept} value={dept}>
                                {dept}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className={`inline-block text-xs font-semibold px-3 py-1 rounded-full cursor-pointer transition ${
                              departmentColors[complaint.department || "Unassigned"]
                            }`}
                            onClick={() => setEditingId(complaint._id)}
                          >
                            {complaint.department || "Unassigned"}
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-semibold text-gray-900 flex items-center justify-center gap-1">
                          <ThumbsUpIcon />
                          {complaint.upvotes || 0}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        {editingId === complaint._id ? (
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() =>
                                handleQuickUpdate(
                                  complaint._id,
                                  editStatus[complaint._id] || complaint.status,
                                  editDepartment[complaint._id] || complaint.department
                                )
                              }
                              className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => {
                                setEditingId(null);
                                setEditStatus({});
                                setEditDepartment({});
                              }}
                              className="px-3 py-1 text-xs bg-gray-300 hover:bg-gray-400 text-gray-800 rounded font-semibold transition"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingId(complaint._id)}
                            className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition flex items-center justify-center gap-1 mx-auto"
                          >
                            <PencilIcon />
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          Showing {filteredComplaints.length} of {complaints.length} complaints
        </div>
      </div>
    </div>
  );
}

function StatCard({ Icon, label, value, color }) {
  const colorClasses = {
    red: "bg-red-50 border-red-100",
    yellow : "bg-yellow-50 border-yellow-100",
    blue: "bg-blue-50 border-blue-100",
    green: "bg-green-50 border-green-100",
  };

  return (
    <div className={`border rounded-xl p-4 transition hover:shadow-md ${colorClasses[color]}`}>
      <div className="mb-2">
        <Icon />
      </div>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="text-3xl font-bold mt-2 text-gray-900">{value}</p>
    </div>
  );
}
