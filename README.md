vitex
=====
This is a project being developed
a sql like wraper use model.from('collection').where('_id',id).find()    

#INSTALL

> npm install vitex

#Sample
> var Vitex = require('vitex');  
> var model = new Vitex('collection');  
> model.where("_id",id).find(function(err,docs){  
>    console.log(docs);  
>})

> model.save({name:1,pass:"123456"},function(err,result){
	console.log(result);
})
>
>  

#SETTING

Setting:
如果配置项是对象参数：
> settingFile Mongodb配置文件的地址 会调用 require(settingFile)
> settingConfgig Mongodb的配置变量，此设置的优先级高于settingFile
> autoInc  是否放弃使用Mongodb自己的ObjectId 方法使用一个从1开始的自增ID，默认是True
如果配置项是字符串参数
> dc 持久保存的集合名字，不会因为查询完毕而丢失当不指定from的时候会自动应用dc

数据库的配置文件格式：

>mongodb: [{  
    host: "127.0.0.1" ,  
    port: "27017" ,  
    database: "xxx",  
    replicaSet:"",//集群名  
    username:"",  
    password:""  
>}]

文件配置：
>module.exports = {  
    mongodb: [{  
        host: "127.0.0.1" ,  
        port: "27017" ,  
        database: "xxx",  
        replicaSet:"",//集群名  
        username:"",  
        password:""  
    }]  
>}

#API



