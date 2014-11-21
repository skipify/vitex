var vitex = require('../');

vitex('infos',{file:__dirname+'/config'}).where('_id',1).update({$set:{name:'mongo'}},function(err,result){

})