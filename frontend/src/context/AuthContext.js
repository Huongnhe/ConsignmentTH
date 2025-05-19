import { createContext, useState, useEffect } from "react";
import { 
    loginUser,
    registerWithOTPStep1API,
    registerWithOTPStep2API
} from "../api/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [message] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        console.log("User from localStorage:", storedUser);
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Error parsing user data from localStorage:", error);
            }
        }
        setLoading(false); // Set false after checking
    }, []);

    const login = async (email, password) => {
        try {
            const data = await loginUser(email, password);
            console.log("API response:", data);
            
            if (data.token && data.user) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                setUser(data.user);
                return data.user;
            } else {
                throw new Error("Login failed: Invalid data from server");
            }
        } catch (error) {
            console.error("Login error:", error);
            throw error; // Throw error for component to catch and handle
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    const registerWithOTPStep1 = async (username, email, password) => {
        try {
            const data = await registerWithOTPStep1API(username, email, password);
            return data;
        } catch (error) {
            console.error("Error in OTP step 1:", error);
            throw error;
        }
    };

    const registerWithOTPStep2 = async (username, email, password, otp) => {
        try {
            const data = await registerWithOTPStep2API(username, email, password, otp);
            
            console.log("Data received:", data); 

            if (!data.success) {
                throw new Error(data.message || "OTP verification failed");
            }

            if (!data.token || !data.user) {
                throw new Error("Invalid user data from server");
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            setUser(data.user);
            
            return data.user;

        } catch (error) {
            console.error("Full error in OTP step 2:", {
                error: error,
                message: error.message,
                stack: error.stack
            });
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            login, 
            logout, 
            message, 
            loading,
            registerWithOTPStep1,
            registerWithOTPStep2
        }}>
            {children}
        </AuthContext.Provider>
    );
};