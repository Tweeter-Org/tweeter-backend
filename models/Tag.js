const Sequelize = require('sequelize');
const {sequelize} = require('../utils/database');

const Tag = sequelize.define('tag',{
    id:{
        type: Sequelize.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    hashtag:{
        type: Sequelize.STRING,
        unique:true,
        allowNull: false
    },
    tweet_cnt:{
        type: Sequelize.BIGINT,
        defaultValue: 1
    }
});

module.exports = Tag;