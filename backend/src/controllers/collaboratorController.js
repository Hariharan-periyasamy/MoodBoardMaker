const Board = require('../models/Board');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/responseUtils');
const { createNotification } = require('../utils/notificationHelper');
const { logActivity } = require('../utils/activityLogger');

// @desc    Add / invite collaborator to board
// @route   POST /api/boards/:id/collaborators
// @access  Private
const inviteCollaborator = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    if (!email) return sendError(res, 'Email is required', 400);

    const board = await Board.findOne({ _id: req.params.id, owner: req.user._id });
    if (!board) return sendError(res, 'Board not found or access denied', 404);

    const invitee = await User.findOne({ email });
    if (!invitee) return sendError(res, `No registered user found with email: ${email}`, 404);

    if (invitee._id.toString() === req.user._id.toString()) {
      return sendError(res, 'You are the owner of this board', 400);
    }

    // Check if duplicate
    const exists = board.collaborators.some((c) => c.user.toString() === invitee._id.toString());
    if (exists) return sendError(res, 'User is already a collaborator', 400);

    // Save collaborator
    board.collaborators.push({
      user: invitee._id,
      role: role === 'viewer' ? 'viewer' : 'editor',
    });
    await board.save();

    // Trigger Notification for Invitee
    await createNotification({
      userId: invitee._id,
      type: 'INVITATION_RECEIVED',
      message: `${req.user.name} invited you as an ${role || 'editor'} to their board "${board.title}"`,
      boardId: board._id,
      link: `/boards/${board._id}`,
    });

    await logActivity(req.user._id, board._id, 'BOARD_UPDATED', `Invited collaborator: ${invitee.name} (${role})`);

    // Populate user details for returning
    const updatedBoard = await Board.findById(board._id).populate('collaborators.user', 'name email avatarColor');

    return sendSuccess(res, updatedBoard.collaborators, 'Collaborator added successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Remove collaborator from board
// @route   DELETE /api/boards/:id/collaborators/:userId
// @access  Private
const removeCollaborator = async (req, res, next) => {
  try {
    const board = await Board.findOne({ _id: req.params.id, owner: req.user._id });
    if (!board) return sendError(res, 'Board not found or access denied', 404);

    const { userId } = req.params;

    // Filter out collaborator
    const lengthBefore = board.collaborators.length;
    board.collaborators = board.collaborators.filter(
      (c) => c.user.toString() !== userId
    );

    if (board.collaborators.length === lengthBefore) {
      return sendError(res, 'Collaborator not found on this board', 404);
    }

    await board.save();
    await logActivity(req.user._id, board._id, 'BOARD_UPDATED', `Removed collaborator: ${userId}`);

    const updatedBoard = await Board.findById(board._id).populate('collaborators.user', 'name email avatarColor');

    return sendSuccess(res, updatedBoard.collaborators, 'Collaborator removed successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update collaborator role
// @route   PUT /api/boards/:id/collaborators/:userId
// @access  Private
const updateCollaboratorRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['editor', 'viewer'].includes(role)) {
      return sendError(res, 'Invalid role. Choose "editor" or "viewer"', 400);
    }

    const board = await Board.findOne({ _id: req.params.id, owner: req.user._id });
    if (!board) return sendError(res, 'Board not found or access denied', 404);

    const { userId } = req.params;

    const collab = board.collaborators.find((c) => c.user.toString() === userId);
    if (!collab) return sendError(res, 'Collaborator not found', 404);

    collab.role = role;
    await board.save();

    await logActivity(req.user._id, board._id, 'BOARD_UPDATED', `Updated collaborator role for user ${userId} to ${role}`);

    const updatedBoard = await Board.findById(board._id).populate('collaborators.user', 'name email avatarColor');

    return sendSuccess(res, updatedBoard.collaborators, 'Collaborator role updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  inviteCollaborator,
  removeCollaborator,
  updateCollaboratorRole,
};
