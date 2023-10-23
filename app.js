const express = require('express');
const cloudinary = require('cloudinary').v2;
const fileUpload = require('express-fileupload')
const {sequelize} = require('./utils/database');
const authRoutes = require('./routes/authRoutes');
const tweetRoutes = require('./routes/tweetRoutes');
const profileRoutes = require('./routes/profileRoutes');
const replyRoutes = require('./routes/replyRoutes');
const chatRoutes = require('./routes/chatRoutes');
const {
  Bookmarks,
  Chat,
  Chatrel,
  Follow,
  Likes,
  Message,
  Notification,
  Tag,
  Tweet,
  User
} = require('./models');
const nodeCron = require("node-cron");
const nodecron = require('./utils/cleandb');
const {getGoogleAuthURL,googleAuth} = require('./utils/google');
require('dotenv').config();
const app = express();
const cors=require('cors');
app.use(cors({origin:true}));
app.use(express.json());
app.use(fileUpload({
  useTempFiles:true,
  limits:{fileSize: 10*1024*1024}
}));
cloudinary.config({ 
  cloud_name: 'dov6iolx4', 
  api_key: '266736621665225', 
  api_secret: 'sJ9QzdCBIDP-1OVnoIw-dFCtZew' 
});
// Associations
Tweet.belongsTo(User,{constraints:true,onDelete:'CASCADE'});
User.hasMany(Tweet);

Tweet.belongsToMany(User, { through: Likes , onDelete:'CASCADE'});
User.belongsToMany(Tweet, { through: Likes });

Tweet.belongsToMany(User, { through: Bookmarks , onDelete:'CASCADE'});
User.belongsToMany(Tweet, { through: Bookmarks });

User.belongsToMany(User,{as:'follower',through: Follow,onDelete:'CASCADE'});

Tweet.belongsTo(Tweet,{as:'retweet'});

Tweet.belongsToMany(Tag,{through:'tweettag'});
Tag.belongsToMany(Tweet,{through:'tweettag',onDelete:'CASCADE'});

User.belongsToMany(Chat,{through: Chatrel});
Chat.belongsToMany(User,{through: Chatrel, onDelete:'CASCADE'});

Message.belongsTo(Chat,{constraints:true,onDelete:'CASCADE'});
Chat.hasMany(Message);

Message.belongsTo(User);
User.hasMany(Message);

Tweet.hasMany(Tweet,{sourceKey:'_id',foreignkey:'tweetId'});

Message.belongsTo(Tweet,{constraints:true,onDelete:'CASCADE'});

Notification.belongsTo(User,{constraints:true,onDelete:'CASCADE'});

Notification.belongsTo(Tweet,{constraints:true,onDelete:'CASCADE'});

const connectdb = async ()=>{
    try {
        const result = await sequelize.sync();
        console.log('DB Connection has been established successfully.');
        const server = app.listen(process.env.PORT);
        console.log(`Listening on port ${process.env.PORT}`);
        const io = require('socket.io')(server,{
          cors:{
            origin:'*'
          }
        });
        io.on('connection',(socket)=>{
          require('./utils/socket').init(socket);
        });
        const job = nodeCron.schedule("*/30 * * * *", () => {
          nodecron.cleanDB();
          console.log("called");
        });
      } catch (err) {
        console.error('Unable to connect to the database:', err);
      }
}
connectdb();

app.use(express.static(__dirname + '/public'));
app.use('/uploads', express.static('uploads'));

app.get('/auth/google/url',(req,res)=>{
    return res.send(getGoogleAuthURL());
});

app.get('/auth/google',async (req,res)=>{
  try{
    const code = req.query.code;
    const result = await googleAuth(code);
    if(result && result.success == true)
      return res.status(200).json(result);
    else
      return res.status(500).json({success:false,msg:'Server Error'});
  }catch(err){
    console.log(err);
    const statusCode = 500;
    return res.status(statusCode).json({success:false,msg:err});
  }
});

app.use('/c',chatRoutes);
app.use('/t',tweetRoutes);
app.use('/p',profileRoutes);
app.use('/r',replyRoutes);
app.use(authRoutes);