const express = require("express");
const { register, login } = require("../controllers/authController");
const { fetchUserProducts } = require("../controllers/consignController");
const authenticateUser = require("../middeleware/authMiddleware");
const { fetchConsignmentDetail } = require("../controllers/detailConsignController");
const { updateConsignmentProduct } = require("../controllers/updateConsignmentProduct");
const { createConsignController } = require("../controllers/createConsignController");


const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/consigns", authenticateUser, fetchUserProducts);
router.post("/detail_consign/:id", authenticateUser, fetchConsignmentDetail);
router.put("/update_consign/:id", authenticateUser, updateConsignmentProduct);
router.post("/create_consign", authenticateUser, createConsignController);

module.exports = router;
