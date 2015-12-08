var Hapi =require('hapi'),
    Routes=require('./routes/routes'),
    Config=require('./config/config'),
    Path=require('path'),
    Hoek=require('hoek'),
    Db = require('./config/db'),
    Basic=require('hapi-auth-basic'),
    Ejs=require('ejs');
var Inert = require('inert');
var User=require('./model/user').User;

var app={};

app.config=Config;

var server=new Hapi.Server();

Ejs.registerHelper = function (name, fn) {
    Ejs.filters[name] = fn;
};

server.register(require('vision'),function(err){
  Hoek.assert(!err,err);
  server.views({
    engines:{
      ejs:Ejs
    },
    relativeTo:__dirname,
    path:'templates',
    helpersPath:'./templates/helpers'
  });
});

server.connection({port:app.config.server.port});

server.register(Inert, function () {});

server.register(require('hapi-auth-cookie'), function (err) {

    server.auth.strategy('session', 'cookie', {
        password: 'secret',
        cookie: 'pollingAPP',
        redirectTo: '/login',
        isSecure: false,
       
        
    });
});

server.route(Routes.endpoints);



server.start(function(){
  console.log("Server started at ",server.info.uri);
});
