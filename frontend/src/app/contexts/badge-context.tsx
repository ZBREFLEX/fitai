import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { gamificationAPI } from '../../services/api';

interface Badge {
    id: number;
    name: string;
    description: string;
    icon_name: string;
}

interface NewBadge {
    id: number;
    badge: Badge;
    date_earned: string;
}

interface BadgeUnlockContextType {
    newBadges: NewBadge[];
    showNextBadge: () => void;
    checkNewBadges: (additionalBadges?: NewBadge[]) => void;
}

const BadgeUnlockContext = createContext<BadgeUnlockContextType | undefined>(undefined);

export const BadgeUnlockProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [newBadges, setNewBadges] = useState<NewBadge[]>([]);

    const checkNewBadges = async (additionalBadges?: NewBadge[]) => {
        try {
            if (additionalBadges && additionalBadges.length > 0) {
                // Merge with existing queue if any
                setNewBadges(prev => [...prev, ...additionalBadges]);
                return;
            }

            // Fetch from API to check for unacknowledged badges (e.g., on manual refresh or page load)
            const data = await gamificationAPI.getStatus();
            if (data.new_badges && data.new_badges.length > 0) {
                const unseenBadges = data.new_badges.filter((nb: any) =>
                    !newBadges.some(existing => existing.id === nb.id)
                );
                if (unseenBadges.length > 0) {
                    setNewBadges(prev => [...prev, ...unseenBadges]);
                }
            }
        } catch (err) {
            console.error("Failed to check for new badges:", err);
        }
    };

    const showNextBadge = async () => {
        if (newBadges.length === 0) return;

        const currentBadge = newBadges[0];
        try {
            // Mark as seen in backend
            await gamificationAPI.markSeen([currentBadge.badge.id]);
            // Remove from queue
            setNewBadges(prev => prev.slice(1));
        } catch (err) {
            console.error("Failed to mark badge as seen:", err);
            // Still remove from local queue to prevent stuck popup
            setNewBadges(prev => prev.slice(1));
        }
    };

    // Check periodically or on mount
    useEffect(() => {
        checkNewBadges();
        // Optional: socket or poll for badges in background
        const interval = setInterval(checkNewBadges, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    return (
        <BadgeUnlockContext.Provider value={{ newBadges, showNextBadge, checkNewBadges }}>
            {children}
        </BadgeUnlockContext.Provider>
    );
};

export const useBadgeUnlock = () => {
    const context = useContext(BadgeUnlockContext);
    if (context === undefined) {
        throw new Error('useBadgeUnlock must be used within a BadgeUnlockProvider');
    }
    return context;
};
