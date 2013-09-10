var ajaxRequest = {
	settings: {
		delay_time: 4500,
		img_url: urlPath.getImages(),
		img_loaded: 'ajax_ok.png',
		img_error: 'ajax_error.png',
		img_loading: 'ajax_loader.gif',
		text_loaded: 'ok',
		text_error: 'x',
		text_loading: '...',
		message_wrapper: $('<div class="alert"></div>'),
		message_text_wrapper: $('<p></p>'),
		loader_selector: '.ajaxrequest-loader',
		status_success: 'alert-success',
		status_error: 'alert-error',
		status_default: 'alert-info'
	},
	
	default_selector: '.ajaxrequest-loader',
	message_text: '',
	
    init: function(config){
		// provide for custom configuration via init()
		if (config && typeof(config) == 'object') {
			$.extend(ajaxRequest.settings, config);
		}
	},
	
	createLoaderImage: function(type, width){
		var img,alt;
		var pat = /^\d+$/;
		if( typeof(width)!="undefined" ){
			if( pat.test(width) ) width = width;
			else width = "24";
		}else width = "24";
		
		if(type=="success"){
			img = ajaxRequest.settings.img_loaded;
			alt = ajaxRequest.settings.text_loaded;
		}else if(type=="error"){
			img = ajaxRequest.settings.img_error;
			alt = ajaxRequest.settings.text_error;
		}else{
			img = ajaxRequest.settings.img_loading;
			alt = ajaxRequest.settings.text_loading;
		}
		
		return $("<img src='"+ajaxRequest.getImageUrl()+img+"' width='"+width+"' alt='"+alt+"' />")[0];
	},
	
	createInlineLoader: function(type, width){
		$inline_loader = ajaxRequest.getLoaderSelector();
		
		$inline_loader.html('');
		$inline_loader.append(ajaxRequest.createLoaderImage(type, width));
		
		$inline_loader.show();
	},
	
	setMsgText: function(text){
		ajaxRequest.message_text = text;
	},

	getMsgWrapper: function(){
		return ajaxRequest.settings.message_wrapper;
	},

	setMsgWrapper: function(wrapper){
		ajaxRequest.settings.message_wrapper = wrapper;
	},

	getMsgText: function(){
		return ajaxRequest.message_text;
	},
	
	getImageUrl: function(){
		return ajaxRequest.settings.img_url;
	},
	
	getLoaderSelector: function(){
		var resp;
		var loader = ajaxRequest.settings.loader_selector;
		
		if(typeof(loader)=='string')
			resp = $(loader);
		else if(typeof(loader)=='object')
			resp = loader;
		else
			resp = false;
		
		return resp;
	},
	
	setLoaderSelector: function(selector){
		ajaxRequest.settings.loader_selector = selector;
	},
	
	showMessageNoAjax: function(text, type, autoclear){
		if( autoclear!='true' && autoclear!='false') autoclear = 'false';
		$( getElText() ).html(text);
		$( getElResp() ).attr("class","admMsg"+type);
		$(window).scrollTop(0);
		showAdmMsg();
		
		if(autoclear=='true') clearAdmMsg();
	},
	
	clearMessage: function(){
		$el = ajaxRequest.getMsgWrapper();
		$el.delay(5000).fadeOut(800, function(){ $el.remove()} );
	},
	
	toggleMessage: function(){
		$el = ajaxRequest.getMsgWrapper();
		if( !$el.is(":visible") ) ajaxRequest.showMessage();
		else ajaxRequest.hideMessage();
	},
	
	showMessage: function(status){
		ajaxRequest.setMessageStatus(status);
		
		$selector = ajaxRequest.getLoaderSelector();
		$message = ajaxRequest.getMsgWrapper();
		
		var pos = $selector.position();
		
		$text = ajaxRequest.settings.message_text_wrapper.text(ajaxRequest.message_text);
		
		$message.append($text);		
		$('body').append($message);
		
		$message.css({'top':pos.top+45, 'left':pos.left-50, 'position': 'absolute'});
		$message.fadeIn(800);
	},
	
	hideMessage: function(){
		ajaxRequest.clearMessage();
	},
	
	setMessageStatus: function(status){
		type = (typeof(status)=='undefined')?'default':status;
		$el = ajaxRequest.getMsgWrapper();
		
		//reset status
		$el.removeClass(ajaxRequest.settings.status_success);
		$el.removeClass(ajaxRequest.settings.status_error);
		$el.removeClass(ajaxRequest.settings.status_default);
		
		if( type=='success')
			$el.addClass(ajaxRequest.settings.status_success);
		else if( type=='error' )
			$el.addClass(ajaxRequest.settings.status_error);
		else
			$el.addClass(ajaxRequest.settings.status_default);
		
		ajaxRequest.setMsgWrapper($el);
	},
	
	request: function(url, tgt_selector, dataSend, callback){
		var args = new Array();
		if(typeof tgt_selector !== 'undefined'){
			ajaxRequest.setLoaderSelector(tgt_selector);
		}
				
		ajaxRequest.createInlineLoader('load', 20);
		
		if( typeof(callback) == "function" ){ 
			if(typeof(arguments[4])!='undefined'){
				for(i=4;i<arguments.length;i++){
					args.push(arguments[i]);
				}
			}
		}
		
		$.ajax({
			url: url,
			data: dataSend,
			type: "POST",
			dataType: 'script',
			success:function(){
				if( ajaxResponse.msgType == "success" || ajaxResponse.msgStatus == 200 ){
					ajaxRequest.createInlineLoader(ajaxResponse.msgType, 20);
				}else{
					ajaxRequest.createInlineLoader("error", 20);
				}
				ajaxRequest.getLoaderSelector().delay(2000).fadeOut(800);
				
				ajaxRequest.setMsgText(ajaxResponse.response);
				ajaxRequest.showMessage(ajaxResponse.msgType, tgt_selector);
				
				if( ajaxResponse.autoclear=="true" ) ajaxRequest.clearMessage();
				
				if( typeof(callback) == "function" ){
					args.unshift(ajaxResponse);
					callback.apply(callback.name,args);
				}
				
				ajaxRequest.setLoaderSelector(ajaxRequest.default_selector);
			}
			
		});
		
		
	}
}
