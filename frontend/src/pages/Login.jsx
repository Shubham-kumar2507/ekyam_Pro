import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useTheme } from '../context/useTheme';

/* ═══════════════════════════════════════════
   STYLES  (same token system as Home)
   ═══════════════════════════════════════════ */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Sans:wght@400;500;600&display=swap');

  :root {
    --font-display: 'Cabinet Grotesk', sans-serif;
    --font-body: 'Instrument Sans', sans-serif;
    --ease-spring: cubic-bezier(.22,1,.36,1);
  }

  [data-theme="light"] {
    --bg: #f5f4f0;
    --bg-surface: #ffffff;
    --bg-subtle: #eeecea;
    --border: rgba(0,0,0,0.08);
    --border-hover: rgba(0,0,0,0.18);
    --text-primary: #18181b;
    --text-secondary: #52525b;
    --text-muted: #a1a1aa;
    --accent: #4f46e5;
    --accent-soft: rgba(79,70,229,0.07);
    --accent-border: rgba(79,70,229,0.2);
    --accent-text: #4338ca;
    --purple: #7c3aed;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.07);
    --shadow-md: 0 4px 20px rgba(0,0,0,0.09), 0 1px 4px rgba(0,0,0,0.05);
    --shadow-lg: 0 12px 40px rgba(0,0,0,0.11), 0 4px 12px rgba(0,0,0,0.06);
    --error-bg: #fef2f2;
    --error-border: rgba(220,38,38,0.2);
    --error-text: #dc2626;
  }

  [data-theme="dark"] {
    --bg: #09090d;
    --bg-surface: #111118;
    --bg-subtle: #16161e;
    --border: rgba(255,255,255,0.07);
    --border-hover: rgba(255,255,255,0.18);
    --text-primary: #f4f4f5;
    --text-secondary: #a1a1aa;
    --text-muted: #52525b;
    --accent: #6366f1;
    --accent-soft: rgba(99,102,241,0.1);
    --accent-border: rgba(99,102,241,0.25);
    --accent-text: #a5b4fc;
    --purple: #a78bfa;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
    --shadow-md: 0 4px 20px rgba(0,0,0,0.45);
    --shadow-lg: 0 12px 40px rgba(0,0,0,0.55);
    --error-bg: rgba(220,38,38,0.08);
    --error-border: rgba(220,38,38,0.25);
    --error-text: #f87171;
  }

  .ek-login * { box-sizing: border-box; margin: 0; padding: 0; }

  .ek-login {
    font-family: var(--font-body);
    min-height: 100vh;
    background: var(--bg);
    display: flex; align-items: center; justify-content: center;
    padding: 2rem 1rem;
    position: relative; overflow: hidden;
    transition: background 0.35s ease;
  }

  /* ── Grid bg ── */
  .ek-login-grid {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(var(--border) 1px, transparent 1px),
      linear-gradient(90deg, var(--border) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent);
    -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent);
    opacity: 0.55;
    transition: background-image 0.35s;
  }

  /* ── Glow orb ── */
  .ek-login-glow {
    position: absolute; border-radius: 50%; pointer-events: none;
    background: radial-gradient(circle, var(--accent-soft) 0%, transparent 70%);
  }

  /* ── Card ── */
  .ek-login-card {
    width: 100%; max-width: 420px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    box-shadow: var(--shadow-lg);
    overflow: hidden;
    position: relative; z-index: 2;
    transition: background 0.35s, border-color 0.35s;
    animation: card-in 0.7s var(--ease-spring) both;
  }
  @keyframes card-in {
    from { opacity: 0; transform: translateY(24px) scale(0.97); }
    to   { opacity: 1; transform: none; }
  }

  /* ── Card header ── */
  .ek-login-header {
    padding: 2.5rem 2rem 2rem;
    text-align: center;
    border-bottom: 1px solid var(--border);
    position: relative;
    overflow: hidden;
  }
  .ek-login-header::before {
    content: '';
    position: absolute; top: 0; left: 50%; transform: translateX(-50%);
    width: 55%; height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent), var(--purple), transparent);
  }
  .ek-login-header::after {
    content: '';
    position: absolute; inset: 0; pointer-events: none;
    background: radial-gradient(ellipse 60% 50% at 50% 0%, var(--accent-soft), transparent);
  }

  /* ── Icon orb ── */
  .ek-login-icon {
    width: 56px; height: 56px; border-radius: 16px;
    background: linear-gradient(135deg, var(--accent), var(--purple));
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1rem; font-size: 1.35rem; color: #fff;
    box-shadow: 0 8px 24px var(--accent-border);
    position: relative; z-index: 1;
  }

  /* ── Body ── */
  .ek-login-body { padding: 2rem; }

  /* ── Label ── */
  .ek-field-label {
    display: flex; align-items: center; gap: 0.4rem;
    font-size: 0.8rem; font-weight: 600;
    color: var(--text-secondary);
    letter-spacing: 0.3px;
    margin-bottom: 0.45rem;
  }

  /* ── Input ── */
  .ek-input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid var(--border);
    border-radius: 11px;
    font-size: 0.93rem;
    font-family: var(--font-body);
    background: var(--bg-subtle);
    color: var(--text-primary);
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
  }
  .ek-input::placeholder { color: var(--text-muted); }
  .ek-input:focus {
    border-color: var(--accent);
    background: var(--bg-surface);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }

  /* ── Error ── */
  .ek-error {
    background: var(--error-bg);
    border: 1px solid var(--error-border);
    color: var(--error-text);
    padding: 0.7rem 1rem;
    border-radius: 10px;
    font-size: 0.86rem;
    display: flex; align-items: center; gap: 0.5rem;
    margin-bottom: 1.25rem;
    animation: err-in 0.3s var(--ease-spring);
  }
  @keyframes err-in { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:none; } }

  /* ── Submit button ── */
  .ek-submit {
    width: 100%; padding: 0.875rem;
    background: var(--text-primary);
    color: var(--bg);
    border: none; border-radius: 11px;
    font-family: var(--font-display);
    font-size: 0.97rem; font-weight: 800;
    cursor: pointer; letter-spacing: -0.2px;
    transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 0.4rem;
  }
  .ek-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: var(--shadow-lg); opacity: 0.9; }
  .ek-submit:active:not(:disabled) { transform: none; }
  .ek-submit:disabled { opacity: 0.45; cursor: not-allowed; }

  /* ── Divider ── */
  .ek-divider {
    display: flex; align-items: center; gap: 0.75rem;
    margin: 1.5rem 0; color: var(--text-muted); font-size: 0.78rem;
  }
  .ek-divider::before, .ek-divider::after {
    content: ''; flex: 1; height: 1px; background: var(--border);
  }

  /* ── Section label ── */
  .ek-section-label {
    display: inline-flex; align-items: center; gap: 0.5rem;
    font-size: 0.68rem; font-weight: 700; letter-spacing: 2.5px;
    text-transform: uppercase; color: var(--text-muted);
    margin-bottom: 0.3rem;
  }
  .ek-section-label::before, .ek-section-label::after {
    content: ''; width: 12px; height: 1px;
    background: var(--border-hover); display: inline-block;
  }

  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { animation: spin 0.8s linear infinite; display: inline-block; }
`;

function InjectCSS() {
    useEffect(() => {
        const id = 'ek-login-css';
        if (!document.getElementById(id)) {
            const s = document.createElement('style');
            s.id = id; s.textContent = CSS;
            document.head.appendChild(s);
        }
    }, []);
    return null;
}

/* ═══════════════════════════════════════════
   LOGIN
   ═══════════════════════════════════════════ */
export default function Login() {
    const { login } = useAuth();
    const { mode } = useTheme();
    const navigate = useNavigate();

    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            await login(form.username, form.password);
            navigate('/dashboard');
        } catch (_err) {
            const data = _err.response?.data;
            if (_err.response?.status === 403 && data?.requiresVerification) {
                navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
            } else {
                setError(data?.message || 'Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="ek-login" data-theme={mode}>
            <InjectCSS />

            {/* Background grid */}
            <div className="ek-login-grid" />

            {/* Ambient glow orbs */}
            <div className="ek-login-glow" style={{ width: 600, height: 400, top: '-10%', left: '50%', transform: 'translateX(-50%)' }} />
            <div className="ek-login-glow" style={{ width: 300, height: 300, bottom: '5%', right: '-5%', opacity: 0.6 }} />

            {/* Card */}
            <div className="ek-login-card">

                {/* ── Header ── */}
                <div className="ek-login-header">
                    <div className="ek-login-icon">
                        <i className="fas fa-user-lock" />
                    </div>
                    <div className="ek-section-label" style={{ justifyContent: 'center', marginBottom: '0.5rem' }}>
                        EKYAM Platform
                    </div>
                    <h1 style={{
                        fontFamily: 'Cabinet Grotesk, sans-serif',
                        fontSize: '1.65rem', fontWeight: '900',
                        color: 'var(--text-primary)', letterSpacing: '-0.5px',
                        position: 'relative', zIndex: 1, marginBottom: '0.35rem',
                    }}>
                        Welcome back
                    </h1>
                    <p style={{
                        color: 'var(--text-secondary)', fontSize: '0.88rem',
                        lineHeight: 1.6, position: 'relative', zIndex: 1,
                    }}>
                        Sign in to access your communities &amp; projects
                    </p>
                </div>

                {/* ── Body ── */}
                <div className="ek-login-body">

                    {/* Error */}
                    {error && (
                        <div className="ek-error">
                            <i className="fas fa-exclamation-circle" style={{ flexShrink: 0 }} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>

                        {/* Username */}
                        <div style={{ marginBottom: '1.1rem' }}>
                            <label className="ek-field-label">
                                <i className="fas fa-user" style={{ color: 'var(--accent)', fontSize: '0.75rem' }} />
                                Username or Email
                            </label>
                            <input
                                className="ek-input"
                                type="text"
                                value={form.username}
                                onChange={e => setForm({ ...form, username: e.target.value })}
                                placeholder="Enter your username or email"
                                required
                                autoComplete="username"
                            />
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: '0.75rem' }}>
                            <label className="ek-field-label">
                                <i className="fas fa-lock" style={{ color: 'var(--accent)', fontSize: '0.75rem' }} />
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    className="ek-input"
                                    type={showPass ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    placeholder="Enter your password"
                                    style={{ paddingRight: '2.75rem' }}
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(s => !s)}
                                    style={{
                                        position: 'absolute', right: '0.85rem', top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: 'var(--text-muted)', fontSize: '0.88rem', padding: '0.2rem',
                                        transition: 'color 0.2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                                    aria-label={showPass ? 'Hide password' : 'Show password'}
                                >
                                    <i className={showPass ? 'fas fa-eye-slash' : 'fas fa-eye'} />
                                </button>
                            </div>
                        </div>

                        {/* Forgot */}
                        <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
                            <Link
                                to="/forgot-password"
                                style={{
                                    color: 'var(--accent-text)', fontSize: '0.82rem',
                                    fontWeight: '600', textDecoration: 'none',
                                    transition: 'opacity 0.2s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                            >
                                Forgot password?
                            </Link>
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={loading} className="ek-submit">
                            {loading ? (
                                <>
                                    <i className="fas fa-circle-notch spin" style={{ fontSize: '0.88rem' }} />
                                    Signing in…
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <i className="fas fa-arrow-right" style={{ fontSize: '0.78rem' }} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="ek-divider">or</div>

                    {/* Register link */}
                    <p style={{
                        textAlign: 'center',
                        color: 'var(--text-secondary)', fontSize: '0.88rem',
                    }}>
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            style={{
                                color: 'var(--accent-text)', fontWeight: '700',
                                textDecoration: 'none', fontFamily: 'Cabinet Grotesk, sans-serif',
                            }}
                            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                        >
                            Create one here
                        </Link>
                    </p>

                    {/* Privacy note */}
                    <div style={{
                        marginTop: '1.5rem', padding: '0.9rem 1rem',
                        background: 'var(--accent-soft)', border: '1px solid var(--accent-border)',
                        borderRadius: 11,
                        display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                    }}>
                        <i className="fas fa-shield-alt" style={{
                            color: 'var(--accent-text)', fontSize: '0.82rem', marginTop: '0.1rem', flexShrink: 0,
                        }} />
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', lineHeight: 1.65 }}>
                            Your data is private. Open-source platform — no tracking, no ads.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
