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
    Users.findOne({
      username: username
    }).then(user => {
      if (!user) {
        return done(null, false, 'Incorrect username...');
      }
      if (!user.validatePassword(password)) {
        return done(null, false, `Incorrect password...${user}`);
      }


      // console.log('Finished');
      return done(null, user);
    }).catch(err => {
      done(err, false, { 'Error': err });
    });
  }));

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: "the-secret-key"
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