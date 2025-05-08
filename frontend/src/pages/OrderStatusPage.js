import React, { useState } from 'react';
import { useOrderSearch } from '../context/AuthOrder';

function OrderPage() {
    const {
        searchResults,
        loading,
        error,
        keyword,
        searchOrders,
        clearSearch
    } = useOrderSearch();

    const [searchInput, setSearchInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchInput.trim()) return;

        await searchOrders(searchInput);
        setShowSuggestions(false);
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);
        setShowSuggestions(value.length > 0);
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchInput(suggestion);
        setShowSuggestions(false);
        searchOrders(suggestion);
    };

    // Lọc gợi ý từ kết quả tìm kiếm trước đó
    const filteredSuggestions = searchResults
        .filter(order => 
            typeof order.customer_name === 'string' && 
            searchInput &&
            order.customer_name.toLowerCase().includes(searchInput.toLowerCase())
        .slice(0, 5));// Giới hạn 5 gợi ý

    return (
        <div className="container mt-5">
            <div className="card shadow p-4">
                <h3 className="mb-3">Tìm kiếm đơn hàng</h3>
                <form onSubmit={handleSearch} className="mb-3 position-relative">
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            value={searchInput}
                            onChange={handleInputChange}
                            placeholder="Nhập mã đơn hàng, tên khách hàng..."
                        />
                        <button className="btn btn-primary" type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Đang tìm...
                                </>
                            ) : 'Tìm kiếm'}
                        </button>
                        <button className="btn btn-secondary" type="button" onClick={clearSearch}>
                            Xóa
                        </button>
                    </div>
                    
                    {showSuggestions && filteredSuggestions.length > 0 && (
                        <div className="list-group position-absolute w-100 mt-1" style={{ zIndex: 1000 }}>
                            {filteredSuggestions.map((order) => (
                                <button
                                    key={order.id}
                                    type="button"
                                    className="list-group-item list-group-item-action text-start"
                                    onClick={() => handleSuggestionClick(order.customer_name || order.guest_name)}
                                >
                                    {order.customer_name || order.guest_name} - Đơn #{order.id}
                                </button>
                            ))}
                        </div>
                    )}
                </form>

                {error && (
                    <div className="alert alert-danger">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error}
                    </div>
                )}

                {searchResults.length > 0 && (
                    <div className="mt-4">
                        <h5 className="mb-3">
                            <i className="bi bi-search me-2"></i>
                            Kết quả tìm kiếm cho: <strong>"{keyword}"</strong>
                        </h5>
                        
                        {searchResults.map((order) => (
                            <div key={order.id} className="card mb-4">
                                <div className="card-header bg-light">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0">
                                            Đơn hàng #{order.id} - 
                                            <span className="ms-2">
                                                {order.customer_name 
                                                    ? `Khách hàng: ${order.customer_name}`
                                                    : `Khách vãng lai: ${order.guest_name || 'Không tên'}`}
                                            </span>
                                        </h5>
                                        <span className={`badge ${getStatusBadgeClass(order.Order_status)}`}>
                                            {order.Order_status}
                                        </span>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="row mb-3">
                                        <div className="col-md-6">
                                            <p><strong>Ngày tạo:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                                            <p><strong>Tổng giá trị:</strong> {formatCurrency(order.Total_value)}</p>
                                        </div>
                                        <div className="col-md-6">
                                            {order.customer_email && (
                                                <p><strong>Email:</strong> {order.customer_email}</p>
                                            )}
                                            {(order.guest_phone || order.guest_address) && (
                                                <>
                                                    {order.guest_phone && <p><strong>Điện thoại:</strong> {order.guest_phone}</p>}
                                                    {order.guest_address && <p><strong>Địa chỉ:</strong> {order.guest_address}</p>}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <h6 className="mt-3 mb-3">Sản phẩm trong đơn hàng:</h6>
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-hover">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>STT</th>
                                                    <th>Sản phẩm</th>
                                                    <th>Thương hiệu</th>
                                                    <th>Đơn giá</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {order.products && order.products.length > 0 ? (
                                                    order.products.map((product, index) => (
                                                        <tr key={product.Product_id}>
                                                            <td>{index + 1}</td>
                                                            <td>
                                                                <div className="d-flex align-items-center">
                                                                    {product.Image && (
                                                                        <img 
                                                                            src={product.Image} 
                                                                            alt={product.Product_name}
                                                                            className="img-thumbnail me-3"
                                                                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                                                        />
                                                                    )}
                                                                    <span>{product.Product_name}</span>
                                                                </div>
                                                            </td>
                                                            <td>{product.Brand_name}</td>
                                                            <td>{formatCurrency(product.Unit_price)}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="4" className="text-center text-muted">
                                                            Không có thông tin sản phẩm
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Hàm phụ trợ
function getStatusBadgeClass(status) {
    switch (status) {
        case 'Processing':
            return 'bg-warning text-dark';
        case 'Completed':
            return 'bg-success';
        case 'Cancelled':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND' 
    }).format(amount || 0);
}

export default OrderPage;