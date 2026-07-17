import { useState, useEffect } from 'react';

export default function ScrollToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 300);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollUp = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    if (!visible) return null;

    return (
        <button
            onClick={scrollUp}
            aria-label="Back to top"
            style={{
                position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 999,
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #4338ca, #6366f1)',
                color: '#fff', border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.2rem',
                animation: 'fadeIn 0.3s ease-out',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(99,102,241,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.4)'; }}
        >
            <i className="fas fa-arrow-up"></i>
        </button>
    );
}
