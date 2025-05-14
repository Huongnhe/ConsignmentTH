import React, { createContext, useContext, useState } from "react";
import { fetchConsignmentDetailAPI, deleteConsignmentAPI,updateConsignmentAPI } from "../api/api";
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
            console.log("Chi tiết đơn ký gửi:", formattedData);
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

    // Hàm cập nhật sản phẩm trong đơn ký gửi
    const updateConsignment = async (consignmentId, productId, updatedData) => {
        console.log("[DEBUG] Update params:", { consignmentId, productId, updatedData });
        
        const token = localStorage.getItem("token");
        if (!token) {
            const errorMsg = "Vui lòng đăng nhập lại";
            setError(errorMsg);
            throw new Error(errorMsg);
        }

        if (!productId) {
            const errorMsg = "Thiếu ID sản phẩm";
            setError(errorMsg);
            throw new Error(errorMsg);
        }

        setLoading(true);
        setError(null);
        
        try {
            const result = await updateConsignmentAPI(
                token,
                consignmentId,
                productId,
                updatedData
            );
    
            console.log("API Response:", result); // Thêm dòng này
            
            // Cập nhật state một cách an toàn
            setConsignmentDetail(prev => {
                if (!prev || !prev.Products) return prev;
                
                return {
                    ...prev,
                    Products: prev.Products.map(p => 
                        p.Product_id === productId ? { ...p, ...updatedData } : p
                    )
                };
            });
            
            return result;
        } catch (error) {
            console.error("Full Error Details:", {
                message: error.message,
                response: {
                    status: error.response?.status,
                    data: error.response?.data,
                    headers: error.response?.headers
                },
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    data: error.config?.data
                }
            });

            let errorMsg = "Cập nhật thất bại";
            
            if (error.response?.data?.errors) {
                // Xử lý lỗi validation từ server
                errorMsg = Object.entries(error.response.data.errors)
                    .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                    .join('\n');
            } else if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            }

            setError(errorMsg);
            throw new Error(errorMsg);

        } finally {
            setLoading(false);
        }
    };
    return (
        <AuthDetailContext.Provider
            value={{ consignmentDetail, fetchConsignmentDetail,deleteConsignment,updateConsignment, loading, error }}
        >
            {children}
        </AuthDetailContext.Provider>
    );
};

// Hook để sử dụng context
export const useAuthDetail = () => {
    return useContext(AuthDetailContext);
};
