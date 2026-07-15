import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = "http://localhost:5001";

    useEffect(() => {
        const storedUser = localStorage.getItem("movie_user");
        const storedToken = localStorage.getItem("movie_token");
        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Login failed");
            }

            const { user: userData, token: userToken } = result.data;
            setUser(userData);
            setToken(userToken);
            localStorage.setItem("movie_user", JSON.stringify(userData));
            localStorage.setItem("movie_token", userToken);
            return { success: true };
        } catch (error) {
            console.error("Login error:", error);
            return { success: false, error: error.message };
        }
    };

    const register = async (name, email, password) => {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Registration failed");
            }

            const { user: userData, token: userToken } = result.data;
            setUser(userData);
            setToken(userToken);
            localStorage.setItem("movie_user", JSON.stringify(userData));
            localStorage.setItem("movie_token", userToken);
            return { success: true };
        } catch (error) {
            console.error("Registration error:", error);
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            // Call backend logout endpoint to clear httpOnly cookie if any
            await fetch(`${API_URL}/auth/logout`, { method: "POST" });
        } catch (error) {
            console.error("Logout backend call failed:", error);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem("movie_user");
            localStorage.removeItem("movie_token");
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        API_URL,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
