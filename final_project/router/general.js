const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user [cite: 131]
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      // Push to the users array imported from auth_users [cite: 132]
      users.push({ username: username, password: password });
      return res
        .status(200)
        .json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
// Implemented using Promises (Task 10) [cite: 182]
public_users.get("/", function (req, res) {
  new Promise((resolve, reject) => {
    resolve(books);
  })
    .then((bookList) => {
      return res.send(JSON.stringify(bookList, null, 4));
    })
    .catch((err) => {
      return res.status(500).json({ message: "Error retrieving books" });
    });
});

// Get book details based on ISBN
// Implemented using Promises (Task 11) [cite: 190]
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book not found");
    }
  })
    .then((book) => {
      return res.json(book);
    })
    .catch((err) => {
      return res.status(404).json({ message: err });
    });
});

// Get book details based on author
// Implemented using Promises (Task 12) [cite: 201]
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  new Promise((resolve, reject) => {
    let booksByAuthor = [];
    let isbns = Object.keys(books); // Obtain all keys [cite: 102]

    // Iterate through books array & check author match [cite: 103]
    isbns.forEach((isbn) => {
      if (books[isbn].author === author) {
        booksByAuthor.push(books[isbn]);
      }
    });

    if (booksByAuthor.length > 0) {
      resolve(booksByAuthor);
    } else {
      reject("No books found for this author");
    }
  })
    .then((booksFound) => {
      return res.json(booksFound);
    })
    .catch((err) => {
      return res.status(404).json({ message: err });
    });
});

// Get all books based on title
// Implemented using Promises (Task 13) [cite: 209]
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  new Promise((resolve, reject) => {
    let booksByTitle = [];
    let isbns = Object.keys(books);

    isbns.forEach((isbn) => {
      if (books[isbn].title === title) {
        booksByTitle.push(books[isbn]);
      }
    });

    if (booksByTitle.length > 0) {
      resolve(booksByTitle);
    } else {
      reject("No books found with this title");
    }
  })
    .then((booksFound) => {
      return res.json(booksFound);
    })
    .catch((err) => {
      return res.status(404).json({ message: err });
    });
});

//  Get book review [cite: 123]
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
