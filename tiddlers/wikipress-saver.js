/*\
title: $:/RobertP3469/modules/savers/wikipress-saver.js
type: application/javascript
module-type: saver
\*/
(function(){

"use strict";

var WikipressSaver = function(wiki) {
};

WikipressSaver.prototype.save = function(text,method,callback) {

	/* we have to be in an iFrame */
	if (window.top === window.self){
		return false;
	}	
	
	var postID = parent.document.getElementById('txtPostId').value;
	if(!postID){
		return false;
	}
	
	var nonce = parent.document.getElementById('wikipress_save_nonce').value;
	if(!nonce){
		return false;
	}
	
	var ajaxURL = parent.document.getElementById('txtAjaxUrl').value;
	if(!ajaxURL){
		return false;
	}

	var el = document.querySelector(".tc-site-title .tc-tiddlylink");
	if(!el) el = document.querySelector(".tc-site-title");
	
	if(!el){
		alert('Title for this ebook not found.  Wikipress save operation canceled.');
		return false;
	}
	
	var postTitle = el.textContent;
	if(!postTitle){
		alert('Title for this ebook is missing.  Wikipress save operation canceled.');
		return false;
	}	

	
	var dataIn = {
		action: 'rdp_wikipress_save',
		security: nonce,
		post_id: postID,
		post_title: postTitle,
		wiki: text
	};
	

	$tw.utils.httpRequest({
		url: ajaxURL,
		type: "POST",
		data: dataIn,
		callback: function(err,data,xhr) {

			var obj = JSON.parse(data);

			if(err) {
				// response is textual: "XMLHttpRequest error code: 412"
				var status = Number(err.substring(err.indexOf(':') + 2, err.length))
				if(status === 412) { // edit conflict
					var message = $tw.language.getString("Error/EditConflict");
					return callback(message);
				} else {
					return callback(err); // fail
				}
			} else {
				if(obj.success){
					callback(null); // success
					
					if(obj.data.need_redirect){
						parent.location = obj.data.url;
					}
					
				} else {
					return callback(obj.data.message);
				}
				
			}
		}
	});	
	
	return true;
};

/*
Information about this saver
*/
WikipressSaver.prototype.info = {
	name: "wikipress",
	priority: 4000,
	capabilities: ["save","autosave"]
};

/*
Static method that returns true if this saver is capable of working
*/
exports.canSave = function(wiki) {
	return true;
};

/*
Create an instance of this saver
*/
exports.create = function(wiki) {
	return new WikipressSaver(wiki);
};
})();