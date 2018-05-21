const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');

var sequelize = new Sequelize('MoverNationDb', null, null, {
	dialect: "sqlite",
	storage: "./db/movernation.sqlite",
});

sequelize
  .authenticate()
  .then(function(){
    console.log('Connection has been established successfully.');
  })
  .catch(function(err){
    console.error('Unable to connect to the database:', err);
  });

 var User = sequelize.define("users", {
	username: {
		type: Sequelize.STRING,
		unique: true,
		allowNull: false
	},
	password: {
		type: Sequelize.STRING,
		allowNull: false
	},
	email: {
		type: Sequelize.STRING,
		unique: true,
		allowNull: false,
		validate: {
			isEmail: true
		}
	},
	city: {
		type: Sequelize.STRING,
		allowNull: false
	},
	birth: {
		type: Sequelize.STRING,
		allowNull: false
	}
});

User.prototype.validPassword = function(password){
	return bcrypt.compareSync(password, this.password);
};
User.hook("beforeCreate", function(user){
	user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(), null)
});

sequelize.sync({force: false})
    .then(() => console.log('users table has been successfully created, if one doesn\'t exist'))
    .catch(err => console.log('This error occured', err));

module.exports = User;