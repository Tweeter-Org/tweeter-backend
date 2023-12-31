const Sequelize = require('sequelize');
const {sequelize} = require('../utils/database');
const Message = require('./Message');
const User = require('./userModel');


const Chat = sequelize.define('chat',{
    _id:{
        type: Sequelize.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    latestmsg:{
        type: Sequelize.STRING,
        defaultValue: 'New Chat Created'
    },
    first:{
        type: Sequelize.INTEGER,
        references:{
            model: User,
            key: '_id'
        }
    },
    second:{
        type: Sequelize.INTEGER,
        references:{
            model: User,
            key: '_id'
        }
    },
    new_msg:{
        type: Sequelize.BOOLEAN,
        defaultValue: true
    }
});


module.exports = Chat;