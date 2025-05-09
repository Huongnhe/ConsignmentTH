import React, { useState, useEffect } from 'react';
import { useProductSearch } from '../context/AuthOrder';
import { createOrdersAPI, getInvoiceAPI } from '../api/api';
import { useNavigate } from 'react-router-dom';
import SidebarMenu from './MenuAdmin';

function ProductSearchPage() {
    const {
        searchResults,
        loading,
        error,
        searchProducts,
        clearSearch
    } = useProductSearch();

    const [searchInput, setSearchInput] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [customerInfo, setCustomerInfo] = useState({
        name: '',
        phone: '',
        address: '',
        age: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: '' // 'success', 'error', 'warning', 'info'
    });
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput.trim().length > 0) {
                searchProducts(searchInput);
            } else {
                clearSearch();
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const showAlert = (message, type = 'info', duration = 3000) => {
        setNotification({
            show: true,
            message,
            type
        });
        setTimeout(() => {
            setNotification({
                ...notification,
                show: false
            });
        }, duration);
    };

    const handleInputChange = (e) => {
        setSearchInput(e.target.value);
    };

    const handleAddToOrder = (product) => {
        if (!selectedProducts.some(p => p.ID === product.ID)) {
            setSelectedProducts([...selectedProducts, product]);
            showAlert(`Đã thêm ${product.Product_name} vào đơn hàng`, 'success');
        } else {
            showAlert('Sản phẩm đã có trong đơn hàng', 'info');
        }
    };

    const handleRemoveProduct = (productId) => {
        const product = selectedProducts.find(p => p.ID === productId);
        setSelectedProducts(selectedProducts.filter(p => p.ID !== productId));
        showAlert(`Đã xóa ${product.Product_name} khỏi đơn hàng`, 'warning');
    };

    const handleCustomerInfoChange = (e) => {
        const { name, value } = e.target;
        setCustomerInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleConfirmOrder = () => {
        if (!customerInfo.name || !customerInfo.phone || !customerInfo.age) {
            showAlert('Vui lòng nhập đầy đủ thông tin khách hàng (họ tên, số điện thoại, tuổi)', 'error');
            return;
        }

        if (isNaN(customerInfo.age)) {
            showAlert('Tuổi phải là số', 'error');
            return;
        }

        if (selectedProducts.length === 0) {
            showAlert('Vui lòng chọn ít nhất một sản phẩm', 'error');
            return;
        }

        setShowConfirmation(true);
    };

    const handleSubmitOrder = async () => {
        setShowConfirmation(false);
        setIsSubmitting(true);

        const orderData = {
            products: selectedProducts.map(product => ({
                productId: product.ID
            })),
            customerInfo: {
                name: customerInfo.name,
                phone: customerInfo.phone,
                address: customerInfo.address,
                age: parseInt(customerInfo.age)
            }
        };

        try {
            const response = await createOrdersAPI(localStorage.getItem('token'), orderData);
            
            showAlert(
                `Tạo đơn hàng thành công! Mã đơn hàng: ${response.data.order_id}`,
                'success',
                5000
            );

            // Reset form
            setSelectedProducts([]);
            setCustomerInfo({ name: '', phone: '', address: '', age: '' });
            setSearchInput('');
            clearSearch();

            // Xử lý hóa đơn
            if (response.order_id) {
                try {
                    const invoice = await getInvoiceAPI(localStorage.getItem('token'), response.order_id);
                    if (invoice.url) {
                        setTimeout(() => {
                            window.open(invoice.url, '_blank');
                            showAlert('Đang mở hóa đơn trong tab mới...', 'info');
                        }, 1000);
                    }
                } catch (invoiceError) {
                    console.error('Error getting invoice:', invoiceError);
                    showAlert(
                        'Tạo đơn thành công nhưng không thể tải hóa đơn. Vui lòng thử lại sau.',
                        'warning',
                        5000
                    );
                }
            }
        } catch (error) {
            console.error('Error creating order:', error);
            showAlert(
                `Lỗi khi tạo đơn hàng: ${error.message || 'Vui lòng thử lại sau'}`,
                'error',
                5000
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'Received':
                return { class: 'bg-success', text: 'Có sẵn' };
            case 'Consigned':
                return { class: 'bg-warning text-dark', text: 'Đang ký gửi' };
            case 'Sold':
                return { class: 'bg-secondary', text: 'Đã bán' };
            default:
                return { class: 'bg-secondary', text: 'Không xác định' };
        }
    };

    const getAlertClass = (type) => {
        switch(type) {
            case 'success': return 'alert-success';
            case 'error': return 'alert-danger';
            case 'warning': return 'alert-warning';
            case 'info': return 'alert-info';
            default: return 'alert-primary';
        }
    };

    return (
        <div style={{ display: 'flex' }}>
            <SidebarMenu />
            
            {/* Notification Alert */}
            {notification.show && (
                <div className={`alert ${getAlertClass(notification.type)} alert-dismissible fade show`} 
                    style={{
                        position: 'fixed',
                        top: '20px',
                        right: '20px',
                        zIndex: 9999,
                        minWidth: '300px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}>
                    <strong>{notification.message}</strong>
                    <button type="button" className="btn-close" onClick={() => setNotification({...notification, show: false})}></button>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">Xác nhận đơn hàng</h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => setShowConfirmation(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>Bạn có chắc chắn muốn tạo đơn hàng này?</p>
                                <div className="mb-3">
                                    <strong>Khách hàng:</strong> {customerInfo.name}
                                </div>
                                <div className="mb-3">
                                    <strong>Số điện thoại:</strong> {customerInfo.phone}
                                </div>
                                <div className="mb-3">
                                    <strong>Sản phẩm:</strong>
                                    <ul>
                                        {selectedProducts.map(product => (
                                            <li key={product.ID}>{product.Product_name} - {product.Price?.toLocaleString()} đ</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="mb-3">
                                    <strong>Tổng cộng:</strong> {selectedProducts.reduce((sum, p) => sum + (p.Price || 0), 0).toLocaleString()} đ
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => setShowConfirmation(false)}
                                    disabled={isSubmitting}
                                >
                                    Hủy bỏ
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary" 
                                    onClick={handleSubmitOrder}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2"></span>
                                            Đang xử lý...
                                        </>
                                    ) : 'Xác nhận'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="container-fluid mt-3" style={{ marginLeft: '250px', padding: '20px' }}>
                <div className="row">
                    <div className="col-md-8">
                        <div className="card shadow mb-4">
                            <div className="card-header bg-primary text-white">
                                <h4 className="mb-0">Tìm kiếm sản phẩm</h4>
                            </div>
                            <div className="card-body">
                                <input
                                    type="text"
                                    className="form-control form-control-lg"
                                    value={searchInput}
                                    onChange={handleInputChange}
                                    placeholder="Nhập tên sản phẩm..."
                                    autoFocus
                                />
                                
                                {error && (
                                    <div className="alert alert-danger mt-3">
                                        {error}
                                    </div>
                                )}
                                
                                <div className="mt-3">
                                    {searchInput.trim().length > 0 && !loading && searchResults.length > 0 && (
                                        <p><strong>Tìm thấy {searchResults.length} sản phẩm</strong></p>
                                    )}
                                    {searchInput.trim().length > 0 && !loading && searchResults.length === 0 && (
                                        <div className="alert alert-warning">
                                            Không tìm thấy sản phẩm nào phù hợp.
                                        </div>
                                    )}
                                </div>
                                
                                <div className="mt-3">
                                    {loading ? (
                                        <div className="text-center">
                                            <div className="spinner-border text-primary" />
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th>Sản phẩm</th>
                                                        <th>Thương hiệu</th>
                                                        <th>Loại</th>
                                                        <th>Trạng thái</th>
                                                        <th>Giá</th>
                                                        <th>Thao tác</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {searchResults.map(product => {
                                                        const statusBadge = getStatusBadge(product.Status);
                                                        return (
                                                            <tr key={product.ID}>
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
                                                                <td>{product.Product_type_name}</td>
                                                                <td>
                                                                    <span className={`badge ${statusBadge.class}`}>
                                                                        {statusBadge.text}
                                                                    </span>
                                                                </td>
                                                                <td>{product.Price?.toLocaleString() || '0'} đ</td>
                                                                <td>
                                                                    <button
                                                                        className="btn btn-sm btn-primary"
                                                                        onClick={() => handleAddToOrder(product)}
                                                                        disabled={product.Status !== 'Received'}
                                                                    >
                                                                        Thêm
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="card shadow sticky-top" style={{ top: '20px' }}>
                            <div className="card-header bg-info text-white">
                                <h4 className="mb-0">Thông tin đơn hàng</h4>
                            </div>
                            <div className="card-body">
                                <h5>Thông tin khách hàng</h5>
                                <div className="mb-3">
                                    <label className="form-label">Họ tên <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        value={customerInfo.name}
                                        onChange={handleCustomerInfoChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Số điện thoại <span className="text-danger">*</span></label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="phone"
                                        value={customerInfo.phone}
                                        onChange={handleCustomerInfoChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Tuổi <span className="text-danger">*</span></label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="age"
                                        value={customerInfo.age}
                                        onChange={handleCustomerInfoChange}
                                        min="1"
                                        max="120"
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Địa chỉ</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="address"
                                        value={customerInfo.address}
                                        onChange={handleCustomerInfoChange}
                                    />
                                </div>

                                <h5>Sản phẩm đã chọn ({selectedProducts.length})</h5>
                                {selectedProducts.length === 0 ? (
                                    <div className="alert alert-warning">Chưa có sản phẩm nào</div>
                                ) : (
                                    <table className="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Sản phẩm</th>
                                                <th>Giá</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedProducts.map((product) => (
                                                <tr key={product.ID}>
                                                    <td>{product.Product_name}</td>
                                                    <td>{product.Price?.toLocaleString()} đ</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => handleRemoveProduct(product.ID)}
                                                        >
                                                            Xóa
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <th>Tổng cộng</th>
                                                <th colSpan="2">
                                                    {selectedProducts.reduce((sum, p) => sum + (p.Price || 0), 0).toLocaleString()} đ
                                                </th>
                                            </tr>
                                        </tfoot>
                                    </table>
                                )}

                                <div className="d-grid gap-2 mt-4">
                                    <button
                                        className="btn btn-success btn-lg"
                                        disabled={selectedProducts.length === 0 || isSubmitting}
                                        onClick={handleConfirmOrder}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Đang xử lý...
                                            </>
                                        ) : 'Tạo đơn hàng'}
                                    </button>
                                    <button
                                        className="btn btn-outline-secondary"
                                        disabled={isSubmitting || selectedProducts.length === 0}
                                        onClick={() => {
                                            setSelectedProducts([]);
                                            setCustomerInfo({ name: '', phone: '', address: '', age: '' });
                                            showAlert('Đã xóa toàn bộ đơn hàng', 'info');
                                        }}
                                    >
                                        Xóa tất cả
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductSearchPage;