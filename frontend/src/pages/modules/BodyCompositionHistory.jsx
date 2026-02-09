import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:8000/api";

export default function BodyCompositionHistory() {
  const [measurements, setMeasurements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredRow, setHoveredRow] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      
      const [measurementsResponse, statsResponse] = await Promise.all([
        fetch(`${API_URL}/body-measurements/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/body-measurements/stats/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

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
    if (!window.confirm("Are you sure you want to delete this measurement?")) return;

    try {
      const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/body-measurements/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) fetchData();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getBMIStyle = (bmi) => {
    if (bmi < 18.5) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    if (bmi < 24.9) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (bmi < 29.9) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-cyan-400">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-sm text-slate-300">Progress Tracker</span>
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent mb-4">
            Measurement History
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Track your body composition journey with detailed insights and trends
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-16 -mt-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Total Measurements */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-cyan-500/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Total</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.total_measurements}</div>
                <div className="text-sm text-slate-400">Measurements</div>
              </div>
            </div>

            {/* Weight Change */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-emerald-500/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Change</span>
                </div>
                <div className={`text-3xl font-bold mb-1 ${stats.weight_change_total >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {stats.weight_change_total > 0 ? '+' : ''}{stats.weight_change_total} kg
                </div>
                <div className="text-sm text-slate-400">Since first measurement</div>
              </div>
            </div>

            {/* Current Streak */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-purple-500/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    </svg>
                  </div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Streak</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.current_streak}</div>
                <div className="text-sm text-slate-400">Days in a row</div>
              </div>
            </div>

            {/* Average BMI */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-blue-500/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                  </div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider">Average</span>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stats.average_bmi}</div>
                <div className="text-sm text-slate-400">BMI across all measurements</div>
              </div>
            </div>
          </div>
        )}

        {/* Measurements Table */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-3xl"></div>
          
          <div className="relative bg-slate-800/30 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
            {/* Table Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">All Measurements</h2>
                <p className="text-slate-400 text-sm">Complete history of your body composition data</p>
              </div>
              <Link
                to="/body-composition"
                className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New
              </Link>
            </div>

            {measurements.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
                  <svg className="w-12 h-12 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">No measurements yet</h3>
                <p className="text-slate-400 mb-8 max-w-md mx-auto">
                  Start tracking your body composition to see your progress over time
                </p>
                <Link
                  to="/body-composition"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
                >
                  Take First Measurement
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-700/30">
                      <th className="text-left text-slate-300 font-semibold px-8 py-5 text-sm uppercase tracking-wider">Date</th>
                      <th className="text-left text-slate-300 font-semibold px-6 py-5 text-sm uppercase tracking-wider">Weight</th>
                      <th className="text-center text-slate-300 font-semibold px-6 py-5 text-sm uppercase tracking-wider">BMI</th>
                      <th className="text-center text-slate-300 font-semibold px-6 py-5 text-sm uppercase tracking-wider">Body Fat</th>
                      <th className="text-center text-slate-300 font-semibold px-6 py-5 text-sm uppercase tracking-wider">Lean Mass</th>
                      <th className="text-right text-slate-300 font-semibold px-8 py-5 text-sm uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {measurements.map((m, index) => (
                      <tr
                        key={m.id}
                        className="group transition-all duration-300 hover:bg-white/5"
                        onMouseEnter={() => setHoveredRow(m.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                              hoveredRow === m.id ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700/50 text-slate-400'
                            }`}>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <div className="text-white font-medium">{formatDate(m.date_recorded)}</div>
                              <div className="text-slate-400 text-sm">Measurement #{measurements.length - index}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-white">{m.weight}</span>
                            <span className="text-slate-400 text-sm">kg</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-center">
                          <span className={`inline-flex items-center justify-center px-4 py-2 rounded-xl text-lg font-bold border ${getBMIStyle(m.bmi)}`}>
                            {m.bmi}
                          </span>
                        </td>
                        <td className="px-6 py-6 text-center">
                          <div className="inline-flex items-center gap-1 text-lg">
                            <span className="text-white font-bold">{m.body_fat_percentage}</span>
                            <span className="text-slate-400 text-sm">%</span>
                          </div>
                        </td>
                        <td className="px-6 py-6 text-center">
                          <div className="inline-flex items-center gap-1 text-lg">
                            <span className="text-white font-bold">{m.lean_mass}</span>
                            <span className="text-slate-400 text-sm">kg</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="group/btn inline-flex items-center gap-2 px-4 py-2 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-all"
                          >
                            <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span className="text-sm font-medium">Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-10 text-center">
          <Link 
            to="/body-composition" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Body Composition</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
