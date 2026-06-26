const express = require('express');
const router = express.Router();
const { updateCard, deleteCard, moveCard } = require('../controllers/cardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.patch('/move', moveCard);

router.route('/:cardId')
  .put(updateCard)
  .delete(deleteCard);

module.exports = router;
