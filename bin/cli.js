#!/usr/bin/env node
var program = require('commander'),
	package = require("../package.json"),
	readJson = require("../utils/read-json"),
	fs = require("fs"),
	path = require("path");
var config = readJson(path.join(__dirname, "../config.json"));

var commandPath = "../command/{command}/index.js";
function command(commandName){
	var command = require(commandPath.replace("{command}", commandName));
	return function(){
		command.apply(null, arguments);
	};
}

// 命令版本
program
	.version(package.version);

// // 项目配置
// program
// 	.command("config <key> [value]")
// 	.description("配置项目构建参数")
// 	.action(command("config"));

// 
program
	.command("install")
	.description('注入微信开发者工具')
	.action(command("install"));

// 
program
	.command("uninstall")
	.description('取消注入微信开发者工具')
	.action(command("uninstall"));

// 构建项目
program
	.command('build')
	.description('编译项目')
	.action(command("build"));

program.parse(process.argv);
