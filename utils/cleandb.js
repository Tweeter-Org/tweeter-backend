const Otp = require('../models/otpModel');
const { Op } = require('sequelize');


const  cleanDB = async () => {
    try{
        const delotp = await Otp.destroy({
            where:{
                expiry:{
                    [Op.lt]:Date.now()
                }
            }
        })
        // if(delotp){
        //     console.log("deleted");
        // }
    } catch(err){
        console.log(err);
    }
}

module.exports = {cleanDB};