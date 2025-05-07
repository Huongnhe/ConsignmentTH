import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ConsignContext } from "../context/AuthConsign";
import NavbarUser from "./MenuUser";

const CreateConsign = () => {
  const brandOptions = ["Nike", "Adidas", "Gucci", "Puma"];
  const typeOptions = ["Shoes", "Handbag", "Shirt", "Pants"];

  const [productData, setProductData] = useState({
    Product_name: "",
    Original_price: "",
    Sale_price: "",
    Brand_name: "",
    Product_type_name: "",
    Quantity: "",
    Image: null,
  });

  const [addedProducts, setAddedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  const { createConsign } = useContext(ConsignContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData({ ...productData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProductData({ ...productData, Image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Hàm xóa toàn bộ dữ liệu trong form nhập liệu
  const handleClearForm = () => {
    setProductData({
      Product_name: "",
      Original_price: "",
      Sale_price: "",
      Brand_name: "",
      Product_type_name: "",
      Quantity: "",
      Image: null,
    });
    setImagePreview(null);
    setError(null);
  };

  const handleAddProduct = () => {
    const {
      Product_name,
      Original_price,
      Sale_price,
      Brand_name,
      Product_type_name,
      Quantity,
      Image,
    } = productData;

    if (
      !Product_name ||
      !Original_price ||
      !Sale_price ||
      !Brand_name ||
      !Product_type_name ||
      !Quantity ||
      !Image
    ) {
      setError("Please fill in all product information including image.");
      return;
    }

    if (parseFloat(Sale_price) < parseFloat(Original_price)) {
      setError("Sale price cannot be lower than original price");
      return;
    }

    const newProduct = {
      Product_name,
      Original_price: parseFloat(Original_price),
      Sale_price: parseFloat(Sale_price),
      Brand_name,
      Product_type_name,
      details: {
        Quantity: parseInt(Quantity, 10),
      },
      Image,
    };

    setAddedProducts([...addedProducts, newProduct]);
    handleClearForm(); // Xóa form sau khi thêm sản phẩm
  };

  const handleRemoveProduct = (index) => {
    const updatedProducts = [...addedProducts];
    updatedProducts.splice(index, 1);
    setAddedProducts(updatedProducts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (addedProducts.length === 0) {
      setError("Please add at least one product before submitting.");
      return;
    }
  
    setLoading(true);
    setError(null);
  
    try {
      const productsWithFileNames = addedProducts.map((product) => {
        let imageName = null;
        if (product.Image instanceof File) {
          imageName = `../Images/${product.Image.name}`;
        } else {
          imageName = product.Image; 
        }
  
        return {
          Product_name: product.Product_name,
          Original_price: product.Original_price,
          Sale_price: product.Sale_price,
          Brand_name: product.Brand_name,
          Product_type_name: product.Product_type_name,
          details: {
            Quantity: product.details.Quantity,
          },
          Image: imageName,
        };
      });
  
      const payload = {
        productList: productsWithFileNames,
      };
  
      const response = await createConsign(payload);
  
      setSuccessMessage(response.message || "Consignment created successfully!");
      setShowSuccessModal(true);
    } catch (err) {
      console.error("Error submitting form:", err);
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/consigns");
  };

  return (
    <div className="bg-amber-50 min-vh-100">
      <NavbarUser />
      <div className="container py-5">
        <div
          className="card border-0 shadow-sm rounded-lg overflow-hidden"
          style={{ borderColor: "#e5e7eb" }}
        >
          <div
            className="card-header py-3"
            style={{ backgroundColor: "#d4a762", borderBottom: "1px solid #e5e7eb" }}
          >
            <h3 className="text-center mb-0 text-white">
              <i className="bi bi-box-seam me-2"></i>
              New Consignment Request
            </h3>
          </div>
          <div className="card-body p-4" style={{ backgroundColor: "#f9fafb" }}>
            {error && (
              <div
                className="alert alert-danger alert-dismissible fade show"
                style={{ backgroundColor: "#fee2e2", borderColor: "#fca5a5" }}
              >
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setError(null)}
                ></button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-medium text-amber-900">
                    Product Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="Product_name"
                    value={productData.Product_name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    style={{ borderColor: "#d1d5db", backgroundColor: "#f3f4f6" }}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium text-amber-900">
                    Brand
                  </label>
                  <select
                    className="form-select"
                    name="Brand_name"
                    value={productData.Brand_name}
                    onChange={handleChange}
                    style={{ borderColor: "#d1d5db", backgroundColor: "#f3f4f6" }}
                  >
                    <option value="">Select brand</option>
                    {brandOptions.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium text-amber-900">
                    Original Price (VND)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="Original_price"
                    value={productData.Original_price}
                    onChange={handleChange}
                    placeholder="e.g. 2,000,000"
                    min="0"
                    style={{ borderColor: "#d1d5db", backgroundColor: "#f3f4f6" }}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium text-amber-900">
                    Sale Price (VND)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="Sale_price"
                    value={productData.Sale_price}
                    onChange={handleChange}
                    placeholder="e.g. 2,800,000"
                    min="0"
                    style={{ borderColor: "#d1d5db", backgroundColor: "#f3f4f6" }}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium text-amber-900">
                    Product Type
                  </label>
                  <select
                    className="form-select"
                    name="Product_type_name"
                    value={productData.Product_type_name}
                    onChange={handleChange}
                    style={{ borderColor: "#d1d5db", backgroundColor: "#f3f4f6" }}
                  >
                    <option value="">Select product type</option>
                    {typeOptions.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium text-amber-900">
                    Quantity
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="Quantity"
                    value={productData.Quantity}
                    onChange={handleChange}
                    placeholder="e.g. 2"
                    min="1"
                    style={{ borderColor: "#d1d5db", backgroundColor: "#f3f4f6" }}
                  />
                </div>
                <div className="col-md-12">
                  <label className="form-label fw-medium text-amber-900">
                    Product Image
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    accept="Images/*"
                    onChange={handleImageChange}
                    style={{ borderColor: "#d1d5db", backgroundColor: "#f3f4f6" }}
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{
                          maxWidth: "200px",
                          maxHeight: "200px",
                          border: "1px solid #d1d5db",
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="d-flex justify-content-between mt-4">
                <div>
                  <button
                    type="button"
                    className="btn px-4 py-2 me-2"
                    onClick={handleClearForm} // Nút xóa dữ liệu form
                    style={{
                      backgroundColor: "#fecaca",
                      borderColor: "#f87171",
                      color: "#991b1b",
                    }}
                  >
                    <i className="bi bi-trash me-2"></i>
                    Clear Form
                  </button>
                  <button
                    type="button"
                    className="btn px-4 py-2"
                    onClick={handleAddProduct}
                    style={{
                      backgroundColor: "#a7f3d0",
                      borderColor: "#6ee7b7",
                      color: "#065f46",
                    }}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Add Product
                  </button>
                </div>
                <button
                  type="submit"
                  className="btn px-4 py-2"
                  disabled={loading}
                  style={{
                    backgroundColor: "#d4a762",
                    borderColor: "#b88c4a",
                    color: "#ffffff",
                  }}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send-check me-2"></i>
                      Submit Consignment
                    </>
                  )}
                </button>
              </div>
            </form>

            {addedProducts.length > 0 && (
              <div className="mt-5">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 style={{ color: "#065f46" }}>
                    <i className="bi bi-check-circle-fill me-2"></i>
                    Added Products
                  </h5>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => setAddedProducts([])} // Xóa toàn bộ sản phẩm đã thêm
                  >
                    <i className="bi bi-trash me-1"></i>Clear All
                  </button>
                </div>
                <div className="table-responsive">
                  <table
                    className="table table-hover align-middle"
                    style={{ backgroundColor: "#ffffff" }}
                  >
                    <thead style={{ backgroundColor: "#ecfdf5" }}>
                      <tr>
                        <th style={{ color: "#065f46" }}>Product</th>
                        <th style={{ color: "#065f46" }}>Brand</th>
                        <th style={{ color: "#065f46" }}>Type</th>
                        <th style={{ color: "#065f46" }}>Image</th>
                        <th className="text-end" style={{ color: "#065f46" }}>
                          Qty
                        </th>
                        <th className="text-end" style={{ color: "#065f46" }}>
                          Original Price
                        </th>
                        <th className="text-end" style={{ color: "#065f46" }}>
                          Sale Price
                        </th>
                        <th style={{ color: "#065f46" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {addedProducts.map((item, index) => (
                        <tr
                          key={index}
                          style={{ borderBottom: "1px solid #e5e7eb" }}
                        >
                          <td className="fw-medium">{item.Product_name}</td>
                          <td>{item.Brand_name}</td>
                          <td>{item.Product_type_name}</td>
                          <td>
                            {item.Image && (
                              <img
                                src={URL.createObjectURL(item.Image)}
                                alt={item.Product_name}
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  objectFit: "cover",
                                  borderRadius: "4px",
                                }}
                              />
                            )}
                          </td>
                          <td className="text-end">{item.details.Quantity}</td>
                          <td
                            className="text-end"
                            style={{ textDecoration: "line-through" }}
                          >
                            {item.Original_price.toLocaleString()} VND
                          </td>
                          <td
                            className="text-end fw-medium"
                            style={{ color: "#065f46" }}
                          >
                            {item.Sale_price.toLocaleString()} VND
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleRemoveProduct(index)}
                            >
                              <i className="bi bi-trash"></i> Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div
            className="modal fade show"
            style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div
                className="modal-content border-0 shadow"
                style={{
                  backgroundColor: "#fefce8",
                  borderColor: "#d4a762",
                }}
              >
                <div
                  className="modal-header border-0"
                  style={{ backgroundColor: "#d4a762" }}
                >
                  <h5 className="modal-title text-white">
                    <i className="bi bi-check-circle-fill me-2"></i>
                    Success
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={handleCloseSuccessModal}
                  ></button>
                </div>
                <div className="modal-body py-4">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-check-circle-fill text-success fs-3 me-3"></i>
                    <p className="mb-0 text-amber-900">{successMessage}</p>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button
                    type="button"
                    className="btn px-4 py-2"
                    onClick={handleCloseSuccessModal}
                    style={{
                      backgroundColor: "#d4a762",
                      borderColor: "#b88c4a",
                      color: "#ffffff",
                    }}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .bg-amber-50 {
            background-color: #fffbeb;
          }
          .text-amber-900 {
            color: #78350f;
          }
          .btn:hover {
            opacity: 0.9;
            transition: opacity 0.2s ease;
          }
          .form-control:focus,
          .form-select:focus {
            border-color: #d4a762;
            box-shadow: 0 0 0 0.25rem rgba(212, 167, 98, 0.25);
          }
          .table-hover tbody tr:hover {
            background-color: #f0fdf4 !important;
          }
          .modal-content {
            border: 2px solid;
          }
        `}</style>
      </div>
    </div>
  );
};

export default CreateConsign;