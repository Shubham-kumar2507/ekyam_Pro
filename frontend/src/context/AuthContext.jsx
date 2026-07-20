import { useState } from 'react';
import api from '../api/api';
import { AuthContext } from './AuthContextValue';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const token = localStorage.getItem('ekyam_token');
            const stored = localStorage.getItem('ekyam_user');
            return token && stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });
    const [loading] = useState(false);

    const login = async (username, password) => {
        const { data } = await api.post('/auth/login', { username, password });
        localStorage.setItem('ekyam_token', data.token);
        localStorage.setItem('ekyam_user', JSON.stringify(data));
        setUser(data);
        return data;
    };

    const register = async (formData) => {
        const { data } = await api.post('/auth/register', formData);
        // Registration now returns { message, email, requiresVerification }
        // Do NOT store token or set user — they must verify first
        return data;
    };

    const verifyEmail = async (email, otp) => {
        const { data } = await api.post('/auth/verify-email', { email, otp });
        localStorage.setItem('ekyam_token', data.token);
        localStorage.setItem('ekyam_user', JSON.stringify(data));
        setUser(data);
        return data;
    };

    const resendOTP = async (email) => {
        const { data } = await api.post('/auth/resend-otp', { email });
        return data;
    };

    const logout = () => {
        localStorage.removeItem('ekyam_token');
        localStorage.removeItem('ekyam_user');
        setUser(null);
    };

    const updateUser = (updatedUser) => {
        const merged = { ...user, ...updatedUser };
        localStorage.setItem('ekyam_user', JSON.stringify(merged));
        setUser(merged);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, verifyEmail, resendOTP }}>
            {children}
        </AuthContext.Provider>
    );
};

// `useAuth` hook lives in ./useAuth.js to keep this file fast-refresh compliant
