import React, { useState, useEffect, useRef } from 'react';
import { useProductSearch } from '../context/AuthOrder';
import { createOrdersAPI, getInvoiceAPI } from '../api/api';
import { useNavigate } from 'react-router-dom';
import SidebarMenu from './MenuAdmin';

function ProductSearchPage() {
    const {
        searchResults,
        loading,
        error,
        keyword,
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
        type: ''
    });
    const [orderIdInput, setOrderIdInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput.trim().length > 0) {
                searchProducts(searchInput);
                setShowSuggestions(true);
            } else {
                clearSearch();
                setShowSuggestions(false);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

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

    const handleSelectProduct = (product) => {
        // Only allow adding products with "Received" status
        if (product.Status !== 'Received') {
            showAlert('Chỉ có thể thêm sản phẩm có sẵn vào đơn hàng', 'warning');
            return;
        }

        if (!selectedProducts.some(p => p.ID === product.ID)) {
            const quantity = product.Consignment_quantity || 1;
            setSelectedProducts([...selectedProducts, {...product, quantity}]);
            showAlert(`Đã thêm ${product.Product_name} vào đơn hàng`, 'success');
            setSearchInput('');
            setShowSuggestions(false);
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
                productId: product.ID,
                quantity: product.quantity || 1
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
            
            const orderId = response.orderId;
            
            if (!orderId) {
                throw new Error("Server không trả về ID đơn hàng");
            }

            showAlert(
                `Tạo đơn hàng thành công! Mã đơn hàng: ${orderId}`,
                'success',
                5000
            );

            setSelectedProducts([]);
            setCustomerInfo({ name: '', phone: '', address: '', age: '' });
            setSearchInput('');
            clearSearch();

            try {
                const invoice = await getInvoiceAPI(localStorage.getItem('token'), orderId);
                if (invoice?.url) {
                    setTimeout(() => {
                        window.open(invoice.url, '_blank');
                        showAlert('Đang mở hóa đơn trong tab mới...', 'info');
                    }, 1000);
                }
            } catch (invoiceError) {
                console.error('Lỗi khi lấy hóa đơn:', invoiceError);
                showAlert(
                    'Đơn hàng đã tạo nhưng không thể tải hóa đơn. Vui lòng thử lại sau.',
                    'warning'
                );
            }
        } catch (error) {
            console.error('Chi tiết lỗi:', {
                message: error.message,
                response: error.response?.data
            });
            
            showAlert(
                `Lỗi khi tạo đơn: ${error.response?.data?.message || error.message || 'Vui lòng thử lại'}`,
                'error'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleViewInvoice = async () => {
        if (!orderIdInput || isNaN(orderIdInput)) {
            showAlert('Vui lòng nhập ID đơn hàng hợp lệ', 'error');
            return;
        }

        try {
            const invoice = await getInvoiceAPI(localStorage.getItem('token'), orderIdInput);
            navigate(`/admin/orders/${orderIdInput}`, { state: { invoice } });
        } catch (error) {
            showAlert(
                `Không tìm thấy hóa đơn: ${error.response?.data?.message || error.message || 'Vui lòng thử lại'}`,
                'error'
            );
        }
    };

    const navigateToSoldOrders = () => {
        navigate('/admin/sold-orders');
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

    const getProductPrice = (product) => {
        return product.Consignment_price || product.Sale_price;
    };

    const calculateTotal = () => {
        return selectedProducts.reduce((sum, product) => {
            const price = parseFloat(getProductPrice(product)) || 0;
            const quantity = product.quantity || 1;
            return sum + (price * quantity);
        }, 0);
    };

    return (
        <div style={{ display: 'flex' }}>
            <SidebarMenu />
            
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
                                            <li key={product.ID}>
                                                {product.Product_name} - 
                                                {parseFloat(getProductPrice(product)).toLocaleString()} đ × 
                                                {product.quantity || 1}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="mb-3">
                                    <strong>Tổng cộng:</strong> {calculateTotal().toLocaleString()} đ
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
                <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4 rounded shadow-sm">
                    <div className="container-fluid">
                        <span className="navbar-brand">Quản lý đơn hàng</span>
                        <div className="d-flex">
                            <button 
                                className="btn btn-outline-success me-2" 
                                onClick={navigateToSoldOrders}
                            >
                                Đơn hàng đã bán
                            </button>
                            <div className="input-group">
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="Nhập ID đơn hàng"
                                    value={orderIdInput}
                                    onChange={(e) => setOrderIdInput(e.target.value)}
                                />
                                <button 
                                    className="btn btn-outline-primary" 
                                    type="button"
                                    onClick={handleViewInvoice}
                                    disabled={!orderIdInput || isSubmitting}
                                >
                                    Xem hóa đơn
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="row">
                    <div className="col-md-8">
                        <div className="card shadow mb-4">
                            <div className="card-header bg-primary text-white">
                                <h4 className="mb-0">Tìm kiếm sản phẩm</h4>
                            </div>
                            <div className="card-body">
                                <div ref={searchRef} className="position-relative">
                                    <input
                                        type="text"
                                        className="form-control form-control-lg"
                                        value={searchInput}
                                        onChange={handleInputChange}
                                        placeholder="Nhập tên sản phẩm..."
                                        autoFocus
                                        onFocus={() => searchInput.trim().length > 0 && setShowSuggestions(true)}
                                    />
                                    
                                    {showSuggestions && searchInput.trim().length > 0 && (
                                        <div className="position-absolute w-100 bg-white shadow-lg rounded mt-1" 
                                            style={{ zIndex: 1000, maxHeight: '400px', overflowY: 'auto' }}>
                                            {loading ? (
                                                <div className="p-3 text-center">
                                                    <div className="spinner-border text-primary" />
                                                </div>
                                            ) : searchResults.length > 0 ? (
                                                <ul className="list-group list-group-flush">
                                                    {searchResults.map(product => {
                                                        const statusBadge = getStatusBadge(product.Status);
                                                        const isAvailable = product.Status === 'Received';
                                                        return (
                                                            <li 
                                                                key={product.ID} 
                                                                className={`list-group-item list-group-item-action ${!isAvailable ? 'text-muted' : ''}`}
                                                                onClick={() => isAvailable && handleSelectProduct(product)}
                                                                style={{ 
                                                                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                                                                    opacity: isAvailable ? 1 : 0.7
                                                                }}
                                                            >
                                                                <div className="d-flex justify-content-between align-items-center">
                                                                    <div>
                                                                        <strong>{product.Product_name}</strong>
                                                                        <div className="text-muted small">
                                                                            {product.Brand_name} • {product.Product_type_name}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-end">
                                                                        <span className={`badge ${statusBadge.class} me-2`}>
                                                                            {statusBadge.text}
                                                                        </span>
                                                                        <div>
                                                                            {parseFloat(getProductPrice(product)).toLocaleString()} đ
                                                                        </div>
                                                                        
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            ) : (
                                                <div className="p-3 text-muted">
                                                    Không tìm thấy sản phẩm phù hợp
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                {error && (
                                    <div className="alert alert-danger mt-3">
                                        {error}
                                    </div>
                                )}

                                {/* Bảng sản phẩm đã chọn */}
                                {selectedProducts.length > 0 && (
                                    <div className="mt-4">
                                        <h5>Sản phẩm đã chọn</h5>
                                        <div className="table-responsive">
                                            <table className="table table-bordered">
                                                <thead className="table-info">
                                                    <tr>
                                                        <th>STT</th>
                                                        <th>Sản phẩm</th>
                                                        <th>Giá</th>
                                                        <th>Số lượng</th>
                                                        <th>Thành tiền</th>
                                                        <th>Thao tác</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedProducts.map((product, index) => (
                                                        <tr key={product.ID}>
                                                            <td>{index + 1}</td>
                                                            <td>{product.Product_name}</td>
                                                            <td>{parseFloat(getProductPrice(product)).toLocaleString()} đ</td>
                                                            <td>{product.quantity || 1}</td>
                                                            <td>
                                                                {(parseFloat(getProductPrice(product)) * (product.quantity || 1)).toLocaleString()} đ
                                                            </td>
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
                                                        <th colSpan="4">Tổng cộng</th>
                                                        <th colSpan="2">{calculateTotal().toLocaleString()} đ</th>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    </div>
                                )}
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