const router = require("express")();
const BookModel = require("../Models/Book");
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

router.get("/:isbnId", async (req, res, next) => {
  try {
    const { isbnId } = req.params;
    const book = await BookModel.find({ isbnId: isbnId });
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
    if (role !== "admin") {
      return res
        .status(401)
        .json({ message: "You haven't access for this action" });
    }
    const { isbnId, ...rest } = req.body;
    if (isbnId === null) {
      return res.status(404).json({ message: "Isbn Id is Mandatory" });
    }
    var book = await BookModel.findOne({ isbnId: isbnId });
    if (book === null) {
      return res.status(404).json({ message: "Book not found" });
    }

    book = { ...book, ...rest };
    return res.status(200).json(book);
  } catch (err) {
    next(err);
  }
});

router.delete("/delete-book/:isbnId", async (req, res, next) => {
  try {
    const role = req.session.role;
    if (role !== "admin") {
      return res
        .status(401)
        .json({ message: "You haven't access for this action" });
    }
    const { isbnId } = req.params;
    const result = await BookModel.deleteOne({ isbnId: isbnId });
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
    const { isbnId } = req.body;
    const book = await BookModel.findOne({ isbnId: isbnId });
    if (book != null) {
      return res.status(400).json({ message: "This book already exists" });
    }
    const createdBook = await BookModel.create(req.body);
  } catch (err) {
    next(err);
  }
});

module.exports = { router };
