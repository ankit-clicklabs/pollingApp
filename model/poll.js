'use strict'

var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var PollSchema = new Schema({
  question: {type:String},

  answers: [{title:String , votes:Number,voters:[{id:{type:String}}]}],

  date :   {type:Date,default:Date.now}


});

var poll = mongoose.model('Poll',PollSchema);

module.exports={
  Poll:poll
};
