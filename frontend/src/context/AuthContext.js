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
        console.log("User từ localStorage:", storedUser);
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Lỗi khi phân tích dữ liệu user từ localStorage:", error);
            }
        }
        setLoading(false); // Sau khi check xong thì set false
    }, []);

    const login = async (email, password) => {
        try {
            const data = await loginUser(email, password);
            console.log("Phản hồi từ API:", data);
            
            if (data.token && data.user) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                setUser(data.user);
                return data.user;
            } else {
                throw new Error("Đăng nhập thất bại: Dữ liệu không hợp lệ từ server");
            }
        } catch (error) {
            console.error("Lỗi khi đăng nhập:", error);
            throw error; // Ném lỗi để component có thể bắt và xử lý
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
            
            console.log("Data received:", data); // Debug log

            if (!data.success) {
                throw new Error(data.message || "Xác thực OTP thất bại");
            }

            if (!data.token || !data.user) {
                throw new Error("Dữ liệu người dùng không hợp lệ từ server");
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