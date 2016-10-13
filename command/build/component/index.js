var fs = require("fs");
var path = require("path");
var babel = require("babel-core");
var parseComponent = require("./parse-component");
var parseInstance = require("./parse-instance");
var tempPlaceholder = require("./temp-placeholder");
var transComponentWxml = require("./trans-component-wxml");
var injectWxss = require("./inject-wxss");
var injectJs = require("./inject-js");
var asyncList = require("../../../utils/async-list");

var noteRegex = /<\!\-\-[\s\S]*?\-\->/g;

module.exports = function(file, callback){
	fs.readFile(file, {
		encoding: "utf8"
	}, function(err, code){
		if(err){
			throw err;
		}

		try{
			code = tempPlaceholder.containerTag.replace(tempPlaceholder.expression.replace(code.replace(noteRegex, "")));

			var result = parseComponent(code);
			// 当前页引用的组件列表
			var components = result.components;

			code = result.code;

			result = parseInstance(file, code, components);
			// 当前页实例的组件列表
			var tags = result.tags;

			code = result.code;

			code = tempPlaceholder.expression.resume(tempPlaceholder.containerTag.resume(code));

			if(tags.length){
				var wxssFile = file.replace(/\.wxml$/, ".wxss");

				var jsFile = file.replace(/\.wxml$/, ".js");

				var importWxsss = [];
				var importJss = [];
				components.forEach(function(component){
					// 假如页面有wxss文件，并且组件也有wxss文件，则将组件wxss导入到页面的wxss中
					if(fs.existsSync(wxssFile) && fs.existsSync(component.absoluteSrc + ".wxss")){
						importWxsss.push(component);
					}

					// 假如页面有js文件，并且组件也有js文件，则将组件js导入到页面的js中
					if(fs.existsSync(jsFile) && fs.existsSync(component.absoluteSrc + ".js")){
						importJss.push(component);
					}

					// 加入组件存在wxml文件，则转换组件的wxml文件
					if(fs.existsSync(component.absoluteSrc + ".wxml")){
						// 修改组件的wxml文件
						transComponentWxml(component.absoluteSrc + ".wxml");
					}
				});

				asyncList([function(callback){
					// 将导入的组件wxss语句写入页面的wxss文件中
					if(importWxsss.length){
						injectWxss(wxssFile, importWxsss, callback);
					}
				}, function(callback){
					// 页面的js文件中，添加组件引入代码
					if(importJss.length){
						injectJs(jsFile, importJss, tags, callback);
					}
				}, function(callback){
					// 写入wxml文件
					fs.writeFile(file, code, function(err){
						if(err){
							throw err;
						}
						
						callback();
					});
				}], callback);
			}else{
				callback();
			}
		}catch(e){
			console.log("\n");
			console.log("组件编译错误");
			console.log(file);
			console.log(e);
			callback();
		}
	});
};