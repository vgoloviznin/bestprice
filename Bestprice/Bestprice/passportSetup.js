var express = require('express');
var settings = require('./settings');
var passport = require('passport');
var PassportVkontakte = require('passport-vkontakte').Strategy;
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var User = require('./models/user');
var Order = require('./models/order');

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findOne({ _id: id }, function(err, user) {
        if (err) {
            done(err, false);
        } else {
            done(err, user);
        }
    });
});

passport.isAdmin = function(req, res, next) {
    if (req.isAuthenticated() && req.user && req.user.isAdmin) {
        next();
    } else {
        res.redirect('/');
    }
};

passport.ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        if ((typeof(req.session.checkorder) === 'undefined' || req.session.checkorder) && !req.session.orderid) {
            Order.where({
                $or: [{ createdby: req.user._id }, { modifiedby: req.user._id }]
            }).select('_id').findOne({ completed: false }).exec(function(err, order) {
                if (!order) {
                    req.session.checkorder = false;
                } else {
                    req.session.orderid = order.id;
                }

                res.locals.user = req.user;
                next();
            });
        } else {
            res.locals.user = req.user;
            next();
        }
    } else {
        res.redirect('/');
    }
};

passport.ensureNotAuthenticated = function(req, res, next) {
    if (!req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/');
    }
};

passport.use(new PassportVkontakte({
    apiVersion: '5.26',
    clientID: settings.vkontakteApiId,
    clientSecret: settings.vkontakteAppSecret,
    callbackURL: settings.vkontakteCallbackUrl,
    profileFields: ['id', 'first_name', 'last_name', "email", "photo_50"]
}, function(accessToken, refreshToken, profile, done) {
    User.findOne({ vkid: profile.id }, '_id', function(err, user) {
        if (err) {
            return done(err);
        }
        
        if (!user) {
            var photo50;
            var filteredPhotos = profile.photos.filter(function(el) { return el.type === 'photo_50'; });
            if (filteredPhotos.length > 0) {
                photo50 = filteredPhotos[0].value;
            } else {
                photo50 = profile.photos[0].value;
            }
            var newUser = new User({
                vkid: profile.id,
                firstname: profile.name.givenName,
                lastname: profile.name.familyName,
                photo_50: photo50,
                accessToken: accessToken,
                refreshToken: refreshToken
            });

            newUser.save(function(saveErr) {
                if (saveErr) {
                    return done(saveErr);
                }

                return done(null, newUser);
            });
        } else {
            return done(null, user);
        }

        return done(null, false);
    });
}));

module.exports = passport;