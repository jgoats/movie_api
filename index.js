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
mongoose.connect('mongodb+srv://Evanescence426:Skyline%401843@multi.yh94s.mongodb.net/myFLIXDB?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

app.get("/" , (request , response)=> {
    response.send("welcome to the myFLIX API");
  });

app.get("/movies" , passport.authenticate('jwt', { session: false }), (request , response) => {
    Movies.find()
    .then ((movies) => {
      response.status(201).json(movies)
    }).catch((err) => {
      console.log(err);
      response.status(500).send(err)
    })
})

app.get('/movies/:movie' , passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.findOne({title: req.params.movie})
        .then((movies) => {
          res.json(movies);
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send('Error: ' + err);
        });
  });

  app.get("/movies/:movie/genre" , passport.authenticate('jwt', { session: false }),  (req , res) => {
    Movies.findOne({title: req.params.movie})
    .then((movie) => {
      res.json(movie.genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });

  app.get("/movies/:movie/director", passport.authenticate('jwt', { session: false }), (req , res) => {
    Movies.findOne({title: req.params.movie})
    .then((movie) => {
      res.json(movie.director)
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });

  app.post('/users', [
    check('username', 'username is required').isLength({min: 5}),
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
            .then((user) =>{res.status(201).json(user) })
          .catch((error) => {
            console.error(error);
            res.status(500).send('Error: ' + error);
          })
        }
      })
  });

  app.put('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
    Users.findOneAndUpdate({ username: req.params.Username }, { $set:
      {
        username: req.body.username,
        password: req.body.password,
        email: req.body.email,
        birthday: req.body.birthday
      }
    },
    { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if(err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
  });

  app.post('/users/:Username/favorites/:MovieID', passport.authenticate('jwt', { session: false }),  (req, res) => {
    Users.findOneAndUpdate({username: req.params.Username}, {
      $addToSet: {favoriteMovies: req.params.MovieID}
    },
    {new: true},
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
  });

  app.delete('/users/:Username/deleteFavoriteMovie/:MovieID', passport.authenticate('jwt', { session: false }),  (req, res) => {
    Users.findOneAndUpdate({username: req.params.Username}, {
         $pull: { favoriteMovies: req.params.MovieID} },
    {new: true},
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
  app.delete('/users/:Username' , (req, res) => {
    Users.findOneAndRemove({ username: req.params.Username})
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

 

app.use((err , request , response , next) => {
    console.error(error.stack);
    response.status(500).send('Something broke!');
  });

  const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});
