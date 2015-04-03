var getlist = function(){
	console.log("ok")
	$.ajaxLoad("#logTbl","/log", {"data":true}).then(function(data){
		var html = $.tmpl($("#logTmpl").html(), data);
        $("#logTbl tbody").html(html);
	})
}
getlist();
