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
        const response = await axios.post(
            `${API_URL}/consignmentUpdate/${consignmentId}/products/${productId}`,
            {updatedData},
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

export const searchOrderAPI = async (token, keyword) => {
    try {
        const response = await axios.post(
            `${API_URL}/staff/products/search?keyword=${keyword}`,
            {},
            
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        
        console.log("Phản hồi từ API khi tìm đơn hàng:", response.data);
        console.log("Token dùng để gọi API:", token);
        return response.data;
        

    } catch (error) {
        console.error("Lỗi khi tìm đơn hàng:", error.response?.data || error.message);
        throw error;
    }
};