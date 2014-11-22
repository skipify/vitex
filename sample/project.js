var vitex = require('./model');

vitex('infos').find(function(err,doc){
	console.log(doc);
})