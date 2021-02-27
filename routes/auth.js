const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const { client_homepage_url  } = require('../config/keys');

// User model
const User = require('../models/schemas');

const router = express.Router();


router.get('/test', (req, res) => res.json({'fuck': 'fuck'}));

router.post('/login',
    (req, _, next) => {
      console.log('redirect', req.header, req.user, req.users, req.session);
      next();
    },
    passport.authenticate('local', {
      successRedirect: `${client_homepage_url}/dashboard`,
      failureRedirect: client_homepage_url,
      failureFlash: true })
);


//             
router.get("/login/success",  (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      message: 'user successfully authenticated',
      user: req.user,
      cookies: req.cookies
    });
  }
  else {
    res.json({
      success: false,
      message: 'user is not authenticated',
      user: undefined,
      cookies: undefined,
    })
  }
  console.log('req.session', req.session)
});

// when login failed, send failed msg
router.get("/login/failed", (req, res) => {
    res.status(401).json({
        success: false,
        message: 'user failed to authenticate.'
    });
});

router.get("/facebook", passport.authenticate("facebook"));
  
// redirect to home page after successfully login via Facebook
router.get(
    "/facebook/redirect", (req, __, next) => { console.log('redirect', req.header, req.user, req.users, req.session._passport); next(); },
    passport.authenticate("facebook", {
        successRedirect: `${client_homepage_url}/dashboard`,
        failureRedirect: 'auth/login/failed'
    })
);

router.get('/logout', (req, res) => {
  req.session.destroy(function(e){
      req.logout();
      res.redirect(client_homepage_url);
  });
});

module.exports = router;
