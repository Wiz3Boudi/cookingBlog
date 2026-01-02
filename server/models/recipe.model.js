const { Sequelize, DataTypes } = require('sequelize');
const model = require('./DB.Config.cloud');


const Recipe = model.define('Recipe', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    ingredients: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    image: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: false,
    updatedAt: false,
    createdAt: false
});

module.exports = Recipe; 