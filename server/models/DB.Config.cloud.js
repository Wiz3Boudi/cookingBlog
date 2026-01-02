const { Sequelize } = require('sequelize');

const model = new Sequelize(
    process.env.RECIPE_DB_NAME,
    process.env.RECIPE_DB_USERNAME,
    process.env.MYDB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.RECIPE_PORT || 3306,
        dialect: 'mysql',
        dialectModule: require('mysql2'),
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);
model.authenticate()
    .then(() => console.log('Connected to MySQL database!'))
    .catch(error => {
        console.error('Database connection failed:', error.message);
    });

module.exports = model;