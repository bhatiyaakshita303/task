const mongoose = require('mongoose');

const BoardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a board title'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    lists: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'List',
      },
    ],
  },
  {
    timestamps: true, 
  }
);

module.exports = mongoose.model('Board', BoardSchema);
