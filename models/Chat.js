const Sequelize = require('sequelize');
const {sequelize} = require('../utils/database');
const Message = require('./Message');


const Chat = sequelize.define('chat',{
    _id:{
        type: Sequelize.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    groupchat:{
        type: Sequelize.BOOLEAN,
        defaultValue:false
    },
    latestmsg:{
        type: Sequelize.BIGINT,
        references: {
            model: Message,
            key: '_id'
        }
    },
    name:{
        type: Sequelize.STRING,
        defaultValue:'Unnamed'
    }
});


module.exports = Chat;