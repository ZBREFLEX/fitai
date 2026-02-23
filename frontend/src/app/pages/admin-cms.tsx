import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Utensils, Dumbbell, Save, Plus, AlertCircle, Sparkles, Activity, Target } from "lucide-react";
import { tokenService } from "../../services/api";
import { Alert, AlertDescription } from "../components/ui/alert";

const adminAPI = {
    addFood: async (data: any) => {
        const res = await fetch("http://127.0.0.1:8000/api/admin/foods/", {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${tokenService.getAccessToken()}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(JSON.stringify(errData));
        }
        return res.json();
    },
    addWorkout: async (data: any) => {
        const res = await fetch("http://127.0.0.1:8000/api/admin/workouts/", {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${tokenService.getAccessToken()}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const errData = await res.json();
            throw new Error(JSON.stringify(errData));
        }
        return res.json();
    }
};

export function AdminCms() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [foodForm, setFoodForm] = useState({
        food_name: "",
        calories: "",
        protein: "",
        carbs: "",
        fats: "",
        category: "snack",
        ingredients: "",
        suitable_for: "",
        avoid_for: ""
    });

    const [workoutForm, setWorkoutForm] = useState({
        name: "",
        workout_type: "strength",
        intensity: "moderate",
        duration_minutes: "30",
        description: "",
        target_goal: "maintain",
        body_part: "",
        suitable_for: "",
        avoid_for: ""
    });

    const handleFoodSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError("");
            setSuccess("");
            await adminAPI.addFood({
                ...foodForm,
                calories: parseInt(foodForm.calories),
                protein: parseFloat(foodForm.protein),
                carbs: parseFloat(foodForm.carbs),
                fats: parseFloat(foodForm.fats)
            });
            setSuccess(`Successfully indexed "${foodForm.food_name}" into global database.`);
            setFoodForm({ food_name: "", calories: "", protein: "", carbs: "", fats: "", category: "snack", ingredients: "", suitable_for: "", avoid_for: "" });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Security indexing failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleWorkoutSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError("");
            setSuccess("");
            await adminAPI.addWorkout({
                ...workoutForm,
                duration_minutes: parseInt(workoutForm.duration_minutes)
            });
            setSuccess(`Global routine "${workoutForm.name}" has been published.`);
            setWorkoutForm({ name: "", workout_type: "strength", intensity: "moderate", duration_minutes: "30", description: "", target_goal: "maintain", body_part: "", suitable_for: "", avoid_for: "" });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Core logic publication failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold uppercase text-xs">
                    <Sparkles className="w-4 h-4" /> Global Catalog Management
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight">System Content</h1>
                <p className="text-muted-foreground text-lg">Curate the master database for AI-driven recommendations.</p>
            </header>

            {error && (
                <Alert variant="destructive" className="shadow-lg border-red-500/20">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-mono text-xs">{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className="border-green-500/50 bg-green-500/5 text-green-700 shadow-lg animate-bounce-short">
                    <AlertDescription className="font-bold flex items-center gap-2">
                        <Save className="w-4 h-4" /> {success}
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Global Food Catalog */}
                <Card className="border-border/50 shadow-xl overflow-hidden hover:border-primary/20 transition-all group">
                    <CardHeader className="bg-primary/[0.03] border-b border-border/20 py-8">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <CardTitle className="text-3xl font-black tracking-tight flex items-center gap-3 italic">
                                    <Utensils className="w-8 h-8 text-primary group-hover:rotate-12 transition-transform" /> FOOD INDEX
                                </CardTitle>
                                <CardDescription>Register nutrients for universal AI food discovery.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <form onSubmit={handleFoodSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest opacity-70">Core Name</Label>
                                <Input
                                    placeholder="e.g. Organic Avocado"
                                    className="h-12 border-primary/20 text-lg font-bold placeholder:font-normal placeholder:opacity-50"
                                    value={foodForm.food_name}
                                    onChange={e => setFoodForm({ ...foodForm, food_name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold opacity-60">CALORIES</Label>
                                    <Input type="number" placeholder="200" value={foodForm.calories} onChange={e => setFoodForm({ ...foodForm, calories: e.target.value })} required className="h-10 font-bold border-orange-500/20 focus:border-orange-500/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold opacity-60">PROTEIN</Label>
                                    <Input type="number" step="0.1" placeholder="g" value={foodForm.protein} onChange={e => setFoodForm({ ...foodForm, protein: e.target.value })} required className="h-10 font-bold border-blue-500/20 focus:border-blue-500/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold opacity-60">CARBS</Label>
                                    <Input type="number" step="0.1" placeholder="g" value={foodForm.carbs} onChange={e => setFoodForm({ ...foodForm, carbs: e.target.value })} required className="h-10 font-bold border-green-500/20 focus:border-green-500/50" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold opacity-60">FATS</Label>
                                    <Input type="number" step="0.1" placeholder="g" value={foodForm.fats} onChange={e => setFoodForm({ ...foodForm, fats: e.target.value })} required className="h-10 font-bold border-purple-500/20 focus:border-purple-500/50" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Medical Logic (Suitable for)</Label>
                                <Input placeholder="diabetes, pcos, weight loss" className="h-10 bg-secondary/30 font-medium" value={foodForm.suitable_for} onChange={e => setFoodForm({ ...foodForm, suitable_for: e.target.value })} />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Safety Logic (Avoid for)</Label>
                                <Input placeholder="hypertension, heart disease" className="h-10 bg-red-500/[0.03] border-red-500/10 font-medium" value={foodForm.avoid_for} onChange={e => setFoodForm({ ...foodForm, avoid_for: e.target.value })} />
                            </div>

                            <Button type="submit" disabled={loading} className="w-full h-14 text-xl font-black shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95 uppercase tracking-widest italic">
                                <Plus className="w-5 h-5 mr-3" /> Commit to Index
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Global Workout Catalog */}
                <Card className="border-border/50 shadow-xl overflow-hidden hover:border-primary/20 transition-all group">
                    <CardHeader className="bg-primary/[0.03] border-b border-border/20 py-8">
                        <div className="flex items-center justify-between">
                            <div className="space-y-2">
                                <CardTitle className="text-3xl font-black tracking-tight flex items-center gap-3 italic">
                                    <Dumbbell className="w-8 h-8 text-primary group-hover:rotate-12 transition-transform" /> ROUTINES
                                </CardTitle>
                                <CardDescription>Architect global workout architectures.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <form onSubmit={handleWorkoutSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest opacity-70">Core Identity</Label>
                                <Input
                                    placeholder="e.g. HIIT Power Core"
                                    className="h-12 border-primary/20 text-lg font-bold placeholder:font-normal placeholder:opacity-50"
                                    value={workoutForm.name}
                                    onChange={e => setWorkoutForm({ ...workoutForm, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold opacity-60 flex items-center gap-1.5 uppercase tracking-widest"><Activity className="w-3 h-3" /> Intensity</Label>
                                    <select
                                        className="w-full h-11 px-3 border border-border rounded-xl font-bold text-sm bg-background appearance-none"
                                        value={workoutForm.intensity}
                                        onChange={e => setWorkoutForm({ ...workoutForm, intensity: e.target.value })}
                                    >
                                        <option value="light">LIGHT STRESS</option>
                                        <option value="moderate">MODERATE LOAD</option>
                                        <option value="intense">INTENSE CORE</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold opacity-60 flex items-center gap-1.5 uppercase tracking-widest"><Target className="w-3 h-3" /> Body Part</Label>
                                    <Input placeholder="Chest, Legs, etc" value={workoutForm.body_part} onChange={e => setWorkoutForm({ ...workoutForm, body_part: e.target.value })} className="h-11 font-bold" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Medical Logic (Suitable for)</Label>
                                <Input placeholder="strength, joint stability" className="h-10 bg-secondary/30 font-medium" value={workoutForm.suitable_for} onChange={e => setWorkoutForm({ ...workoutForm, suitable_for: e.target.value })} />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Safety Logic (Avoid for)</Label>
                                <Input placeholder="knee injury, asthma" className="h-10 bg-red-500/[0.03] border-red-500/10 font-medium" value={workoutForm.avoid_for} onChange={e => setWorkoutForm({ ...workoutForm, avoid_for: e.target.value })} />
                            </div>

                            <Button type="submit" disabled={loading} className="w-full h-14 text-xl font-black shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95 uppercase tracking-widest italic">
                                <Plus className="w-5 h-5 mr-3" /> Publish Routine
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
