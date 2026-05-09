const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');

// GET /api/projects — list projects user is a member of
const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ 'members.user': req.user._id })
      .populate('admin', 'name email color')
      .populate('members.user', 'name email color role')
      .sort('-createdAt');

    // Attach task counts
    const withCounts = await Promise.all(
      projects.map(async (p) => {
        const tasks = await Task.find({ project: p._id }).select('status');
        return {
          ...p.toObject(),
          taskCount: tasks.length,
          doneCount: tasks.filter((t) => t.status === 'done').length,
        };
      })
    );

    res.json({ projects: withCounts });
  } catch (err) {
    next(err);
  }
};

// POST /api/projects
const createProject = async (req, res, next) => {
  try {
    const { name, description, emoji, color } = req.body;

    const project = await Project.create({
      name,
      description,
      emoji: emoji || '📁',
      color: color || '#7c6ef7',
      admin: req.user._id,
      members: [{ user: req.user._id, role: 'Admin' }],
    });

    await project.populate('admin', 'name email color');
    await project.populate('members.user', 'name email color role');

    res.status(201).json({ project });
  } catch (err) {
    next(err);
  }
};

// GET /api/projects/:id
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('admin', 'name email color')
      .populate('members.user', 'name email color role');

    if (!project) return next(new AppError('Project not found', 404));

    const isMember = project.members.some(
      (m) => m.user._id.toString() === req.user._id.toString()
    );
    if (!isMember) return next(new AppError('Access denied', 403));

    const tasks = await Task.find({ project: project._id })
      .populate('assignee', 'name color')
      .populate('createdBy', 'name');

    res.json({ project, tasks });
  } catch (err) {
    next(err);
  }
};

// PUT /api/projects/:id — Admin only
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(new AppError('Project not found', 404));
    if (project.admin.toString() !== req.user._id.toString()) {
      return next(new AppError('Only the admin can update this project', 403));
    }

    const { name, description, emoji, color } = req.body;
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (emoji) project.emoji = emoji;
    if (color) project.color = color;

    await project.save();
    await project.populate('admin', 'name email color');
    await project.populate('members.user', 'name email color');

    res.json({ project });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/projects/:id — Admin only
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(new AppError('Project not found', 404));
    if (project.admin.toString() !== req.user._id.toString()) {
      return next(new AppError('Only the admin can delete this project', 403));
    }

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ message: 'Project and all tasks deleted.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/projects/:id/members — Admin only
const addMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(new AppError('Project not found', 404));
    if (project.admin.toString() !== req.user._id.toString()) {
      return next(new AppError('Only the admin can add members', 403));
    }

    const { userId } = req.body;
    if (!userId) return next(new AppError('userId is required', 400));

    const user = await User.findById(userId);
    if (!user) return next(new AppError('User not found', 404));

    const alreadyMember = project.members.some(
      (m) => m.user.toString() === userId
    );
    if (alreadyMember) {
      return res.status(400).json({ message: 'User is already a member.' });
    }

    project.members.push({ user: userId, role: 'Member' });
    await project.save();
    await project.populate('members.user', 'name email color role');

    res.json({ project });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/projects/:id/members/:userId — Admin only
const removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return next(new AppError('Project not found', 404));
    if (project.admin.toString() !== req.user._id.toString()) {
      return next(new AppError('Only the admin can remove members', 403));
    }

    const { userId } = req.params;
    if (userId === project.admin.toString()) {
      return next(new AppError('Cannot remove the project admin', 400));
    }

    project.members = project.members.filter(
      (m) => m.user.toString() !== userId
    );

    // Unassign tasks from removed member
    await Task.updateMany(
      { project: project._id, assignee: userId },
      { $set: { assignee: null } }
    );

    await project.save();
    await project.populate('members.user', 'name email color role');

    res.json({ project });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
