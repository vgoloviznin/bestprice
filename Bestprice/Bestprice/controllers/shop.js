var async = require('async');
var express = require('express');
var router = express.Router();
var Shop = require('../models/shop');
var Company = require('../models/company');
var Product = require('../models/product');
var passport = require('../passportSetup');

var helpers = {
    isShop: function() {
        return true;
    }
};

router.delete('/', passport.isAdmin, function(req, res) {
    var id = req.body.id;
    Shop.findByIdAndRemove(id, function(err) {
        if (err) {
            res.send({success: false});
        }

        Product.findOneAndRemove({ shop: id }, function() {
            res.redirect({success: true, data: '/shop'});
        });
    });
});

router.get('/update/:id', passport.isAdmin, function(req, res) {
    Shop.findOne({ '_id': req.params.id }).exec(function(err, shop) {
        if (err) {
            
        }

        res.render('shop/update', {
            helpers: helpers,
            model: shop
        });
    });
    
});
router.post('/update', passport.isAdmin, function(req, res) {

    Shop.findOneAndUpdate({_id: req.body.id}, {
            name: req.body.name,
            description: req.body.description,
            address: req.body.address,
            modifiedby: req.user._id,
            $currentDate: {
                modified: true
            }
        }, function(err, shop) {
        if (err) {
            res.render('shop/update', {model: req.body, helpers: helpers});
        } else {
            res.redirect('/shop/' + shop._id);
        }
    });
});

router.get('/create', passport.isAdmin, function(req, res) {
    res.render('shop/create', {
        helpers: helpers
    });
});
router.post('/create', passport.isAdmin, function(req, res) {
    var newShop = new Shop({
        name: req.body.name,
        description: req.body.description,
        address: req.body.address,
        createdby: req.user._id,
        modifiedby: req.user._id
    });

    newShop.save(function(err, shop) {
        if (err) {
            res.render('shop/create', {model: req.body, helpers: helpers});
        } else {
            res.redirect('/shop/' + shop._id);
        }
    });
});

router.get('/', function(req, res) {
    Shop.find().sort('-modified').select('name description').exec(function(err, shops) {
        if (err) {
            
        }

        res.render('shop/index', {
            model: shops,
            helpers: helpers
        });
    });
});

router.get('/:id', function(req, res) {
    async.parallel({
        shop: function(callback) {
            Shop.findOne({ '_id': req.params.id }).select('name address description').exec(callback);
        },
        products: function(callback) {
            Product.find({ shop: req.params.id }).select('name description price company').populate('company', 'name').exec(callback);
        }
    }, function(err, result) {
        if (err) {
            
        }
        
        res.render('shop/shop', {
            model: result.shop,
            products: result.products,
            helpers: helpers
        });
    });
});

module.exports = router;