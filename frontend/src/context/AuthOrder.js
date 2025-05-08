import { createContext, useState, useContext, useEffect } from "react";
import { searchProductsAPI } from "../api/api"; // Đổi tên import cho đúng
import { AuthContext } from "./AuthContext";

export const ProductSearchContext = createContext(); // Đổi tên context

export const ProductSearchProvider = ({ children }) => { // Đổi tên provider
    const { user } = useContext(AuthContext);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [keyword, setKeyword] = useState('');
    const [lastSearch, setLastSearch] = useState(null);

    useEffect(() => {
        if (!user) {
            clearSearch();
        }
    }, [user]);

    const searchProducts = async (searchKeyword) => { // Đổi tên hàm
        if (!searchKeyword?.trim()) {
            setError("Vui lòng nhập từ khóa tìm kiếm");
            return { success: false, message: "Search keyword is required" };
        }

        const token = localStorage.getItem("token");
        if (!token || !user) {
            setError("Vui lòng đăng nhập để tìm kiếm");
            return { success: false, message: "Authentication required" };
        }

        setLoading(true);
        setError(null);
        setKeyword(searchKeyword);

        try {
            const results = await searchProductsAPI(token, searchKeyword); // Gọi đúng API
            setSearchResults(results);
            setLastSearch(new Date()); 
            return { 
                success: true, 
                message: "Tìm kiếm thành công",
                data: results 
            };
        } catch (error) {
            console.error("Search error:", error);
            
            const errorMessage = error.response?.data?.message || 
                               "Tìm kiếm thất bại. Vui lòng thử lại";
            setError(errorMessage);
            setSearchResults([]);
            
            return { 
                success: false, 
                message: errorMessage,
                error: error.response?.data || error 
            };
        } finally {
            setLoading(false);
        }
    };

    const clearSearch = () => {
        setSearchResults([]);
        setKeyword('');
        setError(null);
        setLastSearch(null);
    };

    const value = {
        searchResults,
        loading,
        error,
        keyword,
        lastSearch,
        searchProducts, // Cập nhật tên hàm
        clearSearch,
        hasSearched: !!lastSearch
    };

    return (
        <ProductSearchContext.Provider value={value}> {/* Đổi tên context */}
            {children}
        </ProductSearchContext.Provider>
    );
};

export const useProductSearch = () => { // Đổi tên hook
    const context = useContext(ProductSearchContext); // Đổi tên context
    if (!context) {
        throw new Error('useProductSearch phải được sử dụng bên trong ProductSearchProvider');
    }
    return context;
};