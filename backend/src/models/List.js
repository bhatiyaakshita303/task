const mongoose = require('mongoose');

const ListSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a list title'],
      trim: true,
    },
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
      index: true,
    },
    cards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Card',
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('List', ListSchema);
