import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://localhost:8000/api";

export default function UserSettings() {
  const [settings, setSettings] = useState({
    preferred_units: "metric",
    measurement_reminders: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/settings/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");

    try {
      const token = localStorage.getItem("access_token") || sessionStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/settings/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage("Settings saved successfully!");
      } else {
        setMessage("Failed to save settings.");
      }
    } catch (error) {
      setMessage("Error saving settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="hero-gradient min-h-screen flex items-center justify-center">
        <div className="text-neutral">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="hero-gradient min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-neutral mb-2">Settings</h1>
          <p className="text-neutral text-opacity-70">
            Manage your preferences and account settings
          </p>
        </div>

        <div className="bg-primary rounded-2xl border border-secondary p-8 shadow-xl">
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.includes("success")
                  ? "bg-green-500/20 text-green-400 border border-green-500"
                  : "bg-red-500/20 text-red-400 border border-red-500"
              }`}
            >
              {message}
            </div>
          )}

          {/* Units Preference */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-neutral mb-4">Unit Preferences</h3>
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="units"
                  value="metric"
                  checked={settings.preferred_units === "metric"}
                  onChange={(e) =>
                    setSettings({ ...settings, preferred_units: e.target.value })
                  }
                  className="w-4 h-4 accent-accent"
                />
                <span className="text-neutral">
                  Metric (cm, kg) - Height in centimeters, weight in kilograms
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="units"
                  value="imperial"
                  checked={settings.preferred_units === "imperial"}
                  onChange={(e) =>
                    setSettings({ ...settings, preferred_units: e.target.value })
                  }
                  className="w-4 h-4 accent-accent"
                />
                <span className="text-neutral">
                  Imperial (ft/in, lbs) - Height in feet/inches, weight in pounds
                </span>
              </label>
            </div>
          </div>

          {/* Notifications */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-neutral mb-4">Notifications</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.measurement_reminders}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    measurement_reminders: e.target.checked,
                  })
                }
                className="w-4 h-4 accent-accent"
              />
              <span className="text-neutral">
                Enable daily measurement reminders
              </span>
            </label>
          </div>

          {/* Save Button */}
          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 bg-accent text-primary font-bold rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
            <Link
              to="/"
              className="px-6 py-3 border border-accent text-neutral rounded-lg hover:bg-secondary transition-all"
            >
              Cancel
            </Link>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-accent hover:text-opacity-80">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
