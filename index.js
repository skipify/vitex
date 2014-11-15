/*
	Name:vitex
	Author:skipify
	Version:0.0.1
	Email:skipify@qq.com
*/
var mongodb  = require('mongodb'),
	ObjectID = mongodb.ObjectID,
	mongodbConfig,
	_        = require('underscore');;
    _mdcache = {}; //链接缓存 global
var mongoOptions = {
            "server" : {
                "poolSize" : 10
            }
        };
/*
	opt @param	string/object
		
		string  collection

		object 

 */
var Model    = function(dc,opt){
	if(_.isObject(dc))
	{
		dc  = '';
		opt = dc;
	}

	this.countConfig  = {};//方便find之后使用count查询，会缓存一次查询条件
	this._dc          = dc;//持久保存的集合名字，不会因为查询完毕而丢失当不指定from的时候会自动应用dc
	this.autoInc      = opt.autoInc === undefined ? true :opt.autoInc;

	if(opt.settingFile){
		var setting = require(opt.settingFile);
		mongodbConfig = setting.mongodb;
	}
	if(opt.setting)
	{
		mongodbConfig = opt.setting;
	}
	if(!mongodbConfig || mongodbConfig.length == 0)
	{
		throw new Error('No Connect Config found');
	}
	//创建数据库连接
	this.connect = createConnect(connectString(mongodbConfig));

	/*
		初始化信息
	*/
	this._config = {
		collection:'',
		where:{},
		fields:{},
		limit:0,
		skip:0,
		sort:{}
	};
	return this;
}


/*
	输出查询配置信息
 */
Model.prototype.test = function(){
	console.log(this._config);
	return this;
}

/*
	设置当前模型永不过期的集合名称
	此方法设置的集合名称不会因为查询而被清除
 */
Model.prototype.endureCollection = function( c ){
	this._dc = c;
	return this;
}

/*
	链接数据库
	db  config.js中的配置格式
 */
var connectString = function(dbs){
	var url = '';
	if(!dbs)
	{
		throw new Error('Can not find Connect config,please set setting or settingFile option');
	}
	if(dbs.length == 1){
		//单数据库
		db = dbs[0];
		url = 'mongodb://' + (db.username ? db.username + ':' + db.password + '@': '')
						   + db.host + ':' + db.port + '/' + db.database; 
	}else{
		//集群
		var urls = [];
		dbs.forEach(function(db,k){
			urls[k] = (db.username ? db.username + ':' + db.password + '@': '') + db.host + ':' + db.port; 
		})

		url = 'mongodb://' + urls.join(',') + '/' + dbs[0].database + '?replicaSet=' + dbs[0].replicaSet;
	}
	return url;
}


/*
	链接到数据库
	cnodejs.org
 */
function createConnect (url) {
    var fns = [], status = 0, _db = _mdcache[url];
    return function (f) {
        var args = arguments;
        if (_db !== null && typeof _db === 'object') {
            f.call(null, _db);
            return;
        }     
        fns.push(f);
        // 当有一个连接初始化请求时，挂起其他初始化请求
        // 连接池建立完后，使用该连接处理挂起的请求
        if (status === 0) {
            status = 1;
            mongodb.MongoClient.connect(url, mongoOptions, function (err, db) {
                if (err) { 
                	//更友好的错误处理。。。
                	throw err; 

                }
                _db = _mdcache[url] = db;
                for (var i = 0, len = fns.length; i < len; i++) {
                    fns.shift().call(null, _db);
                }
            });
        }
    };
}

Model.prototype.resetConfig = function(){
	var def = {
		collection : "",
		where : {},
		fields : {},
		limit : 0,
		skip : 0,
		sort : {}
	};
	for(var i in def)
	{
		this._config[i] = def[i]
	}
	if(this._dc){
		this._config.collection = this._dc;
	}
	return this;
}


/*
	设置查询条件
*/
Model.prototype.where = function(k,v){
	if(k == "_id")
	{
		if(this.autoInc)
		{
			v = parseInt(v);
		}else{
			v = new ObjectID(v);
		}
	}
	if(_.isObject(k)){
		this._config.where = _.extend(this._config.where,k);
	}else{
		this._config.where[k] = v;
	}
	return this;
}
/*
	选择集合
*/
Model.prototype.from = function(collection){
	this._config.collection = collection;
	return this;
}
/*
	查询的字段
	field string/object/array
				 _id
				 {name:1,email:1}
				 [name,email]
*/
Model.prototype.select = function(field){
	var _fields = {};
	if(_.isObject(field)){
		_fields = field;
	}else if(_.isArray(field)){
		field.forEach(function(f){
			_fields[f] = 1;
		});
	}else{
		_fields[field] = 1;
	}
	this._config.fields = _.extend(this._config.fields,_fields);
	return this;
}
/*
	限制条数
	limit 限制条数
	skip  跳过的条数
*/
Model.prototype.limit = function(limit,skip){
	this._config.skip = (skip === undefined ? 0 : skip);
	this._config.limit = (limit == undefined ? 0 : limit);
	return this; 
}

/*
	排序
	obj 排序字段
	{age:1,step:-1}
*/
Model.prototype.sort = function(obj){
	this._config.sort = obj;
	return this;
}
/*
	查询
	callback
	explain 是否输出查询explain信息
 */
Model.prototype.find = function(callback,explain){
	var _c = _.defaults({},this._config);
		_c.collection = _c.collection || this._dc,
		that = this;
	this.connect(function(db){
		var opt = {};
		if(_c.skip){
			opt.skip = _c.skip;
		}
		if(_c.limit){
			opt.limit = _c.limit;
		}

		if(_c.fields){
			opt.fields = _c.fields;
		}
		if(!_c.collection){
			throw new Error('No Collection specified');
		}
		var col = db.collection(_c.collection);
		if(explain){
			col.find(_c.where,opt).explain(function(err,explaination){
				console.log('Explain Info:');
				console.log(explaination);
				console.log('End Explain Info');
			});
		}
		col.find(_c.where,opt).toArray(function(err,docs){
			callback.apply(null,arguments)
		});
		that.countConfig = {where:_c.where,collection:_c.collection};
		//重置参数
		that.resetConfig();
	});
}
/*
	findone
 */
Model.prototype.findOne = function(callback,explain){
	var _c = _.defaults({},this._config);
		_c.collection = _c.collection || this._dc,
		that = this;
	this.connect(function(db){
		var opt = {};
		if(_c.fields){
			opt.fields = _c.fields;
		}
		if(!_c.collection){
			throw new Error('No Collection specified');
		}
		var col = db.collection(_c.collection);
		if(explain){
			col.find(_c.where,opt).explain(function(err,explaination){
				console.log('Explain Info:');
				console.log(explaination);
				console.log('End Explain Info');
			});
		}
		col.findOne(_c.where,opt,function(err,doc){
			callback.apply(null,arguments)
		});
		//重置参数
		that.resetConfig();
	});
}
/*
	统计数量

 */
Model.prototype.count = function(callback){
	var _c   = _.defaults({},this._config),
		that = this;
		_c.collection = _c.collection || this._dc;
	this.connect(function(db){
		var where = {};
		if(_c.collection){
				where = _c.where;
			var collection = _c.collection;
		}else if(!_.isEmpty(that.countConfig)){
				where = that.countConfig.where;
			var collection = that.countConfig.collection;
		}
		if(!collection){
			throw new Error('No Collection specified');
		}
		var col = db.collection(collection);
		col.count(where,function(err,count){
			callback.apply(null,arguments);
		})

		that.countConfig = {};
	});
}

/*
	删除

 */
Model.prototype.remove = function(opt,callback){
	if(_.isFunction(opt)){
		callback = opt;
		opt = {w:1};
	}
	var _c = _.defaults({},this._config);
		_c.collection = _c.collection || this._dc;
	this.connect(function(db){
		console.log(_c);
		db.collection(_c.collection).deleteMany(_c.where,opt,function(err,result){
			callback !== undefined ? callback.apply(null,arguments):'';
		});
	});
	//重置参数
	this.resetConfig();
}
/*
	removeone
 */
Model.prototype.removeOne = function(opt,callback){
	if(_.isFunction(opt)){
		callback = opt;
		opt = {w:1};
	}
	var _c = _.defaults({},this._config);
		_c.collection = _c.collection || this._dc;
	this.connect(function(db){
		db.collection(_c.collection).deleteOne(_c.where,opt,function(err,result){
			callback !== undefined ? callback.apply(null,arguments):'';
		});
	});
	//重置参数
	this.resetConfig();
}
/*
	添加数据
 */
Model.prototype.save = function(doc,opt,callback){

	if(_.isFunction(opt)){
		callback = opt;
		opt = {w:1};
	}
	var _c = this._config;
		_c.collection = _c.collection || this._dc,
		that = this;

	this.connect(function(db){
		var insert = function(doc){
			if(_.isArray(doc))
			{
				db.collection(_c.collection).insertMany(doc,opt,function(err,result){
					callback !== undefined ? callback.apply(null,arguments):'';
				});
			}else{
				db.collection(_c.collection).save(doc,opt,function(err,result){
					callback !== undefined ? callback.apply(null,arguments):'';
				});
			}

		}		
		if(that.autoInc)
		{
			if(_.isArray(doc))
			{
				var total = doc.length;
				that.autoIncId(total,function(id){
					for(var i=0;i<total;i++ )
					{
						doc[i]._id = (id + i)
					}
					insert(doc);
				});

			}else{
				that.autoIncId(function(id){
					doc._id = id;
					insert(doc);
				});
			}
		}else{
			insert(doc);
		}

	});
	//重置参数
	this.resetConfig();
}
/*
	修改
	{opt} 多个参数 multi
 */
Model.prototype.update = function(doc,opt,callback){
	if(_.isFunction(opt)){
		callback = opt;
		opt = {w:1};
	}
	var _c = this._config;
		_c.collection = _c.collection || this._dc,
		multi = opt.multi || true;
	if(opt.multi)
	{
		delete opt['multi'];
	}

	this.connect(function(db){
		if(multi)
		{
			db.collection(_c.collection).updateMany(_c.where,doc,opt,function(err,result){
				callback !== undefined ? callback.apply(null,arguments):'';
			});
		}else{
			db.collection(_c.collection).updateOne(_c.where,doc,opt,function(err,result){
				callback !== undefined ? callback.apply(null,arguments):'';
			});
		}

	});
	//重置参数
	this.resetConfig();
}
/*
	修改一个
 */
Model.prototype.updateOne = function(doc,opt,callback){
	opt.multi = false;
	this.update.call(null,doc,opt,callback);
}
/*
	按页数查找
	我们鼓励页码倒叙排列
	callback 参数
	@return {total:1,data:docs}
 */
Model.prototype.page = function(page,num,callback){
	page = page ? page : 1;
	num  = num ? num : 20;
	var skip = (( page - 1) >=0 ? (page - 1) : 0) * num,
		that = this;
	this.limit(num,skip);

	this.find(function(err,docs){
		if(err)
		{
			callback.apply(null,arguments);
			return false;
		}
		that.count(function(er,count){
			if(er)
			{
				callback.apply(null,arguments);
				return false;
			}
			callback.call(null,null,{total:count,data:docs});
		});
	})
}
/*
	删除集合
 */
Model.prototype.dropCollection = function(name,callback){
	var that = this;
	this.connect(function(db){
		db.dropCollection(name,function(err,result){
			callback != undefined ? callback.apply(null,arguments) : '';
			//如果是自增的则清空自增列表
			if(that.isAutoInc)
			{
				db.collection('autoIncIds').update({'_id':name},{$set:{val:0}},{w:1,upsert:true},function(err,result){
					if(err){
						throw new Error('clear autoInc Number Error');
					}
				})
			}
		});
	});
}
/*
	关闭连接
 */
Model.prototype.close = function(){
	this.connect(function(db){
		for(var m in _mdcache){
			if(_mdcache[m] == db){
				delete _mdcache[m];
				break;
			}
		}
		db.close();
	});
}

/*
	方便操作的快捷方式
*/

/*
	按照ID查找
*/
Model.prototype.findById = function(id,callback){
	//id = new ObjectID(id);
	this.where({_id:id});
	this.findOne(callback);
}

/*
	按照ID删除
*/
Model.prototype.removeById = function(id,callback){
	//id = new ObjectID(id);
	this.where({_id:id});
	this.removeOne(callback);
}



/*
	获取当前操作的操作配置

 */
Model.prototype.getConfig = function(){
	return this._config;
}

/*
	清空持久化的集合名称

 */
Model.prototype.clearEndureCollection = function(){
	this._dc = '';
	return this;
}

/*
	设置是否需要自增ID
 */
Model.prototype.isAutoInc = function(b){
	this.autoInc = b;
	return this;
}

/*
	生成一个自增的ID
	1,c
	c
 */
Model.prototype.autoIncId = function(c,step,callback)
{
	if(_.isFunction(step))
	{
		callback = step;
		step     = 1;
	}
	if(_.isFunction(c))
	{
		callback = c;
		c        = null;
		step     = 1;
	}
	if(_.isNumber(c))
	{
		step = c;
		c    = null;
	}

	c = c ? c : (this._config.collection ? this._config.collection : this._dc);
	step = step ? step : 1;
	if(!c){
		throw new Error('can not find collection for autoIncrement');
	}
	this.connect(function(db){
		db.collection('autoIncIds').findAndModify({_id:c},{},{$inc:{val:step}},{w:1,upsert:true},function(err,doc){
			if(err)
			{
				throw new Error('cant not create auto increment id');
			}
			callback.call(null,(doc.value.val + 1));
		});
	});
}

/*
	test:
	一个mongodb的简单封装
	$.mongodb(function(db){
		db.collection('test').ensureIndex('ee',{step:1},function(err,indexName){
			console.log(indexName);
		})
		db 可以使用
	});
 */
Model.prototype.exec    = function(callback){
	this.connect(function(db){
		callback.apply(null,arguments);
	});
}
/*
	引入的mongodb对象
 */
Model.mongodb = mongodb;

module.exports = Model;