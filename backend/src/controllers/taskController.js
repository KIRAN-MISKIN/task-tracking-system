const Task = require('../models/task.model');
const User = require('../models/user.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.createTask = catchAsync(async (req, res, next) => {
    const { title, description, dueDate, status, team, assignedToEmail } = req.body;

    // 1) Validate mandatory fields
    if (!title || !description || !dueDate) {
        return next(new AppError('Please provide title, description and dueDate!', 400));
    }

    // 1.5) Check for existing task with same title (Manual uniqueness check)
    const existingTask = await Task.findOne({ title });
    if (existingTask) {
        return next(new AppError('A task with this title already exists. Please use a unique title.', 400));
    }

    // 2) Find assignee by email
    const assignee = await User.findOne({ email: assignedToEmail });
    if (!assignee) {
        return next(new AppError('No user found with that email address for assignment.', 400));
    }

    // 3) Create task
    const newTask = await Task.create({
        title,
        description,
        dueDate,
        status,
        team,
        assignedTo: assignee._id,
        createdBy: req.user._id,
        collaborators: [...new Set([req.user.name, assignee.name])]
    });

    res.status(201).json({
        status: 'success',
        data: {
            task: newTask
        }
    });
});

exports.getAllTasks = catchAsync(async (req, res, next) => {
    const tasks = await Task.find().populate('assignedTo createdBy');

    res.status(200).json({
        status: 'success',
        results: tasks.length,
        data: {
            tasks
        }
    });
});

exports.getTask = catchAsync(async (req, res, next) => {
    const task = await Task.findById(req.params.id).populate('assignedTo createdBy');

    if (!task) {
        return next(new AppError('No task found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            task
        }
    });
});

exports.updateTask = catchAsync(async (req, res, next) => {
    const { title, assignedToEmail } = req.body;
    let updateData = { ...req.body };

    // 1) If updating title, check for duplicates (Manual uniqueness check)
    if (title) {
        const existingTask = await Task.findOne({ title, _id: { $ne: req.params.id } });
        if (existingTask) {
            return next(new AppError('Another task with this title already exists. Please use a unique title.', 400));
        }
    }

    // If changing assignee, verify new email
    if (assignedToEmail) {
        const assignee = await User.findOne({ email: assignedToEmail });
        if (!assignee) {
            return next(new AppError('No user found with that email address for assignment.', 400));
        }
        updateData.assignedTo = assignee._id;

        // Update collaborators if assignee changes (simplified logic for now)
        const task = await Task.findById(req.params.id);
        if (task && !task.collaborators.includes(assignee.name)) {
            updateData.$addToSet = { collaborators: assignee.name };
        }
    }

    const task = await Task.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true
    });

    if (!task) {
        return next(new AppError('No task found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            task
        }
    });
});

exports.deleteTask = catchAsync(async (req, res, next) => {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
        return next(new AppError('No task found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});
