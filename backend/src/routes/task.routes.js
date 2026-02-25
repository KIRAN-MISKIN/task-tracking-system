const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authController = require('../controllers/authController');

// All routes are protected
router.use(authController.protect);

router.route('/')
    .get(taskController.getAllTasks)
    .post(taskController.createTask);

router.route('/:id')
    .get(taskController.getTask)
    .patch(taskController.updateTask)
    .delete(taskController.deleteTask);

module.exports = router;
