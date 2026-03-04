import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

const API_URL = import.meta.env.VITE_API_URL;

interface User {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    is_superuser: boolean;
    is_staff: boolean;
    groups: string[];
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restore session from localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        if (storedToken && storedUser) {
            try {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem("token");
                localStorage.removeItem("refresh_token");
                localStorage.removeItem("user");
            }
        }
        setIsLoading(false);
    }, []);

    // Auto-refresh token every 4 minutes (tokens typically expire at 5 min)
    useEffect(() => {
        if (!token) return;
        const refreshInterval = setInterval(async () => {
            const refreshToken = localStorage.getItem("refresh_token");
            if (!refreshToken) return;
            try {
                const response = await fetch(`${API_URL}/refresh/`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refresh: refreshToken }),
                });
                if (response.ok) {
                    const data = await response.json();
                    setToken(data.access);
                    localStorage.setItem("token", data.access);
                } else {
                    // Refresh failed → session expired
                    logout();
                }
            } catch {
                // Network error, keep current token
            }
        }, 4 * 60 * 1000);

        return () => clearInterval(refreshInterval);
    }, [token]);

    const login = useCallback(async (username: string, password: string) => {
        const response = await fetch(`${API_URL}/login/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.detail || "Identifiants incorrects"
            );
        }

        const data = await response.json();

        const userData: User = {
            id: data.id,
            username: data.username,
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            email: data.email || "",
            is_superuser: data.is_superuser || false,
            is_staff: data.is_staff || false,
            groups: data.groups || [],
        };

        // Store in state
        setToken(data.access);
        setUser(userData);

        // Persist to localStorage
        localStorage.setItem("token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        localStorage.setItem("user", JSON.stringify(userData));
    }, []);

    const logout = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token && !!user,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
