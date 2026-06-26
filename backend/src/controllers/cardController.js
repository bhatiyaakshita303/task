const Board = require('../models/Board');
const List = require('../models/List');
const Card = require('../models/Card');
const mongoose = require('mongoose');

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const createCard = async (req, res) => {
  try {
    const { listId } = req.params;
    const { title, description, priority, status } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Card title is required' });
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

    const card = new Card({
      title,
      description: description || '',
      priority: priority || 'medium',
      status: status || 'todo',
      listId,
      boardId: list.boardId,
    });

    const savedCard = await card.save();

    list.cards.push(savedCard._id);
    await list.save();

    return res.status(201).json(savedCard);
  } catch (error) {
    console.error('Create card error:', error.message);
    return res.status(500).json({ message: 'Server error creating card' });
  }
};

const updateCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { title, description, priority, status, listId } = req.body;

    if (!isValidObjectId(cardId)) {
      return res.status(400).json({ message: 'Invalid Card ID format' });
    }

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    const board = await Board.findById(card.boardId);
    if (!board || board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: You do not own this board' });
    }

    if (title !== undefined) card.title = title;
    if (description !== undefined) card.description = description;
    if (priority !== undefined) card.priority = priority;
    if (status !== undefined) card.status = status;
    
    if (listId !== undefined && listId !== card.listId.toString()) {
      if (!isValidObjectId(listId)) {
        return res.status(400).json({ message: 'Invalid destination List ID' });
      }
      
      const oldListId = card.listId;
      card.listId = listId;

      await List.updateOne({ _id: oldListId }, { $pull: { cards: cardId } });

      await List.updateOne({ _id: listId }, { $push: { cards: cardId } });
    }

    const updatedCard = await card.save();
    return res.json(updatedCard);
  } catch (error) {
    console.error('Update card error:', error.message);
    return res.status(500).json({ message: 'Server error updating card' });
  }
};

const deleteCard = async (req, res) => {
  try {
    const { cardId } = req.params;

    if (!isValidObjectId(cardId)) {
      return res.status(400).json({ message: 'Invalid Card ID format' });
    }

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    const board = await Board.findById(card.boardId);
    if (!board || board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: You do not own this board' });
    }

    await List.updateOne({ _id: card.listId }, { $pull: { cards: cardId } });

    await Card.findByIdAndDelete(cardId);

    return res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Delete card error:', error.message);
    return res.status(500).json({ message: 'Server error deleting card' });
  }
};

const moveCard = async (req, res) => {
  try {
    const { cardId, sourceListId, destListId, sourceCardOrder, destCardOrder } = req.body;

    if (!cardId || !sourceListId || !destListId || !sourceCardOrder || !destCardOrder) {
      return res.status(400).json({ message: 'Missing required drag-and-drop body parameters' });
    }

    if (!isValidObjectId(cardId) || !isValidObjectId(sourceListId) || !isValidObjectId(destListId)) {
      return res.status(400).json({ message: 'Invalid ID formats' });
    }

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    const board = await Board.findById(card.boardId);
    if (!board || board.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied: You do not own this board' });
    }

    if (sourceListId === destListId) {
      const list = await List.findById(sourceListId);
      if (!list) return res.status(404).json({ message: 'List not found' });

      list.cards = sourceCardOrder;
      await list.save();
    } else {
      const sourceList = await List.findById(sourceListId);
      const destList = await List.findById(destListId);

      if (!sourceList || !destList) {
        return res.status(404).json({ message: 'Source or destination list not found' });
      }

      card.listId = destListId;
      await card.save();

      sourceList.cards = sourceCardOrder;
      await sourceList.save();

      destList.cards = destCardOrder;
      await destList.save();
    }

    return res.json({ message: 'Card moved successfully' });
  } catch (error) {
    console.error('Move card error:', error.message);
    return res.status(500).json({ message: 'Server error moving card' });
  }
};

module.exports = {
  createCard,
  updateCard,
  deleteCard,
  moveCard,
};
