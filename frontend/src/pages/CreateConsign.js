import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createConsign} from "../api/api"; // Import API đã định nghĩa
import NavbarUser from "./MenuUser"; // Import navbar từ MenuUser.js

const CreateConsign = () => {
    const [formData, setFormData] = useState({
        Product_name: "",
        Sale_price: "",
        Original_price: "",
        Brand_name: "",
        Product_type_name: "",
        Quantity: "",
        Price: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem("token");
            const consignmentData = {
                Product_name: formData.Product_name,
                Sale_price: parseFloat(formData.Sale_price),
                Original_price: parseFloat(formData.Original_price),
                Brand_name: formData.Brand_name,
                Product_type_name: formData.Product_type_name,
                details: {
                    Quantity: parseInt(formData.Quantity, 10),
                    Price: parseFloat(formData.Price),
                },
            };

            const response = await createConsign(token, consignmentData); // Gọi API
            alert(response.message);
            navigate("/consigns"); // Điều hướng về danh sách ký gửi
        } catch (err) {
            setError(err.response?.data?.error || "Đã xảy ra lỗi. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <NavbarUser /> {/* Hiển thị navbar */}
            <div className="container mt-5">
                <h2 className="text-center text-primary">Tạo Đơn Ký Gửi</h2>
                {error && <p className="text-danger text-center">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Tên Sản Phẩm</label>
                        <input
                            type="text"
                            className="form-control"
                            name="Product_name"
                            value={formData.Product_name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Giá Bán</label>
                        <input
                            type="number"
                            className="form-control"
                            name="Sale_price"
                            value={formData.Sale_price}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Giá Gốc</label>
                        <input
                            type="number"
                            className="form-control"
                            name="Original_price"
                            value={formData.Original_price}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Thương Hiệu</label>
                        <input
                            type="text"
                            className="form-control"
                            name="Brand_name"
                            value={formData.Brand_name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Loại Sản Phẩm</label>
                        <input
                            type="text"
                            className="form-control"
                            name="Product_type_name"
                            value={formData.Product_type_name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Số Lượng</label>
                        <input
                            type="number"
                            className="form-control"
                            name="Quantity"
                            value={formData.Quantity}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Giá Ký Gửi</label>
                        <input
                            type="number"
                            className="form-control"
                            name="Price"
                            value={formData.Price}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? "Đang tạo..." : "Tạo Đơn Ký Gửi"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateConsign;