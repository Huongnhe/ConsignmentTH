import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSale } from '../context/AuthOrder';
import SidebarMenu from './MenuAdmin';

const OrderStatusDetailPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { 
        invoice, 
        getInvoice, 
        orderLoading, 
        orderError 
    } = useSale();

    useEffect(() => {
        if (orderId) {
            getInvoice(orderId);
        }
    }, [orderId]);

    if (orderLoading) {
        return (
            <div style={{ display: 'flex' }}>
                <SidebarMenu />
                <div className="container-fluid mt-3" style={{ marginLeft: '250px', padding: '20px' }}>
                    <div className="d-flex justify-content-center my-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (orderError) {
        return (
            <div style={{ display: 'flex' }}>
                <SidebarMenu />
                <div className="container-fluid mt-3" style={{ marginLeft: '250px', padding: '20px' }}>
                    <div className="alert alert-danger">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {orderError}
                    </div>
                    <button 
                        className="btn btn-secondary"
                        onClick={() => navigate('/admin/orders')}
                    >
                        Quay lại danh sách đơn hàng
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex' }}>
            <SidebarMenu />
            
            <div className="container-fluid mt-3" style={{ marginLeft: '250px', padding: '20px' }}>
                <div className="card shadow">
                    <div className="card-header bg-primary text-white">
                        <div className="d-flex justify-content-between align-items-center">
                            <h4 className="mb-0">Chi tiết đơn hàng #{orderId}</h4>
                            <button 
                                className="btn btn-light btn-sm"
                                onClick={() => navigate('/admin/orders')}
                            >
                                <i className="bi bi-arrow-left me-1"></i> Quay lại
                            </button>
                        </div>
                    </div>

                    <div className="card-body">
                        {/* Thông tin khách hàng */}
                        <div className="row mb-4">
                            <div className="col-md-6">
                                <h5 className="border-bottom pb-2">Thông tin khách hàng</h5>
                                <div className="mb-2">
                                    <strong>Tên:</strong> {invoice?.order?.customer_name || 'Khách lẻ'}
                                </div>
                                <div className="mb-2">
                                    <strong>SĐT:</strong> {invoice?.order?.customer_phone}
                                </div>
                                {invoice?.order?.customer_address && (
                                    <div className="mb-2">
                                        <strong>Địa chỉ:</strong> {invoice.order.customer_address}
                                    </div>
                                )}
                            </div>
                            
                            <div className="col-md-6">
                                <h5 className="border-bottom pb-2">Thông tin đơn hàng</h5>
                                <div className="mb-2">
                                    <strong>Ngày tạo:</strong> {new Date(invoice?.order?.created_at).toLocaleString()}
                                </div>
                                <div className="mb-2">
                                    <strong>Trạng thái:</strong> 
                                    <span className={`badge ${getStatusBadge(invoice?.order?.Order_status).class} ms-2`}>
                                        {getStatusBadge(invoice?.order?.Order_status).text}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Danh sách sản phẩm */}
                        <h5 className="border-bottom pb-2 mb-3">Sản phẩm</h5>
                        <div className="table-responsive">
                            <table className="table table-bordered">
                                <thead className="table-light">
                                    <tr>
                                        <th>STT</th>
                                        <th>Sản phẩm</th>
                                        <th>Đơn giá</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice?.products?.map((product, index) => (
                                        <tr key={product.Product_id}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    {product.Image && (
                                                        <img 
                                                            src={product.Image} 
                                                            alt={product.Product_name}
                                                            className="img-thumbnail me-3"
                                                            style={{ width: '50px', height: '50px' }}
                                                        />
                                                    )}
                                                    <div>
                                                        <div>{product.Product_name}</div>
                                                        <small className="text-muted">{product.Brand_name}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-end">
                                                {(product.final_price || 0).toLocaleString()} đ
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan="2" className="text-end fw-bold">Tổng cộng:</td>
                                        <td className="text-end fw-bold">
                                            {(invoice?.order?.Total_value || 0).toLocaleString()} đ
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Nút hành động */}
                        <div className="d-flex justify-content-end mt-4">
                            <button 
                                className="btn btn-primary me-2"
                                onClick={() => window.print()}
                            >
                                <i className="bi bi-printer-fill me-1"></i> In hóa đơn
                            </button>
                            <button 
                                className="btn btn-outline-secondary"
                                onClick={() => navigate('/admin/orders')}
                            >
                                <i className="bi bi-list-ul me-1"></i> Danh sách đơn hàng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Hàm hỗ trợ hiển thị trạng thái
const getStatusBadge = (status) => {
    switch(status) {
        case 'Processing':
            return { class: 'bg-warning text-dark', text: 'Đang xử lý' };
        case 'Completed':
            return { class: 'bg-success', text: 'Hoàn thành' };
        case 'Cancelled':
            return { class: 'bg-danger', text: 'Đã hủy' };
        default:
            return { class: 'bg-secondary', text: 'Không xác định' };
    }
};

export default OrderStatusDetailPage;