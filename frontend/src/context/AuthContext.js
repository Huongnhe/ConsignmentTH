import { createContext, useState, useEffect } from "react";
import {
  loginUser,
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

    return (
        <AuthContext.Provider value={{ user, login, logout, message, loading }}>
            {children}
        </AuthContext.Provider>
    );
};