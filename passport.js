const passport = require('passport'),
  localStrategy = require('passport-local').Strategy,
  passportJWT = require('passport-jwt'),
  Models = require('./models.js');

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJwt = passportJWT.ExtractJwt;
/* 
  Local Strategy: Authentication
*/
passport.use(new localStrategy(
  {
    usernameField: 'username',
    passwordField: 'password'
  },
  (username, password, done) => {
    console.log(`Username: ${username} Password: ${password}`);
    Users.findOne({
      username: username
    }).then(user => {
      if (!user) {
        return done(null, false, 'Incorrect username...');
      }
      if (!user.validatePassword(password)) {
        return done(null, false, `Incorrect password... ${password}${user}`);
      }

      // console.log('Finished');
      return done(null, user);
    }).catch(err => {
      done(err, false, { 'Error': err });
    });
  }));
/*
  JSON Web Token Strategy: Aurthorization
*/

// This options will be use in the subsequent JWTStrategy to define how the JWT will be extrated from the request or veritfied

// See: http://www.passportjs.org/packages/passport-jwt/ for details

const opts = {
  // jwtFromRequest (Required): is a function that extract the jwt from the request with data type of string or null in not found. 
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  // token is a Privacy Enhanced Mail (Base-64) enhance string
  secretOrKey: 'your_jwt_secret'
}

passport.use(new JWTStrategy(opts, (jwtPayload, done) => {
  return Users.findOne({
    _id: jwtPayload._id
  })
    .then(user => {
      if (!user) {
        return done(null, false, { message: 'User does not exist' });
      }

      return done(null, user);
    })
    .catch(err => {
      done(err, false, { 'Error': err });
    });
}));