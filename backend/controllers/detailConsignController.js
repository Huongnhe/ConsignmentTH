const { getConsignmentDetail } = require("../models/detailConsignModel");

const fetchConsignmentDetail = async (req, res) => {
    const consignmentId = req.params.id;
    console.log("Passed ID:", consignmentId);

    if (!consignmentId) {
        return res.status(400).json({ error: "Missing consignment ID" });
    }

    try {
        const consignment = await getConsignmentDetail(consignmentId);

        if (!consignment) {
            return res.status(404).json({ message: "Consignment not found" });
        }

        // Check if there are any products
        if (!consignment.Products || consignment.Products.length === 0) {
            return res.status(404).json({ message: "This consignment contains no products" });
        }

        res.json(consignment);  // Return the complete consignment object
    } catch (err) {
        console.error("Error details:", {
            message: err.message,
            stack: err.stack
        });
        res.status(500).json({
            error: "Server error while fetching consignment details",
            detail: err.message
        });
    }
};

module.exports = { fetchConsignmentDetail };