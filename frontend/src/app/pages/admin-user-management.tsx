import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, UserMinus, UserCheck, Mail, Calendar, ShieldCheck, ShieldAlert, AlertCircle } from "lucide-react";
import { tokenService } from "../../services/api";
import { Alert, AlertDescription } from "../components/ui/alert";

const adminAPI = {
    getUsers: async () => {
        const res = await fetch("http://127.0.0.1:8000/api/admin/users/", {
            headers: { "Authorization": `Bearer ${tokenService.getAccessToken()}` }
        });
        if (!res.ok) throw new Error("Failed to fetch users");
        return res.json();
    },
    toggleUser: async (id: number) => {
        const res = await fetch(`http://127.0.0.1:8000/api/admin/users/${id}/toggle/`, {
            method: 'POST',
            headers: { "Authorization": `Bearer ${tokenService.getAccessToken()}` }
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to toggle user status");
        }
        return res.json();
    }
};

export function AdminUserManagement() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await adminAPI.getUsers();
            setUsers(data);
        } catch (err) {
            setError("Failed to load user records from security database.");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (user: any) => {
        try {
            setActionLoading(user.id);
            setError("");
            await adminAPI.toggleUser(user.id);
            // Optimized local update
            setUsers(users.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Action failed");
        } finally {
            setActionLoading(null);
        }
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="space-y-2">
                <div className="flex items-center gap-2 text-primary font-bold uppercase text-xs">
                    <ShieldCheck className="w-4 h-4" /> User Security Shield
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight">Access Control</h1>
                <p className="text-muted-foreground text-lg">Manage user authentication and platform access permissions.</p>
            </header>

            {error && (
                <Alert variant="destructive" className="animate-in slide-in-from-top-4 duration-300">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-medium">{error}</AlertDescription>
                </Alert>
            )}

            <Card className="border-border/50 shadow-lg overflow-hidden">
                <CardHeader className="bg-secondary/10 pb-6 border-b border-border/40">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold">User Directory</CardTitle>
                            <CardDescription className="text-sm font-medium">Viewing {filteredUsers.length} of {users.length} unique identities.</CardDescription>
                        </div>
                        <div className="relative w-full md:w-96 group">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="Search by name or encrypted ID (email)..."
                                className="pl-10 h-11 border-border/80 focus:border-primary/50 transition-all rounded-xl"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-20 text-center text-muted-foreground italic animate-pulse">Scanning server records...</div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="p-20 text-center text-muted-foreground italic font-medium">No identities match your search parameters.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-secondary/30 text-muted-foreground text-xs uppercase font-extrabold tracking-widest border-b border-border/20">
                                    <tr>
                                        <th className="px-6 py-4 text-left">Account Holder</th>
                                        <th className="px-6 py-4 text-left">Security Status</th>
                                        <th className="px-6 py-4 text-left">Authorization Level</th>
                                        <th className="px-6 py-4 text-right">Operation</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/20">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-secondary/10 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm ${user.is_active ? 'bg-primary/10 text-primary' : 'bg-red-100 text-red-600'}`}>
                                                        {user.username.slice(0, 1).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-extrabold text-foreground group-hover:text-primary transition-colors">{user.username}</div>
                                                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                                            <Mail className="w-3 h-3 opacity-70" /> {user.email}
                                                        </div>
                                                        <div className="text-[10px] text-muted-foreground/60 flex items-center gap-1.5 mt-1 font-mono uppercase tracking-tighter">
                                                            <Calendar className="w-2.5 h-2.5" /> Enrolled: {new Date(user.date_joined).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${user.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-green-600' : 'bg-red-600'} animate-pulse`} />
                                                    {user.is_active ? 'Active' : 'Account Frozen'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                                    {user.is_staff ? (
                                                        <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                                                            <ShieldAlert className="w-4 h-4" /> System Staff
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5">
                                                            Enrolled User
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <Button
                                                    variant={user.is_active ? "ghost" : "default"}
                                                    size="sm"
                                                    onClick={() => handleToggleStatus(user)}
                                                    disabled={actionLoading === user.id}
                                                    className={`h-11 px-6 rounded-xl font-bold tracking-tight transition-all ${user.is_active ? 'hover:bg-red-50 hover:text-red-600 text-muted-foreground' : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/20'}`}
                                                >
                                                    {actionLoading === user.id ? (
                                                        <div className="w-5 h-5 border-2 border-current border-t-transparent animate-spin rounded-full" />
                                                    ) : user.is_active ? (
                                                        <><UserMinus className="w-4 h-4 mr-2" /> Ban User</>
                                                    ) : (
                                                        <><UserCheck className="w-4 h-4 mr-2" /> Revoke Ban</>
                                                    )}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
