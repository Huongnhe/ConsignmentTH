import { createContext, useState, useEffect, useContext } from "react";
import { getUserProducts, deleteProductInConsignmentAPI, createConsignAPI } from "../api/api";
import { AuthContext } from "./AuthContext";

export const ConsignContext = createContext();

export const ConsignProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log("AuthConsign useEffect runs with user:", user);

        if (user === null) return; // Wait until user is loaded

        if (user && user.token) {
            fetchUserProducts();
        }
    }, [user]);

    const fetchUserProducts = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("User not logged in");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await getUserProducts(token);
            setProducts(data);
        } catch (error) {
            console.error("Error fetching product list:", error);
            setError("Failed to get product list");
        } finally {
            setLoading(false);
        }
    };

    const createConsign = async (consignmentData) => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("User not logged in.");
            return { success: false, message: "User not authenticated" };
        }
    
        setLoading(true);
        setError(null);
        try {
            const response = await createConsignAPI(token, consignmentData);
            setProducts((prevProducts) => [...prevProducts, response.data]);
            return { 
                success: true, 
                message: response.data?.message || "Consignment created successfully",
                data: response.data
            };
        } catch (error) {
            console.error("Error creating consignment:", {
                error,
                token,
                consignmentData
            });
              
            const errorMessage = error.response?.data?.message || 
                                error.message || 
                                "Failed to create consignment";
            setError(errorMessage);
            return { 
                success: false, 
                message: errorMessage 
            };
        } finally {
            setLoading(false);
        }
    };
    
    const deleteProductInConsignment = async (consignmentId, productId) => {
        const token = localStorage.getItem("token");

        if (!token) {
            setError("User not logged in.");
        }

        setLoading(true);
        setError(null);

        try {
            console.log("Token:", token);
            const result = await deleteProductInConsignmentAPI(token, consignmentId, productId);
            return result;
        } catch (error) {
            console.error("API Error:", error);
            return {
                success: false,
                message: error.response?.token?.message || "Server error"
            };
        } finally {
            setLoading(false);
        }
    };

    return (
        <ConsignContext.Provider value={{ products, loading, error, fetchUserProducts, createConsign, deleteProductInConsignment }}>
            {children}
        </ConsignContext.Provider>
    );
};