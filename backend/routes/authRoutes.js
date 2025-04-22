const express = require("express");
const { register, login } = require("../controllers/authController");
const { fetchUserProducts } = require("../controllers/consignController");
const authenticateUser = require("../middeleware/authMiddleware");
const { createConsignController } = require("../controllers/CreateConsignController");
const { fetchConsignmentDetail } = require("../controllers/detailConsignController");
const { updateConsignmentProduct } = require("../controllers/updateConsignmentProduct");
const { fetchAllConsignmentTickets } = require("../controllers/adminConsignController");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/consigns", authenticateUser, fetchUserProducts);
router.post("/CreateConsign", authenticateUser, createConsignController);
router.post("/detailConsign/:id", authenticateUser, fetchConsignmentDetail);
router.put("/updateConsign/:id", authenticateUser, updateConsignmentProduct);
router.post("/admin/consignments", authenticateUser, fetchAllConsignmentTickets); 
module.exports = router;
