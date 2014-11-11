var express = require('express');
var mongoose = require('mongoose');
var async = require('async');
var router = express.Router();
var Shop = require('../models/shop');
var Product = require('../models/product');
var Company = require('../models/company');
var passport = require('../passportSetup');

var helpers = {
    isProduct: function() {
        return true;
    }
};

router.delete('/', passport.isAdmin, function(req, res) {
    Product.findByIdAndRemove(req.body.id, function(err) {
        if (err) {
            res.send({success: false});
        }

        res.send({success: true, data: '/product'});
    });
});

router.get('/update/:id', passport.isAdmin, function(req, res) {
    async.parallel({
        product: function(callback) {
            Product.findOne({ '_id': req.params.id }).exec(callback);
        },
        shops:function(callback) {
            Shop.find().sort('+name').select('name').exec(callback);
        },
        companies: function(callback) {
            Company.find().sort('+name').select('name').exec(callback);
        }
    }, function(err, results) {
        if (err) {
            
        }
        
        res.render('product/update', {
            model: results.product,
            shops: results.shops,
            companies: results.companies,
            helpers: helpers
        });
    });
});
router.post('/update', passport.isAdmin, function(req, res) {
    Product.findByIdAndUpdate(req.body.id, {
        name: req.body.name,
        description: req.body.description,
        company: req.body.company,
        shop: req.body.shop,
        modifiedby: req.user.id,
        $currentDate: {
            modified:true
        }
    }, function(err, product) {
        if (err) {
            async.parallel({
                product: function(callback) {
                    Product.findOne({ '_id': req.params.id }).exec(callback);
                },
                shops:function(callback) {
                    Shop.find().sort('+name').select('name').exec(callback);
                },
                companies: function(callback) {
                    Company.find().sort('+name').select('name').exec(callback);
                }
            }, function(fetchErr, results) {
                if (fetchErr) {
            
                }
        
                res.render('product/update', {
                    model: req.body,
                    shops: results.shops,
                    companies: results.companies,
                    helpers: helpers
                });
            });
        } else {
            product.price.push({ value: req.body.price});

            product.save(function(saveArrErr) {
                if (saveArrErr) {
                    
                }
                
                res.redirect('/product/' + product._id);
            });
        }
    });
});

router.get('/create', passport.isAdmin, function(req, res) {
    async.parallel({
        shops:function(callback) {
            Shop.find().sort('+name').select('name').exec(callback);
        },
        companies: function(callback) {
            Company.find().sort('+name').select('name').exec(callback);
        }
    }, function(err, results) {
        if (err) {
            
        }
        
        res.render('product/create', {
            shops: results.shops,
            companies: results.companies,
            helpers: helpers
        });
    });
});
router.post('/create', passport.isAdmin, function(req, res) {
    var shopId = mongoose.Types.ObjectId(req.body.shop);
    var companyId = mongoose.Types.ObjectId(req.body.company);
    
    var newProduct = new Product({
        name: req.body.name,
        description: req.body.description,
        shop:  shopId,
        company: companyId,
        createdby: req.user._id,
        modifiedby: req.user._id
    });

    newProduct.price.push({ value: req.body.price});

    newProduct.save(function(err, product) {
        if (err) {
            async.parallel({
                shops:function(callback) {
                    Shop.find().sort('+name').select('name').exec(callback);
                },
                companies: function(callback) {
                    Company.find().sort('+name').select('name').exec(callback);
                }
            }, function(err, results) {
                if (err) {
            
                }
        
                res.render('product/create', {
                    model:req.body,
                    shops: results.shops,
                    companies: results.companies,
                    helpers: helpers
                });
            });
        } else {
            res.redirect('/product/' + product._id);
        }
    });
});

router.get('/name', function(req, res) {
    Product.find({ name: {$regex: '.*' + req.query.search + '.*', $options: 'i'} }).select('name -_id').limit(10).exec(function(err, products) {
        if (err) {
            res.send({ success: false });
        }

        res.send({ success: true, data: products });
    });
});

router.get('/', function(req, res) {
    Product.find().sort('-modified').populate('shop', 'name').populate('company', 'name').exec(function(err, products) {
        if (err) {
            
        }
        helpers.returnUrl = '/product';
        
        res.render('product/index', {
            model: products,
            helpers: helpers
        });
    });
});

router.get('/:id', function(req, res, next) {
    Product.findOne({ '_id': req.params.id }).populate('shop', 'name').populate('company', 'name').exec(function(err, product) {
        if (err) {
            next(err);
        }

        res.render('product/product', {
            model: product,
            helpers: helpers
        });
    });
});

module.exports = router;