import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function ProgressTracking() {
  const [weight, setWeight] = useState("");
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Load logs from local storage or use dummy data
    const savedLogs = JSON.parse(localStorage.getItem("fitAI_progressLogs"));
    if (savedLogs) {
      setLogs(savedLogs);
    } else {
      // Seed some dummy data for visualization
      const dummyData = [
        { date: "2023-10-01", weight: 75 },
        { date: "2023-10-08", weight: 74.5 },
        { date: "2023-10-15", weight: 74.2 },
        { date: "2023-10-22", weight: 73.8 },
        { date: "2023-10-29", weight: 73.5 },
      ];
      setLogs(dummyData);
      localStorage.setItem("fitAI_progressLogs", JSON.stringify(dummyData));
    }
  }, []);

  const handleLog = (e) => {
    e.preventDefault();
    if (!weight) return;

    const newLog = {
      date: new Date().toISOString().split("T")[0],
      weight: parseFloat(weight),
    };

    const updatedLogs = [...logs, newLog];
    setLogs(updatedLogs);
    localStorage.setItem("fitAI_progressLogs", JSON.stringify(updatedLogs));
    setWeight("");
  };

  // Calculate stats
  const startWeight = logs.length > 0 ? logs[0].weight : 0;
  const currentWeight = logs.length > 0 ? logs[logs.length - 1].weight : 0;
  const change = (currentWeight - startWeight).toFixed(1);

  return (
    <div className="hero-gradient min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-neutral mb-2">
            Progress Tracking
          </h1>
          <p className="text-neutral text-opacity-70">
            Monitor your fitness journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats Card */}
          <div className="bg-primary rounded-2xl border border-secondary p-6 shadow-xl">
            <h3 className="text-xl font-bold text-neutral mb-4">Summary</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-neutral/60">Starting Weight</p>
                <p className="text-2xl font-bold text-white">
                  {startWeight} kg
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral/60">Current Weight</p>
                <p className="text-2xl font-bold text-white">
                  {currentWeight} kg
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral/60">Total Change</p>
                <p
                  className={`text-3xl font-bold ${Number(change) <= 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {Number(change) > 0 ? "+" : ""}
                  {change} kg
                </p>
              </div>
            </div>

            <form onSubmit={handleLog} className="mt-8">
              <label className="block text-sm font-bold text-neutral mb-2">
                Log Today's Weight
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-4 py-2 bg-secondary rounded-lg border border-accent/20 text-white outline-none focus:border-accent"
                  placeholder="kg"
                />
                <button
                  type="submit"
                  className="bg-accent text-primary font-bold px-4 py-2 rounded-lg hover:bg-opacity-90 transition"
                >
                  Add
                </button>
              </div>
            </form>
          </div>

          {/* Chart Section */}
          <div className="md:col-span-2 bg-primary rounded-2xl border border-secondary p-8 shadow-xl flex flex-col justify-end relative overflow-hidden">
            <h3 className="text-xl font-bold text-neutral mb-6 absolute top-6 left-8">
              Weight Trend
            </h3>

            <div className="flex items-end justify-between h-64 w-full gap-2 mt-10">
              {logs.slice(-7).map((log, index) => {
                // Simple scaling for demo purposes logic
                // Find min and max to scale bars relative to view
                const minW = Math.min(...logs.map((l) => l.weight)) - 1;
                const maxW = Math.max(...logs.map((l) => l.weight)) + 1;
                const range = maxW - minW;
                const heightPercent = ((log.weight - minW) / range) * 100;

                return (
                  <div
                    key={index}
                    className="flex flex-col items-center flex-1 group"
                  >
                    <div
                      className="w-full bg-accent/20 hover:bg-accent/50 transition-all duration-300 rounded-t-sm relative group"
                      style={{ height: `${Math.max(10, heightPercent)}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white text-primary text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {log.weight}
                      </div>
                    </div>
                    <div className="text-xs text-neutral/50 mt-2 transform -rotate-45 origin-top-left translate-y-2">
                      {log.date.slice(5)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            to="/gamification"
            className="btn-primary flex items-center gap-2"
          >
            View Achievements
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
