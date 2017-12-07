Ext.ns("QNAP.QOS");
Ext.ns("QNAP.CMP");
Ext.ns("QNAP.QOS.CMP.STATE");
Ext.ns("QNAP.CMP.Plugin");
Ext.Component.prototype.stateful = false;
Ext.util.Cookies.clear = function(a, b) {
    document.cookie = a + "=; expires=" + new Date().toUTCString() + ";" + (b ? " path=" + b + ";" : "")
};
var userAgent = navigator.userAgent.toLowerCase();
Ext.isIE9 = /msie 9/i.test(userAgent);
Ext.isIE10 = /msie 10/i.test(userAgent);
Ext.isIE11 = /trident\/7\.0;/i.test(userAgent) && / rv:11/i.test(userAgent);
Ext.isNexus7 = /nexus 7/i.test(userAgent);
Ext.isEdge = /edge\//i.test(userAgent);
Ext.BLANK_IMAGE_URL = Ext.isIE6 || Ext.isIE7 || Ext.isAir ? "/libs/extjs-3.3.3/resources/images/default/s.gif" : "data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
Ext.isSupportFileBlob = window.Blob ? true : false;
if (Ext.isIE11 || Ext.isIE10 || Ext.isIE9) {
    Ext.isIE6 = false;
    Ext.isIE = true
}
if (Ext.isIE10) {
    Ext.getBody().addClass("ext-ie10")
}
Ext.isIPhone = /iPhone/i.test(userAgent);
Ext.isIPod = /iPod/i.test(userAgent);
Ext.isIPad = /iPad/i.test(userAgent);
Ext.isIos = Ext.isIPad || Ext.isIPhone || Ext.isIPod;
Ext.isChromeBook = /CrOS/.test(userAgent);
Ext.useShims = Ext.isIE6 || (Ext.isMac && Ext.isGecko2);
Ext.supportWheelEvent = "onwheel" in document.createElement("div") ? "wheel" : document.onmousewheel !== undefined ? "mousewheel" : "DOMMouseScroll";
userAgent = undefined;
RegExp.escape = function(a) {
    return a.toString().replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
};
if (Ext.isIos) {
    var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
    Ext.iosVer = [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3], 10)]
}
Ext.apply(QNAP.QOS.config, {
    defaultWindowWidth: 800,
    defaultFieldsetWidth: 730,
    defaultLabelWidth: 200
});
Ext.override(Ext.Window, {
    shadow: false,
    shadowOffset: 11,
    maxWidth: null,
    maxHeight: null,
    initEvents: function() {
        Ext.Window.superclass.initEvents.call(this);
        if (this.animateTarget) {
            this.setAnimateTarget(this.animateTarget)
        }
        if (this.resizable) {
            var a = {
                minWidth: this.minWidth,
                minHeight: this.minHeight,
                handles: this.resizeHandles || "all",
                pinned: true,
                resizeElement: this.resizerAction,
                handleCls: "x-window-handle"
            };
            if (!Ext.isEmpty(this.maxWidth)) {
                a.maxWidth = this.maxWidth
            }
            if (!Ext.isEmpty(this.maxHeight)) {
                a.maxHeight = this.maxHeight
            }
            this.resizer = new Ext.Resizable(this.el, a);
            this.resizer.window = this;
            this.mon(this.resizer, "beforeresize", this.beforeResize, this)
        }
        if (this.draggable) {
            this.header.addClass("x-window-draggable")
        }
        this.mon(this.el, "mousedown", this.toFront, this);
        this.manager = this.manager || Ext.WindowMgr;
        this.manager.register(this);
        if (this.maximized) {
            this.maximized = false;
            this.maximize()
        }
        if (this.closable) {
            var b = this.getKeyMap();
            b.on(27, this.onEsc, this);
            b.disable()
        }
    },
    initComponent: function() {
        this.initTools();
        Ext.Window.superclass.initComponent.call(this);
        this.addEvents("resize", "maximize", "minimize", "restore");
        if (Ext.isDefined(this.initHidden)) {
            this.hidden = this.initHidden
        }
        if (this.hidden === false) {
            this.hidden = true;
            this.show()
        }
    },
    initTools: function() {
        if (this.minimizable) {
            this.addTool({
                id: "minimize",
                handler: this.minimize.createDelegate(this, []),
                qInternationalKey: "QTS_MSG_10"
            })
        }
        if (this.maximizable) {
            this.addTool({
                id: "maximize",
                handler: this.maximize.createDelegate(this, []),
                qInternationalKey: "QTS_MSG_11"
            });
            this.addTool({
                id: "restore",
                handler: this.restore.createDelegate(this, []),
                qInternationalKey: "QTS_MSG_12",
                hidden: true
            })
        }
        if (this.closable) {
            this.addTool({
                id: "close",
                handler: this[this.closeAction].createDelegate(this, []),
                qInternationalKey: "IEI_NAS_BUTTON_CLOSE"
            })
        }
    },
    toolTemplate: new Ext.Template('<div class="x-tool x-tool-{id}" ext:qtip="{qInternationalKey}" >&#160;</div>'),
    addTool: function() {
        if (!this.rendered) {
            if (!this.tools) {
                this.tools = []
            }
            Ext.each(arguments, function(a) {
                this.tools.push(a)
            }, this);
            return
        }
        if (!this[this.toolTarget]) {
            return
        }
        if (!this.toolTemplate) {
            var g = new Ext.Template('<div class="x-tool x-tool-{id}" ext:qtip="{qInternationalKey}" >&#160;</div>');
            g.disableFormats = true;
            g.compile();
            Ext.Panel.prototype.toolTemplate = g
        }
        for (var f = 0, d = arguments, c = d.length; f < c; f++) {
            var b = d[f];
            if (!this.tools[b.id]) {
                var h = "x-tool-" + b.id + "-over";
                var e = this.toolTemplate.insertFirst(this[this.toolTarget], b, true);
                this.tools[b.id] = e;
                e.enableDisplayMode("block");
                this.mon(e, "click", this.createToolHandler(e, b, h, this));
                if (b.on) {
                    this.mon(e, b.on)
                }
                if (b.hidden) {
                    e.hide()
                }
                if (b.qtip) {
                    if (Ext.isObject(b.qtip)) {
                        Ext.QuickTips.register(Ext.apply({
                            target: e.id
                        }, b.qtip))
                    } else {
                        e.dom.qtip = b.qtip
                    }
                }
                e.addClassOnOver(h)
            }
        }
    }
});
QNAP.QOS.AppletEvent = {
    EVENT_CREATE_FOLDER: 3,
    DELETE_SUCCESS: 4,
    DELETE_FAILED: -4,
    UPDATE_FILE_LIST: 1,
    UPDATE_DIR_LIST: 2,
    UPDATE_UPLOAD_LIST: 103,
    UPLOAD_FINISH: 104,
    DROP_UPLOAD_START: 105,
    DROP_UPLOAD_FINISH: 106,
    DROP_UPLOAD_FAILED: 107,
    DROP_UPDATE_RATE: 108,
    DROP_DOWNLOAD_FILE_EXISTS: 205,
    DROP_DOWNLOAD_START: 206,
    DROP_DOWNLOAD_FINISH: 207,
    DROP_DOWNLOAD_FAILED: 208,
    PATH_NOT_EXIST: 209,
    DROP_DOWNLOAD_RATE_UPDATE: 210
};
QNAP.QOS.lib = function() {
    var supportAddEventListener = window.addEventListener,
        supportAttachEvent = window.attachEvent,
        supportJSONParse = JSON.parse,
        isMobileBrowser = false,
        maxIdleTime = 3600000;
    (function(a) {
        if (/nexus/i.test(a) || /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(ad|hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
            isMobileBrowser = true
        }
    })(navigator.userAgent || navigator.vendor || window.opera);
    var languageStore = new Ext.data.SimpleStore({
        fields: ["code", "language", "charset", "cookie_name", "file_name", {
            name: "selected",
            defaultValue: 0
        }],
        idIndex: 3
    });
    try {
        Ext.exampledata.languages.splice(0, 0, ["auto", "Q_LANG_AUTO", "auto", "auto", "auto"]);
        languageStore.loadData(Ext.exampledata.languages)
    } catch (e) {}
    var fixImgPath = function(imgPath) {
        if (imgPath.indexOf("/") == -1) {
            imgPath = QNAP.QOS.config.sitePath + QNAP.QOS.config.iconPath + imgPath
        }
        return imgPath
    };
    var checkSessionTask = new Ext.util.DelayedTask(function() {
        checkSessionTask.delay(120000);
        if (maxIdleTime < 0) {
            return
        }
        if (Ext.isEmpty(QNAP.QOS.user.sid)) {
            return
        }
        var lastActiveTime = Ext.util.Cookies.get("QT");
        if (QNAP.QOS.config.demoSiteSuppurt == "yes" && QNAP.QOS.user.account != "admin") {
            lastActiveTime = Ext.util.Cookies.get("DEMO_QT");
            maxIdelTime = 900000
        }
        var currentTime = new Date().getTime();
        if (lastActiveTime && currentTime - lastActiveTime < maxIdleTime) {
            return
        }
        Ext.getBody().mask(_S.V3_MENU_STR14);
        var ajax = {
            url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + "authLogout.cgi", {
                logout: 1
            }),
            success: function(response, opts) {},
            failure: Ext.emptyFn(),
            callback: function() {
                window.onbeforeunload = null;
                QNAP.lib.cookie.del("QMS_SID", "/");
                Ext.util.Cookies.clear("NAS_SID");
                window.location.href = "/?" + Math.random()
            }
        };
        QNAP.QOS.ajax(ajax);
        Ext.util.Cookies.clear("NAS_SID")
    });
    var subLangs = new Ext.util.MixedCollection();
    var parserSubLangs = function() {
        subLangs.each(function(langJs) {
            if (window["_Q_STRINGS" + langJs.langVar]) {
                var mix = new Ext.util.MixedCollection();
                mix.addAll(eval("_Q_STRINGS" + langJs.langVar));
                mix.eachKey(function(key) {
                    _S[langJs.langVar + key] = mix.get(key)
                });
                eval("delete _Q_STRINGS" + langJs.langVar)
            }
        })
    };
    var resetLang = function(lang, callback, args, scope) {
        var lastLang = QNAP.QOS.user.lang;
        var newLang = languageStore.query("cookie_name", lang);
        QNAP.QOS.user.lang = lang;
        languageStore.each(function(r) {
            r.set("selected", "0")
        });
        if (newLang.getCount() > 0) {
            newLang.get(0).set("selected", "1")
        }
        if (lang == "auto") {
            lang = QNAP.QOS.lib.browserSelectLanguage();
            QNAP.lib.cookie.del("nas_lang")
        } else {
            Ext.util.Cookies.set("nas_lang", lang, new Date().add(Date.YEAR, 10))
        }
        var langs = ["/cgi-bin/langs/lang_" + lang + ".js?" + URL_RANDOM_NUM];
        subLangs.each(function(langJs) {
            langs.push(String.format(langJs.langPath, lang))
        });
        Ext.Loader.load(langs, function() {
            var fn_reg, sms_id_reg, app_id_reg;
            fn_reg = /%%FN_(\w*)%%/;
            sms_id_reg = /%%SMS_ID_(\w*)%%/g;
            app_id_reg = /%%APP_ID_(\w*)%%/g;

            function replace_str_via_fn(sms_id) {
                var fn_regs;
                fn_regs = _S[sms_id].match(fn_reg);
                Ext.each(fn_regs, function(fn_reg_str) {
                    switch (fn_reg_str) {
                        case "%%FN_get_current_version%%":
                            _S[sms_id] = _S[sms_id].replace(/%%FN_get_current_version%%/g, QNAP.QOS.config.firmware);
                            break
                    }
                })
            }

            function replace_str_via_sms(sms_id) {
                var replace_sms_ids;
                replace_sms_ids = _S[sms_id].match(sms_id_reg);
                Ext.each(replace_sms_ids, function(replace_sms_id) {
                    replace_sms_id = replace_sms_id.replace(/%%SMS_ID_(\w*)%%/, "$1");
                    if (_S[replace_sms_id]) {
                        _S[sms_id] = _S[sms_id].replace(new RegExp("%%SMS_ID_" + replace_sms_id + "%%", "g"), _S[replace_sms_id])
                    }
                })
            }

            function replace_str_via_app(sms_id) {
                var app_id_regs, app_id, app_info, rep_app_id_reg;
                app_id_regs = _S[sms_id].match(app_id_reg);
                Ext.each(app_id_regs, function(app_id_reg_str) {
                    app_id = app_id_reg_str.replace(/%%APP_ID_(\w*)%%/, "$1");
                    app_info = QNAP.QOS.lib.getAppInfo(app_id);
                    if (app_info) {
                        rep_app_id_reg = new RegExp(RegExp.escape(app_id_reg_str), "g");
                        _S[sms_id] = _S[sms_id].replace(rep_app_id_reg, _S[app_info.qInternationalKey] || app_info.defaultTitle)
                    }
                })
            }
            if (window._Q_STRINGS === undefined) {
                QNAP.QOS.user.lang = lastLang;
                return
            }
            _S = window._Q_STRINGS;
            window._Q_STRINGS = undefined;
            try {
                delete window._Q_STRINGS
            } catch (e) {}
            Ext.apply(Date, {
                dayNames: [_S.MISC_SCH_NEW_STR26, _S.MISC_SCH_NEW_STR20, _S.MISC_SCH_NEW_STR21, _S.MISC_SCH_NEW_STR22, _S.MISC_SCH_NEW_STR23, _S.MISC_SCH_NEW_STR24, _S.MISC_SCH_NEW_STR25],
                monthNames: [_S.IEI_IDS_STRING1, _S.IEI_IDS_STRING2, _S.IEI_IDS_STRING3, _S.IEI_IDS_STRING4, _S.IEI_IDS_STRING5, _S.IEI_IDS_STRING6, _S.IEI_IDS_STRING7, _S.IEI_IDS_STRING8, _S.IEI_IDS_STRING9, _S.IEI_IDS_STRING10, _S.IEI_IDS_STRING11, _S.IEI_IDS_STRING12]
            });
            Ext.override(Ext.Component, {
                labelSeparator: _S.QUICK09_STR01
            });
            Ext.override(Ext.layout.FormLayout, {
                labelSeparator: _S.QUICK09_STR01
            });
            parserSubLangs();
            Ext.iterate(_S, function(sms_id) {
                if (fn_reg.test(_S[sms_id])) {
                    replace_str_via_fn(sms_id)
                }
                if (sms_id_reg.test(_S[sms_id])) {
                    replace_str_via_sms(sms_id)
                }
                if (app_id_reg.test(_S[sms_id])) {
                    replace_str_via_app(sms_id)
                }
            });
            var doLayoutList = [];
            changeLangs();
            Ext.MessageBox.buttonText = {
                ok: _S.IEI_NAS_BUTTON_OK,
                cancel: _S.IEI_NAS_BUTTON_CANCEL,
                yes: _S.IEI_NAS_BUTTON_YES,
                no: _S.IEI_NAS_BUTTON_NO
            };

            function changeLangs() {
                Ext.MessageBox.buttonText = {
                    ok: _S.IEI_NAS_BUTTON_OK,
                    cancel: _S.IEI_NAS_BUTTON_CANCEL,
                    yes: _S.IEI_NAS_BUTTON_YES,
                    no: _S.IEI_NAS_BUTTON_NO
                };
                Ext.ComponentMgr.all.each(function(cmp) {
                    try {
                        resetItem(cmp)
                    } catch (e) {
                        _D("[Err] changeLangs faile", cmp, e)
                    }
                });
                Ext.each(doLayoutList, function(cmp) {
                    if (/panel/ig.test(cmp.getXType())) {
                        cmp.on("show", cmp.doLayout, cmp, {
                            single: true
                        });
                        cmp.on("active", cmp.doLayout, cmp, {
                            single: true
                        })
                    }
                    cmp.doLayout()
                });
                os.qWinMgr.each(function(win) {
                    if (win.qInternational) {
                        if (win.qInternationalKey) {
                            win.setTitle(_S[win.qInternationalKey] || win.qInternationalKey || win.defaultTitle)
                        }
                        if (win.qInternationalFn) {
                            win.qInternationalFn(win)
                        }
                    }
                    win.doLayout();
                    win.syncShadow()
                });
                Ext.WindowMgr.each(function(win) {
                    if (win.qInternational) {
                        if (win.qInternationalKey) {
                            win.setTitle(_S[win.qInternationalKey] || win.qInternationalKey)
                        }
                        if (win.qInternationalFn) {
                            win.qInternationalFn(win)
                        }
                    }
                    win.doLayout();
                    win.syncShadow()
                });
                QNAP.QOS.lib.MaskMgr.each(function(el) {
                    if (el.isMasked()) {
                        el.mask(_S[el.qInternationalKey]);
                        if (el.qInternationalFn) {
                            el.qInternationalFn()
                        }
                    } else {
                        QNAP.QOS.lib.MaskMgr.unmask(el)
                    }
                });
                Ext.Msg.hide()
            }

            function resetItem(cmp) {
                var xtype, key;
                xtype = cmp.getXType();
                key = {};
                switch (xtype) {
                    case "list":
                    case "grid":
                    case "editorgrid":
                    case "form":
                    case "panel":
                    case "tabpanel":
                    case "fieldset":
                        doLayoutList.push(cmp)
                }
                if (cmp.qInternational) {
                    switch (xtype) {
                        case "paging":
                        case "hidden":
                            break;
                        case "list":
                        case "grid":
                        case "editorgrid":
                            if (cmp.colModel.config) {
                                Ext.each(cmp.colModel.config, function(col) {
                                    if (col.qInternational) {
                                        col.header = _S[col.qInternationalKey];
                                        if (col.qInternationalFn) {
                                            col.qInternationalFn(col)
                                        }
                                    }
                                })
                            }
                            if (cmp.rendered) {
                                cmp.getView().refresh(true)
                            }
                        case "form":
                        case "panel":
                        case "fieldset":
                            cmp.setTitle(_S[cmp.qInternationalKey]);
                            break;
                        case "label":
                            if (cmp.initialConfig.html) {
                                if (cmp.rendered) {
                                    cmp.update(_S[cmp.qInternationalKey])
                                }
                                cmp.html = _S[cmp.qInternationalKey]
                            } else {
                                if (cmp.initialConfig.text) {
                                    if (cmp.rendered) {
                                        cmp.update(_S[cmp.qInternationalKey])
                                    }
                                    cmp.text = _S[cmp.qInternationalKey]
                                }
                            }
                            break;
                        case "menucheckitem":
                        case "menuitem":
                        case "tbtext":
                            cmp.setText(_S[cmp.qInternationalKey]);
                            break;
                        case "radio":
                        case "radiogroup":
                        case "checkbox":
                        case "checkboxgroup":
                        case "qtsradio":
                        case "qtsradiogroup":
                        case "qtscheckbox":
                        case "qtscheckboxgroup":
                            if (Ext.isString(cmp.qInternationalKey)) {
                                key = {};
                                if (cmp.hideLabel) {
                                    key.boxLabel = cmp.qInternationalKey
                                } else {
                                    key.fieldLabel = cmp.qInternationalKey
                                }
                                cmp.qInternationalKey = key
                            }
                        case "button":
                        case "qtsbutton":
                        case "copybtn":
                            if (Ext.isString(cmp.qInternationalKey)) {
                                key = {
                                    text: cmp.qInternationalKey
                                };
                                cmp.qInternationalKey = key
                            }
                        case "combo":
                        case "trigger":
                        case "fmmulticombo":
                        case "compositefield":
                        case "textfield":
                        case "textarea":
                        case "numberfield":
                        case "textfieldSNMPpc":
                        case "textfieldSNMPpr":
                        case "textfieldSNMPpa":
                            cmp.blankText = _S.FTP_STR41;
                        case "displayfield":
                        case "fileuploadfield":
                        case "container":
                            if (Ext.isString(cmp.qInternationalKey)) {
                                key = {};
                                if (cmp.hideLabel) {
                                    key.value = cmp.qInternationalKey
                                } else {
                                    key.fieldLabel = cmp.qInternationalKey
                                }
                                cmp.qInternationalKey = key
                            }
                            for (key in cmp.qInternationalKey) {
                                cmp[key] = _S[cmp.qInternationalKey[key]]
                            }
                            if (cmp.rendered && Ext.isObject(cmp.qInternationalKey)) {
                                cmp.qInternationalKey.boxLabel ? cmp.wrap.child(".x-form-cb-label").update(_S[cmp.qInternationalKey.boxLabel]) : null;
                                if (cmp.emptyText && cmp.applyEmptyText) {
                                    cmp.emptyText = cmp.emptyText + "\t"
                                }
                                if (cmp.el.hasClass(cmp.emptyClass)) {
                                    cmp.reset();
                                    cmp.setValue("")
                                }
                                if (cmp.qInternationalKey.text) {
                                    cmp.setText(_S[cmp.qInternationalKey.text])
                                }
                                if (cmp.qInternationalKey.value) {
                                    cmp.setValue(_S[cmp.qInternationalKey.value]);
                                    cmp.originalValue = cmp.getValue()
                                }
                                if (cmp.label) {
                                    cmp.qInternationalKey.fieldLabel ? cmp.label.update(_S[cmp.qInternationalKey.fieldLabel] + (Ext.isString(cmp.labelSeparator) ? cmp.labelSeparator : cmp.ownerCt.layout.labelSeparator)) : null
                                }
                            }
                            break;
                        case "treepanel":
                            cmp.getRootNode().findChildBy(function(c) {
                                var text;
                                if (c.attributes.qInternational) {
                                    text = _S[c.attributes.qInternationalKey] || c.text;
                                    c.setText(text);
                                    c.setTooltip(text)
                                }
                            }, null, true);
                            break;
                        case "treegrid":
                            cmp.setTitle(_S[cmp.qInternationalKey]);
                            Ext.each(cmp.columns, function(column) {
                                column.qInternational ? column.header = _S[column.qInternationalKey] : null;
                                if (column.qInternationalFn) {
                                    column.qInternationalFn(column)
                                }
                            });
                            cmp.refresh();
                            break;
                        case "QShortcutsViewV2":
                        case "QSideMenu":
                        case "dataview":
                        case "listview":
                        case "shortcutsview":
                            if (cmp.rendered) {
                                cmp.refresh()
                            }
                            break;
                        default:
                            _D(cmp.getXType(), cmp.id);
                            break
                    }
                    if (cmp.qInternationalFn) {
                        if (!cmp.isXType("window")) {
                            cmp.qInternationalFn(cmp)
                        }
                        if (cmp.emptyText && !/\t$/.test(cmp.emptyText)) {
                            cmp.emptyText = cmp.emptyText + "\t"
                        }
                    }
                    if (cmp.validate) {
                        cmp.clearInvalid();
                        cmp.validate()
                    }
                }
            }
            if (window.LOAD_KEYWORKS !== false) {
                Ext.Loader.load(["/cgi-bin/keyword/keyword_" + lang + ".js?" + URL_RANDOM_NUM], QNAP.QOS.Keyword.control.updateExtKeywordIndex)
            }
            if (callback) {
                args = args || [];
                callback.apply(scope, args)
            }
        }, null, true)
    };
    var MaskMgr = function() {
        var all = new Ext.util.MixedCollection();
        return {
            all: all,
            each: function(fn, scope) {
                all.each(fn, scope)
            },
            mask: function(el, msgKey, msg, msgFn) {
                all.add(el);
                el.qInternational = true;
                el.qInternationalKey = msgKey;
                el.qInternationalFn = msgFn;
                el.mask(_S[msgKey] || msg)
            },
            unmask: function(el) {
                el.unmask();
                all.remove(el)
            }
        }
    }();
    var browserSelectLanguage = function() {
        if (QNAP.QOS.Environment.forceLang) {
            return QNAP.QOS.Environment.forceLang
        }
        var browser_use_language = "";
        var browser_language = "ENG";
        if (navigator.appName == "Microsoft Internet Explorer") {
            browser_use_language = navigator.browserLanguage
        } else {
            browser_use_language = navigator.language
        }
        browser_use_language = browser_use_language.toLowerCase();
        if (/^us/.test(browser_use_language)) {
            browser_language = "ENG"
        } else {
            if (/^zh-tw/.test(browser_use_language)) {
                browser_language = "TCH"
            } else {
                if (/^zh-cn/.test(browser_use_language)) {
                    browser_language = "SCH"
                } else {
                    if (/^cs/.test(browser_use_language)) {
                        browser_language = "CZE"
                    } else {
                        if (/^da/.test(browser_use_language)) {
                            browser_language = "DAN"
                        } else {
                            if (/^de/.test(browser_use_language)) {
                                browser_language = "GER"
                            } else {
                                if (/^es/.test(browser_use_language)) {
                                    if (browser_use_language == "es-mex") {
                                        browser_language = "ESM"
                                    } else {
                                        browser_language = "SPA"
                                    }
                                } else {
                                    if (/^fr/.test(browser_use_language)) {
                                        browser_language = "FRE"
                                    } else {
                                        if (/^it/.test(browser_use_language)) {
                                            browser_language = "ITA"
                                        } else {
                                            if (/^ja/.test(browser_use_language)) {
                                                browser_language = "JPN"
                                            } else {
                                                if (/^ko/.test(browser_use_language)) {
                                                    browser_language = "KOR"
                                                } else {
                                                    if (/^(no|nb-no)/.test(browser_use_language)) {
                                                        browser_language = "NOR"
                                                    } else {
                                                        if (/^pl/.test(browser_use_language)) {
                                                            browser_language = "POL"
                                                        } else {
                                                            if (/^ru/.test(browser_use_language)) {
                                                                browser_language = "RUS"
                                                            } else {
                                                                if (/^fi/.test(browser_use_language)) {
                                                                    browser_language = "FIN"
                                                                } else {
                                                                    if (/^sv/.test(browser_use_language)) {
                                                                        browser_language = "SWE"
                                                                    } else {
                                                                        if (/^nl/.test(browser_use_language)) {
                                                                            browser_language = "DUT"
                                                                        } else {
                                                                            if (/^tr/.test(browser_use_language)) {
                                                                                browser_language = "TUR"
                                                                            } else {
                                                                                browser_language = "ENG"
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return browser_language
    };
    var searchField = Ext.extend(Ext.form.TwinTriggerField, {
        initComponent: function() {
            QNAP.QOS.lib.searchField.superclass.initComponent.call(this);
            this.on("specialkey", function(f, e) {
                if (e.getKey() == e.ENTER) {
                    this.onTrigger2Click()
                }
            }, this)
        },
        validationEvent: false,
        validateOnBlur: false,
        trigger1Class: "x-form-clear-trigger",
        trigger2Class: "x-form-search-trigger",
        hideTrigger1: true,
        width: 180,
        hasSearch: false,
        paramName: "query",
        onTrigger1Click: function() {
            if (this.hasSearch) {
                this.el.dom.value = "";
                var o = {
                    start: 0
                };
                this.store.baseParams = this.store.baseParams || {};
                this.store.baseParams[this.paramName] = "";
                this.store.reload({
                    params: o
                });
                this.triggers[0].hide();
                this.hasSearch = false
            }
        },
        onTrigger2Click: function() {
            var v = this.getRawValue();
            if (v.length < 1) {
                this.onTrigger1Click();
                return
            }
            var o = {
                start: 0
            };
            this.store.baseParams = this.store.baseParams || {};
            this.store.baseParams[this.paramName] = v;
            this.store.reload({
                params: o
            });
            this.hasSearch = true;
            this.triggers[0].show()
        }
    });
    var getLanguageCode = function() {
        var lang_cookie = QNAP.QOS.user.lang;
        if (lang_cookie == "auto") {
            lang_cookie = QNAP.QOS.lib.browserSelectLanguage()
        }
        if (lang_cookie == null) {
            lang_cookie = "eng"
        } else {
            if (lang_cookie === "TCH") {
                lang_cookie = "cht"
            } else {
                if (lang_cookie === "SCH") {
                    lang_cookie = "chs"
                } else {
                    lang_cookie = lang_cookie.toLowerCase()
                }
            }
        }
        return lang_cookie
    };
    var getLanguageCode2 = function() {
        var uLang = QNAP.QOS.user.lang;
        var autoLang = QNAP.QOS.lib.browserSelectLanguage();
        if (uLang == "auto") {
            uLang = autoLang
        }
        var bLang = window.navigator.userLanguage || window.navigator.language;
        var targetLang = "";
        switch (uLang) {
            case "ENG":
                if (bLang.indexOf("us") >= 0) {
                    targetLang = "useng"
                } else {
                    targetLang = "en"
                }
                break;
            case "SCH":
                targetLang = "cn";
                break;
            case "TCH":
                targetLang = "" + languageStore.getById(uLang).get("file_name");
                break;
            case "POR":
                targetLang = "pt";
                break;
            case "DUT":
                targetLang = "nl";
                break;
            case "KOR":
                targetLang = "kr";
                break;
            case "JPN":
                targetLang = "jp";
                break;
            case "GER":
            case "SPA":
            case "FRE":
            case "ITA":
            case "RUS":
                targetLang = languageStore.getById(uLang).get("code");
                break
        }
        return targetLang
    };
    var getCurrentLangCode = function() {
        return QNAP.QOS.user.lang == "auto" ? QNAP.QOS.lib.browserSelectLanguage() : QNAP.QOS.user.lang
    };
    var getCgiUrl = function(cgiPath, basicParameters, otherParameters, appendSid) {
        var t = QNAP.QOS.config.rootUrl + cgiPath;
        if (appendSid !== false) {
            t += Ext.isEmpty(QNAP.QOS.user.sid) ? "" : "?sid=" + QNAP.QOS.user.sid
        }
        if (basicParameters) {
            Ext.iterate(basicParameters, function(key, value) {
                t += String.format("&{0}={1}", key, value)
            })
        }
        if (otherParameters) {
            Ext.iterate(otherParameters, function(key, value) {
                t += String.format("&{0}={1}", key, value)
            })
        }
        return t.replace(/(\w)\/+/g, "$1/")
    };
    var checkIfSessionTimeout = function(data, responseType) {
        if ((typeof responseType) === "undefined") {
            responseType = "xml"
        }
        if (responseType === "xml") {
            if (Ext.DomQuery.selectNumber("authPassed", data, 1) === 0) {
                return true
            }
        } else {
            if (responseType === "json") {}
        }
        return false
    };
    var getAppInfo = function(appId, onlyData) {
        var appInfo = (appId) ? QNAP.QOS.systemItems[appId] : null;
        var appIdRegExp = new RegExp("^" + RegExp.escape(appId) + "$", "i");
        var QPKGAppInfo, station, service, qpkg, tmpInfo;
        if (!Ext.isEmpty(appInfo)) {
            tmpInfo = {
                srcDataset: "SYS_ITEMS"
            };
            Ext.apply(tmpInfo, appInfo);
            if (appInfo.type === "QPKG" && os.qpkgStore) {
                qpkg = os.qpkgStore.getAt(os.qpkgStore.find("name", appIdRegExp, 0, false, false));
                if (!Ext.isEmpty(qpkg)) {
                    tmpInfo = {};
                    Ext.apply(tmpInfo, qpkg);
                    qpkg.type = "QPKG";
                    Ext.applyIf(tmpInfo, qpkg.data);
                    tmpInfo.srcDataset = "QPKG";
                    return tmpInfo
                }
            } else {
                return tmpInfo
            }
        }
        QPKGAppInfo = (appId) ? QNAP.QOS.QPKG.Map[appId] : null;
        if (!Ext.isEmpty(QPKGAppInfo)) {
            tmpInfo = {};
            Ext.apply(tmpInfo, QPKGAppInfo);
            tmpInfo.srcDataset = "QPKG";
            return tmpInfo
        }
        if (os.serviceStore) {
            service = os.serviceStore.getAt(os.serviceStore.find("appId", appIdRegExp, 0, false, false));
            if (!Ext.isEmpty(service)) {
                if (service.get("icon") === ["?", URL_RANDOM_NUM].join("")) {
                    qpkg = os.qpkgStore.getAt(os.qpkgStore.find("name", appIdRegExp, 0, false, false));
                    if (qpkg) {
                        service.set("icon", qpkg.get("icon"))
                    }
                }
                tmpInfo = {};
                if (onlyData) {
                    tmpInfo = service.data
                } else {
                    Ext.apply(tmpInfo, service);
                    Ext.applyIf(tmpInfo, service.data)
                }
                tmpInfo.type = "service";
                tmpInfo.srcDataset = "SERVICE";
                return tmpInfo
            }
        }
        if (os.stationStore) {
            station = os.stationStore.getAt(os.stationStore.find("appId", appIdRegExp, 0, false, false));
            if (!Ext.isEmpty(station)) {
                tmpInfo = {};
                if (onlyData) {
                    tmpInfo = station.data
                } else {
                    Ext.apply(tmpInfo, station);
                    Ext.applyIf(tmpInfo, station.data)
                }
                tmpInfo.type = "QPKG";
                tmpInfo.srcDataset = "STATION";
                return tmpInfo
            }
        }
        if (os.qpkgStore) {
            qpkg = os.qpkgStore.getAt(os.qpkgStore.find("name", appIdRegExp, 0, false, false));
            if (!Ext.isEmpty(qpkg)) {
                tmpInfo = {};
                if (onlyData) {
                    tmpInfo = qpkg.data
                } else {
                    Ext.apply(tmpInfo, qpkg);
                    Ext.applyIf(tmpInfo, qpkg.data)
                }
                tmpInfo.type = "QPKG";
                tmpInfo.srcDataset = "QPKG";
                return tmpInfo
            }
        }
        Ext.iterate(QNAP.QOS.systemItems, function(key, value) {
            if (key.toUpperCase() == String(appId).toUpperCase()) {
                appInfo = value;
                return false
            }
        });
        return false
    };
    var LinkButton = Ext.extend(Ext.Button, {
        template: new Ext.Template('<table cellspacing="0" class="x-btn {3}"><tbody class="{4}">', '<tr><td class="x-btn-tl"><i>&amp;#160;</i></td><td class="x-btn-tc"></td><td class="x-btn-tr"><i>&amp;#160;</i></td></tr>', '<tr><td class="x-btn-ml"><i>&amp;#160;</i></td><td class="x-btn-mc"><em class="{5}" unselectable="on"><a href="{6}" target="{7}" class="x-btn-text {2}"><button>{0}</button></a></em></td><td class="x-btn-mr"><i>&amp;#160;</i></td></tr>', '<tr><td class="x-btn-bl"><i>&amp;#160;</i></td><td class="x-btn-bc"></td><td class="x-btn-br"><i>&amp;#160;</i></td></tr>', "</tbody></table>").compile(),
        buttonSelector: "a:first",
        getTemplateArgs: function() {
            return Ext.Button.prototype.getTemplateArgs.apply(this).concat([this.href, this.target])
        },
        onClick: function(e) {
            if (e.button != 0) {
                return
            }
            if (!this.disabled) {
                this.fireEvent("click", this, e);
                if (this.handler) {
                    this.handler.call(this.scope || this, this, e)
                }
            }
        }
    });
    var SNMPprivacyPwdField = Ext.extend(Ext.form.TextField, {
        validateValue: function(value) {
            var confirmFieldES = Ext.getCmp(this.confirmToES);
            var confirmFieldSV = Ext.getCmp(this.confirmToSV);
            var confirmFieldUA = Ext.getCmp(this.confirmToUA);
            var confirmFieldCB = Ext.getCmp(this.confirmToCB);
            if (confirmFieldES.getValue()) {
                if (confirmFieldSV.getValue() != "v1") {
                    if (confirmFieldUA.getValue()) {
                        this.allowBlank = (!confirmFieldCB.getValue())
                    } else {
                        this.allowBlank = true
                    }
                }
            }
            return SNMPprivacyPwdField.superclass.validateValue.call(this, value)
        }
    });
    Ext.reg("textfieldSNMPpa", SNMPprivacyPwdField);
    var SNMPauthPwdField = Ext.extend(Ext.form.TextField, {
        validateValue: function(value) {
            var confirmFieldES = Ext.getCmp(this.confirmToES);
            var confirmFieldSV = Ext.getCmp(this.confirmToSV);
            var confirmFieldUA = Ext.getCmp(this.confirmToUA);
            if (confirmFieldES.getValue()) {
                if (confirmFieldSV.getValue() != "v1") {
                    this.allowBlank = (!confirmFieldUA.getValue())
                } else {
                    this.allowBlank = true
                }
            }
            return SNMPauthPwdField.superclass.validateValue.call(this, value)
        }
    });
    Ext.reg("textfieldSNMPpr", SNMPauthPwdField);
    var SNMPchkTextField = Ext.extend(Ext.form.TextField, {
        validateValue: function(value) {
            var confirmTo = Ext.getCmp(this.confirmTo);
            var confirmToInfo = Ext.getCmp(this.confirmToInfo);
            var confirmToWarn = Ext.getCmp(this.confirmToWarn);
            var confirmToErr = Ext.getCmp(this.confirmToErr);
            var confirmFieldTA1 = Ext.get(this.confirmToTA1);
            var confirmFieldTA2 = Ext.get(this.confirmToTA2);
            var confirmFieldTA3 = Ext.get(this.confirmToTA3);
            if (confirmTo.getValue()) {
                if (confirmToInfo.getValue() || confirmToWarn.getValue() || confirmToErr.getValue()) {
                    this.allowBlank = ((confirmFieldTA1.getValue() != "") || (confirmFieldTA2.getValue() != "") || (confirmFieldTA3.getValue() != ""))
                } else {
                    this.allowBlank = true
                }
            } else {
                this.allowBlank = true
            }
            return SNMPchkTextField.superclass.validateValue.call(this, value)
        }
    });
    Ext.reg("textfieldSNMPpc", SNMPchkTextField);
    var FlexTool = function() {
        return {
            flexPath: "/libs/stringcopy",
            getFlexObject: function(ObjName) {
                return Ext.getDom(ObjName)
            },
            getClipFlexEmbedStr: function(ret) {
                var objAttrs = ret.objAttrs;
                var params = ret.params;
                var embedAttrs = ret.embedAttrs;
                var embedStr = "";
                if (isIE && isWin && !isOpera) {
                    embedStr += "<object ";
                    for (var i in objAttrs) {
                        embedStr += i + '="' + objAttrs[i] + '" '
                    }
                    embedStr += ">";
                    for (var i in params) {
                        embedStr += '<param name="' + i + '" value="' + params[i] + '" /> '
                    }
                    embedStr += "</object>"
                } else {
                    embedStr += "<embed ";
                    for (var i in embedAttrs) {
                        embedStr += i + '="' + embedAttrs[i] + '" '
                    }
                    embedStr += "> </embed>"
                }
                return embedStr
            },
            getFlexArgs: function(swfId, cls) {
                return AC_GetArgs(["src", this.flexPath, "class", cls, "align", "middle", "id", swfId, "quality", "high", "bgcolor", "#869ca7", "name", swfId, "wmode", "transparent", "allowScriptAccess", "always", "allowNetworking", "all", "type", "application/x-shockwave-flash", "pluginspage", "http://www.adobe.com/go/getflashplayer"], ".swf", "movie", "clsid:d27cdb6e-ae6d-11cf-96b8-444553540000", "application/x-shockwave-flash")
            }
        }
    }();
    var supportExecCommand = false;
    supportExecCommand = (function() {
        var Sys = {};
        var ua = navigator.userAgent.toLowerCase();
        var sAry;
        (sAry = ua.match(/rv:([\d.]+)\) like gecko/)) ? Sys.ie = parseInt(sAry[1]): (sAry = ua.match(/msie ([\d.]+)/)) ? Sys.ie = parseInt(sAry[1]) : (sAry = ua.match(/firefox\/([\d.]+)/)) ? Sys.firefox = parseInt(sAry[1]) : (sAry = ua.match(/chrome\/([\d.]+)/)) ? Sys.chrome = parseInt(sAry[1]) : (sAry = ua.match(/opera.([\d.]+)/)) ? Sys.opera = parseInt(sAry[1]) : (sAry = ua.match(/version\/([\d.]+).*safari/)) ? Sys.safari = parseInt(sAry[1]) : 0;
        return ((Sys.ie && Sys.ie >= 10) || (Sys.firefox && Sys.firefox >= 41) || (Sys.chrome && Sys.chrome >= 43) || (Sys.opera && Sys.opera >= 29) || (Sys.safari && Sys.safari >= 10)) ? true : false
    })();
    var ClipButton = Ext.extend(Ext.Button, {
        cls: "copyBtn qts-copy-button",
        supportExecCommand: supportExecCommand,
        onMouseMove: function(e) {
            this.fireEvent("mousemove", this, e)
        },
        onMouseOver: function(e) {
            if (!this.disabled) {
                var internal = e.within(this.el, true);
                if (internal) {
                    this.el.addClass("x-btn-over");
                    if (!this.monitoringMouseOver) {
                        this.doc.on("mouseover", this.monitorMouseOver, this);
                        this.monitoringMouseOver = true
                    }
                    this.fireEvent("mouseover", this, e)
                }
                if (this.isMenuTriggerOver(e, internal)) {
                    this.fireEvent("menutriggerover", this, this.menu, e)
                }
            }
        },
        onRender: function(ct, position) {
            var supportExecCommand = this.supportExecCommand;
            QNAP.QOS.lib.ClipButton.superclass.onRender.call(this, ct, position);
            if (supportExecCommand) {
                this.renderCopyTextArea()
            } else {
                this.renderFlashBtn()
            }
        },
        renderCopyTextArea: function() {
            this.copytext = this.btnEl.insertSibling("<textarea id='" + this.swfId + "' class='x-btn flash-ct' style='position: absolute;width: 1px;right: 1px;pointer-events: none;opacity: 0;' ></textarea>");
            this.handler = this.execCommandHandler;
            this.mon(this.copytext, "mousemove", this.onMouseMove, this);
            this.mon(this.el, "mousemove", this.onMouseMove, this)
        },
        renderFlashBtn: function() {
            var btn = this;
            var flexTool = QNAP.QOS.lib.FlexTool;
            var flexArgs = flexTool.getFlexArgs(btn.swfId, "flex-copy-btn");
            var embedStr = flexTool.getClipFlexEmbedStr(flexArgs);
            this.btnEl.insertSibling("<div id='" + btn.swfId + "-div' class='x-btn flash-ct' ></div>");
            var size = btn.el.child("td.x-btn-mc").getSize();
            var flexDiv = Ext.get(btn.swfId + "-div");
            flexDiv.setStyle({
                position: "absolute"
            });
            flexDiv.setWidth("100%");
            flexDiv.setHeight("100%");
            flexDiv.insertHtml("afterBegin", embedStr);
            Ext.QuickTips.register({
                target: btn.swfId,
                text: _S[btn.tooltip] || btn.tooltip,
                enabled: true
            });
            var flex = Ext.fly(btn.swfId);
            flex.setStyle({
                position: "absolute",
                left: "0px"
            });
            btn.mon(flexDiv, "mousedown", btn.onMouseDown, btn);
            btn.mon(flexDiv, "mousemove", btn.onMouseMove, btn);
            btn.mon(flexDiv, "mouseover", btn.onMouseOver, btn);
            this.on("show", function(btn) {
                var size = btn.el.child("td.x-btn-mc").getSize();
                var flexDiv = Ext.get(btn.swfId + "-div");
                flexDiv.setStyle({
                    position: "absolute"
                });
                flexDiv.setWidth(size.width);
                flexDiv.setHeight(size.height)
            });
            this.on("mousemove", function(btn) {
                var flexTool = QNAP.QOS.lib.FlexTool;
                var flex = flexTool.getFlexObject(btn.swfId);
                flex.CopyString(btn.data, "clipFlexCmpClick", btn.id)
            });
            this.on("mouseover", function(btn) {
                var flexTool = QNAP.QOS.lib.FlexTool;
                var flex = flexTool.getFlexObject(btn.swfId);
                flex.CopyString(btn.data, "clipFlexCmpClick", btn.id)
            })
        },
        initComponent: function() {
            QNAP.QOS.lib.ClipButton.superclass.initComponent.call(this);
            this.swfId = Ext.id();
            if (this.cls !== "copyBtn qts-copy-button") {
                this.cls += " copyBtn qts-copy-button"
            }
        },
        execCommandHandler: function() {
            this.copytext.dom.value = this.data;
            this.copytext.dom.select();
            if (document.execCommand("copy")) {
                if (this.flexCallBack) {
                    this.flexCallBack()
                }
            }
        }
    });
    Ext.reg("copybtn", ClipButton);
    var appletCaller = function() {
        return {
            getApplet: function(appletId) {
                var applet = Ext.getDom(appletId);
                return applet
            }
        }
    }();
    var callApplet = function(callerId, appletId, fnName, obj, callbackFn) {
        var jsonStr;
        if (Ext.isObject(obj)) {
            obj.ID = callerId;
            jsonStr = Ext.encode(obj)
        } else {
            if (Ext.isString(obj)) {
                jsonStr = obj
            }
        }
        if (QNAP.QOS.config.isAppletReady) {
            var applet = appletCaller.getApplet(appletId);
            var info = applet.jsInterface(fnName, jsonStr);
            return info
        } else {
            _D("not support Applet")
        }
    };
    var appletInterface = function(appId, fn, params) {
        var app;
        if (!Ext.isEmpty(window.os)) {
            app = window.os.getAppInstance(appId)
        } else {
            if (window.parent.os) {
                app = window.parent.os.getAppInstance(appId)
            }
        }
        if (Ext.isEmpty(app)) {
            app = Ext.getCmp(appId)
        }
        if (app) {
            app[fn].apply(app, params)
        }
    };
    var hasJRE = function(ver) {
        if (Ext.isNumber(ver)) {
            ver = ver + ""
        }
        try {
            return deployJava.versionCheck(ver)
        } catch (e) {
            _D("[Err] Java check error!");
            return false
        }
    };
    var helpIndex = {};

    function processHelpJSON(helpJson, path) {
        Ext.each(helpJson, function(item) {
            var newPath = path.slice();
            newPath.push(item.id);
            if (item.id === "network_switch" && QNAP.QOS.Environment.supportNVS === true) {
                item.hidden = false
            }
            if (item.hidden === true) {
                return true
            }
            helpIndex[item.id] = {
                defaultTitle: item.text,
                qInternationalKey: item.qInternationalKey,
                icon: "apps/helper/images/icon-qos-help-{0}.png",
                items: item.items,
                path: newPath,
                desc: item.desc
            };
            if (item.id === "network" && QNAP.QOS.Environment.supportNVS === true) {
                Ext.apply(helpIndex[item.id], {
                    defaultTitle: QNAP.QOS.systemItems.network_access.defaultTitle,
                    qInternationalKey: QNAP.QOS.systemItems.network_access.qInternationalKey
                })
            }
            if (Ext.isArray(item.children) && item.children.length > 0) {
                processHelpJSON(item.children, newPath)
            }
        });
        if (supportStorage) {
            setStorageValue("help_Json_Str", Ext.encode(helpJson));
            setStorageValue("help_Json_Str_Ver", URL_RANDOM_NUM)
        }
    }

    function getHelpInfo(id) {
        if (helpIndex[id]) {
            return helpIndex[id]
        }
        return false
    }

    function getModels(internalModelName, modelname) {
        var showList = new Array();
        if (internalModelName == "TS-101") {
            if (modelname == "TS-109 PRO" || modelname == "TS-109 PRO II") {
                showList.push(".TS-109PRO")
            } else {
                if (modelname == "TS-109") {
                    showList.push("." + modelname)
                } else {
                    showList.push("." + internalModelName)
                }
            }
        } else {
            if (internalModelName == "TS-201") {
                if (modelname == "TS-209 PRO" || modelname == "TS-209 PRO II") {
                    showList.push(".TS-209PRO")
                } else {
                    if (modelname == "TS-209") {
                        showList.push("." + modelname)
                    } else {
                        showList.push("." + internalModelName)
                    }
                }
            } else {
                if (internalModelName == "TS-239") {
                    if (modelname == "NSS322") {
                        showList.push("." + modelname)
                    }
                    showList.push("." + internalModelName)
                } else {
                    if (internalModelName == "TS-639") {
                        if (modelname == "NSS326") {
                            showList.push("." + modelname)
                        }
                        showList.push("." + internalModelName)
                    } else {
                        if (internalModelName == "TS-439") {
                            if (modelname == "NSS324") {
                                showList.push("." + modelname);
                                showList.push("." + internalModelName)
                            } else {
                                if (modelname == "TS-439U" || modelname == "TS-CN439U" || modelname == "TS-439U-G") {
                                    showList.push(".TS-439U")
                                } else {
                                    showList.push(".TS-439")
                                }
                            }
                        } else {
                            if (internalModelName == "TS-809") {
                                showList.push((modelname == "TS-809U" || modelname == "TS-CN809U" || modelname == "TS-809U-G") ? ".TS-809U" : ".TS-809")
                            } else {
                                if (internalModelName == "TS-839") {
                                    showList.push((modelname == "SS-839") ? ".SS-839" : ".TS-839")
                                } else {
                                    if (internalModelName == "TS-119") {
                                        if (modelname == "Q600" || modelname == "TS-110" || modelname == "TS-129") {
                                            showList.push("." + modelname)
                                        }
                                        showList.push("." + internalModelName)
                                    } else {
                                        if (internalModelName == "TS-259") {
                                            if (modelname == "NSS322") {
                                                showList.push("." + modelname)
                                            }
                                            showList.push("." + internalModelName)
                                        } else {
                                            if (internalModelName == "TS-459") {
                                                if (modelname == "NSS324" || modelname == "NSS324R") {
                                                    showList.push("." + modelname)
                                                } else {
                                                    if (modelname == "TS-459U" || modelname == "TS-459U-G" || modelname == "TS-CN459U" || modelname == "TS-459U Pro II" || modelname == "TS-459U+" || modelname == "TS-459U-G+") {
                                                        showList.push(".TS-459U")
                                                    }
                                                }
                                                showList.push("." + internalModelName)
                                            } else {
                                                if (internalModelName == "TS-559") {
                                                    showList.push("." + internalModelName)
                                                } else {
                                                    if (internalModelName == "TS-659") {
                                                        if (modelname == "NSS326") {
                                                            showList.push("." + modelname)
                                                        } else {
                                                            if (modelname == "TS-659-G") {
                                                                showList.push(".TS-659")
                                                            }
                                                        }
                                                        showList.push("." + internalModelName)
                                                    } else {
                                                        if (internalModelName == "TS-859") {
                                                            if (modelname == "TS-859U" || modelname == "TS-859U-G" || modelname == "TS-CN859U" || modelname == "TS-859U+") {
                                                                showList.push(".TS-859U")
                                                            }
                                                            showList.push("." + internalModelName)
                                                        } else {
                                                            if (internalModelName == "TS-879") {
                                                                if (modelname == "TS-879U") {
                                                                    showList.push("." + modelname)
                                                                }
                                                                showList.push("." + internalModelName)
                                                            } else {
                                                                if (internalModelName == "TS-1079") {
                                                                    showList.push("." + internalModelName)
                                                                } else {
                                                                    if (internalModelName == "TS-1279") {
                                                                        if (modelname == "TS-1279U") {
                                                                            showList.push("." + modelname)
                                                                        }
                                                                        showList.push("." + internalModelName)
                                                                    } else {
                                                                        if (internalModelName == "TS-270" || internalModelName == "TS-470") {
                                                                            showList.push(".TS-469");
                                                                            showList.push("." + internalModelName)
                                                                        } else {
                                                                            if (internalModelName == "TS-670") {
                                                                                showList.push(".TS-879");
                                                                                showList.push("." + internalModelName)
                                                                            } else {
                                                                                if (internalModelName == "TS-469") {
                                                                                    showList.push("." + internalModelName);
                                                                                    if (modelname == "TS-469U" || modelname == "SS-469") {
                                                                                        showList.push("." + modelname)
                                                                                    }
                                                                                } else {
                                                                                    if (internalModelName == "TS-1679") {
                                                                                        if (modelname == "TS-1679U") {
                                                                                            showList.push("." + modelname)
                                                                                        }
                                                                                        showList.push("." + internalModelName)
                                                                                    } else {
                                                                                        if (internalModelName == "TS-1269") {
                                                                                            if (modelname == "TS-1269U") {
                                                                                                showList.push("." + modelname)
                                                                                            }
                                                                                            showList.push("." + internalModelName)
                                                                                        } else {
                                                                                            showList.push("." + internalModelName)
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return showList
    }
    var supportStorage = false;
    if (typeof(Storage) !== "undefined") {
        try {
            sessionStorage.setItem("tmp", 1);
            sessionStorage.removeItem("tmp");
            supportStorage = true
        } catch (e) {
            supportStorage = false;
            console.log(e.stack)
        }
    }
    var decodeSystemItems = function(jsonStr) {
        var o;
        if (Ext.isString(jsonStr)) {
            o = Ext.util.JSON.decode(jsonStr)
        } else {
            o = jsonStr;
            jsonStr = Ext.util.JSON.encode(jsonStr)
        }
        var tempMix = new Ext.util.MixedCollection();
        QNAP.QOS.widgetData = new Ext.data.JsonStore({
            autoDestroy: true,
            root: "widgets",
            fields: ["defaultTitle", "qInternationalKey", "icon", "appId", "type", "config", "js", "qDescription"]
        });
        tempMix.addAll(o);
        tempMix.eachKey(function(key) {
            o[key].appId = key;
            if (o[key]["type"] == "widget") {
                QNAP.QOS.widgetData.loadData({
                    widgets: [o[key]]
                }, true)
            }
        });
        QNAP.QOS.systemItems = o;
        if (Ext.isString(QNAP.QOS.Environment.renameMyCloudNas)) {
            QNAP.QOS.systemItems.MyCloudNas.defaultTitle = QNAP.QOS.Environment.renameMyCloudNas;
            QNAP.QOS.systemItems.MyCloudNas.qInternationalKey = QNAP.QOS.Environment.renameMyCloudNas
        }
        if (QNAP.QOS.Environment.supportNVS === true && QNAP.QOS.systemItems.network_access) {
            QNAP.QOS.systemItems.network = QNAP.QOS.systemItems.network_access;
            Ext.apply(QNAP.QOS.Keyword.model.items.network, {
                defaultTitle: QNAP.QOS.systemItems.network_access.defaultTitle,
                qInternationalKey: QNAP.QOS.systemItems.network_access.qInternationalKey
            })
        }
        if (supportStorage) {
            var VER_KEY = "QNAP_QOS_systemItems_Ver";
            var CONTENT_KEY = "QNAP_QOS_systemItems";
            if (QNAP.QOS.config.isInternet) {
                VER_KEY += "_CLOUD";
                CONTENT_KEY += "_CLOUD"
            } else {
                VER_KEY += "_LOCAL";
                CONTENT_KEY += "_LOCAL"
            }
            try {
                removeStorageValue("QNAP_QOS_systemItems_Ver");
                removeStorageValue("QNAP_QOS_systemItems");
                setStorageValue(CONTENT_KEY, jsonStr);
                setStorageValue(VER_KEY, URL_RANDOM_NUM)
            } catch (e) {
                removeStorageValue(VER_KEY);
                removeStorageValue(CONTENT_KEY)
            }
        }
    };

    function searchKeyWord(value) {
        var resultItems = {},
            results = [];
        if (!Ext.isString(value)) {
            return
        }
        value = value.replace(/\*+/g, "");
        if (value != "") {
            resultItems = QNAP.QOS.Keyword.control.search(value);
            var sysInfo = Ext.StoreMgr.item(QNAP.QOS.config.T_SYS_SETTING).getAt(0);
            var showHF = sysInfo ? sysInfo.get("hideHF") == "0" : false;
            var resultData, appInfo, helpInfo, appItem, helpItem;
            Ext.each(resultItems, function(item) {
                if (item === "childMonitor" && os.getQPKG("ResourceMonitor")) {
                    return true
                }
                resultData = QNAP.QOS.Keyword.model.items[item];
                if (resultData.config && resultData.config.fn) {
                    appInfo = QNAP.QOS.lib.getAppInfo(resultData.config.fn)
                }
                if (!appInfo) {
                    appInfo = QNAP.QOS.lib.getAppInfo(resultData.appId)
                }
                if (appInfo && resultData.appId != "helper") {
                    if ((!QNAP.QOS.user.isAdminGroup) && appInfo.isAdminOnly) {} else {
                        if (Ext.isBoolean(resultData.HFItem)) {
                            if (resultData.HFItem === true & showHF) {
                                appItem = {
                                    appId: resultData.appId,
                                    icon: appInfo.icon,
                                    config: resultData.config,
                                    type: appInfo.type,
                                    isAdminOnly: appInfo.isAdminOnly,
                                    displayIndex: resultData.displayIndex || 0
                                };
                                appItem.cate = "app";
                                Ext.copyTo(appItem, resultData, ["qInternationalKey", "defaultTitle"]);
                                results.push(appItem)
                            }
                        } else {
                            appItem = {
                                appId: resultData.appId,
                                icon: appInfo.icon,
                                config: resultData.config,
                                type: appInfo.type,
                                isAdminOnly: appInfo.isAdminOnly,
                                displayIndex: resultData.displayIndex || 0
                            };
                            appItem.cate = "app";
                            Ext.copyTo(appItem, resultData, ["qInternationalKey", "defaultTitle"]);
                            results.push(appItem)
                        }
                    }
                }
                helpInfo = QNAP.QOS.lib.getHelpInfo(item);
                appInfo = QNAP.QOS.lib.getAppInfo("helper");
                if (helpInfo && QNAP.QOS.Environment.supportHelp !== false) {
                    helpItem = {
                        appId: "helper",
                        config: {
                            fn: item,
                            items: helpInfo.items
                        },
                        type: appInfo.type,
                        icon: appInfo.icon,
                        qInternationalKey: helpInfo.qInternationalKey,
                        defaultTitle: helpInfo.defaultTitle,
                        displayIndex: resultData.displayIndex || 0
                    };
                    helpItem.cate = "help";
                    results.push(helpItem)
                }
                appInfo = null
            });
            results.sort(function(itemA, itemB) {
                if (itemA.displayIndex < itemB.displayIndex) {
                    return -1
                }
                if (itemA.displayIndex > itemB.displayIndex) {
                    return 1
                }
                return 0
            })
        }
        _D("[Info] searchKeyWord:", results);
        return results
    }

    function getViewportSize() {
        var e = window,
            a = "inner";
        if (!("innerWidth" in window)) {
            a = "client";
            e = document.documentElement || document.body
        }
        return {
            width: e[a + "Width"],
            height: e[a + "Height"]
        }
    }

    function updateOrientation(w, h) {
        if (Ext.isWindows) {
            return false
        }
        return
    }

    function parserTaskStatus(status, type) {
        var pStstus = "--";
        if (status == "0") {
            pStstus = "MISC_SCH_NEW_STR32"
        } else {
            pStstus = "MISC_DVD_ERROR_MSG259"
        }
        switch (type) {
            case "hdsmart":
                if (status == "15") {
                    pStstus = "DESHBOARD_SCHEDULED_IN_PROCESS"
                } else {
                    if (status === "1") {
                        pStstus = "SNAPSYNC_STOP_SYNC"
                    }
                }
                break;
            case "antiVirus":
                if (status === "1") {
                    pStstus = "DESHBOARD_SCHEDULED_IN_PROCESS"
                } else {
                    if (status === "2") {
                        pStstus = "IEI_NAS_MISC_BACKUP_TITLE4_ITERM31"
                    }
                }
                break;
            case "backupExternal":
            case "backupRTRR":
                if (status == "1" || status == "2" || status == "3") {
                    pStstus = "DESHBOARD_SCHEDULED_IN_PROCESS"
                } else {
                    if (status == "0" || status == "95" || status == "118") {
                        pStstus = "MISC_SCH_NEW_STR32"
                    } else {
                        if (status == "-4") {
                            pStstus = "MISC_SCH_NEW_STR46"
                        } else {
                            pStstus = "MISC_DVD_ERROR_MSG259"
                        }
                    }
                }
                break;
            case "backupRsync":
            case "backupNAStoNAS":
                if (status == "1") {
                    pStstus = "DESHBOARD_SCHEDULED_IN_PROCESS"
                } else {
                    if (status == "-48") {
                        pStstus = String.format("{0}&nbsp;{1}", _S.IEI_NAS_MISC_BACKUP_TITLE4_ITERM30, _S.MISC_SCH_NEW_STR46)
                    } else {
                        if (status == "0") {
                            pStstus = "MISC_SCH_NEW_STR32"
                        } else {
                            pStstus = "IEI_NAS_MISC_BACKUP_TITLE4_ITERM30"
                        }
                    }
                }
                break;
            case "backupLUN":
                if (status == "1" || status == "2") {
                    pStstus = "DESHBOARD_SCHEDULED_IN_PROCESS"
                }
                break;
            case "backupAmazons3":
                if (status == "3") {
                    pStstus = "DESHBOARD_SCHEDULED_IN_PROCESS"
                } else {
                    if (status == "4") {
                        pStstus = "IEI_NAS_RESTORE_SUCCESS_STRING"
                    }
                }
                break
        }
        return _S[pStstus] || pStstus
    }
    var connLogActionType = {
        1: "Delete",
        2: "Read",
        3: "Write",
        4: "Open",
        5: "MakeDir",
        6: "Mount OK",
        7: "Mount Fail",
        8: "Rename",
        9: "Login Fail",
        10: "Login OK",
        11: "Logout",
        12: "Unmount",
        13: "Copy",
        14: "Move",
        15: "Add",
        16: "Auth Fail",
        17: "Auth OK",
        18: "Recover",
        19: "Transcode Add",
        20: "Transcode Delete",
        21: "Transcode Update",
        22: "Watermark",
        23: "Rotate",
        24: "Add thumbnail",
        25: "Qfiling add",
        26: "Qfiling update",
        27: "Qfiling delete"
    };
    var connLogServType = {
        0: "Unknown",
        1: "SAMBA",
        2: "FTP",
        3: "HTTP",
        4: "NFS",
        5: "AFP",
        6: "TELNET",
        7: "SSH",
        8: "iSCSI",
        9: "RADIUS",
        10: "VPN",
        11: "HTTPS"
    };

    function initTouchEvent() {
        var lastTouchEnd = new Date().getTime();
        var lastTouchStart = new Date().getTime();
        var touchEndAction = null;
        window.addEventListener("touchstart", function(event) {
            var now = new Date().getTime();
            var delta = now - lastTouchStart;
            if (delta < 500 && delta > 0) {
                event.preventDefault()
            }
            lastTouchStart = now
        });
        window.addEventListener("touchmove", function(event) {
            var changedTouches = event.changedTouches;
            if (changedTouches.length == 2) {
                event.preventDefault()
            }
        });
        window.addEventListener("touchend", function(event) {
            var now = new Date().getTime();
            var delta = now - lastTouchEnd;
            clearTimeout(touchEndAction);
            if (delta < 500 && delta > 0) {
                touchEndAction = setTimeout(function(evt) {
                    var vo = document.createEvent("MouseEvents");
                    vo.initMouseEvent("dblclick", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                    event.target.dispatchEvent(vo);
                    clearTimeout(touchEndAction)
                }, 100, [event])
            } else {
                lastTouchEnd = now;
                touchEndAction = setTimeout(function(evt) {
                    var vo = document.createEvent("MouseEvents");
                    vo.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                    event.target.dispatchEvent(vo);
                    clearTimeout(touchEndAction)
                }, 100, [event])
            }
            lastTouchEnd = now;
            event.preventDefault()
        })
    }

    function initHotKeyEvent() {}

    function addWindowEvent(eventName, eventFn) {
        if (supportAddEventListener) {
            window.addEventListener(eventName, eventFn, false)
        } else {
            if (supportAttachEvent) {
                window.attachEvent("on" + eventName, eventFn)
            }
        }
    }

    function setStorageValue(key, value) {
        if (supportStorage) {
            localStorage.setItem(key, value)
        }
        return supportStorage
    }

    function getStorageValue(key, defaultValue) {
        if (supportStorage) {
            return localStorage.getItem(key) || defaultValue
        } else {
            return defaultValue
        }
    }

    function removeStorageValue(key) {
        if (supportStorage) {
            localStorage.removeItem(key)
        }
        return supportStorage
    }
    var ajaxFixed = false;

    function getIEVersion() {
        var rv = -1;
        if (navigator.appName == "Microsoft Internet Explorer") {
            var ua = navigator.userAgent;
            var re = new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})");
            if (re.exec(ua) != null) {
                rv = parseFloat(RegExp.$1)
            }
        }
        return rv
    }

    function addTouchScrollEvent(el) {
        el.on("touchmove", function(e) {
            var yMovement = e.browserEvent.touches[0].screenY - el.yStart;
            el.scroll("t", yMovement);
            e.preventDefault();
            el.yStart = e.browserEvent.touches[0].screenY
        });
        el.on("touchstart", function(e) {
            el.yStart = e.browserEvent.touches[0].screenY
        })
    }

    function getXMLHttpRequest() {
        var HttpRequest = false;
        if (window.XMLHttpRequest) {
            HttpRequest = new XMLHttpRequest()
        } else {
            if (window.ActiveXObject) {
                try {
                    HttpRequest = new ActiveXObject("Msxml2.XMLHTTP")
                } catch (e) {
                    try {
                        HttpRequest = new ActiveXObject("Microsoft.XMLHTTP")
                    } catch (e) {}
                }
            }
        }
        return HttpRequest
    }

    function isNewerVersion(curVer, newVer) {
        var c = /([\-,\/_]+)/g;
        var n = /(-?[0-9\.]+)/g;
        var m = String.fromCharCode(0);
        var currentVersionArray = ("" + curVer).toLowerCase().replace(c, ".").split(".");
        var remoteVersionArray = ("" + newVer).toLowerCase().replace(c, ".").split(".");
        for (var i = 0; i < Math.min(currentVersionArray.length, remoteVersionArray.length); i++) {
            var h = currentVersionArray[i].replace(n, m + "$1" + m).split(m);
            var g = remoteVersionArray[i].replace(n, m + "$1" + m).split(m);
            for (var j = 0; j < Math.max(h.length, g.length); j++) {
                var b = parseFloat(h[j]) || h[j];
                var a = parseFloat(g[j]) || g[j];
                if (a > b) {
                    return true
                } else {
                    if (b > a) {
                        return false
                    }
                }
            }
        }
        if (newVer.length > curVer.length) {
            return true
        }
        return false
    }

    function chkCCode(targetCCode, qpkgCCode) {
        var support = false;
        targetCCode = targetCCode || "0";
        qpkgCCode = qpkgCCode || "0";
        if (qpkgCCode == "0") {
            return true
        }
        Ext.each(qpkgCCode.split(","), function(code) {
            if (code == targetCCode) {
                support = true;
                return false
            }
        });
        return support
    }

    function fixTipText(text) {
        text = text.replace(/&/g, "&amp;");
        text = text.replace(/</g, "&lt;");
        text = text.replace(/>/g, "&gt;");
        text = text.replace(/"/g, "&quot;");
        text = text.replace(/'/g, "&apos;");
        return text
    }

    function iconTipTpl() {
        return {
            cls: "x-tip i-icon-tip-icon_info-blue",
            anchor: "top",
            anchorAlign: "tl-bl?",
            renderTo: Ext.getBody(),
            autoHide: false,
            autoShow: false,
            closable: true,
            onDocMouseDown: function(e) {
                if (this.autoHide !== true && !e.within(this.el.dom)) {
                    this.disable();
                    this.doEnable.defer(100, this)
                }
            },
            listeners: {
                afterrender: {
                    single: true,
                    fn: function(cmp) {
                        cmp.el.setOpacity(0)
                    }
                },
                show: function(cmp) {
                    cmp.el.disableShadow();
                    cmp.el.animate({
                        opacity: {
                            to: 1,
                            from: 0
                        }
                    }, 0.35, function() {
                        cmp.el.enableShadow(true)
                    }, "easeOut", "run");
                    return true
                }
            }
        }
    }
    return {
        getXMLHttpRequest: getXMLHttpRequest,
        fixAjax: function() {
            if (ajaxFixed) {
                return
            }
            Ext.override(Ext.data.Connection, {
                request: function(o) {
                    var me = this;
                    if (me.fireEvent("beforerequest", me, o)) {
                        if (o.el) {
                            if (!Ext.isEmpty(o.indicatorText)) {
                                me.indicatorText = '<div class="loading-indicator">' + o.indicatorText + "</div>"
                            }
                            if (me.indicatorText) {
                                Ext.getDom(o.el).innerHTML = me.indicatorText
                            }
                            o.success = (Ext.isFunction(o.success) ? o.success : function() {}).createInterceptor(function(response) {
                                Ext.getDom(o.el).innerHTML = response.responseText
                            })
                        }
                        var p = o.params,
                            url = o.url || me.url,
                            method, cb = {
                                success: function() {
                                    try {
                                        me.handleResponse.apply(this, arguments)
                                    } catch (e) {
                                        console.error(e.name);
                                        console.error(e.stack);
                                        var response = arguments[0];
                                        response.argument = {
                                            options: o
                                        };
                                        cb.failure.apply(this, [response, arguments[1]])
                                    }
                                },
                                failure: me.handleFailure,
                                scope: me,
                                argument: {
                                    options: o
                                },
                                timeout: Ext.num(o.timeout, me.timeout)
                            },
                            form, serForm;
                        if (Ext.isFunction(p)) {
                            p = p.call(o.scope || window, o)
                        }
                        p = Ext.urlEncode(me.extraParams, Ext.isObject(p) ? Ext.urlEncode(p) : p);
                        if (Ext.isFunction(url)) {
                            url = url.call(o.scope || window, o)
                        }
                        if ((form = Ext.getDom(o.form))) {
                            url = url || form.action;
                            if (o.isUpload || (/multipart\/form-data/i.test(form.getAttribute("enctype")))) {
                                if (url.indexOf("sid=" + QNAP.QOS.user.sid) === -1) {
                                    url += "&sid=" + QNAP.QOS.user.sid;
                                    delete p.sid
                                }
                                return me.doFormUpload.call(me, o, p, url)
                            }
                            serForm = Ext.lib.Ajax.serializeForm(form);
                            p = p ? (p + "&" + serForm) : serForm
                        }
                        method = o.method || me.method || ((p || o.xmlData || o.jsonData) ? "POST" : "GET");
                        if (method === "GET" && (me.disableCaching && o.disableCaching !== false) || o.disableCaching === true) {
                            var dcp = o.disableCachingParam || me.disableCachingParam;
                            url = Ext.urlAppend(url, dcp + "=" + (new Date().getTime()))
                        }
                        o.headers = Ext.applyIf(o.headers || {}, me.defaultHeaders || {});
                        if (o.autoAbort === true || me.autoAbort) {
                            me.abort()
                        }
                        if ((method == "GET" || o.xmlData || o.jsonData) && p) {
                            url = Ext.urlAppend(url, p);
                            p = ""
                        }
                        return (me.transId = Ext.lib.Ajax.request(method, url, cb, p, o))
                    } else {
                        return o.callback ? o.callback.apply(o.scope, [o, undefined, undefined]) : null
                    }
                }
            });
            ajaxFixed = true
        },
        initCss: function() {
            if (Ext.isIE10) {
                Ext.util.CSS.swapStyleSheet("ie10fix", "css/ie10fix.css?_dc=1509480336")
            }
            if (QNAP.QOS.Environment.loadODMCSS) {
                Ext.util.CSS.swapStyleSheet("ODM", "css/odm.css?_dc=1509480336")
            }
        },
        loadJsLib: function(jsLib) {
            Ext.Loader.load(jsLib, Ext.emptyFn, this, true)
        },
        initSystemItem: function() {
            var PROTOCOL = window.location.protocol.toUpperCase();
            var VER_KEY = "QNAP_QOS_systemItems_Ver";
            var CONTENT_KEY = "QNAP_QOS_systemItems";
            if (QNAP.QOS.config.isInternet) {
                VER_KEY += "_CLOUD";
                CONTENT_KEY += "_CLOUD";
                if (supportStorage && getStorageValue(VER_KEY) == URL_RANDOM_NUM && getStorageValue(CONTENT_KEY)) {
                    try {
                        decodeSystemItems(getStorageValue(CONTENT_KEY))
                    } catch (e) {
                        removeStorageValue(CONTENT_KEY);
                        removeStorageValue(VER_KEY);
                        this.initSystemItem()
                    }
                } else {
                    if (PROTOCOL === "HTTP:") {
                        Ext.Ajax.request({
                            url: "/cgi-bin/apps/system-items-cloud.json",
                            success: function(response, opts) {
                                decodeSystemItems(response.responseText)
                            }
                        })
                    } else {
                        Ext.Ajax.request({
                            url: "/cgi-bin/apps/system-items-cloud-secure.json",
                            success: function(response, opts) {
                                decodeSystemItems(response.responseText)
                            }
                        })
                    }
                }
            } else {
                VER_KEY += "_LOCAL";
                CONTENT_KEY += "_LOCAL";
                if (supportStorage && getStorageValue(VER_KEY) == URL_RANDOM_NUM && getStorageValue(CONTENT_KEY)) {
                    try {
                        decodeSystemItems(getStorageValue(CONTENT_KEY))
                    } catch (e) {
                        removeStorageValue(CONTENT_KEY);
                        removeStorageValue(VER_KEY);
                        this.initSystemItem()
                    }
                } else {
                    Ext.Ajax.request({
                        url: "/cgi-bin/apps/system-items.json",
                        success: function(response, opts) {
                            decodeSystemItems(response.responseText)
                        }
                    })
                }
            }
        },
        initHelp: function() {
            if (supportStorage && getStorageValue("help_Json_Str_Ver") == URL_RANDOM_NUM && getStorageValue("help_Json_Str")) {
                try {
                    processHelpJSON(Ext.decode(getStorageValue("help_Json_Str")), [])
                } catch (e) {
                    removeStorageValue("help_Json_Str");
                    removeStorageValue("help_Json_Str_Ver");
                    this.initHelp()
                }
            } else {
                Ext.Ajax.request({
                    url: "/cgi-bin/apps/helper/help.json",
                    method: "POST",
                    success: function(response, opts) {
                        var helpJson = Ext.decode(response.responseText);
                        processHelpJSON(helpJson, [])
                    }
                })
            }
        },
        parserRegStr: function(path) {
            path = path.replace(/\$/g, "\\$");
            path = path.replace(/\^/g, "\\^");
            path = path.replace(/\(/g, "\\(");
            path = path.replace(/\)/g, "\\)");
            path = path.replace(/\+/g, "\\+");
            path = path.replace(/\}/g, "\\}");
            path = path.replace(/\{/g, "\\{");
            path = path.replace(/\]/g, "\\]");
            path = path.replace(/\[/g, "\\[");
            return path
        },
        delayCheckSession: function() {
            Ext.util.Cookies.set("QT", new Date().getTime());
            checkSessionTask.delay(1000 * 60 * 2)
        },
        setMaxIdleTime: function(_maxIdleTime) {
            _maxIdleTime = parseInt(_maxIdleTime);
            if (Ext.isNumber(_maxIdleTime)) {
                maxIdleTime = _maxIdleTime * 1000 * 60;
                return true
            }
            return false
        },
        addTouchScrollEvent: addTouchScrollEvent,
        getIEVersion: getIEVersion,
        addWindowEvent: addWindowEvent,
        parserSubLangs: parserSubLangs,
        subLangs: subLangs,
        isMobileBrowser: isMobileBrowser,
        initHotKeyEvent: initHotKeyEvent,
        initTouchEvent: initTouchEvent,
        connLogServType: connLogServType,
        connLogActionType: connLogActionType,
        parserTaskStatus: parserTaskStatus,
        updateOrientation: updateOrientation,
        getViewportSize: getViewportSize,
        supportStorage: supportStorage,
        callApplet: callApplet,
        appletInterface: appletInterface,
        fixImgPath: fixImgPath,
        FlexTool: FlexTool,
        resetLang: resetLang,
        ClipButton: ClipButton,
        MaskMgr: MaskMgr,
        browserSelectLanguage: browserSelectLanguage,
        getLanguageCode: getLanguageCode,
        getLanguageCode2: getLanguageCode2,
        searchField: searchField,
        getCgiUrl: getCgiUrl,
        checkIfSessionTimeout: checkIfSessionTimeout,
        getAppInfo: getAppInfo,
        LinkButton: LinkButton,
        SNMPprivacyPwdField: SNMPprivacyPwdField,
        SNMPauthPwdField: SNMPauthPwdField,
        SNMPchkTextField: SNMPchkTextField,
        hasJRE: hasJRE,
        getHelpInfo: getHelpInfo,
        getModels: getModels,
        languageStore: languageStore,
        searchKeyWord: searchKeyWord,
        getStorageValue: getStorageValue,
        setStorageValue: setStorageValue,
        removeStorageValue: removeStorageValue,
        isNewerVersion: isNewerVersion,
        chkCCode: chkCCode,
        fixTipText: fixTipText,
        getCurLangCode: getCurrentLangCode,
        iconTipTpl: iconTipTpl,
        supportExecCommand: supportExecCommand
    }
}();
clipFlexCmpClick = function(a) {
    Ext.getCmp(a).flexCallBack()
};
QNAP.QOS.ajax = function(b, c, a) {
    if (Ext.isFunction(c)) {
        successFn = c
    } else {
        if (Ext.isObject(c)) {
            if (Ext.isFunction(c.success)) {
                b.success = c.success
            }
            if (Ext.isFunction(c.failure)) {
                b.failure = c.failure
            }
            if (Ext.isFunction(c.callback)) {
                b.callback = c.callback
            }
        }
    }
    if (a) {
        b.scope = a
    }
    b.failure = Ext.isFunction(b.failure) ? Ext.createDelegate(b.failure, b.scope || window) : function() {
        _D("[Info] QNAP.QOS.ajax failure", b.url, b.params)
    };
    b.successFn = function(d, f) {
        var h = QNAP.QOS.lib;
        try {
            if (!h.checkIfSessionTimeout(d.responseXML, "xml")) {
                if (b.success) {
                    b.success.call(b.scope || this, d, f)
                }
                h.delayCheckSession()
            } else {
                if (Ext.state.Manager.get("keepCheckSID") === false) {
                    return
                }
                Ext.Msg.alert("Message", "Session Timeout");
                Ext.util.Cookies.clear("NAS_SID");
                window.onbeforeunload = null;
                location.href = "/"
            }
        } catch (g) {
            b.failure.call(b.scope || this, d, f);
            console.error("[Warning] success function error", g)
        }
    };
    return Ext.Ajax.request({
        url: b.url,
        method: b.method,
        params: b.params,
        form: b.form,
        scope: b.scope,
        timeout: b.timeout || 300000,
        success: b.success,
        failure: b.failure,
        callback: b.callback
    })
};
QNAP.CMP.Plugin.ComboViewClick = function() {
    this.init = function(b) {
        b.onViewClick = Ext.createDelegate(a, b)
    };

    function a() {
        if (arguments.length == 4 && arguments[3].stopEvent) {
            arguments[3].stopEvent()
        } else {
            if (arguments.length == 2 && arguments[1].stopEvent) {
                arguments[1].stopEvent()
            }
        }
        var b = this.view.getSelectedIndexes()[0],
            c = this.store,
            d = c.getAt(b);
        if (d) {
            this.onSelect(d, b)
        } else {
            this.collapse()
        }
        if (arguments[0] !== false) {
            this.el.focus()
        }
        this.hasFocus = false
    }
};
QNAP.CMP.Plugin.WidgetScrollBar = function(c) {
    var b = this;
    b.cfg = {
        cls: "dark"
    };
    Ext.apply(this.cfg, c);
    this.init = function(e) {
        e.on("render", d);
        e.addClass("overflow-hidden");
        if (Ext.isFunction(e.refreshFn)) {
            e.refreshFn = Ext.createSequence(e.refreshFn, b.refreshFn, e)
        } else {
            e.refreshFn = Ext.createDelegate(a, e)
        }
    };

    function a() {
        var e = this;
        var k = e.el.next("div.scroll-area");
        var l = e.el.child("div.x-list-body-inner");
        var j = l.getHeight() - e.el.getHeight();
        if (j > 0) {
            var i = e.el.getBox(false, true);
            k.setTop(i.y + 5);
            k.setHeight(i.height - 5);
            k.show();
            var h = k.child("div.scroll-bar");
            var f = k.getHeight() * e.el.getHeight() / l.getHeight();
            h.setHeight(f);
            var g = k.getRegion();
            e.dd.constrainTo(k, {
                left: 2,
                right: 2,
                top: 0,
                bottom: 0
            })
        } else {
            if (k) {
                k.hide()
            }
        }
    }
    this.refreshFn = a;

    function d(k) {
        var n = new Ext.XTemplate('<div class="scroll-area scroll-area-' + b.cfg.cls + '"><div class="scroll-inner scroll-inner-' + b.cfg.cls + '"><div class="scroll-bg scroll-bg-t"></div><div class="scroll-bg scroll-bg-m"></div><div class="scroll-bg scroll-bg-b"></div><div class="scroll-bar scroll-bar-' + b.cfg.cls + '"><div class="scroll-bar-bg scroll-bar-t"></div><div class="scroll-bar-bg scroll-bar-m"></div><div class="scroll-bar-bg scroll-bar-b"></div></div></div></div>');
        var g = new Ext.XTemplate('<div class="bottom-shadow"></div>');
        var h = n.insertAfter(k.el, null, true);
        var m = g.insertAfter(k.el, null, true);
        var f = h.child("div.scroll-bar");
        var j = k.el.child("div.x-list-body-inner");
        f.addClassOnOver("scroll-bar-over");
        var i = h.getY();
        var e = i + h.getHeight();

        function l(s) {
            var q = s.getTarget("div.scroll-bar");
            if (Ext.isEmpty(q)) {
                var u = s.getPageY();
                var r = h.getTop();
                var o = u - r - (f.getHeight() / 2);
                if (o < 0) {
                    o = 0
                }
                var t = h.getHeight() - f.getHeight();
                if (o > t) {
                    o = t
                }
                f.setTop(o);
                var p = f.getTop(true) / t;
                k.el.scrollTo("Top", j.getBox().height * p)
            }
        }
        h.on("click", function(o) {
            o.stopEvent();
            l(o)
        });
        k.dd = new Ext.dd.DD(f.id, scroll);
        k.dd.setXConstraint(0, 0, 0);
        k.dd.onDrag = function(o) {
            k.el.scrollTo("Top", (k.el.getHeight()) * f.getTop(true) / f.getHeight())
        };
        k.dd.startDrag = function() {
            k.dd.constrainTo(h, {
                left: 2,
                right: 2,
                top: 0,
                bottom: 0
            })
        };
        k.el.on("scroll", function() {
            var o = k.el.getScroll();
            var t = k.el.child("div.x-list-body-inner").getBox(false, true);
            var r = h.getHeight();
            var s = h.child("div.scroll-bar");
            var q = s.getHeight();
            var p = (r) * o.top / t.height;
            s.setTop(p)
        });
        k.mon(os, "mousewheel", function(p, r) {
            var q = Ext.fly(p.target || p.srcElement).findParent("div.x-list-wrap");
            if (Ext.isEmpty(q) && p.target && p.target.parentNode) {
                q = Ext.fly(p.target.parentNode).findParent("div.x-list-wrap")
            }
            if (q && q.id == k.id) {
                var o = k.el.getScroll();
                k.el.scrollTo("Top", o.top + (r * -1) * 33)
            }
        }, k)
    }
    this.render = d
};
QNAP.CMP.Plugin.TipScrollBar = function(c) {
    var b = this;
    b.cfg = {
        cls: "dark"
    };
    Ext.apply(this.cfg, c);
    this.init = function(e) {
        e.on("render", d);
        e.addClass("overflow-hidden");
        if (Ext.isFunction(e.refreshFn)) {
            e.refreshFn = Ext.createSequence(e.refreshFn, b.refreshFn, e)
        } else {
            e.refreshFn = Ext.createDelegate(a, e)
        }
    };

    function a() {
        var e = this;
        var k = e.el.next("div.scroll-area");
        var l = e.el.child("div.x-list-body-inner");
        var j = l.getHeight() - e.el.getHeight();
        if (j > 0) {
            var i = e.el.getBox(false, true);
            k.setTop(i.y);
            k.setHeight(i.height);
            k.show();
            var h = k.child("div.scroll-bar");
            var f = k.getHeight() * e.el.getHeight() / l.getHeight();
            h.setHeight(f);
            var g = k.getRegion();
            e.dd.constrainTo(k, {
                left: 2,
                right: 2,
                top: 0,
                bottom: 0
            })
        } else {
            if (k) {
                k.hide()
            }
        }
    }
    this.refreshFn = a;

    function d(k) {
        var n = new Ext.XTemplate('<div class="scroll-area scroll-area-' + b.cfg.cls + '"><div class="scroll-inner scroll-inner-' + b.cfg.cls + '"><div class="scroll-bg scroll-bg-t"></div><div class="scroll-bg scroll-bg-m"></div><div class="scroll-bg scroll-bg-b"></div><div class="scroll-bar scroll-bar-' + b.cfg.cls + '" style="left:0px" ><div class="scroll-bar-bg scroll-bar-t"></div><div class="scroll-bar-bg scroll-bar-m"></div><div class="scroll-bar-bg scroll-bar-b"></div></div></div></div>');
        var g = new Ext.XTemplate('<div class="bottom-shadow"></div>');
        var h = n.insertAfter(k.el, null, true);
        var m = g.insertAfter(k.el, null, true);
        var f = h.child("div.scroll-bar");
        var j = k.el.child("div.x-list-body-inner");
        f.addClassOnOver("scroll-bar-over");
        var i = h.getY();
        var e = i + h.getHeight();

        function l(s) {
            var q = s.getTarget("div.scroll-bar");
            if (Ext.isEmpty(q)) {
                var u = s.getPageY();
                var r = h.getTop();
                var o = u - r - (f.getHeight() / 2);
                if (o < 0) {
                    o = 0
                }
                var t = h.getHeight() - f.getHeight();
                if (o > t) {
                    o = t
                }
                f.setTop(o);
                var p = f.getTop(true) / t;
                k.el.scrollTo("Top", j.getBox().height * p)
            }
        }
        h.on("click", function(o) {
            o.stopEvent();
            l(o)
        });
        k.dd = new Ext.dd.DD(f.id, scroll);
        k.dd.setXConstraint(0, 0, 0);
        k.dd.onDrag = function(o) {
            k.el.scrollTo("Top", (k.el.getHeight()) * f.getTop(true) / f.getHeight())
        };
        k.dd.startDrag = function() {
            k.dd.constrainTo(h, {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
            })
        };
        k.el.on("scroll", function() {
            var o = k.el.getScroll();
            var t = k.el.child("div.x-list-body-inner").getBox(false, true);
            var r = h.getHeight();
            var s = h.child("div.scroll-bar");
            var q = s.getHeight();
            var p = (r) * o.top / t.height;
            s.setTop(p)
        });
        k.mon(os, "mousewheel", function(p, r) {
            var q = Ext.fly(p.target || p.srcElement).findParent("div.x-list-wrap");
            if (Ext.isEmpty(q) && p.target && p.target.parentNode) {
                q = Ext.fly(p.target.parentNode).findParent("div.x-list-wrap")
            }
            if (q && q.id == k.id) {
                var o = k.el.getScroll();
                k.el.scrollTo("Top", o.top + (r * -1) * 33)
            }
        }, k)
    }
    this.render = d
};
QNAP.CMP.Plugin.TipSearchScrollBar = function(c) {
    var b = this;
    b.cfg = {
        cls: "dark"
    };
    Ext.apply(this.cfg, c);
    this.init = function(e) {
        e.on("render", d);
        e.addClass("overflow-hidden");
        e.autoScroll = false;
        if (Ext.isFunction(e.refreshFn)) {
            e.refreshFn = Ext.createSequence(e.refreshFn, b.refreshFn, e)
        } else {
            e.refreshFn = Ext.createDelegate(a, e)
        }
    };

    function a() {
        var e = this;
        var k = e.el.next("div.scroll-area");
        var l = e.el.child("div.search-list-inner");
        if (Ext.isEmpty(l)) {
            return
        }
        var j = l.getHeight() - e.el.getHeight();
        if (j > 0) {
            var i = e.el.getBox(false, true);
            k.setTop(i.y);
            k.setHeight(i.height);
            k.show();
            var h = k.child("div.scroll-bar");
            var f = k.getHeight() * e.el.getHeight() / l.getHeight();
            h.setHeight(f);
            var g = k.getRegion();
            e.dd.constrainTo(k, {
                left: 2,
                right: 6,
                top: 0,
                bottom: 0
            })
        } else {
            if (k) {
                k.hide()
            }
        }
    }
    this.refreshFn = a;

    function d(k) {
        var n = new Ext.XTemplate('<div class="scroll-area scroll-area-' + b.cfg.cls + '"><div class="scroll-inner scroll-inner-' + b.cfg.cls + '"><div class="scroll-bg scroll-bg-t"></div><div class="scroll-bg scroll-bg-m"></div><div class="scroll-bg scroll-bg-b"></div><div class="scroll-bar scroll-bar-' + b.cfg.cls + '"><div class="scroll-bar-bg scroll-bar-t"></div><div class="scroll-bar-bg scroll-bar-m"></div><div class="scroll-bar-bg scroll-bar-b"></div></div></div></div>');
        var g = new Ext.XTemplate('<div class="bottom-shadow"></div>');
        var h = n.insertAfter(k.el, null, true);
        var m = g.insertAfter(k.el, null, true);
        var f = h.child("div.scroll-bar");
        var j = k.el.child("div.search-list-inner");
        f.addClassOnOver("scroll-bar-over");
        var i = h.getY();
        var e = i + h.getHeight();

        function l(s) {
            var q = s.getTarget("div.scroll-bar");
            if (Ext.isEmpty(q)) {
                var u = s.getPageY();
                var r = h.getTop();
                var o = u - r - (f.getHeight() / 2);
                if (o < 0) {
                    o = 0
                }
                var t = h.getHeight() - f.getHeight();
                if (o > t) {
                    o = t
                }
                f.setTop(o);
                var p = f.getTop(true) / t;
                k.el.scrollTo("Top", j.getBox().height * p)
            }
        }
        h.on("click", function(o) {
            o.stopEvent();
            l(o)
        });
        k.dd = new Ext.dd.DD(f.id, scroll);
        k.dd.setXConstraint(0, 0, 2);
        k.dd.onDrag = function(o) {
            k.el.scrollTo("Top", (k.el.getHeight()) * f.getTop(true) / f.getHeight())
        };
        k.dd.startDrag = function() {
            k.dd.constrainTo(h, {
                left: 2,
                right: 6,
                top: 0,
                bottom: 0
            })
        };
        k.el.on("scroll", function() {
            var o = k.el.getScroll();
            var t = k.el.child("div.search-list-inner").getBox(false, true);
            var r = h.getHeight();
            var s = h.child("div.scroll-bar");
            var q = s.getHeight();
            var p = (r) * o.top / t.height;
            s.setTop(p)
        });
        k.mon(os, "mousewheel", function(p, r) {
            var q = Ext.fly(p.target || p.srcElement).findParent("div.search-list");
            if (Ext.isEmpty(q) && p.target && p.target.parentNode) {
                q = Ext.fly(p.target.parentNode).findParent("div.search-list")
            }
            if (q && q.id == k.id) {
                var o = k.el.getScroll();
                k.el.scrollTo("Top", o.top + (r * -1) * 33)
            }
        }, k)
    }
    this.render = d
};
QNAP.CMP.Plugin.SideMenuScrollBar = function(c) {
    var b = this;
    b.cfg = {
        cls: "dark"
    };
    Ext.apply(this.cfg, c);
    this.init = function(e) {
        e.on("render", d);
        e.on("destroy", function() {
            e.update = Ext.emptyFn
        });
        e.addClass("overflow-hidden");
        e.update = Ext.createSequence(e.update, b.refreshFn, e)
    };

    function a() {
        var m = this;
        var k = m.el.child("div.side-menu-box");
        if (Ext.isEmpty(k)) {
            return
        }
        k.on("scroll", function() {
            var t = m.el.child("div.apps");
            var n = k.getScroll();
            var s = t.getBox(false, true);
            var q = i.getHeight();
            var r = i.child("div.scroll-bar");
            var p = r.getHeight();
            var o = (q) * n.top / s.height;
            r.setTop(o)
        });
        var i = m.el.next("div.scroll-area");
        i.setTop(m.el.getTop() + 15);
        var g = m.el.child("div.apps");
        var h = g.getHeight() - k.getHeight();
        if (h > 0) {
            var j = m.el.getBox(false, true);
            i.show();
            var f = i.child("div.scroll-bar");
            var l = i.getHeight() * k.getHeight() / g.getHeight();
            f.setHeight(l);
            var e = i.getRegion();
            m.dd.constrainTo(i, {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
            })
        } else {
            if (i) {
                i.hide()
            }
        }
    }
    this.refreshFn = a;

    function d(h) {
        var e = new Ext.XTemplate('<div class="scroll-area scroll-area-' + b.cfg.cls + '"><div class="scroll-inner scroll-inner-' + b.cfg.cls + '"><div class="scroll-bg scroll-bg-t"></div><div class="scroll-bg scroll-bg-m"></div><div class="scroll-bg scroll-bg-b"></div><div class="scroll-bar scroll-bar-' + b.cfg.cls + '"><div class="scroll-bar-bg scroll-bar-t"></div><div class="scroll-bar-bg scroll-bar-m"></div><div class="scroll-bar-bg scroll-bar-b"></div></div></div></div>');
        var f = new Ext.XTemplate('<div class="bottom-shadow"></div>');
        var j = e.insertAfter(h.el, null, true);
        var k = f.insertAfter(h.el, null, true);
        var g = j.child("div.scroll-bar");
        var i = h.el.child("div.x-list-body-inner");
        g.addClassOnOver("scroll-bar-over");

        function l(r) {
            var p = r.getTarget("div.scroll-bar");
            if (Ext.isEmpty(p)) {
                var t = r.getPageY();
                var q = j.getTop();
                var m = t - q - (g.getHeight() / 2);
                if (m < 0) {
                    m = 0
                }
                var s = j.getHeight() - g.getHeight();
                if (m > s) {
                    m = s
                }
                g.setTop(m);
                var n = h.el.child("div.side-menu-box");
                var o = g.getTop(true) / s;
                n.scrollTo("Top", n.getBox().height * o)
            }
        }
        h.dd = new Ext.dd.DD(g.id, scroll);
        h.dd.setXConstraint(0, 0, 0);
        h.dd.onDrag = function(n) {
            var m = h.el.child("div.side-menu-box");
            m.scrollTo("Top", (m.getHeight()) * g.getTop(true) / g.getHeight())
        };
        h.dd.startDrag = function() {
            h.dd.constrainTo(j, {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
            })
        };
        g.on("click", function(m) {
            m.stopEvent()
        });
        j.on("click", function(m) {
            m.stopEvent();
            l(m)
        });
        h.mon(os, "mousewheel", function(o, q) {
            var p = Ext.fly(o.target || o.srcElement).findParent("div.side-menu-box");
            if (Ext.isEmpty(p) && o.target && o.target.parentNode) {
                p = Ext.fly(o.target.parentNode).findParent("div.side-menu-box")
            }
            if (p && h.el.contains(p)) {
                var n = h.el.child("div.side-menu-box");
                var m = n.getScroll();
                n.scrollTo("Top", m.top + (q * -1) * 33)
            }
        }, h)
    }
    this.render = d
};
QNAP.CMP.Plugin.GroupWindowScrollBar = function(c) {
    var b = this;
    b.cfg = {
        cls: "dark"
    };
    Ext.apply(this.cfg, c);
    this.init = function(e) {
        e.on("render", d);
        e.on("destroy", function() {
            e.update = Ext.emptyFn
        });
        e.addClass("overflow-hidden");
        e.update = Ext.createSequence(e.update, b.refreshFn, e)
    };

    function a() {
        var m = this;
        var k = m.el;
        if (Ext.isEmpty(k)) {
            return
        }
        k.on("scroll", function() {
            var t = m.el.child("div.group-list");
            var n = k.getScroll();
            var s = t.getBox(false, true);
            var q = i.getHeight();
            var r = i.child("div.scroll-bar");
            var p = r.getHeight();
            var o = (q) * n.top / s.height;
            r.setTop(o)
        });
        var i = m.ownerCt.el.child("div.scroll-area");
        i.setTop(m.el.getTop(true) + 10);
        var g = m.el.child("div.group-list");
        var h = g.getHeight() - k.getHeight();
        if (h > 0) {
            var j = m.el.getBox(false, true);
            i.show();
            var f = i.child("div.scroll-bar");
            var l = i.getHeight() * k.getHeight() / g.getHeight();
            f.setHeight(l);
            var e = i.getRegion();
            m.dd.constrainTo(i, {
                left: 0,
                right: 15,
                top: 0,
                bottom: 0
            })
        } else {
            if (i) {
                i.hide()
            }
        }
    }
    this.refreshFn = a;

    function d(g) {
        var e = new Ext.XTemplate('<div class="scroll-area ' + b.cfg.cls + '-scroll-area"><div class="scroll-inner ' + b.cfg.cls + '-scroll-inner"><div class="scroll-bg scroll-bg-t"></div><div class="scroll-bg scroll-bg-m"></div><div class="scroll-bg scroll-bg-b"></div><div class="scroll-bar ' + b.cfg.cls + '-scroll-bar-"><div class="scroll-bar-bg scroll-bar-t"></div><div class="scroll-bar-bg scroll-bar-m"></div><div class="scroll-bar-bg scroll-bar-b"></div></div></div></div>');
        var i = e.insertAfter(g.el, null, true);
        var f = i.child("div.scroll-bar");
        var h = g.el.child("div.group-content");
        f.addClassOnOver("scroll-bar-over");

        function j(p) {
            var n = p.getTarget("div.scroll-bar");
            if (Ext.isEmpty(n)) {
                var r = p.getPageY();
                var o = i.getTop();
                var k = r - o - (f.getHeight() / 2);
                if (k < 0) {
                    k = 0
                }
                var q = i.getHeight() - f.getHeight();
                if (k > q) {
                    k = q
                }
                f.setTop(k);
                var l = g.el;
                var m = f.getTop(true) / q;
                l.scrollTo("Top", l.getBox().height * m)
            }
        }
        g.dd = new Ext.dd.DD(f.id, scroll);
        g.dd.setXConstraint(0, 0, 0);
        g.dd.onDrag = function(l) {
            var k = g.el;
            k.scrollTo("Top", (k.getHeight()) * f.getTop(true) / f.getHeight())
        };
        g.dd.startDrag = function() {
            g.dd.constrainTo(i, {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
            })
        };
        f.on("click", function(k) {
            k.stopEvent()
        });
        i.on("click", function(k) {
            k.stopEvent();
            j(k)
        });
        g.mon(os, "mousewheel", function(m, o) {
            var n = Ext.fly(m.target || m.srcElement).findParent("div.group-list");
            if (Ext.isEmpty(n) && m.target && m.target.parentNode) {
                n = Ext.fly(m.target.parentNode).findParent("div.group-list")
            }
            if (n && g.el.contains(n)) {
                var l = g.el;
                var k = l.getScroll();
                l.scrollTo("Top", k.top + (o * -1) * 33)
            }
        }, g)
    }
    this.render = d
};
QNAP.CMP.Plugin.BoxScrollBar = function(e) {
    var c = this;
    c.cfg = {
        cls: "dark",
        autoHide: true
    };
    Ext.apply(this.cfg, e);
    this.init = function(h) {
        c.cmp = h;
        h.on("render", f);
        h.on("afterrender", b);
        h.on("destroy", function() {
            h.update = Ext.emptyFn
        });
        h.addClass("overflow-hidden");
        h.update = Ext.createSequence(h.update, c.refreshFn, h)
    };

    function b(h) {
        h.ownerCt.el.on("mouseenter", c.updateBar, h);
        h.ownerCt.el.on("mouseleave", a, h)
    }

    function d() {
        var h = this;
        var i = h.el.next("div.scroll-area");
        i.show(!i.isVisible())
    }

    function a(j) {
        var h = this;
        var i = h.el.next("div.scroll-area");
        i.hide(true)
    }

    function g(o, u) {
        var m = this;
        if (Ext.isEmpty(m.el)) {
            return
        }
        var k = m.el.child("div.x-box-inner").first();
        var p = 0;
        var q = m.el.getHeight();
        while (k) {
            p += k.getHeight();
            k = k.next()
        }
        var l = m.el.next("div.scroll-area");
        l.setTop(m.el.getTop(true) + 10);
        l.setHeight(q - 20);
        var j = p - q;
        if (j > 0) {
            var n = m.el.getBox(false, true);
            l.show(!l.isVisible());
            var i = l.child("div.scroll-bar");
            var s = l.getHeight() * q / p;
            i.setHeight(s);
            var h = l.getRegion();
            m.dd.constrainTo(l, {
                left: 2,
                right: -2,
                top: 0,
                bottom: 0
            })
        } else {
            if (l) {
                l.hide()
            }
        }
        m.el.child("div.x-box-inner").on("scroll", function() {
            var r = m.el.child("div.x-box-inner").getScroll();
            var y = m.el.getBox(false, true);
            var x = l.child("div.scroll-bar");
            var w = x.getHeight();
            var t = (w) * r.top / y.height;
            x.setTop(t)
        })
    }
    c.updateBar = g;

    function f(j) {
        var h = new Ext.XTemplate('<div class="scroll-area ' + (c.cfg.autoHide ? "auto-hide " : "") + c.cfg.cls + '-scroll-area"><div class="scroll-inner ' + c.cfg.cls + '-scroll-inner"><div class="scroll-bg scroll-bg-t"></div><div class="scroll-bg scroll-bg-m"></div><div class="scroll-bg scroll-bg-b"></div><div class="scroll-bar ' + c.cfg.cls + '-scroll-bar-"><div class="scroll-bar-bg scroll-bar-t"></div><div class="scroll-bar-bg scroll-bar-m"></div><div class="scroll-bar-bg scroll-bar-b"></div></div></div></div>');
        var k = h.insertAfter(j.el, null, true);
        var i = k.child("div.scroll-bar");
        i.addClassOnOver("scroll-bar-over");

        function l(r) {
            var p = r.getTarget("div.scroll-bar");
            if (Ext.isEmpty(p)) {
                var t = r.getPageY();
                var q = k.getTop();
                var m = t - q - (i.getHeight() / 2);
                if (m < 0) {
                    m = 0
                }
                var s = k.getHeight() - i.getHeight();
                if (m > s) {
                    m = s
                }
                i.setTop(m);
                var n = j.el;
                var o = i.getTop(true) / s;
                n.scrollTo("Top", n.getBox().height * o)
            }
        }
        j.dd = new Ext.dd.DD(i.id, scroll);
        j.dd.onDrag = function(n) {
            var m = j.el.child("div.x-box-inner");
            m.scrollTo("Top", (m.getHeight()) * i.getTop(true) / i.getHeight())
        };
        j.dd.startDrag = function() {
            j.dd.constrainTo(k, {
                left: 2,
                right: -2,
                top: 0,
                bottom: 0
            })
        };
        i.on("click", function(m) {
            m.stopEvent()
        });
        k.on("click", function(m) {
            m.stopEvent();
            l(m)
        });
        j.mon(os, "mousewheel", function(o, p) {
            if (o.within(j.el)) {
                var n = j.el.child("div.x-box-inner");
                var m = n.getScroll();
                n.scrollTo("Top", m.top + (p * -1) * 33)
            }
        }, j)
    }
};
QNAP.CMP.Plugin.BoxScrollBarV2 = function(e) {
    var c = this;
    c.cfg = {
        cls: "dark",
        autoHide: true
    };
    Ext.apply(this.cfg, e);
    this.init = function(h) {
        c.cmp = h;
        h.on("afterrender", b);
        h.on("destroy", function() {
            h.update = Ext.emptyFn
        });
        h.addClass("overflow-hidden");
        h.update = Ext.createSequence(h.update, c.refreshFn, h)
    };

    function b(h) {
        c.cfg.targetEl = c.cfg.targetEl ? c.cfg.targetEl : h.el;
        f(h);
        c.hide = Ext.createDelegate(a, c.cfg.targetEl);
        if (c.cfg.autoHide) {
            c.cfg.targetEl.on("mouseenter", c.updateBar, h);
            c.cfg.targetEl.on("mouseleave", a, h)
        }
    }

    function d() {
        var h = this;
        var i = h.el.next("div.scroll-area");
        i.show(!i.isVisible())
    }

    function a(j) {
        var h = this;
        var i = h.next("div.scroll-area");
        i.hide(true)
    }

    function g(m, u) {
        var s = c.cfg.targetEl;
        var p = this;
        var n = s.first() ? s.first().getHeight() : 0;
        var o = s.getHeight();
        var k = s.next("div.scroll-area");
        k.setHeight(o - c.cfg.bottomGap);
        var j = n - o;
        if (j > 0) {
            var l = s.getBox(false, true);
            k.show(!k.isVisible());
            var i = k.child("div.scroll-bar");
            var q = parseInt(k.getHeight() * o / n);
            i.setHeight(q);
            var h = k.getRegion();
            p.dd.constrainTo(k, {
                left: 2,
                right: -2,
                top: 0,
                bottom: 0
            })
        } else {
            if (k) {
                k.hide()
            }
        }
    }
    c.updateBar = g;

    function f(j) {
        var h = new Ext.XTemplate('<div class="scroll-area ' + (c.cfg.autoHide ? "auto-hide " : "") + c.cfg.cls + '-scroll-area"><div class="scroll-inner ' + c.cfg.cls + '-scroll-inner"><div class="scroll-bg scroll-bg-t"></div><div class="scroll-bg scroll-bg-m"></div><div class="scroll-bg scroll-bg-b"></div><div class="scroll-bar ' + c.cfg.cls + '-scroll-bar-"><div class="scroll-bar-bg scroll-bar-t"></div><div class="scroll-bar-bg scroll-bar-m"></div><div class="scroll-bar-bg scroll-bar-b"></div></div></div></div>');
        var k = h.insertAfter(c.cfg.targetEl, null, true);
        if (c.cfg.styleCfg) {
            k.setStyle(c.cfg.styleCfg)
        }
        var i = k.child("div.scroll-bar");
        i.addClassOnOver("scroll-bar-over");

        function l(r) {
            var p = r.getTarget("div.scroll-bar");
            if (Ext.isEmpty(p)) {
                var t = r.getPageY();
                var q = k.getTop();
                var m = t - q - (i.getHeight() / 2);
                if (m < 0) {
                    m = 0
                }
                var s = k.getHeight() - i.getHeight();
                if (m > s) {
                    m = s
                }
                i.setTop(m);
                var n = c.cfg.targetEl;
                var o = i.getTop(true) / s;
                n.scrollTo("Top", n.getBox().height * o)
            }
        }
        j.dd = new Ext.dd.DD(i.id, scroll);
        j.dd.onDrag = function(n) {
            var m = c.cfg.targetEl;
            m.scrollTo("Top", (m.getHeight()) * i.getTop(true) / i.getHeight())
        };
        j.dd.startDrag = function() {
            j.dd.constrainTo(k, {
                left: 2,
                right: -2,
                top: 0,
                bottom: 0
            })
        };
        i.on("click", function(m) {
            m.stopEvent()
        });
        k.on("click", function(m) {
            m.stopEvent();
            l(m)
        });
        j.mon(os, "mousewheel", function(o, p) {
            if (o.within(c.cfg.targetEl)) {
                var n = c.cfg.targetEl;
                var m = n.getScroll();
                n.scrollTo("Top", m.top + (p * -1) * 33)
            }
        }, j);
        c.cfg.targetEl.on("scroll", function() {
            var m = c.cfg.targetEl.getScroll();
            var q = c.cfg.targetEl.getBox(false, true);
            var p = k.child("div.scroll-bar");
            var o = p.getHeight();
            var n = (o) * m.top / q.height;
            p.setTop(n)
        })
    }
};
QNAP.CMP.Plugin.QTSScrollBar = function(g) {
    var A = g.target,
        u = 0,
        C = 0,
        f, q;
    var c = 1;
    if (Ext.isIE) {
        c = -10
    }
    f = new Ext.util.DelayedTask(function() {
        h.removeClass("scrollbar-over")
    });
    q = new Ext.util.DelayedTask(function() {
        a.removeClass("scrollbar-over")
    });

    function w() {
        var I = A.dom;
        var J = Ext.fly(I);
        var H, M, O, G;
        var E, L;
        var F, N;
        if (!I) {
            return
        }
        H = J.getHeight();
        M = J.getWidth();
        O = I.scrollHeight;
        G = I.scrollWidth;
        A.setStyle({
            overflow: "hidden"
        });
        A.scrollScale = H / O;
        A.scrollScale = (A.scrollScale > 1 ? 1 : A.scrollScale);
        if (isNaN(A.scrollScale)) {
            A.scrollScale = 0
        }
        A.scrollScaleH = M / G;
        A.scrollScaleH = (A.scrollScaleH > 1 ? 1 : A.scrollScaleH);
        if (isNaN(A.scrollScaleH)) {
            A.scrollScaleH = 0
        }
        var K = 0,
            D = 0;
        if (A.scrollScaleH !== 1) {
            K = 12;
            h.addClass("qts-scrollbar--bottom-gap")
        } else {
            h.removeClass("qts-scrollbar--bottom-gap")
        }
        if (A.scrollScale !== 1) {
            D = 12;
            a.addClass("qts-scrollbar--right-gap")
        } else {
            a.removeClass("qts-scrollbar--right-gap")
        }
        a.setDisplayed(A.scrollScaleH !== 1);
        a.alignTo(A, "bl-bl");
        a.setWidth(A.getWidth());
        d.setWidth(Math.floor(A.scrollScaleH * M));
        E = a.getWidth();
        L = d.getWidth();
        a.maxLeft = E - L - D;
        a.setStyle("z-index", A.getStyle("z-index"));
        A.scrollRateH = (G - M) / (E - L);
        if (A.scrollRateH === 0) {
            A.scrollRateH = 1
        }
        h.setDisplayed(A.scrollScale !== 1);
        h.alignTo(A, "tr-tr");
        h.setHeight(A.getHeight());
        s.setHeight(Math.floor(A.scrollScale * H));
        F = h.getHeight();
        N = s.getHeight();
        h.maxTop = F - N - K;
        h.setStyle("z-index", A.getStyle("z-index"));
        A.scrollRate = (O - H) / (F - N);
        if (A.scrollRate === 0) {
            A.scrollRate = 1
        }
        i()
    }

    function l() {
        A.on("mouseenter", function() {
            w();
            h.addClass("scrollbar-over");
            a.addClass("scrollbar-over");
            f.delay(3000);
            q.delay(3000)
        });
        A.on("mouseleave", function() {
            h.removeClass("scrollbar-over");
            a.removeClass("scrollbar-over")
        });
        A.on("touchstart", function(D) {
            w();
            h.addClass("scrollbar-over");
            a.addClass("scrollbar-over");
            k(D)
        });
        A.on("touchend", function() {
            h.removeClass("scrollbar-over");
            a.removeClass("scrollbar-over")
        });
        A.on("scroll", i);
        if (Ext.supportWheelEvent) {
            A.on("wheel", m, null, {
                normalized: false
            })
        } else {
            if (Ext.isMac) {
                A.on("wheel", m, null, {
                    normalized: false
                })
            } else {
                if (Ext.isIE) {
                    A.on("mousewheel", b, null, {
                        normalized: false
                    })
                } else {
                    if (Ext.isGecko) {
                        A.on("wheel", x, null, {
                            normalized: false
                        })
                    } else {
                        A.on("wheel", m, null, {
                            normalized: false
                        })
                    }
                }
            }
        }
        h.on("click", function(E, D) {
            E.stopEvent();
            t(E, D)
        });
        a.on("click", function(E, D) {
            E.stopEvent();
            t(E, D)
        })
    }

    function j(E) {
        var F = E.browserEvent.touches[0],
            D = A.getScroll();
        A.scrollTo("Top", D.top + (A.lastTouchY - F.clientY));
        A.scrollTo("Left", D.left + (A.lastTouchX - F.clientX));
        A.lastTouchX = F.clientX;
        A.lastTouchY = F.clientY
    }

    function k(D) {
        var E = D.browserEvent.touches[0];
        A.lastTouchX = E.clientX;
        A.lastTouchY = E.clientY;
        A.on("touchmove", j);
        A.on("touchend", B);
        if (Ext.isFunction(g.startDrag)) {
            g.startDrag()
        }
    }

    function B() {
        A.un("touchmove", j);
        A.un("touchend", B);
        if (Ext.isFunction(g.endDrag)) {
            g.endDrag()
        }
    }

    function i() {
        var D = A.getScroll(),
            E = Math.min(Math.floor(D.top / A.scrollRate), h.maxTop),
            F = Math.min(Math.floor(D.left / A.scrollRateH), a.maxLeft);
        h.addClass("scrollbar-over");
        a.addClass("scrollbar-over");
        if (E !== C) {
            C = E;
            s.setTop(E);
            q.delay(3000)
        } else {
            f.delay(1000)
        }
        if (F !== u) {
            u = F;
            d.setLeft(F);
            q.delay(3000)
        } else {
            q.delay(1000)
        }
    }

    function b(E) {
        var D = A.getScroll();
        A.scrollTo("Top", D.top + (-E.wheelDelta));
        if (D.top !== A.getScroll().top) {
            E.preventDefault();
            E.stopPropagation()
        }
    }

    function x(E) {
        var D = A.getScroll();
        A.scrollTo("Top", D.top + E.deltaY * 33);
        if (D.top !== A.getScroll().top) {
            E.preventDefault();
            E.stopPropagation()
        }
    }

    function m(H) {
        var E = A.getScroll();
        var D = 0,
            G = 0;
        switch (Ext.supportWheelEvent) {
            case "DOMMouseScroll":
            case "wheel":
                D = H.deltaY;
                G = H.deltaX;
                if (Ext.isGecko && Ext.isWindows) {
                    D *= 20;
                    G *= 20
                }
                break;
            case "mousewheel":
                D = -1 / 40 * H.deltaY;
                G = -1 / 40 * H.deltaX;
                break
        }
        D *= c;
        G *= c;
        if (D !== 0) {
            A.scrollTo("Top", E.top + D)
        }
        if (G !== 0) {
            A.scrollTo("Left", E.left + G)
        }
        var F = A.getScroll();
        if (E.top !== F.top || E.left !== F.left) {
            H.preventDefault();
            H.stopPropagation()
        }
    }

    function t(K, M) {
        var I, G;
        if (M.id === h.id) {
            var D = s.getTop(true),
                J = s.getHeight();
            var E = K.getPageY() - h.getTop();
            G = Math.ceil(Math.abs(D - E) / J);
            if (D < E) {
                G = (G - 1) * -1
            } else {
                G = G * 1
            }
            I = G * J * A.scrollRate;
            A.scroll("t", I)
        } else {
            if (M.id === a.id) {
                var H = d.getLeft(true),
                    L = d.getWidth();
                var F = K.getPageX() - a.getLeft();
                G = Math.ceil(Math.abs(H - F) / L);
                if (H < F) {
                    G = (G - 1) * -1
                } else {
                    G = G * 1
                }
                I = G * L * A.scrollRateH;
                A.scroll("r", I)
            }
        }
    }

    function e() {
        var D = new Ext.dd.DD(s.id, scroll);
        D.setXConstraint(0, 0, 0);
        D.onDrag = function(G) {
            var F = parseInt((A.getHeight()) * s.getTop(true) / s.getHeight());
            F = parseInt(s.getTop(true) * A.scrollRate);
            A.scrollTo("Top", F)
        };
        D.startDrag = function() {
            var F = 0,
                G = 0;
            if (h.hasClass("qts-scrollbar--bottom-gap")) {
                G = 12
            }
            this.constrainTo(h, {
                left: F,
                right: F,
                top: F,
                bottom: G
            });
            h.addClass("drag");
            if (Ext.isFunction(g.startDrag)) {
                g.startDrag()
            }
        };
        D.endDrag = function() {
            h.removeClass("drag");
            if (Ext.isFunction(g.endDrag)) {
                g.endDrag()
            }
        };
        var E = new Ext.dd.DD(d.id, scroll);
        E.setXConstraint(0, 0, 0);
        E.onDrag = function(F) {
            var G = parseInt((A.getWidth()) * d.getLeft(true) / d.getWidth());
            G = parseInt(d.getLeft(true) * A.scrollRateH);
            A.scrollTo("Left", G)
        };
        E.startDrag = function() {
            var G = 0,
                F = 0;
            if (a.hasClass("qts-scrollbar--right-gap")) {
                F = 12
            }
            this.constrainTo(a, {
                left: G,
                right: F,
                top: G,
                bottom: G
            });
            a.addClass("drag");
            if (Ext.isFunction(g.startDrag)) {
                g.startDrag()
            }
        };
        E.endDrag = function() {
            a.removeClass("drag");
            if (Ext.isFunction(g.endDrag)) {
                g.endDrag()
            }
        }
    }

    function n() {
        h.hide()
    }

    function y() {
        h.show()
    }
    var A = g.target;
    A.addClass("overflow-hidden");
    var r = Ext.id(null, "qts-scrollbar-");
    var o = new Ext.XTemplate('<div class="qts-scrollbar scrollbar-track ' + (g.cls ? g.cls : "") + '" id="' + r + '" ><div class="scrollbar-thumb " id="' + r + '-thubm" ></div></div>');
    var z = new Ext.XTemplate('<div class="qts-scrollbar qts-scrollbar-horizontal scrollbar-track ' + (g.cls ? g.cls : "") + '" id="' + r + '-h" ><div class="scrollbar-thumb " id="' + r + '-h-thubm" ></div></div>');
    var h = o.insertAfter(A, null, true);
    var a = z.insertAfter(A, null, true);
    var s = h.child(".scrollbar-thumb");
    var d = a.child(".scrollbar-thumb");
    h.addClassOnOver("scrollbar-over");
    a.addClassOnOver("scrollbar-over");
    var p = new Ext.util.DelayedTask(w);
    w();
    e();
    l();
    this.target = A;
    this.scrollBar = h;
    this.updateSize = function(D) {
        if (D) {
            w()
        } else {
            p.delay(500)
        }
    };
    this.hide = n;
    this.show = y
};
QNAP.CMP.Plugin.WidgetPanel = function(c, e) {
    this.init = function(i) {
        Ext.apply(i, {
            collapsed: true,
            shadow: false,
            floating: true,
            getState: function() {
                var k = this.getBox(true);
                delete k.width;
                delete k.height;
                k.bodyWidth = Ext.getBody().getWidth();
                k.bodyHeight = Ext.getBody().getHeight();
                return k
            },
            applyState: function(l) {
                if (l) {
                    var k = Ext.getBody();
                    l.x = l.x / l.bodyWidth * k.getWidth();
                    l.y = l.y / l.bodyHeight * k.getHeight();
                    Ext.apply(this, l)
                }
            },
            updateHandles: function() {
                if (Ext.isIE && this.resizer) {
                    this.resizer.syncHandleHeight();
                    this.el.repaint()
                }
            },
            beforeResize: function() {
                this.resizer.minHeight = Math.max(this.initialConfig.height, this.getFrameHeight() + 40);
                this.resizer.minWidth = Math.max(this.initialConfig.width, this.getFrameWidth() + 40);
                this.resizeBox = this.el.getBox()
            },
            resize: function(n, l, k) {
                var m = this.getBox();
                this.width = this.getWidth();
                this.height = this.getHeight();
                this.pageX = m.x;
                this.pageY = m.y
            },
            resizerAction: function() {
                var k = this.proxy.getBox(true);
                this.proxy.hide();
                this.panel.handleResize(k);
                return k
            },
            handleResize: function(l) {
                var k = this.resizeBox;
                if (k.x != l.x || k.y != l.y) {
                    this.updateBox(l)
                } else {
                    this.setSize(l);
                    if (Ext.isIE6 && Ext.isStrict) {
                        this.doLayout()
                    }
                }
                this.focus();
                this.updateHandles();
                this.saveState()
            },
            addTool: function() {
                if (!this.rendered) {
                    if (!this.tools) {
                        this.tools = []
                    }
                    Ext.each(arguments, function(r) {
                        this.tools.push(r)
                    }, this);
                    return
                }
                if (!this[this.toolTarget]) {
                    return
                }
                if (!this.toolTemplate) {
                    var p = new Ext.Template('<div class="x-tool x-tool-{id}">&#160;</div>');
                    p.disableFormats = true;
                    p.compile();
                    Ext.Panel.prototype.toolTemplate = p
                }
                for (var o = 0, m = arguments, l = m.length; o < l; o++) {
                    var k = m[o];
                    if (!this.tools[k.id]) {
                        var q = ["x-tool-over", "x-tool-" + k.id + "-over"];
                        var n = this.toolTemplate.insertFirst(this[this.toolTarget], k, true);
                        this.tools[k.id] = n;
                        n.enableDisplayMode("block");
                        this.mon(n, "click", this.createToolHandler(n, k, q, this));
                        if (k.on) {
                            this.mon(n, k.on)
                        }
                        if (k.hidden) {
                            n.hide()
                        }
                        if (k.qtip) {
                            if (Ext.isObject(k.qtip)) {
                                Ext.QuickTips.register(Ext.apply({
                                    target: n.id
                                }, k.qtip))
                            } else {
                                n.dom.qtip = k.qtip
                            }
                        }
                        n.addClassOnOver(q)
                    }
                }
            },
            stateful: true,
            stateEvents: ["move"],
            draggable: {
                insertProxy: false,
                b4StartDrag: function(k, l) {
                    this.panel.last_header_height = this.panel.header.getHeight();
                    this.proxy.show()
                },
                startDrag: function() {
                    var k = this.panel;
                    var l = os.desktop.desktop.windowArea;
                    var m = l.getBox();
                    this.constrainTo(l.id, {
                        top: -k.pageY,
                        left: -k.pageX,
                        right: k.pageX
                    });
                    this.minX = 0;
                    this.maxX = m.width - k.width;
                    this.minY = m.y;
                    this.maxY = m.height + m.y - k.last_header_height
                },
                onDrag: function(m) {
                    var l = this.proxy.getEl();
                    this.x = l.getLeft(true);
                    this.y = l.getTop(true);
                    var k = this.panel.getEl().shadow;
                    if (k) {
                        k.realign(this.x, this.y, l.getWidth(), l.getHeight())
                    }
                },
                endDrag: function(k) {
                    this.proxy.hide();
                    this.panel.setPosition(this.x, this.y)
                },
                afterRepair: function() {
                    this.dragging = false
                }
            },
            toolTemplate: new Ext.Template('<div class="x-tool"><div class="{id}"></div></div>')
        });
        var j = [{
            id: "minimize",
            hidden: true,
            handler: function(n, m, l, k) {
                l.collapsed ? l.expand(true) : l.collapse(true)
            }
        }, {
            id: "close",
            handler: function(n, m, l, k) {
                l.destroy();
                delete QNAP.QOS.user.deshboardItems[i.getXType()];
                os.saveConfig("deshboardItems", Ext.encode(QNAP.QOS.user.deshboardItems))
            }
        }];
        if (Ext.isEmpty(i.tools)) {
            i.tools = Ext.ComponentMgr.types[i.xtype].prototype.tools || []
        } else {
            if (Ext.isObject(i.tools)) {
                i.tools = [i.tools]
            }
        }
        i.tools = i.tools.concat(j);
        i.on("afterrender", d);
        i.on("enable", f, this, {
            single: true,
            delay: 100
        })
    };

    function f(i) {
        i.getTool("minimize").show();
        i.expand(true)
    }

    function d(j) {
        _D("--WidgetPanel onAfterrender");
        os.qWinMgr.register(j);
        j.setZIndex = Ext.createDelegate(a, j);
        j.setActive = Ext.createDelegate(h, j);
        j.toFront = Ext.createDelegate(b, j);
        j.mon(j.el, "mousedown", j.toFront, j);
        j.on("beforedestroy", function() {
            j.mun(j.el, "mousedown", j.toFront, j);
            os.qWinMgr.unregister(j)
        });
        var i = QNAP.QOS.user.deshboardItems || {};
        if (!Ext.isObject(i)) {
            i = {}
        }
        i[j.getXType()] = true;
        QNAP.QOS.user.deshboardItems = i;
        if (j.el.hasClass("dd-widget")) {
            if (j.resizable) {
                j.resizer = new Ext.Resizable(j.el, {
                    handles: j.resizeHandles || "all",
                    handleCls: "transparent-handle",
                    resizeElement: j.resizerAction
                });
                j.resizer.panel = j;
                j.mon(j.resizer, "beforeresize", j.beforeResize, j);
                j.mon(j.resizer, "resize", j.resize, j)
            }
        }
        os.saveConfig("deshboardItems", Ext.encode(i));
        g.apply(j);
        os.qWinMgr.bringToFront(j);
        j.mon(os.getViewport(), "afterlayout", g, j)
    }

    function g() {
        var i = os.getViewport().getWidth();
        var j = os.getViewport().getHeight();
        var l = this;
        var k = l.getBox(true);
        if (k.x + k.width > i) {
            k.x = i - k.width
        }
        if (k.y + l.height > j) {
            k.y = j - l.height - 50
        }
        if (k.x <= 0) {
            k.x = 0
        }
        if (k.y <= 50) {
            k.y = 50
        }
        l.setPagePosition(k.x, k.y)
    }

    function b(i) {
        if (os.qWinMgr.bringToFront(this)) {
            if (!i || !i.getTarget().focus) {
                this.focus()
            }
        }
        return this
    }

    function h(i) {
        if (i) {
            if (!this.maximized) {
                this.el.enableShadow(true)
            }
            this.fireEvent("activate", this)
        } else {
            this.fireEvent("deactivate", this)
        }
    }

    function a(i) {
        if (this.modal) {
            this.mask.setStyle("z-index", i)
        }
        this.el.setZIndex(++i);
        i += 5;
        if (this.resizer) {
            this.resizer.proxy.setStyle("z-index", ++i)
        }
        this.lastZIndex = i
    }
};
QNAP.CMP.Plugin.DragDashBoardPanel = function(c, d) {
    var b = this;
    var a = {
        insertProxy: false,
        startDrag: function(h, i) {
            if (Ext.getCmp("widget-" + this.panel.getXType())) {
                Ext.getCmp("widget-" + this.panel.getXType()).destroy()
            }
            var g = this.panel;
            var f = g.getBox();
            this.maxX = os.getViewport().getWidth() - g.width;
            this.maxY = os.getViewport().getHeight() - g.height;
            this.minX = 0;
            this.minY = 50;
            this.constrainX = true;
            this.constrainY = true;
            return true
        },
        onDrag: function(g) {
            var f = this.proxy.getEl();
            this.x = f.getLeft(true);
            this.y = f.getTop(true)
        },
        endDrag: function(g) {
            this.proxy.hide();
            var f = Ext.create(b.cmpCfg);
            os.getViewport().add(f);
            f.doLayout();
            f.setPosition(this.x, this.y);
            f.show();
            os.getViewport().doLayout();
            f.saveState();
            return true
        },
        afterRepair: function() {
            this.dragging = false
        }
    };
    this.init = function(e) {
        this.cmpCfg = e.initialConfig;
        Ext.apply(this.cmpCfg, {
            overCls: "dd-widget-border",
            bwrapCfg: {
                cls: d.bwrapCfg
            }
        });
        Ext.apply(this.cmpCfg, c);
        if (Ext.isEmpty(this.cmpCfg.cls)) {
            this.cmpCfg.cls = []
        } else {
            if (Ext.isString(this.cmpCfg.cls)) {
                this.cmpCfg.cls = [this.cmpCfg.cls]
            }
        }
        this.cmpCfg.cls = this.cmpCfg.cls.concat(["dd-widget", "none-bg", d.bwrapCfg]).join(" ");
        this.cmpCfg.draggable = false;
        this.cmpCfg.disabled = true;
        this.cmpCfg.shadow = false;
        this.cmpCfg.floating = true;
        this.cmpCfg.stateful = true;
        this.cmpCfg.stateId = "widget-" + e.getXType();
        this.cmpCfg.stateEvents = ["move", "afterlayout"];
        this.cmpCfg.id = "widget-" + e.getXType();
        this.cmpCfg.plugins = new QNAP.CMP.Plugin.WidgetPanel();
        e.draggable = a
    }
};
QNAP.CMP.Plugin.QTSViewPasswdIcon = function(c) {
    function e() {
        if (a.hasClass("show-text")) {
            a.removeClass("show-text");
            d.set({
                type: "password"
            })
        } else {
            a.addClass("show-text");
            d.set({
                type: "text"
            })
        }
    }
    var b = c.container;
    var d = c.el;
    var a = d.insertHtml("afterEnd", '<div class="unmask-eye" ext:qtip="QTS_SHOW_PASSWORD" ></div>', true);
    b.addClass("qPasswordInput");
    a.addClassOnOver("over");
    a.on("click", e)
};
Ext.DataView.DragSelector = function(f) {
    f = f || {};
    var i, h, k;
    var d, j, l = new Ext.lib.Region(0, 0, 0, 0);
    var b = f.dragSafe === true;
    this.init = function(p) {
        i = p;
        i.on("render", o)
    };

    function m() {
        d = [];
        i.all.each(function(p) {
            d[d.length] = p.getRegion()
        });
        j = i.el.getRegion()
    }

    function e() {
        return false
    }

    function g(p) {
        return (!b || p.target == i.el.dom) && !i.dragging
    }

    function n(q) {
        if (i.dragging) {
            var p = Ext.getDoc();
            p.un("mousemove", this.onMouseMove, this);
            p.un("mouseup", this.onMouseUp, this);
            p.un("selectstart", this.stopSelect, this);
            return
        }
        i.on("click", e, i, {
            single: true
        });
        i.on("containerclick", e, i, {
            single: true
        });
        if (!h) {
            h = i.el.createChild({
                cls: "x-view-selector"
            })
        } else {
            if (h.dom.parentNode !== i.el.dom) {
                i.el.dom.appendChild(h.dom)
            }
            h.setDisplayed("block")
        }
        m();
        i.clearSelections()
    }

    function c(z) {
        if (i.dragging) {
            return
        }
        var A = k.startXY;
        var E = k.getXY();
        var C = Math.min(A[0], E[0]);
        var B = Math.min(A[1], E[1]);
        var D = Math.abs(A[0] - E[0]);
        var t = Math.abs(A[1] - E[1]);
        l.left = C;
        l.top = B;
        l.right = C + D;
        l.bottom = B + t;
        l.constrainTo(j);
        h.setRegion(l);
        for (var s = 0, u = d.length; s < u; s++) {
            var p = d[s],
                q = l.intersect(p);
            if (q && !p.selected) {
                p.selected = true;
                i.select(s, true)
            } else {
                if (!q && p.selected) {
                    p.selected = false;
                    i.deselect(s)
                }
            }
        }
    }

    function a(p) {
        if (!Ext.isIE) {}
        if (h) {
            h.setDisplayed(false)
        }
        p.dragSelecting = true
    }

    function o(p) {
        k = new Ext.dd.DragTracker({
            onBeforeStart: g,
            onStart: n,
            onDrag: c,
            onEnd: a,
            listeners: {
                dragend: function() {
                    p.un("click", e, p, {
                        single: true
                    });
                    p.un("containerclick", e, p, {
                        single: true
                    })
                },
                delay: 1
            }
        });
        k.initEl(p.el)
    }
};
Ext.ux.DataViewTransition = Ext.extend(Object, {
    defaults: {
        duration: 750,
        idProperty: "id"
    },
    constructor: function(a) {
        Ext.apply(this, a || {}, this.defaults)
    },
    init: function(a) {
        this.dataview = a;
        var c = this.idProperty;
        a.blockRefresh = true;
        a.updateIndexes = a.updateIndexes.createSequence(function() {
            this.getTemplateTarget().select(this.itemSelector).each(function(e, f, d) {
                e.id = e.dom.id = String.format("{0}-{1}", a.id, b.getAt(d).get(c))
            }, this)
        }, a);
        this.dataviewID = a.id;
        this.cachedStoreData = {};
        var b = a.store;
        this.cacheStoreData(b);
        b.on("load", this.cacheStoreData, this);
        b.on("datachanged", function(m) {
            var k = a.getTemplateTarget(),
                g = m.getAt(0),
                p = this.getAdded(m),
                y = this.getRemoved(m),
                h = this.getRemaining(m),
                u = Ext.apply({}, h, p);
            if (g == undefined) {
                this.cacheStoreData(m);
                return
            }
            var f = k.child("#" + this.dataviewID + "-" + g.get(this.idProperty));
            var A = m.getCount(),
                j = f.getMargins("lr") + f.getWidth(),
                w = f.getMargins("bt") + f.getHeight(),
                r = k.getWidth();
            var n = a.shortcutCfg,
                e = n.maxCell,
                q = n.maxRow;
            k.applyStyles({
                display: "block",
                position: "relative"
            });
            var i = {},
                B = {},
                s = {};
            Ext.iterate(h, function(E, D) {
                var E = D.get(this.idProperty),
                    C = s[E] = k.child("#" + this.dataviewID + "-" + E);
                i[E] = {
                    top: C.getTop() - k.getTop() - C.getMargins("t") - k.getPadding("t"),
                    left: C.getLeft() - k.getLeft() - C.getMargins("l") - k.getPadding("l")
                }
            }, this);
            Ext.iterate(h, function(F, E) {
                var C = i[F],
                    D = s[F];
                if (D.getStyle("position") != "absolute") {
                    s[F].applyStyles({
                        position: "absolute",
                        left: C.left + "px",
                        top: C.top + "px",
                        width: D.getWidth(!Ext.isIE || Ext.isStrict),
                        height: D.getHeight(!Ext.isIE || Ext.isStrict)
                    })
                }
            });
            var o = 0;
            Ext.iterate(m.data.items, function(F) {
                var J = F.get(c),
                    E = s[J];
                var I = o % q,
                    D = Math.ceil(o / q),
                    H = I * w,
                    G = D * j;
                var C = Math.ceil(o / q);
                var I = o % q;
                var H = ((I * n.itemHeight) + n.topPadding);
                var G = (C * (n.leftPadding + n.itemWidth) - n.itemHeight);
                B[J] = {
                    top: H,
                    left: G
                };
                o++
            }, this);
            var t = new Date(),
                d = this.duration,
                l = this.dataviewID;
            var z = function() {
                var L = new Date() - t,
                    N = L / d;
                if (N >= 1) {
                    _D("doAnimate....");
                    for (var C in B) {
                        Ext.fly(l + "-" + C).applyStyles({
                            top: B[C].top + "px",
                            left: B[C].left + "px"
                        })
                    }
                    Ext.TaskMgr.stop(x)
                } else {
                    _D("doAnimate....!!");
                    for (var C in B) {
                        if (!h[C]) {
                            continue
                        }
                        var F = i[C],
                            I = B[C],
                            G = F.top,
                            J = I.top,
                            E = F.left,
                            K = I.left,
                            H = N * Math.abs(G - J),
                            M = N * Math.abs(E - K),
                            O = G > J ? G - H : G + H,
                            D = E > K ? E - M : E + M;
                        Ext.fly(l + "-" + C).applyStyles({
                            top: O + "px",
                            left: D + "px"
                        })
                    }
                }
            };
            var x = {
                run: z,
                interval: 20,
                scope: this
            };
            Ext.TaskMgr.start(x);
            this.cacheStoreData(m)
        }, this)
    },
    cacheStoreData: function(a) {
        this.cachedStoreData = {};
        a.each(function(b) {
            this.cachedStoreData[b.get(this.idProperty)] = b
        }, this)
    },
    getExisting: function() {
        return this.cachedStoreData
    },
    getExistingCount: function() {
        var c = 0,
            b = this.getExisting();
        for (var a in b) {
            c++
        }
        return c
    },
    getAdded: function(a) {
        var b = {};
        a.each(function(c) {
            if (this.cachedStoreData[c.get(this.idProperty)] == undefined) {
                b[c.get(this.idProperty)] = c
            }
        }, this);
        return b
    },
    getRemoved: function(a) {
        var b = [];
        for (var c in this.cachedStoreData) {
            if (a.findExact(this.idProperty, Number(c)) == -1) {
                b.push(this.cachedStoreData[c])
            }
        }
        return b
    },
    getRemaining: function(a) {
        var b = {};
        a.each(function(c) {
            if (this.cachedStoreData[c.get(this.idProperty)] != undefined) {
                b[c.get(this.idProperty)] = c
            }
        }, this);
        return b
    }
});
QNAP.CMP.QSearchTextField = Ext.extend(Ext.form.TextField, {
    enableKeyEvents: true,
    onRender: function(b, a) {
        QNAP.CMP.QSearchTextField.superclass.onRender.call(this, b, a);
        var c = new Ext.KeyMap(this.el, [{
            key: Ext.EventObject.ENTER,
            scope: this,
            fn: this.onTriggerSearch
        }, {
            key: Ext.EventObject.ESC,
            scope: this,
            fn: this.onTriggerClear
        }]);
        c.stopEvent = true;
        this.on("keyup", function(d, g) {
            this.triggerSearch()
        })
    },
    store: new Ext.data.JsonStore({
        autoDestroy: true,
        root: "results",
        fields: ["defaultTitle", "qInternationalKey", "icon", "fn", "appId", "type", "config", "cate"]
    }),
    triggerSearch: function() {
        var f = this,
            j = f.store;
        var g = [];
        var e = f.getValue().trim();
        if (e != "") {
            var i = {};
            var k = QNAP.QOS.config.appKeyIndex;
            var l = QNAP.QOS.config.appIdIndex;
            var d = new RegExp(RegExp.escape(e) + ".*", "gi");
            var b = String.format("(^{0}$|^{0}\\s|\\s{0}$|\\s{0}\\s)", e);
            Ext.each(k, function(p, o) {
                if (d.test(p)) {
                    Ext.each(l[o], function(q) {
                        i[q] = true
                    })
                }
            });
            for (var n in i) {
                var c = QNAP.QOS.fnSearch.tags.fns[n];
                var h = QNAP.QOS.lib.getAppInfo(c.appId);
                if (h) {
                    if ((!QNAP.QOS.user.isAdminGroup) && h.isAdminOnly) {} else {
                        var m = {
                            appId: c.appId,
                            icon: h.icon,
                            config: c.config,
                            type: h.type,
                            isAdminOnly: h.isAdminOnly,
                            displayIndex: c.displayIndex || 0
                        };
                        m.cate = "app";
                        Ext.copyTo(m, c, ["qInternationalKey", "defaultTitle"]);
                        g.push(m)
                    }
                }
                var a = QNAP.QOS.lib.getHelpInfo(n);
                var h = QNAP.QOS.lib.getAppInfo("helper");
                if (a) {
                    var m = {
                        appId: "helper",
                        config: {
                            fn: n,
                            items: a.items
                        },
                        type: h.type,
                        icon: h.icon,
                        qInternationalKey: a.qInternationalKey,
                        defaultTitle: a.defaultTitle,
                        displayIndex: c.displayIndex || 0
                    };
                    m.cate = "help";
                    g.push(m)
                }
            }
        }
        g.sort(function(p, o) {
            if (p.displayIndex < o.displayIndex) {
                return -1
            }
            if (p.displayIndex > o.displayIndex) {
                return 1
            }
            return 0
        });
        this.store.loadData({
            results: g
        });
        this.store.sort("cate", "ASC")
    }
});
QNAP.CMP.QSearch = Ext.extend(Ext.form.TwinTriggerField, {
    width: 200,
    enableKeyEvents: true,
    selectOnFocus: undefined === this.selectOnFocus ? true : this.selectOnFocus,
    trigger1Class: "x-form-clear-trigger",
    trigger2Class: "x-form-search-trigger",
    onTrigger1Click: function() {
        this.onTriggerClear()
    },
    onTrigger2Click: function() {
        this.onTriggerSearch()
    },
    store: new Ext.data.JsonStore({
        autoDestroy: true,
        root: "results",
        fields: ["defaultTitle", "qInternationalKey", "icon", "fn", "appId", "type", "config"]
    }),
    minLength: this.minLength,
    onRender: function(b, a) {
        QNAP.CMP.QSearch.superclass.onRender.call(this, b, a);
        var c = new Ext.KeyMap(this.el, [{
            key: Ext.EventObject.ENTER,
            scope: this,
            fn: this.onTriggerSearch
        }, {
            key: Ext.EventObject.ESC,
            scope: this,
            fn: this.onTriggerClear
        }]);
        c.stopEvent = true;
        this.on("keyup", function(d, g) {
            this.onTriggerSearch()
        })
    },
    onTriggerClear: function() {
        this.setValue("");
        this.focus();
        this.onTriggerSearch()
    },
    onTriggerSearch: function() {
        var qSearch = this,
            store = qSearch.store;
        var results = [];
        var inputValue = qSearch.getValue();
        if (inputValue != "") {
            function isFind(fn, key) {
                if (key == "") {
                    return false
                }
                key = key.toLowerCase();
                key = key.replace("$", "\\$");
                key = key.replace("^", "\\^");
                key = key.replace("(", "\\(");
                key = key.replace(")", "\\)");
                key = key.replace("+", "\\+");
                key = key.replace("}", "\\}");
                key = key.replace("{", "\\{");
                key = key.replace("]", "\\]");
                key = key.replace("[", "\\[");
                var i = 0,
                    s = "",
                    tags = eval("QNAP.QOS.Desktop.SearchTag." + fn + ".tags"),
                    re = new RegExp("^" + RegExp.escape(key) + ".*", "gi");
                for (i = 0; i < tags.length; i++) {
                    s = tags[i].toLowerCase();
                    if (re.test(s) || testWord(re, s)) {
                        return true
                    }
                }
                return false
            }

            function testWord(re, s) {
                var i = 0,
                    tmpArray = s.split(" "),
                    len = tmpArray.length;
                for (i = 0; i < len; i++) {
                    if (re.test(tmpArray[i])) {
                        return true
                    }
                }
                return false
            }

            function chkSysItem(value) {
                for (var app in QNAP.QOS.systemItems) {
                    if (app == value) {
                        return true
                    }
                }
                return false
            }
            var resultApps = {};
            var appKeyIndex = QNAP.QOS.config.appKeyIndex;
            var appIdIndex = QNAP.QOS.config.appIdIndex;
            var reg = new RegExp("^" + RegExp.escape(inputValue) + ".*", "gi");
            Ext.each(appKeyIndex, function(key, index) {
                var keys = key.toLowerCase().split(" ");
                Ext.each(keys, function(subKey) {
                    if (reg.test(subKey)) {
                        Ext.each(appIdIndex[index], function(id) {
                            resultApps[id] = true
                        });
                        return false
                    }
                })
            });
            for (var appId in resultApps) {
                var appInfo = QNAP.QOS.lib.getAppInfo(appId);
                appInfo.config = {
                    fn: appInfo.fn
                };
                results.push(appInfo)
            }
        }
        this.store.loadData({
            results: results
        })
    }
});
Ext.override(Ext.PagingToolbar, {
    onLoad: function(a, c, h) {
        if (!this.rendered) {
            this.dsLoaded = [a, c, h];
            return
        }
        var e = this.getParams();
        this.cursor = (h.params && h.params[e.start]) ? h.params[e.start] : 0;
        var g = this.getPageData(),
            b = g.activePage,
            f = g.pages;
        if (b > f) {
            this.doLoad((f - 1) * this.pageSize);
            return
        }
        this.afterTextItem.setText(String.format(this.afterPageText, g.pages));
        this.inputItem.setValue(b);
        this.first.setDisabled(b == 1);
        this.prev.setDisabled(b == 1);
        this.next.setDisabled(b == f);
        this.last.setDisabled(b == f);
        this.refresh.enable();
        this.updateInfo();
        this.fireEvent("change", this, g)
    },
    initComponent: function() {
        var c = Ext.Toolbar;
        var b = new Ext.form.DisplayField({
            qInternational: true,
            qInternationalValue: this.beforePageText,
            qInternationalFn: function(g) {
                var f = _S[this.qInternationalValue] || this.qInternationalValue;
                g.setValue(f);
                g.originalValue = g.getValue()
            }
        });
        var a = _S[this.beforePageText] || this.beforePageText;
        Ext.apply(b, {
            value: a
        });
        var e = [this.first = new c.Button({
            tooltip: this.firstText,
            overflowText: _S[this.firstText] || this.firstText,
            iconCls: "x-tbar-page-first",
            disabled: true,
            handler: this.moveFirst,
            scope: this
        }), this.prev = new c.Button({
            tooltip: this.prevText,
            overflowText: _S[this.prevText] || this.prevText,
            iconCls: "x-tbar-page-prev",
            disabled: true,
            handler: this.movePrevious,
            scope: this
        }), "-", b, this.inputItem = new Ext.form.NumberField({
            cls: "x-tbar-page-number",
            allowDecimals: false,
            allowNegative: false,
            enableKeyEvents: true,
            selectOnFocus: true,
            submitValue: false,
            isDirty: function() {
                return false
            },
            listeners: {
                scope: this,
                keydown: this.onPagingKeyDown,
                blur: this.onPagingBlur
            }
        }), this.afterTextItem = new c.TextItem({
            text: String.format(this.afterPageText, 1)
        }), "-", this.next = new c.Button({
            tooltip: this.nextText,
            overflowText: _S[this.nextText] || this.nextText,
            iconCls: "x-tbar-page-next",
            disabled: true,
            handler: this.moveNext,
            scope: this
        }), this.last = new c.Button({
            tooltip: this.lastText,
            overflowText: _S[this.lastText] || this.lastText,
            iconCls: "x-tbar-page-last",
            disabled: true,
            handler: this.moveLast,
            scope: this
        }), "-", this.refresh = new c.Button({
            tooltip: this.refreshText,
            overflowText: _S[this.refreshText] || this.refreshText,
            iconCls: "x-tbar-loading",
            handler: this.doRefresh,
            scope: this
        })];
        var d = this.items || this.buttons || [];
        if (this.prependButtons) {
            this.items = d.concat(e)
        } else {
            this.items = e.concat(d)
        }
        delete this.buttons;
        if (this.displayInfo) {
            this.items.push("->");
            this.items.push(this.displayItem = new c.TextItem({}))
        }
        Ext.PagingToolbar.superclass.initComponent.call(this);
        this.addEvents("change", "beforechange");
        this.on("afterlayout", this.onFirstLayout, this, {
            single: true
        });
        this.cursor = 0;
        this.bindStore(this.store, true)
    },
    updateInfo: function() {
        if (this.displayItem) {
            this.cursor = this.cursor - 0;
            var c = this.store.getCount();
            if (c == 0) {
                msg = _S[this.emptyMsg] || this.emptyMsg
            } else {
                var a = "";
                if (Ext.isArray(this.displayMsg)) {
                    for (var b = 0; b < this.displayMsg.length; b++) {
                        a += _S[this.displayMsg[b]] || this.displayMsg[b]
                    }
                } else {
                    a = this.displayMsg
                }
                msg = String.format(a, this.cursor + 1, this.cursor + c, this.store.getTotalCount())
            }
            this.displayItem.setText(msg);
            this.displayItem.qInternational = true;
            this.displayItem.count = c;
            this.displayItem.emptyMsg = this.emptyMsg;
            this.displayItem.displayMsg = this.displayMsg;
            this.displayItem.value1 = this.cursor + 1;
            this.displayItem.value2 = this.cursor + c;
            this.displayItem.value3 = this.store.getTotalCount();
            this.displayItem.qInternationalFn = function(f) {
                if (this.count == 0) {
                    msg = _S[this.emptyMsg] || this.emptyMsg
                } else {
                    var d = "";
                    if (Ext.isArray(this.displayMsg)) {
                        for (var e = 0; e < this.displayMsg.length; e++) {
                            d += _S[this.displayMsg[e]] || this.displayMsg[e]
                        }
                    } else {
                        d = this.displayMsg
                    }
                    msg = String.format(d, this.value1, this.value2, this.value3)
                }
                f.setText(msg)
            }
        }
    },
    readPage: function(e) {
        var b = this.inputItem.getValue(),
            c;
        var a = this.getPageData().pages;
        if (b <= 0) {
            return 1
        }
        if (b > a) {
            return a
        }
        if (!b || isNaN(c = parseInt(b, 10))) {
            this.inputItem.setValue(e.activePage);
            return false
        }
        return c
    },
    afterPageText: "/{0}",
    emptyMsg: "PAGING_TEXT_03",
    displayMsg: ["PAGING_TEXT_04", "QUICK09_STR01", " {0}-{1}, ", "PAGING_TEXT_05", "QUICK09_STR01", " {2}"],
    beforePageText: "PAGING_TEXT_06",
    refreshText: "PAGING_TEXT_07",
    lastText: "PAGING_TEXT_08",
    nextText: "PAGING_TEXT_09",
    prevText: "PAGING_TEXT_10",
    firstText: "PAGING_TEXT_11"
});
Ext.override(Ext.QuickTip, {
    adjustBodyWidth: function(a) {
        return a + 1
    },
    getTipCfg: function(f) {
        var b = f.getTarget(),
            d, a, g = false;
        if (this.interceptTitles && b.title && Ext.isString(b.title)) {
            d = b.title;
            b.qtip = d;
            b.removeAttribute("title");
            f.preventDefault()
        } else {
            a = this.tagConfig;
            var c = Ext.fly(b);
            d = b.qtip || c.getAttribute(a.attribute, a.namespace);
            g = c.getAttribute("data-htmltip") === "true";
            if (c.dom.qclass === "x-form-invalid-tip") {
                g = true
            }
        }
        try {
            d = _S ? _S[d] || d : d
        } catch (f) {}
        if (!g) {
            d = d.replace(/&/g, "&amp;");
            d = d.replace(/</g, "&lt;");
            d = d.replace(/>/g, "&gt;");
            d = d.replace(/"/g, "&quot;");
            d = d.replace(/'/g, "&apos;")
        }
        return d
    },
    onTargetOver: function(h) {
        if (this.disabled) {
            return
        }
        this.targetXY = h.getXY();
        var c = h.getTarget();
        if (!c || c.nodeType !== 1 || c == document || c == document.body) {
            return
        }
        if (this.activeTarget && ((c == this.activeTarget.el) || Ext.fly(this.activeTarget.el).contains(c))) {
            this.clearTimer("hide");
            this.show();
            return
        }
        if (c && this.targets[c.id]) {
            this.activeTarget = this.targets[c.id];
            this.activeTarget.el = c;
            this.anchor = this.activeTarget.anchor;
            if (this.anchor) {
                this.anchorTarget = c
            }
            this.delayShow();
            return
        }
        var f, g = Ext.fly(c),
            b = this.tagConfig,
            d = b.namespace;
        if (f = this.getTipCfg(h)) {
            var a = g.getAttribute(b.hide, d);
            this.activeTarget = {
                el: c,
                text: f,
                width: g.getAttribute(b.width, d),
                autoHide: false,
                title: g.getAttribute(b.title, d),
                cls: g.getAttribute(b.cls, d),
                align: g.getAttribute(b.align, d)
            };
            this.anchor = g.getAttribute(b.anchor, d);
            if (this.anchor) {
                this.anchorTarget = c
            }
            this.delayShow()
        }
    },
    onTargetOut: function(a) {
        if (this.activeTarget && a.within(this.activeTarget.el) && !this.getTipCfg(a)) {
            return
        }
        this.clearTimer("show");
        this.delayHide()
    }
});
Ext.override(Ext.layout.CardLayout, {
    setActiveItem: function(b) {
        b = this.container.getComponent(b);
        if (this.activeItem != b) {
            if (b.rendered && this.animate) {
                Ext.Fx.syncFx();
                var c = b.getEl();
                c.setStyle({
                    position: "absolute",
                    top: this.container.getLayoutTarget().getPadding("t") + "px"
                });
                if (this.activeItem) {
                    this.activeItem.getEl().fadeOut({
                        useDisplay: true,
                        callback: Ext.Component.prototype.hide,
                        scope: this.activeItem
                    })
                }
                this.activeItem = b;
                b.show();
                this.container.doLayout();
                c.fadeIn({
                    callback: function() {
                        c.setStyle({
                            position: ""
                        })
                    }
                });
                Ext.Fx.sequenceFx()
            } else {
                if (this.activeItem) {
                    this.activeItem.hide();
                    if (this.activeItem.hidden !== true) {
                        return false
                    }
                    this.activeItem.fireEvent("deactivate", this.activeItem)
                }
                var a = b.doLayout && (this.layoutOnCardChange || !b.rendered);
                this.activeItem = b;
                delete b.deferLayout;
                b.show();
                this.layout();
                if (a) {
                    b.doLayout()
                }
                b.fireEvent("activate", b)
            }
        }
    }
});
Ext.override(Ext.tree.TreeNode, {
    render: function(a) {
        this.ui.render(a);
        if (!this.rendered) {
            this.addEvents("afterrender");
            this.getOwnerTree().registerNode(this);
            this.rendered = true;
            if (this.expanded) {
                this.expanded = false;
                this.expand(false, false)
            }
            this.fireEvent("afterrender", this)
        }
    },
    qFindChildBy: function(g, j, h) {
        var d = this.childNodes,
            e = d.length,
            c = 0,
            a, f, b;
        for (; c < e; c++) {
            a = d[c];
            if (g.call(j || a, a) === true) {
                return a
            } else {
                if (h) {
                    b = a.isExpandable() && a.isExpanded();
                    a.expand();
                    f = a.qFindChildBy(g, j, h);
                    if (f != null) {
                        return f
                    }
                    if (!b) {
                        a.collapse()
                    }
                }
            }
        }
        return null
    },
    qfindChild: function(b, c, a) {
        return this.qFindChildBy(function() {
            return this.attributes[b] == c
        }, null, a)
    }
});
Ext.override(Ext.tree.TreeNodeUI, {
    onSelectedChange: function(c) {
        var a = Ext.fly(this.getEl());
        var b = a.getOffsetsTo(Ext.getBody());
        var d = Ext.getBody().getHeight();
        if (c) {
            if (b[1] < d) {
                this.focus()
            }
            this.addClass("x-tree-selected")
        } else {
            this.removeClass("x-tree-selected")
        }
    },
    renderElements: function(e, k, j, l) {
        this.indentMarkup = e.parentNode ? e.parentNode.ui.getChildIndent() : "";
        var f = Ext.isBoolean(k.checked),
            b, c = this.getHref(k.href),
            g = e.id;
        var d;
        g = g.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
        d = ['<li class="x-tree-node"><div ext:tree-node-id="', g, '" class="x-tree-node-el x-tree-node-leaf x-unselectable ', k.cls, '" unselectable="on">', '<span class="x-tree-node-indent">', this.indentMarkup, "</span>", '<img alt="" src="', this.emptyIcon, '" class="x-tree-ec-icon x-tree-elbow" />', f ? ('<input class="x-tree-node-cb" type="checkbox" ' + (k.checked ? 'checked="checked" />' : "/>")) + '<span class="checkbox-img" > </span>' : "", '<img alt="" src="', k.icon || this.emptyIcon, '" class="x-tree-node-icon', (k.icon ? " x-tree-node-inline-icon" : ""), (k.iconCls ? " " + k.iconCls : ""), '" unselectable="on" />', '<a hidefocus="on" class="x-tree-node-anchor" href="', c, '" tabIndex="1" ', k.hrefTarget ? ' target="' + k.hrefTarget + '"' : "", '><span unselectable="on">', e.text, "</span></a></div>", '<ul class="x-tree-node-ct" style="display:none;"></ul>', "</li>"].join("");
        if (l !== true && e.nextSibling && (b = e.nextSibling.ui.getEl())) {
            this.wrap = Ext.DomHelper.insertHtml("beforeBegin", b, d)
        } else {
            this.wrap = Ext.DomHelper.insertHtml("beforeEnd", j, d)
        }
        this.elNode = this.wrap.childNodes[0];
        this.ctNode = this.wrap.childNodes[1];
        var i = this.elNode.childNodes;
        this.indentNode = i[0];
        this.ecNode = i[1];
        this.iconNode = i[2];
        var h = 3;
        if (f) {
            this.checkbox = i[2];
            this.checkbox.defaultChecked = this.checkbox.checked;
            this.checkImg = i[3];
            Ext.fly(this.checkImg).on("mousedown", this.onCkImgClick, this);
            h = h + 2
        }
        this.anchor = i[h];
        this.textNode = i[h].firstChild
    },
    onCkImgClick: function() {
        if (this.disabled) {
            return
        }
        this.toggleCheck()
    }
});
Ext.override(Ext.tree.TreePanel, {
    initComponent: function() {
        Ext.tree.TreePanel.superclass.initComponent.call(this);
        if (!this.eventModel) {
            this.eventModel = new Ext.tree.TreeEventModel(this)
        }
        var a = this.loader;
        if (!a) {
            a = new Ext.tree.TreeLoader({
                dataUrl: this.dataUrl,
                requestMethod: this.requestMethod
            })
        } else {
            if (Ext.isObject(a) && !a.load) {
                a = new Ext.tree.TreeLoader(a)
            }
        }
        this.loader = a;
        this.nodeHash = {};
        if (this.root) {
            var b = this.root;
            delete this.root;
            this.setRootNode(b)
        }
        this.addEvents("append", "remove", "movenode", "insert", "beforeappend", "beforeremove", "beforemovenode", "beforeinsert", "beforeload", "load", "textchange", "beforeexpandnode", "beforecollapsenode", "expandnode", "disabledchange", "collapsenode", "beforeclick", "click", "containerclick", "checkchange", "beforedblclick", "dblclick", "containerdblclick", "contextmenu", "containercontextmenu", "beforechildrenrendered", "startdrag", "enddrag", "dragdrop", "beforenodedrop", "nodedrop", "nodedragover", "afterrendernode");
        if (this.singleExpand) {
            this.on("beforeexpandnode", this.restrictExpand, this)
        }
    },
    proxyNodeEvent: function(c, b, a, g, f, e, d) {
        if (c == "afterrender" || c == "collapse" || c == "expand" || c == "beforecollapse" || c == "beforeexpand" || c == "move" || c == "beforemove") {
            c = c + "node"
        }
        return this.fireEvent(c, b, a, g, f, e, d)
    }
});
Ext.override(Ext.tree.TreeEventModel, {
    onIconOut: function(b, a) {
        try {
            a.ui.removeClass("x-tree-ec-over")
        } catch (b) {}
    }
});
Ext.override(Ext.form.RadioGroup, {
    removeItem: function(e) {
        var d = this;
        if (d.rendered) {
            var c;
            d.panel.findBy(function(f) {
                if (c = f.getComponent(e)) {
                    f.remove(c)
                }
            });
            d.panel.doLayout()
        } else {
            var a = d.items;
            for (var b = a.length - 1; b >= 0; b--) {
                if (a[b].itemId == e) {
                    a.remove(a[b])
                }
            }
        }
    }
});
Ext.override(Ext.Panel, {
    titleTip: false,
    showBbar: function() {
        this.bbar.setVisibilityMode(Ext.Element.DISPLAY);
        this.getBottomToolbar().show();
        this.syncSize();
        if (this.ownerCt) {
            this.ownerCt.doLayout()
        }
    },
    hideBbar: function() {
        this.bbar.setVisibilityMode(Ext.Element.DISPLAY);
        this.getBottomToolbar().hide();
        this.syncSize();
        if (this.ownerCt) {
            this.ownerCt.doLayout()
        }
    },
    setTitle: function(b, a) {
        this.title = b;
        if (this.header && this.headerAsText) {
            this.header.child("span").update(b);
            if (this.titleTip) {
                Ext.QuickTips.register({
                    target: this.header,
                    text: b
                })
            }
        }
        if (a) {
            this.setIconClass(a)
        }
        this.fireEvent("titlechange", this, b);
        return this
    }
});
Ext.override(Ext.grid.ColumnModel, {
    isValue2Tip: function(a) {
        return this.config[a].value2Tip ? true : false
    },
    htmlTip: function(a) {
        return this.config[a].htmlTip === true
    }
});
Ext.override(Ext.grid.GridView, {
    holdPosition: true,
    onLoad: function() {
        if (this.holdPosition === true) {
            return
        }
        if (Ext.isGecko) {
            if (!this.scrollToTopTask) {
                this.scrollToTopTask = new Ext.util.DelayedTask(this.scrollToTop, this)
            }
            this.scrollToTopTask.delay(1)
        } else {
            this.scrollToTop()
        }
    },
    getColumnData: function() {
        var e = [],
            c = this.cm,
            f = c.getColumnCount(),
            a = this.ds.fields,
            d, b;
        for (d = 0; d < f; d++) {
            b = c.getDataIndex(d);
            e[d] = {
                name: Ext.isDefined(b) ? b : (a.get(d) ? a.get(d).name : undefined),
                renderer: c.getRenderer(d),
                scope: c.getRendererScope(d),
                id: c.getColumnId(d),
                style: this.getColumnStyle(d),
                value2Tip: c.isValue2Tip(d),
                htmlTip: c.htmlTip(d)
            }
        }
        return e
    },
    doRender: function(d, w, l, a, r, t) {
        var g = this.templates,
            c = g.cell,
            z = g.row,
            n = r - 1,
            b = "width:" + this.getTotalWidth() + ";",
            h = [],
            k = [],
            m = {
                tstyle: b
            },
            q = {},
            x = w.length,
            y, f, e, u, s, o;
        this.rowBuffer = [];
        for (s = 0; s < x; s++) {
            e = w[s];
            k = [];
            o = s + a;
            for (u = 0; u < r; u++) {
                f = d[u];
                q.id = f.id;
                q.css = u === 0 ? "x-grid3-cell-first " : (u == n ? "x-grid3-cell-last " : "");
                q.attr = q.cellAttr = "";
                q.style = f.style;
                q.value = f.renderer.call(f.scope, e.data[f.name], q, e, o, u, l);
                if (f.value2Tip && Ext.isString(q.value)) {
                    var p = q.value;
                    p = p.replace(/&/g, "&amp;");
                    p = p.replace(/</g, "&lt;");
                    p = p.replace(/>/g, "&gt;");
                    p = p.replace(/"/g, "&quot;");
                    p = p.replace(/'/g, "&apos;");
                    if (f.htmlTip) {
                        q.attr += ' data-htmltip="true" '
                    }
                    q.attr += ' ext:qtip="' + p + '" '
                }
                if (Ext.isEmpty(q.value)) {
                    q.value = "&#160;"
                }
                if (this.markDirty && e.dirty && typeof e.modified[f.name] != "undefined") {
                    q.css += " x-grid3-dirty-cell"
                }
                k[k.length] = c.apply(q)
            }
            y = [];
            if (t && ((o + 1) % 2 === 0)) {
                y[0] = "x-grid3-row-alt"
            }
            if (e.dirty) {
                y[1] = " x-grid3-dirty-row"
            }
            m.cols = r;
            if (this.getRowClass) {
                y[2] = this.getRowClass(e, o, m, l)
            }
            m.alt = y.join(" ");
            m.cells = k.join("");
            h[h.length] = z.apply(m);
            if (this.smartRander) {
                this.rowBuffer.push(k)
            }
        }
        return h.join("")
    },
    refreshRow: function(g) {
        var m = this.ds,
            n = this.cm.getColumnCount(),
            c = this.getColumnData(),
            o = n - 1,
            q = ["x-grid3-row"],
            f = {
                tstyle: String.format("width: {0};", this.getTotalWidth())
            },
            a = [],
            k = this.templates.cell,
            j, r, b, p, h, e;
        if (Ext.isNumber(g)) {
            j = g;
            g = m.getAt(j)
        } else {
            j = m.indexOf(g)
        }
        if (!g || j < 0) {
            return
        }
        for (e = 0; e < n; e++) {
            b = c[e];
            if (e == 0) {
                h = "x-grid3-cell-first"
            } else {
                h = (e == o) ? "x-grid3-cell-last " : ""
            }
            p = {
                id: b.id,
                style: b.style,
                css: h,
                attr: "",
                cellAttr: ""
            };
            p.value = b.renderer.call(b.scope, g.data[b.name], p, g, j, e, m);
            if (b.value2Tip && p.value) {
                var l = p.value;
                l = l.replace(/&/g, "&amp;");
                l = l.replace(/</g, "&lt;");
                l = l.replace(/>/g, "&gt;");
                l = l.replace(/"/g, "&quot;");
                l = l.replace(/'/g, "&apos;");
                if (b.htmlTip) {
                    p.attr += ' data-htmltip="true" '
                }
                p.attr += 'ext:qtip="' + l + '"'
            }
            if (Ext.isEmpty(p.value)) {
                p.value = "&#160;"
            }
            if (this.markDirty && g.dirty && typeof g.modified[b.name] != "undefined") {
                p.css += " x-grid3-dirty-cell"
            }
            a[e] = k.apply(p)
        }
        r = this.getRow(j);
        var d = this.fly(r);
        if (this.smartRander) {
            Ext.each(this.rowBuffer[j], function(t, s) {
                if (t === a[s]) {
                    return true
                }
                var i = this.getCell(j, s);
                i.outerHTML = a[s]
            }, this);
            this.rowBuffer[j] = a;
            r.className = "";
            if (this.grid.stripeRows && ((j + 1) % 2 === 0)) {
                q.push("x-grid3-row-alt")
            }
            if (this.getRowClass) {
                q.push(this.getRowClass(g, j, f, m))
            }
            d.addClass(q).setStyle(f.tstyle)
        } else {
            r.className = "";
            if (this.grid.stripeRows && ((j + 1) % 2 === 0)) {
                q.push("x-grid3-row-alt")
            }
            if (this.getRowClass) {
                f.cols = n;
                q.push(this.getRowClass(g, j, f, m))
            }
            d.addClass(q).setStyle(f.tstyle);
            f.cells = a.join("");
            r.innerHTML = this.templates.rowInner.apply(f)
        }
        switch (j) {
            case 0:
                d.addClass(this.firstRowCls);
                break;
            case m.getCount() - 1:
                d.addClass(this.lastRowCls);
                break
        }
        this.fireEvent("rowupdated", this, j, g)
    },
    getColumnWidth: function(b) {
        var c = this.cm.getColumnWidth(b),
            a = this.borderWidth;
        if (Ext.isNumber(c)) {
            if (Ext.isBorderBox || (Ext.isWebKit && !Ext.isSafari2)) {
                c -= 2;
                return c + "px"
            } else {
                return Math.max(c - a, 0) + "px"
            }
        } else {
            return c
        }
    },
    handleHdDown: function(h, i) {
        if (Ext.fly(i).hasClass("x-grid3-hd-btn")) {
            h.stopEvent();
            var j = this.cm,
                f = this.findHeaderCell(i),
                g = this.getCellIndex(f),
                d = j.isSortable(g),
                c = this.hmenu,
                b = c.items,
                a = this.headerMenuOpenCls;
            this.hdCtxIndex = g;
            Ext.fly(f).addClass(a);
            b.get("asc").setVisible(d);
            b.get("desc").setVisible(d);
            b.get("columns").previousSibling().setVisible(d);
            c.on("hide", function() {
                Ext.fly(f).removeClass(a)
            }, this, {
                single: true
            });
            c.show(i, "tl-bl?")
        }
    },
    getScrollOffset: function() {
        return 0
    },
    autoExpand: function(n) {
        var a = this.grid,
            j = this.cm,
            g = this.getGridInnerWidth(),
            c = j.getTotalWidth(false),
            h = a.autoExpandColumn,
            l = 0,
            m = 0;
        try {
            m = a.el.child("div.x-grid3-body").getHeight();
            l = a.el.child("div.x-grid3-scroller").getHeight()
        } catch (f) {
            _D("[Err] GridView autoExpand:")
        }
        if (!this.userResized && h) {
            if (g != c || true) {
                var k = j.getIndexById(h),
                    b = j.getColumnWidth(k),
                    i = g - c + b,
                    d = Math.min(Math.max(i, a.autoExpandMin), a.autoExpandMax);
                if (a.autoExpandColumnMinWidth) {
                    d = Math.max(d, a.autoExpandColumnMinWidth)
                }
                if (m > l) {
                    d -= this.getScrollOffset()
                }
                if (b != d) {
                    j.setColumnWidth(k, d, true);
                    if (n !== true) {
                        this.updateColumnWidth(k, d)
                    }
                }
            }
        }
    },
    applyEmptyText: function() {
        if (this.emptyText && !this.hasRows()) {
            this.mainBody.update('<div class="x-grid-empty">' + (_S[this.emptyText] || this.emptyText) + "</div>")
        }
    },
    getColumnTooltip: function(a) {
        var c = this.cm.getColumnTooltip(a);
        if (c) {
            if (Ext.QuickTips.isEnabled()) {
                var b = 'ext:qtip="' + c + '"';
                if (this.cm.htmlTip(a)) {
                    b += ' data-htmltip="true" '
                }
                return b
            } else {
                return 'title="' + c + '"'
            }
        }
        return ""
    },
    initElements: function() {
        var b = Ext.Element,
            d = Ext.get(this.grid.getGridEl().dom.firstChild),
            e = new b(d.child("div.x-grid3-viewport")),
            c = new b(e.child("div.x-grid3-header")),
            a = new b(e.child("div.x-grid3-scroller"));
        if (this.grid.hideHeaders) {
            c.setDisplayed(false)
        }
        if (this.forceFit) {
            a.setStyle("overflow-x", "hidden")
        }
        Ext.apply(this, {
            el: d,
            mainWrap: e,
            scroller: a,
            mainHd: c,
            innerHd: c.child("div.x-grid3-header-inner").dom,
            mainBody: new b(b.fly(a).child("div.x-grid3-body")),
            focusEl: new b(b.fly(a).child("a")),
            resizeMarker: new b(d.child("div.x-grid3-resize-marker")),
            resizeProxy: new b(d.child("div.x-grid3-resize-proxy"))
        });
        this.focusEl.swallowEvent("click", true);
        this.qtsScrollBar = new QNAP.CMP.Plugin.QTSScrollBar({
            target: a
        });
        this.grid.on({
            resize: this.qtsScrollBar.updateSize
        });
        this.on({
            refresh: this.qtsScrollBar.updateSize
        })
    },
    onLayout: function(a, b) {
        this.scroller.dom.style.removeProperty("overflow");
        this.qtsScrollBar.updateSize(true)
    },
    fitColumns: function(f, h, g) {
        var a = this.grid,
            k = this.cm,
            r = k.getTotalWidth(false),
            p = this.getGridInnerWidth(),
            q = p - r,
            c = [],
            n = 0,
            m = 0,
            t, d, o;
        if (p < 20 || q === 0) {
            return false
        }
        var e = k.getColumnCount(true),
            l = k.getColumnCount(false),
            b = e - (Ext.isNumber(g) ? 1 : 0);
        if (b === 0) {
            b = 1;
            g = undefined
        }
        for (o = 0; o < l; o++) {
            if (!k.isFixed(o) && o !== g) {
                t = k.getColumnWidth(o);
                c.push(o, t);
                if (!k.isHidden(o)) {
                    n = o;
                    m += t
                }
            }
        }
        d = (p - k.getTotalWidth()) / m;
        while (c.length) {
            t = c.pop();
            o = c.pop();
            newColWidth = Math.max(a.minColumnWidth, Math.floor(t + t * d));
            k.setColumnWidth(o, newColWidth, true)
        }
        r = k.getTotalWidth(false);
        if (r > p) {
            var s = (b == e) ? n : g,
                j = Math.max(1, k.getColumnWidth(s) - (r - p));
            k.setColumnWidth(s, j, true)
        } else {
            if (p > r) {
                k.setColumnWidth(n, k.getColumnWidth(n) + (p - r), true)
            }
        }
        if (f !== true) {
            this.updateAllColumnWidths()
        }
        return true
    }
});
Ext.override(Ext.form.Field, {
    labelDisableClass: true,
    onDisable: function() {
        this.getActionEl().addClass(this.disabledClass);
        if (this.labelDisableClass && this.itemCt) {
            this.itemCt.addClass(Ext.isString(this.labelDisableClass) ? this.labelDisableClass : this.disabledClass)
        }
        this.el.dom.disabled = true
    },
    onEnable: function() {
        this.getActionEl().removeClass(this.disabledClass);
        if (this.labelDisableClass && this.itemCt) {
            this.itemCt.removeClass(Ext.isString(this.labelDisableClass) ? this.labelDisableClass : this.disabledClass)
        }
        this.el.dom.disabled = false
    },
    setOValue: function(a) {
        this.setValue(a);
        this.originalValue = a;
        return this
    }
});
Ext.override(Ext.form.CheckboxGroup, {
    onDisable: function() {
        this.eachItem(function(a) {
            a.disable()
        });
        if (this.labelDisableClass && this.itemCt) {
            this.itemCt.addClass(Ext.isString(this.labelDisableClass) ? this.labelDisableClass : this.disabledClass)
        }
    },
    onEnable: function() {
        this.eachItem(function(a) {
            a.enable()
        });
        if (this.labelDisableClass && this.itemCt) {
            this.itemCt.removeClass(Ext.isString(this.labelDisableClass) ? this.labelDisableClass : this.disabledClass)
        }
    }
});
Ext.override(Ext.Element, {
    clearOpacity: function() {
        var b = this.dom.style,
            a = /^\s+|\s+$/g,
            c = /alpha\(opacity=(.*)\)/i;
        if (Ext.isIE && !Ext.isIE10) {
            if (!Ext.isEmpty(b.filter)) {
                b.filter = b.filter.replace(c, "").replace(a, "")
            }
        } else {
            b.opacity = b["-moz-opacity"] = b["-khtml-opacity"] = ""
        }
        return this
    },
    setOpacity: function(e, b) {
        var f = this,
            i = f.dom.style,
            g = /alpha\(opacity=(.*)\)/i,
            a = /^\s+|\s+$/g;
        if (!b || !f.anim) {
            var h = QNAP.QOS.lib.getIEVersion();
            if (Ext.isIE && h < 9) {
                var d = e < 1 ? "alpha(opacity=" + e * 100 + ")" : "",
                    c = i.filter.replace(g, "").replace(a, "");
                i.zoom = 1;
                i.filter = c + (c.length > 0 ? " " : "") + d
            } else {
                i.opacity = e
            }
        } else {
            f.anim({
                opacity: {
                    to: e
                }
            }, f.preanim(arguments, 1), null, 0.35, "easeIn")
        }
        return f
    },
    mask: function(c, k, p) {
        var o = this,
            g = o.dom,
            n = Ext.DomHelper,
            a, q;
        var j = "visibility",
            d = "display",
            b = "hidden",
            m = "none",
            f = "x-masked",
            l = "x-masked-relative",
            i = "ext-el-mask-msg x-mask-loading",
            h = Ext.Element.data;
        if (!/^body/i.test(g.tagName) && o.getStyle("position") == "static") {
            o.addClass(l)
        }
        if (a = h(g, "maskMsg")) {
            a.remove()
        }
        if (a = h(g, "mask")) {
            a.remove()
        }
        if (Ext.isEmpty(p)) {
            p = ""
        }
        q = n.append(g, {
            cls: "ext-el-mask " + p
        }, true);
        h(g, "mask", q);
        o.addClass(f);
        q.setDisplayed(true);
        if (typeof c == "string") {
            var e = n.append(g, {
                cls: i,
                cn: {
                    tag: "div"
                }
            }, true);
            h(g, "maskMsg", e);
            e.dom.className = k ? i + " " + k : i;
            e.dom.firstChild.innerHTML = _S[c] || c;
            e.setDisplayed(true);
            e.center(o)
        }
        if (Ext.isIE && !(Ext.isIE7 && Ext.isStrict) && o.getStyle("height") == "auto") {
            q.setSize(undefined, o.getHeight())
        }
        return q
    }
});
QNAP.CMP.ToolTip = Ext.extend(Ext.ToolTip, {
    anchorAlign: "tr-bl",
    getAnchorAlign: function() {
        return this.anchorAlign
    },
    syncAnchor: function() {
        var a, b, c;
        switch (this.tipAnchor.charAt(0)) {
            case "t":
                a = "b";
                b = "tl";
                c = [-6 + this.anchorOffset, 10];
                break;
            case "r":
                a = "l";
                b = "tr";
                c = [-2, 11 + this.anchorOffset];
                break;
            case "b":
                a = "t";
                b = "bl";
                c = [20 + this.anchorOffset, -1];
                break;
            default:
                a = "r";
                b = "tl";
                c = [2, 11 + this.anchorOffset];
                break
        }
        this.anchorEl.alignTo(this.anchorTarget, b + "-" + a, c)
    },
    showBy: function(a, b) {
        if (!this.rendered) {
            this.render(Ext.getBody())
        }
        this.showAt(this.el.getAlignToXY(a, b || this.defaultAlign))
    },
    getOffsets: function() {
        var b, a = this.getAnchorPosition().charAt(0);
        if (this.anchorToTarget && !this.trackMouse) {
            switch (a) {
                case "t":
                    b = [0, 14];
                    break;
                case "b":
                    b = [0, -9];
                    break;
                case "r":
                    b = [-12, 0];
                    break;
                default:
                    b = [6, 0];
                    break
            }
        } else {
            switch (a) {
                case "t":
                    b = [-15 - this.anchorOffset, 30];
                    break;
                case "b":
                    b = [-19 - this.anchorOffset, -13 - this.el.dom.offsetHeight];
                    break;
                case "r":
                    b = [-15 - this.el.dom.offsetWidth, -13 - this.anchorOffset];
                    break;
                default:
                    b = [25, -13 - this.anchorOffset];
                    break
            }
        }
        var c = this.getMouseOffset();
        b[0] += c[0];
        b[1] += c[1];
        return b
    }
});
QNAP.CMP.PageSize = function(a) {
    Ext.apply(this, a)
};
Ext.override(Ext.form.CompositeField, {
    initComponent: function() {
        var f = [],
            b = this.items,
            e;
        for (var d = 0, c = b.length; d < c; d++) {
            e = b[d];
            if (!Ext.isEmpty(e.ref)) {
                e.ref = "../" + e.ref
            }
            f.push(e.fieldLabel);
            Ext.applyIf(e, this.defaults);
            if (!(d == c - 1 && this.skipLastItemMargin)) {
                Ext.applyIf(e, {
                    margins: this.defaultMargins
                })
            }
        }
        this.fieldLabel = this.fieldLabel || this.buildLabel(f);
        this.fieldErrors = new Ext.util.MixedCollection(true, function(g) {
            return g.field
        });
        this.fieldErrors.on({
            scope: this,
            add: this.updateInvalidMark,
            remove: this.updateInvalidMark,
            replace: this.updateInvalidMark
        });
        Ext.form.CompositeField.superclass.initComponent.apply(this, arguments);
        this.innerCt = new Ext.Container({
            layout: "hbox",
            items: this.items,
            cls: "x-form-composite",
            defaultMargins: "0 3 0 0",
            ownerCt: this
        });
        var a = this.innerCt.findBy(function(g) {
            return g.isFormField
        }, this);
        this.items = new Ext.util.MixedCollection();
        this.items.addAll(a);
        this.innerCt.ownerCt = this
    },
    combineErrors: false
});
Ext.extend(QNAP.CMP.PageSize, Ext.util.Observable, {
    beforeText: "PAGING_TEXT_01",
    afterText: "PAGING_TEXT_02",
    addBefore: "-",
    addAfter: null,
    dynamic: false,
    variations: [10, 20, 50, 75, 100],
    defaultPageSize: 10,
    comboCfg: undefined,
    userConfigKey: "defaultPageSize",
    init: function(a) {
        this.pagingToolbar = a;
        this.pagingToolbar.pageSizeCombo = this;
        this.pagingToolbar.setPageSize = this.setPageSize.createDelegate(this);
        this.pagingToolbar.getPageSize = function() {
            return this.pageSize
        };
        if (Ext.isEmpty(QNAP.QOS.user.pageSize[this.userConfigKey])) {
            var b = {
                func: "set"
            };
            b["pageSize_" + this.userConfigKey] = parseInt(this.defaultPageSize);
            QNAP.QOS.user.pageSize[this.userConfigKey] = parseInt(this.defaultPageSize);
            Ext.Ajax.request({
                url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + "userConfig.cgi"),
                params: b,
                method: "POST",
                success: function(c, d) {}
            })
        }
        this.pagingToolbar.pageSize = parseInt(QNAP.QOS.user.pageSize[this.userConfigKey]) || this.defaultPageSize;
        this.pagingToolbar.on("render", this.onRender, this)
    },
    addSize: function(a) {
        if (a > 0) {
            this.sizes.push([a])
        }
    },
    updateStore: function() {
        if (this.pagingToolbar.pageSize == "") {
            this.pagingToolbar.pageSize = this.defaultPageSize
        }
        this.setPageSize(this.pagingToolbar.pageSize);
        var e = {
            func: "set"
        };
        e["pageSize_" + this.userConfigKey] = this.pagingToolbar.pageSize;
        QNAP.QOS.user.pageSize[this.userConfigKey] = this.pagingToolbar.pageSize;
        Ext.Ajax.request({
            url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + "userConfig.cgi"),
            params: e,
            method: "POST",
            success: function(g, h) {}
        });
        if (this.dynamic) {
            var b = this.pagingToolbar.pageSize,
                f;
            b = (b > 0) ? b : 1;
            this.sizes = [];
            var c = this.variations;
            for (var d = 0, a = c.length; d < a; d++) {
                this.addSize(b - c[c.length - 1 - d])
            }
            this.addToStore(b);
            for (var d = 0, a = c.length; d < a; d++) {
                this.addSize(b + c[d])
            }
        } else {
            if (!this.staticSizes) {
                this.sizes = [];
                var c = this.variations;
                var b = 0;
                for (var d = 0, a = c.length; d < a; d++) {
                    this.addSize(b + c[d])
                }
                this.staticSizes = this.sizes.slice(0)
            } else {
                this.sizes = this.staticSizes.slice(0)
            }
        }
        this.combo.store.loadData(this.sizes);
        this.combo.collapse();
        this.combo.setValue(this.pagingToolbar.pageSize)
    },
    setPageSize: function(f, k) {
        var l = this.pagingToolbar;
        this.combo.collapse();
        f = parseInt(f) || parseInt(this.combo.getValue());
        f = (f > 0) ? f : 10;
        QNAP.QOS.user.pageSize[this.userConfigKey] = f;
        this.combo.originalValue = f;
        if (f == l.pageSize) {
            return
        } else {
            if (f < l.pageSize) {
                l.pageSize = f;
                var a = Math.round(l.cursor / f) + 1;
                var j = (a - 1) * f;
                var g = l.store;
                if (j > g.getTotalCount()) {
                    this.pagingToolbar.pageSize = f;
                    this.pagingToolbar.doLoad(j - f)
                } else {
                    g.suspendEvents();
                    for (var b = 0, c = j - l.cursor; b < c; b++) {
                        g.remove(g.getAt(0))
                    }
                    while (g.getCount() > f) {
                        g.remove(g.getAt(g.getCount() - 1))
                    }
                    g.resumeEvents();
                    g.fireEvent("datachanged", g);
                    l.cursor = j;
                    var e = l.getPageData();
                    l.first.setDisabled(a == 1);
                    l.prev.setDisabled(a == 1);
                    l.next.setDisabled(a == e.pages);
                    l.last.setDisabled(a == e.pages);
                    l.updateInfo();
                    l.doRefresh()
                }
            } else {
                var h = this.pagingToolbar;
                this.pagingToolbar.pageSize = f;
                this.pagingToolbar.doLoad(Math.floor(this.pagingToolbar.cursor / this.pagingToolbar.pageSize) * this.pagingToolbar.pageSize)
            }
        }
        this.updateStore()
    },
    onRender: function() {
        var a = this;
        this.combo = Ext.ComponentMgr.create(Ext.applyIf(this.comboCfg || {}, {
            store: new Ext.data.ArrayStore({
                fields: ["pageSize"],
                data: []
            }),
            displayField: "pageSize",
            valueField: "pageSize",
            mode: "local",
            triggerAction: "all",
            width: 50,
            labelWidth: 50,
            editable: false,
            forceSelection: true,
            xtype: "combo"
        }));
        this.combo.on("select", this.setPageSize, this);
        this.combo.isDirty = function() {
            return false
        };
        this.updateStore();
        if (this.addBefore) {
            this.pagingToolbar.add(this.addBefore)
        }
        if (this.beforeText) {
            if (typeof _S[this.beforeText] != "undefined") {
                this.pagingToolbar.add({
                    xtype: "displayfield",
                    value: _S[this.beforeText],
                    qInternational: true,
                    qInternationalFn: function(b) {
                        b.setValue(_S[a.beforeText]);
                        b.originalValue = b.getValue()
                    }
                })
            } else {
                this.pagingToolbar.add({
                    xtype: "displayfield",
                    value: this.beforeText
                })
            }
        }
        this.pagingToolbar.add(this.combo);
        if (this.afterText) {
            if (typeof _S[this.afterText] != "undefined") {
                this.pagingToolbar.add({
                    xtype: "displayfield",
                    value: _S[this.afterText],
                    qInternational: true,
                    qInternationalFn: function(b) {
                        b.setValue(_S[a.afterText]);
                        b.originalValue = b.getValue()
                    }
                })
            } else {
                this.pagingToolbar.add({
                    xtype: "displayfield",
                    value: this.afterText
                })
            }
        }
        if (this.addAfter) {
            this.pagingToolbar.add(this.addAfter)
        }
    }
});
Ext.util.Format.fileSize = function(c, f, d) {
    f = f ? f : _S.IEI_NAS_SYSINFO_BYTE;
    var b = [_S.IEI_NAS_SYSINFO_BYTE, _S.IEI_NAS_SYSINFO_KB, _S.IEI_NAS_SYSINFO_MB, _S.IEI_NAS_SYSINFO_GB, _S.IEI_NAS_SYSINFO_TB, _S.IEI_NAS_SYSINFO_PB, _S.IEI_NAS_SYSINFO_EB, _S.IEI_NAS_SYSINFO_ZB, _S.IEI_NAS_SYSINFO_YB];
    if (c == 0) {
        return "0 " + _S.IEI_NAS_SYSINFO_BYTE
    }
    var a = c * Math.pow(1024, b.indexOf(f));
    var g = -1;
    if (d) {
        g = b.indexOf(d)
    }
    if (g == -1) {
        g = Math.floor(Math.log(a) / Math.log(1024))
    }
    return (a / Math.pow(1024, Math.floor(g))).toFixed(2) + " " + b[g]
};
Ext.override(Ext.layout.BorderLayout.Region, {
    getCollapsedEl: function() {
        if (!this.collapsedEl) {
            if (!this.toolTemplate) {
                var b = new Ext.Template('<div class="x-tool x-tool-{id}">&#160;</div>');
                b.disableFormats = true;
                b.compile();
                Ext.layout.BorderLayout.Region.prototype.toolTemplate = b
            }
            var c = {
                cls: "x-layout-collapsed x-layout-collapsed-" + this.position,
                id: this.panel.id + "-xcollapsed"
            };
            if (this.panel.collapsedTitle) {
                c.html = this.panel.collapsedTitle
            }
            this.collapsedEl = this.targetEl.createChild(c);
            this.collapsedEl.enableDisplayMode("block");
            if (this.collapseMode == "mini") {
                this.collapsedEl.addClass("x-layout-cmini-" + this.position);
                this.miniCollapsedEl = this.collapsedEl.createChild({
                    cls: "x-layout-mini x-layout-mini-" + this.position,
                    html: "&#160;"
                });
                this.miniCollapsedEl.addClassOnOver("x-layout-mini-over");
                this.collapsedEl.addClassOnOver("x-layout-collapsed-over");
                this.collapsedEl.on("click", this.onExpandClick, this, {
                    stopEvent: true
                })
            } else {
                if (this.collapsible !== false && !this.hideCollapseTool) {
                    var a = this.expandToolEl = this.toolTemplate.append(this.collapsedEl.dom, {
                        id: "expand-" + this.position
                    }, true);
                    a.addClassOnOver("x-tool-expand-" + this.position + "-over");
                    a.on("click", this.onExpandClick, this, {
                        stopEvent: true
                    })
                }
                if (this.floatable !== false || this.titleCollapse) {
                    this.collapsedEl.addClassOnOver("x-layout-collapsed-over");
                    this.collapsedEl.on("click", this[this.floatable ? "collapseClick" : "onExpandClick"], this)
                }
            }
        }
        return this.collapsedEl
    }
});
Ext.override(Ext.DataView, {
    refresh: function() {
        this.clearSelections(false, true);
        var b = this.getTemplateTarget(),
            a = this.store.getRange();
        if (Ext.isEmpty(b)) {
            return
        }
        if (a.length < 1) {
            if (!this.deferEmptyText || this.hasSkippedEmptyText) {
                b.update(this.emptyText)
            }
            this.all.clear()
        } else {
            this.tpl.overwrite(b, this.collectData(a, 0));
            this.all.fill(Ext.query(this.itemSelector, b.dom));
            this.updateIndexes(0)
        }
        this.refreshFn();
        this.hasSkippedEmptyText = true
    },
    refreshFn: Ext.emptyFn,
    onUpdate: function(f, a) {
        var b = this.store.indexOf(a);
        if (b > -1 && this.all.getCount() > 0) {
            var e = this.isSelected(b),
                c = this.all.elements[b],
                d = this.bufferRender([a], b)[0];
            this.all.replaceElement(b, d, true);
            if (e) {
                this.selected.replaceElement(c, d);
                this.all.item(b).addClass(this.selectedClass)
            }
            this.updateIndexes(b, b)
        }
    }
});
QNAP.CMP.ProgressVBar = Ext.extend(Ext.ProgressBar, {
    baseCls: "x-progress",
    cls: "q-progress",
    onRender: function(d, a) {
        var c = new Ext.Template('<div class="{cls}-wrap">', '<div class="{cls}-inner">', '<div class="{cls}-bar">', '<div class="{cls}-text">', "<div>&#160;</div>", "</div>", "</div>", '<div class="{cls}-text {cls}-text-back">', "<div>&#160;</div>", "</div>", "</div>", "</div>");
        this.el = a ? c.insertBefore(a, {
            cls: this.baseCls
        }, true) : c.append(d, {
            cls: this.baseCls
        }, true);
        if (this.id) {
            this.el.dom.id = this.id
        }
        var b = this.el.dom.firstChild;
        this.progressBar = Ext.get(b.firstChild);
        if (this.textEl) {
            this.textEl = Ext.get(this.textEl);
            delete this.textTopEl
        } else {
            this.textTopEl = Ext.get(this.progressBar.dom.firstChild);
            var e = Ext.get(b.childNodes[1]);
            this.textTopEl.setStyle("z-index", 99).addClass("x-hidden");
            this.textEl = new Ext.CompositeElement([this.textTopEl.dom.firstChild, e.dom.firstChild]);
            this.textEl.setHeight(b.offsetHeight)
        }
        this.progressBar.setHeight(0)
    },
    updateProgress: function(c, d, b) {
        this.value = c || 0;
        if (d) {
            this.updateText(d)
        }
        if (this.rendered && !this.isDestroyed) {
            var a = Math.floor(c * this.el.dom.firstChild.offsetHeight) - 3;
            this.progressBar.setHeight(a, b === true || (b !== false && this.animate));
            if (this.textTopEl) {
                this.textTopEl.removeClass("x-hidden").setHeight(a)
            }
        }
        this.fireEvent("update", this, c, d);
        return this
    }
});
Ext.override(Ext.form.Checkbox, {
    itemCls: "qos-systemPreferences-chkbox"
});
Ext.override(Ext.TabPanel, {
    autoScrollTabs: function() {
        this.pos = this.tabPosition == "bottom" ? this.footer : this.header;
        var g = this.items.length,
            d = this.pos.dom.offsetWidth,
            c = this.pos.dom.clientWidth,
            f = this.stripWrap,
            e = f.dom,
            b = e.offsetWidth,
            h = this.getScrollPos(),
            a = this.edge.getOffsetsTo(this.pos)[0] + h;
        if (!this.enableTabScroll || b < 20) {
            return
        }
        if (g == 0 || a <= c) {
            e.scrollLeft = 0;
            f.setWidth(c);
            if (this.scrolling) {
                this.scrolling = false;
                this.pos.removeClass("x-tab-scrolling");
                this.scrollLeft.hide();
                this.scrollRight.hide();
                if (Ext.isAir || Ext.isWebKit) {
                    e.style.marginLeft = "";
                    e.style.marginRight = ""
                }
            }
        } else {
            if (!this.scrolling) {
                if (!this.scrollLeft) {
                    this.createScrollers()
                } else {
                    this.scrollLeft.show();
                    this.scrollRight.show()
                }
                this.pos.addClass("x-tab-scrolling");
                if (Ext.isAir || Ext.isWebKit) {
                    e.style.marginLeft = this.scrollLeft.getWidth() + "px";
                    e.style.marginRight = this.scrollRight.getWidth() + "px"
                }
            }
            this.scrolling = true;
            c -= f.getMargins("lr");
            f.setWidth(c > 20 ? c : 20);
            if (h > (a - c)) {
                e.scrollLeft = a - c
            } else {
                this.scrollToTab(this.activeTab, false)
            }
            this.updateScrollButtons()
        }
    },
    onScrollRight: function() {
        var a = this.getScrollWidth() + this.strip.getPadding("r") - this.getScrollArea(),
            c = this.getScrollPos(),
            b = Math.min(a, c + this.getScrollIncrement());
        if (b != c) {
            this.scrollTo(b, this.animScroll)
        }
    },
    autoSizeTabs: function() {
        var g = this.items.length,
            b = this.tabPosition != "bottom" ? "header" : "footer",
            c = this[b].dom.offsetWidth,
            a = this[b].dom.clientWidth;
        if (!this.resizeTabs || g < 1 || !a) {
            return
        }
        var j = Math.max(Math.min(Math.floor((a - 4) / g) - this.tabMargin, this.tabWidth), this.minTabWidth);
        this.lastTabWidth = j;
        var l = this.strip.query("li:not(.x-tab-edge)");
        for (var e = 0, h = l.length; e < h; e++) {
            var k = l[e],
                m = Ext.fly(k).child(".x-tab-strip-inner", true),
                f = k.offsetWidth,
                d = m.offsetWidth;
            if ((j - (f - d)) > 0) {
                m.style.width = (j - (f - d)) + "px"
            }
        }
    }
});
Ext.form.TwinTriggerFieldFind = Ext.extend(Ext.form.TwinTriggerField, {
    initComponent: function() {
        Ext.form.TwinTriggerField.superclass.initComponent.call(this);
        this.triggerConfig = {
            tag: "span",
            cls: "x-form-twin-triggers",
            cn: [{
                tag: "img",
                src: Ext.BLANK_IMAGE_URL,
                alt: "",
                cls: "x-form-trigger " + this.trigger1Class
            }]
        }
    },
    selectOnFocus: undefined === this.selectOnFocus ? true : this.selectOnFocus,
    trigger1Class: "x-form-search-trigger",
    onTrigger1Click: function() {
        this.onTriggerSearch()
    },
    onTriggerSearch: Ext.emptyFn()
});
Ext.override(Ext.grid.CheckboxSelectionModel, {
    width: 30,
    onHdMouseDown: function(f, a) {
        var d = new Date().getTime();
        if (Ext.fly(a).hasClass("x-grid3-hd-checker")) {
            f.stopEvent();
            var c = Ext.fly(a.parentNode);
            var g = c.hasClass("x-grid3-hd-checker-on");
            if (g) {
                c.removeClass("x-grid3-hd-checker-on");
                this.clearSelections()
            } else {
                c.addClass("x-grid3-hd-checker-on");
                this.selectAll()
            }
        }
        var b = new Date().getTime();
        _D("--onHdMouseDown", b - d)
    }
});
Ext.override(Ext.Panel, {
    qInternationalFn: function() {
        if (_S[this.qInternationalKey]) {
            this.setTitle(_S[this.qInternationalKey])
        }
    }
});
Ext.Shadow = function(d) {
    Ext.apply(this, d);
    if (typeof this.mode != "string") {
        this.mode = this.defaultMode
    }
    var e = this.offset,
        c = {
            h: 0
        },
        b = Math.floor(this.offset / 2);
    switch (this.mode.toLowerCase()) {
        case "drop":
            c.w = 0;
            c.l = c.t = e;
            c.t -= 1;
            if (Ext.isIE && !Ext.isIE10) {
                c.l -= this.offset + b;
                c.t -= this.offset + b;
                c.w -= b;
                c.h -= b;
                c.t += 1
            }
            break;
        case "sides":
            c.w = (e * 2);
            c.l = -e;
            c.t = e - 1;
            if (Ext.isIE && !Ext.isIE10) {
                c.l -= (this.offset - b);
                c.t -= this.offset + b;
                c.l += 1;
                c.w -= (this.offset - b) * 2;
                c.w -= b + 1;
                c.h -= 1
            }
            break;
        case "frame":
            c.w = c.h = (e * 2);
            c.l = c.t = -e;
            c.t += 1;
            c.h -= 2;
            if (Ext.isIE && !Ext.isIE10) {
                c.l -= (this.offset - b);
                c.t -= (this.offset - b);
                c.l += 1;
                c.w -= (this.offset + b + 1);
                c.h -= (this.offset + b);
                c.h += 1
            }
            break
    }
    this.adjusts = c
};
Ext.Shadow.prototype = {
    offset: 4,
    defaultMode: "drop",
    cls: "",
    show: function(a) {
        a = Ext.get(a);
        if (!this.el) {
            this.el = Ext.Shadow.Pool.pull(this.cls);
            if (this.el.dom.nextSibling != a.dom) {
                this.el.insertBefore(a)
            }
        }
        this.el.setStyle("z-index", this.zIndex || parseInt(a.getStyle("z-index"), 10) - 1);
        if (Ext.isIE && !Ext.isIE10) {
            this.el.dom.style.filter = "progid:DXImageTransform.Microsoft.alpha(opacity=50) progid:DXImageTransform.Microsoft.Blur(pixelradius=" + (this.offset) + ")"
        }
        this.realign(a.getLeft(true), a.getTop(true), a.getWidth(), a.getHeight());
        this.el.dom.style.display = "block"
    },
    isVisible: function() {
        return this.el ? true : false
    },
    realign: function(b, q, p, f) {
        if (!this.el) {
            return
        }
        var m = this.adjusts,
            j = this.el.dom,
            r = j.style,
            g = 0,
            o = (p + m.w),
            e = (f + m.h),
            i = o + "px",
            n = e + "px",
            k, c;
        r.left = (b + m.l) + "px";
        r.top = (q + m.t) + "px";
        if (r.width != i || r.height != n) {
            r.width = i;
            r.height = n;
            if (!Ext.isIE) {
                k = j.childNodes;
                c = Math.max(0, (o - 12)) + "px";
                k[0].childNodes[1].style.width = c;
                k[1].childNodes[1].style.width = c;
                k[2].childNodes[1].style.width = c;
                k[1].style.height = Math.max(0, (e - 12)) + "px"
            }
        }
    },
    hide: function() {
        if (this.el) {
            this.el.dom.style.display = "none";
            Ext.Shadow.Pool.push(this.el);
            delete this.el
        }
    },
    setZIndex: function(a) {
        this.zIndex = a;
        if (this.el) {
            this.el.setStyle("z-index", a)
        }
    }
};
Ext.Shadow.prototype.realign = function(b, q, p, f) {
    if (!this.el) {
        return
    }
    var m = this.adjusts,
        j = this.el.dom,
        r = j.style,
        g = 0,
        o = (p + m.w),
        e = (f + m.h),
        i = o + "px",
        n = e + "px",
        k, c;
    r.left = (b + m.l) + "px";
    r.top = (q + m.t) + "px";
    if (r.width != i || r.height != n) {
        r.width = i;
        r.height = n;
        if (!Ext.isIE || Ext.isIE10) {
            k = j.childNodes;
            c = Math.max(0, (o - 48)) + "px";
            k[0].childNodes[1].style.width = c;
            k[1].childNodes[1].style.width = c;
            k[2].childNodes[1].style.width = c;
            k[1].style.height = Math.max(0, (e - 48)) + "px"
        }
    }
};
Ext.Shadow.Pool = function() {
    var b = [],
        a = (Ext.isIE && !Ext.isIE10) ? '<div class="x-ie-shadow"></div>' : '<div class="x-shadow"><div class="xst"><div class="xstl"></div><div class="xstc"></div><div class="xstr"></div></div><div class="xsc"><div class="xsml"></div><div class="xsmc"></div><div class="xsmr"></div></div><div class="xsb"><div class="xsbl"></div><div class="xsbc"></div><div class="xsbr"></div></div></div>';
    return {
        pull: function(c) {
            var d = b.shift();
            if (!d) {
                d = Ext.get(Ext.DomHelper.insertHtml("beforeBegin", document.body.firstChild, a.replace("QNAP_CLS", c || "")));
                d.autoBoxAdjust = false
            }
            return d
        },
        push: function(c) {
            b.push(c)
        }
    }
}();
Ext.override(Ext.grid.GridDragZone, {
    getDragData: function(b) {
        var a = Ext.lib.Event.getTarget(b);
        var d = this.view.findRowIndex(a);
        if (d !== false) {
            var c = this.grid.selModel;
            if (c instanceof(Ext.grid.CheckboxSelectionModel)) {
                c.onMouseDown(b, b.getTarget())
            } else {
                if (!c.isSelected(d) || b.hasModifier()) {
                    c.handleMouseDown(this.grid, d, b)
                } else {
                    c.handleMouseDown(this.grid, d, b)
                }
            }
            return {
                grid: this.grid,
                ddel: this.ddel,
                rowIndex: d,
                selections: c.getSelections()
            }
        }
        return false
    }
});
Ext.override(Ext.DatePicker, {
    prevText: "",
    todayTip: "",
    nextText: "",
    monthYearText: "",
    minText: "",
    maxText: "",
    disabledDaysText: "",
    disabledDatesText: "",
    qInternational: true,
    initComponent: function() {
        this.monthNames = [_S.IEI_IDS_STRING1, _S.IEI_IDS_STRING2, _S.IEI_IDS_STRING3, _S.IEI_IDS_STRING4, _S.IEI_IDS_STRING5, _S.IEI_IDS_STRING6, _S.IEI_IDS_STRING7, _S.IEI_IDS_STRING8, _S.IEI_IDS_STRING9, _S.IEI_IDS_STRING10, _S.IEI_IDS_STRING11, _S.IEI_IDS_STRING12];
        this.todayText = _S.QTS_CALENDAR_TODAY;
        this.okText = "&#160;" + _S.OK + "&#160;";
        this.cancelText = _S.CANCEL;
        Ext.DatePicker.superclass.initComponent.call(this);
        this.value = this.value ? this.value.clearTime(true) : new Date().clearTime();
        this.addEvents("select");
        if (this.handler) {
            this.on("select", this.handler, this.scope || this)
        }
        this.initDisabledDays()
    },
    qInternationalFn: function(a) {
        a.monthNames = [_S.IEI_IDS_STRING1, _S.IEI_IDS_STRING2, _S.IEI_IDS_STRING3, _S.IEI_IDS_STRING4, _S.IEI_IDS_STRING5, _S.IEI_IDS_STRING6, _S.IEI_IDS_STRING7, _S.IEI_IDS_STRING8, _S.IEI_IDS_STRING9, _S.IEI_IDS_STRING10, _S.IEI_IDS_STRING11, _S.IEI_IDS_STRING12];
        if (a.todayBtn) {
            a.todayBtn.setText(_S.QTS_CALENDAR_TODAY)
        }
        a.okText = "&#160;" + _S.OK + "&#160;";
        a.cancelText = _S.CANCEL;
        a.update(a.value, true);
        Ext.fly(a.monthPicker.dom.firstChild).remove();
        a.createMonthPicker()
    }
});
Ext.override(Ext.Tip, {
    maxWidth: 680,
    shadow: false,
    floating: {
        shadow: false,
        shim: true,
        useDisplay: true,
        constrain: false
    },
    doAutoWidth: function(a) {
        a = a || 0;
        var b = this.body.getTextWidth();
        if (this.title) {
            b = Math.max(b, this.header.child("span").getTextWidth(this.title))
        }
        b += this.getFrameWidth() + (this.closable ? 20 : 0) + this.body.getPadding("lr") + a;
        if (Ext.isIE9 || Ext.isIE10 || Ext.isGecko || (Ext.isMac && Ext.isChrome)) {
            this.setWidth(b.constrain(this.minWidth, this.maxWidth) + 3)
        } else {
            this.setWidth(b.constrain(this.minWidth, this.maxWidth))
        }
        if (Ext.isIE7 && !this.repainted) {
            this.el.repaint();
            this.repainted = true
        }
    }
});
Ext.override(Ext.Button, {
    setText: function(a) {
        this.text = a;
        if (this.el) {
            this.btnEl.update(a || "&#160;");
            this.setButtonClass()
        }
        this.doAutoWidth();
        this.setTooltip(a);
        return this
    },
    initComponent: function() {
        if (this.menu) {
            if (Ext.isArray(this.menu)) {
                this.menu = {
                    items: this.menu
                }
            }
            if (Ext.isObject(this.menu)) {
                this.menu.ownerCt = this
            }
            this.menu = Ext.menu.MenuMgr.get(this.menu);
            this.menu.ownerCt = undefined
        }
        Ext.Button.superclass.initComponent.call(this);
        this.addEvents("click", "toggle", "mouseover", "mouseout", "menushow", "menuhide", "menutriggerover", "menutriggerout");
        if (Ext.isString(this.toggleGroup)) {
            this.enableToggle = true
        }
        if (Ext.isEmpty(this.tooltip)) {
            this.tooltip = this.text;
            if (Ext.isEmpty(this.qInternationalFn)) {
                this.qInternationalFn = function(a) {
                    if (Ext.isEmpty(a.qInternationalKey.text)) {
                        a.setTooltip(_S[a.qInternationalKey.text], true)
                    }
                }
            }
        }
    }
});
Ext.dd.DragTracker.override({
    onMouseMove: function(d, c) {
        var b = d.getXY(),
            a = this.startXY;
        this.lastXY = b;
        if (!this.active) {
            if (Math.abs(a[0] - b[0]) > this.tolerance || Math.abs(a[1] - b[1]) > this.tolerance) {
                this.triggerStart(d)
            } else {
                return
            }
        }
        this.fireEvent("mousemove", this, d);
        this.onDrag(d);
        this.fireEvent("drag", this, d)
    }
});
QNAP.QOS.CMP.STATE.ConfigProvider = Ext.extend(Ext.state.Provider, {
    constructor: function(a) {
        QNAP.QOS.CMP.STATE.ConfigProvider.superclass.constructor.call(this);
        this.state = this.readState()
    },
    set: function(a, b) {
        if (typeof b == "undefined" || b === null) {
            this.clear(a);
            return
        }
        this.svaeConfig(a, b);
        QNAP.QOS.CMP.STATE.ConfigProvider.superclass.set.call(this, a, b)
    },
    svaeConfig: function(a, b) {
        var c = {};
        c.func = "set";
        c["state_" + a] = Ext.encode(b);
        Ext.Ajax.request({
            url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + "userConfig.cgi"),
            params: c,
            method: "POST",
            success: function(d, e) {}
        })
    },
    clear: function(a) {
        this.svaeConfig(a, "");
        QNAP.QOS.CMP.STATE.ConfigProvider.superclass.clear.call(this, a)
    },
    readState: function() {
        var a = QNAP.QOS.user.state || {};
        Ext.iterate(a, function(b) {
            a[b] = Ext.decode(a[b])
        });
        return a
    }
});
Ext.override(Ext.form.ComboBox, {
    shadow: false,
    getRecord: function(c) {
        var b = this,
            a;
        a = b.store.find(b.valueField, c);
        return b.store.getAt(a)
    },
    onRender: function(b, a) {
        if (this.hiddenName && !Ext.isDefined(this.submitValue)) {
            this.submitValue = false
        }
        Ext.form.ComboBox.superclass.onRender.call(this, b, a);
        if (this.hiddenName) {
            this.hiddenField = this.el.insertSibling({
                tag: "input",
                type: "hidden",
                name: this.hiddenName,
                id: (this.hiddenId || Ext.id())
            }, "before", true)
        }
        if (Ext.isGecko) {
            this.el.dom.setAttribute("autocomplete", "off")
        }
        if (this.getEl().parent(".utility-window")) {
            this.listClass += " utility-combo-list"
        }
        if (!this.lazyInit) {
            this.initList()
        } else {
            this.on("focus", this.initList, this, {
                single: true
            })
        }
    },
    afterRender: function() {
        Ext.form.ComboBox.superclass.afterRender.call(this);
        this.on("expand", function(a) {
            a.wrap.addClass(a.listExpandCls)
        });
        this.on("collapse", function(a) {
            a.wrap.removeClass(a.listExpandCls)
        })
    },
    listExpandCls: "qts-list-expand",
    listAlign: ["tl-bl?", [-1, 0]]
});
Ext.override(Ext.LoadMask, {
    onBeforeLoad: function() {
        if (!this.disabled) {
            this.el.mask(this.msg, this.msgCls, this.maskCls)
        }
    }
});
Ext.override(Ext.Element, (function() {
    var f = document,
        c = "scrollLeft",
        e = "scrollTop",
        d = /^(scroll|resize|load|unload|abort|error)$/,
        b = /^(click|dblclick|mousedown|mouseup|mouseover|mouseout|contextmenu|mouseenter|mouseleave)$/,
        a = /^(focus|blur|select|change|reset|keypress|keydown|keyup)$/,
        h = /^on/;

    function g() {
        var i = f.documentElement,
            j = f.body;
        if (i && (i[e] || i[c])) {
            return [i[c], i[e]]
        } else {
            if (j) {
                return [j[c], j[e]]
            } else {
                return [0, 0]
            }
        }
    }
    return {
        fireEvent: Ext.isIE ? function(k, j) {
            var i;
            k = k.toLowerCase();
            if (!h.test(k)) {
                k = "on" + k
            }
            if (Ext.isFunction(j)) {
                i = document.createEventObject();
                j(i)
            } else {
                i = j
            }
            this.dom.fireEvent(k, i)
        } : function(m, l) {
            var k;
            m = m.toLowerCase();
            m.replace(h, "");
            if (b.test(m)) {
                var j = {};
                if (this.getBox) {
                    j = this.getBox()
                } else {
                    j.width = this.getWidth();
                    j.height = this.getHeight();
                    j.x = this.getX();
                    j.y = this.getY()
                }
                var i = j.x + j.width / 2,
                    n = j.y + j.height / 2;
                k = document.createEvent("MouseEvents");
                k.initMouseEvent(m, true, true, window, (m == "dblclick") ? 2 : 1, i, n, i, n, false, false, false, false, 0, null)
            } else {
                if (a.test(m)) {
                    k = document.createEvent("UIEvents");
                    k.initUIEvent(m, true, true, window, 0)
                } else {
                    if (d.test(m)) {
                        k = document.createEvent("HTMLEvents");
                        k.initEvent(m, true, true)
                    }
                }
            }
            if (k) {
                if (Ext.isFunction(l)) {
                    l(k)
                }
                this.dom.dispatchEvent(k)
            }
        },
        forwardMouseEvents: function(n) {
            var q = this,
                r, p, j, m = ["mousemove", "mousedown", "mouseup", "dblclick", "mousewheel"];
            q.on("mouseout", function() {
                if (j) {
                    Ext.fly(j).fireEvent("mouseout");
                    j = null
                }
            });
            for (var o = 0, k = m.length; o < k; o++) {
                this.on(m[o], function(A) {
                    var u = (Ext.isGecko) ? g() : [0, 0],
                        w = A.browserEvent,
                        i = Ext.num(w.pageX, w.clientX) - u[0],
                        B = Ext.num(w.pageY, w.clientY) - u[1],
                        z = w.type,
                        l;
                    if (!q.forwardingSuspended && q.isVisible()) {
                        A.stopPropagation();
                        q.forwardingSuspended = true;
                        q.hide();
                        l = Ext.get(document.elementFromPoint(i, B));
                        q.show();
                        if (!l) {
                            j.fireEvent("mouseout");
                            j = l;
                            delete q.forwardingSuspended;
                            return
                        }
                        if (l === j) {
                            if (z == "mouseup") {
                                l.fireEvent("click")
                            }
                        } else {
                            if (j) {
                                j.fireEvent("mouseout")
                            }
                            l.fireEvent("mouseover")
                        }
                        if (z !== "mousemove") {
                            if (l.dom.fireEvent) {
                                l.fireEvent(z, w)
                            } else {
                                A = document.createEvent("MouseEvents");
                                A.initMouseEvent(z, true, true, window, w.detail, w.screenX, w.screenY, w.clientX, w.clientY, w.ctrlKey, w.altKey, w.shiftKey, w.metaKey, w.button, null);
                                l.dom.dispatchEvent(A)
                            }
                        }
                        j = l;
                        delete q.forwardingSuspended
                    }
                })
            }
        }
    }
})());
QNAP.lib.triCheckbox = Ext.extend(Ext.form.Field, {
    values: [0, 1, 2],
    imgCls: ["checkbox-untick", "checkbox-ticked", "checkbox-skip"],
    boxLabel: false,
    triMode: true,
    defaultAutoCreate: {
        tag: "input",
        type: "hidden",
        autocomplete: "off"
    },
    constructor: function(a) {
        QNAP.lib.triCheckbox.superclass.constructor.call(this, Ext.apply(this, a));
        if (a.value) {
            this.setValue(a.value)
        } else {
            this.setValue(this.values[0])
        }
    },
    onRender: function(c, d) {
        QNAP.lib.triCheckbox.superclass.onRender.call(this, c, d);
        this.wrap = this.el.wrap({
            cls: "x-form-check-wrap qts-tricheckbox",
            style: "width:120px;float:left;"
        });
        this.checkbox = this.wrap.createChild({
            tag: "img",
            src: Ext.BLANK_IMAGE_URL,
            cls: this.imgCls[0]
        }, this.el);
        if (this.boxLabel) {
            this.wrap.createChild({
                tag: "label",
                htmlFor: this.el.id,
                cls: "x-form-cb-label",
                html: this.boxLabel
            })
        }
        this.updateCheckboxCls()
    },
    setValue: function(a) {
        if (this.rendered) {
            this.checkbox.replaceClass(this.getCurrentCls(this.getValue()), this.imgCls[this.getIndex(a)])
        }
        QNAP.lib.triCheckbox.superclass.setValue.call(this, a)
    },
    updateCheckboxCls: function() {
        if (this.rendered) {
            this.checkbox.replaceClass(this.getCurrentCls(this.getValue()), this.imgCls[this.getIndex(this.value)])
        }
    },
    enableTriMode: function(a) {
        if (a) {
            this.triMode = true
        } else {
            this.triMode = false
        }
    },
    initEvents: function() {
        this.wrap.on("click", this.onClick, this)
    },
    onClick: function() {
        if (this.readOnly) {
            return true
        }
        var b = this.values.length,
            a = 0;
        if (!this.triMode) {
            b--
        }
        a = (this.getIndex(this.getValue()) + 1) % b;
        this.checkbox.replaceClass(this.getCurrentCls(this.getValue()), this.imgCls[a]);
        this.setValue(this.values[a]);
        this.fireEvent("click", this)
    },
    getIndex: function(b) {
        var c = 0,
            a = this.values.length;
        for (c = 0; c < a; c++) {
            if (b == this.values[c]) {
                return c
            }
        }
        return 0
    },
    getCurrentCls: function(b) {
        var c = 0,
            a = this.values.length;
        for (c = 0; c < a; c++) {
            if (b == this.values[c]) {
                return this.imgCls[c]
            }
        }
        this.setValue(this.values[0]);
        return this.imgCls[this.getValue()]
    }
});
Ext.reg("tricb", QNAP.lib.triCheckbox);
Ext.override(Ext.layout.MenuLayout, {
    doAutoSize: function() {
        var c = this.container,
            a = c.width;
        if (c.floating) {
            if (a) {
                c.setWidth(a)
            } else {
                if (Ext.isIE && !Ext.isIE10) {
                    c.setWidth(Ext.isStrict && (Ext.isIE7 || Ext.isIE8 || Ext.isIE9) ? "auto" : c.minWidth);
                    var d = c.getEl(),
                        b = d.dom.offsetWidth;
                    c.setWidth(c.getLayoutTarget().getWidth() + d.getFrameWidth("lr"))
                }
            }
        }
    }
});
Ext.override(Ext.form.DateField, {
    maxValue: "12/31/2037"
});
Ext.override(Ext.DatePicker, {
    maxDate: Date.parseDate("12/31/2037", "m/d/Y")
});
Ext.override(Ext.grid.GridPanel, {
    allowSelectText: false,
    onRender: function(d, a) {
        if (this.allowSelectText === true) {
            var e = new Ext.Template('<td class="x-grid3-col x-grid3-cell x-grid3-td-{id} {css}" style="{style}" tabIndex="0" {cellAttr}>', '<div class="x-grid3-cell-inner allow-select x-grid3-col-{id} " {attr}>{value}</div>', "</td>");
            if (this.viewConfig) {
                this.viewConfig.cellTpl = e
            } else {
                if (this.view) {
                    this.view.cellTpl = e
                }
            }
            this.addClass("allow-select")
        }
        Ext.grid.GridPanel.superclass.onRender.apply(this, arguments);
        this.addEvents({
            rowmouseup: true
        });
        var f = this.getGridEl();
        this.el.addClass("x-grid-panel");
        this.mon(f, {
            scope: this,
            mousedown: this.onMouseDown,
            mouseup: this.onMouseUp,
            click: this.onClick,
            dblclick: this.onDblClick,
            contextmenu: this.onContextMenu
        });
        this.relayEvents(f, ["mousedown", "mouseup", "mouseover", "mouseout", "keypress", "keydown"]);
        var b = this.getView();
        b.init(this);
        b.render();
        this.getSelectionModel().init(this);
        this.on("resize", this.remask, null)
    },
    onMouseUp: function(a) {
        this.processEvent("mouseup", a)
    },
    remask: function() {
        if (!this.isVisible()) {
            return true
        }
        var a = this.loadMask;
        if (a && a.el && a.el.isMasked()) {
            a.onBeforeLoad()
        }
    }
});
Ext.override(Ext.grid.Column, {
    constructor: function(b) {
        Ext.apply(this, b);
        if (Ext.isString(this.renderer)) {
            this.renderer = Ext.util.Format[this.renderer]
        } else {
            if (Ext.isObject(this.renderer)) {
                this.scope = this.renderer.scope;
                this.renderer = this.renderer.fn
            }
        }
        if (!this.scope) {
            this.scope = this
        }
        var a = this.editor;
        delete this.editor;
        this.setEditor(a);
        this.addEvents("click", "contextmenu", "dblclick", "mousedown", "mouseup");
        Ext.grid.Column.superclass.constructor.call(this)
    },
    processEvent: function(b, d, c, f, a) {
        return this.fireEvent(b, this, c, f, d)
    }
});
Ext.override(Ext.form.TimeField, {
    getErrors: function(e) {
        var g = Ext.form.DateField.superclass.getErrors.apply(this, arguments);
        e = this.formatDate(e || this.processValue(this.getRawValue()));
        if (e.length < 1) {
            return g
        }
        var c = e;
        e = this.parseDate(e);
        if (!e) {
            g.push(String.format(this.invalidText, c, this.format));
            return g
        }
        var f = e.getTime();
        if (this.minValue && f < this.minValue.getTime()) {
            g.push(String.format(this.minText, this.formatDate(this.minValue)))
        }
        if (this.maxValue && f > this.maxValue.getTime()) {
            g.push(String.format(this.maxText, this.formatDate(this.maxValue)))
        }
        if (this.disabledDays) {
            var a = e.getDay();
            for (var b = 0; b < this.disabledDays.length; b++) {
                if (a === this.disabledDays[b]) {
                    g.push(this.disabledDaysText);
                    break
                }
            }
        }
        var d = this.formatDate(e);
        if (this.disabledDatesRE && this.disabledDatesRE.test(d)) {
            g.push(String.format(this.disabledDatesText, d))
        }
        return g
    }
});
Ext.override(Ext.form.NumberField, {
    autoStripChars: true
});
Ext.util.TaskRunner = function(e) {
    e = e || 1000;
    var f = [],
        a = [],
        b = 0,
        g = false,
        d = function() {
            g = false;
            clearInterval(b);
            b = 0
        },
        h = function() {
            if (!g) {
                g = true;
                b = setInterval(i, e)
            }
        },
        c = function(j) {
            a.push(j);
            if (j.onStop) {
                j.onStop.apply(j.scope || j)
            }
        },
        i = function() {
            var l = a.length,
                n = new Date().getTime();
            if (l > 0) {
                for (var p = 0; p < l; p++) {
                    f.remove(a[p])
                }
                a = [];
                if (f.length < 1) {
                    d();
                    return
                }
            }
            for (var p = 0, o, k, m, j = f.length; p < j; ++p) {
                o = f[p];
                k = n - o.taskRunTime;
                if (o.interval <= k) {
                    try {
                        m = o.run.apply(o.scope || o, o.args || [++o.taskRunCount])
                    } catch (q) {
                        console.error(q.stack);
                        continue
                    }
                    o.taskRunTime = n;
                    if (m === false || o.taskRunCount === o.repeat) {
                        c(o);
                        return
                    }
                }
                if (o.duration && o.duration <= (n - o.taskStartTime)) {
                    c(o)
                }
            }
        };
    this.start = function(j) {
        f.push(j);
        j.taskStartTime = new Date().getTime();
        j.taskRunTime = 0;
        j.taskRunCount = 0;
        h();
        return j
    };
    this.stop = function(j) {
        c(j);
        return j
    };
    this.stopAll = function() {
        d();
        for (var k = 0, j = f.length; k < j; k++) {
            if (f[k].onStop) {
                f[k].onStop()
            }
        }
        f = [];
        a = []
    };
    this.getTasks = function() {
        return f
    }
};
delete Ext.TaskMgr;
Ext.TaskMgr = new Ext.util.TaskRunner();
Ext.override(Ext.data.HttpProxy, {
    doRequest: function(d, e, c, f, b, h, i) {
        this.activeRequestOption = this.activeRequestOption || {};
        var g;
        var a = {
            method: (this.api[d]) ? this.api[d]["method"] : undefined,
            request: {
                callback: b,
                scope: h,
                arg: i
            },
            reader: f,
            callback: this.createCallback(d, e),
            scope: this
        };
        if (c.jsonData) {
            a.jsonData = c.jsonData
        } else {
            if (c.xmlData) {
                a.xmlData = c.xmlData
            } else {
                a.params = c || {}
            }
        }
        this.conn.url = this.buildUrl(d, e);
        if (this.useAjax) {
            Ext.applyIf(a, this.conn);
            if (d == Ext.data.Api.actions.read && this.activeRequest[d]) {
                Ext.Ajax.abort(this.activeRequest[d]);
                g = this.activeRequestOption[d];
                g.request.callback.call(g.request.scope, null, g.request.arg, false)
            }
            this.activeRequest[d] = Ext.Ajax.request(a);
            this.activeRequestOption[d] = a
        } else {
            this.conn.request(a)
        }
        this.conn.url = null
    }
});
Ext.apply(Ext.dd.DragDropMgr, {
    byZIndex: function(b, a) {
        return b.zIndex < a.zIndex
    },
    getZIndex: function(b) {
        var a = document.body,
            c, d = -1;
        b = Ext.getDom(b);
        while (b !== a) {
            if (!isNaN(c = Number(Ext.fly(b).getStyle("zIndex")))) {
                d = c
            }
            b = b.parentNode
        }
        return d
    },
    fireEvents: function(m, p) {
        var o = this,
            j = o.dragCurrent,
            q = m.getPoint(),
            b, s, d = [],
            a = [],
            f = [],
            k = [],
            h = [],
            c = [],
            n, g, l, r;
        if (!j || j.isLocked()) {
            return
        }
        for (g in o.dragOvers) {
            b = o.dragOvers[g];
            if (!o.isTypeOfDD(b)) {
                continue
            }
            if (!this.isOverTarget(q, b, o.mode)) {
                f.push(b)
            }
            a[g] = true;
            delete o.dragOvers[g]
        }
        for (r in j.groups) {
            if ("string" != typeof r) {
                continue
            }
            for (g in o.ids[r]) {
                b = o.ids[r][g];
                if (!Ext.fly(b.id)) {
                    delete o.ids[r][g];
                    continue
                }
                if (o.isTypeOfDD(b) && (s = b.getEl()) && (b.isTarget) && (!b.isLocked()) && ((b != j) || (j.ignoreSelf === false))) {
                    if ((b.zIndex = o.getZIndex(s)) !== -1) {
                        n = true
                    }
                    d.push(b)
                }
            }
        }
        if (n) {
            d.sort(o.byZIndex)
        }
        for (g = 0, l = d.length; g < l; g++) {
            b = d[g];
            if (o.isOverTarget(q, b, o.mode)) {
                if (p) {
                    h.push(b)
                } else {
                    if (!a[b.id]) {
                        c.push(b)
                    } else {
                        k.push(b)
                    }
                    o.dragOvers[b.id] = b
                }
                if (!o.notifyOccluded) {
                    break
                }
            }
        }
        if (o.mode) {
            if (f.length) {
                j.b4DragOut(m, f);
                j.onDragOut(m, f)
            }
            if (c.length) {
                j.onDragEnter(m, c)
            }
            if (k.length) {
                j.b4DragOver(m, k);
                j.onDragOver(m, k)
            }
            if (h.length) {
                j.b4DragDrop(m, h);
                j.onDragDrop(m, h)
            }
        } else {
            for (g = 0, l = f.length; g < l; ++g) {
                j.b4DragOut(m, f[g].id);
                j.onDragOut(m, f[g].id)
            }
            for (g = 0, l = c.length; g < l; ++g) {
                j.onDragEnter(m, c[g].id)
            }
            for (g = 0, l = k.length; g < l; ++g) {
                j.b4DragOver(m, k[g].id);
                j.onDragOver(m, k[g].id)
            }
            for (g = 0, l = h.length; g < l; ++g) {
                j.b4DragDrop(m, h[g].id);
                j.onDragDrop(m, h[g].id)
            }
        }
        if (p && !h.length) {
            j.onInvalidDrop(m)
        }
    }
});
Ext.override(Ext.menu.Item, {
    onRender: function(d, b) {
        if (Ext.isEmpty(this.iconCls)) {
            this.itemCls += " x-menu-item--no-icon"
        }
        if (!this.itemTpl) {
            this.itemTpl = Ext.menu.Item.prototype.itemTpl = new Ext.XTemplate('<a id="{id}" class="{cls} x-unselectable" hidefocus="true" unselectable="on" href="{href}"', '<tpl if="hrefTarget">', ' target="{hrefTarget}"', "</tpl>", ">", '<img src="{Ext.BLANK_IMAGE_URL}" class="q-menu-item-sataus-icon "/><img alt="{altText}" src="{icon}" class="x-menu-item-icon {iconCls}"/>', '<span class="x-menu-item-text">{text}</span>', "</a>")
        }
        var c = this.getTemplateArgs();
        this.el = b ? this.itemTpl.insertBefore(b, c, true) : this.itemTpl.append(d, c, true);
        this.iconEl = this.el.child("img.x-menu-item-icon");
        this.textEl = this.el.child(".x-menu-item-text");
        if (!this.href) {
            this.mon(this.el, "click", Ext.emptyFn, null, {
                preventDefault: true
            })
        }
        Ext.menu.Item.superclass.onRender.call(this, d, b)
    },
    setIconClass: function(a) {
        var b = this.iconCls;
        this.iconCls = a;
        if (this.rendered) {
            this.iconEl.replaceClass(b, this.iconCls);
            if (this.iconCls === "") {
                this.el.addClass("x-menu-item--no-icon")
            } else {
                this.el.removeClass("x-menu-item--no-icon")
            }
        }
    },
    initComponent: function() {
        Ext.menu.Item.superclass.initComponent.call(this);
        if (this.menu) {
            if (Ext.isArray(this.menu)) {
                this.menu = {
                    items: this.menu
                }
            }
            if (Ext.isObject(this.menu)) {
                this.menu.ownerCt = this
            }
            this.menu = Ext.menu.MenuMgr.get(this.menu);
            this.menu.ownerCt = undefined;
            this.mon(this.menu, "show", function() {
                if (this.container) {
                    this.container.addClass("x-menu-item-expand")
                }
            }, this);
            this.mon(this.menu, "hide", function() {
                if (this.container) {
                    this.container.removeClass("x-menu-item-expand")
                }
            }, this)
        }
    }
});
Ext.override(Ext.menu.BaseItem, {
    ctOverCls: "x-menu-item-over",
    afterRender: function(a) {
        if (a) {
            a.addClassOnOver(this.ctOverCls)
        }
    }
});
QNAP.CMP.QCheckBox = Ext.extend(Ext.form.Checkbox, {
    afterRender: function(a) {
        QNAP.CMP.QCheckBox.superclass.afterRender.call(this, a);
        this.wrap.addClass("qts-checkbox");
        this.checkImg = this.el.insertHtml("afterEnd", '<span class="checkbox-img" > </span>', true);
        this.checkImg.on("click", this.onImgClick, this)
    },
    onImgClick: function() {
        if (this.disabled) {
            return
        }
        this.setValue(!this.getValue())
    }
});
Ext.reg("qtscheckbox", QNAP.CMP.QCheckBox);
Ext.override(Ext.menu.Menu, {
    shadow: false,
    render: function(b, a) {
        var c = "qnap-menu-v2 qnap-block--white";
        this.cls = this.cls ? this.cls + " " + c : c;
        this.cls = Ext.unique(this.cls.split(" ")).join(" ");
        Ext.menu.Menu.superclass.render.call(this, b, a)
    },
    afterRender: function() {
        Ext.menu.Menu.superclass.afterRender.call(this);
        var a = this.getEl();
        if (Ext.isMac) {
            a.on("wheel", this.onWheel, this, {
                normalized: false,
                buffer: {
                    delay: 100,
                    throttle: 100
                }
            })
        } else {
            if (Ext.isIE) {
                a.on("mousewheel", this.onIEWheel, this, {
                    normalized: false,
                    buffer: {
                        delay: 100,
                        throttle: 100
                    }
                })
            } else {
                if (Ext.isGecko) {
                    a.on("wheel", this.onFFWheel, this, {
                        normalized: false,
                        buffer: {
                            delay: 100,
                            throttle: 100
                        }
                    })
                } else {
                    a.on("wheel", this.onWheel, this, {
                        normalized: false,
                        buffer: {
                            delay: 100,
                            throttle: 100
                        }
                    })
                }
            }
        }
    },
    onIEWheel: function(a) {
        this._onWheel(a.deltaY > 0)
    },
    onFFWheel: function(a) {
        this._onWheel(a.deltaY < 0)
    },
    onWheel: function(a) {
        this._onWheel(a.deltaY < 0)
    },
    _onWheel: function(a) {
        var b = this.ul.dom;
        b.scrollTop += this.scrollIncrement * (a ? -1 : 1)
    }
});
Ext.override(Ext.Panel, {
    shadow: false
});
Ext.override(Ext.form.FieldSet, {
    shadow: false
});
if (!Ext.ComponentMgr.isRegistered("iconcombo")) {
    Ext.ux.IconCombo = Ext.extend(Ext.form.ComboBox, {
        initComponent: function() {
            Ext.apply(this, {
                tpl: '<tpl for="."><div class="x-combo-list-item ux-icon-combo-item {' + this.iconClsField + '}">{' + this.displayField + "}</div></tpl>"
            });
            Ext.ux.IconCombo.superclass.initComponent.call(this);
            this.on("afterrender", this.setIconCls, this, {
                single: true
            })
        },
        onRender: function(b, a) {
            Ext.ux.IconCombo.superclass.onRender.call(this, b, a);
            this.wrap.applyStyles({
                position: "relative"
            });
            this.el.addClass("ux-icon-combo-input");
            this.icon = Ext.DomHelper.append(this.el.up("div.x-form-field-wrap"), {
                tag: "div",
                cls: "ux-icon-combo-icon ux-mail-other",
                style: "position:absolute"
            })
        },
        setIconCls: function() {
            var a = this.store.query(this.valueField, this.getValue()).itemAt(0);
            if (a && this.icon) {
                this.icon.className = "ux-icon-combo-icon " + a.get(this.iconClsField)
            }
        },
        setValue: function(a) {
            Ext.ux.IconCombo.superclass.setValue.call(this, a);
            this.setIconCls()
        }
    });
    Ext.reg("iconcombo", Ext.ux.IconCombo)
}
Ext.override(Ext.form.TextField, {
    initComponent: function() {
        this.blankText = "FTP_STR41";
        Ext.form.TextField.superclass.initComponent.call(this);
        this.addEvents("autosize", "keydown", "keyup", "keypress");
        if (this.emptyText) {
            this.emptyText = this.emptyText + "\t"
        }
    },
    afterRender: function() {
        Ext.form.Field.superclass.afterRender.call(this);
        this.initEvents();
        this.initValue();
        if (this.el.dom.type === "password") {
            this.el.set({
                autocomplete: "off"
            })
        }
    }
});
Ext.layout.QTSFormLayout = Ext.extend(Ext.layout.FormLayout, {
    type: "qts-form",
    labelWidth: 130,
    labelPad: 10,
    labelAlign: "left",
    setContainer: function(a) {
        Ext.layout.FormLayout.superclass.setContainer.call(this, a);
        a.labelAlign = a.labelAlign || this.labelAlign;
        a.addClass("qts-form");
        if (a.labelAlign) {
            a.addClass("x-form-label-" + a.labelAlign)
        }
        if (a.hideLabels || this.hideLabels) {
            Ext.apply(this, {
                labelStyle: "display:none",
                elementStyle: "padding-left:0;",
                labelAdjust: 0
            })
        } else {
            this.labelSeparator = Ext.isDefined(a.labelSeparator) ? a.labelSeparator : this.labelSeparator;
            a.labelWidth = a.labelWidth || this.labelWidth || 100;
            if (Ext.isNumber(a.labelWidth)) {
                var b = a.labelPad || this.labelPad;
                b = Ext.isNumber(b) ? b : 5;
                Ext.apply(this, {
                    labelAdjust: a.labelWidth + b,
                    labelStyle: "width:" + a.labelWidth + "px;",
                    elementStyle: "padding-left:" + (a.labelWidth + b) + "px"
                })
            }
            if (a.labelAlign == "top") {
                Ext.apply(this, {
                    labelStyle: "width:auto;",
                    labelAdjust: 0,
                    elementStyle: "padding-left:0;"
                })
            }
        }
    },
    getTemplateArgs: function(c) {
        var a = !c.fieldLabel || c.hideLabel,
            b = (c.itemCls || this.container.itemCls || "") + (c.hideLabel ? " x-hide-label" : "");
        if (Ext.isIE9 && Ext.isIEQuirks && c instanceof Ext.form.TextField) {
            b += " x-input-wrapper"
        }
        if (c.isSubItem) {
            b += " x-form-sub-item"
        }
        return {
            id: c.id,
            label: c.fieldLabel,
            itemCls: b,
            clearCls: c.clearCls || "x-form-clear-left",
            labelStyle: this.getLabelStyle(c.labelStyle),
            elementStyle: this.elementStyle || "",
            labelSeparator: a ? "" : (Ext.isDefined(c.labelSeparator) ? c.labelSeparator : this.labelSeparator)
        }
    }
});
Ext.Container.LAYOUTS["qts-form"] = Ext.layout.QTSFormLayout;
Ext.Container.LAYOUTS.qtsform = Ext.layout.QTSFormLayout;
QNAP.CMP.QButton = Ext.extend(Ext.Button, {
    template: new Ext.Template('<table id="{4}" cellspacing="0" class="x-btn qts-button {3}"><tbody class="{1}">', '<tr><td class="x-btn-tl"></td><td class="x-btn-tc"></td><td class="x-btn-tr"></td></tr>', '<tr><td class="x-btn-ml"></td><td class="x-btn-mc"><em class="{2} x-unselectable" unselectable="on"><button type="{0}"></button></em></td><td class="x-btn-mr"></td></tr>', '<tr><td class="x-btn-bl"></td><td class="x-btn-bc"></td><td class="x-btn-br"></td></tr>', "</tbody></table>").compile()
});
Ext.reg("qtsbutton", QNAP.CMP.QButton);
QNAP.CMP.QRadio = Ext.extend(Ext.form.Radio, {
    afterRender: function(a) {
        QNAP.CMP.QRadio.superclass.afterRender.call(this, a);
        this.wrap.addClass("qts-radio");
        this.checkImg = this.el.insertHtml("afterEnd", '<span class="radio-img" > </span>', true);
        this.checkImg.on("click", this.onImgClick, this)
    },
    onImgClick: function() {
        if (this.disabled) {
            return
        }
        this.setValue(true)
    }
});
Ext.reg("qtsradio", QNAP.CMP.QRadio);
Ext.ux.qnapDatePicker = Ext.extend(Ext.DatePicker, {
    qnapSelectDateButton: false,
    qnapSelectDateTip: null,
    initComponent: function() {
        var a = this;
        Ext.ux.qnapDatePicker.superclass.initComponent.call(this);
        a.addClass("qnapDatePicker");
        a.on("afterrender", a.onAfterRender, a)
    },
    qnapHandleDateClickJustSelectFn: function(b, a) {
        b.stopEvent();
        if (!this.disabled && a.dateValue && !Ext.fly(a.parentNode).hasClass("x-date-disabled")) {
            this.cancelFocus = this.focusOnSelect === false;
            this.setValue(new Date(a.dateValue));
            this.update(this.getValue())
        }
    },
    qnapSelectDateFn: function() {
        delete this.cancelFocus;
        this.fireEvent("select", this, this.value)
    },
    onRender: function(e, b) {
        var a = ['<table cellspacing="0">', '<tr><td class="yearMonthArea" colspan="3">', '<table cellspacing="0">', '<tr><td class="x-date-left"><a href="#" title="', this.prevText, '">&#160;</a></td><td class="x-date-middle" align="center"></td><td class="x-date-right"><a href="#" title="', this.nextText, '">&#160;</a></td></tr>', "</table>", "</td></tr>", '<tr><td colspan="3"><table class="x-date-inner" cellspacing="0"><thead><tr>'];
        var c = this.dayNames;
        for (var g = 0; g < 7; g++) {
            var j = this.startDay + g;
            if (j > 6) {
                j = j - 7
            }
            a.push("<th><span>", c[j].substr(0, 3) + ".", "</span></th>")
        }
        a[a.length] = "</tr></thead><tbody><tr>";
        for (var g = 0; g < 42; g++) {
            if (g % 7 == 0 && g != 0) {
                a[a.length] = "</tr><tr>"
            }
            a[a.length] = '<td><div class="qnap_x-date-radius"><a href="#" hidefocus="on" class="x-date-date" tabIndex="1"><em><span></span></em></a></div></td>'
        }
        a.push("</tr></tbody></table></td></tr>", (this.showToday || this.qnapSelectDateButton) ? '<tr><td colspan="3" class="x-date-bottom" align="center"></td></tr>' : "", '</table><div class="x-date-mp"></div>');
        var h = document.createElement("div");
        h.className = "x-date-picker";
        h.innerHTML = a.join("");
        e.dom.insertBefore(h, b);
        this.el = Ext.get(h);
        this.eventEl = Ext.get(h.firstChild);
        this.prevRepeater = new Ext.util.ClickRepeater(this.el.child("td.x-date-left a"), {
            handler: this.showPrevMonth,
            scope: this,
            preventDefault: true,
            stopDefault: true
        });
        this.nextRepeater = new Ext.util.ClickRepeater(this.el.child("td.x-date-right a"), {
            handler: this.showNextMonth,
            scope: this,
            preventDefault: true,
            stopDefault: true
        });
        this.monthPicker = this.el.down("div.x-date-mp");
        this.monthPicker.enableDisplayMode("block");
        this.keyNav = new Ext.KeyNav(this.eventEl, {
            left: function(d) {
                if (d.ctrlKey) {
                    this.showPrevMonth()
                } else {
                    this.update(this.activeDate.add("d", -1))
                }
            },
            right: function(d) {
                if (d.ctrlKey) {
                    this.showNextMonth()
                } else {
                    this.update(this.activeDate.add("d", 1))
                }
            },
            up: function(d) {
                if (d.ctrlKey) {
                    this.showNextYear()
                } else {
                    this.update(this.activeDate.add("d", -7))
                }
            },
            down: function(d) {
                if (d.ctrlKey) {
                    this.showPrevYear()
                } else {
                    this.update(this.activeDate.add("d", 7))
                }
            },
            pageUp: function(d) {
                this.showNextMonth()
            },
            pageDown: function(d) {
                this.showPrevMonth()
            },
            enter: function(d) {
                d.stopPropagation();
                return true
            },
            scope: this
        });
        this.el.unselectable();
        this.cells = this.el.select("table.x-date-inner tbody td");
        this.textNodes = this.el.query("table.x-date-inner tbody span");
        this.mbtn = new Ext.Button({
            text: "&#160;",
            cls: "btn_remove3px",
            tooltip: this.monthYearText,
            renderTo: this.el.child("td.x-date-middle", true)
        });
        if (this.showToday || this.qnapSelectDateButton) {
            if (this.showToday && !this.qnapSelectDateButton) {
                this.todayKeyListener = this.eventEl.addKeyListener(Ext.EventObject.SPACE, this.selectToday, this);
                var f = (new Date()).dateFormat(this.format);
                this.todayBtn = new Ext.Button({
                    renderTo: this.el.child("td.x-date-bottom", true),
                    handler: this.selectToday,
                    text: _S.QTS_CALENDAR_TODAY,
                    qInternational: true,
                    qInternationalKey: "QTS_CALENDAR_TODAY",
                    tooltip: "QTS_CALENDAR_TODAY",
                    cls: "qnapSelectDateButton btn_remove3px",
                    scope: this
                });
                this.el.child("td.x-date-bottom").on("click", this.selectToday, this)
            } else {
                if (this.qnapSelectDateButton) {
                    this.todayKeyListener = this.eventEl.addKeyListener(Ext.EventObject.SPACE, this.qnapSelectDateFn, this);
                    this.todayBtn = new Ext.Button({
                        renderTo: this.el.child("td.x-date-bottom", true),
                        text: _S.QTS_CALENDAR_TODAY,
                        qInternational: true,
                        qInternationalKey: "QTS_CALENDAR_TODAY",
                        tooltip: this.qnapSelectDateTip,
                        cls: "qnapSelectDateButton btn_remove3px",
                        handler: this.qnapSelectDateFn,
                        scope: this
                    })
                }
            }
        }
        this.mon(this.eventEl, "mousewheel", this.handleMouseWheel, this);
        if (this.qnapSelectDateButton) {
            this.mon(this.eventEl, "click", this.qnapHandleDateClickJustSelectFn, this, {
                delegate: ".qnap_x-date-radius"
            })
        } else {
            this.mon(this.eventEl, "click", this.handleDateClick, this, {
                delegate: ".qnap_x-date-radius"
            })
        }
        this.mon(this.mbtn, "click", this.showMonthPicker, this);
        this.onEnable(true);
        if (Ext.isIE) {
            this.el.repaint()
        }
    },
    update: function(H, B) {
        var m = this;
        if (!this.rendered) {
            return
        }
        var a = this.activeDate,
            p = this.isVisible();
        this.activeDate = H;
        if (!B && a && this.el) {
            var o = H.getTime();
            if (a.getMonth() == H.getMonth() && a.getFullYear() == H.getFullYear()) {
                this.cells.removeClass("x-date-selected");
                this.cells.each(function(d) {
                    if (d.dom.firstChild.dateValue == o) {
                        if (o == m.getValue().getTime()) {
                            d.addClass("x-date-selected")
                        }
                        if (p && !this.cancelFocus) {
                            Ext.fly(d.dom.firstChild).focus(50)
                        }
                        return false
                    }
                }, this);
                return
            }
        }
        var j = H.getDaysInMonth(),
            q = H.getFirstDateOfMonth(),
            f = q.getDay() - this.startDay;
        if (f < 0) {
            f += 7
        }
        j += f;
        var C = H.add("mo", -1),
            g = C.getDaysInMonth() - f,
            e = this.cells.elements,
            r = this.textNodes,
            E = (new Date(C.getFullYear(), C.getMonth(), g, this.initHour)),
            D = new Date().clearTime().getTime(),
            x = H.clearTime(true).getTime(),
            u = this.minDate ? this.minDate.clearTime(true) : Number.NEGATIVE_INFINITY,
            z = this.maxDate ? this.maxDate.clearTime(true) : Number.POSITIVE_INFINITY,
            G = this.disabledDatesRE,
            s = this.disabledDatesText,
            J = this.disabledDays ? this.disabledDays.join("") : false,
            F = this.disabledDaysText,
            A = this.format;
        if (this.showToday || this.qnapSelectDateButton) {
            if (this.showToday && !this.qnapSelectDateButton) {
                var l = new Date().clearTime(),
                    c = (l < u || l > z || (G && A && G.test(l.dateFormat(A))) || (J && J.indexOf(l.getDay()) != -1));
                if (!this.disabled) {
                    this.todayBtn.setDisabled(c);
                    this.todayKeyListener[c ? "disable" : "enable"]()
                }
            }
        }
        var k = function(K, d) {
            d.title = "";
            var i = E.clearTime(true).getTime();
            d.firstChild.dateValue = i;
            if (i == D) {
                d.className += " x-date-today";
                d.title = K.todayText
            }
            if (i == x) {
                if (i == m.getValue().getTime()) {
                    d.className += " x-date-selected"
                }
                if (p) {
                    Ext.fly(d.firstChild).focus(50)
                }
            }
            if (i < u) {
                d.className = " x-date-disabled";
                d.title = K.minText;
                return
            }
            if (i > z) {
                d.className = " x-date-disabled";
                d.title = K.maxText;
                return
            }
            if (J) {
                if (J.indexOf(E.getDay()) != -1) {
                    d.title = F;
                    d.className = " x-date-disabled"
                }
            }
            if (G && A) {
                var w = E.dateFormat(A);
                if (G.test(w)) {
                    d.title = s.replace("%0", w);
                    d.className = " x-date-disabled"
                }
            }
        };
        var y = 0;
        for (; y < f; y++) {
            r[y].innerHTML = (++g);
            E.setDate(E.getDate() + 1);
            e[y].className = "x-date-prevday";
            k(this, e[y])
        }
        for (; y < j; y++) {
            var b = y - f + 1;
            r[y].innerHTML = (b);
            E.setDate(E.getDate() + 1);
            e[y].className = "x-date-active";
            k(this, e[y])
        }
        var I = 0;
        for (; y < 42; y++) {
            r[y].innerHTML = (++I);
            E.setDate(E.getDate() + 1);
            e[y].className = "x-date-nextday";
            k(this, e[y])
        }
        this.mbtn.setText('<div class="qnap_x_c_year">' + H.getFullYear() + '</div><div class="qnap_x_c_month">' + (H.getMonth() + 1) + " </div>");
        if (!this.internalRender) {
            var h = this.el.dom.firstChild,
                n = h.offsetWidth;
            this.el.setWidth(n + this.el.getBorderWidth("lr"));
            Ext.fly(h).setWidth("100%");
            this.internalRender = true;
            if (Ext.isOpera && !this.secondPass) {
                h.rows[0].cells[1].style.width = (n - (h.rows[0].cells[0].offsetWidth + h.rows[0].cells[2].offsetWidth)) + "px";
                this.secondPass = true;
                this.update.defer(10, this, [H])
            }
        }
    },
    onAfterRender: function(a) {
        a.el.dom.style.width = "230px"
    }
});
Ext.ux.qnapDateTimeItem = Ext.extend(Ext.menu.BaseItem, {
    canActivate: true,
    onRender: function(b, a) {
        this.component.render(b);
        this.el = this.component.getEl()
    },
    activate: function() {
        if (this.disabled) {
            return false
        }
        this.component.focus();
        this.fireEvent("activate", this);
        return true
    },
    deactivate: function() {
        this.fireEvent("deactivate", this)
    },
    disable: function() {
        this.component.disable();
        Ext.ux.qnapDateTimeItem.superclass.disable.call(this)
    },
    enable: function() {
        this.component.enable();
        Ext.ux.qnapDateTimeItem.superclass.enable.call(this)
    },
    onSelect: function(b, a) {
        this.fireEvent("select", this, a, b);
        if (this.parentMenu && this.parentMenu.hide) {
            Ext.ux.qnapDateTimeItem.superclass.handleClick.call(this)
        }
    },
    initComponent: function() {
        var a = this;
        Ext.ux.qnapDateTimeItem.superclass.initComponent.call(this);
        a.addClass("qnapDateTimeItem");
        a.component = new Ext.ux.qnapDatePicker();
        a.picker = this.component;
        a.addEvents({
            select: true
        });
        a.picker.on("render", function(b) {
            b.getEl().swallowEvent("click");
            b.container.addClass("x-menu-date-item")
        });
        a.picker.on("select", a.onSelect, a)
    }
});
Ext.ux.qnapDateTimeMenu = Ext.extend(Ext.menu.Menu, {
    initComponent: function() {
        var b = this;
        Ext.ux.qnapDateTimeMenu.superclass.initComponent.call(this);
        b.addClass("qnapDateTimeMenu");
        b.plain = true;
        var a = new Ext.ux.qnapDateTimeItem();
        b.add(a);
        b.picker = a.picker;
        b.relayEvents(a, ["select"])
    }
});
Ext.ux.qnapDateField = Ext.extend(Ext.form.DateField, {
    qnapSelectDateButton: true,
    qnapSelectDateTip: null,
    menuShowCls: "qts-date-menu-show",
    initComponent: function() {
        var a = this;
        Ext.ux.qnapDateField.superclass.initComponent.call(this);
        a.addClass("qnap_dateField")
    },
    onTriggerClick: function() {
        if (this.disabled) {
            return
        }
        if (this.menu == null) {
            this.menu = new Ext.ux.qnapDateTimeMenu({
                hideOnClick: false,
                focusOnSelect: false
            });
            this.menu.on({
                scope: this,
                show: function() {
                    this.wrap.addClass(this.menuShowCls)
                },
                hide: function() {
                    this.wrap.removeClass(this.menuShowCls)
                }
            })
        }
        this.onFocus();
        Ext.apply(this.menu.picker, {
            qnapSelectDateButton: this.qnapSelectDateButton,
            qnapSelectDateTip: this.qnapSelectDateTip,
            minDate: this.minValue,
            maxDate: this.maxValue,
            disabledDatesRE: this.disabledDatesRE,
            disabledDatesText: this.disabledDatesText,
            disabledDays: this.disabledDays,
            disabledDaysText: this.disabledDaysText,
            format: this.format,
            showToday: this.showToday,
            startDay: this.startDay,
            minText: String.format(this.minText, this.formatDate(this.minValue)),
            maxText: String.format(this.maxText, this.formatDate(this.maxValue))
        });
        this.menu.picker.setValue(this.getValue() || new Date());
        this.menu.show(this.el, "tl-bl?");
        this.menuEvents("on")
    },
});
Ext.reg("qtsdatefield", Ext.ux.qnapDateField);
QNAP.CMP.QCheckBoxGroup = Ext.extend(Ext.form.CheckboxGroup, {
    defaultType: "qtscheckbox"
});
Ext.reg("qtscheckboxgroup", QNAP.CMP.QCheckBoxGroup);
QNAP.CMP.QRadioGroup = Ext.extend(Ext.form.RadioGroup, {
    defaultType: "qtsradio"
});
Ext.reg("qtsradiogroup", QNAP.CMP.QRadioGroup);
Ext.override(Ext.Toolbar, {
    onRender: function(b, a) {
        if (!this.el) {
            if (!this.autoCreate) {
                this.autoCreate = {
                    cls: this.toolbarCls
                }
            }
            this.el = b.createChild(Ext.apply({
                id: this.id
            }, this.autoCreate), a);
            Ext.Toolbar.superclass.onRender.apply(this, arguments)
        }
    }
});
Ext.override(Ext.grid.EditorGridPanel, {
    startEditing: function(h, c) {
        this.stopEditing();
        if (this.colModel.isCellEditable(c, h)) {
            this.view.ensureVisible(h, c, true);
            var d = this.store.getAt(h),
                g = this.colModel.getDataIndex(c),
                f = {
                    grid: this,
                    record: d,
                    field: g,
                    value: d.data[g],
                    row: h,
                    column: c,
                    cancel: false
                };
            if (this.fireEvent("beforeedit", f) !== false && !f.cancel) {
                this.editing = true;
                var b = this.colModel.getCellEditor(c, h);
                if (!b) {
                    return
                }
                if (!b.rendered) {
                    b.parentEl = this.view.getEditorParent(b);
                    b.on({
                        scope: this,
                        render: {
                            fn: function(e) {
                                e.field.focus(false, true)
                            },
                            single: true,
                            scope: this
                        },
                        specialkey: function(j, i) {
                            this.getSelectionModel().onEditorKey(j, i)
                        },
                        show: this.view.qtsScrollBar.hide,
                        hide: this.view.qtsScrollBar.show,
                        complete: this.onEditComplete,
                        canceledit: this.stopEditing.createDelegate(this, [true])
                    })
                }
                Ext.apply(b, {
                    row: h,
                    col: c,
                    record: d
                });
                this.lastEdit = {
                    row: h,
                    col: c
                };
                this.activeEditor = b;
                if (b.field.isXType("checkbox")) {
                    b.allowBlur = false;
                    this.setupCheckbox(b.field)
                }
                b.selectSameEditor = (this.activeEditor == this.lastActiveEditor);
                var a = this.preEditValue(d, g);
                b.startEdit(this.view.getCell(h, c).firstChild, Ext.isDefined(a) ? a : "");
                (function() {
                    delete b.selectSameEditor
                }).defer(50)
            }
        }
    }
});
Ext.override(Ext.form.TextArea, {
    afterRender: function() {
        Ext.form.TextArea.superclass.afterRender.call(this);
        var a = this.getEl();
        this.qtsScrollBar = new QNAP.CMP.Plugin.QTSScrollBar({
            target: a
        });
        a.on("keyup", this.qtsScrollBar.updateSize);
        this.on("resize", this.qtsScrollBar.updateSize)
    }
});
Ext.override(Ext.form.TriggerField, {
    invalidWrapClass: "q-wrap-invalid",
    triggerClass: "x-form-arrow-trigger",
    onAdded: function(a, c) {
        Ext.form.TriggerField.superclass.onAdded.call(this, a, c);

        function b() {
            if (this.isVisible()) {
                this.onResize(this.width || this.wrap.getWidth())
            }
        }
        this.on("show", b, this);
        this.mon(a, "afterlayout", b, this)
    },
    onResize: function(a, d) {
        var b, c;
        if (a === 0) {
            return
        }
        Ext.form.TriggerField.superclass.onResize.call(this, a, d);
        b = this.getTriggerWidth();
        b += 2;
        if (Ext.isNumber(a)) {
            this.el.setWidth(a - b)
        }
        c = this.el.getWidth();
        if (c === 0) {
            return
        }
        this.wrap.setWidth(c + b)
    },
    onRender: function(c, a) {
        var b;
        this.doc = Ext.isIE ? Ext.getBody() : Ext.getDoc();
        Ext.form.TriggerField.superclass.onRender.call(this, c, a);
        this.wrap = this.el.wrap({
            cls: "x-form-field-wrap x-form-field-trigger-wrap"
        });
        this.trigger = this.wrap.createChild(this.triggerConfig || {
            tag: "img",
            src: Ext.BLANK_IMAGE_URL,
            alt: "",
            cls: "x-form-trigger " + this.triggerClass
        });
        this.initTrigger();
        if (this.hideTrigger) {
            this.el.addClass("q-form-field-trigger-hidden")
        }
        if (!this.width) {
            b = this.el.getWidth() + this.trigger.getWidth();
            if (b > 0) {
                this.wrap.setWidth(b)
            }
        }
        this.resizeEl = this.positionEl = this.wrap
    },
});
Ext.override(Ext.layout.FormLayout, {
    onFieldShow: function(a) {
        a.getItemCt().removeClass("x-hide-" + a.hideMode);
        if (a.isXType("trigger")) {
            a.onResize(a.width || a.wrap.getWidth())
        }
        if (a.isComposite) {
            if (a.rendered) {
                a.items.each(function(b) {
                    if (b.isXType("checkbox")) {
                        a.innerCt.layout.innerCt.setStyle("width", "auto");
                        return false
                    }
                })
            }
            a.doLayout()
        }
    }
});
QNAP.CMP.ColorField = Ext.extend(Ext.form.TriggerField, {
    colors: ["000000", "444444", "666666", "999999", "CCCCCC", "EEEEEE", "F8F8F8", "FFFFFF", "FF0000", "FF9900", "FFFF00", "00FF00", "00FFFF", "0000FF", "9900FF", "FF00FF", "F4CCCC", "FCE5CD", "FCF2CC", "D9EAD3", "D0E0E3", "CFE2F3", "D9D2E9", "EAD1DC", "EA9999", "F9CB9C", "FFE599", "B7D7A8", "A2C4C9", "9FC5E8", "B4A7D6", "D5A6BD", "E06666", "F6B26B", "FFD966", "93C47D", "76A5AF", "6FA8DC", "8E7CC3", "C27BA0", "CC0000", "E69138", "F1C232", "6AA84F", "45818E", "3D85C6", "674EA7", "A64D79", "990000", "B75F06", "BF9000", "38761D", "134F5C", "0B5394", "351C75", "741B47", "660000", "663F04", "7F6000", "274E13", "0C343D", "073763", "20124D", "4C1130"],
    onTriggerClick: function() {
        if (this.disabled) {
            return
        }
        if (this.menu == null) {
            var a, b;
            a = this.getValue() || "#FFFFFF";
            b = new Ext.menu.Item({
                text: a,
                cls: "q-color-code",
                listeners: {
                    valid: function(c) {
                        this.setText(c.getValue())
                    }
                }
            });
            this.menu = new Ext.menu.ColorMenu({
                cls: "q-color-menu",
                hideOnClick: false,
                focusOnSelect: false,
                value: a.replace("#", "")
            });
            this.menu.items.insert(0, b);
            b.parentMenu = this.menu;
            b.relayEvents(this, ["valid"])
        }
        this.onFocus();
        Ext.apply(this.menu.palette, {
            colors: this.colors
        });
        this.menu.show(this.el, "tl-bl?");
        this.menuEvents("on")
    },
    menuEvents: function(a) {
        this.menu[a]("select", this.onSelect, this);
        this.menu[a]("hide", this.onMenuHide, this);
        this.menu[a]("show", this.onFocus, this);
        this.menu[a]("mouseover", this.onMmouseover, this)
    },
    onSelect: function(a, b) {
        this.setValue("#" + b);
        this.fireEvent("select", this, b);
        this.menu.hide()
    },
    onMmouseover: function(d, c, b) {
        var a = c.getTarget("a[class^=color]", this.menu.el);
        if (a) {
            this.setValue(a.className.split(" ")[0].replace(/color-/i, "#"))
        }
    },
    onMenuHide: function() {
        this.focus(false, 60);
        this.menuEvents("un")
    },
    setValue: function(a) {
        QNAP.CMP.ColorField.superclass.setValue.apply(this, [a.toUpperCase()])
    }
});
Ext.reg("qcolorfield", QNAP.CMP.ColorField);
Ext.form.MessageTargets = {
    qtip: {
        mark: function(a, b) {
            a.el.addClass(a.invalidClass);
            a.el.dom.qtip = b;
            a.el.dom.qclass = "x-form-invalid-tip";
            if (a.wrap && a.invalidWrapClass) {
                a.wrap.addClass(a.invalidWrapClass)
            }
            if (Ext.QuickTips) {
                Ext.QuickTips.enable()
            }
        },
        clear: function(a) {
            a.el.removeClass(a.invalidClass);
            if (a.wrap && a.invalidWrapClass) {
                a.wrap.removeClass(a.invalidWrapClass)
            }
            a.el.dom.qtip = ""
        }
    }
};
QNAP.CMP.Plugin.SliderColorBg = function() {
    this.init = function(a) {
        a.onRender = this.onRender;
        a.moveThumb = this.moveThumb
    }
};
QNAP.CMP.Plugin.SliderColorBg.prototype.moveThumb = function(e, d, c) {
    var b = this.thumbs[e].el;
    var a = this.colorBgEl;
    if (!c || this.animate === false) {
        b.setLeft(d);
        a.setWidth(d)
    } else {
        b.shift({
            left: d,
            stopFx: true,
            duration: 0.35
        });
        a.shift({
            width: d,
            stopFx: true,
            duration: 0.35
        })
    }
};
QNAP.CMP.Plugin.SliderColorBg.prototype.onRender = function() {
    var a, c;
    a = this.vertical ? "position: absolute;" : "position: relative;";
    c = {
        cls: "q-slider-color-bg",
        style: a
    };
    if (this.processCls) {
        c.cls = [c.cls, this.colorBgCls].join(" ")
    }
    if (this.processStyle) {
        c.style = [c.style, this.colorBgStyle].join("")
    }
    this.autoEl = {
        cls: "x-slider q-color-slider " + (this.vertical ? "x-slider-vert" : "x-slider-horz"),
        cn: {
            cls: "x-slider-end",
            cn: {
                cls: "x-slider-inner",
                cn: [{
                    tag: "a",
                    cls: "x-slider-focus",
                    href: "#",
                    tabIndex: "-1",
                    hidefocus: "on"
                }, c]
            }
        }
    };
    Ext.slider.MultiSlider.superclass.onRender.apply(this, arguments);
    this.endEl = this.el.first();
    this.innerEl = this.endEl.first();
    this.focusEl = this.innerEl.child(".x-slider-focus");
    this.colorBgEl = this.innerEl.child(".q-slider-color-bg");
    for (var d = 0; d < this.thumbs.length; d++) {
        this.thumbs[d].render()
    }
    var b = this.innerEl.child(".x-slider-thumb");
    this.halfThumb = (this.vertical ? b.getHeight() : b.getWidth()) / 2;
    this.initEvents()
};
Ext.apply(Ext.Loader, {
    load: function(i, h, j, c) {
        var j = j || this,
            f = document.getElementsByTagName("head")[0],
            b = document.createDocumentFragment(),
            a = i.length,
            g = 0,
            e = this;
        var k = function(l) {
            f.appendChild(e.buildScriptTag(i[l], d))
        };
        var d = function() {
            g++;
            if (a == g && typeof h == "function") {
                h.call(j)
            } else {
                if (c === true) {
                    k(g)
                }
            }
        };
        if (c === true) {
            k.call(this, 0)
        } else {
            Ext.each(i, function(m, l) {
                b.appendChild(this.buildScriptTag(m, d))
            }, this);
            f.appendChild(b)
        }
    },
    buildScriptTag: function(b, c) {
        var a = document.createElement("script");
        a.type = "text/javascript";
        a.src = b;
        if (a.readyState) {
            a.onreadystatechange = function() {
                if (a.readyState == "loaded" || a.readyState == "complete") {
                    a.onreadystatechange = null;
                    c()
                }
            }
        } else {
            a.onload = c;
            a.onerror = c
        }
        return a
    }
});
QNAP.CMP.QTSFileTreePanel = Ext.extend(Ext.tree.TreePanel, {
    initComponent: function() {
        this.initTreeLoader();
        this.initRoot();
        this.initColumes();
        QNAP.CMP.QTSFileTreePanel.superclass.initComponent.call(this)
    },
    initTreeLoader: function() {
        var c = this.queryConfig;
        var b = {
            dir: "/",
            woRevDir: 1,
            inVol: 1,
            file_type: c.onlyFolder === false ? 1 : 0
        };
        if (Ext.isString(c.fileFilter)) {
            b.file_filter = c.fileFilter
        }
        var a = new Ext.tree.TreeLoader({
            dataUrl: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + "wizReq.cgi", {
                wiz_func: "get_local_dirs"
            }),
            baseParams: b,
            listeners: {
                load: function(l, h, k) {
                    var d, e, j, m;
                    d = [];
                    e = k.responseText.split(new RegExp(/<ul.+?>\s*<li .+?>\s*<a .+?>|<\/a><\/li><\/ul>/));
                    j = k.responseText.split(new RegExp(/<ul.+?>\s*<li .+?>\s*<a href="#" rel=\"|\">.+?<\/a><\/li><\/ul>/));
                    m = k.responseText.split(new RegExp(/<ul.+?>\s*<li class=\"|\">.+?<\/a><\/li><\/ul>/));
                    for (var g = 0; g < e.length; g++) {
                        if (!Ext.isEmpty(e[g])) {
                            var f = {};
                            f.text = e[g];
                            f.dir = j[g];
                            f.isFolder = m[g].indexOf("directory") >= 0;
                            f.leaf = !f.isFolder;
                            f.expandable = f.isFolder;
                            if (f.text.indexOf("<!--") === 0) {
                                continue
                            }
                            d.push(f)
                        }
                    }
                    h.appendChild(d)
                },
                beforeload: function(d, f, g) {
                    if (f.parentNode) {
                        d.baseParams.dir = QNAP.QOS.quickWizard.getNodeFullPath(f)
                    } else {
                        d.baseParams.dir = "/"
                    }
                    var e = new RegExp("^" + RegExp.escape(QNAP.QOS.config.hostname));
                    d.baseParams.dir = d.baseParams.dir.replace(e, "")
                }
            }
        });
        this.loader = a
    },
    initRoot: function() {
        this.root = new Ext.tree.AsyncTreeNode({
            text: QNAP.QOS.config.hostname,
            id: 0,
            dir: "/"
        })
    },
    initColumes: function() {
        this.columns = [{
            dataIndex: "text"
        }]
    },
    afterRender: function() {
        QNAP.CMP.QTSFileTreePanel.superclass.afterRender.call(this);
        this.scrollBar = new QNAP.CMP.Plugin.QTSScrollBar({
            target: this.el.child(".x-panel-body")
        });
        this.scrollBar.updateSize();
        this.on({
            expandnode: this.scrollBar.updateSize,
            collapsenode: this.scrollBar.updateSize,
            append: this.scrollBar.updateSize
        })
    }
});
Ext.override(Ext.ToolTip, {
    autoHide: false
});
QNAP.CMP.Plugin.SliderColorBg = function() {
    this.init = function(a) {
        a.onRender = this.onRender;
        a.moveThumb = this.moveThumb
    }
};
QNAP.CMP.Plugin.SliderColorBg.prototype.moveThumb = function(e, d, c) {
    var b = this.thumbs[e].el;
    var a = this.colorBgEl;
    if (!c || this.animate === false) {
        b.setLeft(d);
        a.setWidth(d)
    } else {
        b.shift({
            left: d,
            stopFx: true,
            duration: 0.35
        });
        a.shift({
            width: d,
            stopFx: true,
            duration: 0.35
        })
    }
};
QNAP.CMP.Plugin.SliderColorBg.prototype.onRender = function() {
    var a, c;
    a = this.vertical ? "position: absolute;" : "position: relative;";
    c = {
        cls: "q-slider-color-bg",
        style: a
    };
    if (this.processCls) {
        c.cls = [c.cls, this.colorBgCls].join(" ")
    }
    if (this.processStyle) {
        c.style = [c.style, this.colorBgStyle].join("")
    }
    this.autoEl = {
        cls: "x-slider q-color-slider " + (this.vertical ? "x-slider-vert" : "x-slider-horz"),
        cn: {
            cls: "x-slider-end",
            cn: {
                cls: "x-slider-inner",
                cn: [{
                    tag: "a",
                    cls: "x-slider-focus",
                    href: "#",
                    tabIndex: "-1",
                    hidefocus: "on"
                }, c]
            }
        }
    };
    Ext.slider.MultiSlider.superclass.onRender.apply(this, arguments);
    this.endEl = this.el.first();
    this.innerEl = this.endEl.first();
    this.focusEl = this.innerEl.child(".x-slider-focus");
    this.colorBgEl = this.innerEl.child(".q-slider-color-bg");
    for (var d = 0; d < this.thumbs.length; d++) {
        this.thumbs[d].render()
    }
    var b = this.innerEl.child(".x-slider-thumb");
    this.halfThumb = (this.vertical ? b.getHeight() : b.getWidth()) / 2;
    this.initEvents()
};
QNAP.CMP.SingleSlider = Ext.extend(Ext.slider.SingleSlider, {
    value: 0,
    btn_increment: 1,
    hidden_btn: false,
    thumb_value_display_mode: "tip",
    onRender: function() {
        this.autoEl = {
            tag: "div",
            cls: "q-slider",
            cn: [{
                cls: "q-slider-btn-ct " + (this.hidden_btn ? "x-hide-display" : ""),
                cn: {
                    tag: "span",
                    cls: "q-slider-btn q-slider-minus-btn"
                }
            }, {
                cls: "x-slider q-color-slider " + (this.vertical ? "x-slider-vert" : "x-slider-horz"),
                cn: {
                    cls: "x-slider-end",
                    cn: {
                        cls: "x-slider-inner",
                        cn: [{
                            tag: "a",
                            cls: "x-slider-focus",
                            href: "#",
                            tabIndex: "-1",
                            hidefocus: "on"
                        }, {
                            cls: "q-slider-color-bg"
                        }]
                    }
                }
            }, {
                cls: "q-slider-btn-ct " + (this.hidden_btn ? "x-hide-display" : ""),
                cn: {
                    tag: "span",
                    cls: "q-slider-btn q-slider-plus-btn"
                }
            }]
        };
        Ext.slider.MultiSlider.superclass.onRender.apply(this, arguments);
        this.slider = this.el.child(".x-slider");
        this.endEl = this.el.child(".x-slider-end");
        this.innerEl = this.endEl.first();
        this.focusEl = this.innerEl.child(".x-slider-focus");
        this.plusEl = this.el.child(".q-slider-plus-btn");
        this.minusEl = this.el.child(".q-slider-minus-btn");
        this.colorBgEl = this.innerEl.child(".q-slider-color-bg");
        this.plusEl.addClassOnOver("q-slider-btn-hover");
        this.plusEl.addClassOnClick("q-slider-btn-press");
        this.minusEl.addClassOnOver("q-slider-btn-hover");
        this.minusEl.addClassOnClick("q-slider-btn-press");
        for (var b = 0; b < this.thumbs.length; b++) {
            this.thumbs[b].render()
        }
        var a = this.innerEl.child(".x-slider-thumb");
        this.halfThumb = (this.vertical ? a.getHeight() : a.getWidth()) / 2;
        this.initEvents()
    },
    moveThumb: function(e, d, c) {
        var b = this.thumbs[e],
            f = b.el,
            a = this.colorBgEl;
        if (!c || this.animate === false) {
            f.setLeft(d);
            a.setWidth(d)
        } else {
            f.shift({
                left: d,
                stopFx: true,
                duration: 0.35
            });
            a.shift({
                width: d,
                stopFx: true,
                duration: 0.35
            })
        }
    },
    onResize: function(c, e) {
        var b = this.thumbs,
            a = b.length,
            d = 0;
        for (; d < a; ++d) {
            b[d].el.stopFx()
        }
        if (Ext.isNumber(c)) {
            this.innerEl.setWidth(c - (this.slider.getPadding("l") + this.endEl.getPadding("r") + this.minusEl.parent(".q-slider-btn-ct").getWidth() + this.plusEl.parent(".q-slider-btn-ct").getWidth()))
        }
        this.syncThumb();
        Ext.slider.MultiSlider.superclass.onResize.apply(this, arguments)
    },
    addThumb: function(b) {
        var a = new QNAP.CMP.SliderThumb({
            value: b,
            slider: this,
            index: this.thumbs.length,
            constrain: this.constrainThumbs,
            thumb_value_display_mode: this.thumb_value_display_mode
        });
        this.thumbs.push(a);
        if (this.rendered) {
            a.render()
        }
    },
    setValue: function(e, h, c, g) {
        var d = Ext.toArray(arguments),
            a = d.length;
        if (a == 1 || (a <= 3 && typeof arguments[1] != "number")) {
            d.unshift(0)
        }
        e = d[0];
        h = d[1];
        c = d[2];
        g = d[3];
        var b = this.thumbs[e],
            f = b.el;
        h = this.normalizeValue(h);
        if (h !== b.value && this.fireEvent("beforechange", this, h, b.value, b) !== false) {
            b.setValue(h);
            if (this.rendered) {
                this.moveThumb(e, this.translateValue(h), c !== false);
                this.fireEvent("change", this, h, b);
                if (g) {
                    this.fireEvent("changecomplete", this, h, b)
                }
            }
        }
    },
    initEvents: function() {
        this.mon(this.slider, {
            scope: this,
            mousedown: this.onMouseDown,
            keydown: this.onKeyDown
        });
        this.focusEl.swallowEvent("click", true);
        var b = new Ext.util.ClickRepeater(this.plusEl);
        var a = new Ext.util.ClickRepeater(this.minusEl);
        this.mon(b, "mousedown", function() {
            this.thumbs[0].dragging = true
        }, this);
        this.mon(b, "click", function() {
            this.setValue(this.getValue() + this.btn_increment, false)
        }, this);
        this.mon(b, "mouseup", function() {
            var c = this.thumbs[0].value;
            this.thumbs[0].value = -1;
            this.thumbs[0].dragging = false;
            this.setValue(c, false, true)
        }, this);
        this.mon(a, "mousedown", function() {
            this.thumbs[0].dragging = true
        }, this);
        this.mon(a, "click", function() {
            this.setValue(this.getValue() - this.btn_increment, false)
        }, this);
        this.mon(a, "mouseup", function() {
            var c = this.thumbs[0].value;
            this.thumbs[0].value = -1;
            this.thumbs[0].dragging = false;
            this.setValue(c, false, true)
        }, this)
    }
});
Ext.reg("qslider", QNAP.CMP.SingleSlider);
QNAP.CMP.SliderThumb = Ext.extend(Ext.slider.Thumb, {
    thumb_value_display_mode: "always",
    value_cls: "q-thumb-value",
    render: function() {
        if (this.thumb_value_display_mode === "hidden") {
            this.value_cls += " x-hide-display"
        } else {
            if (this.thumb_value_display_mode === "tip") {
                this.value_cls += " q-auto-hide-thumb-value"
            }
        }
        this.el = this.slider.innerEl.insertFirst({
            cls: this.cls,
            cn: {
                cls: this.value_cls,
                html: this.value || ""
            }
        });
        this.valueEl = this.el.child(".q-thumb-value");
        this.rendered = true;
        this.initEvents();
        this.hide_value_task = new Ext.util.DelayedTask(this.hide_valueEL, this)
    },
    setValue: function(a) {
        this.value = a;
        if (this.rendered) {
            this.valueEl.update(this.value.toString());
            if (this.thumb_value_display_mode === "tip") {
                this.valueEl.addClass("q-show-thumb-value");
                this.hide_value_task.delay(1000)
            }
        }
    },
    hide_valueEL: function() {
        this.valueEl.removeClass("q-show-thumb-value")
    },
    initEvents: function() {
        var a = this.el;
        a.addClassOnOver("x-slider-thumb-over");
        this.tracker = new Ext.dd.DragTracker({
            onBeforeStart: this.onBeforeDragStart.createDelegate(this),
            onStart: this.onDragStart.createDelegate(this),
            onDrag: this.onDrag.createDelegate(this),
            onEnd: this.onDragEnd.createDelegate(this),
            tolerance: 3,
            autoStart: 300
        });
        this.tracker.initEl(a)
    }
});
Ext.ComponentMgr.registerPlugin("pcopymenu", function(a) {
    return {
        init: function(b) {
            this.id = Ext.id();
            b.on("afterrender", this.render, this);
            b._setCopyText = this.setCopyText.createDelegate(this, [b], 1);
            b.flexCallBack = function() {
                if (Ext.isFunction(a.flexCallBack)) {
                    a.flexCallBack()
                }
                if (b.handler) {
                    b.handler()
                }
            }
        },
        render: function(b) {
            if (QNAP.QOS.lib.supportExecCommand) {
                this.renderCopyTextArea(b)
            } else {
                this.renderFlashBtn(b)
            }
        },
        renderCopyTextArea: function(b) {
            b.copytext = b.el.insertSibling("<textarea id='" + this.id + "' style='position: absolute;width: 1px;right: 1px;pointer-events: none;opacity: 0;' ></textarea>");
            b.setHandler(this.execCommandHandler);
            b.flexCallBack = a.flexCallBack
        },
        renderFlashBtn: function(d) {
            var f = QNAP.QOS.lib.FlexTool;
            var e = f.getFlexArgs(this.id + "-flex", "flex-copy-btn");
            var b = f.getClipFlexEmbedStr(e);
            d.el.insertSibling("<div id='" + this.id + "-ct' ></div>");
            d.el.setStyle({
                "pointer-events": "none"
            });
            var c = Ext.get(this.id + "-ct");
            c.setStyle({
                position: "absolute",
                left: "0px"
            }).setWidth("100%").setHeight("100%").insertHtml("afterBegin", b).setStyle({
                position: "absolute",
                left: "0px"
            });
            if (d.tooltip) {
                Ext.QuickTips.register({
                    target: this.id,
                    text: _S[d.tooltip] || d.tooltip,
                    enabled: true
                })
            }
            if (d.copyText) {
                d.mon(c, "mouseover", function() {
                    this._setCopyText(this.copyText)
                }, d, {
                    single: true,
                    delay: 100
                })
            }
            d.flexCallBack = function() {
                d.handleClick({
                    stopEvent: Ext.emptyFn
                });
                if (Ext.isFunction(a.flexCallBack)) {
                    a.flexCallBack()
                }
            }
        },
        setCopyText: function(e, c) {
            var d = QNAP.QOS.lib.FlexTool;
            var b = d.getFlexObject(this.id + "-flex");
            if (b) {
                b.CopyString(e, "clipFlexCmpClick", c.id)
            }
            c.copyText = e
        },
        execCommandHandler: function() {
            this.copytext.dom.value = this.copyText;
            this.copytext.dom.select();
            if (document.execCommand("copy")) {
                if (this.flexCallBack) {
                    this.flexCallBack()
                }
            }
        }
    }
});
Ext.ns("Ext.ux.grid");
Ext.ux.grid.BufferView = Ext.extend(Ext.grid.GridView, {
    rowHeight: 19,
    borderHeight: 2,
    scrollDelay: 100,
    cacheSize: 20,
    cleanDelay: 500,
    initTemplates: function() {
        Ext.ux.grid.BufferView.superclass.initTemplates.call(this);
        var a = this.templates;
        a.rowHolder = new Ext.Template('<div class="x-grid3-row {alt}" style="{tstyle}"></div>');
        a.rowHolder.disableFormats = true;
        a.rowHolder.compile();
        a.rowBody = new Ext.Template('<table class="x-grid3-row-table" border="0" cellspacing="0" cellpadding="0" style="{tstyle}">', "<tbody><tr>{cells}</tr>", (this.enableRowBody ? '<tr class="x-grid3-row-body-tr" style="{bodyStyle}"><td colspan="{cols}" class="x-grid3-body-cell" tabIndex="0" hidefocus="on"><div class="x-grid3-row-body">{body}</div></td></tr>' : ""), "</tbody></table>");
        a.rowBody.disableFormats = true;
        a.rowBody.compile()
    },
    getStyleRowHeight: function() {
        return Ext.isBorderBox ? (this.rowHeight + this.borderHeight) : this.rowHeight
    },
    getCalculatedRowHeight: function() {
        return this.rowHeight + this.borderHeight
    },
    getVisibleRowCount: function() {
        var b = this.getCalculatedRowHeight(),
            a = this.scroller.dom.clientHeight;
        return (a < 1) ? 0 : Math.ceil(a / b)
    },
    getVisibleRows: function() {
        var a = this.getVisibleRowCount(),
            b = this.scroller.dom.scrollTop,
            c = (b === 0 ? 0 : Math.floor(b / this.getCalculatedRowHeight()) - 1);
        return {
            first: Math.max(c, 0),
            last: Math.min(c + a + 2, this.ds.getCount() - 1)
        }
    },
    doRender: function(g, k, u, a, s, B, l) {
        var b = this.templates,
            f = b.cell,
            h = b.row,
            y = b.rowBody,
            n = s - 1,
            t = this.getStyleRowHeight(),
            A = this.getVisibleRows(),
            d = "width:" + this.getTotalWidth() + ";height:" + t + "px;",
            E = [],
            x, F, w = {},
            m = {
                tstyle: d
            },
            q;
        for (var z = 0, D = k.length; z < D; z++) {
            q = k[z];
            x = [];
            var o = (z + a),
                e = o >= A.first && o <= A.last;
            if (e) {
                for (var C = 0; C < s; C++) {
                    F = g[C];
                    w.id = F.id;
                    w.css = C === 0 ? "x-grid3-cell-first " : (C == n ? "x-grid3-cell-last " : "");
                    w.attr = w.cellAttr = "";
                    w.value = F.renderer(q.data[F.name], w, q, o, C, u);
                    w.style = F.style;
                    if (w.value === undefined || w.value === "") {
                        w.value = "&#160;"
                    }
                    if (q.dirty && typeof q.modified[F.name] !== "undefined") {
                        w.css += " x-grid3-dirty-cell"
                    }
                    x[x.length] = f.apply(w)
                }
            }
            var G = [];
            if (B && ((o + 1) % 2 === 0)) {
                G[0] = "x-grid3-row-alt"
            }
            if (q.dirty) {
                G[1] = " x-grid3-dirty-row"
            }
            m.cols = s;
            if (this.getRowClass) {
                G[2] = this.getRowClass(q, o, m, u)
            }
            m.alt = G.join(" ");
            m.cells = x.join("");
            E[E.length] = !e ? b.rowHolder.apply(m) : (l ? y.apply(m) : h.apply(m))
        }
        return E.join("")
    },
    isRowRendered: function(a) {
        var b = this.getRow(a);
        return b && b.childNodes.length > 0
    },
    syncScroll: function() {
        Ext.ux.grid.BufferView.superclass.syncScroll.apply(this, arguments);
        this.update()
    },
    update: function() {
        if (this.scrollDelay) {
            if (!this.renderTask) {
                this.renderTask = new Ext.util.DelayedTask(this.doUpdate, this)
            }
            this.renderTask.delay(this.scrollDelay)
        } else {
            this.doUpdate()
        }
    },
    onRemove: function(d, a, b, c) {
        Ext.ux.grid.BufferView.superclass.onRemove.apply(this, arguments);
        if (c !== true) {
            this.update()
        }
    },
    doUpdate: function() {
        if (this.getVisibleRowCount() > 0) {
            var f = this.grid,
                b = f.colModel,
                h = f.store,
                e = this.getColumnData(),
                a = this.getVisibleRows(),
                j;
            for (var d = a.first; d <= a.last; d++) {
                if (!this.isRowRendered(d) && (j = this.getRow(d))) {
                    var c = this.doRender(e, [h.getAt(d)], h, d, b.getColumnCount(), f.stripeRows, true);
                    j.innerHTML = c
                }
            }
            this.clean()
        }
    },
    clean: function() {
        if (!this.cleanTask) {
            this.cleanTask = new Ext.util.DelayedTask(this.doClean, this)
        }
        this.cleanTask.delay(this.cleanDelay)
    },
    doClean: function() {
        if (this.getVisibleRowCount() > 0) {
            var b = this.getVisibleRows();
            b.first -= this.cacheSize;
            b.last += this.cacheSize;
            var c = 0,
                d = this.getRows();
            if (b.first <= 0) {
                c = b.last + 1
            }
            for (var a = this.ds.getCount(); c < a; c++) {
                if ((c < b.first || c > b.last) && d[c].innerHTML) {
                    d[c].innerHTML = ""
                }
            }
        }
    },
    removeTask: function(b) {
        var a = this[b];
        if (a && a.cancel) {
            a.cancel();
            this[b] = null
        }
    },
    destroy: function() {
        this.removeTask("cleanTask");
        this.removeTask("renderTask");
        Ext.ux.grid.BufferView.superclass.destroy.call(this)
    },
    layout: function() {
        Ext.ux.grid.BufferView.superclass.layout.call(this);
        this.update()
    }
});
