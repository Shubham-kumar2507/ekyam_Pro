import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function AdminRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><div style={{ color: '#4f46e5', fontSize: '1.25rem' }}>Loading...</div></div>;
    if (!user) return <Navigate to="/login" replace />;
    if (user.userType !== 'system_admin') return <Navigate to="/dashboard" replace />;
    return children;
}
