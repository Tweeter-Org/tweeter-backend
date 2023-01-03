const nodemailer = require('nodemailer');

const sendmail = async (email,otp) => {
    const msg = {
        from: 'Tweeter"spaces.inc.si@gmail.com"',
        to: email,
        subject: `${otp} is your OTP from Tweeter`,
        html: `
        <div
          class="container"
          style="max-width: 90%; margin: auto; padding-top: 20px"
        >
          <center><h2>Welcome to <span style="color:green;">Tweeter!</span></h2></center>
          <h3>We are glad to have you.</h3>
          <p style="margin-bottom: 30px;">Please enter this OTP to proceed further</p>
          <h1 style="font-size: 40px; letter-spacing: 2px; text-align:center; color:green;">${otp}</h1>
     </div>
      `,
    }

    const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth:{
                user: process.env.MAIL_ID,
                pass: process.env.MAIL_PASS
            },
            port: 456,
            host: "smtp.gmail.com"
    });

    transporter.sendMail(msg,err=>{
        if(err){ 
          console.log(err);
          return false
        } 
        else {
          console.log("mail sent");
          return true;
        }
    });
}

module.exports = {sendmail};