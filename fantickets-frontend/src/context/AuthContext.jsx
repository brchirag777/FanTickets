import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Asks the backend who the current cookie belongs to (401 => logged out)
    const refreshUser = useCallback(async () => {
        try {
            const response = await api.get('/customers/me');
            setUser(response.data);
        } catch (error) {
            setUser(null);
        } finally {
            setAuthLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const logout = async () => {
        try {
            await api.post('/customers/logout');
        } catch (error) {
            console.error("Logout failed", error);
        }
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoggedIn: !!user, authLoading, refreshUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
