const Sequelize = require('sequelize');
const {sequelize} = require('../utils/database');
const Tweet = require('./tweetModel');
const User = require('./userModel');


const Likes = sequelize.define('like',{
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
});


module.exports = Likes;