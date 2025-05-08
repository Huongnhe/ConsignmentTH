import { createContext, useState, useContext, useEffect } from "react";
import { searchOrderAPI } from "../api/api";
import { AuthContext } from "./AuthContext";

export const OrderContext = createContext();

export const OrderSearchProvider = ({ children }) => {  
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

    const searchOrders = async (searchKeyword) => {
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
            const results = await searchOrderAPI(token, searchKeyword);
            setSearchResults(results);
            setLastSearch(new Date()); 
            return { 
                success: true, 
                message: "Tìm kiếm thành công",
                data: results 
            };
        } catch (error) {
            console.error("Search error:", { error, token, searchKeyword });
            
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
        searchOrders,
        clearSearch,
        hasSearched: !!lastSearch
    };

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrderSearch = () => {
    const context = useContext(OrderContext);
    if (!context) {
        throw new Error('useOrderSearch phải được sử dụng bên trong OrderProvider');
    }
    return context;
};