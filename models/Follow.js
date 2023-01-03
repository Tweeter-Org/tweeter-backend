const {sequelize} = require('../utils/database');


const Follow = sequelize.define('following',{
        
},{timestamps:false});


module.exports = Follow;