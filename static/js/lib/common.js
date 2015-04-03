(function() {
    /**
     * 基于配置的事件代理
     * @param  {[type]} configs [description]
     * @return {[type]}         [description]
     */
    $.fn.delegates = function(configs) {
        el = $(this[0]);
        for (var name in configs) {
            var value = configs[name];
            if (typeof value == 'function') {
                var obj = {};
                obj.click = value;
                value = obj;
            };
            for (var type in value) {
                el.delegate(name, type, value[type]);
            }
        }
        return this;
    }

    /**
     * 动态创建一个类
     * @return {[type]} [description]
     */
    $.Class = function(prop) {    
        var cls = function() {        
            function T(args) {            
                return this.init.apply(this, args);        
            }        
            var _t = arguments.callee,
                init = _t.prototype.init;
            T.prototype = _t.prototype; 
            T.prototype.init = function() {            
                var args = arguments;          
                if (args.length === 1 && args[0] instanceof _t) {                
                    return this;             
                };   
                init && init.apply(this, args);             
                return this;        
            };            
            T.constructor = _t;            
            return new T(arguments);     
        };        
        cls.extend = $.Class.extend;
        if (typeof prop == 'function') {
            prop = prop();
        };
        prop = prop || {};
        for (var name in prop) {
            cls.prototype[name] = prop[name];
        }
        return cls;
    }
    /**
     * 类继承
     * @param  {[type]} prop [description]
     * @return {[type]}      [description]
     */
    $.Class.extend = function(prop) {
        if (typeof prop == 'function') {
            prop = prop();
        };
        var _super = this.prototype;
        // Instantiate a base Class (but only create the instance,
        // don't run the init constructor)
        var prototype = $.extend({}, _super);
        for (var name in prop) {
            if (typeof prop[name] == "function" && typeof _super[name] == "function") {
                prototype[name] = (function(name, fn) {
                    return function() {
                        var tmp = this._super;
                        this._super = _super[name];
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;
                        return ret;
                    };
                })(name, prop[name]);
            } else {
                prototype[name] = prop[name];
            }
        }
        var Class = pp.Class(prototype);
        return Class;
    };
    /*
     tornado获取cookid
    */
    $.getCookie = function(name) {
        var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
        return r ? r[1] : undefined;
    }
    /**
     * 将json变为uri参数
     * @param  {[type]} json [description]
     * @return {[type]}      [description]
     */
    $.encodeURIJson = function(json) {
        var s = [];
        for (var p in json) {
            if (json[p] == null) continue;
            if (json[p] instanceof Array) {
                for (var i = 0; i < json[p].length; i++) s.push(encodeURIComponent(p) + '=' + encodeURIComponent(json[p][i]));
            } else
                s.push((p) + '=' + encodeURIComponent(json[p]));
        }
        return s.join('&');
    }
    /**
     * 解析uri里的参数
     * @param  {[type]} url [description]
     * @param  {[type]} key [description]
     * @return {[type]}     [description]
     */
    $.queryUrl = function(url, key) {
        url = url.replace(/^[^?=]*\?/ig, '').split('#')[0]; //去除网址与hash信息
        var json = {};
        //考虑到key中可能有特殊符号如“[].”等，而[]却有是否被编码的可能，所以，牺牲效率以求严谨，就算传了key参数，也是全部解析url。
        url.replace(/(^|&)([^&=]+)=([^&]*)/g, function(a, b, key, value) {
            //对url这样不可信的内容进行decode，可能会抛异常，try一下；另外为了得到最合适的结果，这里要分别try
            try {
                key = decodeURIComponent(key);
            } catch (e) {}

            try {
                value = decodeURIComponent(value);
            } catch (e) {}

            if (!(key in json)) {
                json[key] = /\[\]$/.test(key) ? [value] : value; //如果参数名以[]结尾，则当作数组
            } else if (json[key] instanceof Array) {
                json[key].push(value);
            } else {
                json[key] = [json[key], value];
            }
        });
        return key ? json[key] : json;
    }
    $.getUrlPath = function() {
        var url = location.protocol + "//" + location.hostname;
        if (location.port != "80") {
            url += ":" + location.port;
        };
        url += location.pathname;
        return url;
    }
    /**
     * 分页插件
     * @return {[type]} [description]
     */
    $.pager = $.Class(function() {
        return {
            jump: function() {
                // var value = this.el.find('.pagination-num').val();
                // location.href = getUrl(value);
            },
            init: function(el, totalPage, currentPage, callback, totalNum) {
                this.el = $(el);
                this.totalPage = totalPage;
                if (typeof currentPage == 'function') {
                    currentPage = '';
                    callback = currentPage;
                };
                this.currentPage = currentPage;
                this.callback = callback;
                this.totalNum = totalNum;
            },
            getHtml: function() {
                var page = 1;
                if (this.currentPage) {
                    page = this.currentPage;
                } else {
                    page = $.changeHash().page || 1;
                }
                page = parseInt(page, 10);
                if (this.totalNum == 0) {
                    this.el.hide();
                    return false;
                };
                if (page > this.totalPage) {
                    page = this.totalPage;
                };
                var html = [];
                // if (typeof this.totalNum == 'undefined') {
                //     html.push("<span class='total-record' >共" + totalNum + "条记录</span>");
                // } else {
                //     html.push("<span class='total-record' >共" + this.totalNum + "条记录</span>");
                // }
                // if (page > 1) {
                //     html.push('<a data-page="' + (page - 1) + '" href="#" class="prev">上一页</a>');
                // };
                var num = 3;
                var pageIndex = [];
                for (var i = page - num; i <= page + num; i++) {
                    if (i >= 1 && i <= this.totalPage) {
                        pageIndex.push(i);
                    };
                }
                if (pageIndex[0] > 1) {
                    html.push('<a data-page="1" href="#">1</a>')
                };
                if (pageIndex[0] > 2) {
                    html.push('<span>…</span>');
                };
                for (var i = 0, length = pageIndex.length; i < length; i++) {
                    var p = pageIndex[i];
                    if (p == page) {
                        html.push('<a data-page="' + p + '" href="###" class="current">' + p + '</a>');
                    } else {
                        html.push('<a data-page="' + p + '" href="#">' + p + '</a>');
                    }
                }
                if (pageIndex.length > 1) {
                    var last = pageIndex[pageIndex.length - 1];
                    if (last < (this.totalPage - 1)) {
                        html.push('<span>…</span>');
                    };
                    if (last < this.totalPage) {
                        html.push('<a data-page="' + (this.totalPage) + '" href="#">' + this.totalPage + '</a>')
                    };
                };
                //html.push('<input type="text" class="pagination-num" />');

                //html.push('<a target="" class="jump" href="#">跳转</a>');
                // if (page < this.totalPage) {
                //     html.push('<a data-page="' + (page + 1) + '" href="#" class="next">下一页</a>')
                // };

                html = html.join(' ');
                return html;
            },
            run: function() {
                this.bindEvent();
                var html = this.getHtml();
                this.el.html(html || "");
                if (html) {
                    this.el.show();
                };
            },
            bindEvent: function() {
                if (this.el.attr('event-bind')) {
                    return true;
                }
                this.el.attr('event-bind', 1);
                var self = this;
                this.el.delegates({
                    '.pagination-num': {
                        'keypress': function(e) {
                            if (e.keyCode == 13) {
                                setTimeout(function() {
                                    self.el.find('a.jump').trigger("click");
                                }, 50)
                            };

                        }
                    },
                    'a.jump': function(event) {
                        event.preventDefault();
                        var value = parseInt(self.el.find(".pagination-num").val(), 10);
                        if (!value) {
                            self.el.find(".pagination-num").val('').focus();
                            return;
                        };
                        self.callback && self.callback($.changeHash({
                            page: value
                        }));
                    },
                    'a': function(event) {
                        event.preventDefault();
                        if ($(this).hasClass('current') || $(this).hasClass('jump')) {
                            return true;
                        };
                        self.el.find('a.current').removeClass('current');
                        $(this).addClass('current');
                        self.callback && self.callback($.changeHash({
                            page: $(this).data('page') | 0
                        }));
                        // var off = $(this).parent().parent().prev().offset().top;
                        // $(window).scrollTop(off);
                    }
                })
            }
        }
    });


    /**
     * 表格排序
     * @return {[type]} [description]
     */
    $.tableFieldSort = $.Class(function() {
        var getType = function() {
            var obj = $.changeHash();
            var orderby = obj.orderby;
            if (orderby) {
                orderby = orderby.split("_");
                return {
                    name: orderby[0],
                    type: orderby[1]
                }
            };
            return false;
        }
        return {
            init: function(table, callback) {
                this.table = $(table);
                this.callback = callback;
            },
            run: function() {
                this.table.find('tr th[data-sort]').each(function() {
                    var i = $(this).find('i.icon-op');
                    if (i.length < 1) {
                        $('<i class="icon-op"></i>').appendTo(this);
                    };
                });
                var types = getType();
                if (types) {
                    var i = this.table.find('tr th[data-sort="' + types.name + '"]').find('i.icon-op')
                    i.addClass('icon-op-' + types.type);
                    var j = this.table.find('tr th[data-sort="' + types.name + '"]');
                    j.addClass('sorting');
                };
                this.bindEvent();
            },
            bindEvent: function() {
                var self = this;
                this.table.delegates({
                    'tr th[data-sort]': function() {
                        self.table.find('tr th[data-sort] i.icon-op').removeClass("icon-op-asc").removeClass("icon-op-desc");
                        self.table.find('tr th[data-sort]').removeClass("sorting");
                        var name = $(this).attr("data-sort");
                        var revert = $(this).attr("data-sort-revert"); // 默认升序, 否则降序
                        var types = getType();
                        var type = !! revert ? 'desc' : 'asc';
                        if (types && types.name == name) {
                            if (types.type == 'asc') {
                                type = 'desc';
                            } else if (types.type == 'desc') {
                                type = 'asc';
                            }
                        };
                        $(this).find("i.icon-op").addClass("icon-op-" + type);
                        $(this).addClass("sorting");
                        var obj = $.changeHash({
                            orderby: name + "_" + type
                        });
                        self.callback && self.callback(obj);

                    }
                })
            }
        }
    });

    /**
     * 搜索
     * @return {[type]} [description]
     */
    $.searchField = $.Class(function() {
        var key = "search";
        return {
            init: function(el, callback) {
                this.el = $(el);
                this.callback = callback;
            },
            bindEvent: function() {
                var self = this;
                this.el.delegates({
                    '.search-btn': function() {
                        var value = self.el.find(".search-txt").val();
                        var place = self.el.find(".search-txt").attr("placeholder");
                        if(value==place){
                            value="";
                        }
                        var obj = $.changeHash({
                            search: value
                        });
                        self.callback && self.callback(obj);
                    },
                    '.search-txt': {
                        keypress: function(e) {
                            if (e.keyCode == 13) {
                                self.el.find(".search-btn").trigger("click");
                            };
                        },
                        "click": function(e){
                            $(".search-txt").select();
                        }
                    }
                })
            },
            run: function() {
                var query = $.changeHash();
                var search = query.search;
                if (search) {
                    // var value = decodeURIComponent(search);  // 二次decode，搜索%，刷新页面出错
                    var value = search;
                    this.el.find('.search-txt').val(value);
                };
                this.bindEvent();
            }
        }
    });

    /**
     * 搜索 by dazhuang
     * @return {[type]} [description]
     */
    $.searchField_1 = $.Class(function() {
        var key = "search";
        var ret = 0;
        var lazyTime = 150;
        return {
            init: function(el, callback) {
                this.el = $(el);
                this.ptr = $(el).parent();
                this.callback = callback;
            },
            bindEvent: function() {
                var self = this;
                this.ptr.delegates({
                    '.btn-search':{
                        "click": function(){
                            if($(".all_select").hasClass("checkbox_selected")){
                                $(".all_select").removeClass("checkbox_selected");
                            } else if ($(".all_select").hasClass("checkbox_cancle")) {
                                $(".all_select").removeClass("checkbox_cancle");
                            }           
                            $(".all_select").addClass("checkbox_unselected");
                            self.callback && self.callback();
                        }
                    }
                })
            },
            run: function() {
                var query = $.changeHash();
                var search = query.search;
                if (search) {
                    // var value = decodeURIComponent(search);  // 二次decode，搜索%，刷新页面出错
                    var value = search;
                    this.el.find('.search-text').val(value);
                };
                this.bindEvent();
            }
        }
    });

    /**
     * 过滤器
     * @return {[type]} [description]
     */
    $.filterField = $.Class(function() {
        var ret = 0;
        var lazyTime = 150;
        function getToUrl(name, value) {
            var pars = $.queryUrl(location.href);
            pars[name] = value;
            var url = $.getUrlPath() + "?" + $.encodeURIJson(pars);
            location.href = url;
        }

        function getValue(name) {
            var pars = $.queryUrl(location.href);
            return pars[name] || "";
        }
        return {
            init: function(el) {
                this.el = $(el);
            },
            run: function() {
                this.bindEvent();
                return this;
            },
            bindEvent: function() {
                var self = this;
                var dic={
                    bssid:["MAC地址", "span-mac", ""],
                    essid:["热点名", "span-mac", ""],
                    encryption: ["加密方式", "span-encry", "td-encry"],
                    auth: ["认证服务器", "span-auth", "td-auth"],
                    wps: ["WPS状态", "span-wps", "td-wps"],
                    channel: ["频道", "span-channel", ""]
                 };
                this.el.delegates({
                    ".search-field": {
                        'mouseenter': function(e){
                            $(".btn-search").addClass("search_btn_click");
                            $(".search-text").addClass("search-text-click");
                            $('.search-type').addClass("search-type-click");
                        },
                        'mouseleave': function(e){
                            $(".btn-search").removeClass("search_btn_click");
                            $(".search-text").removeClass("search-text-click");
                            $('.search-type').removeClass("search-type-click");
                        }
                    },
                    ".search-text": {
                        'mouseenter': function(e){
                            e.preventDefault();
                            self.el.find(".search-type").show();
                        },
                        'mouseleave': function (e) {
                            e.preventDefault();
                            clearTimeout(ret);
                            ret = setTimeout(function() {
                                self.el.has(".search-type").find(".search-type").hide();
                            }, lazyTime);
                        },
                        keypress: function(e) {
                            if (e.keyCode == 13) {
                                self.el.find(".btn-search").trigger("click");
                            };
                        },
                        "click": function(e){
                            $(".search-text").select();
                        }
                    },
                    ".search-type":{
                        mouseenter: function() {
                            clearTimeout(ret);
                        },
                        mouseleave: function() {
                            $('.search-type').hide();
                        }
                    },
                    ".radio" : function(event){
                        var thisel = $(this);
                        if(thisel.hasClass("radio-selected")){
                            return;
                        }else{
                            var type = thisel.attr("data-type");
                            var addCl= "radio-selected";
                            var removecl = "radio-unselected";
                            thisel.removeClass(removecl).addClass(addCl);
                            $(".radio[data-type!='" + type + "']").removeClass(addCl).addClass(removecl);
                            var radiodic = {
                                bssid : "MAC地址",
                                essid: "热点名"
                            }
                            try{
                                $("#search_value").attr("placeholder", radiodic[type]);
                            } catch(e){}
                        }        
                    },
                    ".close" : function(event){
                        event.preventDefault();
                        $(".search-text").val();
                        var ptr = $(this).parent("div.con");
                        var key = ptr.attr("data-key");
                        if((key=="bssid")||(key=="essid"))
                            $("#search_value").val("");
                        else if(key=="channel"){
                            $(".channel_li li[data-val!='']").removeClass("selected");
                            $(".channel_li li[data-val='']").addClass("selected");
                        }
                        else{
                            $("#conTbl td span[data-key='"+ key +"'][data-val!='']").removeClass("selected");
                            $("#conTbl td span[data-key='"+ key +"'][data-val='']").addClass("selected");
                        }
                        ptr.remove();
                        var query = {};
                        query[key] = "";
                        $.changeHash(query);
                        $(".btn-search").trigger('click');
                    },
                    ".advanced-btn": function(event){
                        event.preventDefault();
                        $(this).css("color","#008b2c");
                        $(".extend").show();
                    },
                    ".extend": {
                        "mouseleave": function(event){
                            event.preventDefault();
                            $(".advanced-btn").css("color","#6E6E6E");
                            $(".extend").hide();
                        }
                    },
                    "#conTbl tbody tr td": function(event){
                        event.preventDefault();
                        var el = $(this).find("span");
                        if(el.hasClass("selected")){
                            return;
                        } else {
                             var val = el.attr('data-val');
                             var key = el.attr('data-key');
                             var desc = el.html();
                             el.addClass("selected");
                             try{
                                if((key=="encryption")||(key=="auth")||(key=="wps"))
                                $("#conTbl td").find("span."+ dic[key][2] +"[data-val!='" + val + "']").removeClass("selected");
                                $(".select_con").find("div."+dic[key][1]).remove();
                                if(val)
                                    $(".select_con").append("<div class='con " + dic[key][1] + "' data-key='" + key + "' data-val='" + val + "'>" + dic[key][0] + ":"+ desc +"<i class='close'></i></div>");
                                else{
                                    var query = {};
                                    query[key] = "";
                                    $.changeHash(query);
                                }
                             }catch(e){

                             }
                        }
                    },
                    ".channel_li li": function(event){
                        var el = $(this);
                        if(el.hasClass("selected")){
                            return;
                        } else {
                            var val = el.attr('data-val');
                            var desc = el.html();
                            el.addClass("selected");
                            $(".channel_li li[data-val!='" + val + "']").removeClass("selected");
                            $(".select_con div.span-channel").remove();
                            if(val)
                                $(".select_con").append("<div class='con span-channel' data-key='channel' data-val='" + val + "'>频道:"+ desc +"<i class='close'></i></div>");
                            else
                                $.changeHash({channel:""});
                        }
                    },
                    ".btn-apply":function(event){
                        $(".extend").hide();
                        $(".btn-search").trigger("click");
                    },
                    ".btn-clear": function(event){
                        $(".select_con div.span-encry").remove();
                        $(".select_con div.span-auth").remove();
                        $(".select_con div.span-wps").remove();
                        $(".select_con div.span-channel").remove();
                        $("#conTbl td span[data-val!='']").removeClass("selected");
                        $("#conTbl td span[data-val='']").addClass("selected");
                        $(".channel_li li[data-val!='']").removeClass("selected");
                        $(".channel_li li[data-val='']").addClass("selected");
                    }
                })
            }
        }
    });

    /**
     * 转码
     * @param  {[type]} s [description]
     * @return {[type]}   [description]
     */
    $.encode4Html = function(s) {
        var el = document.createElement('pre');
        var text = document.createTextNode(s);
        el.appendChild(text);
        return el.innerHTML;
    }
    /**
     * 弹出层 panel
     * @param  {[type]} configs [description]
     * @return {[type]}         [description]
     */
    $.panel = function(configs) {
        var content = configs.content;
        content = $('<div>' + content + '</div>');
        configs.width = configs.width || 500;
        configs.title = configs.title || "标题"
        var panel = content.dialog(configs);
        panel.on("dialogclose", function() {
            panel.dialog("destroy");
        });
        //$(".ui-dialog-buttonset").children().first().css({padding: "0 20px 0"});
        // $(".ui-dialog-buttonset").children().last().css({"border-style":"solid","border-width":"1px","border-color":"rgb( 223, 223, 223 )","border-radius":"2px","background-color":"rgb( 219, 219, 219 )","color":"#999999"});
        $(".ui-dialog").css({"border-top-left-radius":"2px", "border-top-right-radius":"2px"});
        $(".ui-dialog-buttonset").children().has("span:contains('取消')").addClass("ui-btn-cancel");
        return panel;
    };
    /**
     * 弹出层 alert
     * @param  {[type]} configs [description]
     * @return {[type]}         [description]
     */
    $.alert = function(configs) {
        configs.buttons = [{
            text: configs.button || "确定",
            click: function() {
                $(this).dialog("close");
            }
        }];
        if (typeof configs.modal == 'undefined') {
            configs.modal = true;
        };
        var panel = $.panel(configs);
        return panel;
    }

    /**
     * 弹出层 confirm
     * @param  {[type]}   configs  [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    $.confirm = function(configs, callback) {
        configs.buttons = [{
            text: "取消",
            click: function() {
                $(this).dialog("close");
            }},
            {
            text: configs.button || "确定",
            click: function() {
                callback && callback(this);
            }
        }];
        if (typeof configs.modal == 'undefined') {
            configs.modal = true;
        };
        panel = $.panel(configs);
        return panel;
    }
    /**
     * 提示面板
     * @param  {[type]} el      [description]
     * @param  {[type]} content [description]
     * @return {[type]}         [description]
     */
    $.popup = function(el, content) {
        el = $(el);
        if (el.data("open") == 1) {
            return true;
        };
        el.data("open", 1);
        var configs = {
            title: "提示",
            content: '<div class="zh oneline">' + content + '</div>',
            width: 390,
            height: 230,
            modal: false
            /*           
            position: {
                my: "bottom",
                at: "top",
                of: el
            }
            */
        };
        var defered = $.Deferred();
        var panel = $.confirm(configs, function() {
            defered.resolve(panel);
        });
        panel.on("dialogclose", function() {
            el.data("open", "0");
        });
        $(".ui-dialog-buttonset").css("margin-right","50px");
        // $(".ui-dialog-buttonset").children().first().css({width: "70px"});
        // $(".ui-dialog-buttonset").children().last().css({width: "70px"});
        return defered;
    }
    /**
     * tips 提示
     * @param  {[type]} message [description]
     * @param  {[type]} success [description]
     * @return {[type]}         [description]
     */
    var tipsTimer = 0;
    $.tips = function(message, success, time) {
        time = typeof time !== 'undefined' ? time : 2000;
        var html = ['<div id="tips" class="tips">',
            '<i class="tips-icon"></i>',
            '<span class="tips-txt"></span>',
            '</div>'
        ].join("");
        if ($('#tips').length == 0) {
            $(html).appendTo(document.body);
        };
        var top = Math.max(document.body.scrollTop, document.documentElement.scrollTop, 98);
        $('#tips').css('top', top);
        $('#tips .tips-txt').html(message);
        var type = success ? "success" : "warning";
        $('#tips').show().removeClass('success warning').addClass(type);
        clearTimeout(tipsTimer);
        tipsTimer = setTimeout(function() {
            $('#tips').hide(300);
        }, time);
    }

    /**
     * json接口，返回一个promise
     * @param  {[type]} url  [description]
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    $.getJson = function(url, data) {
        var defered = $.Deferred();
        data = data || {};
        data.r = Math.random();
        $.getJSON(url, data).then(function(data) {
            // 499 需要登录 403 没有权限
            if(typeof(data)=='string')
            {
                var obj = eval('(' + data + ')');
                data = obj;
            }
            if (data.status == 499) { 
                $.tips('请重新登录!');
                setTimeout(function() {
                    location.href = '/admin/logout';
                }, 1000);
                defered.reject();
            } else if (data.status != 200) {
                $.tips(data.message, false);
                defered.reject();
            } else {
                defered.resolve(data);
            }
        });
        return defered;
    }
    /**
     * loading 效果 以及错误处理
     * @param  {[type]} selector [description]
     * @param  {[type]} url      [description]
     * @param  {[type]} data     [description]
     * @return {[type]}          [description]
     */
    $.ajaxLoad = function(selector, url, data) {
        var defered = $.Deferred();
        var loadStr = '<div class="ajax-loading"><i class="loading-icon"></i><span class="loading-txt">数据加载中...</span></div>';
        var el = $(selector);
        if( el.size() <= 0 ) {
            defered.reject();
            return defered
        } 
        if( el.get(0).tagName.toLowerCase() == 'table') {
            var colNum = el.find('tr:first').children().length;
            loadStr = '<tr><td colspan="' + colNum + '" style="height: auto">' + loadStr + '</td></tr>';
            el = el.find('tbody');
        }
        el.html(loadStr);

        data = data || {};
        data.r = Math.random();
        $.getJSON(url, data).then(function(data) {
            // 499 登录 403 没有权限
            if (data.status == 499) {
                $.tips('请重新登录!', false);
                setTimeout(function() {
                    location.href = '/admin/logout';
                }, 1000);
                defered.reject();
            } else if (data.status != 200) {
                el.html('<span class="loading-error">' + data.message + '</span>');
                defered.reject();
            } else {
                defered.resolve(data);
            }
        }, function() {
            el.html('<span class="loading-error">未知错误</span>');
            defered.reject();
        });

        return defered;
    }
    /**
     * 提交接口，返回信息为成功或者失败
     * @param  {[type]} url  [description]
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    $.postTip = function(url, data) {
        var defered = $.Deferred();
        data = data || {};
        // data[$('meta[name="csrf-param"]').attr('content')] = $('meta[name="csrf-token"]').attr('content');
        $.post(url, data).then(function(data) {
            // if (data.token) {
            //     $('meta[name="csrf-token"]').attr('content', data.token);
            // }
            //登录失效
            if (data.status != 200) {
                $.tips(data.message);
            } else {
                $.tips("操作成功", "success");
                defered.resolve(data);
            }
        });
        return defered;
    }
    /**
     * 提交接口，有返回的后续操作
     * @param  {[type]} url  [description]
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    $.postData = function(url, data) {
        data = data || {};
        //data[$('meta[name="csrf-param"]').attr('content')] = $('meta[name="csrf-token"]').attr('content');
        data["_xsrf"] = $.getCookie("_xsrf");
        var defered = $.Deferred();
        $.post(url, data).then(function(data) {
            // if (data.token) {
            //     $('meta[name="csrf-token"]').attr('content', data.token);
            // }
            //登录失效
            // if (data.status == 499) {
            //     location.href = '/admin/login';
            //     return false;
            // };

            if(typeof(data)=='string')
            {
                var obj = eval('(' + data + ')');
                data = obj;
            }
            if (data.status != 200) {
                $.tips(data.message);
            } else {
                defered.resolve(data);
            }
        }).fail(function() {
            // $.tips("系统错误，请稍后重试");
        })
        return defered;
    }

    /**
     * form提交
     * @param  {[type]} form [description]
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    $.postForm = function(form, data) {
        form = $(form);
        data = data || {};
        data[$('meta[name="csrf-param"]').attr('content')] = $('meta[name="csrf-token"]').attr('content');
        for (var name in data) {
            var el = form.find('input[name="' + name + '"]');
            if (el.length == 0) {
                $('<input type="hidden" name="' + name + '" value="' + data[name] + '">').appendTo(form);
            } else {
                el.val(data[name]);
            }
        }
        var defered = $.Deferred();
        form.ajaxSubmit(function(data) {
            if (data.token) {
                $('meta[name="csrf-token"]').attr('content', data.token);
            }
            //登录失效
            if (data.status == 499) {
                location.href = '/admin/login/';
                return false;
            };
            if (data.status != 200) {
                $.tips(data.message);
            } else {
                defered.resolve(data);
            }
        });
        return defered;
    }

    /**
     * 下拉框
     * @return {[type]} [description]
     */
    $.selectField = $.Class(function() {
        var ret = 0;
        var lazyTime = 150;
        return {
            init: function(el, callback) {
                this.el = $(el);
                this.ptr = $(el).parent();
                this.callback = callback;
            },
            bindEvent: function() {
                var self = this;
                this.ptr.delegates({
                    'ul li': function(){
                        if($(this).hasClass("down_selected"))
                            return;
                        var val = $(this).attr("data-val");
                        var thisul = self.ptr.find("ul");
                        if($(this).hasClass("down_unselected")){
                            $(this).removeClass("down_unselected").addClass("down_selected");
                            thisul.find("li[data-val!='" + val + "']").removeClass("down_selected").addClass("down_unselected");
                            self.el.val($(this).html().split("(")[0]).attr("data-val", val);
                        }
                        else{;
                            self.el.val($(this).html()).attr("data-val", val);
                        }
                        thisul.fadeOut("100");
                        self.callback&&self.callback();
                    },
                    'input': {
                        "click" : function(e){
                            var thisul = self.ptr.find("ul");
                            thisul.fadeOut("fast");
                            if( thisul.is(':not(:visible)') ) {
                                if(thisul.height()>300){thisul.css({height:"300"+"px","overflow-y":"scroll" })};
                                thisul.fadeIn("100");
                                thisul.hover(function(){},function(){thisul.fadeOut("100");})
                                thisul.mouseleave(function(){},function(){thisul.fadeOut("100");})
                                thisul.mouseenter(function(){}, function(){clearTimeout(ret);})
                            }
                            else{
                                thisul.fadeOut("fast");
                            }
                        },
                        'mouseleave': function(e){
                            var thisul = self.ptr.find("ul");
                            // ret = setTimeout(function(){
                            //     thisul.fadeOut("fast");
                            // }, lazyTime);
                        }
                    }
                })
            },
            run: function() {
                this.bindEvent();
                return this;
            }
        }
    });
    /**
     * 不选 全选 反选 所有全选
     * @return {[type]} [description]
     */
    $.multiselectField = $.Class(function() {

        return {
            init: function(el, noRefresh) {
                this.el = $(el);
                this.relTable = $("#" + this.el.attr("data-table"));
                this.isCookie = !noRefresh;
            },
            assemble: function() {
                if (this.el.find("i.icon-checkbox").size() > 0 && this.el.find("ul.checked-list").size() > 0) {
                    return;
                }
                var html = [];
                html.push("<i class='icon-checkbox'></i>");
                html.push("<ul class='checked-list'>");
                html.push("<li><a href='###'>无</a></li>");
                html.push("<li><a href='###'>全选</a></li>");
                html.push("<li><a href='###'>反选</a></li>");
                html.push("</ul>");
                this.el.html(html.join(" "));
            },
            bindEvent: function() {
                var that = this;
                this.el.delegates({
                    "i.icon-checkbox": function(e) {
                        e.stopPropagation();

                        $(this).removeClass('part-checked').toggleClass("checked");
                        if ($(this).hasClass("checked")) {
                            that.relTable.find(".JS-checkbox-row").addClass("checked");
                        } else {
                            that.relTable.find(".JS-checkbox-row").removeClass("checked");
                        }
                    },
                    "a": function(e) {
                        e.preventDefault();
                        e.stopPropagation();

                        var el = that.el,
                            relTable = that.relTable,
                            all = relTable.find(".JS-checkbox-row"),
                            checkeds = all.filter(".checked"),
                            elCk = el.find("i.icon-checkbox"),
                            idx = el.find("li").index($(this).parent());

                        if (idx == 0) {
                            var pars = $.queryUrl(location.href);
                            all.removeClass("checked");
                            elCk.removeClass("checked part-checked");
                        }

                        if (idx == 1) {
                            all.addClass("checked");
                            elCk.removeClass('part-checked').addClass("checked");
                        }
                        if (idx == 2) {
                            all.addClass("checked");
                            checkeds.removeClass("checked");

                            checkeds = all.filter(".checked");
                            if (all.size() > 0 && checkeds.size() >= all.size()) {
                                elCk.removeClass('part-checked').addClass("checked");
                            } else if (checkeds.size() > 0) {
                                elCk.removeClass("checked").addClass('part-checked');
                            } else {
                                elCk.removeClass("checked part-checked");
                            }
                        }
                        that.el.trigger("mouseleave");
                    }
                });
                this.relTable.delegates({
                    ".JS-checkbox-row": function(e) {
                        e.stopPropagation();

                        $(this).toggleClass("checked");
                        var el = that.el,
                            relTable = that.relTable;
                        var elCk = el.find("i.icon-checkbox");
                        var all = relTable.find(".JS-checkbox-row");
                        var checkeds = all.filter(".checked");

                        if (all.size() > 0 && checkeds.size() >= all.size()) {
                            elCk.removeClass('part-checked').addClass("checked");
                        } else if (checkeds.size() > 0) {
                            elCk.removeClass('checked').addClass("part-checked");
                        } else {
                            elCk.removeClass("checked part-checked");
                        }
                    }
                });
                this.el.click(function(e) {
                    var el = that.el.find("ul.checked-list");
                    el.is(":visible") ? el.hide() : el.show();
                });
                this.el.mouseleave(function(e) {
                    that.el.find("ul.checked-list").hide();
                });
            },
            run: function() {
                this.assemble();
                this.bindEvent();
                return this;
            },
            getSelectedIds: function() {
                var selectedIds = [];
                this.relTable.find(".JS-checkbox-row.checked").each(function(i, el) {
                    selectedIds.push($(el).attr("data-id"));
                });
                return selectedIds;
            },
            checkedAll: function() {
                this.el.find("i.icon-checkbox").addClass("checked");
                this.relTable.find(".JS-checkbox-row").addClass('checked');
            }
        }
    });

    /**
     * 树状显示数据
     * @param  {[type]} id          [description]
     * @param  {[type]} data        [description]
     * @param  {[type]} indent      [description]
     * @param  {[type]} selectedVal [description]
     * @return {[type]}             [description]
     */
    $.dataToTreeHTML = function(id, data, indent, selectedVal) {
        selectedVal = selectedVal || 0;

        function dataToHtml(data, indent) {
            indent = indent || "";
            var result = [];
            for (var i = 0, length = data.length; i < length; i++) {
                var item = data[i];
                var html = '<option value="' + item.id + '"> ' + indent + item.name + '</option>';
                if (selectedVal == item.id) {
                    html = '<option value="' + item.id + '" selected> ' + indent + item.name + '</option>';
                }
                if (item.children) {
                    html += dataToHtml(item.children, indent + "&nbsp;&nbsp;&nbsp;&nbsp;");
                }
                result.push(html);
            }
            return result.join("");
        }

        function geneGroup(data, pid) {
            pid = pid | 0;
            var result = [];
            for (var i = 0, length = data.length; i < length; i++) {
                var item = data[i];
                if (item.pId == pid) {
                    item.children = geneGroup(data, item.id);
                    result.push(item);
                }
            }
            return result;
        }
        $(dataToHtml(geneGroup(data), indent)).appendTo($(id));
    }
    /**
     * 检测列表的数据
     * @param  {[type]} table [description]
     * @return {[type]}       [description]
     */
    $.checkTblPageData = function(table) {
        var pars = $.queryUrl(location.href);
        var page = parseInt(pars.page, 10) | 0;
        if (page > 1 && typeof pars.checkListData == 'undefined') {
            table = $(table);
            var nums = table.find('tr').length;
            if (nums <= 1) {
                pars.page = page - 1;
                pars.checkListData = 1;
                var url = $.getUrlPath() + "?" + $.encodeURIJson(pars);
                location.href = url;
            };
        };
    }
    /**
     * 修改URL的hash
     * @param  {[type]} json [description]
     * @return {[type]}      [description]
     */
    $.changeHash = function(json) {
        json = json || {};
        var hash = (location.hash || "#").substr(1);
        var obj = $.queryUrl(hash);
        obj = $.extend(obj, json);
        var hash = $.encodeURIJson(obj);
        location.hash = hash;
        return obj;
    }
    /**
     * 初始化页面里的hash，自动将hash上的值定位到页面的输入框里
     * 页面的HTML添加data-name的自定义属性，值为hash的key
     * @return {[type]} [description]
     */
    $.initHash = function() {
        var hash = (location.hash || "#").substr(1);
        var obj = $.queryUrl(hash);
        for (var name in obj) {
            var value = obj[name];
            var selector = '[data-name="' + name + '"]';
            if (!$.isArray(value)) {
                value = [value];
            };
            $(selector).each(function(i) {
                var tag = this.tagName.toLowerCase();
                var tagList = ["input", "select", "textarea"];
                if ($.inArray(tag, tagList) === -1) {
                    return false;
                }
                var val = value.shift();
                if (val === undefined) {
                    return false;
                };
                if (tag == 'input' && this.type == 'checkbox') {
                    if (val == this.value) {
                        this.checked = true;
                        return true;
                    };
                };
                this.value = val;
            })
        }
    }
    /**
     * 初始化页面doc得高度
     * @return {[type]} [description]
     */
    $.initHeight = function(){
        var head = $("#header").height();
        var main = $("#main").height();
        var height = parseInt($(window).height())-head-30;
        $("#main").css("height", height+"px");
        $("#main").css("max-height", height+"px");
    }
     /**
     * 初始化页面里的搜索框，自动将hash上的值定位到页面的输入框里
     * 页面的HTML添加data-name的自定义属性，值为hash的key
     * @return {[type]} [description]
     * 只适合wps
     */
     $.initSearch = function(){
        var authdic = {
            1: "有",
            2: "无"
        };
        var wpsdic = {
            1: '开',
            2: '关'
        };
        var seachdic = {
            bssid: "MAC地址",
            essid: "热点名"
        }
        var query = $.changeHash();
        $.each(query, function(key, val){
            try{
                var desc = val;
                if((key=="bssid")||(key=="essid")){
                    $(".select_con div.span-mac").remove();
                    if(val){
                        desc = seachdic[key];
                        $(".select_con").append("<div class='con span-mac' data-key='" + key +"' data-val='" + val + "'>"+ desc + ":" + val +"<i class='close'></i></div>");
                        $(".radio[data-type!='" + key + "']").removeClass("radio-selected").addClass("radio-unselected");
                        $(".radio[data-type='" + key + "']").addClass("radio-selected").removeClass("radio-unselected");
                        $("#search_value").val(val);
                    }
                } 
                if(key=="encryption"){
                    $(".select_con div.span-encry").remove();
                    $("#conTbl td span.td-encry[data-val='" + val + "']").addClass("selected");
                    $("#conTbl td span.td-encry[data-val!='" + val + "']").removeClass("selected");
                    if(val){
                        $(".select_con").append("<div class='con span-encry' data-key='encryption' data-val='" + val + "'>加密方式:"+ desc +"<i class='close'></i></div>");
                    }
                }
                if(key=="auth"){
                    $(".select_con div.span-auth").remove();
                    $("#conTbl td span.td-auth[data-val='" + val + "']").addClass("selected");
                    $("#conTbl td span.td-auth[data-val!='" + val + "']").removeClass("selected");
                    if(val){
                        desc = authdic[val];
                        $(".select_con").append("<div class='con span-auth' data-key='auth' data-val='" + val + "'>认证服务器:"+ desc +"<i class='close'></i></div>");
                    }
                   
                }
               if(key=="wps"){
                $(".select_con div.span-wps").remove();
                    $("#conTbl td span.td-wps[data-val='" + val + "']").addClass("selected"); 
                    $("#conTbl td span.td-wps[data-val!='" + val + "']").removeClass("selected");
                    if(val){
                        desc = wpsdic[val];
                        $(".select_con").append("<div class='con span-wps' data-key='wps' data-val='" + val + "'>WPS状态:"+ desc +"<i class='close'></i></div>");
                    }
                } 
                if(key=="channel"){
                    $(".select_con div.span-channel").remove();
                    $(".channel_li li[data-val='" + val + "']").addClass("selected");
                    $(".channel_li li[data-val!='" + val + "']").removeClass("selected");
                    if(val){
                        if(val==0)
                            desc = "未知"
                        $(".select_con").append("<div class='con span-channel' data-key='channel' data-val='" + val + "'>频道:"+ desc +"<i class='close'></i></div>");
                    }
                }
                if(key=="status"){
                    var el = $(".select_block ul li[data-val='" + val + "']");
                    el.removeClass("down_unselected").addClass("down_selected");
                    $(".select_block ul li[data-val!='" + val + "']").removeClass("down_selected").addClass("down_unselected"); 
                    $(".select_block input").val(el.html()).attr("data-val", val);
                }
                if(key=="rank"){
                    var el = $(".select_block ul li[data-val='" + val + "']");
                    el.removeClass("down_unselected").addClass("down_selected");
                    $(".select_block ul li[data-val!='" + val + "']").removeClass("down_selected").addClass("down_unselected"); 
                    $(".select_block input").val(el.html().split("(")[0]).attr("data-val", val);
                }
            } catch(e){}
            
        });
     }

    /**
     * 前端模版
     * @return {[type]} [description]
     */
    $.tmpl = (function() {
        var tmplFuns = {};
        var sArrName = "sArrCMX",
            sLeft = sArrName + '.push("';
        var tags = {
            '=': {
                tagG: '=',
                isBgn: 1,
                isEnd: 1,
                sBgn: '",$.encode4Html(',
                sEnd: '),"'
            },
            'js': {
                tagG: 'js',
                isBgn: 1,
                isEnd: 1,
                sBgn: '");',
                sEnd: ';' + sLeft
            },
            'js': {
                tagG: 'js',
                isBgn: 1,
                isEnd: 1,
                sBgn: '");',
                sEnd: ';' + sLeft
            },
            'if': {
                tagG: 'if',
                isBgn: 1,
                rlt: 1,
                sBgn: '");if',
                sEnd: '{' + sLeft
            },
            'elseif': {
                tagG: 'if',
                cond: 1,
                rlt: 1,
                sBgn: '");} else if',
                sEnd: '{' + sLeft
            },
            'else': {
                tagG: 'if',
                cond: 1,
                rlt: 2,
                sEnd: '");}else{' + sLeft
            },
            '/if': {
                tagG: 'if',
                isEnd: 1,
                sEnd: '");}' + sLeft
            },
            'for': {
                tagG: 'for',
                isBgn: 1,
                rlt: 1,
                sBgn: '");for',
                sEnd: '{' + sLeft
            },
            '/for': {
                tagG: 'for',
                isEnd: 1,
                sEnd: '");}' + sLeft
            },
            'while': {
                tagG: 'while',
                isBgn: 1,
                rlt: 1,
                sBgn: '");while',
                sEnd: '{' + sLeft
            },
            '/while': {
                tagG: 'while',
                isEnd: 1,
                sEnd: '");}' + sLeft
            }
        };

        return function(sTmpl, opts) {

            var fun = tmplFuns[sTmpl];
            if (!fun) {
                var N = -1,
                    NStat = [];
                var ss = [
                    [/\{strip\}([\s\S]*?)\{\/strip\}/g,
                        function(a, b) {
                            return b.replace(/[\r\n]\s*\}/g, " }").replace(/[\r\n]\s*/g, "");
                        }
                    ],
                    [/\\/g, '\\\\'],
                    [/"/g, '\\"'],
                    [/\r/g, '\\r'],
                    [/\n/g, '\\n'],
                    [
                        /\{[\s\S]*?\S\}/g,
                        function(a) {
                            a = a.substr(1, a.length - 2);
                            for (var i = 0; i < ss2.length; i++) {
                                a = a.replace(ss2[i][0], ss2[i][1]);
                            }
                            var tagName = a;
                            if (/^(=|.\w+)/.test(tagName)) {
                                tagName = RegExp.$1;
                            }
                            var tag = tags[tagName];
                            if (tag) {
                                if (tag.isBgn) {
                                    var stat = NStat[++N] = {
                                        tagG: tag.tagG,
                                        rlt: tag.rlt
                                    };
                                }
                                if (tag.isEnd) {
                                    if (N < 0) {
                                        throw new Error("Unexpected Tag: " + a);
                                    }
                                    stat = NStat[N--];
                                    if (stat.tagG != tag.tagG) {
                                        throw new Error("Unmatch Tags: " + stat.tagG + "--" + tagName);
                                    }
                                } else if (!tag.isBgn) {
                                    if (N < 0) {
                                        throw new Error("Unexpected Tag:" + a);
                                    }
                                    stat = NStat[N];
                                    if (stat.tagG != tag.tagG) {
                                        throw new Error("Unmatch Tags: " + stat.tagG + "--" + tagName);
                                    }
                                    if (tag.cond && !(tag.cond & stat.rlt)) {
                                        throw new Error("Unexpected Tag: " + tagName);
                                    }
                                    stat.rlt = tag.rlt;
                                }
                                return (tag.sBgn || '') + a.substr(tagName.length) + (tag.sEnd || '');
                            } else {
                                return '",(' + a + '),"';
                            }
                        }
                    ]
                ];
                var ss2 = [
                    [/\\n/g, '\n'],
                    [/\\r/g, '\r'],
                    [/\\"/g, '"'],
                    [/\\\\/g, '\\'],
                    [/\$(\w+)/g, 'opts["$1"]'],
                    [/print\(/g, sArrName + '.push(']
                ];
                for (var i = 0; i < ss.length; i++) {
                    sTmpl = sTmpl.replace(ss[i][0], ss[i][1]);
                }
                if (N >= 0) {
                    throw new Error("Lose end Tag: " + NStat[N].tagG);
                }

                sTmpl = sTmpl.replace(/##7b/g, '{').replace(/##7d/g, '}').replace(/##23/g, '#');
                sTmpl = 'var ' + sArrName + '=[];' + sLeft + sTmpl + '");return ' + sArrName + '.join("");';

                tmplFuns[sTmpl] = fun = new Function('opts', sTmpl);
            }

            if (arguments.length > 1) {
                return fun(opts);
            }
            return fun;
        };
    }());

})();
