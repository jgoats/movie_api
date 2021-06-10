const passport = require('passport'),
  localStrategy = require('passport-local').Strategy,
  passportJWT = require('passport-jwt'),
  Models = require('./models.js');

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJwt = passportJWT.ExtractJwt;
bcrypt = require("bcrypt");

passport.use(initialize());
passport.use(session());
passport.serializeUser(function (user, done) {
  done(null, user._id)
})
passport.use(new localStrategy((username, password, done) => {
  console.log(`Username: ${username} Password: ${password}`);
  Users.findOne({
    username: username
  }, function (err, user) {
    if (err) { return done(err) }
    if (!user) {
      return done(null, false, 'Incorrect username...');
    }
    bcrypt.compare(password, user.password, function (err, res) {
      if (err) return done(err);
      if (res === false) return done(null, false, { message: "password is incorrect" });
      return done(null, user);
    })
  })

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