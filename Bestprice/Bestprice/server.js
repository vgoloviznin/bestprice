var fs = require('fs');
var http = require('http');
var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var db = mongoose.connection;
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var methodOverride = require('method-override');
var session = require('cookie-session');
var exphbs = require('express-handlebars');
var settings = require('./settings.json');
var helpers = require('./views/helpers');
var passportSetup = require("./passportSetup");

process.env.NODE_ENV = process.env.NODE_ENV || settings.env;
var staticPath = path.resolve(__dirname, 'public');
var port = process.env.PORT || 1337;


//HBS setup
var hbs = exphbs.create({
    defaultLayout: 'main',
    helpers: helpers
});


//setup
var app = express();

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.set('port', port);
app.use(express.static(staticPath));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(methodOverride());
app.use(session({ secret: settings.secret, }));
app.use(passportSetup.initialize());
app.use(passportSetup.session());

//error logging
app.use(logErrors);
app.use(function(err, req, res, next){
    if (err) {
        console.error(err.stack);
        res.status(500).send('Error!');
    }
});
function logErrors(err, req, res, next) {
  console.error(err.stack);
  next(err);
}

app.use(function(req, res, next){
    if (req.user) {
        res.locals.user = req.user;
    }

    next();
});

var home = require('./controllers/home');
var shop = require('./controllers/shop');
var product = require('./controllers/product');
var company = require('./controllers/company');
var register = require('./controllers/register');
var order = require('./controllers/order');

app.use('/register', register);
app.use('/order', order);
app.use('/product', product);
app.use('/company', company);
app.use('/shop', shop);
app.use('/', home);



//db stuff
var models_path = __dirname + '/models';
fs.readdirSync(models_path).forEach(function (file) {
    if (~file.indexOf('.js')) {
        require(models_path + '/' + file);
    }
});
mongoose.connect(settings.mongopath);
db.on('error', console.error.bind(console, 'connection error:'));
db.on('open', function() {
    app.listen(app.get('port'));
	console.log('server started');
    console.log('env: ' + process.env.NODE_ENV);
});