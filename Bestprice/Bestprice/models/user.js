var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
    email: {type: String},
    vkid: {type: String, required: true},
    firstname: {type: String},
    lastname: {type: String},
    photo_50: {type: String},
    accessToken: {type: String},
    refreshToken: {type: String},
    
    created: {type: Date, default: Date.now},
    modified: {type: Date, default: Date.now},
    
    isAdmin: {type: Boolean, default: false}

});

var User = mongoose.model('User', userSchema);

module.exports = User;