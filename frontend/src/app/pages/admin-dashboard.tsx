import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Users, Utensils, Dumbbell, ShieldAlert, ArrowRight, UserMinus, UserCheck, Plus } from "lucide-react";
import { tokenService } from "../../services/api";
import { useNavigate } from "react-router";

// Mock API calls for now - will be replaced with real ones
const adminAPI = {
    getStats: async () => {
        const res = await fetch("http://127.0.0.1:8000/api/admin-stats/", {
            headers: { "Authorization": `Bearer ${tokenService.getAccessToken()}` }
        });
        if (!res.ok) throw new Error("Failed to fetch stats");
        return res.json();
    }
};

export function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await adminAPI.getStats();
            setStats(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse font-medium">Analyzing dashboard data...</div>;

    const cards = [
        { title: "Total Users", value: stats?.total_users || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30", description: "Registered accounts" },
        { title: "Active Now", value: stats?.active_users || 0, icon: UserCheck, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30", description: "Currently verified" },
        { title: "Meals Logged", value: stats?.total_meals_today || 0, icon: Utensils, color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30", description: "Recorded today" },
        { title: "Workouts", value: stats?.total_workouts_today || 0, icon: Dumbbell, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30", description: "Sessions completed" },
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-bold tracking-tight uppercase text-xs">
                        <ShieldAlert className="w-4 h-4" /> Admin Command Center
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight">System Overview</h1>
                    <p className="text-muted-foreground text-lg">Manage users, curate content, and monitor health metrics.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="h-12 border-primary/20" onClick={() => navigate("/dashboard/admin/users")}>
                        Manage Users
                    </Button>
                    <Button className="h-12 shadow-lg shadow-primary/20" onClick={() => navigate("/dashboard/admin/cms")}>
                        <Plus className="w-4 h-4 mr-2" /> Add Content
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <Card key={i} className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{card.title}</CardTitle>
                            <div className={`${card.bg} ${card.color} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                                <card.icon className="w-5 h-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-extrabold mb-1">{card.value}</div>
                            <p className="text-xs text-muted-foreground">{card.description}</p>
                        </CardContent>
                        <div className={`h-1 w-full ${card.color.replace('text', 'bg')} opacity-20`} />
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border-border/50 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-xl font-bold">Newest Members</CardTitle>
                            <CardDescription>Recently joined users in the last 24 hours.</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary" onClick={() => navigate("/dashboard/admin/users")}>
                            View All <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {stats?.recent_users?.map((user: any, i: number) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border/40 hover:bg-secondary/20 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                            {user.username.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-bold">{user.username}</div>
                                            <div className="text-xs text-muted-foreground">{user.email}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {user.is_active ? 'Active' : 'Banned'}
                                        </div>
                                        <div className="text-xs text-muted-foreground font-medium italic">
                                            {new Date(user.date_joined).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 shadow-md bg-primary/[0.02]">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-primary" /> Admin Quick Links
                        </CardTitle>
                        <CardDescription>High-priority maintenance tools.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button variant="outline" className="w-full justify-start h-12 bg-background border-border/60 hover:border-primary/40 group" onClick={() => navigate("/dashboard/admin/users")}>
                            <UserMinus className="w-4 h-4 mr-3 text-red-500 group-hover:scale-110 transition-transform" />
                            Ban/Deactivate Users
                        </Button>
                        <Button variant="outline" className="w-full justify-start h-12 bg-background border-border/60 hover:border-primary/40 group" onClick={() => navigate("/dashboard/admin/cms")}>
                            <Utensils className="w-4 h-4 mr-3 text-orange-500 group-hover:scale-110 transition-transform" />
                            Catalog Global Foods
                        </Button>
                        <Button variant="outline" className="w-full justify-start h-12 bg-background border-border/60 hover:border-primary/40 group" onClick={() => navigate("/dashboard/admin/cms")}>
                            <Dumbbell className="w-4 h-4 mr-3 text-purple-500 group-hover:scale-110 transition-transform" />
                            Design System Workouts
                        </Button>
                        <div className="pt-4 p-4 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30">
                            <p className="text-xs font-semibold text-orange-800 dark:text-orange-300">SYSTEM TIP</p>
                            <p className="text-xs text-orange-700 dark:text-orange-400 mt-1">
                                Check the medical tags in CMS to ensure correct AI recommendations.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
