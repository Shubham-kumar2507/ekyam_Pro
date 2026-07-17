import { useTheme } from '../context/useTheme';

export default function PrivacyPolicy() {
    const { theme } = useTheme();

    return (
        <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 1rem', color: theme.text }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem', color: theme.heading }}>Privacy Policy</h1>
            <p style={{ lineHeight: '1.7', marginBottom: '2rem', color: theme.textSoft }}>
                Last updated: {new Date().toLocaleDateString()}
            </p>
            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: theme.heading }}>1. Information We Collect</h2>
                <p style={{ lineHeight: '1.7', color: theme.textSoft }}>
                    We collect information you provide directly to us when you create an account, update your profile, or use our services.
                </p>
            </section>
            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: theme.heading }}>2. How We Use Information</h2>
                <p style={{ lineHeight: '1.7', color: theme.textSoft }}>
                    We use the information we collect to provide, maintain, and improve our services, as well as to communicate with you.
                </p>
            </section>
        </div>
    );
}
