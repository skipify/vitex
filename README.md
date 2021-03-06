vitex
=====
	This encapsulates an native-mongodb interface，like model.from('collection').where('_id',id).find()

#INSTALL

> npm install vitex

#Sample
	var Vitex = require('vitex');  
	var model = Vitex('collection',{file:'./config'});  
	model.where("_id",id).find(function(err,docs){  
	    console.log(docs);  
	})
	
	 model.save({name:1,pass:"123456"},function(err,result){
		console.log(result);
	})
 

#SETTING

## is Object：

	1.`file` Mongodb config file require(file)  
	2.`mongodb` Mongodb config，The setting of higher priority file
	3.`autoInc`  _id is an auto  Increment Default:True 
	** is String **  
	4.`dc` 
	Persisted, a collection of name will not be lost because the query is completed will be automatically applied when does not specify the from dc

## mongodb：

	mongodb: [{  
	    host: "127.0.0.1" ,  
	    port: "27017" ,  
	    database: "xxx",  
	    replicaSet:"",//集群名  
	    username:"",  
	    password:""  
	}]

##file：

	module.exports = {  
	    mongodb: [{  
	        host: "127.0.0.1" ,  
	        port: "27017" ,  
	        database: "xxx",  
	        replicaSet:"",  
	        username:"",  
	        password:""  
	    }]  
	}



#API  
base on:  

	var Vitex = require("vitex");  
	var model = Vitex("col",{file:'./config'});

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
### like
	@param key string 字段
	@param val string/regexp 字符串或者正则表达式
	模糊查询，


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
### set
	@param string/object  
	@param string/object  
	设置update时修改的字段  
	eg:    
	vitex.set('username',"skipify")  
	vitex.set({username:"skipify","password":"123456"});

### find
	@param function 回调函数
	@param boolean  是否输出explain信息
	查询信息
	** 这里有一个注意事件，如果调用了where方法，然后调用 find方法，那么查询条件将会缓存下来供给count方法直接无条件调用 **
	model.find(function(err,docs){
		console.log(docs);
	})
	
### count  
	@param function 回调函数
	按照条件查询符合条件的数目 注意find方法的说明
	model.count(function(err,num){
		console.log(num);
	})

### findOne
	同find,此方法返回的 doc是单条信息

### remove
	@param object/function 删除信息的配置项/回调函数，参考mongodb-native接口
	@param function 回调
	
	删除信息
	model.remove(function(err,result){

	})

### removeOne
	同remove 删除一条信息

### save
	@param object 要保存的对象记录
	@param object/function 配置项/回调函数，配置项参考mongodb-native接口
	@param function 回调函数
	model.save({a:1},function(err,result){
		
	})

### update
	@param object 要保存的对象记录
	@param object/function 配置项/回调函数，配置项参考mongodb-native接口
	@param function 回调函数
	model.update({a:1},function(err,result){
	})
	
	model.update({a:{$inc:{step:1}}},function(err,result){

	})

### updateOne
	同update，修改一条信息	

### page
	@param int 页数
	@param int 每页条数
	@param function 回调函数 {total:num,data:docs}
	
	一个组合类的方法，此方法用于查询分页的快捷方式，注意返回的数据信息中包含符合条件的总条数
	model.page(2,20,function(err,data){
		console.log("num："+data.total);
		console.log(data.data);
	})

### dropCollection
	@param string 要删除的集合名
	@param function
	
	model.dropCollection('users',function(err,result){})

### close
	关闭连接
	model.close();

## 快捷方式

### findById
	@param int 要查询的ID
	@param function 回调
	model.findById(1,function(err,doc){
	})
### removeById
	@param int 要删除的ID
	@param function 回调
	model.removeById(1,function(err,result){
	})

## 调用原生接口
### exec

	此方法可以直接调用[node-mongodb-native](https://github.com/mongodb/node-mongodb-native)接口的问题。
	model.exec(function(db){
		db.collection('test').ensureIndex('ee',{step:1},function(err,indexName){
			console.log(indexName);
		})
		//db 可以使用
	});
### mongodb
	此方法是个类方法，他返回node-mongodb-native的接口对象，相当于 require("mongodb");