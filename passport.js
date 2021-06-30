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

passport.use(new LocalStrategy((username, password, done) => {
  User.findOne({ username }, (err, user) => {
    if (err) {
      return done(err);
    }
    if (!user) {
      return done(null, false);
    }
    user.comparePassword(password, done)
  })
}))


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