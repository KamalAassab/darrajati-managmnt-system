'use client';

import { useEffect, useState, useCallback } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
// const IDLE_TIMEOUT_MS = 10 * 1000; // 10 seconds (for testing)

type ActivityEvent = MouseEvent | KeyboardEvent | TouchEvent | ScrollEvent;

export function SessionTimeout() {
    const router = useRouter();
    const [lastActivity, setLastActivity] = useState<number>(Date.now());

    const handleActivity = useCallback(() => {
        setLastActivity(Date.now());
    }, []);

    useEffect(() => {
        // Events to track activity
        const events = [
            'mousedown',
            'mousemove',
            'keydown',
            'scroll',
            'touchstart',
            'click',
        ];

        // Add event listeners
        events.forEach((event) => {
            window.addEventListener(event, handleActivity as any);
        });

        // Check for inactivity every second
        const intervalId = setInterval(() => {
            const now = Date.now();
            const timeSinceLastActivity = now - lastActivity;

            if (timeSinceLastActivity >= IDLE_TIMEOUT_MS) {
                // User is idle
                console.log('User idle for too long. Signing out...');

                // Clear storage if we used any (optional)

                // Sign out and redirect
                signOut({ redirect: false }).then(() => {
                    router.push('/?error=SessionExpired');
                    router.refresh();
                });
            }
        }, 1000);

        return () => {
            // Cleanup
            events.forEach((event) => {
                window.removeEventListener(event, handleActivity as any);
            });
            clearInterval(intervalId);
        };
    }, [lastActivity, handleActivity, router]);

    return null; // This component doesn't render anything
}
