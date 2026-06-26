const express = require('express');
const router = express.Router();
const { updateList, deleteList, reorderLists } = require('../controllers/listController');
const { createCard } = require('../controllers/cardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.patch('/reorder', reorderLists);

router.route('/:listId')
  .put(updateList)
  .delete(deleteList);

router.post('/:listId/cards', createCard);

module.exports = router;
