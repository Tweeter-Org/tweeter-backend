const Sequelize = require('sequelize');
const {sequelize} = require('../utils/database');

const Tweet = sequelize.define('tweet',{
    _id:{
        type: Sequelize.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    isreply:{
        type: Sequelize.BOOLEAN,
        defaultValue: false
    },
    replyingto:{
        type: Sequelize.ARRAY(Sequelize.STRING)
    },
    text:{
        type: Sequelize.STRING,
        allowNull: false
    },
    image:{
        type: Sequelize.STRING,
        defaultValue: null
    },
    video:{
        type: Sequelize.STRING,
        defaultValue: null
    },
    reply_cnt:{
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    likes:{
        type: Sequelize.BIGINT,
        defaultValue: 0
    }
});

module.exports = Tweet;