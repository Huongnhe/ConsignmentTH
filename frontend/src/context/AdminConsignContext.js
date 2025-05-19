import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getPendingConsignmentsAPI, getReviewedConsignmentsAPI, approveConsignmentTicketAPI, rejectConsignmentTicketAPI } from "../api/api";

const AdminConsignmentContext = createContext();

export const AdminConsignmentProvider = ({ children }) => {
  const [state, setState] = useState({
    pendingConsignments: [],
    reviewedConsignments: [],
    loading: false,
    error: null,
    initialized: false
  });

  const handleError = useCallback((error) => {
    console.error("AdminConsignment Error:", error);
    return error.response?.data?.message 
      || error.message 
      || "Unknown error";
  }, []);

  const normalizeData = useCallback((data) => {
    try {
      if (!Array.isArray(data)) {
        console.warn("Data is not an array:", data);
        return [];
      }

      const ticketsMap = new Map();

      data.forEach(item => {
        try {
          const ticketId = item.TicketID || item.ticketID || item.id;
          if (!ticketId) return;

          const ticket = ticketsMap.get(ticketId) || {
            TicketID: ticketId,
            User_name: item.User_name || item.username || 'Unknown',
            Email: item.Email || item.email || '',
            Status: item.Status || item.status || 'Pending',
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
          console.error("Error processing item:", itemError, "Item:", item);
        }
      });

      return Array.from(ticketsMap.values());
    } catch (error) {
      console.error("Data normalization error:", error);
      return [];
    }
  }, []);

  const fetchPendingConsignments = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setState(prev => ({ ...prev, error: "Please login again", initialized: true }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await getPendingConsignmentsAPI(token);
      let rawData = response?.data || [];
      const normalizedData = normalizeData(rawData);

      setState(prev => ({
        ...prev,
        pendingConsignments: normalizedData,
        loading: false,
        error: null,
        initialized: true
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        error: handleError(error),
        loading: false,
        initialized: true
      }));
    }
  }, [handleError, normalizeData]);

  const fetchReviewedConsignments = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setState(prev => ({ ...prev, error: "Please login again", initialized: true }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await getReviewedConsignmentsAPI(token);
      let rawData = response?.data || [];
      const normalizedData = normalizeData(rawData);

      setState(prev => ({
        ...prev,
        reviewedConsignments: normalizedData,
        loading: false,
        error: null,
        initialized: true
      }));

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
      fetchPendingConsignments();
      fetchReviewedConsignments();
    }
  }, [state.initialized, fetchPendingConsignments, fetchReviewedConsignments]);

  const refreshData = useCallback(() => {
    setState(prev => ({ ...prev, initialized: false }));
  }, []);


  const approveConsignmentTicket = useCallback(async (ticketId) => {
  const token = localStorage.getItem("token");
  if (!token) {
    setState(prev => ({ ...prev, error: "Please login again", initialized: true }));
    return;
  }

  setState(prev => ({ ...prev, loading: true, error: null }));

  try {
    const response = await approveConsignmentTicketAPI(token, ticketId);

    if (response?.data?.success) {
      setState(prev => {
        // Filter out the approved ticket from pending list
        const updatedPending = prev.pendingConsignments.filter(ticket => ticket.TicketID !== ticketId);
        
        // Add the approved ticket to reviewed list
        const approvedTicket = prev.pendingConsignments.find(ticket => ticket.TicketID === ticketId);
        if (approvedTicket) {
          approvedTicket.Status = 'Approved';
          return {
            ...prev,
            pendingConsignments: updatedPending,
            reviewedConsignments: [...prev.reviewedConsignments, approvedTicket],
            loading: false,
            error: null
          };
        }
        
        return {
          ...prev,
          pendingConsignments: updatedPending,
          loading: false,
          error: null
        };
      });
      
      // Auto refresh after 1 second
      setTimeout(() => {
        fetchPendingConsignments();
        fetchReviewedConsignments();
      }, 1000);
    } else {
      throw new Error(response?.data?.message || 'Approval error');
    }
  } catch (error) {
    setState(prev => ({
      ...prev,
      error: handleError(error),
      loading: false,
    }));
  }
}, [handleError, fetchPendingConsignments, fetchReviewedConsignments]);

const rejectConsignmentTicket = useCallback(async (ticketId) => {
  const token = localStorage.getItem("token");
  if (!token) {
    setState(prev => ({ ...prev, error: "Please login again", initialized: true }));
    return;
  }

  setState(prev => ({ ...prev, loading: true, error: null }));

  try {
    const response = await rejectConsignmentTicketAPI(token, ticketId);

    if (response?.data?.success) {
      setState(prev => {
        // Filter out the rejected ticket from pending list
        const updatedPending = prev.pendingConsignments.filter(ticket => ticket.TicketID !== ticketId);
        
        // Add the rejected ticket to reviewed list
        const rejectedTicket = prev.pendingConsignments.find(ticket => ticket.TicketID === ticketId);
        if (rejectedTicket) {
          rejectedTicket.Status = 'Rejected';
          return {
            ...prev,
            pendingConsignments: updatedPending,
            reviewedConsignments: [...prev.reviewedConsignments, rejectedTicket],
            loading: false,
            error: null
          };
        }
        
        return {
          ...prev,
          pendingConsignments: updatedPending,
          loading: false,
          error: null
        };
      });
      
      // Auto refresh after 1 second
      setTimeout(() => {
        fetchPendingConsignments();
        fetchReviewedConsignments();
      }, 1000);
    } else {
      throw new Error(response?.data?.message || 'Rejection error');
    }
  } catch (error) {
    setState(prev => ({
      ...prev,
      error: handleError(error),
      loading: false,
    }));
  }
}, [handleError, fetchPendingConsignments, fetchReviewedConsignments]);

  return (
    <AdminConsignmentContext.Provider
      value={{
        ...state,
        fetchPendingConsignments,
        fetchReviewedConsignments,
        refreshData,
        approveConsignmentTicket,  
        rejectConsignmentTicket,  
      }}
    >
      {children}
    </AdminConsignmentContext.Provider>
  );
};

export const useAdminConsignment = () => {
  const context = useContext(AdminConsignmentContext);
  if (!context) {
    throw new Error("useAdminConsignment must be used within AdminConsignmentProvider");
  }
  return context;
};