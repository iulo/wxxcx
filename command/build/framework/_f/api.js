/**
 * 支持绝对路径
 * 路径中pages可以省略
 */
var PageEvents = require("./page-events.js");
var path = require("./path.js");

function transPageUrl(url, __dirname, pagedir){
	url = url.split("?");
	var params = url.length > 1 ? "?" + url[1] : "";
	url = url[0];

	// if(!/\/index$/.test(url)){
	// 	url += "/index";
	// }

	if(/^\.{1,2}\//.test(url)){
		url = path.join(__dirname, url);
	}

	url = (pagedir ? pagedir.split("/").map(function(item){ return ".."; }).join("/") : ".") + "/" + (/^(components|pages)\//.test(url) ? "" : "pages/") + url;

	return url + params;
}

var Undefined = (function(){})();

var API = {
	request: wx.request,
	File: {
		upload: wx.uploadFile,
		download: wx.downloadFile
	},
	Socket: {
		connect: wx.connectSocket,
		onOpen: wx.onSocketOpen,
		onError: wx.onSocketError,
		sendMessage: wx.sendSocketMessage,
		onMessage: wx.onSocketMessage,
		close: wx.closeSocket,
		onClose: wx.closeSocket
	},
	Image: {
		choose: wx.chooseImage,
		preview: wx.previewImage
	},
	Record: {
		start: wx.startRecord,
		stop: wx.stopRecord,
	},
	Voice: {
		play: wx.playVoice,
		pause: wx.pauseVoice,
		stop: wx.stopVoice
	},
	BackgroundAudio: {
		getPlayerState: wx.getBackgroundAudioPlayerState,
		play: wx.playBackgroundAudio,
		pause: wx.pauseBackgroundAudio,
		seek: wx.seekBackgroundAudio,
		stop: wx.stopBackgroundAudio,
		onPlay: wx.onBackgroundAudioPlay,
		onPause: wx.onBackgroundAudioPause,
		onStop: wx.onBackgroundAudioStop
	},
	saveFile: wx.saveFile,
	Video: {
		choose: wx.chooseVideo
	},
	// 持久存储
	Storage: {
		set: wx.setStorage,
		setSync: wx.setStorageSync,
		get: wx.getStorage,
		getSync: wx.getStorageSync,
		remove: function(options){
			options.data = Undefined;
			this.set(options);
		},
		removeSync: function(key){
			this.setSync(key, Undefined);
		},
		clear: wx.clearStorage,
		clearSync: wx.clearStorageSync
	},
	// 临时存储
	Cache: {
		_caches: {},
		set: function(key, data){
			this._caches[key] = data;
		},
		get: function(key){
			return this._caches[key];
		},
		clear: function(){
			this._caches = {};
		}
	},
	Location: {
		get: wx.getLocation,
		open: wx.openLocation
	},
	getNetworkType: wx.getNetworkType,
	getSystemInfo: wx.getSystemInfo,
	onAccelerometerChange: wx.onAccelerometerChange,
	onCompassChange: wx.onCompassChange,
	NavigationBar: {
		setTitle: wx.setNavigationBarTitle,
		showLoading: wx.showNavigationBarLoading,
		hideLoading: wx.hideNavigationBarLoading
	},
	Navigate: {
		go: wx.navigateTo,
		back: wx.navigateBack,
		redirectTo: wx.redirectTo
	},
	createAnimation: wx.createAnimation,
	createContext: wx.createContext,
	drawCanvas: wx.drawCanvas,
	hideKeyboard: wx.hideKeyboard,
	stopPullDownRefresh: wx.stopPullDownRefresh,
	login: wx.login,
	getUserInfo: wx.getUserInfo,
	requestPayment: wx.requestPayment
};

module.exports = function(__dirname){
	var api = {};
	for(var key in API){
		api[key] = API[key];
	}

	// 扩展路由路径规则
	api.Navigate = {
		back: api.Navigate.back,
		go: function(options){
			options.url = transPageUrl(options.url, __dirname, path.dirname(getApp().getCurrentPage().__route__));

			var event = PageEvents.register(null, options.params);

			delete options.params;

			options.url += (options.url.indexOf("?") === -1 ? "?" : "&") + "_eventId=" + event.eventId;

			wx.navigateTo(options);

			return event;
		},
		redirectTo: function(options){
			options.url = transPageUrl(options.url, __dirname, path.dirname(getApp().getCurrentPage().__route__));

			var event = PageEvents.register(null, options.params);

			delete options.params;
			
			options.url += (options.url.indexOf("?") === -1 ? "?" : "&") + "_eventId=" + event.eventId;

			// 页面重定向后，针对当前页面的所有事件监听全部转移到新跳转的页面
			var events = PageEvents.events;
			var currentEvent = events[getApp().getCurrentPage()._eventId];
			if(currentEvent){
				events[event.eventId].listeners = currentEvent.listeners;
			}

			wx.redirectTo(options);

			return event;
		}
	};

	return api;
};