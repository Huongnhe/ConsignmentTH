import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import SidebarMenu from './MenuAdmin';
import { useProductSearch } from '../context/OrderContext';

function InvoiceDetailPage() {
    const { orderId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { invoice, fetchInvoice, loading, error } = useProductSearch();
    const invoiceRef = useRef();

    useEffect(() => {
        if (!location.state?.invoice) {
            fetchInvoice(orderId);
        }
    }, [orderId, fetchInvoice, location.state]);

    const dataInvoice = location.state?.invoice || invoice;

    const handlePrint = () => {
        const printContents = invoiceRef.current.innerHTML;
        const originalContents = document.body.innerHTML;
        
        document.body.innerHTML = `
            <div class="container">
                ${printContents}
                <style>
                    @media print {
                        body { padding: 20px; }
                        .no-print { display: none !important; }
                        table { width: 100%; border-collapse: collapse; }
                        th, td { border: 1px solid #ddd; padding: 8px; }
                        .card { border: 1px solid #000; margin-bottom: 20px; }
                        .card-header { background-color: #f8f9fa !important; }
                    }
                </style>
            </div>
        `;
        
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload();
    };

    if (loading) {
        return (
            <div style={{ display: 'flex' }}>
                <SidebarMenu />
                <div className="container-fluid mt-3" style={{ marginLeft: '250px', padding: '20px' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary" />
                        <p>Loading invoice...</p>
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
                        <button className="btn btn-link" onClick={() => navigate(-1)}>Go Back</button>
                    </div>
                </div>
            </div>
        );
    }

    if (!dataInvoice) {
        return (
            <div style={{ display: 'flex' }}>
                <SidebarMenu />
                <div className="container-fluid mt-3" style={{ marginLeft: '250px', padding: '20px' }}>
                    <div className="alert alert-warning">
                        Invoice not found
                        <button className="btn btn-link" onClick={() => navigate(-1)}>Go Back</button>
                    </div>
                </div>
            </div>
        );
    }

    const { order, products } = dataInvoice;

    return (
        <div style={{ display: 'flex' }}>
            <SidebarMenu />
            <div className="container-fluid mt-3" style={{ marginLeft: '250px', padding: '20px' }}>
                <div className="d-flex justify-content-between mb-4 no-print">
                    <h2>Invoice #{orderId}</h2>
                    <div>
                        <button className="btn btn-primary me-2" onClick={handlePrint}>
                            Print Invoice
                        </button>
                        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
                            Go Back
                        </button>
                    </div>
                </div>

                <div ref={invoiceRef}>
                    {/* Customer Information */}
                    <div className="card shadow mb-4">
                        <div className="card-header bg-primary text-white">
                            <h4 className="mb-0">Customer Information</h4>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <p><strong>Customer Name:</strong> {order.customer_name}</p>
                                    <p><strong>Phone:</strong> {order.customer_phone}</p>
                                </div>
                                <div className="col-md-6">
                                    <p><strong>Address:</strong> {order.customer_address || 'N/A'}</p>
                                    <p><strong>Age:</strong> {order.customer_age}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Details */}
                    <div className="card shadow">
                        <div className="card-header bg-info text-white">
                            <h4 className="mb-0">Order Details</h4>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead className="table-light">
                                        <tr>
                                            <th>#</th>
                                            <th>Product</th>
                                            <th>Brand</th>
                                            <th>Unit Price</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((product, index) => (
                                            <tr key={product.ID}>
                                                <td>{index + 1}</td>
                                                <td>{product.Brand_name}</td>
                                                <td>{parseFloat(product.final_price).toLocaleString()} VND</td>
                                                <td>{parseFloat(product.final_price).toLocaleString()} VND</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="table-light">
                                        <tr>
                                            <th colSpan="4" className="text-end">Grand Total:</th>
                                            <th>{parseFloat(order.Total_value).toLocaleString()} VND</th>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            <div className="mt-3">
                                <p><strong>Status:</strong>
                                    <span className={`badge ${order.Order_status === 'Processing' ? 'bg-warning' : 'bg-success'} ms-2`}>
                                        {order.Order_status === 'Processing' ? 'Processing' : 'Completed'}
                                    </span>
                                </p>
                                <p><strong>Created Date:</strong> {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InvoiceDetailPage;