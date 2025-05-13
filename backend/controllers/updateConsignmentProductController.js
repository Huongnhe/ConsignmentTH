const { updateConsignment } = require("../models/updateConsignModel");

const updateConsignmentProduct = async (req, res) => {
    // Start transaction for consistency
    let connection;
    try {
        console.log("Request received - params:", req.params, "body:", req.body, "file:", req.file);

        // Parse IDs
        const productId = parseInt(req.params.productId);
        const consignmentId = parseInt(req.params.consignmentId);

        // Validate IDs
        if (isNaN(productId) || isNaN(consignmentId) || productId <= 0 || consignmentId <= 0) {
            return res.status(400).json({ 
                error: "ID không hợp lệ",
                details: {
                    productId: req.params.productId,
                    consignmentId: req.params.consignmentId
                }
            });
        }

        // Prepare data with proper type conversion
        const updatedData = {
            Product_name: req.body.Product_name?.trim(),
            Brand_name: req.body.Brand_name?.trim(),
            Product_Type_Name: req.body.Product_Type_Name?.trim(),
            Original_price: parseFloat(req.body.Original_price),
            Consignment_price: parseFloat(req.body.Consignment_price),
            Sale_price: parseFloat(req.body.Sale_price),
            Quantity: parseInt(req.body.Quantity),
            Image: req.file ? req.file.path : null
        };

        // Additional validation
        if (!updatedData.Product_name || !updatedData.Brand_name || !updatedData.Product_Type_Name) {
            return res.status(400).json({ 
                error: "Thiếu thông tin bắt buộc: Tên sản phẩm, Thương hiệu hoặc Loại sản phẩm",
                receivedData: req.body
            });
        }

        // Call model function
        const result = await updateConsignment(productId, consignmentId, updatedData);
        
        return res.status(200).json({
            success: true,
            message: "Cập nhật thành công",
            data: result
        });

    } catch (error) {
        console.error("Error in updateConsignmentProduct:", {
            message: error.message,
            stack: error.stack,
            params: req.params,
            body: req.body,
            file: req.file
        });

        // Differentiate between client and server errors
        const statusCode = error.message.includes("Thiếu thông tin") || 
                          error.message.includes("không tồn tại") ? 400 : 500;

        return res.status(statusCode).json({ 
            error: error.message || "Lỗi server khi cập nhật sản phẩm",
            details: {
                params: req.params,
                body: req.body,
                file: req.file
            }
        });
    }
};

module.exports = { updateConsignmentProduct };