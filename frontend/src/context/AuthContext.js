import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState("");
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        console.log("User từ localStorage:", storedUser);
        if (storedUser) {
            setUser(JSON.parse(storedUser)); // Cập nhật user từ localStorage
        }
    }, []);

    const login = async (email, password) => {
        try {
            const res = await fetch("http://localhost:8000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "Đăng nhập thất bại!");
            }

            const data = await res.json();
            localStorage.setItem("token", data.token);
            setUser(data.user);
        } catch (error) {
            alert(error.message);
        }
    };

    const register = async (userData) => {
        try {
            console.log("Gửi request đăng ký:", userData); // Debug request

            const res = await fetch("http://localhost:8000/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });

            console.log("Response status:", res.status); // Kiểm tra status code

            const data = await res.json().catch(() => ({}));
            console.log("Response data:", data); // In ra dữ liệu trả về từ server

            if (!res.ok) {
                throw new Error(data.error || `Lỗi: ${res.status}`);
            }

            localStorage.setItem("token", data.token);
            setUser(data.user);
            setMessage(data.message || "Đăng ký thành công!");
        } catch (error) {
            console.error("Lỗi khi đăng ký:", error.message);
            setMessage(error.message || "Lỗi kết nối đến server!");
        }
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, message, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
};
