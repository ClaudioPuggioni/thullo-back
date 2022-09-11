const express = require("express");
const router = express.Router();
const CardModel = require("../models/cardModel");
const ListModel = require("../models/listModel");

//! Create New Card in List "/card/create"
router.post("/create", async (req, res) => {
  const { title, desc, userId, board, list } = req.body;
  if (!title || !userId || !board || !list) return res.status(400).send("Required fields missing");

  let newCard = new CardModel({
    title: title,
    desc: desc,
    board: board,
    list: list,
  });

  try {
    let savedCard = newCard.save();
    return res.status(400).send("success");
  } catch (err) {
    return res.status(400).send(err.message);
  }
});

// Move Card from List to List" /card/move"
router.post("/move", async (req, res) => {
  const { currListId, nextListId, cardId } = req.body;
  if (!currListId || !nextListId || !cardId) return res.status(400).send("Required fields missing");

  try {
    let updatedList_From = await ListModel.findOneAndUpdate({ _id: currListId }, { $pull: { cards: cardId } });
  } catch (err) {
    return res.status(501).send(err.message);
  }

  try {
    let updatedList_To = await ListModel.findOneAndUpdate({ _id: nextListId }, { $push: { cards: cardId } });
  } catch (err) {
    return res.status(501).send(err.message);
  }

  return res.status(200).send("List updated successfully");
});

//! Get Single Card Info (including what List this card belongs to)"/card/id"
router.get("/:id", async (req, res) => {
  let id = req.params.id;
  let currCard = await CardModel.findOne({ _id: id }).populate("List");
  return res.status(200).send(currCard);
});

// Edit Card Info (rename title, and edit card description)
router.post("/edit", async (req, res) => {
  const { title, desc, cardId } = req.body;
  if (!cardId || (!title && !desc)) return res.status(400).send("Required fields missing");

  let foundCard = await CardModel.findById(cardId);
  if (title) foundCard.title = title;
  if (desc) foundCard.desc = desc;

  try {
    const savedCard = await foundCard.save();
    return res.status(200).send(savedCard);
  } catch (err) {
    return res.status(501).send(err.message);
  }
});

// Add File to Card
router.post("/file/attach", async (req, res) => {});

// Remove File from Card
router.delete("/file/detach", async (req, res) => {});

// Download File
router.post("/file/download", async (req, res) => {});

// Add Comment
router.post("/comment/add", async (req, res) => {
  const { comment, cardId } = req.body;

  if (!comment || !cardId) return res.send("Required fields missing");

  try {
    let updatedCard = await CardModel.findOneAndUpdate({ _id: cardId }, { $push: { comments: comment } });
    return res.status(201).send("Comment added successfully");
  } catch (err) {
    return res.status(501).send("Comment adding failed");
  }
});

// Remove Comment
router.delete("/comment/del", async (req, res) => {
  const { comment, cardId } = req.body;

  if (!comment || !cardId) return res.send("Required fields missing");

  try {
    let updatedCard = await CardModel.findOneAndUpdate({ _id: cardId }, { $pull: { comments: comment } });
    return res.status(201).send("Comment removed successfully");
  } catch (err) {
    return res.status(501).send("Comment removal failed");
  }
});

// Change Card Cover
router.post("/cover", async (req, res) => {});

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
