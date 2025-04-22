import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getAllConsignmentTicketsAPI } from "../api/api";

const AdminConsignmentContext = createContext();

export const AdminConsignmentProvider = ({ children }) => {
  const [state, setState] = useState({
    consignments: [],
    loading: false,
    error: null,
    initialized: false
  });

  const handleError = useCallback((error) => {
    console.error("AdminConsignment Error:", error);
    return error.response?.data?.message 
      || error.message 
      || "Lỗi không xác định";
  }, []);

  const normalizeData = useCallback((data) => {
    try {
      if (!Array.isArray(data)) {
        console.warn("Dữ liệu không phải mảng:", data);
        return [];
      }

      // Debug: Log toàn bộ dữ liệu nhận được
      console.log("Dữ liệu thô từ API:", JSON.parse(JSON.stringify(data)));
      
      const ticketsMap = new Map();
      
      data.forEach(item => {
        try {
          // Kiểm tra cấu trúc item cơ bản
          if (!item || typeof item !== 'object') return;
          
          const ticketId = item.TicketID || item.ticketID || item.id;
          if (!ticketId) {
            console.warn("Item không có TicketID:", item);
            return;
          }
          
          // Tạo hoặc lấy ticket hiện có
          const ticket = ticketsMap.get(ticketId) || {
            TicketID: ticketId,
            User_name: item.User_name || item.username || 'Không xác định',
            Email: item.Email || item.email || '',
            Status: item.Status || item.status || 'pending',
            products: []
          };
          
          // Kiểm tra và thêm sản phẩm nếu có
          if (item.products && Array.isArray(item.products)) {
            // Nếu products đã được nhóm sẵn
            ticket.products.push(...item.products.filter(p => p && p.Product_name));
          } else if (item.Product_name || item.productName) {
            // Nếu item chính là sản phẩm
            ticket.products.push({
              Product_name: item.Product_name || item.productName,
              Quantity: item.Quantity || item.quantity || 0,
              Sale_price: item.Sale_price || item.salePrice || 0,
              Original_price: item.Original_price || item.originalPrice || 0,
              Brand_name: item.Brand_name || item.brandName || '',
              Product_type_name: item.Product_type_name || item.productType || ''
            });
          }
          
          ticketsMap.set(ticketId, ticket);
        } catch (itemError) {
          console.error("Lỗi xử lý item:", itemError, "Item:", item);
        }
      });
      
      const result = Array.from(ticketsMap.values());
      console.log("Dữ liệu sau chuẩn hóa:", result);
      return result;
    } catch (error) {
      console.error("Lỗi chuẩn hóa dữ liệu:", error);
      return [];
    }
  }, []);

  const fetchAllConsignmentTickets = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setState(prev => ({ ...prev, error: "Vui lòng đăng nhập lại", initialized: true }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await getAllConsignmentTicketsAPI(token);
      console.log("API Response (full):", response);
      
      // Xử lý nhiều định dạng response khác nhau
      let rawData = [];
      if (Array.isArray(response)) {
        rawData = response; // Trường hợp API trả về trực tiếp mảng
      } else if (Array.isArray(response?.data)) {
        rawData = response.data; // Trường hợp có wrapper object
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        rawData = response.data.data; // Trường hợp nested data
      } else {
        console.warn("Cấu trúc response không xác định:", response);
      }
      
      const normalizedData = normalizeData(rawData);
      
      setState({
        consignments: normalizedData,
        loading: false,
        error: null,
        initialized: true
      });
      
    } catch (error) {
      console.error("Lỗi khi fetch data:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
      }
      
      setState(prev => ({
        ...prev,
        error: handleError(error),
        loading: false,
        initialized: true
      }));
    }
  }, [handleError, normalizeData]);

  useEffect(() => {
    if (!state.initialized) {
      fetchAllConsignmentTickets();
    }
  }, [state.initialized, fetchAllConsignmentTickets]);

  const refreshData = useCallback(() => {
    setState(prev => ({ ...prev, initialized: false }));
  }, []);

  return (
    <AdminConsignmentContext.Provider
      value={{
        ...state,
        fetchAllConsignmentTickets,
        refreshData
      }}
    >
      {children}
    </AdminConsignmentContext.Provider>
  );
};

export const useAdminConsignment = () => {
  const context = useContext(AdminConsignmentContext);
  if (!context) {
    throw new Error("useAdminConsignment phải được dùng trong AdminConsignmentProvider");
  }
  return context;
};