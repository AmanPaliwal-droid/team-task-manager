const Task = require('../models/Task');
const Project = require('../models/Project');
const { AppError } = require('../middleware/errorHandler');

exports.createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, assignee, dueDate, project } = req.body;

    if (!project) return next(new AppError('project is required', 400));

    // Verify the requester is a member of the project
    const proj = await Project.findById(project);
    if (!proj) return next(new AppError('Project not found', 404));
    const isMember = proj.members.some((m) => m.user.toString() === req.user._id.toString());
    if (!isMember) return next(new AppError('Access denied', 403));

    const task = await Task.create({
      title, description, status, priority,
      assignee: assignee || undefined,
      dueDate: dueDate || undefined,
      project,
      createdBy: req.user._id,
    });

    await task.populate('assignee', 'name color');
    await task.populate('createdBy', 'name');

    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const userProjects = await Project.find({ 'members.user': req.user._id }).select('_id');
    const projectIds = userProjects.map((p) => p._id);

    const tasks = await Task.find({ project: { $in: projectIds } })
      .populate('assignee', 'name color')
      .populate('project', 'name color emoji')
      .populate('createdBy', 'name')
      .sort('-createdAt');

    res.json({ tasks });
  } catch (error) {
    next(error);
  }
};

exports.getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignee: req.user._id })
      .populate('project', 'name color emoji')
      .populate('createdBy', 'name')
      .sort('-createdAt');

    res.json({ tasks });
  } catch (error) {
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return next(new AppError('Task not found', 404));

    const isMember = task.project.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    );
    if (!isMember) return next(new AppError('Access denied', 403));

    const allowed = ['title', 'description', 'status', 'priority', 'assignee', 'dueDate'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) task[field] = req.body[field];
    });

    await task.save();
    await task.populate('assignee', 'name color');
    await task.populate('createdBy', 'name');

    res.json({ task });
  } catch (error) {
    next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return next(new AppError('Task not found', 404));

    const isAdmin = task.project.admin.toString() === req.user._id.toString();
    const isCreator = task.createdBy.toString() === req.user._id.toString();
    if (!isAdmin && !isCreator) return next(new AppError('Access denied', 403));

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    next(error);
  }
};
