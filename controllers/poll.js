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


  Poll.findById(request.payload.questionID).exec(function(err,doc) {
      if(err) return Boom.badImplementation("There was some error while saving.Please try again after sometime.");

        var answer=doc.answers.id(request.payload.answerId);

        var voters=doc.answers.id(request.payload.answerId).voters;
       
      
          if(voters.indexOf(request.auth.credentials._id)!==-1){
              var indx=voters.indexOf(request.auth.credentials._id);
              voters.splice(indx,1);
              answer.votes=parseInt(answer.votes)-1;

          }
else{
        answer.votes=parseInt(answer.votes)+1;


        answer.voters.push(request.auth.credentials._id);
      }

        doc.save(function(err,doc){
          if(err) Boom.badImplementation("fts");
          reply({'doc':doc,'ans':answer.votes});
        });


    });

};
