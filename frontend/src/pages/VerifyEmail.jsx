import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/useTheme';

/* ═══════════════════════════════════════════
   STYLES  (matches Login page design system)
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
    --success-bg: #f0fdf4;
    --success-border: rgba(34,197,94,0.2);
    --success-text: #16a34a;
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
    --success-bg: rgba(34,197,94,0.08);
    --success-border: rgba(34,197,94,0.25);
    --success-text: #4ade80;
  }

  .ek-verify * { box-sizing: border-box; margin: 0; padding: 0; }

  .ek-verify {
    font-family: var(--font-body);
    min-height: 100vh;
    background: var(--bg);
    display: flex; align-items: center; justify-content: center;
    padding: 2rem 1rem;
    position: relative; overflow: hidden;
    transition: background 0.35s ease;
  }

  .ek-verify-grid {
    position: absolute; inset: 0; pointer-events: none;
    background-image:
      linear-gradient(var(--border) 1px, transparent 1px),
      linear-gradient(90deg, var(--border) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent);
    -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent);
    opacity: 0.55;
  }

  .ek-verify-glow {
    position: absolute; border-radius: 50%; pointer-events: none;
    background: radial-gradient(circle, var(--accent-soft) 0%, transparent 70%);
  }

  .ek-verify-card {
    width: 100%; max-width: 460px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    box-shadow: var(--shadow-lg);
    overflow: hidden;
    position: relative; z-index: 2;
    transition: background 0.35s, border-color 0.35s;
    animation: vcard-in 0.7s var(--ease-spring) both;
  }
  @keyframes vcard-in {
    from { opacity: 0; transform: translateY(24px) scale(0.97); }
    to   { opacity: 1; transform: none; }
  }

  .ek-verify-header {
    padding: 2.5rem 2rem 2rem;
    text-align: center;
    border-bottom: 1px solid var(--border);
    position: relative;
    overflow: hidden;
  }
  .ek-verify-header::before {
    content: '';
    position: absolute; top: 0; left: 50%; transform: translateX(-50%);
    width: 55%; height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent), var(--purple), transparent);
  }
  .ek-verify-header::after {
    content: '';
    position: absolute; inset: 0; pointer-events: none;
    background: radial-gradient(ellipse 60% 50% at 50% 0%, var(--accent-soft), transparent);
  }

  .ek-verify-icon {
    width: 56px; height: 56px; border-radius: 16px;
    background: linear-gradient(135deg, var(--accent), var(--purple));
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1rem; font-size: 1.35rem; color: #fff;
    box-shadow: 0 8px 24px var(--accent-border);
    position: relative; z-index: 1;
  }

  .ek-verify-body { padding: 2rem; }

  .ek-otp-container {
    display: flex; gap: 0.6rem; justify-content: center;
    margin: 1.5rem 0;
  }

  .ek-otp-input {
    width: 50px; height: 58px;
    border: 2px solid var(--border);
    border-radius: 12px;
    font-size: 1.5rem; font-weight: 800;
    font-family: var(--font-display);
    text-align: center;
    background: var(--bg-subtle);
    color: var(--text-primary);
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s, transform 0.15s;
    caret-color: var(--accent);
  }
  .ek-otp-input:focus {
    border-color: var(--accent);
    background: var(--bg-surface);
    box-shadow: 0 0 0 3px var(--accent-soft);
    transform: translateY(-2px);
  }
  .ek-otp-input.filled {
    border-color: var(--accent-border);
    background: var(--accent-soft);
  }

  .ek-verify-error {
    background: var(--error-bg);
    border: 1px solid var(--error-border);
    color: var(--error-text);
    padding: 0.7rem 1rem;
    border-radius: 10px;
    font-size: 0.86rem;
    display: flex; align-items: center; gap: 0.5rem;
    margin-bottom: 1.25rem;
    animation: verr-in 0.3s var(--ease-spring);
  }
  @keyframes verr-in { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:none; } }

  .ek-verify-success {
    background: var(--success-bg);
    border: 1px solid var(--success-border);
    color: var(--success-text);
    padding: 0.7rem 1rem;
    border-radius: 10px;
    font-size: 0.86rem;
    display: flex; align-items: center; gap: 0.5rem;
    margin-bottom: 1.25rem;
    animation: verr-in 0.3s var(--ease-spring);
  }

  .ek-verify-btn {
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
  .ek-verify-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: var(--shadow-lg); opacity: 0.9; }
  .ek-verify-btn:active:not(:disabled) { transform: none; }
  .ek-verify-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .ek-resend-btn {
    background: none; border: none; cursor: pointer;
    color: var(--accent-text); font-weight: 700;
    font-family: var(--font-display);
    font-size: 0.88rem;
    transition: opacity 0.2s;
    padding: 0;
  }
  .ek-resend-btn:hover:not(:disabled) { text-decoration: underline; }
  .ek-resend-btn:disabled { opacity: 0.45; cursor: not-allowed; color: var(--text-muted); }

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

  @keyframes success-pop {
    0% { transform: scale(0.8); opacity: 0; }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
  }
  .ek-success-anim { animation: success-pop 0.5s var(--ease-spring) both; }
`;

function InjectCSS() {
    useEffect(() => {
        const id = 'ek-verify-css';
        if (!document.getElementById(id)) {
            const s = document.createElement('style');
            s.id = id; s.textContent = CSS;
            document.head.appendChild(s);
        }
    }, []);
    return null;
}

/* ═══════════════════════════════════════════
   VERIFY EMAIL PAGE
   ═══════════════════════════════════════════ */
export default function VerifyEmail() {
    const { verifyEmail, resendOTP } = useAuth();
    const { mode } = useTheme();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const emailFromQuery = searchParams.get('email') || '';

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [verified, setVerified] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const inputRefs = useRef([]);

    // Countdown timer for resend
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setInterval(() => {
            setResendCooldown(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [resendCooldown]);

    // Start with initial cooldown
    useEffect(() => {
        setResendCooldown(60);
    }, []);

    const handleChange = (index, value) => {
        // Only allow digits
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        // Auto-advance to next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        // Backspace: clear current and go back
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 0) return;

        const newOtp = [...otp];
        for (let i = 0; i < 6; i++) {
            newOtp[i] = pasted[i] || '';
        }
        setOtp(newOtp);
        setError('');

        // Focus the next empty input or the last one
        const nextEmpty = newOtp.findIndex(d => !d);
        inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) {
            setError('Please enter the complete 6-digit verification code.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await verifyEmail(emailFromQuery, code);
            setVerified(true);
            setSuccess('Email verified successfully! Redirecting...');
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed. Please try again.');
            // Clear OTP inputs on error
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;
        try {
            await resendOTP(emailFromQuery);
            setSuccess('A new verification code has been sent!');
            setError('');
            setResendCooldown(60);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend code. Please try again.');
        }
    };

    // Mask email for display
    const maskedEmail = emailFromQuery
        ? emailFromQuery.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + '*'.repeat(Math.min(b.length, 6)) + c)
        : '';

    return (
        <div className="ek-verify" data-theme={mode}>
            <InjectCSS />

            {/* Background */}
            <div className="ek-verify-grid" />
            <div className="ek-verify-glow" style={{ width: 600, height: 400, top: '-10%', left: '50%', transform: 'translateX(-50%)' }} />
            <div className="ek-verify-glow" style={{ width: 300, height: 300, bottom: '5%', right: '-5%', opacity: 0.6 }} />

            {/* Card */}
            <div className="ek-verify-card">
                {/* Header */}
                <div className="ek-verify-header">
                    <div className="ek-verify-icon">
                        {verified
                            ? <i className="fas fa-check" />
                            : <i className="fas fa-envelope-open-text" />
                        }
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
                        {verified ? 'Email Verified!' : 'Verify Your Email'}
                    </h1>
                    <p style={{
                        color: 'var(--text-secondary)', fontSize: '0.88rem',
                        lineHeight: 1.6, position: 'relative', zIndex: 1,
                    }}>
                        {verified
                            ? 'Your account is now active'
                            : <>We sent a 6-digit code to <strong style={{ color: 'var(--accent-text)' }}>{maskedEmail}</strong></>
                        }
                    </p>
                </div>

                {/* Body */}
                <div className="ek-verify-body">

                    {/* Error */}
                    {error && (
                        <div className="ek-verify-error">
                            <i className="fas fa-exclamation-circle" style={{ flexShrink: 0 }} />
                            {error}
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div className="ek-verify-success">
                            <i className="fas fa-check-circle" style={{ flexShrink: 0 }} />
                            {success}
                        </div>
                    )}

                    {!verified ? (
                        <>
                            <form onSubmit={handleSubmit}>
                                {/* OTP Inputs */}
                                <div className="ek-otp-container">
                                    {otp.map((digit, idx) => (
                                        <input
                                            key={idx}
                                            ref={el => inputRefs.current[idx] = el}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={e => handleChange(idx, e.target.value)}
                                            onKeyDown={e => handleKeyDown(idx, e)}
                                            onPaste={idx === 0 ? handlePaste : undefined}
                                            className={`ek-otp-input${digit ? ' filled' : ''}`}
                                            autoFocus={idx === 0}
                                            autoComplete="one-time-code"
                                        />
                                    ))}
                                </div>

                                {/* Submit */}
                                <button type="submit" disabled={loading || otp.join('').length !== 6} className="ek-verify-btn">
                                    {loading ? (
                                        <>
                                            <i className="fas fa-circle-notch spin" style={{ fontSize: '0.88rem' }} />
                                            Verifying…
                                        </>
                                    ) : (
                                        <>
                                            Verify Email
                                            <i className="fas fa-arrow-right" style={{ fontSize: '0.78rem' }} />
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Resend */}
                            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '0.5rem' }}>
                                    Didn't receive the code?
                                </p>
                                <button
                                    onClick={handleResend}
                                    disabled={resendCooldown > 0}
                                    className="ek-resend-btn"
                                >
                                    {resendCooldown > 0
                                        ? `Resend in ${resendCooldown}s`
                                        : 'Resend Code'
                                    }
                                </button>
                            </div>

                            {/* Back to login */}
                            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                                <Link
                                    to="/login"
                                    style={{
                                        color: 'var(--text-muted)', fontSize: '0.82rem',
                                        textDecoration: 'none', transition: 'color 0.2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                                >
                                    <i className="fas fa-arrow-left" style={{ marginRight: '0.4rem', fontSize: '0.75rem' }} />
                                    Back to Login
                                </Link>
                            </div>

                            {/* Tip */}
                            <div style={{
                                marginTop: '1.5rem', padding: '0.9rem 1rem',
                                background: 'var(--accent-soft)', border: '1px solid var(--accent-border)',
                                borderRadius: 11,
                                display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                            }}>
                                <i className="fas fa-lightbulb" style={{
                                    color: 'var(--accent-text)', fontSize: '0.82rem', marginTop: '0.1rem', flexShrink: 0,
                                }} />
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', lineHeight: 1.65 }}>
                                    Check your spam or junk folder if you don't see the email. The code expires in 10 minutes.
                                </p>
                            </div>
                        </>
                    ) : (
                        /* Success State */
                        <div className="ek-success-anim" style={{ textAlign: 'center', padding: '1rem 0' }}>
                            <div style={{
                                width: 72, height: 72, borderRadius: '50%',
                                background: 'var(--success-bg)', border: '2px solid var(--success-border)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 1rem', fontSize: '2rem', color: 'var(--success-text)',
                            }}>
                                <i className="fas fa-check" />
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                Redirecting to your dashboard…
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
