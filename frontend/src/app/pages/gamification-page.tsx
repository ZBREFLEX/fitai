import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Trophy, Award, Star, Zap, Target, TrendingUp, Flame, Heart, Medal, Crown, Sparkles, CheckCircle } from 'lucide-react';

const badges = [
  { icon: Flame, name: 'Week Warrior', description: '7-day streak', earned: true, date: '2026-02-10' },
  { icon: Zap, name: 'First Workout', description: 'Complete first session', earned: true, date: '2026-01-16' },
  { icon: Target, name: 'Goal Setter', description: 'Set fitness goals', earned: true, date: '2026-01-15' },
  { icon: Sparkles, name: 'Quick Start', description: 'Join within 24h', earned: true, date: '2026-01-15' },
  { icon: Trophy, name: 'Target Achieved', description: 'Reach weight goal', earned: true, date: '2026-02-17' },
  { icon: TrendingUp, name: 'Progress Master', description: 'Log 30 days', earned: true, date: '2026-02-14' },
  { icon: Medal, name: 'Consistency King', description: '30-day streak', earned: false, date: null },
  { icon: Crown, name: 'Elite Performer', description: '100 workouts', earned: false, date: null },
];

const achievements = [
  { 
    title: 'Workout Streak', 
    current: 12, 
    target: 30, 
    icon: Flame,
    color: '#ffffff',
    description: 'Consecutive days with activity'
  },
  { 
    title: 'Total Workouts', 
    current: 45, 
    target: 100, 
    icon: Zap,
    color: '#a0a0a0',
    description: 'Lifetime training sessions'
  },
  { 
    title: 'Calories Burned', 
    current: 18500, 
    target: 50000, 
    icon: TrendingUp,
    color: '#ffffff',
    description: 'Total calories burned'
  },
  { 
    title: 'Perfect Weeks', 
    current: 3, 
    target: 10, 
    icon: Star,
    color: '#a0a0a0',
    description: 'Weeks with all goals met'
  },
];

const leaderboard = [
  { rank: 1, name: 'Sarah M.', points: 2850, level: 'Elite' },
  { rank: 2, name: 'Mike T.', points: 2720, level: 'Elite' },
  { rank: 3, name: 'John Doe', points: 2580, level: 'Advanced', isUser: true },
  { rank: 4, name: 'Emma L.', points: 2450, level: 'Advanced' },
  { rank: 5, name: 'Chris P.', points: 2340, level: 'Advanced' },
];

export function GamificationPage() {
  const totalPoints = 2580;
  const currentLevel = 'Advanced';
  const pointsToNextLevel = 3000 - totalPoints;
  const levelProgress = (totalPoints / 3000) * 100;

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
                <div className="text-2xl sm:text-3xl font-bold">{badges.filter(b => b.earned).length}/{badges.length}</div>
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
                {pointsToNextLevel} points until Elite level
              </p>
            </div>
            <Badge variant="outline" className="border-primary text-primary px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-lg w-fit">
              Level {currentLevel === 'Beginner' ? '1' : currentLevel === 'Intermediate' ? '2' : currentLevel === 'Advanced' ? '3' : '4'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={levelProgress} className="h-3 sm:h-4 mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="font-bold text-primary-foreground text-sm sm:text-base">1</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold">Beginner</div>
              <div className="text-xs text-muted-foreground">0-1000 pts</div>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="font-bold text-primary-foreground text-sm sm:text-base">2</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold">Intermediate</div>
              <div className="text-xs text-muted-foreground">1000-2000 pts</div>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="font-bold text-primary-foreground text-sm sm:text-base">3</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold">Advanced</div>
              <div className="text-xs text-muted-foreground">2000-3000 pts</div>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary border-2 border-primary rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="font-bold text-sm sm:text-base">4</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold">Elite</div>
              <div className="text-xs text-muted-foreground">3000+ pts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 sm:mb-8">
        {/* Achievements Progress */}
        <div className="lg:col-span-2">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Active Challenges</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">Complete challenges to earn more points</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 sm:space-y-6">
                {achievements.map((achievement, index) => {
                  const Icon = achievement.icon;
                  const progress = (achievement.current / achievement.target) * 100;
                  
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-3 gap-3">
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: achievement.color }} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm sm:text-base truncate">{achievement.title}</div>
                            <div className="text-xs text-muted-foreground truncate">{achievement.description}</div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-xs sm:text-sm">{achievement.current.toLocaleString()} / {achievement.target.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">{Math.round(progress)}%</div>
                        </div>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Leaderboard</CardTitle>
            <p className="text-xs sm:text-sm text-muted-foreground">Top performers this month</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leaderboard.map((user) => (
                <div
                  key={user.rank}
                  className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg ${
                    user.isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                  }`}
                >
                  <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm ${
                    user.rank === 1 ? 'bg-[#FFD700] text-black' :
                    user.rank === 2 ? 'bg-[#C0C0C0] text-black' :
                    user.rank === 3 ? 'bg-[#CD7F32] text-black' :
                    user.isUser ? 'bg-background text-foreground' : 'bg-muted'
                  }`}>
                    {user.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs sm:text-sm truncate">{user.name}</div>
                    <div className={`text-xs ${user.isUser ? 'opacity-80' : 'text-muted-foreground'} truncate`}>
                      {user.level}
                    </div>
                  </div>
                  <div className="font-bold text-xs sm:text-sm">{user.points}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Badges */}
      <Card className="bg-card border-border mb-6 sm:mb-8">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Badge Collection</CardTitle>
          <p className="text-xs sm:text-sm text-muted-foreground">Unlock achievements as you progress</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {badges.map((badge, index) => {
              const BadgeIcon = badge.icon;
              return (
                <div
                  key={index}
                  className={`bg-secondary border rounded-lg p-4 sm:p-6 text-center transition-all ${
                    badge.earned 
                      ? 'border-primary hover:border-primary/80' 
                      : 'border-border opacity-40'
                  }`}
                >
                  <div className="mb-3 flex items-center justify-center">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center ${
                      badge.earned ? 'bg-primary' : 'bg-muted'
                    }`}>
                      <BadgeIcon className={`w-6 h-6 sm:w-8 sm:h-8 ${
                        badge.earned ? 'text-primary-foreground' : 'text-muted-foreground'
                      }`} />
                    </div>
                  </div>
                  <h4 className="font-semibold mb-1 text-sm sm:text-base">{badge.name}</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">{badge.description}</p>
                  {badge.earned ? (
                    <Badge variant="outline" className="border-primary text-primary text-xs">
                      Earned {badge.date}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-border text-muted-foreground text-xs">
                      Locked
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Points System Info */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">How to Earn Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-secondary rounded-lg p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold mb-2">+50</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Complete a workout</div>
            </div>
            <div className="bg-secondary rounded-lg p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold mb-2">+30</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Hit calorie target</div>
            </div>
            <div className="bg-secondary rounded-lg p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold mb-2">+100</div>
              <div className="text-xs sm:text-sm text-muted-foreground">7-day streak bonus</div>
            </div>
            <div className="bg-secondary rounded-lg p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold mb-2">+20</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Log your meals</div>
            </div>
            <div className="bg-secondary rounded-lg p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold mb-2">+150</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Unlock a badge</div>
            </div>
            <div className="bg-secondary rounded-lg p-3 sm:p-4">
              <div className="text-xl sm:text-2xl font-bold mb-2">+200</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Reach weight milestone</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
