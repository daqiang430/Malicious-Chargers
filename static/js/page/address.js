
var getlist = function(){
	$.ajaxLoad("#addressTbl","/address", {"data":true}).then(function(data){
		$("#addressTbl tr .loading").hide();
		var html = $.tmpl($("#addressTmpl").html(), data);
        $("#addressTbl tbody").html(html);
	})
}
getlist();
