var express = require('express');
var router = express.Router();
var passport = require('../passportSetup');

router.get('/vk/callback',  passport.authenticate('vkontakte', { failureRedirect: '/' }), function(req, res) { res.redirect('/'); });
router.get('/vk', passport.authenticate('vkontakte', {scope: ['email']}), function(req, res){/* The request will be redirected to vk.com for authentication, with extended permissions.*/});

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

module.exports = router;