var Poll=require('../model/poll').Poll;
var Boom=require('boom');
var mongoose=require('mongoose');

exports.getPolls={
  auth:'session',
  handler:function(request,reply){
    Poll.find({},function(err,poll){
      if(err)
          return reply(Boom.badImplementation());

          reply.view('polls',{'polls':poll});
    });
  }
}
exports.voteAnswer=function(request,reply){

//console.log(request.auth.credentials);
  Poll.findById(request.payload.questionID).exec(function(err,doc) {
      if(err) return Boom.badImplementation("This sucks");
          var answer=doc.answers.id(request.payload.answerId);
        answer.votes=parseInt(answer.votes)+1;
        answer.voters.push(request.auth.credentials._id);

        doc.save(function(err,doc){
          if(err) Boom.badImplementation("fts");
          reply({'doc':doc,'ans':answer.votes});
        });


    });

};
