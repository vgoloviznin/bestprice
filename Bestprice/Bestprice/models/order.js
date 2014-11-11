var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var orderItem = new Schema({
    name: {type: String, required: true},
    description: {type: String, required: true},
    price: {type: Number, required: true},
    
    companyname: {type: String, required: true},
    shopaddress: {type: String, required: true},
    shopname: {type: String, required: true},
    
    quantity: {type: Number, required: true},
    
    product: {type: Schema.Types.ObjectId, ref: 'Product', required: true}
});

orderItem.virtual('total').get(function() {
    return this.quantity * this.price;
});

var orderSchema = new Schema({
    items: [orderItem],
    completed: {type: Boolean, default: false},

    created: {type: Date, default: Date.now},
    modified: {type: Date, default: Date.now},
    
    createdby: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    modifiedby: {type: Schema.Types.ObjectId, ref: 'User', required: true}
});

orderSchema.virtual('totalQuantity').get(function() {
    return this.items.reduce(function(aggr, current) {
        return aggr + current.quantity;
    }, 0);
});
orderSchema.virtual('totalPrice').get(function() {
    return this.items.reduce(function(aggr, current) {
        return aggr + current.total;
    }, 0);
});

var Order = mongoose.model('Order', orderSchema);

module.exports = Order;