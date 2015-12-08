'use strict';
var Mongoose=require('mongoose');
var Schema = Mongoose.Schema;
var bcrypt = rquire('bcrypt');

var AuthSchema= new Schema({
	email : {type:String, unique:true ,required:true},
	ip : {type:String },
	attempts: {type:Number},
	lastAttempt:{type:Date,default:Date.now},
	isLocked :{type:Boolean,default:false}
})