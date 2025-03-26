import axios from "axios";

const API_URL = "http://localhost:8000/auth"; // URL của backend

export const loginUser = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, { email, password });
        console.log("Phản hồi từ API:", response.data); // Kiểm tra phản hồi API
        return response.data;
    } catch (error) {
        console.error("Lỗi khi đăng nhập:", error.response?.data || error.message);
        throw error;
    }
};


export const registerUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/register`, userData);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi đăng ký:", error);
        throw error;
    }
};
