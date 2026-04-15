import { useState, useEffect } from "react";
import API from "../services/api";

export default function Home() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
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

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Civic Complaints</h1>

      {loading && <p className="text-gray-600">Loading complaints...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <div className="grid gap-4">
        {complaints.length > 0 ? (
          complaints.map((complaint) => (
            <div key={complaint._id} className="p-4 bg-white rounded-lg shadow">
              <h2 className="font-semibold text-lg">{complaint.title}</h2>
              <p className="text-gray-700 mt-2">{complaint.description}</p>
              <div className="mt-3 flex gap-4 text-sm text-gray-600">
                <span>Status: {complaint.status}</span>
                <span>Category: {complaint.category}</span>
              </div>
            </div>
          ))
        ) : (
          !loading && <p className="text-gray-500">No complaints found</p>
        )}
      </div>
    </div>
  );
}