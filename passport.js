const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const Models = require('./models.js');

const Users = Models.User;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

//http authentication strategy
passport.use(new LocalStrategy(
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
        return done(null, false, "incorrect password...")
      }
      // console.log('Finished');
      return done(null, user, "signed in successfully");

    }).catch(err => {
      done(err, false, { 'Error': err });
    });
  }));

passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'this_is_my_secret'
}, (jwtPayload, callback) => Users.findById(jwtPayload._id)
  .then((user) => callback(null, user))
  .catch((error) => callback(error))));