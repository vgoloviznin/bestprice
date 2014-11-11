var express = require('express');
var router = express.Router();
var async = require('async');
var Shop = require('../models/shop');
var Product = require('../models/product');
var Company = require('../models/company');
var mongoose = require('mongoose');
var passport = require('../passportSetup');

var helpers = {
    isCompany: function() {
        return true;
    }
};

router.delete('/', passport.isAdmin, function(req, res) {
    var id = req.body.id;
    Company.findByIdAndRemove(id, function(err) {
        if (err) {
            res.send({success: false});
        }

        Product.findOneAndRemove({ shop: id }, function() {
            res.redirect({success: true, data: '/company'});
        });
    });
});

router.get('/update/:id', passport.isAdmin, function(req, res) {
    Company.findOne({ '_id': req.params.id }).exec(function(err, company) {
        if (err) {
            
        }

        res.render('company/update', {
            helpers: helpers,
            model: company
        });
    });
    
});
router.post('/update', passport.isAdmin, function(req, res) {

    Company.findOneAndUpdate({_id: req.body.id}, {
            name: req.body.name,
            description: req.body.description,
            modifiedby: req.user._id,
            $currentDate: {
                modified: true
            }
        }, function(err, company) {
        if (err) {
            res.render('company/update', {model: req.body, helpers: helpers});
        } else {
            res.redirect('/company/' + company._id);
        }
    });
});

router.get('/create', passport.isAdmin, function(req, res) {
    res.render('company/create', {
        helpers: helpers
    });
});
router.post('/create', passport.isAdmin, function(req, res) {
    var newCompany = new Company({
        name: req.body.name,
        description: req.body.description,
        createdby: req.user._id,
        modifiedby: req.user._id
    });

    newCompany.save(function(err, company) {
        if (err) {
            res.render('company/create', {
                model:req.body,
                helpers: helpers
            });
        } else {
            res.redirect('/company/' + company._id);
        }
    });
});

router.get('/', function(req, res) {
    Company.find().sort('-modified').select('name description').exec(function(err, companies) {
        if (err) {
            
        }

        res.render('company/index', {
            model: companies,
            helpers: helpers
        });
    });
});

router.get('/:id', function(req, res) {
    async.parallel({
        company: function(callback) {
            Company.findOne({ '_id': req.params.id }).select('name description').exec(callback);
        },
        products: function(callback) {
            Product.find({ company: req.params.id }).select('name description price company').sort('-modified').exec(callback);
        }
    }, function(err, results) {
        if (err) {
            
        }
        
        res.render('company/company', {
            model: results.company,
            products: results.products,
            helpers: helpers
        });
    });
});

module.exports = router;