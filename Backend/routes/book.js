const router = require("express")();
const BookModel = require("../Models/Book");
const { roles } = require("../utils/constants");
// get All book
// get a specific book
// update a book
// add a book
// delete a book

router.get("/", async (req, res, next) => {
  try {
    console.log("BookModel :",BookModel)
    const books = await BookModel.find({});
    console.log("books :", books);
    return res.status(200).json(books);
  } catch (err) {
    next(err);
  }
});

router.get("/:isbn", async (req, res, next) => {
  try {
    const { isbn } = req.params;
    const book = await BookModel.find({ isbn: isbn });
    if (book === null) {
      return res.status(404).json({ message: "Book not found" });
    }
    return res.status(200).json(book);
  } catch (err) {
    next(err);
  }
});

router.patch("/update-book", async (req, res, next) => {
  try {
    const role = req.session.role;
    if (role !== roles.admin) {
      return res
        .status(401)
        .json({ message: "You haven't access for this action" });
    }
    const { isbn , ...rest} = req.body;
    
    if (isbn === null) {
      return res.status(404).json({ message: "Isbn Id is Mandatory" });
    }
    var book = await BookModel.findOne({ isbn: isbn });
    if (book === null) {
      return res.status(404).json({ message: "Book not found" });
    }

    const newBook = await BookModel.findOneAndUpdate({ isbn: isbn }, rest, { new: true });
    return res.status(200).json(newBook);
  } catch (err) {
    next(err);
  }
});

router.delete("/delete-book/:isbn", async (req, res, next) => {
  try {
    const role = req.session.role;
    if (role !== "admin") {
      return res
        .status(401)
        .json({ message: "You haven't access for this action" });
    }
    const { isbn } = req.params;
    const result = await BookModel.deleteOne({ isbn: isbn });
    if (result === null) {
      return res.status(404).json({ message: "Book not found" });
    }
    if (result.deletedCount === 1) {
      return res.status(204).json({ message: "Book deleted successfully" });
    }
  } catch (err) {
    next(err);
  }
});

router.post("/add-book", async (req, res, next) => {
  try {
    const role = req.session.role;
    if (role !== "admin") {
      return res
        .status(401)
        .json({ message: "You haven't access for this action" });
    }
    const { isbn } = req.body;
    const book = await BookModel.findOne({ isbn: isbn });
    if (book != null) {
      return res.status(400).json({ message: "This book already exists" });
    }
    const createdBook = await BookModel.create(req.body);
    return res.status(201).json({ createdBook: createdBook });
  } catch (err) {
    next(err);
  }
});

module.exports = { router };
