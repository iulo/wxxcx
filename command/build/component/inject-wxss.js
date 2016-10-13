var fs = require("fs");

module.exports = function(file, components, callback){
	fs.readFile(file, {
		encoding: "utf8"
	}, function(err, code){
		if(err){
			throw err;
		}

		fs.writeFile(file, components.map(function(component){
			return '@import "' + component.src + '.wxss";'
		}).join("\n") + "\n" + code, function(err){
			if(err){
				throw err;
			}

			callback();
		});
	});
};