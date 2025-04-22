import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createConsign } from "../api/api";
import NavbarUser from "./MenuUser";

const CreateConsign = () => {
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

        // Reset form và lỗi
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
                            {[
                                { label: "Tên Sản Phẩm", name: "Product_name", type: "text", placeholder: "Nhập tên sản phẩm" },
                                { label: "Giá Bán", name: "Sale_price", type: "number", placeholder: "VD: 1500000" },
                                { label: "Giá Gốc", name: "Original_price", type: "number", placeholder: "VD: 2000000" },
                                { label: "Thương Hiệu", name: "Brand_name", type: "text", placeholder: "VD: Nike" },
                                { label: "Loại Sản Phẩm", name: "Product_type_name", type: "text", placeholder: "VD: Giày" },
                                { label: "Số Lượng", name: "Quantity", type: "number", placeholder: "VD: 2" },
                                { label: "Giá Ký Gửi", name: "Price", type: "number", placeholder: "VD: 1200000" },
                            ].map(({ label, name, type, placeholder }) => (
                                <div className="mb-3 col-md-6" key={name}>
                                    <label className="form-label fw-bold">{label}</label>
                                    <input
                                        type={type}
                                        className="form-control"
                                        name={name}
                                        value={productData[name]}
                                        onChange={handleChange}
                                        placeholder={placeholder}
                                    />
                                </div>
                            ))}
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
