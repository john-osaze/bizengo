
"use client";

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo,
} from "react";

interface UserData {
    account_id: string;
    fullname: string;
    email: string;
    role: string;
    phone: string;
    businessname: string;
    address: string;
    description: string;
    country: string;
    state: string;
    zip: string;
}

interface ApiResponse {
    status: "success" | "error";
    page?: number;
    limit?: number;
    total?: string;
    users?: UserData[];
}

interface AuthContextType {
    isLoggedIn: boolean;
    user: UserData | null;
    isLoading: boolean;
    error: string | null;
    login: (email: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUserData = useCallback(async (email: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `https://api.rootsnsquares.com/innovations/users.php?email=${email}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ApiResponse = await response.json();

            if (data.status === "success" && data.users && data.users.length > 0) {

                const fetchedUser = data.users[0];
                setUser({
                    account_id: fetchedUser.account_id,
                    fullname: fetchedUser.fullname,
                    email: fetchedUser.email,
                    role: fetchedUser.role,
                    phone: fetchedUser.phone,
                    businessname: fetchedUser.businessname,
                    address: fetchedUser.address,
                    description: fetchedUser.description,
                    country: fetchedUser.country,
                    state: fetchedUser.state,
                    zip: fetchedUser.zip,
                });
                setIsLoggedIn(true);

                if (typeof window !== "undefined") {
                    sessionStorage.setItem("RSEmail", email);
                }
            } else {
                throw new Error(
                    data.status === "success"
                        ? "User not found or no users returned."
                        : "API error fetching user data."
                );
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred.");
            setIsLoggedIn(false);
            setUser(null);

            if (typeof window !== "undefined") {
                sessionStorage.removeItem("RSEmail");
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const initializeAuth = async () => {

            if (typeof window !== "undefined") {
                const storedEmail = sessionStorage.getItem("RSEmail");
                if (storedEmail) {
                    await fetchUserData(storedEmail);
                } else {
                    setIsLoggedIn(false);
                    setUser(null);
                    setIsLoading(false);
                }
            } else {

                setIsLoggedIn(false);
                setUser(null);
                setIsLoading(false);
            }
        };

        initializeAuth();
    }, [fetchUserData]);

    const login = useCallback(
        async (email: string) => {
            if (typeof window !== "undefined") {
                sessionStorage.setItem("RSEmail", email);
            }
            await fetchUserData(email);
        },
        [fetchUserData]
    );

    const logout = useCallback(() => {
        if (typeof window !== "undefined") {
            sessionStorage.removeItem("RSEmail");
            window.location.href = "/tools/";
        }
        setIsLoggedIn(false);
        setUser(null);
        setError(null);
    }, []);

    const contextValue = useMemo(
        () => ({
            isLoggedIn,
            user,
            isLoading,
            error,
            login,
            logout,
        }),
        [isLoggedIn, user, isLoading, error, login, logout]
    );

    return (
        <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}