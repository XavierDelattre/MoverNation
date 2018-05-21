const Sequelize = require('sequelize');

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

  var ActWeight = sequelize.define("actweight", {
  	username: {
  		type: Sequelize.STRING,
  		unique: false,
  		allowNull: false
  	},
  	activity: {
  		type: Sequelize.BOOLEAN,
  		unique: false,
  		allowNull: false
  	},
  	weight: {
  		type: Sequelize.BOOLEAN,
  		unique: false,
  		allowNull: false
  	},
  	start: {
  		type: Sequelize.DATE,
  		unique: false,
  		allowNull: false
  	},
  	end: {
  		type: Sequelize.DATE,
  		unique: false,
  		allowNull: false
  	},
  	kg: {
  		type: Sequelize.FLOAT,
  		unique: false,
  		allowNull: true
  	},
  	description: {
  		type: Sequelize.STRING,
  		unique: false,
  		allowNull: true
  	}
  });

sequelize.sync({force: false})
  .then(() => console.log('actweight table has been successfully created, if one doesn\'t exist'))
  .catch(err => console.log('This error occured', err));

module.exports = ActWeight;