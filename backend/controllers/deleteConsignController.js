const { deleteProductFromConsignment, deleteConsignment } = require("../models/deleteConsignModel");
const { getConsignmentDetail } = require("../models/detailConsignModel");

const deleteProductInConsignment = async (req, res) => {
    const { consignmentId, productId } = req.params;

    if (!consignmentId || !productId) {
        return res.status(400).json({ error: "Missing consignment ID or product ID" });
    }

    try {
        const consignment = await getConsignmentDetail(consignmentId);
        if (!consignment) {
            return res.status(404).json({ message: "Consignment not found" });
        }

        const productExistsInConsignment = consignment.Products?.some(
            product => product.Product_ID === parseInt(productId)
        );

        if (!productExistsInConsignment) {
            return res.status(404).json({ message: "Product not found in this consignment" });
        }

        const { success, ticketDeleted, productDeleted } = await deleteProductFromConsignment(consignmentId, productId);

        if (!success) {
            return res.status(500).json({ message: "Failed to delete product" });
        }

        // ⚠️ Get updated consignment to check remaining products
        const updatedConsignment = await getConsignmentDetail(consignmentId);

        // ✅ If consignment was deleted (no products left)
        if (!updatedConsignment || !updatedConsignment.Products || updatedConsignment.Products.length === 0) {
            return res.json({
                success: true,
                message: "Consignment was deleted because it contained no more products.",
                ticketDeleted,
                productDeleted
            });
        }

        // ✅ If only one product remains
        if (updatedConsignment.Products.length === 1 && !ticketDeleted) {
            return res.json({
                success: true,
                message: "Note: Deleting the last product will also delete your consignment.",
                remainingProducts: 1,
                ticketDeleted,
                productDeleted
            });
        }

        return res.json({
            success: true,
            message: "Product deleted successfully",
            remainingProducts: updatedConsignment.Products.length,
            ticketDeleted,
            productDeleted
        });

    } catch (err) {
        console.error("Error deleting product:", err);
        return res.status(500).json({
            error: "Server error while deleting product",
            detail: err.message
        });
    }
};

const deleteConsignmentID = async (req, res) => {
    const { consignmentId } = req.params;

    if (!consignmentId) {
        return res.status(400).json({ error: "Missing consignment ID" });
    }

    try {
        // Call the delete consignment function
        const { success, message } = await deleteConsignment(consignmentId);

        if (!success) {
            return res.status(500).json({ message });
        }

        return res.json({
            success: true,
            message: message || "Consignment deleted successfully"
        });

    } catch (err) {
        console.error("Error deleting consignment:", err);
        return res.status(500).json({
            error: "Server error while deleting consignment",
            detail: err.message
        });
    }
};

module.exports = {
    deleteProductInConsignment,
    deleteConsignmentID
};