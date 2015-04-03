
var getlist = function(){
	$.ajaxLoad("#videoTbl", "/video", {"data":true}).then(function(data){
		var html = $.tmpl($("#videoTmpl").html(), data);
        $("#videoTbl").html(html);
	})
}
getlist();
