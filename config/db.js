const  Sequelize  = require('sequelize');
const dotenv = require('dotenv');

const config = require('./index');

dotenv.config();

const sequelize = new Sequelize(config.DB.DATABASE,config.DB.USER, config.DB.PASSWORD,
  {
    dialect: 'mysql',
    host: config.DB.HOST,
    port: config.DB.PORT,
    define: {
      timestamps: false,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });

(async () => await sequelize.sync(
  // { force :true } 
  ))().then(() => {
  console.log("connection is succesful")
}).then(async () => {
}).catch((error) => {
  console.log("Some error happend " + error)
});

module.exports = sequelize;