import React, { useState, useEffect, useRef } from 'react';
import { useProductSearch } from '../context/OrderContext';
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
    const [showPrintConfirmation, setShowPrintConfirmation] = useState(false);
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: ''
    });
    const [orderIdInput, setOrderIdInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [createdOrderId, setCreatedOrderId] = useState(null);
    const [invoiceData, setInvoiceData] = useState(null);
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
        if (product.Status !== 'Received') {
            showAlert('Only available products can be added to the order', 'warning');
            return;
        }

        if (!selectedProducts.some(p => p.ID === product.ID)) {
            const quantity = product.Consignment_quantity || 1;
            setSelectedProducts([...selectedProducts, {...product, quantity}]);
            showAlert(`Added ${product.Product_name} to the order`, 'success');
            setSearchInput('');
            setShowSuggestions(false);
        }
    };

    const handleRemoveProduct = (productId) => {
        const product = selectedProducts.find(p => p.ID === productId);
        setSelectedProducts(selectedProducts.filter(p => p.ID !== productId));
        showAlert(`Removed ${product.Product_name} from the order`, 'warning');
    };

    const handleCustomerInfoChange = (e) => {
        const { name, value } = e.target;
        setCustomerInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleConfirmOrder = () => {
        if (selectedProducts.length === 0) {
            showAlert('Please select at least one product', 'error');
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
                quantity: product.quantity || 1,
                price: getProductPrice(product)
            })),
            customerInfo: {
                name: customerInfo.name,
                phone: customerInfo.phone,
                address: customerInfo.address,
                age: customerInfo.age ? parseInt(customerInfo.age) : null
            }
        };

        try {
            const response = await createOrdersAPI(localStorage.getItem('token'), orderData);
            
            if (!response.orderId) {
                throw new Error("Server did not return order ID");
            }

            const orderId = response.orderId;
            setCreatedOrderId(orderId);
            showAlert(
                `Order created successfully! Order ID: ${orderId}`,
                'success',
                5000
            );

            // Tạo invoiceData từ selectedProducts thay vì gọi API
            const invoice = {
                orderId: orderId,
                customerInfo: customerInfo,
                products: selectedProducts.map(product => ({
                    product_name: product.Product_name,
                    price: getProductPrice(product),
                    quantity: product.quantity || 1
                })),
                total_amount: calculateTotal()
            };
            
            setInvoiceData(invoice);
            setShowPrintConfirmation(true);
            
        } catch (error) {
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data
            });
            
            showAlert(
                `Order creation error: ${error.response?.data?.message || error.message || 'Please try again'}`,
                'error'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearForm = () => {
        setSelectedProducts([]);
        setCustomerInfo({
            name: '',
            phone: '',
            address: '',
            age: ''
        });
        setSearchInput('');
        setCreatedOrderId(null);
        setInvoiceData(null);
    };

    const handlePrintInvoice = () => {
        setShowPrintConfirmation(false);
        
        const printWindow = window.open('', '_blank');
        
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice #${createdOrderId}</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
                <style>
                    @media print {
                        body { padding: 20px; }
                        .no-print { display: none !important; }
                        .print-only { display: block !important; }
                    }
                    .print-header {
                        text-align: center;
                        margin-bottom: 20px;
                        border-bottom: 2px solid #000;
                        padding-bottom: 10px;
                    }
                    .customer-info {
                        margin-bottom: 20px;
                    }
                    .table th, .table td {
                        padding: 8px;
                    }
                    body {
                        font-family: Arial, sans-serif;
                    }
                    .total-row {
                        font-weight: bold;
                        background-color: #f8f9fa;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="print-header">
                        <h2>SALES INVOICE</h2>
                        <p>Order ID: #${createdOrderId}</p>
                        <p>Date: ${currentDate}</p>
                    </div>

                    <div class="customer-info">
                        <h4>Customer Information</h4>
                        <p><strong>Name:</strong> ${customerInfo.name || 'Not provided'}</p>
                        <p><strong>Phone:</strong> ${customerInfo.phone || 'Not provided'}</p>
                        <p><strong>Address:</strong> ${customerInfo.address || 'Not provided'}</p>
                        <p><strong>Age:</strong> ${customerInfo.age || 'Not provided'}</p>
                    </div>

                    <div class="order-details">
                        <h4>Order Details</h4>
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Product</th>
                                    <th>Unit Price</th>
                                    <th>Quantity</th>
                                    <th>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${selectedProducts.map((product, index) => `
                                    <tr>
                                        <td>${index + 1}</td>
                                        <td>${product.Product_name}</td>
                                        <td>${parseFloat(getProductPrice(product)).toLocaleString()} VND</td>
                                        <td>${product.quantity || 1}</td>
                                        <td>${(parseFloat(getProductPrice(product)) * (product.quantity || 1)).toLocaleString()} VND</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot>
                                <tr class="total-row">
                                    <th colspan="4" class="text-end">Total:</th>
                                    <th>${parseFloat(calculateTotal()).toLocaleString()} VND</th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div class="text-center mt-4 no-print">
                        <button class="btn btn-primary" onclick="window.print()">Print Invoice</button>
                        <button class="btn btn-secondary ms-2" onclick="window.close(); window.opener.postMessage('clearForm', '*');">Close</button>
                    </div>
                </div>
                <script>
                    window.onload = function() {
                        setTimeout(function() {
                            window.print();
                        }, 500);
                    };
                    
                    // Listen for messages from the parent window
                    window.addEventListener('message', function(event) {
                        if (event.data === 'closeWindow') {
                            window.close();
                        }
                    });
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
        
        // Add event listener for when the print window closes
        const checkPrintWindowClosed = setInterval(() => {
            if (printWindow.closed) {
                clearInterval(checkPrintWindowClosed);
                clearForm();
            }
        }, 500);
    };

    const handleViewInvoice = async () => {
        if (!orderIdInput || isNaN(orderIdInput)) {
            showAlert('Please enter a valid order ID', 'error');
            return;
        }

        try {
            const invoice = await getInvoiceAPI(localStorage.getItem('token'), orderIdInput);
            navigate(`/admin/orders/${orderIdInput}`, { state: { invoice } });
        } catch (error) {
            showAlert(
                `Invoice not found: ${error.response?.data?.message || error.message || 'Please try again'}`,
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
                return { class: 'bg-success', text: 'Available' };
            case 'Consigned':
                return { class: 'bg-warning text-dark', text: 'Consigned' };
            case 'Sold':
                return { class: 'bg-secondary', text: 'Sold' };
            default:
                return { class: 'bg-secondary', text: 'Unknown' };
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
        return product.Consignment_price || product.Sale_price || 0;
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
                                <h5 className="modal-title">Confirm Order</h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => setShowConfirmation(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to create this order?</p>
                                <div className="mb-3">
                                    <strong>Customer:</strong> {customerInfo.name || 'Not provided'}
                                </div>
                                <div className="mb-3">
                                    <strong>Phone:</strong> {customerInfo.phone || 'Not provided'}
                                </div>
                                <div className="mb-3">
                                    <strong>Products:</strong>
                                    <ul>
                                        {selectedProducts.map(product => (
                                            <li key={product.ID}>
                                                {product.Product_name} - 
                                                {parseFloat(getProductPrice(product)).toLocaleString()} VND × 
                                                {product.quantity || 1}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="mb-3">
                                    <strong>Total:</strong> {calculateTotal().toLocaleString()} VND
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => setShowConfirmation(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
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
                                            Processing...
                                        </>
                                    ) : 'Confirm'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showPrintConfirmation && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header bg-success text-white">
                                <h5 className="modal-title">Print Invoice</h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => {
                                        setShowPrintConfirmation(false);
                                        clearForm();
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>Do you want to print the invoice for order #${createdOrderId}?</p>
                                <div className="mt-3">
                                    <strong>Customer:</strong> {customerInfo.name || 'Not provided'}
                                </div>
                                <div className="mt-2">
                                    <strong>Products:</strong>
                                    <ul>
                                        {selectedProducts.map(product => (
                                            <li key={product.ID}>
                                                {product.Product_name} - 
                                                {parseFloat(getProductPrice(product)).toLocaleString()} VND × 
                                                {product.quantity || 1}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="mt-2">
                                    <strong>Total:</strong> {calculateTotal().toLocaleString()} VND
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => {
                                        setShowPrintConfirmation(false);
                                        clearForm();
                                    }}
                                >
                                    Skip
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-success" 
                                    onClick={handlePrintInvoice}
                                >
                                    Print Invoice
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="container-fluid mt-3" style={{ marginLeft: '250px', padding: '20px' }}>
                <nav className="navbar navbar-expand-lg navbar-light bg-light mb-4 rounded shadow-sm">
                    <div className="container-fluid">
                        <span className="navbar-brand">Order Management</span>
                        <div className="d-flex">
                            <button 
                                className="btn btn-outline-success me-2" 
                                onClick={navigateToSoldOrders}
                            >
                                Sold Orders
                            </button>
                            <div className="input-group">
                                <input
                                    type="number"
                                    className="form-control"
                                    placeholder="Enter order ID"
                                    value={orderIdInput}
                                    onChange={(e) => setOrderIdInput(e.target.value)}
                                />
                                <button 
                                    className="btn btn-outline-primary" 
                                    type="button"
                                    onClick={handleViewInvoice}
                                    disabled={!orderIdInput || isSubmitting}
                                >
                                    View Invoice
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="row">
                    <div className="col-md-8">
                        <div className="card shadow mb-4">
                            <div className="card-header bg-primary text-white">
                                <h4 className="mb-0">Product Search</h4>
                            </div>
                            <div className="card-body">
                                <div ref={searchRef} className="position-relative">
                                    <input
                                        type="text"
                                        className="form-control form-control-lg"
                                        value={searchInput}
                                        onChange={handleInputChange}
                                        placeholder="Enter product name..."
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
                                                                            {parseFloat(getProductPrice(product)).toLocaleString()} VND
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            ) : (
                                                <div className="p-3 text-muted">
                                                    No matching products found
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

                                {selectedProducts.length > 0 && (
                                    <div className="mt-4">
                                        <h5>Selected Products</h5>
                                        <div className="table-responsive">
                                            <table className="table table-bordered">
                                                <thead className="table-info">
                                                    <tr>
                                                        <th>#</th>
                                                        <th>Product</th>
                                                        <th>Price</th>
                                                        <th>Quantity</th>
                                                        <th>Amount</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {selectedProducts.map((product, index) => (
                                                        <tr key={product.ID}>
                                                            <td>{index + 1}</td>
                                                            <td>{product.Product_name}</td>
                                                            <td>{parseFloat(getProductPrice(product)).toLocaleString()} VND</td>
                                                            <td>{product.quantity || 1}</td>
                                                            <td>
                                                                {(parseFloat(getProductPrice(product)) * (product.quantity || 1)).toLocaleString()} VND
                                                            </td>
                                                            <td>
                                                                <button
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    onClick={() => handleRemoveProduct(product.ID)}
                                                                >
                                                                    Remove
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot>
                                                    <tr>
                                                        <th colSpan="4">Total</th>
                                                        <th colSpan="2">{calculateTotal().toLocaleString()} VND</th>
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
                                <h4 className="mb-0">Order Information</h4>
                            </div>
                            <div className="card-body">
                                <h5>Customer Information</h5>
                                <div className="mb-3">
                                    <label className="form-label">Full Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="name"
                                        value={customerInfo.name}
                                        onChange={handleCustomerInfoChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Phone Number</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="phone"
                                        value={customerInfo.phone}
                                        onChange={handleCustomerInfoChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Age</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="age"
                                        value={customerInfo.age}
                                        onChange={handleCustomerInfoChange}
                                        min="1"
                                        max="120"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Address</label>
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
                                                Processing...
                                            </>
                                        ) : 'Create Order'}
                                    </button>
                                    <button
                                        className="btn btn-outline-secondary"
                                        disabled={isSubmitting || selectedProducts.length === 0}
                                        onClick={clearForm}
                                    >
                                        Clear All
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