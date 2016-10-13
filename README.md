# 微信小程序开发框架
增强微信小程序框架上的一些功能
### 1、增加页面之间通信机制
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
### 2、增加自定义组件功能
```html
<import name="abc" src="...">
<abc style="xxx" onChange="xxx" />
```
### 3、增加全局通用组件机制
```javascript
alert("message");
toast("message");
...
```
### 4、增强require功能

支持相对于项目跟目录的绝对路径地址，省去../../...之类的麻烦

### 5、增加globalData变化的监听

可以监听globalData上某些字段的修改
```javascript
this.listenerGlobalData(keys, listener)
```
