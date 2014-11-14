vitex
=====
This is a project being developed
a sql like wraper use model.from('collection').where('_id',id).find()    
本项目是基于[node-mongodb-native](https://github.com/mongodb/node-mongodb-native)模块,因此您需要先安装此依赖

#INSTALL

下载文件 放入您的项目中

#示例
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

auto

#API



