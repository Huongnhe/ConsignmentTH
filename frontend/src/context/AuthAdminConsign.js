import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getAllConsignmentTicketsAPI, approveConsignmentTicketAPI, rejectConsignmentTicketAPI } from "../api/api";

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

      const ticketsMap = new Map();

      data.forEach(item => {
        try {
          const ticketId = item.TicketID || item.ticketID || item.id;
          if (!ticketId) return;

          const ticket = ticketsMap.get(ticketId) || {
            TicketID: ticketId,
            User_name: item.User_name || item.username || 'Không xác định',
            Email: item.Email || item.email || '',
            Status: item.Status || item.status || 'pending',
            Create_date: item.Create_date || '--/--/----',
            products: []
          };

          if (item.products && Array.isArray(item.products)) {
            ticket.products.push(...item.products.filter(p => p && p.Product_name));
          } else if (item.Product_name || item.productName) {
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

      return Array.from(ticketsMap.values());
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
      let rawData = [];

      if (Array.isArray(response)) {
        rawData = response;
      } else if (Array.isArray(response?.data)) {
        rawData = response.data;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        rawData = response.data.data;
      }

      const normalizedData = normalizeData(rawData);

      setState({
        consignments: normalizedData,
        loading: false,
        error: null,
        initialized: true
      });

    } catch (error) {
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

  const approveConsignmentTicket = useCallback(async (ticketId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setState(prev => ({ ...prev, error: "Vui lòng đăng nhập lại", initialized: true }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await approveConsignmentTicketAPI(token, ticketId);

      if (response?.data?.success) {
        setState(prev => {
          const updatedConsignments = prev.consignments.map(ticket => {
            if (ticket.TicketID === ticketId) {
              return { ...ticket, Status: 'Approved' };
            }
            return ticket;
          });

          return {
            ...prev,
            consignments: updatedConsignments,
            loading: false,
            error: null,
          };
        });
      } else {
        throw new Error(response?.data?.message || 'Lỗi khi duyệt đơn');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: handleError(error),
        loading: false,
      }));
    }
  }, [handleError]);

  // Thêm hàm từ chối phiếu ký gửi
  const rejectConsignmentTicket = useCallback(async (ticketId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setState(prev => ({ ...prev, error: "Vui lòng đăng nhập lại", initialized: true }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await rejectConsignmentTicketAPI(token, ticketId);

      if (response?.data?.success) {
        setState(prev => {
          const updatedConsignments = prev.consignments.map(ticket => {
            if (ticket.TicketID === ticketId) {
              return { ...ticket, Status: 'Rejected' };
            }
            return ticket;
          });

          return {
            ...prev,
            consignments: updatedConsignments,
            loading: false,
            error: null,
          };
        });
      } else {
        throw new Error(response?.data?.message || 'Lỗi khi từ chối đơn');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: handleError(error),
        loading: false,
      }));
    }
  }, [handleError]);

  return (
    <AdminConsignmentContext.Provider
      value={{
        ...state,
        fetchAllConsignmentTickets,
        refreshData,
        approveConsignmentTicket,  
        rejectConsignmentTicket,  // Thêm hàm từ chối vào context
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
