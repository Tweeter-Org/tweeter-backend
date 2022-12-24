const Sequelize = require('sequelize');
const {sequelize} = require('../utils/database');

const Tweet = sequelize.define('tweet',{
    _id:{
        type: Sequelize.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
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
    // likes:{
    //     type: Sequelize.BIGINT,
    //     defaultValue: 0
    // }
});

module.exports = Tweet;