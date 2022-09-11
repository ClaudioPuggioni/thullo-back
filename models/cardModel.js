const mongoose = require("mongoose");

const cardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    list: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "List",
      required: true,
    },
    board: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },
    assignedTo: [
      {
        type: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    labels: [
      {
        type: String,
      },
    ],
    comments: [
      {
        type: String,
      },
    ],
    active: {
      type: Boolean,
      default: true,
    },
    fileUrls: [
      {
        type: String,
      },
    ],
    coverUrl: {
      type: String,
    },
    imgUrl: {
      type: String,
    },
  },

  { timestamps: true }
);

const CardModel = mongoose.model("Card", cardSchema);

module.exports = CardModel;
