import { useTheme } from '../context/useTheme';

const defaultTheme = { bg: '#f3f4f6', accent: '#4f46e5', textFaint: '#9ca3af' };

export default function LoadingSpinner() {
    const result = useTheme();
    const theme = result?.theme || defaultTheme;

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            minHeight: '60vh', background: theme.bg, gap: '1.25rem'
        }}>
            {/* Animated logo icon */}
            <div style={{
                width: '64px', height: '64px', borderRadius: '18px',
                background: `linear-gradient(135deg, #4338ca, #6366f1)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '1.5rem',
                animation: 'spinnerPulse 1.5s ease-in-out infinite',
                boxShadow: '0 8px 30px rgba(99,102,241,0.25)'
            }}>
                <i className="fas fa-people-group"></i>
            </div>

            {/* Spinning ring */}
            <div style={{
                width: '36px', height: '36px',
                border: `3px solid ${theme.accent}18`,
                borderTop: `3px solid ${theme.accent}`,
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite'
            }} />

            {/* Loading text */}
            <p style={{
                color: theme.textFaint || '#9ca3af', fontSize: '0.88rem',
                fontWeight: '500', letterSpacing: '0.5px'
            }}>
                Loading...
            </p>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes spinnerPulse {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(0.92); opacity: 0.7; }
                }
            `}</style>
        </div>
    );
}
