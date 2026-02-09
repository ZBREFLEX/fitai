import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:8000/api";

export default function BodyCompositionHistory() {
  const [measurements, setMeasurements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      
      // Fetch measurements
      const measurementsResponse = await fetch(`${API_URL}/body-measurements/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Fetch stats
      const statsResponse = await fetch(`${API_URL}/body-measurements/stats/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (measurementsResponse.ok) {
        const data = await measurementsResponse.json();
        setMeasurements(data);
      }

      if (statsResponse.ok) {
        const data = await statsResponse.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this measurement?")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/body-measurements/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Refresh data
        fetchData();
      }
    } catch (error) {
      console.error("Error deleting measurement:", error);
    }
  };

  if (loading) {
    return (
      <div className="hero-gradient min-h-screen flex items-center justify-center">
        <div className="text-neutral">Loading history...</div>
      </div>
    );
  }

  return (
    <div className="hero-gradient min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-neutral mb-2">
            Measurement History
          </h1>
          <p className="text-neutral text-opacity-70">
            Track your progress over time
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-primary rounded-xl border border-secondary p-4">
              <div className="text-sm text-neutral text-opacity-60">Total Measurements</div>
              <div className="text-2xl font-bold text-accent">{stats.total_measurements}</div>
            </div>
            <div className="bg-primary rounded-xl border border-secondary p-4">
              <div className="text-sm text-neutral text-opacity-60">Weight Change</div>
              <div className={`text-2xl font-bold ${stats.weight_change_total >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stats.weight_change_total > 0 ? '+' : ''}{stats.weight_change_total} kg
              </div>
            </div>
            <div className="bg-primary rounded-xl border border-secondary p-4">
              <div className="text-sm text-neutral text-opacity-60">Current Streak</div>
              <div className="text-2xl font-bold text-accent2">{stats.current_streak} days</div>
            </div>
            <div className="bg-primary rounded-xl border border-secondary p-4">
              <div className="text-sm text-neutral text-opacity-60">Avg BMI</div>
              <div className="text-2xl font-bold text-blue-400">{stats.average_bmi}</div>
            </div>
          </div>
        )}

        {/* History Table */}
        <div className="bg-primary rounded-2xl border border-secondary shadow-xl overflow-hidden">
          <div className="p-6 border-b border-secondary">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-neutral">All Measurements</h2>
              <Link
                to="/body-composition"
                className="px-4 py-2 bg-accent text-primary rounded-lg hover:bg-opacity-90 transition-all text-sm"
              >
                + Add New
              </Link>
            </div>
          </div>

          {measurements.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-neutral mb-2">No measurements yet</h3>
              <p className="text-neutral text-opacity-70 mb-6">
                Start tracking your body composition to see your progress here.
              </p>
              <Link
                to="/body-composition"
                className="px-6 py-3 bg-accent text-primary rounded-lg hover:bg-opacity-90 transition-all"
              >
                Take First Measurement
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary">
                  <tr>
                    <th className="text-left text-neutral px-6 py-3 text-sm font-semibold">Date</th>
                    <th className="text-left text-neutral px-6 py-3 text-sm font-semibold">Weight</th>
                    <th className="text-left text-neutral px-6 py-3 text-sm font-semibold">BMI</th>
                    <th className="text-left text-neutral px-6 py-3 text-sm font-semibold">Body Fat</th>
                    <th className="text-left text-neutral px-6 py-3 text-sm font-semibold">Lean Mass</th>
                    <th className="text-left text-neutral px-6 py-3 text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {measurements.map((m) => (
                    <tr key={m.id} className="border-b border-secondary hover:bg-secondary/50">
                      <td className="px-6 py-4 text-neutral">
                        {new Date(m.date_recorded).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-neutral font-semibold">{m.weight} kg</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                            m.bmi_category === "Normal weight"
                              ? "bg-green-500/20 text-green-400"
                              : m.bmi_category === "Overweight"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {m.bmi}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-neutral">{m.body_fat_percentage}%</td>
                      <td className="px-6 py-4 text-neutral">{m.lean_mass} kg</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link to="/body-composition" className="text-accent hover:text-opacity-80">
            ← Back to Body Composition
          </Link>
        </div>
      </div>
    </div>
  );
}
