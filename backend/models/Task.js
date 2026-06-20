const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'In Progress', 'Completed'],
        message: 'Status must be Pending, In Progress, or Completed',
      },
      default: 'Pending',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const MongooseTask = mongoose.model('Task', TaskSchema);

const { MockTask } = require('../config/mockDb');

const ALLOWED_MOCK_METHODS = ['findOne', 'findById', 'create', 'find', 'countDocuments'];

// Export Proxy wrapper that directs to Mongoose or Mock database
module.exports = new Proxy(MongooseTask, {
  get: function (target, prop) {
    if (!global.mongoConnected && ALLOWED_MOCK_METHODS.includes(prop)) {
      return MockTask[prop];
    }
    return target[prop];
  }
});
