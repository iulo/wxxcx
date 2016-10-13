module.exports = {
	expression: {
		replace: function(code){
			return code.replace(/\{\{/g, "__@__begin__@__{").replace(/\}\}/g, "}__@__end__@__");
		},
		resume: function(code){
			return code.replace(/__@__begin__@__\{/g, "{{").replace(/\}__@__end__@__/g, "}}");
		}
	},
	containerTag: {
		replace: function(code){
			return "<elong-root>" + code + "</elong-root>";
		},
		resume: function(code){
			return code.replace(/^<elong\-root>/, "").replace(/<\/elong\-root>;?$/, "");
		}
	}
};