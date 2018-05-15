const express = require('express')
const expressHandlebars = require('express-handlebars')
const db = require('sqlite3')
const sequelize = require('sequelize')

const app = express()
const data = require('./dummy-data')

app.engine('.hbs', expressHandlebars({
defaultLayout: 'layout',
extname: '.hbs'
}))
app.use("/assets", express.static(__dirname + '/assets'));


app.get('/', function(request, response){
	response.render("index.hbs")
})

app.get('/about', function(request, response){
	response.render("about.hbs")
})

app.get('/contact', function(request, response){
	response.render("contact.hbs")
})

app.get('/login', function(request, response){
	response.render("login.hbs")
})

app.get('/register', function(request, response){
	response.render("register.hbs")
})

app.get('/accounts', function(request, response){
	response.render(data.accounts)
})

app.get('/accounts/:id', function(request, response){
	const id = request.params.id
	response.render(data.accounts[id])
})

app.listen(8080)