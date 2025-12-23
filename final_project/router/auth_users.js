const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  // Check if the username is valid (already exists)
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  return userswithsamename.length > 0;
};

const authenticatedUser = (username, password) => {
  // Check if username and password match the one we have in records
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  return validusers.length > 0;
};

// Only registered users can login [cite: 143]
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    // Generate JWT access token [cite: 144]
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );

    // Store access token in session
    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review [cite: 152]
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review; // Review is passed as a query parameter [cite: 153]
  const username = req.session.authorization["username"]; // Get username from session

  if (books[isbn]) {
    let book = books[isbn];
    book.reviews[username] = review; // Add or modify review [cite: 154]
    return res
      .status(200)
      .send(
        `The review for the book with ISBN ${isbn} has been added/updated.`
      );
  } else {
    return res
      .status(404)
      .json({ message: `Book with ISBN ${isbn} not found` });
  }
});

// Delete a book review [cite: 166]
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization["username"];

  if (books[isbn]) {
    let book = books[isbn];
    if (book.reviews[username]) {
      delete book.reviews[username]; // Delete review for session username [cite: 167]
      return res
        .status(200)
        .send(
          `Reviews for the ISBN ${isbn} posted by the user ${username} deleted.`
        );
    } else {
      return res
        .status(404)
        .json({
          message: `Review not found for user ${username} on this book`,
        });
    }
  } else {
    return res
      .status(404)
      .json({ message: `Book with ISBN ${isbn} not found` });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
