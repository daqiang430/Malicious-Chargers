
var getlist = function(){
	$.ajaxLoad("#calendarTbl","/calendar", {"data":true}).then(function(data){
		$("#calendarTbl tr .loading").hide();
		var html = $.tmpl($("#calendarTmpl").html(), data);
        $("#calendarTbl tbody").html(html);
	})
}
getlist();
