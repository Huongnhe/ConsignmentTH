import axios from "axios";

const API_URL = "http://localhost:8000/auth";


// Đăng nhập người dùng
export const loginUser = async (email, password, account) => {
    try {
        const response = await axios.post(`${API_URL}/login`, { email, password ,account});
        console.log("Phản hồi từ API:", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi đăng nhập:", error.response?.data || error.message);
        throw error;
    }
};

// Đăng ký người dùng
export const registerUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/register`, userData);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi đăng ký:", error);
        throw error;
    }
};

// Register with OTP - Step 1: Send OTP
export const registerWithOTPStep1API = async (username, email, password) => {
    try {
        const response = await axios.post(`${API_URL}/register/otp`, { 
            username, 
            email, 
            password 
        });
        return response.data;
    } catch (error) {
        console.error("Error sending OTP:", error.response?.data || error.message);
        throw error;
    }
};

// Register with OTP - Step 2: Verify OTP
export const registerWithOTPStep2API = async (username, email, password, otp) => {
    try {
        const response = await axios.post(`${API_URL}/register/otp/verify`, {
            username,
            email,
            password,
            otp
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            transformResponse: [data => {
                try {
                    return data ? JSON.parse(data) : {}; 
                } catch (e) {
                    return { message: "Đăng ký thành công" }; 
                }
            }]
        });

        console.log("Full server response:", response); // Debug toàn bộ response

        // Kiểm tra response.data tồn tại
        if (!response.data) {
            console.warn("Server returned empty response, creating default success response");
            return { 
                success: true, 
                message: "Đăng ký thành công",
                user: { username, email },
                token: "default-token-placeholder" 
            };
        }

        // Kiểm tra các trường bắt buộc
        if (response.data.success === false) {
            throw new Error(response.data.message || "Xác thực thất bại");
        }

        // Tạo object mặc định nếu thiếu các trường quan trọng
        const result = {
            success: true,
            message: response.data.message || "Đăng ký thành công",
            token: response.data.token || "default-token-placeholder",
            user: response.data.user || { username, email }
        };

        return result;

    } catch (error) {
        console.error("Error details:", {
            message: error.message,
            response: error.response?.data,
            config: error.config
        });
        
        // Tạo error object chuẩn
        const errObj = {
            message: error.response?.data?.message || error.message,
            code: error.response?.status || 500,
            data: error.response?.data || null
        };
        
        throw errObj;
    }
};

// Lấy danh sách sản phẩm của người dùng
export const getUserProducts = async (token) => {
    try {
        const response = await axios.post(`${API_URL}/consigns`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy danh sách sản phẩm:", error.response?.data || error.message);
        throw error;
    }
};

// Lấy chi tiết sản phẩm của người dùng
export const getProductDetails = async (productId, token) => {
    try {
        const response = await axios.post(`${API_URL}/consigns/${productId}`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy chi tiết sản phẩm:", error.response?.data || error.message);
        throw error;
    }
};

// Tạo đơn ký gửi
export const createConsignAPI = async (token, consignmentData) => {
    try {
        const response = await axios.post(`${API_URL}/CreateConsign`, consignmentData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi tạo đơn ký gửi:", error.response?.data);
        throw error.response?.data || { error: "Lỗi khi tạo đơn ký gửi" };
    }
};

// Lấy chi tiết phiếu ký gửi
export const fetchConsignmentDetailAPI = async (token, consignmentId) => {
    try {
        const response = await axios.post(
            `${API_URL}/detailConsign/${consignmentId}`,
            {},
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        console.log("Dữ liệu từ API (full response):", response);
        console.log("Dữ liệu từ API (chỉ data):", response.data);
        return response.data;
    } catch (err) {
        console.error("Lỗi chi tiết:", {
            message: err.message,
            response: err.response,
            config: err.config
        });
        throw err;
    }
};

// Lấy tất cả phiếu ký gửi (admin)
export const getAllConsignmentTicketsAPI = async (token) => {
    try {
        const response = await axios.post(
            `${API_URL}/admin/consignments`,
            {},
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        console.log("Dữ liệu nhận được từ API trả về mảng danh sách sản phẩm:", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy tất cả phiếu ký gửi:", error.response?.data || error.message);
        throw error;
    }
};

// Lấy phiếu ký gửi chờ duyệt (admin)
export const getPendingConsignmentsAPI = async (token) => {
    try {
        const response = await axios.post(
            `${API_URL}/admin/consignments/pending`,
            {},
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        console.log("Phiếu ký gửi PENDING:", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy phiếu ký gửi chờ duyệt:", error.response?.data || error.message);
        throw error;
    }
};

// Lấy phiếu ký gửi đã duyệt hoặc từ chối (admin)
export const getReviewedConsignmentsAPI = async (token) => {
    try {
        const response = await axios.post(
            `${API_URL}/admin/consignments/reviewed`,
            {},
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        console.log("Phiếu ký gửi đã duyệt hoặc từ chối:", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi lấy phiếu đã được duyệt/từ chối:", error.response?.data || error.message);
        throw error;
    }
};

// Duyệt phiếu ký gửi (admin)
export const approveConsignmentTicketAPI = async (token, ticketID) => {
    try {
        const response = await axios.put(
            `${API_URL}/admin/approve/${ticketID}`,
            {},
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        console.log("Dữ liệu trả về từ API khi duyệt phiếu ký gửi:", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi duyệt phiếu ký gửi:", error.response?.data || error.message);
        throw error;
    }
};

// Từ chối phiếu ký gửi (admin)
export const rejectConsignmentTicketAPI = async (token, ticketID) => {
    try {
        const response = await axios.put(
            `${API_URL}/admin/reject/${ticketID}`,
            {},
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        console.log("Dữ liệu trả về từ API khi từ chối phiếu ký gửi:", response.data);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi từ chối phiếu ký gửi:", error.response?.data || error.message);
        throw error;
    }
};

// Xóa sản phẩm trong đơn ký gửi
export const deleteProductInConsignmentAPI = async (token, consignmentId, productId) => {
    try {
        const response = await axios.post(
            `${API_URL}/consignments/${consignmentId}/products/${productId}`,
            {},
            
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        
        console.log("Phản hồi từ API khi xóa sản phẩm:", response.data);
        console.log("Token dùng để gọi API:", token);
        return response.data;
        

    } catch (error) {
        console.error("Lỗi khi xóa sản phẩm trong đơn:", error.response?.data || error.message);
        throw error;
    }
};
export const deleteConsignmentAPI = async (token, consignmentId) => {
    try {
        const response = await axios.post(
            `${API_URL}/consignments/${consignmentId}`,
            {},
            
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        
        console.log("Phản hồi từ API khi xóa sản phẩm:", response.data);
        console.log("Token dùng để gọi API:", token);
        return response.data;
        

    } catch (error) {
        console.error("Lỗi khi xóa đơn:", error.response?.data || error.message);
        throw error;
    }
};

export const updateConsignmentAPI = async (token, consignmentId, productId, updatedData) => {
    try {
        const response = await axios.put(
            `${API_URL}/consignmentUpdate/${consignmentId}/products/${productId}`,
            updatedData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        
        console.log("Phản hồi từ API khi sửa sản phẩm:", response.data);
        console.log("Token dùng để gọi API:", token);
        return response.data;
    
    } catch (error) {
        console.error("Chi tiết lỗi API:", {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data,
            params: { token, consignmentId, productId, updatedData }
        });
        throw error;
    }
};

export const searchProductsAPI = async (token, keyword) => {
    console.log("Calling search API with:", {
        url: `${API_URL}/admin/products/search`,
        keyword,
        token: token ? "exists" : "missing"
    });

    try {
        const response = await axios.get(
            `${API_URL}/admin/products/search`,
            {
                params: { keyword },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        console.log("Search API success:", response.data);
        return response.data;
    } catch (error) {
        console.error("Search API error details:", {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        throw error;
    }
};

export const createOrdersAPI = async (token, orderData) => {
    try {
        const response = await axios.post(
            `${API_URL}/admin/orders`,
            orderData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        
        console.log("Phản hồi từ API khi thêm đơn hàng:", response.data);
        return response.data;
    } catch (error) {
        const errorMsg = error.response?.data?.message || error.message;
        console.error("Lỗi khi thêm đơn hàng:", errorMsg);
        throw new Error(errorMsg);
    }
};

export const getInvoiceAPI = async (token, orderId) => {
    try {
        const response = await axios.get(
            `${API_URL}/admin/orders/${orderId}/invoice`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        const errorMsg = error.response?.data?.message || error.message;
        throw new Error(errorMsg);
    }
};