import axios from "axios";

const API_URL = "http://localhost:8000/auth";
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


export const registerUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/register`, userData);
        return response.data;
    } catch (error) {
        console.error("Lỗi khi đăng ký:", error);
        throw error;
    }
};

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

export const createConsign = async (token, consignmentData) => {
    try {
        const response = await axios.post(`${API_URL}/CreateConsign`, consignmentData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi tạo đơn ký gửi:", error.response?.data || error.message);
        throw error;
    }
};

// Trong file API, sửa thành:
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



