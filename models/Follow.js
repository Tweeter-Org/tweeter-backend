const Sequelize = require('sequelize');
const {sequelize} = require('../utils/database');
const User = require('./userModel');


const Follow = sequelize.define('following',{
        
},{timestamps:false});


module.exports = Follow;