const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'A task must have a title'],
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'A task must have a description'],
        trim: true
    },
    dueDate: {
        type: Date,
        required: [true, 'A task must have a due date']
    },
    status: {
        type: String,
        enum: {
            values: ['to do', 'In progress', 'backlog', 'completed', 'cancelled'],
            message: 'Status is either: to do, In progress, backlog, completed, cancelled'
        },
        default: 'backlog'
    },
    team: {
        type: String,
        trim: true
    },
    assignedTo: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A task must be assigned to a user']
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'A task must have a creator']
    },
    collaborators: [String], // Store names of collaborators
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware to update the updatedAt field
taskSchema.pre('save', function () {
    this.updatedAt = Date.now();
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
