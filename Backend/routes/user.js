const router = require("express")();
const UserModel = require("../Models/User");
const BookModel = require("../Models/Book");
const { roles } = require("../utils/constants");
//getProfile
//borrow book
//return Book
//login
//logout

const omitPassword = (user) => {
  const { password, ...rest } = user;
  return rest;
};

router.post("/login", async (req, res) => {
  // console.log("req object :", req);
  const { username, password } = req.body;
  const User = await UserModel.findOne({ username: username });
  // User not exist
  if (User === null) {
    return res.status(404).json({ message: "User not found" });
  }
  if (password !== User.password) {
    return res.status(400).json({ message: "Invalid Credentials" });
  }
  req.session.username = username;
  req.session.role = User.role;
  console.log("Session data saveed username role", req.session);
  return res.status(200).json({ user: omitPassword(User) });
});

router.get("/getProfile", async (req, res) => {
  try {
    const username = req.session.username;
    const user = await UserModel.findOne({ username: username });
    console.log("Stored session Data  in get profile", req.session);

    if (user === null) {
      return res.status(404).json({ message: "User not Found" });
    } else {
      return res.status(200).json({ user: omitPassword(user) });
    }
  } catch (err) {
    next(err);
  }
});

router.get("/logout", (req, res, next) => {
  try {
    req.session.destroy();
    console.log(req.session);
    return res.status(204).json({ message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
});
//Burrow Book
router.post("/borrow-books", async (req, res, next) => {
  //check if book exist
  //If exists check book is available
  // Check if he has already borrowed that book
  //if available update book quantity and borrowed by param
  try {
    const { isbn } = req.body;
    console.log("isbn: ", isbn);
    const book = await BookModel.find({ isbn: isbn });
    console.log("book: ", book);
    const username = req.session.username;
    const user = await UserModel.find({ username: username });
    console.log("user: ", user[0]);
    if (book.length === 0) {
      // such book doesn't exist
      return res.status(404).json({ message: "Book doesn't exist" });
    }
    // console.log("UserId", user[0]._id);
    // console.log("book.burrowedBy", book[0]y);
    console.log(
      "book[0].burrowedBy?.indexOf(user[0]._id) :",
      book[0].burrowedBy?.indexOf(user[0]._id)
    );
    console.log("book[0].burrowedBy ",book[0])
    if (book[0].burrowedBy?.(user[0]._id) !== -1||book[0].burrowedBy?.(user[0]._id)===undefined) {
      return res
        .status(400)
        .json({ message: "You have already borrowed that book" });
    }

    if (book[0].availableQunatity > 0) {
      const updatedBook = await BookModel.findOneAndUpdate(
        {
          isbn: isbn,
        },
        {
          borrowedBy: [...book[0].borrowedBy, user[0]._id],
          availableQuantity: book[0].availableQuantity - 1,
        },
        {
          new: true,
        }
      );
      //   await book[0].update({ borrowedBy: [...book[0].borrowedBy, user[0]._id] });
      //   const updatedBook = await BookModel.findById(book[0]._id);
      return res.status(200).json({
        book: updatedBook,
      });
    }
  } catch (err) {
    next(err);
  }
});

router.post("/return", async (req, res, next) => {
  try {
    const { isbn } = req.body;
    const username = req.session.username;

    const book = await BookModel.findOne({ isbn: isbn });
    const user = await UserModel.findOne({ username: username });
    console.log(book);
    console.log(user);
    if (book === null) {
      return res.status(404).json({ message: "Book not found" });
    }
    if (user === null) {
      return res.status(404).json({ message: "User not found" });
    }
    // If user borrwed that book or not
    if (!book.borrowedBy.includes(user._id)) {
      return res.status(400).json({ message: "Book not borrowed from user" });
    }
    console.log("user._id :", user._id);
    const filteredBorrowers = book.borrowedBy.filter(
      (userId) => userId === user._id
    );
    console.log("filteredBorrowers ", filteredBorrowers);
    const updatedBook = await BookModel.findOneAndUpdate(
      { isbn: isbn },
      {
        borrowedBy: filteredBorrowers,
        availableQuantity: book.availableQuantity + 1,
      },
      { new: true }
    );
    return res.status(200).json({ book: updatedBook });
  } catch (err) {
    next(err);
  }
});

router.post("/add-user", async (req, res, next) => {
  try {
    const role = req.session.role;
    if (role !== roles.admin) {
      return res
        .status(401)
        .json({ message: "You haven't access for this action" });
    }
    const { username } = req.body;
    const user = await UserModel.findOne({ username: username });
    if (user != null) {
      return res.status(400).json({ message: "User already exists" });
    }
    const newUser = await UserModel.create(req.body);
    return res.status(201).json({ newUser: newUser });
  } catch (err) {
    next(err);
  }
});
module.exports = { router };
