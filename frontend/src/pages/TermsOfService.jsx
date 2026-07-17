import { useTheme } from '../context/useTheme';

export default function TermsOfService() {
    const { theme } = useTheme();

    return (
        <div style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 1rem', color: theme.text }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem', color: theme.heading }}>Terms of Service</h1>
            <p style={{ lineHeight: '1.7', marginBottom: '2rem', color: theme.textSoft }}>
                Last updated: {new Date().toLocaleDateString()}
            </p>
            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: theme.heading }}>1. Acceptance of Terms</h2>
                <p style={{ lineHeight: '1.7', color: theme.textSoft }}>
                    By accessing or using our services, you agree to be bound by these Terms. If you do not agree, do not use the services.
                </p>
            </section>
            <section style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: theme.heading }}>2. User Responsibilities</h2>
                <p style={{ lineHeight: '1.7', color: theme.textSoft }}>
                    You are responsible for your use of the services and any content you provide, including compliance with applicable laws.
                </p>
            </section>
        </div>
    );
}
