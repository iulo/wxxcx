var path = require("path");
var fs = require("fs");

// 创建所有目录
function mkdirs(dirpath, callback) {
    fs.exists(dirpath, function(exists) {
        if(exists) {
                callback(dirpath);
        } else {
                //尝试创建父目录，然后再创建当前目录
                mkdirs(path.dirname(dirpath), function(){
                        fs.mkdir(dirpath, callback);
                });
        }
    });
};

mkdirs.sync = function(dirpath){
    if(fs.existsSync(dirpath)){
        return true;
    }else{
        if(mkdirs.sync(path.dirname(dirpath))){
            fs.mkdirSync(dirpath);
            return true;
        }
    }
};

module.exports = mkdirs;