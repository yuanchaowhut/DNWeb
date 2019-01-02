/*
* @Author: Max
* @Date:   2018-11-13 20:17:56
* @Last Modified by:   Max
* @Last Modified time: 2018-11-13 22:31:45
*
* 客户端     服务端   模块（库   框架 ）
*/
(function( root ){
	var push = Array.prototype.push;
   var _ = function( obj ){
     if( !(this instanceof  _) ){
        return new _(obj);
     }
     this.wrap = obj;
   }
   //commonjs 规范  js 社区
   typeof module !== "undefined" && module.exports ? module.exports = _ : root._ = _;
   // AMD 规范  requirejs    客户端模块加载器如何实现
   if( typeof define === "function" && define.amd ){
      define( "underscore", [], function(){
          return {
          	   _:_,
          }
      });
   }
   /*
    数组去重
    target  目标源
    callback
    */
   _.uniq = function( target, callback ){
   	  var result = [];    //去重之后的结果  [1,2,3,4,5,2,4,5,3]
      for( var i=0; i<target.length; i++ ){
      	var computed = callback ? callback(target[i]) : target[i];
        if(result.indexOf(computed) === -1 ){
           result.push(computed)
        }
      }

      return result;
   }
   
   _.functions = function( obj ){
    var result = [];
    var key;
    for( key in obj ){
         result.push(key);
    }
    return result;
   }
   
   // 遍历 数组  对象
   _.each = function( target, callback ){
   	   var key,i = 0;
       if( _.isArray(target) ){
       	 var length = target.length;
          for( ;i<length; i++ ){
             callback.call( target, target[i], i );         //值   下标   
          }
       } else {
          for( key in target ){
             callback.call( target, key, target[key] );   //属性   值
          }
       }
   	
   }

   //类型检测
   _.isArray = function( array ){
     return toString.call( array ) === "[object Array]";
   }
  
   _.each(["Function", "String", "Object" , "Number"], function( name ){  //key  value
          _["is"+name] = function( obj ){
          	 return toString.call( obj ) === "[object "+name+"]";
          }
   });


  //.....

   //mixin   _   遍历  数组
   _.mixin = function( obj ){
     _.each( _.functions( obj ), function( name ){
     	   var func = obj[name];
          //数组去重
		_.prototype[name] = function(){
			var args = [this.wrap];   //[目标源,回调函数]
			push.apply( args, arguments );   //数组合并
			// arguments
			//目标源   回调
           return func.apply( this, args );   //[目标源,回调函数]
		}
     });
   }

   _.mixin( _ );
})( this );

