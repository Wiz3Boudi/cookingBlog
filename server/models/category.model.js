const { DataTypes } = require('sequelize');
const connection = require('./DB.Config.cloud');
const Recipe = require('./recipe.model');

const Category = connection.define('category', {
    img_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    filename: {
        type: DataTypes.STRING,
        allowNull: false
    },
    originalName: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: false,
    updatedAt: false,
    createdAt: false
})

const single_image = connection.define('single_image', {
    img_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    filename: {
        type: DataTypes.STRING,
        allowNull: false
    },
    originalName: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: false,
    createdAt: false,
    updatedAt: false
})

const General = connection.define('general_image', {
    img_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    filename: {
        type: DataTypes.STRING,
        allowNull: false
    },
    originalName: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: false,
    updatedAt: false,
    createdAt: false
});

module.exports = {
    Category,
    General,
    single_image
}