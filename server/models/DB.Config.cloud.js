const { Sequelize, DataTypes, Op } = require('sequelize');

const model = new Sequelize(
    process.env.RECIPE_DB_NAME,
    process.env.RECIPE_DB_USERNAME,
    process.env.MYDB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.RECIPE_PORT,
        dialect: process.env.RECIPE_DB_dialect
    }
);
model.authenticate().then(() =>
    console.log('Connected to the database server successfully !')
).catch(erer => console.log(erer));

module.exports = model;