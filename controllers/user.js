var Joi       =   require('joi');
var Boom      =   require('boom');
var User      =   require('../model/user').User;
var Mongoose  =   require('mongoose');
var bcrypt    =   require('bcrypt');
var sendMail  =   require('./verifymail');
var fs        =   require('fs');
var path      =   require('path');


exports.create    =   {
    validate:{
            payload:{
              email:Joi.string().required(),
              password:Joi.string().required(),
              name:Joi.string().required()
            }
    },
    handler:function(request,reply){
              User.find({},function(err,results){


              var salt = bcrypt.genSaltSync(10);

              request.payload.password=bcrypt.hashSync(request.payload.password, salt);
              request.payload.token=bcrypt.hashSync(request.payload.email,10);
              var user=new User(request.payload);
              if(results.length==0){
                 user.role=1; 
                }
              user.save(function(err,user){
                if(!err){
              
                 sendMail(user.email,user.token,request.server.info.uri);


                  return reply.view('login',{message:"Please check your mail for email-verification link"});

                }
                if(err.code===11000 || err.code===11001 )
                    return reply.view('signup',{'message':"Please provide another user id, it already exists."});
                return reply(Boom.badImplementation());
              });

    });

  }
}

exports.login = function(request,reply){
    if(request.auth.isAuthenticated){
       //return reply.redirect('/profile')
    }



    User.findOne({'email':request.payload.email},function(err,user){
        if(err)
          return reply(Boom.badImplementation());
          if(!user)
          return reply.view('login',{"message":"There is no account by this email ID"});

      bcrypt.compare(request.payload.password, user.password, function(err, isValid){

       if(err) return reply(Boom.forbidden(err));

       if(!isValid) return reply.view('login',{"message":"Incorrect email or password"});

       request.auth.session.set(user);
        if(request.payload.remember=='on'){
          request.auth.session.ttl(7*24*60*60*1000);
        }
       //console.log(request);

       return reply.redirect('/profile');

   });


    });
  };

exports.verifyMail=function(request,reply){
  var token = request.params.token || encodeURIComponent(request.params.token);


  User.findOne({'token':token},function(err,token){
     if(err)
        return Boom.badImplementation();
        if(!token)
        return Boom.forbidden("Invalid token.");

        token.verified=1;
        token.save(function(err,token){
          if(token){

          return   reply.redirect('/login');
          }
        });
   });

};

exports.picChange=function (request, reply) {
  var dirName=new Date().getTime();

    fs.mkdirSync(path.resolve(path.dirname(require.main.filename),'uploads',dirName.toString()));
    uploadDir=path.resolve(path.dirname(require.main.filename),'uploads',dirName.toString());

    var avatarUrl=request.server.info.uri+'/uploads/'+dirName+'/'+request.payload['profilepic'].hapi.filename;
    var uploadPath=fs.createWriteStream(uploadDir+'/'+request.payload['profilepic'].hapi.filename);

    request.payload["profilepic"].pipe(uploadPath);
    request.payload["profilepic"].on('end',function(er,pho){
          request.payload["profilepic"].unpipe(uploadPath);
         
          

          User.findOne({'email':request.payload.email},function(err,user){
            if(err)
              return Boom.badImplementation("There was some error while uploading the profile pic");
                if(user){

                      user.avatar=avatarUrl;
                      user.save(function(err,user){
                            if(err){
                                return Boom.badImplementation("There was some error while uploading the profile pic");
                            }
                            return reply.redirect('/profile');
                      });
                }
                 return Boom.badImplementation("There was some error while uploading the profile pic");
          });

      });

};

exports.profile = function(request,reply){

  var userId=request.auth.credentials.email;
 var error = request.session.flash('error') || '';
  User.findOne({'email':userId},function(err,userdata){
    if(err) return Boom.forbidden("You are not authorized to access this page!!");
    if(!userdata) return Boom.forbidden("There was some error while loggin you in!");
    return reply.view('profile',{user:userdata});
  });



};

exports.saveProfile={
  validate:{
    payload:{
      email:Joi.string().email().required(),
      userId:Joi.string().required(),
      name:Joi.string().required(),
      city:Joi.string().allow(''),
      state:Joi.string().allow(''),
      country:Joi.string().allow(''),
      phone:Joi.string().allow('')
    },
    failAction: function (request, reply, source, error) {
        request.session.flash('error', 'There was an error.');
       return reply.redirect('/profile')
    }
  },
 
    
  handler:function(request,reply){
      var uid=request.payload.userId;
      User.findOne({'email':uid},function(err,usr){
            if(err)
                return Boom.badImplementation("User does not exits");
            if(!usr)
                return Boom.forbidden("Unauthorized action");
            var emailChanged=false;
            usr.name=request.payload.name;
            usr.city=request.payload.city;
            usr.country=request.payload.country;
            usr.state=request.payload.state;
            usr.phone=request.payload.phone;
            if(usr.email!==request.payload.email){ emailChanged=true;
            usr.email=request.payload.email;usr.verified=0;
            usr.token=bcrypt.hashSync(request.payload.email,10);
          }

            if(emailChanged==true){
                User.findOne({'email':request.payload.email},function(err,em){
                  if(err) return Boom.forbidden("This email already exists.Choose another one");
                  if(em) return Boom.forbidden("This email already exists.Choose another one");

                });
            }
            usr.save(function(err,usrd){
                console.log(request.session.messg);
                  if(err || !usrd) return Boom.badImplementation("Could not save profile info");
                  if(emailChanged==true)  sendMail(usrd.email,usrd.token,request.server.info.uri);
                  request.auth.session.clear();
                  request.auth.session.set(usrd);
                  reply.redirect('/profile');

            });
      });

  }

};

exports.logout =function(request,reply){
    request.auth.session.clear();
    reply.redirect('/login');
  };

  exports.forgotPassword = function(request,reply){
      return reply.view('forgotpassword');
  }

  exports.sendResetLink = {
      validate:{
        payload:{
          email:Joi.string().email().required()
        }
      },
      handler:function(request,reply){
        var email=request.payload.email;
        email=email.toLowerCase();
        User.findOne({'email':email},function(err,user){
            if(err){
              return Boom.badImplementation("There was some error while processing your request!");
            }
            if(!user){
              return reply.view('forgotpassword',{'message':'There is no user with this email'});
            }
            sendMail(user.email,user.token,request.server.info.uri,true);
            return reply.view('forgotpassword',{'message':'A link to reset your password has been sent to your email address.'});
        });
      }

  }

  exports.resetPass = function(request,reply){

    var token = request.params.token || encodeURIComponent(request.params.token);


  User.findOne({'token':token},function(err,token){
     if(err){
        return Boom.badImplementation();
      }
        if(!token){
        return Boom.forbidden("Invalid token.");
        }
       return reply.view('resetpassword',{user:token._id});
   });
  };

  exports.changePassword = {
    
    validate :{

      payload:{

        uid : Joi.string().required(),

        password:Joi.string().required(),
        
        cpassword:Joi.string().required()
      }

    },

    handler:function(request,reply){

      var password=request.payload.password;

      var cpassword=request.payload.cpassword;

      var uid=request.payload.uid.trim;

      if(password.trim()!==cpassword.trim()){
        return reply.view('resetpassword',{'message':'Password you entered do not match!!!'});
      }
      User.findOne({'_id':uid},function(err,user){
        if(err){
          return reply.view('resetpassword',{'message':'There was some error while resetting password'});
        }
        if(!user){
          return reply.view('resetpassword',{'message':'There was some erorr while resetting password'});
        }
        var salt = bcrypt.genSaltSync(10);

        password=bcrypt.hashSync(password, salt);

        user.password=password;

        user.save(function(err,user){
          if(err){
            
            return reply.view('resetpassword',{'message':'Your password could not be reset.Try again later'});

          }
          return reply.view('/login',{'message':'Your password has been reset.'});
        });
              

      });

    }
  }

