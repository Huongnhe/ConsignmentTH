import React, { useEffect, useState } from "react";
import { useAdminConsignment } from "../context/AuthAdminConsign";
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
      case "đã duyệt":
        return "success";
      case "rejected":
      case "từ chối":
        return "danger";
      case "pending":
      case "đang chờ":
        return "warning";
      default:
        return "secondary";
    }
  };

  const handleApprove = (ticketID) => {
    const confirmed = window.confirm("Bạn có chắc chắn muốn *duyệt* phiếu ký gửi này?");
    if (!confirmed) return;

    approveConsignmentTicket(ticketID).then(() => {
      setMessage("Phiếu đã được duyệt thành công.");
      if (currentTab === "pending") {
        fetchPendingConsignments();
      } else {
        fetchReviewedConsignments();
      }
    });
  };

  const handleReject = (ticketID) => {
    const confirmed = window.confirm("Bạn có chắc chắn muốn *từ chối* phiếu ký gửi này?");
    if (!confirmed) return;

    rejectConsignmentTicket(ticketID).then(() => {
      setMessage("Phiếu đã bị từ chối.");
      if (currentTab === "pending") {
        fetchPendingConsignments();
      } else {
        fetchReviewedConsignments();
      }
    });
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Menu sidebar bên trái */}
        <div className="col-md-3 col-lg-2 bg-light min-vh-100 p-0 border-end">
          <SidebarMenu />
        </div>

        {/* Nội dung chính */}
        <div className="col-md-9 col-lg-10 py-4 px-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Danh sách phiếu ký gửi</h2>
            <button onClick={refreshData} className="btn btn-primary" disabled={loading}>
              <i className="bi bi-arrow-clockwise me-1"></i>
              Làm mới
            </button>
          </div>

          <div className="d-flex mb-4">
            <button
              className={`btn btn-outline-primary me-2 ${currentTab === "pending" ? "active" : ""}`}
              onClick={() => setCurrentTab("pending")}
            >
              Phiếu Chờ Duyệt
            </button>
            <button
              className={`btn btn-outline-primary ${currentTab === "reviewed" ? "active" : ""}`}
              onClick={() => setCurrentTab("reviewed")}
            >
              Phiếu Đã Duyệt/Từ Chối
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
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <span className="ms-2">Đang tải dữ liệu...</span>
            </div>
          ) : error ? (
            <div className="alert alert-danger m-3">
              <strong>Lỗi:</strong> {error}
              <button onClick={refreshData} className="btn btn-sm btn-outline-danger ms-2">
                Thử lại
              </button>
            </div>
          ) : (currentTab === "pending" ? pendingConsignments : reviewedConsignments).length === 0 ? (
            <div className="alert alert-info">
              Không có phiếu ký gửi nào
            </div>
          ) : (
            <div className="row g-4">
              {(currentTab === "pending" ? pendingConsignments : reviewedConsignments).map((ticket) => (
                <div key={ticket.TicketID} className="col-12">
                  <div className="card shadow-sm">
                    <div className="card-header bg-light">
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Phiếu #{ticket.TicketID}</h5>
                        <span className={`badge bg-${getStatusBadge(ticket.Status)}`}>
                          {ticket.Status}
                        </span>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <p><strong>Khách hàng:</strong> {ticket.User_name}</p>
                          <p><strong>Email:</strong> {ticket.Email}</p>
                        </div>
                        <div className="col-md-6">
                          <p><strong>Ngày tạo:</strong> {ticket.Create_date || "--/--/----"}</p>
                          <p><strong>Ghi chú:</strong> {ticket.Note || "Không có"}</p>
                        </div>
                      </div>

                      <h6 className="mb-3">Danh sách sản phẩm</h6>

                      {ticket.products && ticket.products.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-bordered table-sm table-hover align-middle text-center">
                            <thead className="table-light">
                              <tr>
                                <th className="text-start">Tên sản phẩm</th>
                                <th>SL</th>
                                <th>Giá gốc</th>
                                <th>Giá bán</th>
                                <th>Thương hiệu</th>
                                <th>Loại</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ticket.products.map((product, idx) => (
                                <tr key={idx}>
                                  <td className="text-start">{product.Product_name}</td>
                                  <td>{product.Quantity}</td>
                                  <td>{Number(product.Original_price).toLocaleString()}đ</td>
                                  <td>{Number(product.Sale_price).toLocaleString()}đ</td>
                                  <td>{product.Brand_name || "-"}</td>
                                  <td>{product.Product_type_name || "-"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="alert alert-warning mb-0">
                          Không có sản phẩm nào trong phiếu này
                        </div>
                      )}
                    </div>
                    <div className="card-footer bg-light">
                      <div className="d-flex justify-content-end">
                        {/* Nút từ chối - hiển thị trong mọi trường hợp trừ khi đã rejected */}
                        {(!ticket.Status.includes("Từ chối") && !(ticket.Status === "Rejected")) && (
                          <button
                            className="btn btn-sm btn-outline-danger me-2"
                            onClick={() => handleReject(ticket.TicketID)}
                          >
                            <i className="bi bi-x-circle me-1"></i>
                            Từ chối
                          </button>
                        )}

                        {/* Nút duyệt - hiển thị trong mọi trường hợp trừ khi đã approved */}
                        {(!ticket.Status.includes("Đã duyệt") && !(ticket.Status === "Approved")) && (
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleApprove(ticket.TicketID)}
                          >
                            <i className="bi bi-check-circle me-1"></i>
                            Duyệt
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
