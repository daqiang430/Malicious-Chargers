var getlist = function(){
	$.ajaxLoad("#phoneTbl","/info", {"data":true}).then(function(data){
		$("#phoneTbl tr .loading").hide();
		var html = $.tmpl($("#deviceTmpl").html(), data.data);
        $("#phoneTbl tbody").html(html);
	})
}
getlist();
