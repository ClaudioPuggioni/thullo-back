const express = require("express");
const router = express.Router();
const BoardModel = require("../models/boardModel");
const ListModel = require("../models/listModel")


//! List All Boards "/board/listall"
router.get("/listall", async (req, res) => {
    const allBoards = await BoardModel.find();
    res.status(200).send(allBoards);
    return;
});

//! Create New Board "/board/create"
router.post("/create"async (req, res) => {
    const { title, admin } = req.body;
    if (!title || !admin) {
        res.status(400).send("Please Fill all the fields")
    }
    let newBoard = new BoardModel({
        title: title,
        admin: admin
    })
    try {
        let createdBoard = await newBoard.save();
        res.status(200).send("Board Created")
    } catch (err) {
        res.status(400).send({
            msg: err
        })
    }


});

//! Get Single Board Info "/board/:id(of the board)"
router.get("/:id", async (req, res) => {
    let boardId = req.params.Id;
    let currBoard = await boardModel.find({
        id: boardId;
    })
    // When there are no matches find() returns [], 

    if (currBoard.length = 0) {
        res.status(400).send("Board not found")
    } else {
        res.status(200).send(currBoard);
    }



});

//! Create New List in Board "/board/addlist"
// ** get a boardid and adminid  in body make a list and add the id to board
router.post("/addlist"async (req, res) => {
    const { boardId, adminid, title, } = req.body;
    if (!boardId || !adminId || !title) { return res.send({ msg: "Provide Valid Info" }) };
    let newList = new ListModel({
        title: title,
        admin: admin
    })

    try {
        let createdList = await newList.save();
        let currBoard = await BoardModel.findById(boardId);
        currBoard.lists.push(createdList._id);

        try {
            currBoard.save();

        } catch (err) {
            res.send("could not add to board")
        }

        res.status(200).send("Board Created")

    } catch (err) {
        res.status(400).send({
            msg: err
        })
    }



});

//! Add Member to Board "/board/add"
// **make a member and add the id to board
router.post("/member/add", async (req, res) => {
    const { memberId, boardId } = req.body;
    if (!memberId || !boardId) {
        return res.status(400).send({ msg: Provide valid data })
    }
    let updatedBoard = await BoardModel.findOneAndUpdate({ _id: boardId }, { $push: { members: memberId } })
    res.status(200).send({ msg: "board Updated" })

});

//! Remove Member from Board (only if admin) "/board/member/del"
//* get board id admin id and member to delete
router.post("/member/del", async (req, res) => {
    const { boardId, memberId } = req.body;
    if (!boardId || !memberId) {
        return res.status(400).send({ msg: Provide valid data });


    }
    let updatedBoard = await BoardModel.findOneAndUpdate({ _id: boardId }, { $pull: { members: memberId } })
    res.status(200).send({ msg: "board Updated" })


});

//! Toggle Visibility of Board "/board/visibility"
//** */ Get the board and admin id check admin and  toggle the boolean 

router.post("/visibility", async (req, res) => {
    const { boardId, bool } = req.body;
    if (!boardId) { res.send({ msg: "provide valid data" }) }
    let updatedBoard = await BoardModel.findOneAndUpdate({ _id: boardId }, { { active: bool } })

res.status(200).send({ msg: "board Updated" })
    
});

//! Edit Board Info (rename, add description, edit description)"/board/edit"
router.post("/edit", async (req, res) => {
    const { title, desc } = req.body;
    let updatedBoard = "";
    if (title) {
        updatedBoard = await BoardModel.findOneAndUpdate({ _id: boardId }, { { title: title } })

    }
if (title) {
    updatedBoard = await BoardModel.findOneAndUpdate({ _id: boardId }, { { desc: desc } })

    }
res.status(200).send(updatedBoard);

});

module.exports = router;
