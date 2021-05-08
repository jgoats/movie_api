const mongoose = require("mongoose");

let movieSchema = mongoose.Schema({
    title : {type : String , required : true},
    description : {type : String , required : true},
    genre : {name : String, description : String},
    director : {name : String , bio : String},
    imageURL : String,
    featured : Boolean
});

let userSchema = mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    email: {type: String},
    birthday: Date,
    favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
  });

  let Movie = mongoose.model('Movie', movieSchema , "movies");
  let User = mongoose.model('User', userSchema , "users");

  module.exports.Movie = Movie;
  module.exports.User = User;