//如果你有一个经常使用vitex的项目，你应该做进一步的封装
//避免配置文件每次都输入
var vitex = require('../');
var mongodb = [{  
        host: "127.0.0.1" ,  
        port: "27017" ,  
        database: "xxx",  
        replicaSet:"",//集群名  
        username:"",  
        password:""  
    }];

module.exports = function(dc){
	return vitex(dc,{mongodb:mongodb});
}