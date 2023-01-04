const Sequelize = require('sequelize');
const pg = require('pg');
require('dotenv').config();



// const sequelize = new Sequelize(
//     process.env.PGDATABASE,
//     process.env.PGUSER,
//     process.env.PGPASSWORD,
//     {
//         dialect: 'postgres',
//         host: process.env.PGHOST,
//         port:process.env.PGPORT
//     }
// );

const sequelize = new Sequelize(process.env.DATABASE_URL,{
    logging:false
});

module.exports = {
    sequelize
};