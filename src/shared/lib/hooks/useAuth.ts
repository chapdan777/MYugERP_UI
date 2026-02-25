import { useState, useEffect } from 'react';

export interface AuthUser {
    id: number;
    username: string;
    fullName: string;
    email: string;
    role: 'admin' | 'manager' | 'employee' | 'viewer';
}

export const useAuth = () => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('accessToken');
            const userStr = localStorage.getItem('user');

            if (token && userStr) {
                try {
                    const parsedUser = JSON.parse(userStr);
                    setUser(parsedUser);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Failed to parse user data:', error);
                    localStorage.removeItem('user');
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
            setIsLoading(false);
        };

        checkAuth();

        // Listen for storage changes (e.g. login/logout in another tab or component)
        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    const hasRole = (roles: string[]) => {
        if (!user) return false;
        return roles.includes(user.role);
    };

    const isManager = hasRole(['admin', 'manager']);

    return {
        user,
        isAuthenticated,
        isLoading,
        hasRole,
        isManager
    };
};
