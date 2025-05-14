const express = require("express");
const { 
    register,
    registerWithOTPStep1,
    registerWithOTPStep2,
    login
} = require("../controllers/authController");
const { fetchUserProducts } = require("../controllers/consignController");
const authenticateUser = require("../middeleware/authMiddleware");
const { createConsignController } = require("../controllers/CreateConsignController");
const { fetchConsignmentDetail } = require("../controllers/detailConsignController");
const { updateConsignmentProduct } = require("../controllers/updateConsignmentProductController");
const { deleteProductInConsignment, deleteConsignmentID } = require("../controllers/deleteConsignController");
const saleController = require("../controllers/orderConsignController");

// Controller cho admin
const {
  fetchAllConsignmentTickets,
  fetchPendingConsignmentTickets,
  fetchReviewedConsignmentTickets,
  approveConsignmentTicket,
  rejectConsignmentTicket
} = require("../controllers/adminConsignController");

const router = express.Router({ limit: '50mb' });

// ============ AUTHENTICATION ROUTES ============
// Đăng ký thông thường (không OTP)
router.post("/register", register);

// Đăng ký với OTP (2 bước)
router.post("/register/otp", registerWithOTPStep1); // Bước 1: Gửi OTP
router.post("/register/otp/verify", registerWithOTPStep2); // Bước 2: Xác thực OTP

// Đăng nhập
router.post("/login", login);

// ============ USER ROUTES ============
router.post("/consigns", authenticateUser, fetchUserProducts);
router.post("/CreateConsign", authenticateUser, createConsignController);
router.post("/detailConsign/:id", authenticateUser, fetchConsignmentDetail);
router.put("/consignmentUpdate/:consignmentId/products/:productId", authenticateUser, updateConsignmentProduct);
router.post("/consignments/:consignmentId/products/:productId", authenticateUser, deleteProductInConsignment);
router.post("/consignments/:consignmentId", authenticateUser, deleteConsignmentID);

// ============ ADMIN ROUTES ============
router.post("/admin/consignments", authenticateUser, fetchAllConsignmentTickets);
router.post("/admin/consignments/pending", authenticateUser, fetchPendingConsignmentTickets);
router.post("/admin/consignments/reviewed", authenticateUser, fetchReviewedConsignmentTickets);
router.put("/admin/approve/:ticketID", approveConsignmentTicket);
router.put("/admin/reject/:ticketID", rejectConsignmentTicket);
router.get("/admin/products/search", authenticateUser, saleController.searchProducts);
router.post("/admin/orders", authenticateUser, saleController.createOrder);
router.get("/admin/orders/:orderId/invoice", authenticateUser, saleController.getInvoice);

module.exports = router;