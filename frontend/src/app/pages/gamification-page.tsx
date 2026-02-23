import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge as UIBadge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Trophy, Award, Star, Zap, Target, TrendingUp, Flame, Heart, Medal, Crown, Sparkles, CheckCircle, Dumbbell } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { gamificationAPI } from '../../services/api';

interface BadgeData {
  id: number;
  name: string;
  description: string;
  icon_name: string;
  earned?: boolean;
  date_earned?: string;
}

interface GamificationStatus {
  total_points: number;
  xp: number;
  level: number;
  level_name: string;
  badges: any[];
}

const leaderboard = [
  { rank: 1, name: 'Sarah M.', points: 2850, level: 'Elite' },
  { rank: 2, name: 'Mike T.', points: 2720, level: 'Elite' },
  { rank: 3, name: 'You', points: 0, level: 'Beginner', isUser: true },
  { rank: 4, name: 'Emma L.', points: 2450, level: 'Advanced' },
  { rank: 5, name: 'Chris P.', points: 2340, level: 'Advanced' },
];

export function GamificationPage() {
  const [status, setStatus] = useState<GamificationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await gamificationAPI.getStatus();
        setStatus(data);
      } catch (err) {
        console.error("Failed to fetch gamification status:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, []);

  if (loading || !status) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalPoints = status.total_points;
  const currentLevel = status.level_name;
  const levelProgress = (status.xp % 1000) / 10; // Simple XP logic for UI demo
  const pointsToNextLevel = 1000 - (status.xp % 1000);

  // Update user in leaderboard mock
  const updatedLeaderboard = leaderboard.map(user =>
    user.isUser ? { ...user, points: totalPoints, level: currentLevel } : user
  ).sort((a, b) => b.points - a.points);

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Achievements & Rewards</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Track your progress and unlock new milestones</p>
      </div>

      {/* Level & Points */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-secondary rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div>
                <div className="text-xs sm:text-sm text-muted-foreground mb-1">Current Level</div>
                <div className="text-2xl sm:text-3xl font-bold">{currentLevel}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-secondary rounded-full flex items-center justify-center">
                <Star className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div>
                <div className="text-xs sm:text-sm text-muted-foreground mb-1">Total Points</div>
                <div className="text-2xl sm:text-3xl font-bold">{totalPoints.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border sm:col-span-2 lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-secondary rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div>
                <div className="text-xs sm:text-sm text-muted-foreground mb-1">Badges Earned</div>
                <div className="text-2xl sm:text-3xl font-bold">{status.badges.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card className="bg-card border-border mb-6 sm:mb-8">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-lg sm:text-xl">Level Progress</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {pointsToNextLevel} XP until next level
              </p>
            </div>
            <UIBadge variant="outline" className="border-primary text-primary px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-lg w-fit">
              Level {status.level}
            </UIBadge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={levelProgress} className="h-3 sm:h-4 mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
            <div className={`text-center ${status.level >= 1 ? 'opacity-100' : 'opacity-40'}`}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2 text-primary-foreground">
                <span className="font-bold text-sm sm:text-base">1</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold">Beginner</div>
            </div>
            <div className={`text-center ${status.level >= 2 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${status.level >= 2 ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                <span className="font-bold text-sm sm:text-base">2</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold">Intermediate</div>
            </div>
            <div className={`text-center ${status.level >= 3 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${status.level >= 3 ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                <span className="font-bold text-sm sm:text-base">3</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold">Advanced</div>
            </div>
            <div className={`text-center ${status.level >= 4 ? 'opacity-100' : 'opacity-40'}`}>
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${status.level >= 4 ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                <span className="font-bold text-sm sm:text-base">4</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold">Elite</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 sm:mb-8">
        {/* Badges */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Your Badge Collection</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">Recent achievements earned</p>
            </CardHeader>
            <CardContent>
              {status.badges.length === 0 ? (
                <div className="text-center py-12 bg-secondary/50 rounded-2xl border-2 border-dashed border-border">
                  <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-bold">No Badges Yet</h3>
                  <p className="text-sm text-muted-foreground">Complete workouts and log meals to earn your first badge!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {status.badges.map((ub: any) => {
                    const IconComponent = (LucideIcons as any)[ub.badge.icon_name] || Award;
                    return (
                      <div key={ub.id} className="bg-secondary border border-primary/20 rounded-2xl p-4 text-center">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg ring-4 ring-primary/10">
                          <IconComponent className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <h4 className="font-bold text-sm mb-1">{ub.badge.name}</h4>
                        <p className="text-[10px] text-muted-foreground mb-2 line-clamp-2">{ub.badge.description}</p>
                        <UIBadge variant="secondary" className="text-[10px] bg-primary/10 text-primary">
                          {new Date(ub.date_earned).toLocaleDateString()}
                        </UIBadge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">World Ranking</CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground">See how you stack up</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {updatedLeaderboard.map((user, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${user.isUser ? 'bg-primary text-primary-foreground ring-4 ring-primary/20 scale-[1.02]' : 'bg-secondary hover:bg-secondary/80'
                    }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${idx === 0 ? 'bg-[#FFD700] text-black' :
                      idx === 1 ? 'bg-[#C0C0C0] text-black' :
                        idx === 2 ? 'bg-[#CD7F32] text-black' :
                          user.isUser ? 'bg-white text-primary' : 'bg-muted'
                    }`}>
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate">{user.name}</div>
                    <div className={`text-[10px] uppercase font-black tracking-tighter ${user.isUser ? 'opacity-80' : 'text-primary'}`}>
                      {user.level}
                    </div>
                  </div>
                  <div className="font-black italic text-sm">{user.points.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Points System Info */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">The Rewards System</CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Consistency is key to climbing the ranks.</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-secondary rounded-2xl p-4 border border-border">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                <Dumbbell className="w-5 h-5 text-primary" />
              </div>
              <div className="text-xl font-black italic">+50</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Workout Session</div>
            </div>
            <div className="bg-secondary rounded-2xl p-4 border border-border">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                <Heart className="w-5 h-5 text-primary" />
              </div>
              <div className="text-xl font-black italic">+20</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Daily Meal Log</div>
            </div>
            <div className="bg-secondary rounded-2xl p-4 border border-border">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                <Flame className="w-5 h-5 text-primary" />
              </div>
              <div className="text-xl font-black italic">+100</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">7-Day Streak</div>
            </div>
            <div className="bg-secondary rounded-2xl p-4 border border-border">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="text-xl font-black italic">+150</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Badge Unlock</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
