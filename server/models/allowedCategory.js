const { DataTypes } = require('sequelize');
const connection  = require('./DB.Config.cloud');

const allowedCategories = connection.define('allowedCateory',{
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    categories: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    }
},{
    timestamps: false,
    updatedAt: false,
    createdAt: false
});

module.exports = allowedCategories ;