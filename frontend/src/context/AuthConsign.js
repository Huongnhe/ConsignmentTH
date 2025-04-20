import { createContext, useState, useEffect, useContext } from "react";
import { getUserProducts, createConsign } from "../api/api";
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
            alert("jhgfdsfg")
            setError("Không thể lấy danh sách sản phẩm");

        } finally {
            setLoading(false);
        }
    };
    
    const createConsign = async (consignmentData) => {
        const token = user?.token;
        if (!token) {
            setError("Người dùng chưa đăng nhập.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const newConsignment = await createConsign(token, consignmentData); // Tạo ký gửi mới
            setProducts((prevProducts) => [...prevProducts, newConsignment]); // Thêm ký gửi vào danh sách
        } catch (error) {
            console.error("Lỗi khi tạo ký gửi:", error);
            setError("Không thể tạo ký gửi.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <ConsignContext.Provider value={{ products, loading, error, fetchUserProducts, createConsign }}>
            {children}
        </ConsignContext.Provider>
    );
};
