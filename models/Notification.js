const Sequelize = require('sequelize');
const {sequelize} = require('../utils/database');
const Tweet = require('./tweetModel');
const User = require('./userModel');

const Notification = sequelize.define('notification',{
    _id:{
        type: Sequelize.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    receiver:{
        type: Sequelize.BIGINT,
        references:{
            model: User,
            key: '_id'
        }
    },
    type:{
        type: Sequelize.STRING
    },
    tweetId:{
        type: Sequelize.BIGINT,
        references:{
            model: Tweet,
            key: '_id'
        }
    },
    is_read:{
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
});

module.exports = Notification;