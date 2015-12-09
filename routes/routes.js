var User = require('../model/user');
var Poll = require('../controllers/poll');
var UserCont=require('../controllers/user');
var AdminCont=require('../controllers/admin');
var Bcrypt=require('bcrypt');
var Boom = require('boom');
var path = require('path');



module.exports.endpoints=[

  { method:'GET',path:'/',handler:function(request,reply){reply.view('index')} },

  { method:'POST',path:'/votePoll',config:{auth:'session'},handler:Poll.voteAnswer },

  { method:'GET',path:'/login',handler:function(request,reply){ 
      
        

      reply.view('login',{message:message})} },

  { method:'GET',path:'/verifymail/{token?}',handler:UserCont.verifyMail },

  { method:'POST',path: '/login',config: {handler: UserCont.login,auth: {mode: 'try',strategy: 'session'},plugins: {'hapi-auth-cookie': {redirectTo: false}}} },

  { method: 'GET',path: '/logout',config: {handler: UserCont.logout,auth: 'session'} },

  { method:'GET',path:'/signup',handler:function(request,reply){reply.view('signup');} },

  {method:'GET',path:'/admin',config:{ auth:'session', handler:function(request,reply){ if(request.auth.credentials.role!==1){
    return reply(Boom.forbidden("You are not authorized to acess this page!"));
  }reply.view('admin/dashboard');}}},

  { method:'GET',path:'/admin/new/poll',config:{ auth:'session',handler:AdminCont.newPoll } },

  { method:'POST',path:'/admin/new/poll',config:{ auth:'session',handler:AdminCont.addNewPoll } },

  { method:'GET',path:'/admin/polls',config:{ auth:'session',handler:AdminCont.polls } },

  { method:'POST',path:'/signup',config: UserCont.create },

  { method:'GET',path:'/profile',config:{ auth:'session' },handler:UserCont.profile },

  { method:'POST',path:'/saveprofile',config:UserCont.saveProfile },

  { method:'GET',path:'/polls',config:Poll.getPolls },

  { method: 'POST',path: '/fileup',config: { payload:{ maxBytes: 209715200,output:'stream',parse: true },handler: UserCont.picChange} },

  { method: 'GET',path: '/uploads/{param1*}',handler: { directory: { path: path.resolve(path.dirname(require.main.filename),'uploads'),listing:true } } },

  { method: 'GET',path: '/public/{param*}',config:{auth:'session',handler:{ directory: { path: path.resolve(path.dirname(require.main.filename)
    ,'public'),listing:true } } } },


  { method:'GET', path: '/forgotpassword', handler:UserCont.forgotPassword },

  { method: 'POST', path :'/forgotpassword', config:UserCont.sendResetLink },

  { method:'GET', path:'/resetpassword/{token?}', handler:UserCont.resetPass },

  { method: 'POST', path: '/resetpassword/{token?}', config : UserCont.changePassword },
]
