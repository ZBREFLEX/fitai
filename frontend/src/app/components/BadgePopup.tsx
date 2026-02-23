import React, { useEffect, useState } from 'react';
import { useBadgeUnlock } from '../contexts/badge-context';
import { Trophy, X, Star, Sparkles, Award } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Button } from './ui/button';

export const BadgePopup: React.FC = () => {
    const { newBadges, showNextBadge } = useBadgeUnlock();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (newBadges.length > 0) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [newBadges]);

    if (!isVisible || newBadges.length === 0) return null;

    const current = newBadges[0].badge;

    // Dynamically get the icon
    const IconComponent = (LucideIcons as any)[current.icon_name] || Award;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl animate-in fade-in duration-500">
            <div className="relative w-full max-w-sm bg-card border-2 border-primary/20 rounded-[2.5rem] shadow-2xl p-8 overflow-hidden animate-in zoom-in slide-in-from-bottom-10 duration-500">
                {/* Animated Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-40 h-40 bg-primary/10 rounded-full blur-3xl animate-pulse delay-700" />
                </div>

                <div className="relative z-10 flex flex-col items-center text-center">
                    {/* Badge Icon Container */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-ping opacity-50" />
                        <div className="relative w-24 h-24 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center shadow-xl border-4 border-background ring-4 ring-primary/20">
                            <IconComponent className="w-12 h-12 text-primary-foreground animate-bounce" />
                        </div>
                        <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-950 p-1.5 rounded-full shadow-lg border-2 border-background">
                            <Star className="w-4 h-4 fill-current" />
                        </div>
                    </div>

                    <div className="space-y-2 mb-8">
                        <div className="flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">New Achievement</span>
                            <Sparkles className="w-4 h-4 text-primary" />
                        </div>
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-foreground">
                            {current.name}
                        </h2>
                        <p className="text-sm font-medium text-muted-foreground leading-relaxed px-4">
                            {current.description}
                        </p>
                    </div>

                    <Button
                        onClick={showNextBadge}
                        className="w-full h-14 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform active:scale-95"
                    >
                        Awesome!
                    </Button>

                    <button
                        onClick={showNextBadge}
                        className="mt-4 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest hover:text-foreground transition-colors"
                    >
                        Close
                    </button>
                </div>

                {/* Confetti-like stars (Visual Polish) */}
                <div className="absolute inset-0 pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                        <Star
                            key={i}
                            className={`absolute text-primary/30 w-3 h-3 animate-float-${i}`}
                            style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${i * 0.5}s`,
                                opacity: 0.4
                            }}
                        />
                    ))}
                </div>
            </div>

            <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        ${[...Array(6)].map((_, i) => `
          .animate-float-${i} {
            animation: float ${2 + Math.random() * 2}s ease-in-out infinite;
          }
        `).join('')}
      `}</style>
        </div>
    );
};
