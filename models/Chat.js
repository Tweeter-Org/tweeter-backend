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
        type: Sequelize.BIGINT,
        references: {
            model: Message,
            key: '_id'
        }
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
    }
});


module.exports = Chat;