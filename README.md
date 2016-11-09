# 微信小程序开发框架
增强微信小程序框架上的一些功能
## 安装
仅需在命令行运行以下两行命令，就可以在项目中使用以下所有功能，无需额外引入其他文件
```shell
npm i weixin-xcx -g
wxxcx install
```
## 功能
#### 1、增加页面之间通信机制
```javascript
var newPage = api.go({
  url: "...",
  params: {...}
});
// 监听默认事件
newPage.on("onLoad", function(options){
  ...
});
// 监听自定义事件
newPage.on("aaa", function(data){
  ...
});
```
#### 2、增加自定义组件功能
```html
<import name="abc" src="...">
<view class="container">
    ...
    <abc style="xxx" onChange="xxx" />
    ...
</view>
```
#### 3、增加window对象
在window对象上添加的属性、方法，可以全局直接调用，以此可以创建全局性通用组件
```javascript
window.alert = function(message){
    console.log(message);
};

alert("message");
...
```
#### 4、增强require功能
支持相对于项目根目录的绝对路径地址，省去../../...之类的麻烦
```javascript
var tool = require("lib/tool");
```

#### 5、增加globalData变化的监听
Page中可以监听globalData上某些字段的修改
```javascript
this.globalData.on(["a", "b"], function(){
    ...
})
```
