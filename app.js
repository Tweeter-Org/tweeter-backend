const express = require('express');
const {sequelize} = require('./utils/database');
const authRoutes = require('./routes/authRoutes');
const User = require('./models/userModel');
const Otp = require('./models/otpModel');

const fs = require('fs');
if (!fs.existsSync('./uploads')){
  fs.mkdirSync('./uploads');
}

require('dotenv').config();

const app = express();

const cors=require('cors');

app.use(cors({origin:true}));

app.use(express.json());




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

app.use(authRoutes);