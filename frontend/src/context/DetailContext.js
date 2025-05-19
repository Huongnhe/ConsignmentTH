import React, { createContext, useContext, useState } from "react";
import { fetchConsignmentDetailAPI, deleteConsignmentAPI, updateConsignmentAPI } from "../api/api";

const AuthDetailContext = createContext();

export const AuthDetailProvider = ({ children }) => {
    const [consignmentDetail, setConsignmentDetail] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchConsignmentDetail = async (consignmentId) => {
        const token = localStorage.getItem("token");

        if (!token) {
            setError("Token does not exist.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await fetchConsignmentDetailAPI(token, consignmentId);
            console.log("Data received from API:", JSON.stringify(data, null, 2));

            const formattedData = {
                ...data,
                Products: data.Products || []
            };

            setConsignmentDetail(formattedData);
            console.log("Consignment details:", formattedData);
        } catch (err) {
            setError(err.message || "Failed to get consignment details.");
            console.error("Error details:", {
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
            setError("Token does not exist.");
            return;
        }

        try {
            const result = await deleteConsignmentAPI(token, consignmentId);

            if (result.success) {
                alert("Consignment deleted successfully!");
                return result;
            } else {
                setError(result.message || "Failed to delete consignment.");
            }
        } catch (err) {
            setError(err.message || "Error deleting consignment.");
            console.error("Consignment deletion error:", err);
        }
    };

    const updateConsignment = async (consignmentId, productId, updatedData) => {
        console.log("[DEBUG] Update params:", { consignmentId, productId, updatedData });
        
        const token = localStorage.getItem("token");
        if (!token) {
            const errorMsg = "Please login again";
            setError(errorMsg);
            throw new Error(errorMsg);
        }

        if (!productId) {
            const errorMsg = "Missing product ID";
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
    
            console.log("API Response:", result);
            
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

            let errorMsg = "Update failed";
            
            if (error.response?.data?.errors) {
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
            value={{ consignmentDetail, fetchConsignmentDetail, deleteConsignment, updateConsignment, loading, error }}
        >
            {children}
        </AuthDetailContext.Provider>
    );
};

export const useAuthDetail = () => {
    return useContext(AuthDetailContext);
};