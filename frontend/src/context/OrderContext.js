import { createContext, useState, useContext, useEffect, useCallback } from "react";
import { searchProductsAPI, getInvoiceAPI } from "../api/api";

export const ProductSearchContext = createContext();

export const ProductSearchProvider = ({ children }) => {
    const [searchResults, setSearchResults] = useState([]);
    const [invoice, setInvoice] = useState(null);
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
        if (!user) clearSearch();
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
            return { success: true, data: results };
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Tìm kiếm thất bại";
            setError(errorMessage);
            setSearchResults([]);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    };

    const fetchInvoice = async (orderId) => {
        const token = localStorage.getItem('token');
        setLoading(true);
        setError(null);
        try {
            const data = await getInvoiceAPI(token, orderId);
            setInvoice(data);
            return { success: true, data };
        } catch (err) {
            const errorMsg = err.response?.data?.message || "Lỗi khi tải hóa đơn";
            setError(errorMsg);
            setInvoice(null);
            return { success: false, message: errorMsg };
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
        invoice,
        searchProducts,
        fetchInvoice,
        clearSearch,
        hasSearched: !!lastSearch,
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
