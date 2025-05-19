import axios from "axios";

const API_URL = "http://localhost:8000/auth";

// User login
export const loginUser = async (email, password, account) => {
    try {
        const response = await axios.post(`${API_URL}/login`, { email, password, account });
        console.log("API response:", response.data);
        return response.data;
    } catch (error) {
        console.error("Login error:", error.response?.data || error.message);
        throw error;
    }
};

// User registration
export const registerUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/register`, userData);
        return response.data;
    } catch (error) {
        console.error("Registration error:", error);
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
                    return { message: "Registration successful" }; 
                }
            }]
        });

        console.log("Full server response:", response); // Debug entire response

        // Check if response.data exists
        if (!response.data) {
            console.warn("Server returned empty response, creating default success response");
            return { 
                success: true, 
                message: "Registration successful",
                user: { username, email },
                token: "default-token-placeholder" 
            };
        }

        // Check required fields
        if (response.data.success === false) {
            throw new Error(response.data.message || "Verification failed");
        }

        // Create default object if important fields are missing
        const result = {
            success: true,
            message: response.data.message || "Registration successful",
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
        
        // Create standard error object
        const errObj = {
            message: error.response?.data?.message || error.message,
            code: error.response?.status || 500,
            data: error.response?.data || null
        };
        
        throw errObj;
    }
};

// Get user's product list
export const getUserProducts = async (token) => {
    try {
        const response = await axios.post(`${API_URL}/consigns`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Error getting product list:", error.response?.data || error.message);
        throw error;
    }
};

// Get user's product details
export const getProductDetails = async (productId, token) => {
    try {
        const response = await axios.post(`${API_URL}/consigns/${productId}`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (error) {
        console.error("Error getting product details:", error.response?.data || error.message);
        throw error;
    }
};

// Create consignment
export const createConsignAPI = async (token, consignmentData) => {
    try {
        const response = await axios.post(`${API_URL}/CreateConsign`, consignmentData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error creating consignment:", error.response?.data);
        throw error.response?.data || { error: "Error creating consignment" };
    }
};

// Get consignment details
export const fetchConsignmentDetailAPI = async (token, consignmentId) => {
    try {
        const response = await axios.post(
            `${API_URL}/detailConsign/${consignmentId}`,
            {},
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        console.log("API data (full response):", response);
        console.log("API data (only data):", response.data);
        return response.data;
    } catch (err) {
        console.error("Error details:", {
            message: err.message,
            response: err.response,
            config: err.config
        });
        throw err;
    }
};

// Get all consignment tickets (admin)
export const getAllConsignmentTicketsAPI = async (token) => {
    try {
        const response = await axios.post(
            `${API_URL}/admin/consignments`,
            {},
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        console.log("API data received returning product list array:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error getting all consignment tickets:", error.response?.data || error.message);
        throw error;
    }
};

// Get pending consignments (admin)
export const getPendingConsignmentsAPI = async (token) => {
    try {
        const response = await axios.post(
            `${API_URL}/admin/consignments/pending`,
            {},
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        console.log("PENDING consignments:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error getting pending consignments:", error.response?.data || error.message);
        throw error;
    }
};

// Get reviewed/rejected consignments (admin)
export const getReviewedConsignmentsAPI = async (token) => {
    try {
        const response = await axios.post(
            `${API_URL}/admin/consignments/reviewed`,
            {},
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        console.log("Reviewed/rejected consignments:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error getting reviewed/rejected consignments:", error.response?.data || error.message);
        throw error;
    }
};

// Approve consignment ticket (admin)
export const approveConsignmentTicketAPI = async (token, ticketID) => {
    try {
        const response = await axios.put(
            `${API_URL}/admin/approve/${ticketID}`,
            {},
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        console.log("API response when approving consignment:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error approving consignment:", error.response?.data || error.message);
        throw error;
    }
};

// Reject consignment ticket (admin)
export const rejectConsignmentTicketAPI = async (token, ticketID) => {
    try {
        const response = await axios.put(
            `${API_URL}/admin/reject/${ticketID}`,
            {},
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        console.log("API response when rejecting consignment:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error rejecting consignment:", error.response?.data || error.message);
        throw error;
    }
};

// Delete product in consignment
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
        
        console.log("API response when deleting product:", response.data);
        console.log("Token used for API call:", token);
        return response.data;
    } catch (error) {
        console.error("Error deleting product in consignment:", error.response?.data || error.message);
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
        
        console.log("API response when deleting consignment:", response.data);
        console.log("Token used for API call:", token);
        return response.data;
    } catch (error) {
        console.error("Error deleting consignment:", error.response?.data || error.message);
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
        
        console.log("API response when updating product:", response.data);
        console.log("Token used for API call:", token);
        return response.data;
    } catch (error) {
        console.error("API error details:", {
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
        
        console.log("API response when creating order:", response.data);
        return response.data;
    } catch (error) {
        const errorMsg = error.response?.data?.message || error.message;
        console.error("Error creating order:", errorMsg);
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