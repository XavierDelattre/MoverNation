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
app.use(function(req, res, next){
    if (req.cookies.movernation_sid && !req.session.user) {
        res.clearCookie('movernation_sid');        
    }
    next();
});



app.get('/', function(req, res){
	if (req.cookies.movernation_sid && req.session.user){
		console.log("111111111111\n", req.session.user, "\n11111111111");
		var username = req.session.user.username;
		res.render("index.hbs", {username: username, user_id: req.session.user.id});
	}
	else
		res.render("index.hbs");
});

app.get('/about', function(req, res){
		if (req.cookies.movernation_sid && req.session.user){
		var username = req.session.user.username;
		res.render("about.hbs", {username: username, user_id: req.session.user.id});
	}
	else
		res.render("about.hbs");
;});

app.get('/contact', function(req, res){
	if (req.cookies.movernation_sid && req.session.user){
		var username = req.session.user.username;
		res.render("contact.hbs", {username: username, user_id: req.session.user.id});
	}
	else
		res.render("contact.hbs")
});

app.route('/register')
		.get(function (req, res){
			res.render("register.hbs");
		})
		.post(function(req, res){
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
				if (err.fields[0] == "username")
					res.render("register.hbs", {alert: "Username already taken"});
				else if (err.fields[0] == "email")
					res.render("register.hbs", {alert: "Email already taken"});
				else
					res.render("register.hbs", {alert: "Something went wrong. Make sure that all the fields are complete"});
			});
		});

app.route('/login')
		.get(function(req, res){
			res.render("login.hbs");
		})
		.post(function(req, res){
			var username = req.body.username,
					password = req.body.password;

			User.findOne({where: {username: username}}).then(function(user){
				if (!user)
					res.render("login.hbs", {alert: "No user found with this unsername"});
				else if (!user.validPassword(password))
					res.render("login.hbs", {alert: "Password is incorrect"});
				else {
					req.session.user = user.dataValues;
					res.redirect("/accounts/" + req.session.user.id);
				}
			});
		});

app.get('/accounts', function(req, res){
	var username = req.session.user.username;
	User.findAll({
		attributes: ['id', 'username']
	}).then(function(list){
		console.log("000000000000\n", list[0], "\n0000000000");
	});
	res.render("accounts.hbs", {username: username, user_id: req.session.user.id});
});

app.get('/accounts/:id', function(req, res){
	const id = req.params.id
	var username = req.session.user.username;
	res.render("account.hbs", {username: username, p_account: 1, user_id: req.session.user.id});
});

app.get('/logout', function(req, res){
  req.session.destroy(function(err){
  	if (err)
  		console.log(err);
  });
	res.redirect("/");
});

app.listen(8080);