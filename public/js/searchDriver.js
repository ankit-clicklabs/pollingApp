const async = require ('async');

const Config = require('../Config');

const Service = require('../Service');

const DB = Config.APP_CONSTANTS.DATABASE.

function searchDriver(longLats,minRad,maxRad,callback)
{
    let criteria =  { currentLocation : { $nearSphere : { $geometry : { type : "Point" , coordinates : longLats }, $minDistance : minRad , $maxDistance : maxRad } },activeJob : { $exists : false } };

    let options = { lean:true};

    Service.CustomerService.getNearestDriver( criteria, projectionDriver, options, function( err, drivers )
    {
        if(err)
        {
            callback(err)
        }
        else
        {   
            callback(err,drivers)
        }
    } )
}  


module.exports =
{
    searchDriver
}