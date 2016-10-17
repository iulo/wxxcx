var fs = require("fs");
var path = require("path");
var babel = require("babel-core");
var tpl = require("../../../utils/tpl");
var overwriteTpl = fs.readFileSync(path.join(__dirname, "index.tpl"), {
		encoding: "utf8"
	});
var mkdirs = require("../../../utils/mkdirs");

var frameworkDir = "_f";

var windowRegex = new RegExp("(\"|')[^\\1]*\\b" + frameworkDir + "\\/window\\.js\\1");
// 检测是否已引用window模块
function hasWindow(code){
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
// 检测是否有使用window
function hasUseWindow(code){
	return /\bwindow\s*\./.test(code.replace(/\.\s*window\b/g, ""));
}

// 移除字符串、注释、正则表达式等干扰
function clearInterfere(code){
	return code.replace(/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^/\r\n])+\/(?=[^\/])|\/\/.*/g, "");
}

var defaultGlobals = ["wx", "App", "getApp", "module", "exports", "window", "console"];
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
							if(globals.indexOf(name) !== -1 || defaultGlobals.indexOf(name) !== -1){
								return;
							}

							var parentNode = path.parentPath.node;

							if((parentNode.type === "AssignmentExpression" ||
								parentNode.type === "MemberExpression" && node === parentNode.object ||
								parentNode.type === "CallExpression" ||
								parentNode.type === "UnaryExpression" ||
								parentNode.type === "BinaryExpression" ||
								parentNode.type === "LogicalExpression" ||
								parentNode.type === "ConditionalExpression" ||
								parentNode.type === "IfStatement" ||
								parentNode.type === "WhileStatement" ||
								parentNode.type === "ArrayExpression" ||
								parentNode.type === "ExpressionStatement" ||
								parentNode.type === "ObjectProperty" && node === parentNode.value) &&
								!path.scope.hasBinding(name)){
								globals.push(name);
							}
						}
					}
				}
			}
		]
	});
	return globals;
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

		if(hasWindow(code)){
			callback();
			return;
		}

		var clearCode = clearInterfere(code);
		var params = [],
			args = [],
			api = "";

		if(hasUseApi(clearCode) && !hasRequireApi(code)){
			api = 'var api = require("' + frameworkDir + '/api")(__dirname);';
		}

		findGlobal(code).forEach(function(key){
			params.push(key);
			if(key === "require"){
				args.push("window.require(require, __dirname)");
			}else{
				args.push("window." + key);
			}
		});

		var dirname = path.dirname(file).replace(entry, "").replace(/^\/+/, "");

		if(params.length || api || hasUseWindow(clearCode)){
			code = tpl(overwriteTpl, {
				"dirname": dirname,
				"window": (dirname ? dirname.split("/").map(function(){return ".."}).join("/") : ".") + "/" + frameworkDir + "/window.js",
				"params": params.join(","),
				"arguments": args.join(","),
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