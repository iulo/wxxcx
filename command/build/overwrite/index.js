var fs = require("fs");
var path = require("path");
var babel = require("babel-core");
var tpl = require("../../../utils/tpl");
var overwriteTpl = fs.readFileSync(path.join(__dirname, "index.tpl"), {
		encoding: "utf8"
	});
var mkdirs = require("../../../utils/mkdirs");

var frameworkDir = "_f";

var windowRegex = new RegExp("(\"|')[^\\1]*\\b" + frameworkDir + "\\/overwrite\\.js\\1");
// 检测是否已引用window模块
function hasOverwrite(code){
	return windowRegex.test(code);
}

var apiRegex = new RegExp("(\"|')[^\\1]*\\b" + frameworkDir + "\\/api\\.js\\1");
// 检测是否已引入API模块
function hasRequireApi(code){
	return apiRegex.test(code);
}
// 检测是否有使用api
function hasUseApi(code){
	return /\bapi\s*\./.test(code.replace(/\.\s*api\b/g, ""));
}

// 移除字符串、注释、正则表达式等干扰
function clearInterfere(code){
	return code.replace(/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^/\r\n])+\/(?=[^\/])|\/\/.*/g, "");
}

// 检测页面是否使用require方法
function hasRequire(code){
	return /\brequire\s*\(/.test(code.replace(/\.\s*require\b/g, ""));
}

// 检测页面是否使用Page方法
function hasPage(code){
	return /\bPage\s*\(/.test(code.replace(/\.\s*Page\b/g, ""));
}

function findGlobal(code){
	var globals = [];
	babel.transform(code, {
		plugins: [
			function (_ref) {
				var t = _ref.types;
				return {
					visitor: {
						Identifier: function(path){
							var node = path.node,
								name = node.name;
							if(globals.indexOf(name) !== -1){
								return;
							}
							
							if(path.parentPath.node.type === "AssignmentExpression" &&
								path.scope.hasBinding(name)){
								globals.push(name);
							}
						}
					}
				}
			}
		]
	});
}

// 获取count个TAB键
function getTab(count){
	return new Array(count + 1).join("	");
}

module.exports = function(file, entry, output, callback){
	fs.readFile(file, {
		encoding: "utf8"
	}, function(err, code){
		if(err){
			throw err;
		}

		if(hasOverwrite(code)){
			callback();
			return;
		}

		var clearCode = clearInterfere(code);
		var params = [],
			arguments = [],
			api = "";

		if(hasUseApi(clearCode) && !hasRequireApi(code)){
			api = 'var api = require("' + frameworkDir + '/api")(__dirname);';
		}

		if(hasRequire(clearCode) || api){
			params.push("require");
			arguments.push("window.require(require, __dirname)");
		}

		if(hasPage(clearCode)){
			params.push("Page");
			arguments.push("window.Page");
		}

		var dirname = path.dirname(file).replace(entry, "").replace(/^\/+/, "");

		if(params.length){
			code = tpl(overwriteTpl, {
				"dirname": dirname,
				"window": (dirname ? dirname.split("/").map(function(){return ".."}).join("/") : ".") + "/" + frameworkDir + "/window.js",
				"params": params.join(","),
				"arguments": arguments.join(","),
				"api": api,
				"content": code.replace(/^(\s*\n)+/g, "").split("\n").join("\n" + getTab(1))
			});
		}

		var outputFile = file.replace(entry, output);
		mkdirs(path.dirname(outputFile), function(){
			fs.writeFile(outputFile, code, function(err){
				if(err){
					throw err;
				}

				callback && callback();
			});
		});
	});
};