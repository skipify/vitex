var vitex = require('../');

var setting = {mongodb:[{  
    host: "127.0.0.1" ,  
    port: "27017" ,  
    database: "xxx",  
    replicaSet:"",//集群名  
    username:"",  
    password:""  
}]}

vitex('infos',setting).save({name:"vitex",description:'this is a mongodb '},function(err,result){

})