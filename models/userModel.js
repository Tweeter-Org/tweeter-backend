const Sequelize = require('sequelize');
const {sequelize} = require('../utils/database');

const User = sequelize.define('user', {
    _id:{
        type: Sequelize.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name:{
        type: Sequelize.STRING
    },
    user_name: {
        type: Sequelize.STRING,
        defaultValue: null,
        unique:true
    },
    bio:{
        type: Sequelize.STRING,
        defaultValue: null
    },
    email:{
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        defaultValue: null
    },
    displaypic:{
        type: Sequelize.STRING,
        defaultValue: null
    },
    isSignedup:{
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
});

module.exports = User;