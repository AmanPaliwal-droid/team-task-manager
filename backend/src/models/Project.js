const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['Admin', 'Member'], default: 'Member' },
  joinedAt: { type: Date, default: Date.now },
});

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    emoji: {
      type: String,
      default: '📁',
    },
    color: {
      type: String,
      default: '#7c6ef7',
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [memberSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: task count (populated via Task model)
projectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
  count: false,
});

// Ensure admin is always a member
projectSchema.pre('save', function (next) {
  const adminMember = this.members.find(
    (m) => m.user.toString() === this.admin.toString()
  );
  if (!adminMember) {
    this.members.push({ user: this.admin, role: 'Admin' });
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);
