var async = require('async');
var express = require('express');
var router = express.Router();
var Shop = require('../models/shop');
var Order = require('../models/order');
var Company = require('../models/company');
var Product = require('../models/product');
var passport = require('../passportSetup');

var helpers = {
    isOrder: function() {
        return true;
    }
};

router.delete('/item', passport.ensureAuthenticated, function(req, res) {
    if (req.session.orderid) {
        var query;
        if (req.user.isAdmin) {
            query = Order;
        } else {
            query = Order.where({
                $or: [{ createdby: req.user._id }, { modifiedby: req.user._id }]
            });
        }

        query.findOne({ _id: req.session.orderid, completed: false }).exec(function(err, order) {
            if (err) {
                res.send({success: false});
            }
            
            if (!order) {
                res.send({success: false});
            }

            order.items.id(req.body.id).remove();

            order.save(function(saveErr, o) {
                res.send({success: true, data: '/order/' + req.session.orderid});
            });
        });
    } else {
        res.redirect({success: false});
    }
});

router.post('/complete', passport.ensureAuthenticated, function(req, res) {
    var query;
    if (req.user.isAdmin) {
        query = Order;
    } else {
        query = Order.where({
            $or: [{ createdby: req.user._id }, { modifiedby: req.user._id }]
        });
    }

    query.findOneAndUpdate({_id: req.body.id}, {
        completed: true,
        $currentDate: {
            modified: true
        },
        modifiedby: req.user._id
    }).exec(function(err) {
        if (err) {
            
        }

        req.session.checkorder = false;
        req.session.orderid = false;

        res.redirect('/order');
    });
});

router.post('/add', passport.ensureAuthenticated, function(req, res) {
    async.parallel({
        order: function(callback) {
            if (!req.session.orderid) {
                callback(null, false);
            } else {
               Order.findOne({ _id: req.session.orderid, completed: false }).exec(callback); 
            }
        }, 
        product: function(callback) {
            Product.findOne({_id: req.body.productid}).populate('shop', 'name address').populate('company', 'name').exec(callback);
        }
    }, function(getErr, result) {
        if (getErr) {
            
        }

        var order = result.order;

        if (order) {
            order.modified = Date.now();
            order.modifiedby = req.user._id;
        } else {
            order = new Order({
                createdby: req.user._id,
                modifiedby: req.user._id
            });
        }
        
        var price = result.product.price[result.product.price.length -1].value;
        var item = {
            companyname: result.product.company.name,
            shopaddress: result.product.shop.address,
            shopname: result.product.shop.name,
            name: result.product.name,
            description: result.product.description,
            quantity: parseInt(req.body.quantity),
            price: price,
            product: result.product._id
        };

        //check if we are adding product that already exists in the order 
        var exists = false;
        order.items.filter(function(el) {
            if (!exists && el.product.toString() == item.product.toString()) {
                el.quantity += item.quantity;
                exists = true;
            }
        });
        
        if (!exists) {
            order.items.push(item);
        }
        
        order.save(function(saveErr, o) {
            if (saveErr) {
                    
            }

            req.session.orderid = o.id;
            
            res.redirect(req.body.returnurl || '/');
        });
    });
});

router.get('/', passport.ensureAuthenticated, function(req, res) {
    Order.find().sort('-modified').select('items completed modified').exec(function(err, orders) {
        if (err) {
            
        }

        res.render('order/index', {
            helpers: helpers,
            model: orders
        });
    });
});

router.get('/:id', passport.ensureAuthenticated, function(req, res) {
    var query;
    if (req.user.isAdmin) {
        query = Order;
    } else {
        query = Order.where({
            $or: [{ createdby: req.user._id }, { modifiedby: req.user._id }]
        });
    }
    query.findOne({_id: req.params.id}).select('modified items completed').exec(function(err, order) {
        if (err) {
            
        }
        
        if (!order) {
            req.session.orderid = false;
            
            res.redirect('/order');
        }
        
        res.render('order/order', {
            helpers: helpers,
            model: order
        });
    });
});

module.exports = router;