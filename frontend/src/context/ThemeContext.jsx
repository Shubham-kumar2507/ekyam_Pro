import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

// Light and dark color palettes
const themes = {
    light: {
        name: 'light',
        // Backgrounds
        bg: '#f3f4f6',
        bgCard: '#fff',
        bgCardHover: '#f9fafb',
        bgInput: '#f9fafb',
        bgMuted: '#e5e7eb',
        bgOverlay: 'rgba(0,0,0,0.04)',
        // Text
        text: '#1f2937',
        textSecondary: '#4b5563',
        textMuted: '#6b7280',
        textFaint: '#9ca3af',
        // Borders
        border: '#e5e7eb',
        borderLight: '#f3f4f6',
        // Cards & Shadows
        shadow: '0 2px 10px rgba(0,0,0,0.05)',
        shadowHover: '0 6px 20px rgba(0,0,0,0.08)',
        shadowLg: '0 8px 30px rgba(0,0,0,0.08)',
        // Navbar
        navBg: '#4338ca',
        navText: '#e0e7ff',
        navHover: '#fff',
        navDropBg: '#fff',
        navDropText: '#374151',
        navDropHover: '#eef2ff',
        navDropBorder: '#f3f4f6',
        navMobileBg: '#3730a3',
        // Footer
        footerBg: '#1f2937',
        footerText: '#9ca3af',
        footerBorder: '#374151',
        // Accent
        accent: '#4f46e5',
        accentLight: '#eef2ff',
        accentText: '#4f46e5',
        // Heroes / Gradients
        heroBg: 'linear-gradient(135deg, #312e81 0%, #4338ca 50%, #6366f1 100%)',
        // Status
        error: '#dc2626',
        errorBg: '#fef2f2',
        errorBorder: '#fecaca',
        success: '#059669',
        successBg: '#ecfdf5',
        warning: '#d97706',
        warningBg: '#fffbeb',
        // Specific UI
        tabActiveBg: '#fff',
        tabActiveText: '#4f46e5',
        tabInactiveText: '#9ca3af',
        badgeBg: '#e5e7eb',
    },
    dark: {
        name: 'dark',
        // Backgrounds
        bg: '#0f172a',
        bgCard: '#1e293b',
        bgCardHover: '#334155',
        bgInput: '#1e293b',
        bgMuted: '#334155',
        bgOverlay: 'rgba(255,255,255,0.04)',
        // Text
        text: '#f1f5f9',
        textSecondary: '#cbd5e1',
        textMuted: '#94a3b8',
        textFaint: '#64748b',
        // Borders
        border: '#334155',
        borderLight: '#1e293b',
        // Cards & Shadows
        shadow: '0 2px 10px rgba(0,0,0,0.3)',
        shadowHover: '0 6px 20px rgba(0,0,0,0.4)',
        shadowLg: '0 8px 30px rgba(0,0,0,0.4)',
        // Navbar
        navBg: '#1e293b',
        navText: '#94a3b8',
        navHover: '#f1f5f9',
        navDropBg: '#1e293b',
        navDropText: '#e2e8f0',
        navDropHover: '#334155',
        navDropBorder: '#334155',
        navMobileBg: '#0f172a',
        // Footer
        footerBg: '#0f172a',
        footerText: '#64748b',
        footerBorder: '#1e293b',
        // Accent
        accent: '#6366f1',
        accentLight: '#1e1b4b',
        accentText: '#a5b4fc',
        // Heroes / Gradients
        heroBg: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        // Status
        error: '#f87171',
        errorBg: '#450a0a',
        errorBorder: '#7f1d1d',
        success: '#34d399',
        successBg: '#064e3b',
        warning: '#fbbf24',
        warningBg: '#451a03',
        // Specific UI
        tabActiveBg: '#334155',
        tabActiveText: '#a5b4fc',
        tabInactiveText: '#64748b',
        badgeBg: '#334155',
    }
};

export function ThemeProvider({ children }) {
    const [mode, setMode] = useState(() => {
        const saved = localStorage.getItem('ekyam_theme');
        return saved || 'light';
    });

    const toggleTheme = () => {
        setMode(prev => {
            const next = prev === 'light' ? 'dark' : 'light';
            localStorage.setItem('ekyam_theme', next);
            return next;
        });
    };

    const theme = themes[mode];

    // Apply body-level styles via data attribute
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', mode);
        document.body.style.backgroundColor = theme.bg;
        document.body.style.color = theme.text;
    }, [mode, theme]);

    return (
        <ThemeContext.Provider value={{ theme, mode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

// Re-export useTheme for backwards compatibility
export { useTheme } from './useTheme';
