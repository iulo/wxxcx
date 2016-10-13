var fs = require("fs");
var path = require("path");
var babel = require("babel-core");
var babelTemplate = require("babel-template");
var readJson = require("../../utils/read-json");
var config = readJson(path.resolve(__dirname, "../../config.json"));

module.exports = function(){
	fs.readFile(config.build["build-inject-file"], {
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
							MemberExpression: function(path){
								var node = path.node;
								if(node.object.type === "Identifier" &&
									node.object.name === "c" &&
									node.property.type === "Identifier" &&
									node.property.name === "appservicejs"){
									do{
										path = path.parentPath;
									}while(path.node.type !== "VariableDeclaration");

									var hasInject = false;
									path.parentPath.traverse({
										StringLiteral: function(path){
											if(path.node.value === "-build"){
												hasInject = true;
											}
										}
									});

									if(!hasInject){
										path.insertAfter(babelTemplate(
											'e = JSON.parse(JSON.stringify(e));' +
	            							'e.projectpath = e.projectpath + "-build";'
										)());
									}
								}
							}
						}
					};
				}
			]
		});

		fs.writeFile(config.build["build-inject-file"], code.code, function(err){
			if(err){
				throw err;
			}

			console.log("安装成功1");
		});
	});

	fs.readFile(config.build["build-js-inject-file"], {
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
							CallExpression: function(path){
								var node = path.node;
								if(node.callee.type === "MemberExpression" &&
									node.callee.object.type === "Identifier" &&
									node.callee.object.name === "u" &&
									node.callee.property.type === "Identifier" &&
									node.callee.property.name === "join" &&
									node.arguments.length === 2 &&
									node.arguments[0].type === "MemberExpression" &&
									node.arguments[0].object.type === "Identifier" &&
									node.arguments[0].object.name === "n" &&
									node.arguments[0].property.type === "Identifier" &&
									node.arguments[0].property.name === "projectpath" &&
									node.arguments[1].type === "Identifier" &&
									node.arguments[1].name === "o"){
									node.arguments[0] = t.BinaryExpression(
										"+",
										node.arguments[0],
										t.StringLiteral("-build")
									);
								}else if(node.callee.type === "Identifier" &&
									node.callee.name === "f" &&
									node.arguments.length === 3 &&
									node.arguments[0].type === "StringLiteral" &&
									node.arguments[0].value === "**/*.js"){
									node = node.arguments[1].properties.find(function(property){
										return property.key.name === "cwd";
									});
									if(node.value.type === "MemberExpression"){
										node.value = t.BinaryExpression(
											"+",
											node.value,
											t.StringLiteral("-build")
										);
									}
								}
							}
						}
					};
				}
			]
		});

		fs.writeFile(config.build["build-js-inject-file"], code.code, function(err){
			if(err){
				throw err;
			}

			console.log("安装成功2");
		});
	});

	fs.readFile(config.build["publish-inject-file"], {
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
							AssignmentExpression: function(path){
								var node = path.node;
								if(node.operator === "=" &&
									node.left.type === "Identifier" &&
									node.left.name === "_exports" &&
									node.right.type === "ObjectExpression" &&
									node.right.properties.length === 1 &&
									node.right.properties[0].key.type === "Identifier" &&
									node.right.properties[0].key.name === "getResponse"){
									node.right.properties[0].value = babelTemplate(
										'function getResponse(){' +
										'	var params = Array.prototype.concat.apply([], arguments);' +
										'	var projectpath = n.getProject(params[0]).projectpath;' +
										'	require("child_process").exec("wxxcx build", {' +
										'		cwd: projectpath,' +
										'		env: {' +
										'			PATH: "/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin"' +
										'		}' +
										'	}, function(err, stdout, stderr){' +
										'		var buildpath = /\-build$/.test(projectpath) ? projectpath : projectpath + "-build";' +
										'		e.apply(null, params.concat(buildpath));' +
										'	});' +
										'}'
									)();
								}
							},
							FunctionDeclaration: function(path){
								var node = path.node;
								if(node.id.type === "Identifier" &&
									node.id.name === "e" &&
									node.params.length === 2){
									node.params.push(t.Identifier("buildpath"));
									node.body.body.splice(1, 0,
										babelTemplate("q = JSON.parse(JSON.stringify(q));")(),
										babelTemplate("q.projectpath = buildpath;")()
									);
								}
							}
						}
					};
				}
			]
		});

		fs.writeFile(config.build["publish-inject-file"], code.code, function(err){
			if(err){
				throw err;
			}

			console.log("安装成功3");
		});
	});
};