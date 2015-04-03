
var getlist = function(){
	$.ajaxLoad("#dataTbl","/config", {"data":true}).then(function(data){
		var html = $.tmpl($("#dataTmpl").html(), data);
        $("#dataTbl tbody").html(html);
	})
}
getlist();
