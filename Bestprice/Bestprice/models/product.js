var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var priceSchema = new Schema({
    value: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

var productSchema = new Schema({

    name: {type: String, index: true, required: true},
    description: {type: String},
    created: {type: Date, default: Date.now},
    modified: {type: Date, default: Date.now},
    price: [priceSchema],
    
    shop: {type: Schema.Types.ObjectId, ref: 'Shop', required: true},
    company: {type: Schema.Types.ObjectId, ref: 'Company', required: true},
    
    createdby: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    modifiedby: {type: Schema.Types.ObjectId, ref: 'User', required: true}
});

var Product = mongoose.model('Product', productSchema);

module.exports = Product;