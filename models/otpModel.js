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
    type: Sequelize.STRING,
    allowNull: false
  },
  expiry:{
    type: Sequelize.BIGINT
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

module.exports= Otp;
