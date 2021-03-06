const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mongoose = require("mongoose");
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
const passport = require('passport');
const cors = require('cors');
const { check, validationResult } = require('express-validator');


app.use(bodyParser.json());
require('./passport');
app.use(cors());

//express is available inside the ./auth file 
let auth = require('./auth')(app);

// remember to add connection variable in the future. 'mongodb://localhost:27017/myapp'
mongoose.connect('mongodb+srv://Evanescence426:Skyline%401843@multi.yh94s.mongodb.net/myFLIXDB?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something Broke');
})

app.get("/", (request, response) => {
  response.send("welcome to the myFLIX API");
});
// get all movies
app.get("/movies", (request, response) => {
  Movies.find()
    .then((movies) => {
      response.status(201).json(movies)
    }).catch((err) => {
      console.log(err);
      response.status(500).send(err)
    })
})
// get movie by title
app.get('/movies/:movie', (req, res) => {
  Movies.findOne({ title: req.params.movie })
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});
//get the genre for a single movie
app.get("/movies/:movie/genre", (req, res) => {
  Movies.findOne({ title: req.params.movie })
    .then((movie) => {
      res.json(movie.genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});
// get the director for a single movie
app.get("/movies/:movie/director", (req, res) => {
  Movies.findOne({ title: req.params.movie })
    .then((movie) => {
      res.json(movie.director)
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});
// get all users
app.get('/users', (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});
// get user by username
app.get('/users/:Username', (req, res) => {
  Users.findOne({ username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});
// add a new user
app.post('/users', [
  check('username', 'username is required').isLength({ min: 5 }),
  check('username', 'username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('password', 'password is required').not().isEmpty(),
  check('email', 'email does not appear to be valid').isEmail()
], (req, res) => {
  // check the validation object for errors
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  let hashedPassword = Users.hashPassword(req.body.password);
  Users.findOne({ username: req.body.username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.username + 'already exists');
      } else {
        Users
          .create({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            birthday: req.body.birthday
          })
          .then((user) => { res.status(201).json(user) })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          })
      }
    })
});
// update a single user
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({ username: req.params.Username }, {
    $set:
    {
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      birthday: req.body.birthday
    }
  },
    { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
});
// add movie to favorite movies for a single user
app.post('/users/:Username/favorites/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ username: req.params.Username }, {
    $addToSet: { favoriteMovies: req.params.MovieID }
  },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
});
// delete favorite movie for a single user
app.delete('/users/:Username/deleteFavoriteMovie/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ username: req.params.Username }, {
    $pull: { favoriteMovies: req.params.MovieID }
  },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
});

// allows user to delete their account
app.delete('/users/:Username', (req, res) => {
  Users.findOneAndRemove({ username: req.params.Username })
    .then((user) => {
      if (user) {
        res.status(201).send('User ' + req.params.Username + ' was deleted.');
      } else {
        res.status(400).send(req.params.Username + ' was not found.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});


const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});