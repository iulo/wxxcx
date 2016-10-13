var fs = require("fs");
var path = require("path");
var babel = require("babel-core");
var readJson = require("../../utils/read-json");
var config = readJson(path.resolve(__dirname, "../../config.json"));

module.exports = function(){
	fs.readFile(config.build["inject-file"], {
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
							// require进来child_process.exec模块
							FunctionDeclaration: {
								enter: function(path){
									var node = path.node,
										body;
									if(node.id.type === "Identifier" && node.id.name === "init"){
										if (!path.scope.hasBinding("exec")) {
											body = node.body.body;
											body.unshift(t.VariableDeclaration("var", [
												t.variableDeclarator(
													t.identifier("exec"),
													t.MemberExpression(
														t.CallExpression(
															t.Identifier("require"),
															[
																t.StringLiteral("child_process")
															]
														),
														t.Identifier("exec")
													)
												)
											]));
										}
									}
								}
							},
							// 修改编译按钮事件，先进行我们的编译，并修改项目地址为编译后文件的地址，再执行其他功能
							ObjectProperty: {
								enter: function(path){
									var node = path.node,
										body;
									if(node.key.type === "Identifier" &&
										node.key.name === "handleCompile" &&
										node.value.type === "FunctionExpression"){
										body = node.value.body.body;
										if(!body.some(function(item){
											return item.type === "ExpressionStatement" &&
													item.expression.type === "CallExpression" &&
													item.expression.callee.type === "Identifier" &&
													item.expression.callee.name === "exec";
										})){
											path.get("value").replaceWithSourceString(
												'function(){' +
												'	var project = this.props.project;' +
												'	exec("wxxcx build", {' +
												'		cwd: project.projectpath' +
												'	}, function(error, stdout, stderr){' +
												'		s.restart(Object.assign({}, project, {' +
												'			"projectpath": stdout.trim()' +
												'		}));' +
												'		this.props.optProject("debug");' +
												'		o("project_compile",project.appid);' +
												'	});' +
												'}'
											);
										}
									}
								}
							}
						}
					};
				}
			]
		});

		fs.writeFile(config.build["inject-file"], code.code, function(err){
			if(err){
				throw err;
			}

			console.log("安装成功");
		});
	});
};