const Board = require('../models/Board');
const List = require('../models/List');
const Card = require('../models/Card');
const mongoose = require('mongoose');

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const getBoards = async (req, res) => {
  try {
    const boards = await Board.find({ owner: req.user._id }).sort({ createdAt: -1 });
    return res.json(boards);
  } catch (error) {
    console.error('Get boards error:', error.message);
    return res.status(500).json({ message: 'Server error fetching boards' });
  }
};

const createBoard = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Board title is required' });
    }

    const board = new Board({
      title,
      description: description || '',
      owner: req.user._id, 
      lists: [],
    });

    const savedBoard = await board.save();
    return res.status(201).json(savedBoard);
  } catch (error) {
    console.error('Create board error:', error.message);
    return res.status(500).json({ message: 'Server error creating board' });
  }
};

const getBoardById = async (req, res) => {
  try {
    const { boardId } = req.params;

    if (!isValidObjectId(boardId)) {
      return res.status(400).json({ message: 'Invalid Board ID format' });
    }

    const board = await Board.findById(boardId).populate({
      path: 'lists',
      populate: {
        path: 'cards',
        model: 'Card',
      },
    });

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    if (board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: You do not own this board' });
    }

    return res.json(board);
  } catch (error) {
    console.error('Get board by ID error:', error.message);
    return res.status(500).json({ message: 'Server error fetching board details' });
  }
};

const updateBoard = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { title, description } = req.body;

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

    if (title !== undefined) board.title = title;
    if (description !== undefined) board.description = description;

    const updatedBoard = await board.save();
    return res.json(updatedBoard);
  } catch (error) {
    console.error('Update board error:', error.message);
    return res.status(500).json({ message: 'Server error updating board' });
  }
};

const deleteBoard = async (req, res) => {
  try {
    const { boardId } = req.params;

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

    await Card.deleteMany({ boardId });
    await List.deleteMany({ boardId });

    await Board.findByIdAndDelete(boardId);

    return res.json({ message: 'Board and all related lists and cards deleted successfully' });
  } catch (error) {
    console.error('Delete board error:', error.message);
    return res.status(500).json({ message: 'Server error deleting board' });
  }
};

module.exports = {
  getBoards,
  createBoard,
  getBoardById,
  updateBoard,
  deleteBoard,
};
