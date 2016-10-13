var fs = require("fs");
var clearCommit = require("./clear-commit");

module.exports = function(file){
	var code = clearCommit(fs.readFileSync(file, {
		encoding: "utf8"
	})).trim();

	if(!/^<template/.test(code) || !/<\/template>$/.test(code)){
		code = '<template name="' + (function(items){
			return items.length > 1 ? items[items.length - 2] : items.pop();
		})(file.split("/")) + '">' + code.replace(/on(tap|touchstart|touchmove|touchcancel|touchend|longtap)=("|')([^"]*)\2/g, function(match, eventName, quote, eventHandler){
			if(!/^\{\{/.test(eventHandler) || !/\}\}$/.test(eventHandler)){
				return "on" + eventName + "=" + quote + "{{" + eventHandler + "}}" + quote;
			}else{
				return match;
			}
		}) + '</template>';

		fs.writeFileSync(file, code);
	}
};