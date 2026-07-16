const express = require('express');
const router = express.Router();
const {
  getBoards,
  createBoard,
  getBoardById,
  updateBoard,
  deleteBoard,
  toggleArchive,
  getBoardStats,
} = require('../controllers/boardController');
const { protect } = require('../middleware/auth');
const { exportBoard, importBoard } = require('../controllers/importExportController');
const { inviteCollaborator, updateCollaboratorRole, removeCollaborator } = require('../controllers/collaboratorController');

// All board routes are protected
router.use(protect);

router.post('/import', importBoard);
router.get('/:id/export', exportBoard);

router.post('/:id/collaborators', inviteCollaborator);
router.route('/:id/collaborators/:userId')
  .put(updateCollaboratorRole)
  .delete(removeCollaborator);

router.get('/stats', getBoardStats);
router.route('/').get(getBoards).post(createBoard);
router.route('/:id').get(getBoardById).put(updateBoard).delete(deleteBoard);
router.put('/:id/archive', toggleArchive);

module.exports = router;
