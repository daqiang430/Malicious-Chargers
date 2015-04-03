var getlist = function(){
	$.ajaxLoad("#jailTbl","/jail", {"data":true}).then(function(data){
		var html = $.tmpl($("#jailTmpl").html(), data);
        $("#jailTbl tbody").html(html);
	})
}
getlist();
