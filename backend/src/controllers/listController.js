const Board = require('../models/Board');
const List = require('../models/List');
const Card = require('../models/Card');
const mongoose = require('mongoose');

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const createList = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'List title is required' });
    }

    if (!isValidObjectId(boardId)) {
      return res.status(400).json({ message: 'Invalid Board ID format' });
    }

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: You do not own this board' });
    }

    const list = new List({
      title,
      boardId,
      cards: [],
    });

    const savedList = await list.save();

    board.lists.push(savedList._id);
    await board.save();

    return res.status(201).json(savedList);
  } catch (error) {
    console.error('Create list error:', error.message);
    return res.status(500).json({ message: 'Server error creating list' });
  }
};

const updateList = async (req, res) => {
  try {
    const { listId } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'List title is required' });
    }

    if (!isValidObjectId(listId)) {
      return res.status(400).json({ message: 'Invalid List ID format' });
    }

    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const board = await Board.findById(list.boardId);
    if (!board || board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: You do not own this board' });
    }

    list.title = title;
    const updatedList = await list.save();

    return res.json(updatedList);
  } catch (error) {
    console.error('Update list error:', error.message);
    return res.status(500).json({ message: 'Server error updating list' });
  }
};

const deleteList = async (req, res) => {
  try {
    const { listId } = req.params;

    if (!isValidObjectId(listId)) {
      return res.status(400).json({ message: 'Invalid List ID format' });
    }

    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const board = await Board.findById(list.boardId);
    if (!board || board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: You do not own this board' });
    }

    await Card.deleteMany({ listId });
    board.lists = board.lists.filter((id) => id.toString() !== listId);
    await board.save();

    await List.findByIdAndDelete(listId);

    return res.json({ message: 'List and associated cards deleted successfully' });
  } catch (error) {
    console.error('Delete list error:', error.message);
    return res.status(500).json({ message: 'Server error deleting list' });
  }
};

const reorderLists = async (req, res) => {
  try {
    const { boardId, listOrder } = req.body;

    if (!boardId || !listOrder || !Array.isArray(listOrder)) {
      return res.status(400).json({ message: 'Missing parameters or invalid listOrder format' });
    }

    if (!isValidObjectId(boardId)) {
      return res.status(400).json({ message: 'Invalid Board ID format' });
    }

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: You do not own this board' });
    }

    board.lists = listOrder;
    await board.save();

    return res.json({ message: 'Lists reordered successfully', lists: board.lists });
  } catch (error) {
    console.error('Reorder lists error:', error.message);
    return res.status(500).json({ message: 'Server error reordering lists' });
  }
};

module.exports = {
  createList,
  updateList,
  deleteList,
  reorderLists,
};
