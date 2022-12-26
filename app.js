const express = require('express');
const {sequelize} = require('./utils/database');
const authRoutes = require('./routes/authRoutes');
const tweetRoutes = require('./routes/tweetRoutes');
const User = require('./models/userModel');
const Tweet = require('./models/tweetModel');
const Otp = require('./models/otpModel');
const {getGoogleAuthURL,googleAuth} = require('./utils/google');
const fs = require('fs');
if (!fs.existsSync('./uploads'))
  fs.mkdirSync('./uploads');
require('dotenv').config();
const app = express();
const cors=require('cors');
const Likes = require('./models/Likes');
app.use(cors({origin:true}));
app.use(express.json());

// Associations
Tweet.belongsTo(User,{constraints:true,onDelete:'CASCADE'});
User.hasMany(Tweet);

Tweet.belongsToMany(User, { through: Likes });
User.belongsToMany(Tweet, { through: Likes });

const connectdb = async ()=>{
    try {
        const result = await sequelize.sync();
        console.log('DB Connection has been established successfully.');
        app.listen(process.env.PORT);
        console.log(`Listening on port ${process.env.PORT}`);
      } catch (err) {
        console.error('Unable to connect to the database:', err);
      }
}
connectdb();

app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static('uploads'));

app.use('/t',tweetRoutes);

app.get('/auth/google/url',(req,res)=>{
    return res.send(getGoogleAuthURL());
});

app.get('/auth/google',async (req,res)=>{
  try{
    const code = req.query.code;
    const result = await googleAuth(code);
    if(result.success == true)
      return res.status(200).json(result);
  }catch(err){
    console.log(err);
    const statusCode = 500;
    return res.status(statusCode).json({success:false,msg:err});
  }
});

app.use(authRoutes);
