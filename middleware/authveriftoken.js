const jwt = require("jsonwebtoken");
const { User } = require('../models');


const auth1 = async (req,res,next)=>{
  try{
      let token=req.headers['accesstoken'] || req.headers['authorization'];
      
      if(!token)
        return res.status(401).json({sucess:false,msg:"Please login or signup before proceeding"});
      else{
        token = token.replace(/^Bearer\s+/, "");
        const verify = jwt.verify(token,process.env.jwtsecretkey1,async (err,payload)=>{
          if(err){
            return res.status(400).json({sucess:false,msg:"Invalid or Expired Token"});  
          }
          const {_id}=payload;
          console.log(payload);
          const user = await User.findByPk(_id);
          if(!user) return res.status(404).json({status:false,msg:"Failed to find user from token."});
          req.user=user;
          next();
        });
      }
    } catch(err){
        //console.log(err);
        return res.status(501).json({success:false,msg:`${err}`});
    }
  }

  const auth2 = async (req,res,next)=>{
    try{
        let token=req.headers['accesstoken'] || req.headers['authorization'];
        
        if(!token)
          return res.status(401).json({sucess:false,msg:"Please login or signup before proceeding"});
        else{
          token = token.replace(/^Bearer\s+/, "");
          const verify = jwt.verify(token,process.env.jwtsecretkey2,async (err,payload)=>{
            if(err){
              return res.status(400).json({sucess:false,msg:"Invalid or Expired Token"});  
            }
            const {_id}=payload;
            console.log(payload);
            const user = await User.findByPk(_id);
            if(!user) return res.status(404).json({status:false,msg:"Failed to find user from token."});
            req.user=user;
            next();
          });
        }
    } catch(err){
      //console.log(err);
      return res.status(501).json({success:false,msg:`${err}`});
    }
  }

  module.exports=  {
    auth1,
    auth2
  };
  