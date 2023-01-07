const Sequelize = require('sequelize');
const {sequelize} = require('../utils/database');

const Reply = sequelize.define('reply',{
    id:{
        type: Sequelize.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    replyingto:{
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false
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
    likes:{
        type: Sequelize.BIGINT,
        defaultValue: 0
    }
});

module.exports = Reply;