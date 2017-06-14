var makePayment = function(userPayload,loggedInUser,callback){
//console.log(userData);
var userDataToSend=null;
  if(loggedInUser.customerID){
var userData= null;
    async.series([
        function (cb) {
          var criteria={
            '_id':new mongoose.Types.ObjectId(userPayload.fromid)
          };
          Service.ServiceproviderService.getSp(criteria,function(err,spData){
            if(err){
              cb(err);
            }else{

          if(!spData.recipientID || !spData.bankID){
            cb(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.SP_ACCOUNT_DOES_NOT_EXISTS);
          }else{
              userData=spData;
              cb();
            }
            }
          });

        },
        function(cb){
          var amnt=parseFloat(userPayload.amount)*100;
          var paymentObj={
            currency: "usd",
            amount: amnt, // amount in cents, again
            customer: loggedInUser.customerID
          };
          if(userPayload.card && userPayload.card!==""){
            paymentObj.card=userPayload.card
          }
          stripe.charges.create(paymentObj,function(err,charge){
            if(err){


              cb(err);
            }else{
              userDataToSend=charge;
              var criteria={
                '_id':new mongoose.Types.ObjectId(userPayload.workorder)
              };
              var setQuery={
                $set:{
                  status:'ACCEPTED',
                  deposit:{
                    amount:charge.amount,
                    cardID:charge.source.id,
                    paymentSuccess:true,
                    chargeID:charge.id
                  },
                  readSp:0
                }
              };
              var options= {new:true};
              Service.WorkorderService.updateWorkOrder(criteria,setQuery,options,function(err,res){
                if(err){
                  cb(err)
                }else{
                  if(res && res.requestid){
                    Service.WorkrequestService.updateWorkRequest({'_id':mongoose.Types.ObjectId(res.requestid._id)},{'workorderStatus':true},{new:true},function(err,rql){
                      if(err){
                        console.log(err);
                      }else{
                        console.log(rql);
                      }
                    });
                  }

                  Service.ServiceproviderService.getDeviceToken({'_id':new mongoose.Types.ObjectId(res.from._id)},function(err,us){
                    if(err){
                      console.log(err);
                    }
         var pushData={};
         pushData["workorder"]=res._id;
         var msg= loggedInUser.name +" has accepted your work order";
                    pushController.SendSPAndroidPush(us.deviceToken,Config.APP_CONSTANTS.DATABASE.NOTIFICATION_TYPES.WORKORDER,msg,pushData,function(err,data){
                      if(err){
                        console.log(err);
                      }else{
                        console.log(data);
                      }
                    });
                    pushController.IOSPushSP(us.deviceToken,Config.APP_CONSTANTS.DATABASE.NOTIFICATION_TYPES.WORKORDER,msg,pushData,msg,function(err,data){
                      if(err){
                        console.log(err);

                      }else{
                        console.log(data);
                      }
                    });
                  });

                  userDataToSend=res;
                  if(userDataToSend.requestid && userDataToSend.requestid.category)
                  {
                  var criteria={
                    '_id':{
                      $in:userDataToSend.requestid.category
                    }
                  };

                  var project={"categoryName":1,"_id":0};
                  Service.ServiceCategories.getCategories(criteria,project,function(err,cats){
                    if(err){
                      cb(err);
                    }else{


                      userDataToSend.requestid.categories=cats;

                        cb();
                    }
                  })
}else{
  cb();
}

                }
              });



          }
        });
},function(cb){
  console.log(userDataToSend);
  if(userDataToSend.from && userDataToSend.from.reviews){
    userDataToSend.ratings=UniversalFunctions.getAverageAndTotalRatings(userDataToSend.from.reviews);
    console.log(userDataToSend.ratings);
    cb();
  }else{
    cb();
  }
},function(cb){
  if(userDataToSend.from.serviceCategories){
    cb();
  }else{
  if(userDataToSend.from && userDataToSend.from.services){
    var criteria={
      '_id':{
        $in:userDataToSend.from.services
      }
    }
 var project={"categoryName":1,"_id":0};
Service.ServiceCategories.getCategories(criteria,project,function(err,cats){
    if(err){
    cb(err);
  }else{
    userDataToSend.from.serviceCategories=UniversalFunctions.getCommaSeperatedCategoryNames(cats);
    cb();
  }
});
}else{
  cb()
}
}
},function(cb){
  delete(userDataToSend.requestid.category);
  delete(userDataToSend.from.services);
  cb();
}
    ], function (err, results) {
        if (err) {
            callback(err)
        } else {
            callback(null, userDataToSend)
        }
    });


  }else{
callback(UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.NO_CARD_FOUND);

  }



}