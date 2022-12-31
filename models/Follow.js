const Sequelize = require('sequelize');
const {sequelize} = require('../utils/database');
const User = require('./userModel');


const Following = sequelize.define('following',{
        follower: {
            type: Sequelize.STRING,
            references: {
                model: User,
                key: 'user_name'
            }
        },
        following: {
            type: Sequelize.STRING,
            references: {
                model: User,
                key: 'user_name'
            }
        }
},{timestamps:false});


module.exports = Following;