const mongoose = require("mongoose");
const bcrypt = require('bcrypt');

let movieSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  genre: { name: String, description: String },
  director: { name: String, bio: String },
  imageURL: String,
  featured: Boolean
});

let userSchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String },
  birthday: Date,
  favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) {
    return next()
  }
  bcrypt.hash(this.password, 10, (err, passwordHash) => {
    if (err) {
      return next(err);
    }
    this.password = passwordHash;
    next();
  })
})

userSchema.methods.comparePassword = function (password, cb) {
  bcrypt.compare(password, this.password, (err, isMatch) => {
    if (err) {
      return cb(err);
    }
    else {
      if (!isMatch()) {
        return cb(null, isMatch)
      }
      return cb(null, this);
    }
  })
}

let Movie = mongoose.model('Movie', movieSchema, "movies");
let User = mongoose.model('User', userSchema, "users");

module.exports.Movie = Movie;
module.exports.User = User;