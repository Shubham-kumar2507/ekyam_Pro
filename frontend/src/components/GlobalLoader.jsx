import { useEffect, useState } from 'react';
import { useTheme } from '../context/useTheme';

const defaultTheme = { bg: '#f3f4f6', accent: '#4f46e5', textFaint: '#9ca3af', textSecondary: '#4b5563', bgCard: '#ffffff', border: '#e5e7eb' };

export default function GlobalLoader() {
    const [isVisible, setIsVisible] = useState(false);
    const result = useTheme();
    const theme = result?.theme || defaultTheme;

    useEffect(() => {
        let activeRequests = 0;
        let safetyTimer = null;
        let delayTimer = null;

        const handleStart = () => {
            activeRequests++;
            // Only show the loader if the request takes longer than 600ms
            // This prevents the popup from flashing on fast requests
            clearTimeout(delayTimer);
            delayTimer = setTimeout(() => {
                if (activeRequests > 0) setIsVisible(true);
            }, 600);
            // Safety net: force-clear after 35s
            clearTimeout(safetyTimer);
            safetyTimer = setTimeout(() => {
                activeRequests = 0;
                setIsVisible(false);
            }, 35000);
        };

        const handleEnd = () => {
            activeRequests--;
            if (activeRequests <= 0) {
                activeRequests = 0;
                clearTimeout(safetyTimer);
                clearTimeout(delayTimer);
                setIsVisible(false);
            }
        };

        window.addEventListener('api-load-start', handleStart);
        window.addEventListener('api-load-end', handleEnd);

        return () => {
            window.removeEventListener('api-load-start', handleStart);
            window.removeEventListener('api-load-end', handleEnd);
            clearTimeout(safetyTimer);
            clearTimeout(delayTimer);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <>
            {/* Subtle top progress bar instead of blocking modal */}
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '3px',
                zIndex: 99999, background: `${theme.accent || '#4f46e5'}15`, overflow: 'hidden'
            }}>
                <div style={{
                    height: '100%', width: '40%',
                    background: `linear-gradient(90deg, transparent, ${theme.accent || '#4f46e5'}, transparent)`,
                    borderRadius: '2px',
                    animation: 'globalLoadingBar 1.2s ease-in-out infinite'
                }} />
            </div>

            <style>{`
                @keyframes globalLoadingBar {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(350%); }
                }
            `}</style>
        </>
    );
}
