var vitex = require('../');

vitex('infos',{file:__dirname + '/config'}).find(function(err,doc){
	console.log(doc);
})

vitex({file:__dirname + '/config'}).from('infos').find(function(err,doc){
	console.log(doc);
})