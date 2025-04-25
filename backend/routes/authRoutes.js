const express = require("express");
const { register, login } = require("../controllers/authController");
const { fetchUserProducts } = require("../controllers/consignController");
const authenticateUser = require("../middeleware/authMiddleware");
const { createConsignController } = require("../controllers/CreateConsignController");
const { fetchConsignmentDetail } = require("../controllers/detailConsignController");
const { updateConsignmentProduct } = require("../controllers/updateConsignmentProduct");
const {deleteProductInConsignment } = require("../controllers/deleteConsignController");

//Controller cho admin
const {
    fetchAllConsignmentTickets,
    fetchPendingConsignmentTickets,
    fetchReviewedConsignmentTickets,
    approveConsignmentTicket,
    rejectConsignmentTicket
} = require("../controllers/adminConsignController");

const router = express.Router();

// Đăng ký và đăng nhập
router.post("/register", register);
router.post("/login", login);

// Người dùng
router.post("/consigns", authenticateUser, fetchUserProducts);
router.post("/CreateConsign", authenticateUser, createConsignController);
router.post("/detailConsign/:id", authenticateUser, fetchConsignmentDetail);
router.put("/updateConsign/:id", authenticateUser, updateConsignmentProduct);
router.post("/consignments/:consignmentId/products/:productId", authenticateUser, deleteProductInConsignment);

//Admin
router.post("/admin/consignments", authenticateUser, fetchAllConsignmentTickets);
router.post("/admin/consignments/pending", authenticateUser, fetchPendingConsignmentTickets);
router.post("/admin/consignments/reviewed", authenticateUser, fetchReviewedConsignmentTickets);
router.put("/admin/approve/:ticketID", approveConsignmentTicket);
router.put("/admin/reject/:ticketID", rejectConsignmentTicket);

module.exports = router;
