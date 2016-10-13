var commitRegex = /<\!\-\-[\s\S]*?\-\->/g;

module.exports = function(code){
	return code.replace(commitRegex, "");
}