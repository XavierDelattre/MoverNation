process.env.NODE_ENV === "production"

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
}));
app.use((req, res, next) => {
    if (req.cookies.movernation_sid && !req.session.user) {
        res.clearCookie('movernation_sid');        
    }
    next();
});



app.get('/', (req, res) => {
	if (req.cookies.movernation_sid && req.session.user){
		var username = req.session.user.username;
		res.render("index.hbs", {username: username});
	}
	else
		res.render("index.hbs");
});

app.get('/about', function(req, res){
		if (req.cookies.movernation_sid && req.session.user){
		var username = req.session.user.username;
		res.render("about.hbs", {username: username});
	}
	else
		res.render("about.hbs")
});

app.get('/contact', function(req, res){
	if (req.cookies.movernation_sid && req.session.user){
		var username = req.session.user.username;
		res.render("contact.hbs", {username: username});
	}
	else
		res.render("contact.hbs")
});

app.route('/register')
		.get((req, res) => {
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
				res.redirect("/");
			})
			.catch(err => {
				console.log(err);
				res.render("register.hbs");
			});
		});

app.route('/login')
		.get((req, res) => {
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
					res.redirect("/");
				}
			});
		});

app.get('/accounts', function(req, res){
	var username = req.session.user.username;
	res.render("accounts.hbs", {username: username, p_account: 1});
});

app.get('/accounts/:id', function(req, res){
	const id = req.params.id
});

app.get('/logout', function(req, res){
  req.session.destroy(function(err){
  	if (err)
  		console.log(err);
  });
	res.redirect("/");
});

app.listen(8080);