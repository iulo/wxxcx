var fs = require("fs");
var path = require("path");
var babel = require("babel-core");
var glob = require("glob");
var readJson = require("../../utils/read-json");
var overwrite = require("./overwrite/index");
var component = require("./component/index");
var asyncList = require("../../utils/async-list");
var exec = require('child_process').exec;
var mkdirs = require("../../utils/mkdirs");

function copyFiles(entry, output, callback){
	asyncList(glob.sync("**/*", {
		cwd: entry
	}).map(function(file){
		var entryFile = path.join(entry, file);

		return function(callback){
			fs.stat(entryFile, function(err, stats){
				if(err){
					throw err;
				}

				if(stats.isDirectory()){
					callback();
				}else{
					fs.readFile(entryFile, null, function(err, content){
						if(err){
							throw err;
						}

						var outputFile = path.join(output, file);

						mkdirs(path.dirname(outputFile), function(){
							fs.writeFile(outputFile, content, function(err){
								if(err){
									throw err;
								}

								callback();
							});
						});
					});
				}
			});
		};
	}), callback);
}

function build(){
	var projectRoot = fs.realpathSync(".").replace(/\/$/, "");
	var projectPath = path.dirname(projectRoot);
	var projectName = projectRoot.replace(projectPath, "").replace(/^\//, "");
	var output = path.join(projectPath, projectName + "-build");
	var projectConfig = readJson(path.join(projectRoot, "build.json"));

	var overwriteFiles = projectConfig.overwriteFiles || "**/*.js";

	if(!(overwriteFiles instanceof Array)){
		overwriteFiles = [overwriteFiles];
	}

	var files = [];
	overwriteFiles.forEach(function(item){
		files = files.concat(glob.sync(item, {
			cwd: projectRoot
		}).map(function(file){
			return path.join(projectRoot, file);
		}));
	});

	function overwriteFn(){
		copyFiles(projectRoot, output, function(){
			copyFiles(path.join(__dirname, "framework"), output, function(){
				console.log("拷贝完成");
				asyncList(files.map(function(file){
					return function(callback){
						overwrite(file, projectRoot, output, callback);
					};
				}), function(){
					console.log("重写完成");
					asyncList(glob.sync("**/*.wxml", {
						cwd: output
					}).map(function(file){
						return function(callback){
							component(path.join(output, file), callback);
						};
					}), function(){
						console.log("组件编译完成");
					});
				});
			});
		});
	}

	// 清空目标目录
	if(fs.existsSync(output)){
		exec('rm -rf ' + output, function(err,out) {
			overwriteFn();
		});
	}else{
		overwriteFn();
	}
};

module.exports = build;