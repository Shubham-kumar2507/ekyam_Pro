import { useState, useEffect } from 'react';
import { ThemeContext } from './ThemeContextValue';
import themes from './themes';

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
