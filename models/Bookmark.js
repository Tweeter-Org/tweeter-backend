const Sequelize = require('sequelize');
const {sequelize} = require('../utils/database');
const Tweet = require('./tweetModel');
const User = require('./userModel');


const Bookmarks = sequelize.define('bookmark',{
        tweetId: {
            type: Sequelize.BIGINT,
            references: {
                model: Tweet,
                key: '_id'
            }
        },
        userId: {
            type: Sequelize.BIGINT,
            references: {
                model: User,
                key: '_id'
            }
        }
},{timestamps:false});


module.exports = Bookmarks;