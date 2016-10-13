var babel = require("babel-core");

module.exports = function(code){
	// 当前页引用的组件列表
	var components = [];

	// 提取引用的组件
	code = babel.transform(code, {
		plugins: [
			function (_ref) {
				var t = _ref.types;
				return {
					visitor: {
						// require进来child_process.exec模块
						JSXOpeningElement: {
							enter: function(path){
								var node = path.node,
									nameAttr,
									srcAttr;

								if(node.name.type === "JSXIdentifier" &&
									node.name.name === "import"){
									nameAttr = node.attributes.find(function(attr){
										return attr.type === "JSXAttribute" &&
											attr.name.type === "JSXIdentifier" &&
											attr.name.name === "name";
									});

									if(nameAttr){
										srcAttr = node.attributes.find(function(attr){
											return attr.type === "JSXAttribute" &&
												attr.name.type === "JSXIdentifier" &&
												attr.name.name === "src";
										});

										if(srcAttr){
											components.push({
												name: nameAttr.value.value,
												src: srcAttr.value.value,
												componentName: (function(items){
													return items.length > 1 ? items[items.length - 2] : items.pop();
												})(srcAttr.value.value.split("/"))
											});
										}

										// 删除name属性
										node.attributes.splice(node.attributes.indexOf(nameAttr), 1);
										srcAttr.value.value += ".wxml";
									}
								}
							}
						}
					}
				}
			},
			"syntax-jsx"
		]
	}).code;

	return {
		code: code,
		components: components
	};
}