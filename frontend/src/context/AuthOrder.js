import { createContext, useState, useContext, useEffect, useCallback } from "react";
import { searchProductsAPI } from "../api/api";

export const ProductSearchContext = createContext();

export const ProductSearchProvider = ({ children }) => {
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [keyword, setKeyword] = useState('');
    const [lastSearch, setLastSearch] = useState(null);

    const clearSearch = useCallback(() => {
        setSearchResults([]);
        setKeyword('');
        setError(null);
        setLastSearch(null);
    }, []);

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (!user) {
            clearSearch();
        }
    }, [clearSearch]);

    const searchProducts = async (searchKeyword) => {
        const token = localStorage.getItem("token");
        if (!searchKeyword?.trim()) {
            setError("Vui lòng nhập từ khóa tìm kiếm");
            return { success: false, message: "Search keyword is required" };
        }

        if (!token) {
            setError("Vui lòng đăng nhập để tìm kiếm");
            return { success: false, message: "Authentication required" };
        }

        setLoading(true);
        setError(null);
        setKeyword(searchKeyword);

        try {
            const results = await searchProductsAPI(token, searchKeyword);
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
                               "Tìm kiếm thất bại. Vui lòng thử lại" + error.response?.data?.message;
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

    const value = {
        searchResults,
        loading,
        error,
        keyword,
        lastSearch,
        searchProducts,
        clearSearch,
        hasSearched: !!lastSearch
    };

    return (
        <ProductSearchContext.Provider value={value}>
            {children}
        </ProductSearchContext.Provider>
    );
};


export const useProductSearch = () => {
    const context = useContext(ProductSearchContext);
    if (!context) {
        throw new Error('useProductSearch phải được sử dụng bên trong ProductSearchProvider');
    }
    return context;
};