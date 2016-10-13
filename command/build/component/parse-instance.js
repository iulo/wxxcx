var path = require("path");
var babel = require("babel-core");
var tempPlaceholder = require("./temp-placeholder");

module.exports = function(file, code, components){
	// 当前页实例的组件列表
	var tags = [];

	var tagIndex = 0;
	function getTagId(){
		return "_component_instance_" + (tagIndex++);
	}

	var componentHash = {};
	components.forEach(function(component){
		component.absoluteSrc = path.resolve(path.dirname(file), component.src);
		componentHash[component.name] = component;
	});

	// 替换组件实例标签
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
									component,
									tag,
									props = {},
									events = {};

								if(node.name.type === "JSXIdentifier"){
									component = componentHash[node.name.name];
									if(component){
										tag = {
											component: component.componentName,
											componentName: component.name,
											instanceName: "",
											props: props,
											events: events
										};

										tags.push(tag);

										node.attributes.forEach(function(attr){
											var name = attr.name.name;
											if(/^on[A-Z]/.test(name)){
												events[name] = attr.value.value;
											}else{
												props[name] = tempPlaceholder.expression.resume(attr.value.value);
											}
										});

										tag.instanceName = props.id || getTagId();
										delete props.id;

										path.replaceWith(t.JSXOpeningElement(
											t.JSXIdentifier("template"),
											[
												t.JSXAttribute(
													t.JSXIdentifier("is"),
													t.StringLiteral(component.componentName)
												),
												t.JSXAttribute(
													t.JSXIdentifier("data"),
													t.StringLiteral("{{..." + tag.instanceName + "}}")
												)
											],
											true
										));
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
		tags: tags
	};
}