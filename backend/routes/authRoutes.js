const express = require("express");
const { register, login } = require("../controllers/authController");
const { fetchUserProducts } = require("../controllers/consignController");
const authenticateUser = require("../middeleware/authMiddleware");
const { createConsignController } = require("../controllers/CreateConsignController");
const { fetchConsignmentDetail } = require("../controllers/detailConsignController");
const { updateConsignmentProduct } = require("../controllers/updateConsignmentProduct");
const { deleteProductInConsignment, deleteConsignmentID } = require("../controllers/deleteConsignController");
const saleController = require("../controllers/orderConsignController");

//Controller cho admin
const {
  fetchAllConsignmentTickets,
  fetchPendingConsignmentTickets,
  fetchReviewedConsignmentTickets,
  approveConsignmentTicket,
  rejectConsignmentTicket
} = require("../controllers/adminConsignController");

const router = express.Router({ limit: '50mb' });

// Đăng ký và đăng nhập
router.post("/register", register);
router.post("/login", login);

// Người dùng
router.post("/consigns", authenticateUser, fetchUserProducts);
router.post("/CreateConsign", authenticateUser, createConsignController);
router.post("/detailConsign/:id", authenticateUser, fetchConsignmentDetail);
router.post("/consignmentUpdate/:consignmentId/products/:productId", authenticateUser, updateConsignmentProduct);
router.post("/consignments/:consignmentId/products/:productId", authenticateUser, deleteProductInConsignment);
router.post("/consignments/:consignmentId", authenticateUser, deleteConsignmentID);

// Admin
router.post("/admin/consignments", authenticateUser, fetchAllConsignmentTickets);
router.post("/admin/consignments/pending", authenticateUser, fetchPendingConsignmentTickets);
router.post("/admin/consignments/reviewed", authenticateUser, fetchReviewedConsignmentTickets);
router.put("/admin/approve/:ticketID", approveConsignmentTicket);
router.put("/admin/reject/:ticketID", rejectConsignmentTicket);
router.get("/admin/products/search", authenticateUser, saleController.searchProducts);
router.post("/admin/orders", authenticateUser, saleController.createOrder);
router.get("/admin/orders/:orderId/invoice", authenticateUser, saleController.getInvoice);

module.exports = router;
