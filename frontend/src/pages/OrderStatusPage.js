import React, { useState, useEffect } from 'react';
import { useProductSearch } from '../context/AuthOrder';
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
        address: ''
    });

    // Tìm kiếm real-time với debounce
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

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);
    };

    const handleAddToOrder = (product) => {
        if (!selectedProducts.some(p => p.ID === product.ID)) {
            setSelectedProducts([...selectedProducts, product]);
        }
    };

    const handleRemoveProduct = (productId) => {
        setSelectedProducts(selectedProducts.filter(p => p.ID !== productId));
    };

    const handleCustomerInfoChange = (e) => {
        const { name, value } = e.target;
        setCustomerInfo(prev => ({ ...prev, [name]: value }));
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

    return (
        <div style={{ display: 'flex' }}>
            <SidebarMenu />
            
            <div className="container-fluid mt-3" style={{ marginLeft: '250px', padding: '20px' }}>
                <div className="row">
                    {/* Cột trái - Sản phẩm */}
                    <div className="col-md-8">
                        <div className="card shadow mb-4">
                            <div className="card-header bg-primary text-white">
                                <h4 className="mb-0">Tìm kiếm sản phẩm</h4>
                            </div>
                            <div className="card-body">
                                <div className="position-relative">
                                    <input
                                        type="text"
                                        className="form-control form-control-lg"
                                        value={searchInput}
                                        onChange={handleInputChange}
                                        placeholder="Nhập tên sản phẩm..."
                                        autoFocus
                                    />
                                </div>

                                {error && (
                                    <div className="alert alert-danger mt-3">
                                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                        {error}
                                    </div>
                                )}

                                <div className="mt-4">
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Sản phẩm</th>
                                                    <th>Thương hiệu</th>
                                                    <th>Loại</th>
                                                    <th>Trạng thái</th>
                                                    <th>Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {searchResults.map((product) => {
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
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cột phải - Thông tin khách hàng và đơn hàng */}
                    <div className="col-md-4">
                        <div className="card shadow sticky-top" style={{ top: '20px' }}>
                            <div className="card-header bg-info text-white">
                                <h4 className="mb-0">Thông tin đơn hàng</h4>
                            </div>
                            <div className="card-body">
                                <div className="mb-4">
                                    <h5>Thông tin khách hàng</h5>
                                    <div className="mb-3">
                                        <label className="form-label">Họ tên</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="name"
                                            value={customerInfo.name}
                                            onChange={handleCustomerInfoChange}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Số điện thoại</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="phone"
                                            value={customerInfo.phone}
                                            onChange={handleCustomerInfoChange}
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
                                </div>

                                <div className="mb-4">
                                    <h5>Sản phẩm đã chọn ({selectedProducts.length})</h5>
                                    {selectedProducts.length === 0 ? (
                                        <div className="alert alert-warning">Chưa có sản phẩm nào</div>
                                    ) : (
                                        <div className="table-responsive">
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
                                                            <td>{product.Price?.toLocaleString() || '0'} đ</td>
                                                            <td className="text-end">
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
                                            </table>
                                        </div>
                                    )}
                                </div>

                                <div className="d-grid gap-2">
                                    <button 
                                        className="btn btn-success btn-lg"
                                        disabled={selectedProducts.length === 0}
                                    >
                                        Tạo đơn hàng
                                    </button>
                                    <button 
                                        className="btn btn-outline-secondary"
                                        onClick={() => {
                                            setSelectedProducts([]);
                                            setCustomerInfo({ name: '', phone: '', address: '' });
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