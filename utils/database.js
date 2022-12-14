const Sequelize = require('sequelize');
const pg = require('pg');
require('dotenv').config();




const sequelize = new Sequelize(
    process.env.DATABASE,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        dialect: 'postgres',
        host: 'localhost'
    }
);

module.exports = {
    sequelize
};