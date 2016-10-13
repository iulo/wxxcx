var _apply = Function.constructor.__proto__.apply;
Function.constructor.__proto__._apply = _apply;
Function.constructor.__proto__.apply = function(target, params){
	if(params[1] === "console.warn('can not create Function')"){
		return this._apply(target, [params[0]]);
	}else{
		return this._apply(target, params);
	}
};