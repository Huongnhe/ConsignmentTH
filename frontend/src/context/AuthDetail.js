import React, { createContext, useContext, useState } from "react";
import { fetchConsignmentDetailAPI } from "../api/api";

// Tạo context
const AuthDetailContext = createContext();

// Provider
export const AuthDetailProvider = ({ children }) => {
    const [consignmentDetail, setConsignmentDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Hàm lấy chi tiết đơn ký gửi
    const fetchConsignmentDetail = async (consignmentId) => {
        const token = localStorage.getItem("token"); // Lấy token từ localStorage
        if (!token) {
            setError("Token không tồn tại.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await fetchConsignmentDetailAPI(token, consignmentId);
            setConsignmentDetail(data);
        } catch (err) {
            setError("Không thể lấy chi tiết đơn ký gửi.");
            console.error("Chi tiết lỗi:", err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthDetailContext.Provider
            value={{ consignmentDetail, fetchConsignmentDetail, loading, error }}
        >
            {children}
        </AuthDetailContext.Provider>
    );
};

// Hook để sử dụng context
export const useAuthDetail = () => {
    return useContext(AuthDetailContext);
};
