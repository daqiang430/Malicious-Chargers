
var getlist = function(){
	$.ajaxLoad("#messageTbl","/message", {"data":true}).then(function(data){
		$("#messageTbl tr .loading").hide();
		var html = $.tmpl($("#messageTmpl").html(), data);
        $("#messageTbl tbody").html(html);
	})
}
getlist();
