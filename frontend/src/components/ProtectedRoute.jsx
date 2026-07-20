import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="text-indigo-600 text-xl">Loading...</div></div>;
    return user ? children : <Navigate to="/login" replace />;
}
