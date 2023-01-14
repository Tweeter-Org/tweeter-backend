const Sequelize = require('sequelize');
const {sequelize} = require('../utils/database');

const Message = sequelize.define('message',{
    _id:{
        type: Sequelize.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    text:{
        type: Sequelize.STRING
    },
    image:{
        type: Sequelize.STRING,
        defaultValue:null
    },
    video:{
        type: Sequelize.STRING,
        defaultValue:null
    }
});

module.exports = Message;