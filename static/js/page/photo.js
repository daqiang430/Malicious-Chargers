
var getlist = function(){
	$.ajaxLoad("#photoTbl", "/photo", {"data":true}).then(function(data){
		var html = $.tmpl($("#photoTmpl").html(), data);
        $("#photoTbl").html(html);
        //遮罩层
    	records = data.records;
    	$("#slide .slider-content").empty();
    	$("#slider2 .nav-content").empty();
        $.each(records, function(i, j){
        	var src = "/node/?nodeid=" + j.md5;
        	$("#slide .slider-content").append("<li class='sc-item' filename='" + j.filename + "'><img class='animation-mark animated fadeInUp' src='" + src + "'></li>");
			$("#slider2 .nav-content").append("<li class='sn-item'><img  src='" + src + "'></div></li>");
        })
    	$("li.sc-item:eq(0)").find(".animation-mark").show();
        $('#slide').switchable({
            triggers: $(".nav-content li"),
		    currentTrigger: 'current',
		    triggerType: 'hover',
		    panels: 'li',
        	easing: 'ease-in-out',
		    effect: 'scrollLeft',
		    end2end: true,
		    autoplay: false,
            interval: 3,
            visible: 5,
            prev: $('.prev'),
            next: $('.next'),
		    horiz: true,
		    loop: true,
	   	    onSwitch: function(i, j){
			    var api = this;
			    var index = api.index;
			    $("li.sc-item:not(li.sc-item:eq(" + index + "))").find(".animation-mark").hide();
			    $("li.sc-item:eq(" + index + ")").find(".animation-mark").show();
			    $(".large-title").html($("li.sc-item:eq(" + index + ")").attr("filename"));
            }
		});
        $('#slider2').switchable({
            visible: 5,
            triggers: false,
	  		panels: 'li',
            easing: 'ease-in-out',
		    effect: 'scrollLeft',
		    end2end: true,
		    autoplay: false,
            interval: 3,
            prev: $('.prev'),
            next: $('.next'),
		    horiz: true,
		    loop: true,
		});
        $('.switchable-cloned').removeClass('current');
	})
}
getlist();
