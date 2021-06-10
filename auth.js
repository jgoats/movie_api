const jwtSecret = 'your_jwt_secret'; // This has to be the same key used in the JWTStrategy

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport'); // Your local passport file


let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.username, // This is the username you’re encoding in the JWT
    expiresIn: '7d', // This specifies that the token will expire in 7 days
    algorithm: 'HS256' // This is the algorithm used to “sign” or encode the values of the JWT
  });
}


const router = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
      if (err || !user) {
        res.status(400).json({
          message: info,
          user: user
        })
      }

      req.login(user, { session: false }, err => {
        if (err) {
          res.json({
            message: err
          })
        }

        let token = generateJWT(user.toJSON());
        console.log(token);
        return res.json({ user, token })
      });
    })(req, res)
  });
}


module.exports = router;