function(){
	var params = Array.prototype.concat.apply([], arguments);
	var projectpath = n.getProject(params[0]).projectpath;
	exec("wxxcx build", {
		cwd: projectpath,
		env: {
			PATH: '/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin'
		}
	}, function(err, stdout, stderr){
		var buildpath = /\-build$/.test(projectpath) ? projectpath : projectpath + "-build";
		e.apply(null, params.concat(buildpath));
	});
}