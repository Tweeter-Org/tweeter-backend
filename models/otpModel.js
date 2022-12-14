const Sequelize = require('sequelize');
const {sequelize} = require('../utils/database');

const Otp = sequelize.define('otp',{
  _id:{
    type: Sequelize.BIGINT,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  otp:{
    type: Sequelize.INTEGER,
    allowNull: false
  },
  expiry:{
    type: Sequelize.BIGINT
  },
  user_name:{
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false
  },
  password:{
    type: Sequelize.STRING
  }
});


module.exports= Otp;
