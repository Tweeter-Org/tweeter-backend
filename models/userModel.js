const Sequelize = require('sequelize');
const {sequelize} = require('../utils/database');

const User = sequelize.define('user', {
    _id:{
        type: Sequelize.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    user_name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email:{
        type: Sequelize.STRING,
        allowNull: false
    },
    password: { 
        type: Sequelize.STRING,
        allowNull: false
    },
    displaypic:{
        type: Sequelize.STRING,
        defaultValue: null
    }
});

module.exports = User;