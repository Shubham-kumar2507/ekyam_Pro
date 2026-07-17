import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';
import { getMediaUrl } from '../utils/media';
import { useTheme } from '../context/useTheme';

/* ═══════════════════════════════════════════
   GLOBAL STYLES
   ═══════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');

  :root {
    --font-display: 'Cabinet Grotesk', sans-serif;
    --font-body: 'Instrument Sans', sans-serif;
    --ease-spring: cubic-bezier(.22,1,.36,1);
  }

  /* ── Light theme ── */
  [data-theme="light"] {
    --bg: #f5f4f0;
    --bg-surface: #ffffff;
    --bg-subtle: #eeecea;
    --bg-card: #ffffff;
    --border: rgba(0,0,0,0.08);
    --border-hover: rgba(0,0,0,0.14);
    --text-primary: #18181b;
    --text-secondary: #52525b;
    --text-muted: #a1a1aa;
    --accent: #4f46e5;
    --accent-soft: rgba(79,70,229,0.08);
    --accent-border: rgba(79,70,229,0.2);
    --accent-text: #4338ca;
    --purple: #7c3aed;
    --cyan: #0891b2;
    --green: #059669;
    --amber: #d97706;
    --rose: #e11d48;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05);
    --shadow-md: 0 4px 16px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05);
    --shadow-lg: 0 12px 40px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.06);
    --particle-color: rgba(79,70,229,0.25);
    --particle-line: rgba(79,70,229,0.08);
  }

  /* ── Dark theme ── */
  [data-theme="dark"] {
    --bg: #09090d;
    --bg-surface: #111118;
    --bg-subtle: #16161e;
    --bg-card: rgba(255,255,255,0.03);
    --border: rgba(255,255,255,0.07);
    --border-hover: rgba(255,255,255,0.14);
    --text-primary: #f4f4f5;
    --text-secondary: #a1a1aa;
    --text-muted: #52525b;
    --accent: #6366f1;
    --accent-soft: rgba(99,102,241,0.1);
    --accent-border: rgba(99,102,241,0.25);
    --accent-text: #a5b4fc;
    --purple: #a78bfa;
    --cyan: #22d3ee;
    --green: #34d399;
    --amber: #fbbf24;
    --rose: #fb7185;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
    --shadow-md: 0 4px 16px rgba(0,0,0,0.4);
    --shadow-lg: 0 12px 40px rgba(0,0,0,0.5);
    --particle-color: rgba(99,102,241,0.5);
    --particle-line: rgba(99,102,241,0.12);
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .ek-home {
    font-family: var(--font-body);
    background: var(--bg);
    color: var(--text-primary);
    overflow-x: hidden;
    transition: background 0.35s ease, color 0.35s ease;
    min-height: 100vh;
  }
  .ek-home h1, .ek-home h2, .ek-home h3, .ek-home h4 {
    font-family: var(--font-display);
  }

  /* ── Scroll reveal ── */
  .sr { opacity: 0; transform: translateY(28px); transition: opacity 0.75s var(--ease-spring), transform 0.75s var(--ease-spring); }
  .sr.in { opacity: 1; transform: none; }
  .sr.d1 { transition-delay: 0.07s; }
  .sr.d2 { transition-delay: 0.14s; }
  .sr.d3 { transition-delay: 0.21s; }
  .sr.d4 { transition-delay: 0.28s; }

  /* ── Gradient text ── */
  .grad {
    background: linear-gradient(135deg, var(--accent) 0%, var(--purple) 60%, var(--cyan) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  }

  /* ── Live badge ── */
  .live-badge {
    display: inline-flex; align-items: center; gap: 0.5rem;
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: 100px; padding: 0.3rem 0.85rem 0.3rem 0.45rem;
    font-size: 0.75rem; font-weight: 600; color: var(--text-secondary);
    box-shadow: var(--shadow-sm);
    transition: background 0.35s, border-color 0.35s;
  }
  .live-pip {
    display: inline-flex; align-items: center; gap: 0.3rem;
    background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.25);
    border-radius: 100px; padding: 0.15rem 0.55rem;
    color: #059669; font-size: 0.67rem; font-weight: 700;
    letter-spacing: 0.5px;
  }
  [data-theme="dark"] .live-pip { color: #34d399; background: rgba(52,211,153,0.12); }
  .live-dot { width: 5px; height: 5px; border-radius: 50%; background: #059669; animation: dot-pulse 2s ease-in-out infinite; }
  [data-theme="dark"] .live-dot { background: #34d399; }
  @keyframes dot-pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:0.6} }

  /* ── Section label ── */
  .section-label {
    display: inline-flex; align-items: center; gap: 0.5rem;
    font-size: 0.68rem; font-weight: 700; letter-spacing: 2.5px;
    text-transform: uppercase; color: var(--text-muted);
    margin-bottom: 0.75rem;
  }
  .section-label::before, .section-label::after {
    content: ''; width: 14px; height: 1px; background: var(--border-hover); display: inline-block;
  }

  /* ── Buttons ── */
  .btn-primary {
    display: inline-flex; align-items: center; gap: 0.45rem;
    background: var(--text-primary); color: var(--bg);
    padding: 0.8rem 1.75rem; border-radius: 12px;
    font-family: var(--font-display); font-weight: 800; font-size: 0.92rem;
    border: none; cursor: pointer; text-decoration: none; letter-spacing: -0.2px;
    transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s;
  }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); opacity: 0.9; }

  .btn-ghost {
    display: inline-flex; align-items: center; gap: 0.45rem;
    background: var(--bg-surface); color: var(--text-secondary);
    padding: 0.8rem 1.75rem; border-radius: 12px;
    font-family: var(--font-display); font-weight: 600; font-size: 0.92rem;
    border: 1px solid var(--border); cursor: pointer; text-decoration: none;
    transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.2s;
  }
  .btn-ghost:hover { background: var(--bg-subtle); border-color: var(--border-hover); color: var(--text-primary); transform: translateY(-2px); }

  /* ── Stat card ── */
  .stat-card {
    text-align: center; padding: 2rem 1.5rem;
    position: relative;
  }
  .stat-card + .stat-card { border-left: 1px solid var(--border); }

  /* ── Feature row ── */
  .feat-row {
    display: flex; gap: 1rem; align-items: flex-start;
    padding: 1rem; border-radius: 12px;
    border: 1px solid transparent;
    transition: border-color 0.25s, background 0.25s, transform 0.25s;
    cursor: default;
  }
  .feat-row:hover { border-color: var(--border-hover); background: var(--bg-subtle); transform: translateX(4px); }

  /* ── Step ── */
  .step-item { display: flex; gap: 1.25rem; align-items: flex-start; }

  /* ── Card ── */
  .card {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: 16px; padding: 1.5rem;
    box-shadow: var(--shadow-sm);
    transition: border-color 0.25s, box-shadow 0.25s, transform 0.3s var(--ease-spring);
  }
  .card:hover { border-color: var(--border-hover); box-shadow: var(--shadow-md); transform: translateY(-4px); }

  /* ── Testi card ── */
  .testi-card {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: 16px; padding: 1.5rem;
    box-shadow: var(--shadow-sm);
    transition: border-color 0.25s, box-shadow 0.25s, transform 0.3s;
    cursor: default;
  }
  .testi-card:hover { border-color: var(--border-hover); box-shadow: var(--shadow-md); transform: translateY(-4px); }

  /* ── Project card ── */
  .project-card {
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: 16px; overflow: hidden; text-decoration: none;
    display: block; box-shadow: var(--shadow-sm);
    transition: border-color 0.3s, box-shadow 0.3s, transform 0.35s var(--ease-spring);
  }
  .project-card:hover { border-color: var(--accent-border); box-shadow: var(--shadow-lg); transform: translateY(-6px); }

  /* ── CTA section ── */
  .cta-box {
    border-radius: 20px; padding: 5rem 2rem;
    text-align: center; position: relative; overflow: hidden;
    background: var(--bg-surface); border: 1px solid var(--border);
    box-shadow: var(--shadow-md);
  }

  /* ── Marquee ── */
  @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  .marquee-track { display: flex; animation: marquee 30s linear infinite; width: max-content; }
  .marquee-track:hover { animation-play-state: paused; }

  /* ── Float ── */
  @keyframes float-slow { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }

  /* ── Grid layout helpers ── */
  .g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: start; }
  .g3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
  .g4 { display: grid; grid-template-columns: repeat(4, 1fr); }

  /* ── Glow divider ── */
  .glow-div {
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--accent-border), var(--border), transparent);
  }

  /* ── Hero ring ── */
  .hero-ring {
    position: absolute; border-radius: 50%;
    border: 1px solid var(--border); pointer-events: none;
    animation: float-slow 10s ease-in-out infinite;
    transition: border-color 0.35s;
  }

  @media (max-width: 900px) {
    .g2 { grid-template-columns: 1fr !important; gap: 3rem !important; }
    .g3 { grid-template-columns: 1fr !important; }
    .g4 { grid-template-columns: 1fr 1fr !important; }
    .stat-card + .stat-card { border-left: none; border-top: 1px solid var(--border); }
    .hero-btns { flex-direction: column; align-items: center; }
    .hero-btns a, .hero-btns button { width: 240px; justify-content: center; }
  }
  @media (max-width: 600px) {
    .g4 { grid-template-columns: 1fr 1fr !important; }
  }

  /* ── Leaderboard ── */
  .lb-hero-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.25rem; }
  .lb-hero-card {
    background: var(--bg-surface); border: 1px solid var(--border); border-radius: 18px;
    padding: 1.75rem 1.25rem 1.5rem; text-align: center; position: relative; overflow: hidden;
    box-shadow: var(--shadow-sm);
    transition: border-color 0.3s, box-shadow 0.3s, transform 0.35s var(--ease-spring);
  }
  .lb-hero-card:hover { border-color: var(--accent-border); box-shadow: var(--shadow-lg); transform: translateY(-6px); }
  .lb-hero-card.gold { border-color: rgba(251,191,36,0.3); }
  .lb-hero-card.gold:hover { border-color: rgba(251,191,36,0.5); box-shadow: 0 8px 32px rgba(251,191,36,0.15); }
  .lb-hero-card.silver { border-color: rgba(148,163,184,0.3); }
  .lb-hero-card.bronze { border-color: rgba(251,146,60,0.3); }

  .lb-medal {
    position: absolute; top: 0.75rem; right: 0.75rem;
    width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    font-size: 0.7rem; font-weight: 900; font-family: var(--font-display);
    color: #fff;
  }
  .lb-medal.gold { background: linear-gradient(135deg, #f59e0b, #eab308); box-shadow: 0 2px 8px rgba(245,158,11,0.4); }
  .lb-medal.silver { background: linear-gradient(135deg, #94a3b8, #64748b); box-shadow: 0 2px 8px rgba(148,163,184,0.4); }
  .lb-medal.bronze { background: linear-gradient(135deg, #fb923c, #ea580c); box-shadow: 0 2px 8px rgba(251,146,60,0.4); }

  .lb-avatar {
    width: 72px; height: 72px; border-radius: 50%; object-fit: cover;
    border: 3px solid var(--border); margin: 0 auto 0.8rem;
    transition: border-color 0.3s, transform 0.3s;
  }
  .lb-hero-card:hover .lb-avatar { transform: scale(1.06); }
  .lb-hero-card.gold .lb-avatar { border-color: rgba(251,191,36,0.5); }

  .lb-avatar-placeholder {
    width: 72px; height: 72px; border-radius: 50%; margin: 0 auto 0.8rem;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, var(--accent), var(--purple));
    color: #fff; font-weight: 900; font-family: var(--font-display); font-size: 1.5rem;
    border: 3px solid var(--border);
  }

  .lb-score {
    display: inline-flex; align-items: center; gap: 0.3rem;
    background: var(--accent-soft); border: 1px solid var(--accent-border);
    border-radius: 100px; padding: 0.2rem 0.65rem;
    font-size: 0.72rem; font-weight: 700; color: var(--accent-text);
    margin-top: 0.5rem;
  }

  .lb-breakdown { display: flex; gap: 0.75rem; justify-content: center; margin-top: 0.7rem; flex-wrap: wrap; }
  .lb-breakdown span { font-size: 0.68rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.2rem; }
  .lb-breakdown i { font-size: 0.6rem; }

  .lb-rest-list { display: flex; flex-direction: column; gap: 0.6rem; margin-top: 1.5rem; }
  .lb-rest-item {
    display: flex; align-items: center; gap: 1rem;
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: 14px; padding: 0.85rem 1.25rem;
    transition: border-color 0.25s, background 0.25s, transform 0.25s;
  }
  .lb-rest-item:hover { border-color: var(--border-hover); background: var(--bg-subtle); transform: translateX(4px); }

  .lb-rank-badge {
    width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-family: var(--font-display); font-size: 0.82rem;
    background: var(--bg-subtle); color: var(--text-muted);
    border: 1px solid var(--border);
  }

  .lb-rest-avatar {
    width: 38px; height: 38px; border-radius: 50%; object-fit: cover; flex-shrink: 0;
    border: 2px solid var(--border);
  }
  .lb-rest-avatar-placeholder {
    width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, var(--accent), var(--purple));
    color: #fff; font-weight: 800; font-size: 0.82rem;
  }

  /* Project leaderboard */
  .plb-list { display: flex; flex-direction: column; gap: 0.85rem; }
  .plb-item {
    display: flex; align-items: center; gap: 1.25rem;
    background: var(--bg-surface); border: 1px solid var(--border);
    border-radius: 16px; padding: 1.1rem 1.5rem;
    text-decoration: none;
    transition: border-color 0.3s, box-shadow 0.3s, transform 0.35s var(--ease-spring);
  }
  .plb-item:hover { border-color: var(--accent-border); box-shadow: var(--shadow-md); transform: translateY(-3px); }

  .plb-rank {
    width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-weight: 900; font-family: var(--font-display); font-size: 0.9rem;
    background: var(--accent-soft); color: var(--accent-text); border: 1px solid var(--accent-border);
  }
  .plb-rank.r1 { background: linear-gradient(135deg, rgba(251,191,36,0.15), rgba(234,179,8,0.08)); color: #d97706; border-color: rgba(251,191,36,0.3); }
  .plb-rank.r2 { background: rgba(148,163,184,0.1); color: #64748b; border-color: rgba(148,163,184,0.3); }
  .plb-rank.r3 { background: rgba(251,146,60,0.1); color: #ea580c; border-color: rgba(251,146,60,0.3); }

  .plb-thumb {
    width: 48px; height: 48px; border-radius: 12px; object-fit: cover; flex-shrink: 0;
    border: 1px solid var(--border);
  }
  .plb-thumb-placeholder {
    width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    background: linear-gradient(135deg, var(--accent-soft), var(--bg-subtle));
    color: var(--text-muted); font-size: 1rem;
    border: 1px solid var(--border);
  }

  .plb-avatar-stack { display: flex; margin-top: 0.35rem; }
  .plb-avatar-stack img, .plb-avatar-stack .plb-avs-ph {
    width: 24px; height: 24px; border-radius: 50%; border: 2px solid var(--bg-surface);
    margin-left: -6px; object-fit: cover;
  }
  .plb-avatar-stack img:first-child, .plb-avatar-stack .plb-avs-ph:first-child { margin-left: 0; }
  .plb-avs-ph {
    display: flex; align-items: center; justify-content: center;
    background: var(--bg-subtle); color: var(--text-muted); font-size: 0.55rem; font-weight: 700;
  }

  .plb-updates-pill {
    display: inline-flex; align-items: center; gap: 0.3rem;
    background: var(--accent-soft); border: 1px solid var(--accent-border);
    border-radius: 100px; padding: 0.25rem 0.7rem;
    font-size: 0.72rem; font-weight: 700; color: var(--accent-text);
    white-space: nowrap;
  }

  /* ── Radial Progress Ring ── */
  .lb-radial-wrap { position: relative; width: 100px; height: 100px; margin: 0 auto 0.75rem; }
  .lb-radial-wrap svg { transform: rotate(-90deg); display: block; }
  .lb-radial-bg { fill: none; stroke: var(--border); stroke-width: 5; }
  .lb-radial-bar { fill: none; stroke-width: 5; stroke-linecap: round; transition: stroke-dashoffset 1.4s cubic-bezier(.22,1,.36,1); }
  .lb-radial-avatar {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    display: flex; align-items: center; justify-content: center;
  }
  .lb-radial-avatar img {
    width: 60px; height: 60px; border-radius: 50%; object-fit: cover;
    display: block;
  }
  .lb-radial-avatar .lb-avatar-initial {
    width: 60px; height: 60px; border-radius: 50%; display: flex;
    align-items: center; justify-content: center;
    background: linear-gradient(135deg, var(--accent), var(--purple));
    color: #fff; font-weight: 900; font-family: var(--font-display); font-size: 1.3rem;
  }

  /* ── Animated progress bars ── */
  .lb-progress-row { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.35rem; }
  .lb-progress-label { font-size: 0.62rem; color: var(--text-muted); width: 58px; text-align: right; white-space: nowrap; display: flex; align-items: center; gap: 0.25rem; }
  .lb-progress-track {
    flex: 1; height: 6px; border-radius: 3px; background: var(--border); overflow: hidden; position: relative;
  }
  .lb-progress-fill {
    height: 100%; border-radius: 3px; width: 0%;
    transition: width 1.2s cubic-bezier(.22,1,.36,1);
    position: relative;
  }
  .lb-progress-fill::after {
    content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%);
    animation: shimmer 2s ease-in-out infinite;
  }
  @keyframes shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
  .lb-progress-val { font-size: 0.6rem; color: var(--text-secondary); font-weight: 700; width: 20px; }

  /* ── Activity mini chart ── */
  .lb-chart { display: flex; align-items: flex-end; gap: 3px; height: 32px; margin-top: 0.5rem; justify-content: center; }
  .lb-chart-bar {
    width: 6px; border-radius: 3px 3px 0 0;
    transition: height 1s cubic-bezier(.22,1,.36,1); opacity: 0.7;
  }
  .lb-chart-bar:hover { opacity: 1; }

  /* ── Rest-item progress bar ── */
  .lb-rest-progress { flex: 1; max-width: 120px; }
  .lb-rest-track { height: 4px; border-radius: 2px; background: var(--border); overflow: hidden; }
  .lb-rest-fill { height: 100%; border-radius: 2px; transition: width 1s cubic-bezier(.22,1,.36,1); }

  /* ── Project progress bar ── */
  .plb-progress-wrap { margin-top: 0.4rem; }
  .plb-progress-track { height: 5px; border-radius: 3px; background: var(--border); overflow: hidden; width: 100%; }
  .plb-progress-fill {
    height: 100%; border-radius: 3px; transition: width 1.2s cubic-bezier(.22,1,.36,1);
    position: relative;
  }
  .plb-progress-fill::after {
    content: ''; position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    animation: shimmer 2.5s ease-in-out infinite;
  }
  .plb-stats-row { display: flex; gap: 0.75rem; margin-top: 0.35rem; }
  .plb-stat-mini { display: flex; flex-direction: column; align-items: center; gap: 0.1rem; }
  .plb-stat-mini-val { font-size: 0.85rem; font-weight: 900; font-family: var(--font-display); color: var(--text-primary); }
  .plb-stat-mini-lbl { font-size: 0.55rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }

  @media (max-width: 900px) {
    .lb-hero-grid { grid-template-columns: 1fr !important; max-width: 360px; margin: 0 auto; }
    .lb-rest-progress { display: none; }
  }
`;

function StyleInjector() {
    useEffect(() => {
        const id = 'ek-home-css';
        let el = document.getElementById(id);
        if (!el) {
            el = document.createElement('style');
            el.id = id;
            document.head.appendChild(el);
        }
        el.textContent = GLOBAL_CSS;
    }, []);
    return null;
}

/* ═══════════════════════════════════════════
   PARTICLE CANVAS
   ═══════════════════════════════════════════ */
function ParticleCanvas({ dark }) {
    const canvasRef = useRef(null);
    const frameRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let W = canvas.width = canvas.offsetWidth;
        let H = canvas.height = canvas.offsetHeight;

        const onResize = () => {
            W = canvas.width = canvas.offsetWidth;
            H = canvas.height = canvas.offsetHeight;
        };
        window.addEventListener('resize', onResize);

        const COUNT = 100;
        const FOV = 500;

        const pts = Array.from({ length: COUNT }, () => ({
            x: (Math.random() - 0.5) * 900,
            y: (Math.random() - 0.5) * 600,
            z: Math.random() * 600,
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.25,
            vz: (Math.random() - 0.5) * 0.4,
            r: Math.random() * 1.4 + 0.4,
        }));

        const project = (x, y, z) => {
            const sc = FOV / (FOV + z);
            return [x * sc + W / 2, y * sc + H / 2, sc];
        };

        const draw = () => {
            ctx.clearRect(0, 0, W, H);

            pts.forEach(p => {
                p.x += p.vx; p.y += p.vy; p.z -= p.vz;
                if (p.z < -FOV) p.z = 600;
                if (p.z > 600) p.z = -FOV;
                if (Math.abs(p.x) > 550) p.vx *= -1;
                if (Math.abs(p.y) > 400) p.vy *= -1;
            });

            // Lines
            for (let i = 0; i < pts.length; i++) {
                for (let j = i + 1; j < pts.length; j++) {
                    const a = pts[i], b = pts[j];
                    const d = Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2 + (a.z-b.z)**2);
                    if (d < 160) {
                        const [ax, ay] = project(a.x, a.y, a.z);
                        const [bx, by] = project(b.x, b.y, b.z);
                        const alpha = (1 - d / 160) * (dark ? 0.12 : 0.07);
                        ctx.beginPath();
                        ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
                        ctx.strokeStyle = dark ? `rgba(99,102,241,${alpha})` : `rgba(79,70,229,${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            // Dots
            pts.forEach(p => {
                const [sx, sy, sc] = project(p.x, p.y, p.z);
                if (sx < 0 || sx > W || sy < 0 || sy > H) return;
                const alpha = Math.min(1, sc) * (dark ? 0.7 : 0.5);
                ctx.beginPath();
                ctx.arc(sx, sy, p.r * sc, 0, Math.PI * 2);
                ctx.fillStyle = dark
                    ? `rgba(139,92,246,${alpha})`
                    : `rgba(79,70,229,${alpha})`;
                ctx.fill();
            });

            frameRef.current = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            cancelAnimationFrame(frameRef.current);
            window.removeEventListener('resize', onResize);
        };
    }, [dark]);

    return (
        <canvas ref={canvasRef} style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none',
        }} />
    );
}

/* ─── Scroll Reveal Hook ─── */
function useReveal(threshold = 0.1) {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current; if (!el) return;
        const io = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) {
                el.classList.add('in');
                el.querySelectorAll('.sr').forEach(c => c.classList.add('in'));
                io.unobserve(el);
            }
        }, { threshold });
        io.observe(el);
        return () => io.disconnect();
    }, [threshold]);
    return ref;
}

/* ─── Animated Counter ─── */
function AnimCounter({ end, label, color, delay = 0 }) {
    const [n, setN] = useState(0);
    const [vis, setVis] = useState(false);
    const started = useRef(false);
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current; if (!el) return;
        const io = new IntersectionObserver(([e]) => {
            if (e.isIntersecting && !started.current) {
                started.current = true;
                setTimeout(() => {
                    setVis(true);
                    const t0 = performance.now();
                    const dur = 1800;
                    const tick = (now) => {
                        const p = Math.min((now - t0) / dur, 1);
                        setN(Math.round((1 - Math.pow(1 - p, 3)) * end));
                        if (p < 1) requestAnimationFrame(tick);
                    };
                    requestAnimationFrame(tick);
                }, delay);
                io.unobserve(el);
            }
        }, { threshold: 0.3 });
        io.observe(el);
        return () => io.disconnect();
    }, [end, delay]);

    return (
        <div ref={ref} className="stat-card" style={{
            opacity: vis ? 1 : 0, transform: vis ? 'none' : 'translateY(20px)',
            transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
        }}>
            <div style={{
                fontSize: '2.6rem', fontWeight: '900', fontFamily: 'Cabinet Grotesk, sans-serif',
                color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-1.5px',
            }}>
                {n}<span style={{ color, fontSize: '2rem' }}>+</span>
            </div>
            <div style={{
                color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '700',
                marginTop: '0.4rem', letterSpacing: '1.5px', textTransform: 'uppercase',
            }}>
                {label}
            </div>
            <div style={{
                height: 2, background: 'var(--border)', borderRadius: 2,
                marginTop: '1rem', position: 'relative', overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute', inset: 0, background: color,
                    width: `${Math.min((n / end) * 100, 100)}%`,
                    transition: 'width 0.1s ease', borderRadius: 2,
                }} />
            </div>
        </div>
    );
}

/* ─── Feature Row ─── */
function FeatRow({ icon, title, desc, color }) {
    return (
        <div className="feat-row">
            <div style={{
                width: 40, height: 40, flexShrink: 0, borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: `${color}12`, border: `1px solid ${color}22`,
                color, fontSize: '0.95rem',
            }}>
                <i className={icon} />
            </div>
            <div>
                <h3 style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.92rem', marginBottom: '0.2rem' }}>
                    {title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', lineHeight: 1.7 }}>{desc}</p>
            </div>
        </div>
    );
}

/* ─── Step Item ─── */
function StepItem({ step, index, color }) {
    return (
        <div className="step-item sr" style={{ '--i': index }}>
            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                    width: 44, height: 44, borderRadius: '50%',
                    background: `${color}10`, border: `1px solid ${color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '900', fontFamily: 'Cabinet Grotesk, sans-serif',
                    fontSize: '1rem', color,
                }}>
                    {index + 1}
                </div>
                {index < 2 && (
                    <div style={{
                        width: 1, height: 52,
                        background: `linear-gradient(180deg, ${color}25, transparent)`,
                        marginTop: 4,
                    }} />
                )}
            </div>
            <div style={{ paddingTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <i className={step.icon} style={{ color, fontSize: '0.82rem' }} />
                    <h3 style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '0.97rem' }}>
                        {step.title}
                    </h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.75 }}>
                    {step.desc}
                </p>
            </div>
        </div>
    );
}

/* ─── Testimonial Card ─── */
function TestiCard({ t }) {
    return (
        <div className="testi-card">
            <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '0.85rem' }}>
                {[...Array(5)].map((_, i) => (
                    <i key={i} className="fas fa-star" style={{ color: 'var(--amber)', fontSize: '0.68rem' }} />
                ))}
            </div>
            <p style={{
                color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.8,
                marginBottom: '1.25rem', fontStyle: 'italic',
            }}>
                "{t.quote}"
            </p>
            <div style={{
                display: 'flex', alignItems: 'center', gap: '0.7rem',
                borderTop: '1px solid var(--border)', paddingTop: '1rem',
            }}>
                <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent), var(--purple))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: '800', fontSize: '0.8rem',
                    fontFamily: 'Cabinet Grotesk, sans-serif',
                }}>
                    {t.name[0]}
                </div>
                <div>
                    <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.85rem' }}>{t.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{t.role}</div>
                </div>
            </div>
        </div>
    );
}

/* ─── Radial Score Gauge ─── */
function RadialProgress({ score, maxScore, color, size = 100, children }) {
    const [animated, setAnimated] = useState(false);
    const ref = useRef(null);
    const r = (size - 12) / 2;
    const circ = 2 * Math.PI * r;
    const pct = Math.min(score / (maxScore || 1), 1);
    const offset = circ * (1 - (animated ? pct : 0));

    useEffect(() => {
        const el = ref.current; if (!el) return;
        const io = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { setTimeout(() => setAnimated(true), 200); io.unobserve(el); }
        }, { threshold: 0.3 });
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <div className="lb-radial-wrap" ref={ref} style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle className="lb-radial-bg" cx={size/2} cy={size/2} r={r} />
                <circle className="lb-radial-bar" cx={size/2} cy={size/2} r={r}
                    stroke={color} strokeDasharray={circ} strokeDashoffset={offset} />
            </svg>
            <div className="lb-radial-avatar">
                {children}
            </div>
        </div>
    );
}

/* ─── Breakdown Progress Bars ─── */
function ScoreBreakdownBars({ breakdown, maxScore }) {
    const [animated, setAnimated] = useState(false);
    const ref = useRef(null);
    const cats = [
        { key: 'posts', icon: 'fas fa-pen', label: 'Posts', color: 'var(--accent)', weight: 3 },
        { key: 'resources', icon: 'fas fa-file-alt', label: 'Resources', color: 'var(--purple)', weight: 4 },
        { key: 'projects', icon: 'fas fa-project-diagram', label: 'Projects', color: 'var(--cyan)', weight: 5 },
        { key: 'comments', icon: 'fas fa-comment', label: 'Comments', color: 'var(--green)', weight: 1 },
        { key: 'activities', icon: 'fas fa-bolt', label: 'Activities', color: 'var(--amber)', weight: 2 },
    ];
    const maxCatScore = Math.max(...cats.map(c => (breakdown[c.key] || 0) * c.weight), 1);

    useEffect(() => {
        const el = ref.current; if (!el) return;
        const io = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { setTimeout(() => setAnimated(true), 300); io.unobserve(el); }
        }, { threshold: 0.2 });
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <div ref={ref} style={{ width: '100%', padding: '0 0.25rem' }}>
            {cats.filter(c => breakdown[c.key] > 0).map(c => {
                const val = (breakdown[c.key] || 0) * c.weight;
                const pct = (val / maxCatScore) * 100;
                return (
                    <div className="lb-progress-row" key={c.key}>
                        <span className="lb-progress-label"><i className={c.icon} style={{ fontSize: '0.55rem', color: c.color }} />{c.label}</span>
                        <div className="lb-progress-track">
                            <div className="lb-progress-fill" style={{ width: animated ? `${pct}%` : '0%', background: `linear-gradient(90deg, ${c.color}, ${c.color}88)` }} />
                        </div>
                        <span className="lb-progress-val">{breakdown[c.key]}</span>
                    </div>
                );
            })}
        </div>
    );
}

/* ─── Activity Mini Chart ─── */
function ActivityChart({ breakdown }) {
    const [animated, setAnimated] = useState(false);
    const ref = useRef(null);
    const cats = [
        { key: 'posts', color: 'var(--accent)', weight: 3 },
        { key: 'comments', color: 'var(--green)', weight: 1 },
        { key: 'resources', color: 'var(--purple)', weight: 4 },
        { key: 'projects', color: 'var(--cyan)', weight: 5 },
        { key: 'activities', color: 'var(--amber)', weight: 2 },
    ];
    const maxH = 32;
    const maxVal = Math.max(...cats.map(c => (breakdown[c.key] || 0) * c.weight), 1);

    useEffect(() => {
        const el = ref.current; if (!el) return;
        const io = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { setTimeout(() => setAnimated(true), 400); io.unobserve(el); }
        }, { threshold: 0.3 });
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <div className="lb-chart" ref={ref}>
            {cats.map((c, i) => {
                const val = (breakdown[c.key] || 0) * c.weight;
                const h = Math.max((val / maxVal) * maxH, 3);
                return (
                    <div key={c.key} className="lb-chart-bar" title={`${c.key}: ${breakdown[c.key] || 0}`}
                        style={{
                            height: animated ? h : 3,
                            background: `linear-gradient(to top, ${c.color}, ${c.color}88)`,
                            transitionDelay: `${i * 0.08}s`,
                        }} />
                );
            })}
        </div>
    );
}

/* ═══════════════════════════════════════════
   HOME PAGE
   ═══════════════════════════════════════════ */
export default function Home() {
    const { mode } = useTheme();
    const dark = mode === 'dark';
    
    const [stats, setStats] = useState({ communities: 0, projects: 0, resources: 0, users: 0 });
    const [projects, setProjects] = useState([]);
    const [wordsIn, setWordsIn] = useState(false);
    const [topContributors, setTopContributors] = useState([]);
    const [topProjects, setTopProjects] = useState([]);

    useEffect(() => {
        api.get('/stats').then(r => setStats(r.data)).catch(() => { });
        api.get('/projects/featured').then(r => setProjects(Array.isArray(r.data) ? r.data : [])).catch(() => { });
        api.get('/stats/leaderboard/community?limit=6').then(r => setTopContributors(Array.isArray(r.data) ? r.data : [])).catch(() => { });
        api.get('/stats/leaderboard/projects?limit=5').then(r => setTopProjects(Array.isArray(r.data) ? r.data : [])).catch(() => { });
        const t = setTimeout(() => setWordsIn(true), 180);
        return () => clearTimeout(t);
    }, []);

    const statsRef = useReveal();
    const featRef = useReveal();
    const stepsRef = useReveal();
    const testiRef = useReveal();
    const contribRef = useReveal();
    const projLbRef = useReveal();
    const projRef = useReveal();
    const ctaRef = useReveal();

    const features = [
        { icon: 'fas fa-share-nodes', title: 'Resource Sharing', desc: 'Share documents, tools, and knowledge across communities.', color: 'var(--accent)' },
        { icon: 'fas fa-code-branch', title: 'Project Collaboration', desc: 'Launch cross-community projects and track progress together.', color: 'var(--purple)' },
        { icon: 'fas fa-comments', title: 'Community Chat', desc: 'Real-time messaging that keeps your community connected.', color: 'var(--cyan)' },
        { icon: 'fas fa-calendar-check', title: 'Event Calendar', desc: 'Organize and discover meetups, workshops, and events.', color: 'var(--green)' },
        { icon: 'fas fa-network-wired', title: 'Network Building', desc: 'Connect with like-minded people and grow your network.', color: 'var(--amber)' },
        { icon: 'fas fa-lock-open', title: 'Open & Free', desc: 'Fully open-source — no hidden costs, no restrictions.', color: 'var(--rose)' },
    ];

    const steps = [
        { icon: 'fas fa-user-plus', title: 'Create Account', desc: 'Sign up in seconds as an individual or community admin.' },
        { icon: 'fas fa-search', title: 'Discover & Join', desc: 'Find communities that align with your goals and interests.' },
        { icon: 'fas fa-rocket', title: 'Collaborate & Grow', desc: 'Launch projects, share resources, and make a real impact.' },
    ];

    const testimonials = [
        { quote: 'EKYAM transformed how our student clubs work. We went from isolated groups to a unified campus community.', name: 'Priya Sharma', role: 'Student Union Lead' },
        { quote: 'The resource sharing feature saved us hundreds of hours — like a shared brain for our entire network.', name: 'Arjun Mehta', role: 'NGO Coordinator' },
        { quote: 'We discovered partner communities we never knew existed. The map feature is a game-changer.', name: 'Riya Patel', role: 'Community Organizer' },
    ];

    const marqueeItems = ['Communities', 'Projects', 'Resources', 'Collaboration', 'Connections', 'Impact', 'Open Source', 'Free Forever'];
    const words = ['Unite.', 'Collaborate.', 'Make', 'a', 'Lasting', 'Impact.'];
    const stepColors = ['var(--accent)', 'var(--purple)', 'var(--cyan)'];

    return (
        <div className="ek-home">
            <StyleInjector />

            {/* ━━━ HERO ━━━ */}
            <section style={{
                minHeight: '100vh', display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center',
                padding: '8rem 2rem 6rem', textAlign: 'center',
                position: 'relative', overflow: 'hidden',
            }}>
                {/* Particle canvas */}
                <ParticleCanvas dark={dark} />

                {/* Subtle grid */}
                <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
                    backgroundSize: '64px 64px', opacity: 0.6,
                    maskImage: 'radial-gradient(ellipse 75% 65% at 50% 25%, black, transparent)',
                    WebkitMaskImage: 'radial-gradient(ellipse 75% 65% at 50% 25%, black, transparent)',
                }} />

                {/* Floating rings */}
                <div className="hero-ring" style={{ width: 480, height: 480, top: '50%', left: '50%', transform: 'translate(-50%, -54%)', animationDuration: '9s' }} />
                <div className="hero-ring" style={{ width: 300, height: 300, top: '50%', left: '50%', transform: 'translate(-50%, -54%)', animationDuration: '12s', animationDelay: '1.5s' }} />

                {/* Radial glow */}
                <div style={{
                    position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                    width: 700, height: 350,
                    background: 'radial-gradient(ellipse, var(--accent-soft) 0%, transparent 70%)',
                    pointerEvents: 'none',
                }} />

                {/* Content */}
                <div style={{ position: 'relative', zIndex: 2, maxWidth: 760, margin: '0 auto' }}>
                    <div className="live-badge" style={{
                        marginBottom: '2rem',
                        opacity: wordsIn ? 1 : 0,
                        transition: 'opacity 0.6s ease',
                    }}>
                        <span className="live-pip">
                            <span className="live-dot" />
                            LIVE
                        </span>
                        Open-source community platform
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(2.6rem, 5.5vw, 4.5rem)',
                        fontWeight: '900', lineHeight: 1.08, letterSpacing: '-2px',
                        color: 'var(--text-primary)', marginBottom: '1.5rem',
                    }}>
                        {words.map((word, i) => (
                            <span key={i} style={{
                                display: 'inline-block', marginRight: '0.22em',
                                opacity: wordsIn ? 1 : 0,
                                transform: wordsIn ? 'none' : 'translateY(16px)',
                                transition: `opacity 0.6s var(--ease-spring) ${0.07 * i + 0.25}s, transform 0.6s var(--ease-spring) ${0.07 * i + 0.25}s`,
                                ...(word === 'Impact.' ? {
                                    background: 'linear-gradient(135deg, var(--accent), var(--purple), var(--cyan))',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                                } : {}),
                            }}>
                                {word}
                            </span>
                        ))}
                    </h1>

                    <p style={{
                        fontSize: '1.05rem', color: 'var(--text-secondary)',
                        maxWidth: 520, margin: '0 auto 2.75rem', lineHeight: 1.85,
                        opacity: wordsIn ? 1 : 0,
                        transition: 'opacity 0.7s ease 0.75s',
                    }}>
                        EKYAM brings diverse communities together through shared resources,
                        collaborative projects, and meaningful connections.
                    </p>

                    <div className="hero-btns" style={{
                        display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap',
                        opacity: wordsIn ? 1 : 0,
                        transition: 'opacity 0.7s ease 0.95s',
                    }}>
                        <Link to="/register" className="btn-primary">
                            Get Started Free
                            <i className="fas fa-arrow-right" style={{ fontSize: '0.78rem' }} />
                        </Link>
                        <Link to="/communities" className="btn-ghost">
                            <i className="fas fa-compass" style={{ fontSize: '0.78rem' }} />
                            Explore Communities
                        </Link>
                    </div>
                </div>

                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: 100,
                    background: 'linear-gradient(transparent, var(--bg))',
                    pointerEvents: 'none',
                }} />
            </section>

            {/* ━━━ MARQUEE ━━━ */}
            <div style={{
                borderTop: '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                overflow: 'hidden', padding: '0.8rem 0',
                background: 'var(--bg-surface)',
            }}>
                <div className="marquee-track">
                    {[...marqueeItems, ...marqueeItems].map((item, i) => (
                        <div key={i} style={{
                            display: 'inline-flex', alignItems: 'center', gap: '1.5rem',
                            padding: '0 2rem', whiteSpace: 'nowrap',
                            color: 'var(--text-muted)', fontSize: '0.7rem',
                            fontWeight: '700', letterSpacing: '2.5px', textTransform: 'uppercase',
                        }}>
                            {item}
                            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--accent-border)', flexShrink: 0 }} />
                        </div>
                    ))}
                </div>
            </div>

            {/* ━━━ STATS ━━━ */}
            <section style={{ padding: '5rem 2rem' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div ref={statsRef} className="sr" style={{
                        display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
                        background: 'var(--bg-surface)', border: '1px solid var(--border)',
                        borderRadius: 16, boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
                    }} >
                        {/* vertical dividers done via stat-card + stat-card border-left */}
                        <AnimCounter end={stats.communities || 12} label="Communities" color="var(--accent)" delay={0} />
                        <AnimCounter end={stats.projects || 35} label="Projects" color="var(--purple)" delay={100} />
                        <AnimCounter end={stats.resources || 80} label="Resources" color="var(--cyan)" delay={200} />
                        <AnimCounter end={stats.users || 150} label="Members" color="var(--green)" delay={300} />
                    </div>
                </div>
            </section>

            {/* ━━━ FEATURES + STEPS (side by side) ━━━ */}
            <section style={{
                padding: '4rem 2rem 7rem',
                borderTop: '1px solid var(--border)',
            }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }} className="g2">

                    {/* Features */}
                    <div ref={featRef} className="sr">
                        <div className="section-label">Platform</div>
                        <h2 style={{
                            fontSize: 'clamp(1.5rem, 2.8vw, 2rem)', fontWeight: '900',
                            color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '0.6rem',
                        }}>
                            Everything you need,
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '500', marginBottom: '2rem' }}>
                            nothing you don't.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {features.map((f, i) => <FeatRow key={f.title} {...f} />)}
                        </div>
                    </div>

                    {/* Steps */}
                    <div>
                        <div ref={stepsRef} className="sr">
                            <div className="section-label">Process</div>
                            <h2 style={{
                                fontSize: 'clamp(1.5rem, 2.8vw, 2rem)', fontWeight: '900',
                                color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '0.6rem',
                            }}>
                                Up and running
                            </h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', fontWeight: '500', marginBottom: '2rem' }}>
                                in three steps.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                {steps.map((step, i) => (
                                    <StepItem key={step.title} step={step} index={i} color={stepColors[i]} />
                                ))}
                            </div>

                            {/* Privacy card */}
                            <div style={{
                                marginTop: '2rem', padding: '1.25rem 1.5rem',
                                background: 'var(--accent-soft)', border: '1px solid var(--accent-border)',
                                borderRadius: 14,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.45rem' }}>
                                    <i className="fas fa-shield-alt" style={{ color: 'var(--accent-text)', fontSize: '0.9rem' }} />
                                    <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                                        Privacy first
                                    </span>
                                </div>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.7 }}>
                                    Your data stays yours. Open-source codebase, no tracking, no ads.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ━━━ TESTIMONIALS ━━━ */}
            <section style={{ padding: '6rem 2rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div ref={testiRef} className="sr">
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                            flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem',
                        }}>
                            <div>
                                <div className="section-label">Testimonials</div>
                                <h2 style={{
                                    fontSize: 'clamp(1.5rem, 2.8vw, 2rem)', fontWeight: '900',
                                    color: 'var(--text-primary)',
                                }}>
                                    What people are saying.
                                </h2>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                {[...Array(5)].map((_, i) => (
                                    <i key={i} className="fas fa-star" style={{ color: 'var(--amber)', fontSize: '0.72rem' }} />
                                ))}
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '0.4rem' }}>
                                    5.0 average
                                </span>
                            </div>
                        </div>
                        <div className="g3">
                            {testimonials.map((t, i) => <TestiCard key={i} t={t} />)}
                        </div>
                    </div>
                </div>
            </section>

            {/* ━━━ COMMUNITY CONTRIBUTORS LEADERBOARD ━━━ */}
            <section style={{ padding: '6rem 2rem', borderTop: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div ref={contribRef} className="sr">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
                            <div>
                                <div className="section-label">Leaderboard</div>
                                <h2 style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2rem)', fontWeight: '900', color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '0.4rem' }}>
                                    Top <span className="grad">Contributors.</span>
                                </h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Members making the biggest impact across communities.</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600' }}>
                                <i className="fas fa-trophy" style={{ color: 'var(--amber)', fontSize: '0.8rem' }} />
                                Based on posts, resources, projects & activities
                            </div>
                        </div>

                        {topContributors.length === 0 ? (
                            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '4rem 2rem', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-soft)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--accent)', fontSize: '1.75rem' }}>
                                    <i className="fas fa-medal" />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Be the first contributor!</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: 400, margin: '0 auto' }}>Start posting, sharing resources, and building projects to climb the leaderboard.</p>
                            </div>
                        ) : (() => {
                            const maxScore = topContributors[0]?.score || 1;
                            return (
                            <>
                                {/* Top 3 podium cards with radial gauges */}
                                <div className="lb-hero-grid">
                                    {topContributors.slice(0, 3).map((c, i) => {
                                        const medalClass = ['gold', 'silver', 'bronze'][i];
                                        const medalColors = ['#f59e0b', '#94a3b8', '#fb923c'];
                                        return (
                                            <Link to={`/profile/${c.username}`} key={c.userId} className={`lb-hero-card ${medalClass}`} style={{ textDecoration: 'none' }}>
                                                <div className={`lb-medal ${medalClass}`}>{i + 1}</div>

                                                {/* Radial score ring with avatar centered inside */}
                                                <RadialProgress score={c.score} maxScore={maxScore} color={medalColors[i]} size={100}>
                                                    {c.profileImage ? (
                                                        <img src={getMediaUrl(c.profileImage)} alt={c.fullName}
                                                            style={{ border: `3px solid ${medalColors[i]}30` }} />
                                                    ) : (
                                                        <div className="lb-avatar-initial"
                                                            style={{ border: `3px solid ${medalColors[i]}30` }}>
                                                            {c.fullName?.[0] || '?'}
                                                        </div>
                                                    )}
                                                </RadialProgress>

                                                <h4 style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '0.15rem' }}>{c.fullName}</h4>
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>@{c.username}</p>
                                                <div className="lb-score">
                                                    <i className="fas fa-bolt" style={{ fontSize: '0.6rem' }} />
                                                    {c.score} pts
                                                </div>

                                                {/* Animated breakdown progress bars */}
                                                <div style={{ marginTop: '0.6rem' }}>
                                                    <ScoreBreakdownBars breakdown={c.breakdown} maxScore={maxScore} />
                                                </div>

                                                {/* Activity mini chart */}
                                                <ActivityChart breakdown={c.breakdown} />
                                            </Link>
                                        );
                                    })}
                                </div>

                                {/* Remaining contributors with inline progress */}
                                {topContributors.length > 3 && (
                                    <div className="lb-rest-list">
                                        {topContributors.slice(3).map(c => (
                                            <Link to={`/profile/${c.username}`} key={c.userId} className="lb-rest-item" style={{ textDecoration: 'none' }}>
                                                <div className="lb-rank-badge">#{c.rank}</div>
                                                {c.profileImage ? (
                                                    <img src={getMediaUrl(c.profileImage)} alt={c.fullName} className="lb-rest-avatar" />
                                                ) : (
                                                    <div className="lb-rest-avatar-placeholder">{c.fullName?.[0] || '?'}</div>
                                                )}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.88rem' }}>{c.fullName}</div>
                                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>@{c.username}</div>
                                                </div>
                                                {/* Inline score bar */}
                                                <div className="lb-rest-progress">
                                                    <div className="lb-rest-track">
                                                        <div className="lb-rest-fill" style={{
                                                            width: `${Math.min((c.score / maxScore) * 100, 100)}%`,
                                                            background: 'linear-gradient(90deg, var(--accent), var(--purple))',
                                                        }} />
                                                    </div>
                                                </div>
                                                <div className="lb-score" style={{ marginTop: 0 }}>
                                                    <i className="fas fa-bolt" style={{ fontSize: '0.55rem' }} />
                                                    {c.score} pts
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </>
                            );
                        })()}
                    </div>
                </div>
            </section>

            {/* ━━━ PROJECT LEADERBOARD ━━━ */}
            <section style={{ padding: '6rem 2rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div ref={projLbRef} className="sr">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
                            <div>
                                <div className="section-label">Projects</div>
                                <h2 style={{ fontSize: 'clamp(1.5rem, 2.8vw, 2rem)', fontWeight: '900', color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '0.4rem' }}>
                                    Most Active <span className="grad">Projects.</span>
                                </h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Projects with the most updates, resources, and engagement.</p>
                            </div>
                            <Link to="/projects" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none', transition: 'color 0.2s' }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                            >
                                View all <i className="fas fa-arrow-right" style={{ fontSize: '0.68rem' }} />
                            </Link>
                        </div>

                        {topProjects.length === 0 ? (
                            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '4rem 2rem', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-soft)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--accent)', fontSize: '1.75rem' }}>
                                    <i className="fas fa-rocket" />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No projects yet</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: 400, margin: '0 auto' }}>Create a project and start building to appear on this leaderboard.</p>
                            </div>
                        ) : (() => {
                            const maxUpdates = Math.max(...topProjects.map(p => p.totalUpdates), 1);
                            return (
                            <div className="plb-list">
                                {topProjects.map((p, i) => {
                                    const rankClass = i < 3 ? `r${i + 1}` : '';
                                    const statusColors = { active: 'var(--green)', planning: 'var(--amber)', completed: 'var(--accent)', in_progress: 'var(--cyan)', on_hold: 'var(--text-muted)' };
                                    const sc = statusColors[p.status] || 'var(--green)';
                                    const pct = (p.totalUpdates / maxUpdates) * 100;
                                    const barColors = ['linear-gradient(90deg, #f59e0b, #eab308)', 'linear-gradient(90deg, #94a3b8, #64748b)', 'linear-gradient(90deg, #fb923c, #ea580c)', 'linear-gradient(90deg, var(--accent), var(--purple))', 'linear-gradient(90deg, var(--cyan), var(--accent))'];
                                    return (
                                        <Link to={`/projects/${p.projectId}`} key={p.projectId} className="plb-item" style={{ flexWrap: 'wrap' }}>
                                            <div className={`plb-rank ${rankClass}`}>{i + 1}</div>
                                            {p.image ? (
                                                <img src={getMediaUrl(p.image)} alt={p.name} className="plb-thumb" />
                                            ) : (
                                                <div className="plb-thumb-placeholder"><i className="fas fa-project-diagram" /></div>
                                            )}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                                                    <h4 style={{ fontWeight: '800', color: 'var(--text-primary)', fontSize: '0.95rem', margin: 0 }}>{p.name}</h4>
                                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.62rem', fontWeight: '700', color: sc, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc }} />
                                                        {(p.status || 'active').replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>{p.description}</p>
                                                {/* Progress bar showing relative activity */}
                                                <div className="plb-progress-wrap">
                                                    <div className="plb-progress-track">
                                                        <div className="plb-progress-fill" style={{ width: `${pct}%`, background: barColors[i] || barColors[3] }} />
                                                    </div>
                                                </div>
                                                {/* Member avatar stack */}
                                                <div className="plb-avatar-stack">
                                                    {p.members.slice(0, 4).map((m, mi) => (
                                                        m.profileImage ? (
                                                            <img key={mi} src={getMediaUrl(m.profileImage)} alt={m.fullName} />
                                                        ) : (
                                                            <div key={mi} className="plb-avs-ph">{m.fullName?.[0] || '?'}</div>
                                                        )
                                                    ))}
                                                    {p.memberCount > 4 && <div className="plb-avs-ph">+{p.memberCount - 4}</div>}
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                <div className="plb-updates-pill">
                                                    <i className="fas fa-sync-alt" style={{ fontSize: '0.58rem' }} />
                                                    {p.totalUpdates} updates
                                                </div>
                                                {/* Mini stat counters */}
                                                <div className="plb-stats-row" style={{ marginTop: '0.45rem', justifyContent: 'flex-end' }}>
                                                    {p.breakdown.posts > 0 && (
                                                        <div className="plb-stat-mini">
                                                            <span className="plb-stat-mini-val" style={{ color: 'var(--accent)' }}>{p.breakdown.posts}</span>
                                                            <span className="plb-stat-mini-lbl"><i className="fas fa-pen" style={{ fontSize: '0.5rem', marginRight: 2 }} />Posts</span>
                                                        </div>
                                                    )}
                                                    {p.breakdown.resources > 0 && (
                                                        <div className="plb-stat-mini">
                                                            <span className="plb-stat-mini-val" style={{ color: 'var(--purple)' }}>{p.breakdown.resources}</span>
                                                            <span className="plb-stat-mini-lbl"><i className="fas fa-file-alt" style={{ fontSize: '0.5rem', marginRight: 2 }} />Res</span>
                                                        </div>
                                                    )}
                                                    {p.breakdown.files > 0 && (
                                                        <div className="plb-stat-mini">
                                                            <span className="plb-stat-mini-val" style={{ color: 'var(--cyan)' }}>{p.breakdown.files}</span>
                                                            <span className="plb-stat-mini-lbl"><i className="fas fa-paperclip" style={{ fontSize: '0.5rem', marginRight: 2 }} />Files</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                            );
                        })()}
                    </div>
                </div>
            </section>

            {/* ━━━ FEATURED PROJECTS ━━━ */}
            <section style={{
                padding: '6rem 2rem',
                borderTop: '1px solid var(--border)',
                background: 'var(--bg-subtle)',
            }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div ref={projRef} className="sr">
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
                            flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem',
                        }}>
                            <div>
                                <div className="section-label">Featured</div>
                                <h2 style={{
                                    fontSize: 'clamp(1.5rem, 2.8vw, 2rem)', fontWeight: '900',
                                    color: 'var(--text-primary)',
                                }}>
                                    Projects in motion.
                                </h2>
                            </div>
                            <Link to="/projects" style={{
                                color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600',
                                display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none',
                                transition: 'color 0.2s',
                            }}
                                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                            >
                                View all <i className="fas fa-arrow-right" style={{ fontSize: '0.68rem' }} />
                            </Link>
                        </div>

                        {projects.length === 0 ? (
                            <div style={{
                                background: 'var(--bg-surface)', border: '1px solid var(--border)', 
                                borderRadius: 16, padding: '4rem 2rem', textAlign: 'center',
                                boxShadow: 'var(--shadow-sm)'
                            }}>
                                <div style={{ 
                                    width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-soft)',
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: '1.5rem', color: 'var(--accent)', fontSize: '1.75rem'
                                }}>
                                    <i className="fas fa-seedling"></i>
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                    Great things are growing
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: 400, margin: '0 auto' }}>
                                    Check back soon to see featured community initiatives, or head over to the projects board to start your own.
                                </p>
                            </div>
                        ) : (
                            <div className="g3">
                                {projects.map(p => {
                                    const statusMap = {
                                        active: 'var(--green)', planning: 'var(--amber)',
                                        completed: 'var(--accent)', in_progress: 'var(--cyan)', on_hold: 'var(--text-muted)',
                                    };
                                    const sc = statusMap[p.status] || 'var(--green)';
                                    return (
                                        <Link key={p._id} to={`/projects/${p._id}`} className="project-card">
                                            <div style={{
                                                height: 170, position: 'relative', overflow: 'hidden',
                                                background: dark
                                                    ? 'linear-gradient(135deg, #181530, #20193f)'
                                                    : 'linear-gradient(135deg, #e8e6f8, #d4d0f0)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}>
                                                {p.image ? (
                                                    <img src={getMediaUrl(p.image)} alt={p.name}
                                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <i className="fas fa-project-diagram" style={{
                                                        color: dark ? 'rgba(255,255,255,0.07)' : 'rgba(79,70,229,0.15)',
                                                        fontSize: '2rem',
                                                    }} />
                                                )}
                                                {/* Status pill */}
                                                <div style={{
                                                    position: 'absolute', bottom: '0.75rem', left: '0.75rem',
                                                    display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                                                    background: dark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.85)',
                                                    backdropFilter: 'blur(8px)',
                                                    borderRadius: 100, padding: '0.18rem 0.6rem',
                                                    fontSize: '0.66rem', fontWeight: '700',
                                                    color: sc, textTransform: 'uppercase', letterSpacing: '0.5px',
                                                }}>
                                                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc, flexShrink: 0 }} />
                                                    {(p.status || 'active').replace('_', ' ')}
                                                </div>
                                            </div>
                                            <div style={{ padding: '1.25rem' }}>
                                                <h3 style={{
                                                    fontWeight: '800', color: 'var(--text-primary)',
                                                    fontSize: '0.97rem', marginBottom: '0.35rem',
                                                }}>
                                                    {p.name}
                                                </h3>
                                                <p style={{
                                                    color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: 1.65,
                                                    display: '-webkit-box', WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                                }}>
                                                    {p.description}
                                                </p>
                                                <div style={{
                                                    display: 'flex', alignItems: 'center', marginTop: '1rem',
                                                    paddingTop: '0.9rem', borderTop: '1px solid var(--border)',
                                                    fontSize: '0.75rem', color: 'var(--text-muted)',
                                                }}>
                                                    <span>
                                                        <i className="fas fa-users" style={{ marginRight: '0.3rem', color: 'var(--accent)' }} />
                                                        {p.members?.length || p.memberCount || 0} members
                                                    </span>
                                                    <span style={{
                                                        marginLeft: 'auto', color: 'var(--accent-text)',
                                                        fontWeight: '700', fontSize: '0.78rem',
                                                    }}>
                                                        View →
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ━━━ CTA ━━━ */}
            <section style={{ padding: '4rem 2rem 7rem' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto' }}>
                    <div ref={ctaRef} className="sr cta-box">
                        {/* Top accent line */}
                        <div style={{
                            position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
                            width: '50%', height: 1,
                            background: 'linear-gradient(90deg, transparent, var(--accent), var(--purple), transparent)',
                            pointerEvents: 'none',
                        }} />
                        {/* Radial glow */}
                        <div style={{
                            position: 'absolute', inset: 0, pointerEvents: 'none',
                            background: 'radial-gradient(ellipse 55% 45% at 50% 0%, var(--accent-soft), transparent)',
                        }} />
                        {/* Grid overlay */}
                        <div style={{
                            position: 'absolute', inset: 0, pointerEvents: 'none',
                            backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
                            backgroundSize: '56px 56px', opacity: 0.5,
                            maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent)',
                            WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent)',
                        }} />

                        <div style={{ position: 'relative' }}>
                            <div className="section-label">Join Us</div>
                            <h2 style={{
                                fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: '900',
                                color: 'var(--text-primary)', lineHeight: 1.15,
                                marginBottom: '0.85rem', marginTop: '0.4rem',
                            }}>
                                Ready to make a{' '}
                                <span className="grad">difference?</span>
                            </h2>
                            <p style={{
                                fontSize: '1rem', color: 'var(--text-secondary)',
                                maxWidth: 440, margin: '0 auto 2.5rem', lineHeight: 1.8,
                            }}>
                                Join thousands of community members working together for a more connected future.
                            </p>
                            <div className="hero-btns" style={{
                                display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap',
                            }}>
                                <Link to="/register" className="btn-primary">
                                    <i className="fas fa-rocket" style={{ fontSize: '0.82rem' }} />
                                    Join EKYAM Today
                                </Link>
                                <Link to="/map" className="btn-ghost">
                                    <i className="fas fa-map-marked-alt" style={{ fontSize: '0.82rem' }} />
                                    Explore Map
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
