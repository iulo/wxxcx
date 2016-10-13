module.exports = function(tpl, data){
	return tpl.replace(/#([a-z\-]+)#/g, function(match, key){
		return data[key];
	});
}