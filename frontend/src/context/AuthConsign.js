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
        console.log("AuthConsign useEffect chạy với user:", user);

        if (user === null) return; // user chưa load xong thì đứng yên

        if (user && user.token) {
            fetchUserProducts();
        }
    }, [user]);


    const fetchUserProducts = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setError("Người dùng chưa đăng nhập");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const data = await getUserProducts(token);
            setProducts(data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách sản phẩm:", error);
            // alert("jhgfdsfg")
            setError("Không thể lấy danh sách sản phẩm");

        } finally {
            setLoading(false);
        }
    };

    const createConsign = async (consignmentData) => {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Người dùng chưa đăng nhập.");
          return { success: false, message: "User not authenticated" };
        }
    
        setLoading(true);
        setError(null);
        try {
          const response = await createConsignAPI(token, consignmentData);
          setProducts((prevProducts) => [...prevProducts, response.data]);
          return { 
            success: true, 
            message: response.data.message || "Consignment created successfully",
            data: response.data
          };
        } catch (error) {
          console.error("Lỗi khi tạo ký gửi:", error);
          const errorMessage = error.response?.data?.message || 
                             error.message || 
                             "Không thể tạo ký gửi";
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
        // console.log("Tokennhe:", user);

        if (!token) {
            setError("Người dùng chưa đăng nhập.");
            // return;
        }

        setLoading(true);
        setError(null);

        try {
            // console.log("Tokẻten:",consignmentId, productId);
            console.log("Token:", token);

            const result = await deleteProductInConsignmentAPI(token, consignmentId, productId);
            return result;
        } catch (error) {
            // console.log("Tokendfvb:", token);
            console.error("Lỗi API:", error);
            return {
                success: false,
                message: error.response?.token?.message || "Lỗi server"
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
