var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var shopSchema = new Schema({
    
    name: {type: String, index: true, required: true},
    description: {type: String},
    address: {type: String},
    
    created: {type: Date, default: Date.now},
    modified: {type: Date, default: Date.now},
    
    createdby: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    modifiedby: {type: Schema.Types.ObjectId, ref: 'User', required: true}
});

var Shop = mongoose.model('Shop', shopSchema);

module.exports = Shop;