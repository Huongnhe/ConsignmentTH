import React, { useEffect, useState } from "react";
import { useAdminConsignment } from "../context/AdminConsignContext";
import SidebarMenu from "./MenuAdmin";

const AdminConsign = () => {
  const {
    pendingConsignments,
    reviewedConsignments,
    fetchPendingConsignments,
    fetchReviewedConsignments,
    loading,
    error,
    refreshData,
    approveConsignmentTicket,
    rejectConsignmentTicket,
  } = useAdminConsignment();

  const [currentTab, setCurrentTab] = useState("pending");
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (currentTab === "pending") {
      fetchPendingConsignments();
    } else {
      fetchReviewedConsignments();
    }
  }, [currentTab, fetchPendingConsignments, fetchReviewedConsignments]);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-success text-white";
      case "rejected":
        return "bg-danger text-white";
      case "pending":
        return "bg-warning text-dark";
      default:
        return "bg-secondary text-white";
    }
  };

  const handleApprove = (ticketID) => {
    const confirmed = window.confirm("Are you sure you want to *approve* this consignment ticket?");
    if (!confirmed) return;

    approveConsignmentTicket(ticketID).then(() => {
      setMessage("Ticket approved successfully.");
      if (currentTab === "pending") {
        fetchPendingConsignments();
      } else {
        fetchReviewedConsignments();
      }
    });
  };

  const handleReject = (ticketID) => {
    const confirmed = window.confirm("Are you sure you want to *reject* this consignment ticket?");
    if (!confirmed) return;

    rejectConsignmentTicket(ticketID).then(() => {
      setMessage("Ticket has been rejected.");
      if (currentTab === "pending") {
        fetchPendingConsignments();
      } else {
        fetchReviewedConsignments();
      }
    });
  };

  return (
    <div className="container-fluid bg-light">
      <div className="row">
        <div className="col-md-3 col-lg-2 bg-dark min-vh-100 p-0">
          <SidebarMenu />
        </div>

        <div className="col-md-9 col-lg-10 py-4 px-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0 text-dark">Consignment Tickets</h2>
            <button 
              onClick={refreshData} 
              className="btn btn-outline-dark" 
              disabled={loading}
            >
              <i className="bi bi-arrow-clockwise me-1"></i>
              Refresh
            </button>
          </div>

          <div className="d-flex mb-4">
            <button
              className={`btn btn-outline-dark me-2 ${currentTab === "pending" ? "active bg-dark text-white" : ""}`}
              onClick={() => setCurrentTab("pending")}
            >
              Pending Approval
            </button>
            <button
              className={`btn btn-outline-dark ${currentTab === "reviewed" ? "active bg-dark text-white" : ""}`}
              onClick={() => setCurrentTab("reviewed")}
            >
              Reviewed Tickets
            </button>
          </div>

          {message && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              {message}
              <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
            </div>
          )}

          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
              <div className="spinner-border text-dark" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <span className="ms-2 text-dark">Loading data...</span>
            </div>
          ) : error ? (
            <div className="alert alert-danger m-3">
              <strong>Error:</strong> {error}
              <button onClick={refreshData} className="btn btn-sm btn-outline-danger ms-2">
                Try Again
              </button>
            </div>
          ) : (currentTab === "pending" ? pendingConsignments : reviewedConsignments).length === 0 ? (
            <div className="alert alert-secondary">
              No consignment tickets found
            </div>
          ) : (
            <div className="row g-4">
              {(currentTab === "pending" ? pendingConsignments : reviewedConsignments).map((ticket) => (
                <div key={ticket.TicketID} className="col-12">
                  <div className="card shadow-sm border-0">
                    <div className="card-header bg-white border-bottom">
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 text-dark">Ticket #{ticket.TicketID}</h5>
                        <span className={`badge ${getStatusBadge(ticket.Status)}`}>
                          {ticket.Status}
                        </span>
                      </div>
                    </div>
                    <div className="card-body bg-white">
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <p className="text-dark"><strong>Customer:</strong> {ticket.User_name}</p>
                          <p className="text-dark"><strong>Email:</strong> {ticket.Email}</p>
                        </div>
                        <div className="col-md-6">
                          <p className="text-dark"><strong>Created Date:</strong> {ticket.Create_date || "--/--/----"}</p>
                          <p className="text-dark"><strong>Notes:</strong> {ticket.Note || "None"}</p>
                        </div>
                      </div>

                      <h6 className="mb-3 text-dark">Product List</h6>

                      {ticket.products && ticket.products.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-sm table-hover align-middle text-center">
                            <thead className="table-light">
                              <tr>
                                <th className="text-start text-dark">Product Name</th>
                                <th className="text-dark">Qty</th>
                                <th className="text-dark">Original Price</th>
                                <th className="text-dark">Sale Price</th>
                                <th className="text-dark">Brand</th>
                                <th className="text-dark">Type</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ticket.products.map((product, idx) => (
                                <tr key={idx}>
                                  <td className="text-start text-dark">{product.Product_name}</td>
                                  <td className="text-dark">{product.Quantity}</td>
                                  <td className="text-dark">{Number(product.Original_price).toLocaleString()}đ</td>
                                  <td className="text-dark">{Number(product.Sale_price).toLocaleString()}đ</td>
                                  <td className="text-dark">{product.Brand_name || "-"}</td>
                                  <td className="text-dark">{product.Product_type_name || "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="alert alert-secondary mb-0">
                          No products in this ticket
                        </div>
                      )}
                    </div>
                    <div className="card-footer bg-white border-top">
                      <div className="d-flex justify-content-end">
                        {(!ticket.Status.includes("Rejected") && !(ticket.Status === "Rejected")) && (
                          <button
                            className="btn btn-sm btn-outline-danger me-2"
                            onClick={() => handleReject(ticket.TicketID)}
                          >
                            <i className="bi bi-x-circle me-1"></i>
                            Reject
                          </button>
                        )}

                        {(!ticket.Status.includes("Approved") && !(ticket.Status === "Approved")) && (
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleApprove(ticket.TicketID)}
                          >
                            <i className="bi bi-check-circle me-1"></i>
                            Approve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminConsign;