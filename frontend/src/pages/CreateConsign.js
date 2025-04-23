import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createConsign } from "../api/api";
import NavbarUser from "./MenuUser";

const CreateConsign = () => {
    const brandOptions = ["Nike", "Adidas", "Gucci", "Puma"];
    const typeOptions = ["Giày", "Túi xách", "Áo", "Quần"];

    const [productData, setProductData] = useState({
        Product_name: "",
        Sale_price: "",
        Original_price: "",
        Brand_name: "",
        Product_type_name: "",
        Quantity: "",
        Price: "",
    });

    const [addedProducts, setAddedProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData({ ...productData, [name]: value });
    };

    const handleAddProduct = () => {
        const {
            Product_name, Sale_price, Original_price,
            Brand_name, Product_type_name, Quantity, Price,
        } = productData;

        if (
            !Product_name || !Sale_price || !Original_price ||
            !Brand_name || !Product_type_name || !Quantity || !Price
        ) {
            setError("Vui lòng nhập đầy đủ thông tin sản phẩm.");
            return;
        }

        const newProduct = {
            Product_name,
            Sale_price: parseFloat(Sale_price),
            Original_price: parseFloat(Original_price),
            Brand_name,
            Product_type_name,
            details: {
                Quantity: parseInt(Quantity, 10),
                Price: parseFloat(Price),
            },
        };

        setAddedProducts([...addedProducts, newProduct]);

        setProductData({
            Product_name: "",
            Sale_price: "",
            Original_price: "",
            Brand_name: "",
            Product_type_name: "",
            Quantity: "",
            Price: "",
        });
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (addedProducts.length === 0) {
            setError("Vui lòng thêm ít nhất một sản phẩm trước khi gửi đơn.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setError("Bạn cần đăng nhập để thực hiện thao tác này.");
                setLoading(false);
                return;
            }

            const response = await createConsign(token, addedProducts);
            alert(response.message || "Tạo đơn ký gửi thành công!");
            navigate("/consigns");
        } catch (err) {
            setError(err.response?.data?.error || "Đã xảy ra lỗi. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <NavbarUser />
            <div className="container mt-5">
                <div className="card shadow p-4">
                    <h3 className="text-center text-primary mb-4">Tạo Đơn Ký Gửi</h3>
                    {error && <div className="alert alert-danger">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="mb-3 col-md-6">
                                <label className="form-label fw-bold">Tên Sản Phẩm</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="Product_name"
                                    value={productData.Product_name}
                                    onChange={handleChange}
                                    placeholder="Nhập tên sản phẩm"
                                />
                            </div>
                            <div className="mb-3 col-md-6">
                                <label className="form-label fw-bold">Giá Bán</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="Sale_price"
                                    value={productData.Sale_price}
                                    onChange={handleChange}
                                    placeholder="VD: 1500000"
                                />
                            </div>
                            <div className="mb-3 col-md-6">
                                <label className="form-label fw-bold">Giá Gốc</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="Original_price"
                                    value={productData.Original_price}
                                    onChange={handleChange}
                                    placeholder="VD: 2000000"
                                />
                            </div>
                            <div className="mb-3 col-md-6">
                                <label className="form-label fw-bold">Thương Hiệu</label>
                                <select
                                    className="form-control"
                                    name="Brand_name"
                                    value={productData.Brand_name}
                                    onChange={handleChange}
                                >
                                    <option value="">Chọn thương hiệu</option>
                                    {brandOptions.map((brand) => (
                                        <option key={brand} value={brand}>{brand}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-3 col-md-6">
                                <label className="form-label fw-bold">Loại Sản Phẩm</label>
                                <select
                                    className="form-control"
                                    name="Product_type_name"
                                    value={productData.Product_type_name}
                                    onChange={handleChange}
                                >
                                    <option value="">Chọn loại sản phẩm</option>
                                    {typeOptions.map((type) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-3 col-md-6">
                                <label className="form-label fw-bold">Số Lượng</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="Quantity"
                                    value={productData.Quantity}
                                    onChange={handleChange}
                                    placeholder="VD: 2"
                                />
                            </div>
                            <div className="mb-3 col-md-6">
                                <label className="form-label fw-bold">Giá Ký Gửi</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="Price"
                                    value={productData.Price}
                                    onChange={handleChange}
                                    placeholder="VD: 1200000"
                                />
                            </div>
                        </div>

                        <div className="d-flex justify-content-between">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleAddProduct}
                            >
                                + Thêm Sản Phẩm
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? "Đang gửi..." : "Tạo Đơn Ký Gửi"}
                            </button>
                        </div>
                    </form>

                    {addedProducts.length > 0 && (
                        <div className="mt-4">
                            <h5 className="text-success">Sản phẩm đã thêm:</h5>
                            <ul className="list-group">
                                {addedProducts.map((item, index) => (
                                    <li key={index} className="list-group-item">
                                        {item.Product_name} - SL: {item.details.Quantity} - Giá ký gửi: {item.details.Price.toLocaleString()} đ
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateConsign;
