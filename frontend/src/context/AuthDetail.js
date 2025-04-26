import React, { createContext, useContext, useState } from "react";
import { fetchConsignmentDetailAPI, deleteConsignmentAPI  } from "../api/api";
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
    
    const deleteConsignment = async (consignmentId) => {
        const token = localStorage.getItem("token");

        if (!token) {
            setError("Token không tồn tại.");
            return;
        }

        try {
            const result = await deleteConsignmentAPI(token, consignmentId);

            if (result.success) {
                alert("Đơn ký gửi đã được xóa thành công!");
                return result; // Trả về kết quả khi xóa thành công
            } else {
                setError(result.message || "Xóa đơn ký gửi không thành công.");
            }
        } catch (err) {
            setError(err.message || "Lỗi khi xóa đơn ký gửi.");
            console.error("Lỗi xóa đơn ký gửi:", err);
        }
    };

    return (
        <AuthDetailContext.Provider
            value={{ consignmentDetail, fetchConsignmentDetail,deleteConsignment, loading, error }}
        >
            {children}
        </AuthDetailContext.Provider>
    );
};

// Hook để sử dụng context
export const useAuthDetail = () => {
    return useContext(AuthDetailContext);
};
