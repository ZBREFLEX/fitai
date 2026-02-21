import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { AlertCircle, Save, User, Scale, Ruler, Activity, Stethoscope, Search, X } from "lucide-react";
import { tokenService, settingsAPI, bodyMeasurementAPI } from "../../services/api";

const PRESET_CONDITIONS = [
    "Diabetes Type 1", "Diabetes Type 2", "Hypertension", "Asthma", "PCOS", "Thyroid",
    "Lactose Intolerance", "Gluten Sensitivity", "Anemia", "Arthritis", "Heart Disease",
    "Cholesterol", "Obesity", "Acid Reflux", "Migraine", "Sleep Apnea", "Depression", "Anxiety",
    "Vegan Diet", "Gluten-Free Diet"
];

export function SettingsPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [profileData, setProfileData] = useState({
        first_name: "",
        phone: "",
        age: "",
        gender: "",
        medical_conditions: "",
    });

    const [history, setHistory] = useState<any[]>([]);

    const [measurementData, setMeasurementData] = useState({
        weight: "",
        height: "",
        activityLevel: "moderate",
    });

    const [conditionSearch, setConditionSearch] = useState("");
    const [showConditionSuggestions, setShowConditionSuggestions] = useState(false);
    const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

    useEffect(() => {
        if (!tokenService.isTokenValid()) {
            navigate("/login");
            return;
        }
        loadUserData();
    }, [navigate]);

    const loadUserData = async () => {
        try {
            setLoading(true);
            const [data, measurementHistory] = await Promise.all([
                settingsAPI.getUserFullData(),
                bodyMeasurementAPI.getHistory(10)
            ]);

            setProfileData({
                first_name: data.first_name || "",
                phone: data.profile?.phone || "",
                age: data.profile?.age?.toString() || "",
                gender: data.profile?.gender || "",
                medical_conditions: data.profile?.medical_conditions || "",
            });

            if (data.profile?.medical_conditions) {
                setSelectedConditions(data.profile.medical_conditions.split(',').map((c: string) => c.trim()).filter((c: string) => c.length > 0));
            }

            setHistory(measurementHistory);

            if (data.profile?.latest_measurement) {
                setMeasurementData({
                    weight: data.profile.latest_measurement.weight.toString(),
                    height: data.profile.latest_measurement.height.toString(),
                    activityLevel: data.profile.latest_measurement.activity_level || "moderate",
                });
            }
        } catch (err) {
            setError("Failed to load user data");
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError("");
            setSuccess("");

            await settingsAPI.updateProfile({
                first_name: profileData.first_name,
                phone: profileData.phone,
                age: profileData.age ? parseInt(profileData.age) : undefined,
                gender: profileData.gender,
                medical_conditions: selectedConditions.join(', '),
            });

            setSuccess("Profile updated successfully!");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleMeasurementSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError("");
            setSuccess("");

            await bodyMeasurementAPI.save({
                weight: parseFloat(measurementData.weight),
                height: parseFloat(measurementData.height),
                age: parseInt(profileData.age),
                gender: profileData.gender,
                activityLevel: measurementData.activityLevel,
            });

            setSuccess("Health metrics updated successfully!");
            loadUserData(); // Refresh list
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update measurements");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">User Settings</h1>
                <p className="text-muted-foreground">Manage your profile and health measurements</p>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className="mb-6 border-green-500 bg-green-500/10 text-green-600">
                    <AlertDescription>{success}</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Vital Stats - Height & Weight (Priority) */}
                <Card className="md:col-span-2 border-primary/20 shadow-md">
                    <CardHeader className="bg-primary/5">
                        <div className="flex items-center gap-2">
                            <Scale className="w-5 h-5 text-primary" />
                            <CardTitle>Vital Measurements</CardTitle>
                        </div>
                        <CardDescription>These are essential for calculating your BMI, BMR, and TDEE.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleMeasurementSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="weight" className="flex items-center gap-1">
                                        <Scale className="w-4 h-4" /> Weight (kg)
                                    </Label>
                                    <Input
                                        id="weight"
                                        type="number"
                                        step="0.1"
                                        value={measurementData.weight}
                                        onChange={(e) => setMeasurementData({ ...measurementData, weight: e.target.value })}
                                        placeholder="e.g. 70"
                                        required
                                        className="text-lg font-semibold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="height" className="flex items-center gap-1">
                                        <Ruler className="w-4 h-4" /> Height (cm)
                                    </Label>
                                    <Input
                                        id="height"
                                        type="number"
                                        value={measurementData.height}
                                        onChange={(e) => setMeasurementData({ ...measurementData, height: e.target.value })}
                                        placeholder="e.g. 175"
                                        required
                                        className="text-lg font-semibold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="activityLevel" className="flex items-center gap-1">
                                    <Activity className="w-4 h-4" /> Activity Level
                                </Label>
                                <select
                                    id="activityLevel"
                                    value={measurementData.activityLevel}
                                    onChange={(e) => setMeasurementData({ ...measurementData, activityLevel: e.target.value })}
                                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                                >
                                    <option value="sedentary">Sedentary (little or no exercise)</option>
                                    <option value="light">Light (1-3 days/week)</option>
                                    <option value="moderate">Moderate (3-5 days/week)</option>
                                    <option value="active">Active (6-7 days/week)</option>
                                    <option value="very_active">Very Active (physical job + exercise)</option>
                                </select>
                            </div>
                            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                                <Save className="w-4 h-4 mr-2" />
                                Update Vital Stats
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Profile Info */}
                <Card className="border-border">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            <CardTitle>Personal Info</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">Full Name</Label>
                                <Input
                                    id="first_name"
                                    value={profileData.first_name}
                                    onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="age">Age</Label>
                                    <Input
                                        id="age"
                                        type="number"
                                        value={profileData.age}
                                        onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gender">Gender</Label>
                                    <select
                                        id="gender"
                                        value={profileData.gender}
                                        onChange={(e) => setProfileData({ ...profileData, gender: e.target.value })}
                                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground text-sm"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <Button type="submit" disabled={loading} className="w-full">
                                <Save className="w-4 h-4 mr-2" />
                                Save Profile
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Medical Info */}
                <Card className="border-border">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Stethoscope className="w-5 h-5 text-red-500" />
                            <CardTitle>Medical Info</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="condition-search">Search Health Conditions</Label>
                                <div className="relative">
                                    <Input
                                        id="condition-search"
                                        placeholder="Type to find conditions (e.g. Diabetes)"
                                        value={conditionSearch}
                                        onChange={(e) => {
                                            setConditionSearch(e.target.value);
                                            setShowConditionSuggestions(true);
                                        }}
                                        onFocus={() => setShowConditionSuggestions(true)}
                                    />
                                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />

                                    {showConditionSuggestions && conditionSearch.length > 0 && (
                                        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                            {PRESET_CONDITIONS.filter(c => c.toLowerCase().includes(conditionSearch.toLowerCase())).map((c) => (
                                                <button
                                                    key={c}
                                                    className="w-full text-left px-4 py-2 hover:bg-secondary text-sm transition-colors"
                                                    onClick={() => {
                                                        if (!selectedConditions.includes(c)) {
                                                            setSelectedConditions([...selectedConditions, c]);
                                                        }
                                                        setConditionSearch("");
                                                        setShowConditionSuggestions(false);
                                                    }}
                                                >
                                                    {c}
                                                </button>
                                            ))}
                                            {PRESET_CONDITIONS.filter(c => c.toLowerCase().includes(conditionSearch.toLowerCase())).length === 0 && (
                                                <div className="px-4 py-2 text-xs text-muted-foreground italic">
                                                    No matching conditions found
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-secondary/20 rounded-md">
                                {selectedConditions.length === 0 ? (
                                    <span className="text-xs text-muted-foreground italic">No conditions selected</span>
                                ) : (
                                    selectedConditions.map((condition) => (
                                        <div
                                            key={condition}
                                            className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium"
                                        >
                                            {condition}
                                            <button onClick={() => setSelectedConditions(selectedConditions.filter(c => c !== condition))}>
                                                <X className="w-3 h-3 hover:text-red-500" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            <Button onClick={handleProfileSubmit} disabled={loading} className="w-full">
                                <Save className="w-4 h-4 mr-2" />
                                Update Health Info
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* measurement History */}
                <Card className="md:col-span-2 border-border shadow-sm">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" />
                            <CardTitle>Metric History</CardTitle>
                        </div>
                        <CardDescription>A log of your previous weight and height entries.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {history.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground italic">
                                No history recorded yet.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-secondary/50 text-muted-foreground uppercase text-[10px] font-bold">
                                        <tr>
                                            <th className="px-4 py-3">Date</th>
                                            <th className="px-4 py-3">Weight</th>
                                            <th className="px-4 py-3">Height</th>
                                            <th className="px-4 py-3">BMI</th>
                                            <th className="px-4 py-3 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {history.map((m) => (
                                            <tr key={m.id} className="hover:bg-secondary/20 transition-colors">
                                                <td className="px-4 py-3 font-medium">
                                                    {new Date(m.date_recorded).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3">{m.weight}kg</td>
                                                <td className="px-4 py-3">{m.height}cm</td>
                                                <td className="px-4 py-3">{m.bmi}</td>
                                                <td className="px-4 py-3 text-right text-xs">
                                                    <span className={`px-2 py-1 rounded-full ${m.bmi_category === 'Normal weight' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                                        }`}>
                                                        {m.bmi_category}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <Button
                            variant="link"
                            className="mt-4 text-primary px-0"
                            onClick={() => navigate('/dashboard/progress')}
                        >
                            View Full Progress Charts →
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
