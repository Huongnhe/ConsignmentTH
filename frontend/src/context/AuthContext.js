import { createContext, useState, useEffect } from "react";

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
            const res = await fetch("http://localhost:8000/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password}),
                
            });
            console.log("Dữ liệu gửi đi:", { email, password });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "Đăng nhập thất bại!");
            }

            const data = await res.json();
            console.log("Phản hồi từ API aaaaaaaaaaaa:", data);
            localStorage.setItem("token", data.token);
            
            localStorage.setItem("user", JSON.stringify(data.user));
            
            setUser(data.user);
            return data.user;
        } catch (error) {
            alert(error.message);
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
