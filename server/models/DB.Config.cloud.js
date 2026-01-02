const { Sequelize } = require('sequelize');

const model = new Sequelize(
    process.env.DB_NAME,
    process.env.USER,
    process.env.PASSWORD,
    {
        host: process.env.HOST,
        port: process.env.DB_PORT || 16407,
        dialect: 'mysql',
        dialectModule: require('mysql2'),
        logging: false,
    }
);
model.authenticate()
    .then(() => console.log('Connected to MySQL database!'))
    .catch(error => {
        console.error('Database connection failed:', error.message);
    });

module.exports = model;