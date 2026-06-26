const express = require('express');
const router = express.Router();
const {
  getBoards,
  createBoard,
  getBoardById,
  updateBoard,
  deleteBoard,
} = require('../controllers/boardController');
const { createList } = require('../controllers/listController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getBoards)
  .post(createBoard);

router.route('/:boardId')
  .get(getBoardById)
  .put(updateBoard)
  .delete(deleteBoard);

// Route for list creation: POST /api/boards/:boardId/lists
router.post('/:boardId/lists', createList);

module.exports = router;
