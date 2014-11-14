vitex
=====
	This is a project being developed  
	a sql like wraper use model.from('collection').where('_id',id).find()    

#INSTALL

> npm install vitex

#Sample
	var Vitex = require('vitex');  
	var model = new Vitex('collection');  
	model.where("_id",id).find(function(err,docs){  
	    console.log(docs);  
	})
	
	 model.save({name:1,pass:"123456"},function(err,result){
		console.log(result);
	})
 

#SETTING

##如果配置项是对象参数：

	1.settingFile Mongodb配置文件的地址 会调用 require(settingFile)  
	2.settingConfgig Mongodb的配置变量，此设置的优先级高于settingFile  
	3.autoInc  是否放弃使用Mongodb自己的ObjectId 方法使用一个从1开始的自增ID，默认是True
	** 如果配置项是字符串参数 **  
	4.dc 持久保存的集合名字，不会因为查询完毕而丢失当不指定from的时候会自动应用dc  

##数据库的配置文件格式：

	mongodb: [{  
	    host: "127.0.0.1" ,  
	    port: "27017" ,  
	    database: "xxx",  
	    replicaSet:"",//集群名  
	    username:"",  
	    password:""  
	}]

##文件配置：

	module.exports = {  
	    mongodb: [{  
	        host: "127.0.0.1" ,  
	        port: "27017" ,  
	        database: "xxx",  
	        replicaSet:"",//集群名  
	        username:"",  
	        password:""  
	    }]  
	}



#API  
以下示例基于  

	var Vitex = require("vitex");  
	var model = new Vitex("col");

## Method  
### endureCollection  
	@param string  
	设置默认集合名，保留集合 与构造时传递的第一个字符串参数作用一致  
	model.endureCollection('col');

### from  
	@param string  
	设置要查询的集合名，此设置会优先于endureCollection方法  
    model.from('user');

### where  
	@param object/string  
	设置查询的条件  
	model.where("_id",id)  
	model.where({_id:id})

### select  
	@param string/object/array  
	要查询的字段    
	model.select("_id")  
	model.select({_id:1})  
	model.select(["_id"])  

### limit  
	@param int  条数
	@param int  偏移跳过的条数 默认0
	查询条数和偏移skip  
	model.limit(15,10)  

### sort  
	@param object  
	排序字段设置  
	model.sort({age:-1,step:-1})  

### find
	@param function 回调函数
	@param boolean  是否输出explain信息
	查询信息
	model.find(function(err,docs){
		console.log(docs);
	})
	


