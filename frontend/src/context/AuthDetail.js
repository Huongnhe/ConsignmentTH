import React, { createContext, useContext, useState } from "react";
import { fetchConsignmentDetailAPI } from "../api/api";
// import { fetchConsignmentDetailAPI } from "../api/api";

// Tạo context
const AuthDetailContext = createContext();

// Provider
export const AuthDetailProvider = ({ children }) => {
    const [consignmentDetail, setConsignmentDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Hàm lấy chi tiết đơn ký gửi
    const fetchConsignmentDetail = async (consignmentId) => {
        const token = localStorage.getItem("token");
        // alert(token)

        if (!token) {
            setError("Token không tồn tại.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await fetchConsignmentDetailAPI(token, consignmentId);
            console.log("Dữ liệu nhận được từ API:", JSON.stringify(data, null, 2));

            // Đảm bảo dữ liệu có cấu trúc đúng
            const formattedData = {
                ...data,
                Products: data.Products || [] // Đảm bảo luôn có mảng Products
            };

            setConsignmentDetail(formattedData);
            console.log("Chi tiết đơn ký gửi ứdfgh:", formattedData);
        } catch (err) {
            setError(err.message || "Không thể lấy chi tiết đơn ký gửi.");
            console.error("Lỗi chi tiết:", {
                message: err.message,
                stack: err.stack
            });
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
