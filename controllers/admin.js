var Poll=require('../model/poll').Poll;
var Boom=require('Boom');



exports.newPoll=function(request,reply){

  reply.view('admin/newpoll');

};

exports.polls=function(request,reply){
Poll.find({},function(err,polls){
  if(err)
    return Boom.badImplementation("There was some error while processing your request");
  if(!polls)
    return Boom.forbidden("Could not access polls data");
    reply.view('admin/polls',{polls:polls});
});

};

exports.addNewPoll=function(request,reply){
var newpoll={

};
  newpoll.question=request.payload.question;
  newpoll.answers=[];
  for(var i=0;i<request.payload.answers.length;i++)
    newpoll.answers.push({title:request.payload.answers[i],votes:0,voters:[]});

 var poll=new Poll(newpoll);
 poll.save(function(err,pol){
   if(err)
   return Boom.badImplementation("Could not save the poll!!!");
   if(!pol) return Boom.forbidden("Could not save the question and answers");
   reply.view('admin/polls',{polls:pol,smessage:'Your poll was saved'});
 });

}
