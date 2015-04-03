$(function(){
	var divWidth,maxTextCount,gap,texts,space,colors,perWidth;
    var rainArray,rainCounts;
    var initVariant = function() {
        divWidth = 16;
        maxTextCount = 60;
        gap = 100;
        texts = ["0","1"];
        space = " ";
        colors = ["#86eedc","#6acab4"];
        rainArray = [];
        perWidth = divWidth + gap;
        rainCounts = Math.floor(screen.availWidth / perWidth);
    }
    var createRainObjects = function() {
        for (var i=0;i < rainCounts;i++) {
            var rainObj = getRainObj(i);
            rainArray.push(rainObj);
        }
    }
    var getRainObj = function(rainIndex) {
        var rainObj = {};
        var div = document.createElement("div");
        div.style.fontSize = divWidth + "px";
        div.style.left = rainIndex * perWidth + "px";
        div.style.width = divWidth + "px";
        div.style.position = "absolute";
        div.style.zIndex = "-1";
         
        var text1 = getSpanUpText();
        var spanUp = createSpan(text1,colors[0]);
        div.appendChild(spanUp);
        rainObj.spanUp = spanUp;
         
        var text2 = getSpanDownText();
        var spanDown = createSpan(text2,colors[1]);
        div.appendChild(spanDown);
        rainObj.spanDown = spanDown;
         
        rainObj.topOfDiv = -(text1.length + 2) * divWidth;
        div.style.top = rainObj.topOfDiv + "px";
        document.body.appendChild(div);
        rainObj.div = div;
         
        rainObj.moveStep = divWidth + Math.round(Math.random() * divWidth);
        return rainObj;
    }
    var doMove = function(){
        for (var i=0;i < rainArray.length;i++) {
            var rainObj = rainArray[i];
            rainObj.topOfDiv += rainObj.moveStep;
            if (rainObj.topOfDiv > document.body.clientHeight) {
                var text1 = getSpanUpText();
                rainObj.topOfDiv = -(text1.length + 2) * divWidth;
                rainObj.spanUp.innerText = text1;
            }
            var text2 = getSpanDownText();
            rainObj.spanDown.innerText = text2;
            rainObj.div.style.top = rainObj.topOfDiv + "px";
        }   
    }
    doCycle = function() {
        doMove();
        setTimeout("doCycle()",60);
    }
    
    var createSpan = function(txt,color) {
        var span = document.createElement("span");
        span.style.color = color;
        span.style.textShadow = "0px 0px 10px #2de8ad";
        span.innerText = txt;
        return span;
    }
    var getSpanUpText = function () {
        var count = 1 + Math.round(Math.random()*(maxTextCount - 2));
        var rettext = "";
        for (var j=0;j < count;j++) {
            var t = Math.round(Math.random()*(texts.length-1));
            rettext += texts[t] + space;
        }
        return rettext;
    }
    var getSpanDownText = function() {
        var t = Math.round(Math.random()*(texts.length-1));
        return texts[t];
    }
	var init = function() {
        initVariant();
        createRainObjects();
        doCycle();
    }
    /**
     * 设置默认文件夹
     *
     */


    // var checkAndSetCookid = function(name = ""){
    //     if(name){
    //         $.cookie('packageName', name, {
    //             expires: 36500,
    //             path: '/'
    //         });
    //     }else{
    //         if($.cookie("packageName")){
    //             var pack = [];
    //             $(".long_ul li").each(function(i, j){
    //                 pack.push($.trim($(this).html()));
    //             })
    //         }
    //     }
    // }
    //init();
    var getfile = function(md5, filename){
        $(".inner-cont").addClass("hide");
        $("#main").append('<div class="inner-cont file"></div>');
        $.ajaxLoad(".inner-cont.file", "/detail", {"nodeid": md5}).then(function(data){
            if(filename=="Recents"){
                var html = $.tmpl($("#recentTmpl").html(), data.data.records);
            }else if(filename=="call_history.db"){
                var html = $.tmpl($("#historyTmpl").html(), data.data.records);
            }else if(filename=="Bookmarks.db"){
                var html = $.tmpl($("#bookmarksTmpl").html(), data.data.records);
            }else if(filename=="Cookies.binarycookies"){
                var html = $.tmpl($("#cookieTmpl").html(), data.data);
            }else if(filename=="keychain_data"){
                var html = $.tmpl($("#jailBreakTmpl").html(), data.data);
            }else{
                var html = '<pre><xmp>' + data.data.file + '</xmp></pre>'
            }
            $(".inner-cont.file").html(html);
            
        })
    }
    $(document.body).delegates({
        ".tr-file": function(event){
            event.preventDefault();
            var md5 = $(this).attr("data-md5");
            var filename = $(this).find("td").html();
            if(!md5) return;
            $(".inner-title").append("<span class='append-span'> &gt; </span><span class='append-span'>" + filename + "</span>")
            getfile(md5, filename);
        },
        "td.td-op" : function(event){
            event.preventDefault();
            var el = $(this);
            var ptr = $(this).parent("tr");
            var child = $(this).find("i")
            if(child.hasClass("op-fold")){
                child.removeClass("op-fold").addClass("op-unfold");
                child.html("收起");
                ptr.next("tr.link").removeClass("hide");
            }
            else{
                child.removeClass("op-unfold").addClass("op-fold");
                child.html("展开");
                ptr.next("tr.link").addClass("hide");
            }
        },
        ".active-nav" : function(event){
            event.preventDefault();
            $("div").remove(".inner-cont.file");
            $(".inner-cont").removeClass("hide");
            $("span").remove(".append-span");
            getlist();
        },
        ".video-item" : function(e){
            e.preventDefault();
            var src = $(this).attr("src");
            var filename = $(this).attr("data-file");
            if(!filename) return;
            $(".inner-cont").addClass("hide");
            $("#main").append('<div class="inner-cont file"></div>');
            $(".inner-title").append("<span class='append-span'> &gt; </span><span class='append-span'>" + filename + "</span>")
            var content = "<div class='video-cont'><video controls='controls' width='764' height='406'><source src='" + src + "' type='video/ogg'><source src='" + src + "' type='video/mp4'>Your browser does not support the video tag.</video></div>";
            $(".inner-cont.file").html(content);
        },
        ".photo-item" : function(e){
            e.preventDefault();
            var index = $(this).index();
            $(".overlay").removeClass("hide");
            $("li.sn-item:eq(" + index + ")").trigger("click");
        },
        ".close": function(e){
            $(".overlay").addClass("hide");
        }
    })
    $.initHeight();
    resizeRet = 0;
    $(window).resize(function(){
         clearTimeout(resizeRet);
         resizeRet = setTimeout(function(){
             $.initHeight();
         }, 50)
    });
    $.selectField("#phone", function(){
        var param = {
            cur : $.trim($("#phone").val())
        }
        $.postData("/package", param).then(function(data){
            $(".select-phone").html(param["cur"]);
            $(".active-nav").trigger("click");
        })
    }).run();
});