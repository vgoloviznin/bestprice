var moment = require('moment');
var mongoose = require('mongoose');
module.exports = {
    isHome: function() {
        return false;
    },
    
    isCompany: function() {
        return false;
    },
    
    isShop: function() {
        return false;
    },
    
    isProduct: function() {
        return false;
    }, 
    
    isOrder: function() {
        return false;
    },
    
    getPrice: function(prices) {
        return prices && prices.length > 0  ? prices[prices.length - 1].value : 0;
    },
    
    getDate: function(date) {
        return moment(date).fromNow();
    }, 
    
    listopt: function(list, id, options) {
        var ret = "", transformedId = id;
        
        if (id instanceof mongoose.Types.ObjectId) {
            transformedId = id.toString();
        }

        for(var i=0, j= list.length; i<j; i++) {
            if (list[i]._id && transformedId) {
                list[i]._selected = list[i].id === transformedId;
            }
            
            ret = ret + options.fn(list[i]);
        }

        return ret;
    },
    
    ifeqById: function(id, options) {
        
        if (id && options.data.root.model._id && (id === options.data.root.model._id)) {
            return options.fn(this);
        } 
        return options.inverse(this);
    },
    
    ifadmin: function(options) {
        if (options.data && options.data && options.data.root && options.data.root.user && options.data.root.user.isAdmin) {
            return options.fn(this);
        }
        
        return options.inverse(this);
    },
    
    ifnot: function(condition, options, O1, O2) {
        if (!condition) {
            return options.fn(this);
        }
        
        return options.inverse(this);
    }
}