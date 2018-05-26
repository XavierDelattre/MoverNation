process.env.NODE_ENV === "production"

const express = require('express');
const expressHandlebars = require('express-handlebars');
const	bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const User = require('./models/user');
const ActWeight = require('./models/actweight');

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


function dynamicSort(property){
  var sortOrder = 1;
  if(property[0] === "-") {
      sortOrder = -1;
      property = property.substr(1);
  }
  return function (a,b) {
      var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
      return result * sortOrder;
  	}
	};

app.get('/', function(req, res){
	if (req.cookies.movernation_sid && req.session.user){
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
	User.findAll({
		attributes: ['id', 'username']
	}).then(function(list){
		var listUsers = [];
		list.forEach(function(users){
			listUsers.push(users.dataValues);
		});
		var username = req.session.user.username;

		res.render("accounts.hbs", {username: username, user_id: req.session.user.id, listUsers: listUsers});
	});
});


app.route('/accounts/:id')
		.get(function(req, res){
			var id = req.params.id
			var username = req.session.user.username;
			User.findOne({ where: {id: id}}).then(function(user){
				if (req.session.user.id == id){
					ActWeight.findAll({where: {username: username}}).then(function(actweight){
						var listActWeight = [];
						actweight.forEach(function(act){
							listActWeight.push(act.dataValues);
						});
						var listAct = [];
						var listWeight = [];

						listActWeight.forEach(function(element){
							if (element.activity == true)
								listAct.push(element);
							else
								listWeight.push(element);
						});
						listAct.sort(dynamicSort("-start"));
						listWeight.sort(dynamicSort("-start"));
						res.render("account.hbs", {username: username, p_account: 1, user_id: req.session.user.id, listAct: listAct, listWeight: listWeight, currentUser: 1});
					});
				}
				else {
					ActWeight.findAll({where: {username: user.dataValues.username}}).then(function(actweight){
						var listActWeight = [];
						actweight.forEach(function(act){
							listActWeight.push(act.dataValues);
						});
						var listAct = [];
						var listWeight = [];

						listActWeight.forEach(function(element){
							if (element.activity == true)
								listAct.push(element);
							else
								listWeight.push(element);
						});
						listAct.sort(dynamicSort("-start"));
						listWeight.sort(dynamicSort("-start"));
						res.render("account.hbs", {username: username, p_account: 1, user_id: req.session.user.id, notUsername: user.dataValues.username, listAct: listAct, listWeight: listWeight});
					});
				}
			});
		})
		.post(function(req, res){
			if (req.body.description){
				ActWeight.create({
					username: req.session.user.username,
					activity: true,
					weight: false,
					start: req.body.start,
					end: req.body.end,
					kg: null,
					description: req.body.description
				}).then(function(actweight){
					console.log("Added");
					res.redirect(req.session.user.id);
				}).catch(function(err){
					console.log(err);
					res.redirect(req.session.user.id);
				});
			}
			else {
				ActWeight.create({
					username: req.session.user.username,
					activity: false,
					weight: true,
					start: req.body.start,
					end: req.body.start,
					kg: req.body.kg,
					description: null
				}).then(function(actweight){
					console.log("Added");
					res.redirect(req.session.user.id);
				}).catch(function(err){
					console.log(err);
					res.redirect(req.session.user.id);
				});
			}
		});

app.get('/logout', function(req, res){
  req.session.destroy(function(err){
  	if (err)
  		console.log(err);
  });
	res.redirect("/");
});


app.route('/tokens')
		.post(function(req, res){
			User.findOne({where: {username: req.body.username}}).then(function(user){
				if (!user || !user.validPassword(req.body.password))
					res.status(400).send({error: "invalid_grant"});
				else {
					var payload = {sub: user.dataValues.id, preffered_username: user.dataValues.username};
					var token = jwt.sign(payload, "L48Ucp59vx4xJ7fhJ4fxw7Y3w3QA7RF81i646vAnVRkXH7j1hNkZMhSKS7P84cZs", { expiresIn: 86400});
					res.status(200).send({access_token: token, token_type: "Bearer", id_token: payload});
				}
			});
		});

app.route('/weights')
		.post(function(req, res) {
			var token = req.headers.authorization;

			if (!token)
				res.status(401).send();
			tokenSplit = token.split(" ");
			token = tokenSplit[1];
			jwt.verify(token, "L48Ucp59vx4xJ7fhJ4fxw7Y3w3QA7RF81i646vAnVRkXH7j1hNkZMhSKS7P84cZs", function(err, decoded){
				if (err){
					res.status(401).send();
				}
				else {
					User.findOne({where: {id: req.body.userId}}).then(function(user){
						if (!user)
							res.status(400).send();
						else {
							ActWeight.create({
								username: decoded.preffered_username,
								activity: false,
								weight: true,
								start: req.body.time,
								end: req.body.time,
								kg: req.body.weight,
								description: null
							}).then(function(actweight){
								res.status(204).send();
							}).catch(function(err){
								res.status(400).send();
							});
						}
					});
				}
			});
		});

app.route('/training-activities')
		.post(function(req, res){
			var token = req.headers.authorization;

			if (!token)
				res.status(401).send();
			tokenSplit = token.split(" ");
			token = tokenSplit[1];
			jwt.verify(token, "L48Ucp59vx4xJ7fhJ4fxw7Y3w3QA7RF81i646vAnVRkXH7j1hNkZMhSKS7P84cZs", function(err, decoded){
				if (err){
					res.status(401).send();
				}
				else {
					User.findOne({where: {id: req.body.userId}}).then(function(user){
						if (!user)
							res.status(400).send();
						else {
							ActWeight.create({
								username: decoded.preffered_username,
								activity: true,
								weight: false,
								start: req.body.start,
								end: req.body.stop,
								kg: null,
								description: req.body.description
							}).then(function(actweight){
								res.status(204).send();
							}).catch(function(err){
								res.status(400).send();
							});
						}
					});
				}
			});
		});

app.listen(8080);