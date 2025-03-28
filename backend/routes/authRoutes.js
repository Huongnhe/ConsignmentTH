const express = require("express");
const { register, login } = require("../controllers/authController");
const { fetchUserProducts } = require("../controllers/authConsign");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/use-products",fetchUserProducts);
module.exports = router;
