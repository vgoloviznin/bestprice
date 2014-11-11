var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var companySchema = new Schema({
    name: {type: String, required: true},
    description: {type: String},
    
    created: {type: Date, default: Date.now},
    modified: {type: Date, default: Date.now},
    
    createdby: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    modifiedby: {type: Schema.Types.ObjectId, ref: 'User', required: true}
});

var Company = mongoose.model('Company', companySchema);

module.exports = Company;