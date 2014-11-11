var express = require('express');
var router = express.Router();
var Product = require('../models/product');

var helpers = {
    isHome: function() {
        return true;
    }   
};

router.get('/', function(req, res) {
    if (req.query.search) {
        Product.find({ name: { $regex: '.*' + req.query.search + '.*', $options: 'i' } }).populate('shop', 'name').populate('company', 'name').exec(function(err, products) {
            if (err) {
                
            }
            
            res.render('home/index', {
                search: req.query.search,
                helpers: helpers,
                model: products
            });
        });
    } else {
        res.render('home/index', {
            helpers: helpers
        });
    }
});

module.exports = router;