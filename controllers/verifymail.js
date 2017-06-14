module.exports=function(email,token,url,resetLink){
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
var message="";
var subject="";
  if(typeof(resetLink)==='undefined'){
 subject+="Verify your email";
 message+="Welcome to PollingApp. Please click on the following link to verify your email address. ";
 message+=url+'/verifymail/'+encodeURIComponent(token);
}
else{
subject+="Reset your password";
message+="Please click on "+url+'/resetpassword/'+encodeURIComponent(token); +" to reset your password";

}
transport.sendMail({
   from: "Ankit Bahuguna <ankit.bahuguna@clicklabs.co>",
   to: "Ankit Bahuguna <"+email+">",
   subject: subject,
   text: message
}, function(error, response){
   if(error){
       console.log(error);
   }else{

   }
});
}
