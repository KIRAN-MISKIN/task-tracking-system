const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const userController = require("../controllers/userController");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected routes
router.use(authController.protect);

router.post("/logout", authController.logout);
router.get("/me", userController.getMe);
router.patch("/updateMe", userController.updateMe);

module.exports = router;