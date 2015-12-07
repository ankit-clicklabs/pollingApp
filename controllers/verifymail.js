module.exports=function(email,token,url){
  var nodemailer = require("nodemailer");
  var Config=require('../config/config');

  var smtpTransport = require('nodemailer-smtp-transport');

  var transport = nodemailer.createTransport(smtpTransport({
      service: 'gmail',
      auth: {
          user: Config.mail.user,
          pass: Config.mail.pass
      }
  }));
var message="Welcome to PollingApp. Please click on following link to verify your email address. ";
message+=url+'/verifymail/'+encodeURIComponent(token);
transport.sendMail({
   from: "Ankit Bahuguna <ankit.bahuguna@clicklabs.co>",
   to: "Ankit Bahuguna <"+email+">",
   subject: "Verify your email",
   text: message
}, function(error, response){
   if(error){
       console.log(error);
   }else{

   }
});
}
