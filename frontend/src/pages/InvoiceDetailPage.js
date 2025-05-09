import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getInvoiceAPI } from '../api/api';
import SidebarMenu from './MenuAdmin';

function InvoiceDetailPage() {
    const { orderId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [invoice, setInvoice] = useState(location.state?.invoice || null);
    const [loading, setLoading] = useState(!location.state?.invoice);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!invoice) {
            const fetchInvoice = async () => {
                try {
                    setLoading(true);
                    const data = await getInvoiceAPI(localStorage.getItem('token'), orderId);
                    setInvoice(data);
                    setError(null);
                } catch (err) {
                    setError(err.message || 'Lỗi khi tải hóa đơn');
                } finally {
                    setLoading(false);
                }
            };
            fetchInvoice();
        }
    }, [orderId, invoice]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div style={{ display: 'flex' }}>
                <SidebarMenu />
                <div className="container-fluid mt-3" style={{ marginLeft: '250px', padding: '20px' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary" />
                        <p>Đang tải hóa đơn...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ display: 'flex' }}>
                <SidebarMenu />
                <div className="container-fluid mt-3" style={{ marginLeft: '250px', padding: '20px' }}>
                    <div className="alert alert-danger">
                        {error}
                        <button className="btn btn-link" onClick={() => navigate(-1)}>Quay lại</button>
                    </div>
                </div>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div style={{ display: 'flex' }}>
                <SidebarMenu />
                <div className="container-fluid mt-3" style={{ marginLeft: '250px', padding: '20px' }}>
                    <div className="alert alert-warning">
                        Không tìm thấy hóa đơn
                        <button className="btn btn-link" onClick={() => navigate(-1)}>Quay lại</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex' }}>
            <SidebarMenu />
            <div className="container-fluid mt-3" style={{ marginLeft: '250px', padding: '20px' }}>
                <div className="d-flex justify-content-between mb-4">
                    <h2>Hóa đơn #{orderId}</h2>
                    <div>
                        <button className="btn btn-primary me-2" onClick={handlePrint}>
                            In hóa đơn
                        </button>
                        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                            Quay lại
                        </button>
                    </div>
                </div>

                <div className="card shadow mb-4">
                    <div className="card-header bg-primary text-white">
                        <h4 className="mb-0">Thông tin khách hàng</h4>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6">
                                <p><strong>Tên khách hàng:</strong> {invoice.order.customer_name}</p>
                                <p><strong>Điện thoại:</strong> {invoice.order.customer_phone}</p>
                            </div>
                            <div className="col-md-6">
                                <p><strong>Địa chỉ:</strong> {invoice.order.customer_address || 'Không có'}</p>
                                <p><strong>Tuổi:</strong> {invoice.order.customer_age}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card shadow">
                    <div className="card-header bg-info text-white">
                        <h4 className="mb-0">Chi tiết đơn hàng</h4>
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <table className="table table-bordered">
                                <thead className="table-light">
                                    <tr>
                                        <th>#</th>
                                        <th>Sản phẩm</th>
                                        <th>Thương hiệu</th>
                                        <th>Đơn giá</th>
                                        <th>Tổng</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.products.map((product, index) => (
                                        <tr key={product.ID}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    {product.Image && (
                                                        <img
                                                            src={product.Image}
                                                            alt={product.Product_name}
                                                            className="img-thumbnail me-3"
                                                            style={{ width: '60px', height: '60px' }}
                                                        />
                                                    )}
                                                    <span>{product.Product_name}</span>
                                                </div>
                                            </td>
                                            <td>{product.Brand_name}</td>
                                            <td>{parseFloat(product.final_price).toLocaleString()} đ</td>
                                            <td>{parseFloat(product.final_price).toLocaleString()} đ</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="table-light">
                                    <tr>
                                        <th colSpan="4" className="text-end">Tổng cộng:</th>
                                        <th>{parseFloat(invoice.order.Total_value).toLocaleString()} đ</th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        <div className="mt-3">
                            <p><strong>Trạng thái:</strong> 
                                <span className={`badge ${invoice.order.Order_status === 'Processing' ? 'bg-warning' : 'bg-success'} ms-2`}>
                                    {invoice.order.Order_status === 'Processing' ? 'Đang xử lý' : 'Hoàn thành'}
                                </span>
                            </p>
                            <p><strong>Ngày tạo:</strong> {new Date().toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InvoiceDetailPage;