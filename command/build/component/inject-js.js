var fs = require("fs");
var babel = require("babel-core");

module.exports = function(file, components, tags, callback){
	fs.readFile(file, {
		encoding: "utf8"
	}, function(err, code){
		if(err){
			throw err;
		}

		code = babel.transform(code, {
			plugins: [
				function (_ref) {
					var t = _ref.types;
					return {
						visitor: {
							CallExpression: {
								enter: function(path){
									var node = path.node;

									if(node.callee.type === "Identifier" &&
										node.callee.name === "Page" &&
										node.arguments.length === 1){
										node.arguments.push(t.Identifier("__instance_list__"));
									}
								}
							}
						}
					}
				}
			]
		}).code;

		var instances = [];
		tags.forEach(function(tag){
			instances.push({
				component: tag.componentName,
				instanceName: tag.instanceName,
				props: tag.props,
				events: tag.events
			});
		});

		code = components.map(function(component){
			return 'var ' + component.name + ' = require("' + component.src + '.js");';
		}).join("\n") + "\n" + code.replace("__instance_list__", JSON.stringify(instances));

		code = babel.transform(code, {
			plugins: [
				function (_ref) {
					var t = _ref.types;
					return {
						visitor: {
							CallExpression: {
								enter: function(path){
									var node = path.node;

									if(node.callee.type === "Identifier" &&
										node.callee.name === "Page" &&
										node.arguments.length === 2 &&
										node.arguments[1].type === "ArrayExpression"){
										node.arguments[1].elements.forEach(function(element){
											if(element.type === "ObjectExpression"){
												var componentProperty = element.properties.find(function(property){
													return property.key.value === "component";
												});

												if(componentProperty){
													componentProperty.value = t.Identifier(componentProperty.value.value);
												}
											}
										});
									}
								}
							}
						}
					}
				}
			]
		}).code;

		fs.writeFile(file, code, function(err){
			if(err){
				throw err;
			}

			callback();
		});
	});
};