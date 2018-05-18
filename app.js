const express = require('express');
const expressHandlebars = require('express-handlebars');
const	bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const User = require('./models/user');

const app = express();


app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use("/assets", express.static(__dirname + '/assets'));
app.engine('.hbs', expressHandlebars({
defaultLayout: 'layout',
extname: '.hbs'
}));
app.use(session({
    key: 'movernation_sid',
    secret: '6dTE6Bsy86NdX4k5PzuZYAELDt64x4PnAb13AaNrAQdV5S2j7hgKLa228f8f636h',
    resave: false,
    proxy: true,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));
app.use((req, res, next) => {
    if (req.cookies.movernation_sid && !req.session.user) {
        res.clearCookie('movernation_sid');        
    }
    next();
});

var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
        console.log("User connected");
    } else {
        next();
    }    
};


app.get('/', sessionChecker, (req, res) => {
	res.render("index.hbs");
});

app.get('/about', function(req, res){
	res.render("about.hbs");
});

app.get('/contact', function(req, res){
	res.render("contact.hbs");
});

app.route('/register')
		.get(sessionChecker, (req, res) => {
			res.render("register.hbs");
		})
		.post((req, res) => {
			User.create({
				username: req.body.username,
				password: req.body.password,
				email: req.body.email,
				city: req.body.city,
				birth: req.body.birth
			})
			.then(user => {
				req.session.user = user.dataValues;
				res.render("index.hbs");
			})
			.catch(err => {
				console.log(err);
				res.render("register.hbs");
			});
		});

app.route('/login')
		.get(sessionChecker, (req, res) => {
			res.render("login.hbs");
		})
		.post((req, res) => {
			var username = req.body.username,
					password = req.body.password;

			User.findOne({ where: { username: username} }).then(function (user){
				if (!user){
					console.log("No user found with this username.");
					res.render("login.hbs");
				} 
				else if (!user.validPassword(password)) {
					console.log("The password is incorrect.");
					res.render("login.hbs");
				} 
				else {
					req.session.user = user.dataValues;
					res.render("index.hbs");
				}
			})
		})

app.get('/accounts', function(req, res){
	res.render(data.accounts)
});

app.get('/accounts/:id', function(req, res){
	const id = req.params.id
});

app.listen(8080);