const express = require("express");
const router = express.Router();

router.use("/users", require("./user.routes"));
router.use("/tasks", require("./task.routes"));

module.exports = router;