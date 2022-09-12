const express = require("express");
const BoardModel = require("../models/boardModel");
const router = express.Router();
const multer = require("multer");
const CardModel = require("../models/cardModel");
const ListModel = require("../models/listModel");
const CommentModel = require("../models/commentModel");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

//! Create New Card in List "/card/create"
router.post("/create", async (req, res) => {
  const { title, userId, boardId, listId } = req.body;
  if (!title || !userId || !boardId || !listId) return res.status(400).send("Required fields missing");

  const foundBoard = await BoardModel.findById(boardId);
  if (!foundBoard) return res.status(400).send("Board not found");
  if (!foundBoard.members.includes(userId)) return res.status(401).send("Current user is not board member");

  if (!foundBoard.lists.includes(listId)) return res.status(401).send("List does not exist in board");

  let newCard = new CardModel({
    title: title,
    list: listId,
    board: boardId,
  });

  try {
    const savedCard = await newCard.save();
    console.log(savedCard);
    try {
      const foundList = await ListModel.findById(listId);
      if (!foundList) return res.status(401).send("List does not exist");
      foundList.cards.push(savedCard._id);
      const savedBoard = foundList.save();
      return res.status(200).send("Card created successfully");
    } catch (err) {
      return res.status(501).send(err.message);
    }
  } catch (err) {
    return res.status(501).send(err.message);
  }
});

// Move Card from List to List" /card/move"
router.post("/move", async (req, res) => {
  const { currListId, nextListId, cardId, userId } = req.body;
  if (!currListId || !nextListId || !cardId || !userId) return res.status(400).send("Required fields missing");

  const foundCard = await CardModel.findById(cardId).populate("board");
  if (!foundCard) return res.status(400).send("Card not found");
  if (!foundCard.board.members.includes(userId)) return res.status(401).send("Current user is not board member");

  try {
    const updatedList_From = await ListModel.findOneAndUpdate({ _id: currListId }, { $pull: { cards: cardId } });
    const updatedList_To = await ListModel.findOneAndUpdate({ _id: nextListId }, { $push: { cards: cardId } });
    foundCard.list = nextListId;
    const savedCard = await foundCard.save();
    return res.status(200).send("Card moved successfully");
  } catch (err) {
    return res.status(501).send(err.message);
  }
});

//! Get Single Card Info (including what List this card belongs to)"/card/id"
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  const currCard = await CardModel.findOne({ _id: id }).populate("list").populate("comments");
  return res.status(200).send(currCard);
});

// Edit Card Info (rename title, and edit card description)
router.post("/edit", async (req, res) => {
  const { title, desc, cardId, userId } = req.body;
  if (!userId || !cardId || (!title && !desc)) return res.status(400).send("Required fields missing");

  let foundCard = await CardModel.findById(cardId).populate("board");
  if (!foundCard) return res.status(400).send("Card not found");
  if (!foundCard.board.members.includes(userId)) return res.status(401).send("Current user is not board member");

  if (title) foundCard.title = title;
  if (desc) foundCard.description = desc;

  try {
    const savedCard = await foundCard.save();
    return res.status(202).send(savedCard);
  } catch (err) {
    return res.status(501).send(err.message);
  }
});

// Add File to Card
router.post("/file/attach", upload.array("files"), async (req, res) => {
  const { userId, cardId } = req.body;

  if (!userId || !cardId) return res.status(406).send("Required field missing");

  let imageUrl = false;
  if (req.file) {
    imageUrl = "/uploads/" + req.file.filename;
  }
});

// Remove File from Card
router.delete("/file/del", async (req, res) => {});

// Download File
router.post("/file/download", async (req, res) => {});

// Change Card Cover
router.post("/cover", async (req, res) => {});

// Add Comment
router.post("/comment/add", async (req, res) => {
  const { comment, cardId, userId } = req.body;

  if (!comment || !cardId || !userId) return res.status(400).send("Required fields missing");

  let foundCard = await CardModel.findById(cardId).populate("board");
  if (!foundCard) return res.status(400).send("Card not found");
  if (!foundCard.board.members.includes(userId)) return res.status(401).send("Current user is not board member");

  const newComment = new CommentModel({
    comment,
    card: cardId,
    poster: userId,
  });

  try {
    const savedComment = await newComment.save();
    let updatedCard = await CardModel.findOneAndUpdate({ _id: cardId }, { $push: { comments: savedComment } });
    return res.status(201).send("Comment added successfully");
  } catch (err) {
    return res.status(501).send("Comment adding failed");
  }
});

// Edit Comment
router.post("/comment/edit", async (req, res) => {
  const { comment, commentId, cardId, userId } = req.body;

  if (!comment || !commentId || !cardId || !userId) return res.status(400).send("Required fields missing");

  let foundCard = await CardModel.findById(cardId).populate("board").populate("comments");
  if (!foundCard) return res.status(400).send("Card not found");
  if (!foundCard.board.members.includes(userId)) return res.status(401).send("Current user is not board member");

  let found = false;
  for (const commentObj of foundCard.comments) {
    if (commentObj._id.toString() === commentId && commentObj.poster.toString() !== userId) {
      return res.status(401).send("User is not original poster");
    }
    if (commentObj._id.toString() === commentId) found = true;
  }

  try {
    const foundComment = await CommentModel.findById(commentId);
    foundComment.comment = comment;
    const savedComment = await foundComment.save();
    return res.status(201).send("Comment edited successfully");
  } catch (err) {
    return res.status(501).send("Comment removal failed");
  }
});

// Delete Comment
router.delete("/comment/del", async (req, res) => {
  const { commentId, cardId, userId } = req.body;

  if (!commentId || !cardId || !userId) return res.status(400).send("Required fields missing");

  let foundCard = await CardModel.findById(cardId).populate("board").populate("comments");
  if (!foundCard) return res.status(400).send("Card not found");
  if (!foundCard.board.members.includes(userId)) return res.status(401).send("Current user is not board member");

  let found = false;
  for (const commentObj of foundCard.comments) {
    if (commentObj._id.toString() === commentId && commentObj.poster.toString() !== userId) {
      return res.status(401).send("User is not original poster");
    }
    if (commentObj._id.toString() === commentId) found = true;
  }

  if (!found) return res.status(400).send("Comment does not exist");

  try {
    let removedComment = await CommentModel.findOneAndDelete({ _id: commentId });
    let updatedCard = await CardModel.findOneAndUpdate({ _id: cardId }, { $pull: { comments: commentId } });
    return res.status(201).send("Comment removed successfully");
  } catch (err) {
    return res.status(501).send("Comment removal failed");
  }
});

// Add/Edit/Delete Labels on Card
router.post("/labels", async (req, res) => {
  const { label, cardId, action, oldLabel } = req.body;
  if (!label || !cardId || !action) return res.status(400).send("Required fields missing");

  const foundCard = await CardModel.findById(cardId);

  if (!foundCard) return res.status(400).send("Card not found");

  switch (action) {
    case "add":
      foundCard.labels.push(label);
      break;
    case "edit":
      foundCard.labels.filter((ele) => ele !== oldLabel);
      foundCard.labels.push(label);
      break;
    case "del":
      foundCard.labels.filter((ele) => ele !== label);
      break;
    default:
      break;
  }

  try {
    const savedLabel = foundCard.save();
    return res.send("Label added successfully");
  } catch (err) {
    return res.status(501).send(err.message);
  }
});

module.exports = router;
