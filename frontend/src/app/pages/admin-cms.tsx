import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Switch } from "../components/ui/switch";
import {
    Utensils,
    Dumbbell,
    Save,
    Plus,
    AlertCircle,
    Sparkles,
    Activity,
    Target,
    Clock,
    ShieldAlert,
    Zap,
    Leaf,
    Heart,
    Eye
} from "lucide-react";
import { tokenService } from "../../services/api";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";

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
        serving_size: "100g",
        category: "snack",
        ingredients: "",
        suitable_for: "",
        avoid_for: "",
        is_diabetic_friendly: false,
        is_heart_healthy: false,
        is_gluten_free: false,
        is_vegan: false
    });

    const [workoutForm, setWorkoutForm] = useState({
        name: "",
        workout_type: "strength",
        intensity: "moderate",
        duration_minutes: "30",
        description: "",
        benefits: "",
        target_goal: "maintain",
        body_part: "",
        suitable_for: "",
        avoid_for: "",
        is_low_impact: false,
        requires_equipment: false
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
            setFoodForm({
                food_name: "", calories: "", protein: "", carbs: "", fats: "",
                serving_size: "100g", category: "snack", ingredients: "",
                suitable_for: "", avoid_for: "",
                is_diabetic_friendly: false, is_heart_healthy: false,
                is_gluten_free: false, is_vegan: false
            });
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
            setWorkoutForm({
                name: "", workout_type: "strength", intensity: "moderate",
                duration_minutes: "30", description: "", benefits: "",
                target_goal: "maintain", body_part: "", suitable_for: "", avoid_for: "",
                is_low_impact: false, requires_equipment: false
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Core logic publication failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="space-y-2 border-b border-border pb-8">
                <div className="flex items-center gap-2 text-primary font-bold uppercase text-xs">
                    <Sparkles className="w-4 h-4" /> Global Catalog Management
                </div>
                <h1 className="text-5xl font-black tracking-tighter">CONTENT ENGINE</h1>
                <p className="text-muted-foreground text-lg font-medium">Engineer the high-fidelity database for AI-driven health optimizations.</p>
            </header>

            {error && (
                <Alert variant="destructive" className="shadow-lg border-red-500/20 bg-red-500/5">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-mono text-xs">{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className="border-green-500/50 bg-green-500/5 text-green-700 shadow-lg">
                    <AlertDescription className="font-bold flex items-center gap-2">
                        <Save className="w-4 h-4 text-green-600" /> {success}
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Global Food Catalog */}
                <Card className="border-border/50 shadow-2xl overflow-hidden hover:border-primary/20 transition-all group bg-card/50 backdrop-blur-sm">
                    <CardHeader className="bg-primary/[0.03] border-b border-border/20 py-8">
                        <div className="space-y-2">
                            <CardTitle className="text-3xl font-black tracking-tight flex items-center gap-3 italic">
                                <Utensils className="w-8 h-8 text-primary group-hover:rotate-12 transition-transform" /> FOOD INDEX
                            </CardTitle>
                            <CardDescription className="font-medium">Define molecular-level nutrition assets.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-8 px-8 pb-10">
                        <form onSubmit={handleFoodSubmit} className="space-y-8">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest opacity-70">Core Identity</Label>
                                    <Input
                                        placeholder="e.g. Organic Avocado"
                                        className="h-12 border-primary/20 text-lg font-bold"
                                        value={foodForm.food_name}
                                        onChange={e => setFoodForm({ ...foodForm, food_name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest opacity-70">Category</Label>
                                    <select
                                        className="w-full h-12 px-3 border border-primary/20 rounded-xl font-bold text-sm bg-background"
                                        value={foodForm.category}
                                        onChange={e => setFoodForm({ ...foodForm, category: e.target.value })}
                                    >
                                        <option value="protein">PROTEIN ASSET</option>
                                        <option value="carbs">CARBOHYDRATE</option>
                                        <option value="vegetable">VEGETABLE</option>
                                        <option value="fruit">FRUIT</option>
                                        <option value="beverage">BEVERAGE</option>
                                        <option value="snack">SNACK/FUEL</option>
                                        <option value="dairy">DAIRY SYSTEM</option>
                                    </select>
                                </div>
                            </div>

                            {/* Servings */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black opacity-60 uppercase">Serving Size</Label>
                                    <Input placeholder="e.g. 100g, 1 cup" value={foodForm.serving_size} onChange={e => setFoodForm({ ...foodForm, serving_size: e.target.value })} required className="h-10 font-bold border-primary/10" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black opacity-60 uppercase">Ingredients List</Label>
                                    <Textarea
                                        placeholder="comma separated ingredients"
                                        className="min-h-[40px] max-h-[100px] border-primary/10 font-medium text-xs"
                                        value={foodForm.ingredients}
                                        onChange={e => setFoodForm({ ...foodForm, ingredients: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Nutrients */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-secondary/10 p-4 rounded-2xl border border-secondary/20">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black opacity-60 uppercase">KCAL</Label>
                                    <Input type="number" value={foodForm.calories} onChange={e => setFoodForm({ ...foodForm, calories: e.target.value })} required className="h-10 font-black border-orange-500/20" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black opacity-60 uppercase text-blue-600">PRO (g)</Label>
                                    <Input type="number" step="0.1" value={foodForm.protein} onChange={e => setFoodForm({ ...foodForm, protein: e.target.value })} required className="h-10 font-black border-blue-500/20" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black opacity-60 uppercase text-green-600">CHO (g)</Label>
                                    <Input type="number" step="0.1" value={foodForm.carbs} onChange={e => setFoodForm({ ...foodForm, carbs: e.target.value })} required className="h-10 font-black border-green-500/20" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black opacity-60 uppercase text-purple-600">FAT (g)</Label>
                                    <Input type="number" step="0.1" value={foodForm.fats} onChange={e => setFoodForm({ ...foodForm, fats: e.target.value })} required className="h-10 font-black border-purple-500/20" />
                                </div>
                            </div>

                            {/* Dietary Flags */}
                            <div className="grid grid-cols-2 gap-4 border-y border-border/50 py-6">
                                <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-green-500/[0.02] border border-green-500/10">
                                    <Label className="text-xs font-bold leading-none flex items-center gap-2">
                                        <Leaf className="w-3.5 h-3.5 text-green-500" /> VEGAN
                                    </Label>
                                    <Switch checked={foodForm.is_vegan} onCheckedChange={checked => setFoodForm({ ...foodForm, is_vegan: checked })} />
                                </div>
                                <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-blue-500/[0.02] border border-blue-500/10">
                                    <Label className="text-xs font-bold leading-none flex items-center gap-2">
                                        <Zap className="w-3.5 h-3.5 text-blue-500" /> DIABETIC FRIENDLY
                                    </Label>
                                    <Switch checked={foodForm.is_diabetic_friendly} onCheckedChange={checked => setFoodForm({ ...foodForm, is_diabetic_friendly: checked })} />
                                </div>
                                <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-red-500/[0.02] border border-red-500/10">
                                    <Label className="text-xs font-bold leading-none flex items-center gap-2">
                                        <Heart className="w-3.5 h-3.5 text-red-500" /> HEART HEALTHY
                                    </Label>
                                    <Switch checked={foodForm.is_heart_healthy} onCheckedChange={checked => setFoodForm({ ...foodForm, is_heart_healthy: checked })} />
                                </div>
                                <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-orange-500/[0.02] border border-orange-500/10">
                                    <Label className="text-xs font-bold leading-none flex items-center gap-2">
                                        <ShieldAlert className="w-3.5 h-3.5 text-orange-500" /> GLUTEN FREE
                                    </Label>
                                    <Switch checked={foodForm.is_gluten_free} onCheckedChange={checked => setFoodForm({ ...foodForm, is_gluten_free: checked })} />
                                </div>
                            </div>

                            {/* Medical Logic */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black opacity-60 uppercase tracking-widest">Target Conditions (Suitable)</Label>
                                    <Input placeholder="e.g. PCOS, Hypothyroidism" className="h-10 bg-secondary/20 border-transparent font-bold text-xs" value={foodForm.suitable_for} onChange={e => setFoodForm({ ...foodForm, suitable_for: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black opacity-60 uppercase tracking-widest">Safety Warning (Avoid for)</Label>
                                    <Input placeholder="e.g. Chronic Kidney Disease" className="h-10 bg-red-500/[0.05] border-transparent font-bold text-xs text-red-700" value={foodForm.avoid_for} onChange={e => setFoodForm({ ...foodForm, avoid_for: e.target.value })} />
                                </div>
                            </div>

                            <Button type="submit" disabled={loading} className="w-full h-16 text-2xl font-black shadow-2xl shadow-primary/20 hover:scale-[1.01] transition-all active:scale-[0.98] uppercase tracking-tighter italic bg-primary text-primary-foreground group">
                                <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform" /> INDEX MASTER RECORD
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Global Workout Catalog */}
                <Card className="border-border/50 shadow-2xl overflow-hidden hover:border-primary/20 transition-all group bg-card/50 backdrop-blur-sm">
                    <CardHeader className="bg-primary/[0.03] border-b border-border/20 py-8">
                        <div className="space-y-2">
                            <CardTitle className="text-3xl font-black tracking-tight flex items-center gap-3 italic">
                                <Dumbbell className="w-8 h-8 text-primary group-hover:rotate-12 transition-transform" /> ROUTINES
                            </CardTitle>
                            <CardDescription className="font-medium">Architect global training protocols.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-8 px-8 pb-10">
                        <form onSubmit={handleWorkoutSubmit} className="space-y-8">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest opacity-70">Protocol Name</Label>
                                    <Input
                                        placeholder="e.g. HIIT Power Circuit"
                                        className="h-12 border-primary/20 text-lg font-bold"
                                        value={workoutForm.name}
                                        onChange={e => setWorkoutForm({ ...workoutForm, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest opacity-70">Category</Label>
                                    <select
                                        className="w-full h-12 px-3 border border-primary/20 rounded-xl font-bold text-sm bg-background"
                                        value={workoutForm.workout_type}
                                        onChange={e => setWorkoutForm({ ...workoutForm, workout_type: e.target.value })}
                                    >
                                        <option value="cardio">CARDIO SYSTEM</option>
                                        <option value="strength">STRENGTH TRAINING</option>
                                        <option value="hiit">HIIT (METABOLIC)</option>
                                        <option value="flexibility">FLEXIBILITY / YOGA</option>
                                        <option value="sports">SPORTS CONDITIONING</option>
                                        <option value="running">RUNNING PROTOCOLS</option>
                                    </select>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-secondary/10 p-4 rounded-2xl border border-secondary/20">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black opacity-60 flex items-center gap-1.5 uppercase tracking-widest"><Clock className="w-3 h-3 text-primary" /> Duration (min)</Label>
                                    <Input type="number" value={workoutForm.duration_minutes} onChange={e => setWorkoutForm({ ...workoutForm, duration_minutes: e.target.value })} required className="h-10 font-black border-primary/20" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black opacity-60 flex items-center gap-1.5 uppercase tracking-widest"><Activity className="w-3 h-3 text-orange-500" /> Intensity</Label>
                                    <select
                                        className="w-full h-10 px-3 border border-orange-500/20 rounded-lg font-black text-xs bg-background"
                                        value={workoutForm.intensity}
                                        onChange={e => setWorkoutForm({ ...workoutForm, intensity: e.target.value })}
                                    >
                                        <option value="light">LIGHT STRESS</option>
                                        <option value="moderate">MODERATE LOAD</option>
                                        <option value="intense">INTENSE ZONE</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black opacity-60 flex items-center gap-1.5 uppercase tracking-widest"><Target className="w-3 h-3 text-blue-500" /> Target Part</Label>
                                    <Input placeholder="e.g. Full Body" value={workoutForm.body_part} onChange={e => setWorkoutForm({ ...workoutForm, body_part: e.target.value })} className="h-10 font-black border-blue-500/20" />
                                </div>
                            </div>

                            {/* Description & Benefits */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black opacity-60 uppercase tracking-widest">Protocol Description</Label>
                                    <Textarea
                                        placeholder="Detailed execution instructions..."
                                        className="min-h-[100px] border-primary/10 font-medium text-sm leading-relaxed"
                                        value={workoutForm.description}
                                        onChange={e => setWorkoutForm({ ...workoutForm, description: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black opacity-60 uppercase tracking-widest">Key Benefits</Label>
                                    <Input
                                        placeholder="e.g. Hypertrophy, Metabolic shift, Agility"
                                        className="h-10 border-primary/10 font-bold text-xs"
                                        value={workoutForm.benefits}
                                        onChange={e => setWorkoutForm({ ...workoutForm, benefits: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Training Flags */}
                            <div className="grid grid-cols-2 gap-4 border-y border-border/50 py-6">
                                <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-blue-500/[0.02] border border-blue-500/10">
                                    <Label className="text-xs font-bold leading-none flex items-center gap-2">
                                        <Sparkles className="w-3.5 h-3.5 text-blue-500" /> LOW IMPACT
                                    </Label>
                                    <Switch checked={workoutForm.is_low_impact} onCheckedChange={checked => setWorkoutForm({ ...workoutForm, is_low_impact: checked })} />
                                </div>
                                <div className="flex items-center justify-between gap-4 p-3 rounded-xl bg-orange-500/[0.02] border border-orange-500/10">
                                    <Label className="text-xs font-bold leading-none flex items-center gap-2">
                                        <Target className="w-3.5 h-3.5 text-orange-500" /> EQUIPMENT REQ.
                                    </Label>
                                    <Switch checked={workoutForm.requires_equipment} onCheckedChange={checked => setWorkoutForm({ ...workoutForm, requires_equipment: checked })} />
                                </div>
                            </div>

                            {/* Medical Logic */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black opacity-60 uppercase tracking-widest text-primary">Target Goal</Label>
                                    <select
                                        className="w-full h-10 px-3 border border-primary/20 rounded-lg font-black text-xs bg-background"
                                        value={workoutForm.target_goal}
                                        onChange={e => setWorkoutForm({ ...workoutForm, target_goal: e.target.value })}
                                    >
                                        <option value="maintain">MAINTENANCE</option>
                                        <option value="lose_weight">WEIGHT LOSS</option>
                                        <option value="gain_muscle">MUSCLE HYPERTROPHY</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black opacity-60 uppercase tracking-widest italic flex items-center gap-2 underline decoration-red-500 text-red-700">
                                        <ShieldAlert className="w-3 h-3" /> Safety Contradictions
                                    </Label>
                                    <Input placeholder="e.g. vertigo, heart meds" className="h-10 bg-red-500/[0.05] border-transparent font-black text-xs text-red-700" value={workoutForm.avoid_for} onChange={e => setWorkoutForm({ ...workoutForm, avoid_for: e.target.value })} />
                                </div>
                            </div>

                            <Button type="submit" disabled={loading} className="w-full h-16 text-2xl font-black shadow-2xl shadow-primary/20 hover:scale-[1.01] transition-all active:scale-[0.98] uppercase tracking-tighter italic bg-primary text-primary-foreground group">
                                <Plus className="w-6 h-6 mr-3 group-hover:rotate-90 transition-transform" /> PUBLISH MASTER ROUTINE
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
