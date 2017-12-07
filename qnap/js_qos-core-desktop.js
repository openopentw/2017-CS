Ext.ns('QNAP.QOS.ToolBtn');
Ext.ns('QNAP.QOS.CMP');

QNAP.QOS.Desktop = function(cfg) {
    var lib, ls_keys, ls_length;
    lib = QNAP.QOS.lib;
    this.layoutCfg = {
        type: 'vbox',
        align: 'stretch'
    };
    Ext.apply(this, cfg);
    this.LINK_URL = {
        /**
         * TUT : Tutorial
         */
        "TUT": "https://www.qnap.com/_jump/nas_redirect/tutorial.php",
        /**
         * WIKI : WIKI
         */
        "WIKI": "http://wiki.qnap.com/wiki/",
        /**
         * FORUM : FORUM
         */
        "FORUM": "http://forum.qnap.com/",
        /**
         * CUST_SERV : Customer Service
         */
        "CUST_SERV": "https://www.qnap.com/help",
        /**
         * FAQ : FAQ
         */
        "FAQ": "https://www.qnap.com/_jump/nas_redirect/faq.php",
        /**
         * VIDEO_TUT : Video Tutorial
         */
        "VIDEO_TUT": "https://www.qnap.com/_jump/video_tutorial/index.php",
        /**
         * MANUAL : MANUAL
         */
        "MANUAL": "https://www.qnap.com/nas_manual",
        /**
         * COMPARABILITY : comparability
         */
        "COMPARABILITY": "https://www.qnap.com/_jump/nas_redirect/compatibility.php"
    };

    if (lib.getStorageValue('qts_desktop_setup_version') !== URL_RANDOM_NUM) {

        lib.setStorageValue('qts_desktop_setup_version', URL_RANDOM_NUM);

        lib.removeStorageValue('qpkg_min_ver_win');
        lib.removeStorageValue('NEWS_XML');
        lib.removeStorageValue('NEWS_XML_Last-Modified');
        ls_keys = Object.keys(localStorage);
        ls_length = ls_keys.length;
        while (ls_length--) {
            if (/^QPKG_XML/.test(ls_keys[ls_length])) {
                lib.removeStorageValue(ls_keys[ls_length]);
            }
        }
    }
};

Ext.extend(QNAP.QOS.Desktop, Ext.util.Observable, {
    menuModelType: 1,
    cpItems: {},
    alreadyInitTask: false,
    TASK_ID: {
        MENU_TASK: Ext.id(),
        SYS_DATETIME_TASK: Ext.id()
    },
    timeoutMap: {
        notifyTask: null
    },
    basicImgs: [
        '/cgi-bin/images/desktop/headbar/group.png',
        '/cgi-bin/images/toolbar/large_topbar_middle.png',
        '/cgi-bin/images/toolbar/large_topbar_left.png',
        '/cgi-bin/images/toolbar/large_topbar_right.png',
        '/v3_menu/panel/toolbar_icon.png',
        '/cgi-bin/images/window/toolbar/window_tools.png',
        '/cgi-bin/images/window/toolbar_bg_42.png',
        '/cgi-bin/images/window/toolbar_bg_22.png',
        '/cgi-bin/images/icon/icon_add.png',
        '/cgi-bin/apps/systemPreferences/images/icon-backup-manager-36.png',
        '/cgi-bin/images/desktop/side-menu/button.png',
        '/cgi-bin/images/toolbar/icon-info.png',
        '/cgi-bin/images/toolbar/icon-warning.png',
        '/cgi-bin/images/toolbar/icon-error.png',
        '/cgi-bin/images/toolbar/icon-question.gif',
        '/cgi-bin/images/toolbar/icon-question.png',
        '/cgi-bin/images/toolbar/icon-question-b.png',
        '/cgi-bin/images/desktop/shortcut_bg_1.png',
        '/cgi-bin/images/desktop/shortcut_bg_2.png',
        '/cgi-bin/images/window/triangle.png',
        '/cgi-bin/images/tip_icon/info.svg'
    ],
    basicImgsLoadedCount: 0,
    dashboardDefaultSize: 0,
    openingMap: {},
    beforeQViewShow: Ext.emptyFn,
    afterQViewShow: Ext.emptyFn,
    clocks: {},
    extDevPromptWinHistory: [],
    init: function(os) {
        _D('=== Desktop init ===');
        var me = this;
        me.addEvents({
            'beforeCreateAppWin': true,
            'createAppWin': true,
            'updateportrait': true,
            'initialized': true,
            'loadmlinfo': true
        });

        os.desktop = me;
        os.on('initUI', me.initUI, me, {
            single: true
        });
        os.on('logincomplete', me.logincomplete, me, {
            single: true
        });
        os.on('afterloadusersetting', function() {
            me.initImg();
        }, os, {
            single: true
        });
        os.openViewer = me.openViewer;
        os.checkSid = me.checkSid;
        os.authPass = me.authPass;
        os.openStorageMgr = me.openStorageMgr;
        os.openApp = Ext.createDelegate(this.openApp, this);
        os.openApp4Dv = Ext.createDelegate(this.openApp4Dv, this);
        os.openWidget = this.openWidget;
        os.openURL = Ext.createDelegate(this.openURL, this);
        os.openService = Ext.createDelegate(this.openService, this);
        os.openQPKG = Ext.createDelegate(this.openQPKG, this);
        os.minAllWins = this.minAllWins;
        os.installCodexPack = this.installCodexPack;
        os.isQPKGInstalling = this.isQPKGInstalling;
        os.showMsg = Ext.createDelegate(me.showMsg, me);
        os.qMsgProxy = Ext.createDelegate(me.qMsgProxy, me);
        var Clock = Ext.extend(Ext.util.Observable, (function() {
            function startTickTock() {
                var clock = this;
                clock.task = {
                    run: function() {
                        var date = new Date();
                        var current = date.getTime();
                        var timezoneOffset = date.getTimezoneOffset();
                        if (timezoneOffset !== clock.timezoneOffset) {
                            Ext.StoreMgr.item(QNAP.QOS.config.T_SYS_SETTING).load();
                            return;
                        }
                        clock.time = clock.time.add(Date.MILLI, current - clock.lastStmp);
                        clock.lastStmp = current;
                        clock.timezoneOffset = timezoneOffset;
                        clock.fireEvent('ticktock', clock.time);
                    },
                    interval: 1000 //1 second
                };
                Ext.TaskMgr.start(clock.task);
            }

            function stopTickTock() {
                var clock = this;
                Ext.TaskMgr.stop(clock.task);
            }
            return {
                constructor: function(config) {
                    this.addEvents({
                        "ticktock": true
                    });
                    this.task = {};
                    this.lastStmp = new Date().getTime();
                    Ext.apply(this, config);
                    Clock.superclass.constructor.call(this);
                },
                setTime: function(time) {
                    var date = new Date();
                    this.lastStmp = date.getTime();
                    this.timezoneOffset = date.getTimezoneOffset();
                    stopTickTock.apply(this);
                    delete this.time;
                    this.time = time;
                    startTickTock.apply(this);
                },
                getTime: function() {
                    return this.time;
                }
            };
        }()));

        me.clocks = {
            systemDateTime: new Clock({
                id: 'systemDateTime'
            }),
            systemUpTime: new Clock({
                id: 'systemUpTime'
            })
        };
        this.initCSS();
    },
    qMsgProxy: function(msgData, e) {
        var result;
        var me = this;
        var APP_ID = msgData.APP_ID;
        var appWin = Ext.getCmp(msgData.APP_ID);
        var OPTION = msgData.OPTION;
        switch (msgData.FN) {
            case 'openURL':
                os.openURL(OPTION.url, OPTION.windowId, OPTION.title, OPTION.w, OPTION.h);
                break;
            case 'getConfig':
                break;
            case 'focus':
                try {
                    var event = document.createEvent('Event');
                    event.initEvent('mousedown', true, true);
                    if (appWin) {
                        appWin.getEl().dom.dispatchEvent(event);
                    } else {
                        Ext.getBody().dom.dispatchEvent(event);
                    }

                } catch (e) {
                    console.error(e);
                }

                if (appWin) {
                    appWin.toFront();
                }
                me.clearAppFocusCookie('');
                break;
            case 'close':
                if (appWin) {
                    appWin.close();
                }
                break;
            case 'openApp':
                os.openApp(OPTION.appId, OPTION.config);
                break;
            case 'hideWin':
                if (appWin) {
                    appWin.minimize();
                }
                break;
            case 'maxWin':
                if (appWin) {
                    appWin.maximize(true);
                }
                break;
            case 'restoreWin':
                if (appWin) {
                    appWin.restore();
                }
                break;
            case 'fullScreenWin':
                var msgWin = os.Msg.confirm('FullScreen', APP_ID + ' request Fullscreen mode').getDialog();
                msgWin.fbar.getComponent(1).on('click', function() {
                    me.fullScreenWin(OPTION.appId);
                }, null, {
                    single: true
                });
                break;
            case 'showWindowFrame':
                if (appWin) {
                    appWin.showWindowFrame();
                    result = true;
                } else {
                    result = false;
                }
                break;
            case 'hideWindowFrame':
                if (QNAP.QOS.user.common.windowMode === 'label' && appWin) {
                    appWin.hideWindowFrame();
                    result = true;
                } else {
                    result = false;
                }
                break;
            case 'setupWallpaper':
                var opt = msgData.OPTION,
                    type = opt.type || 'Fill';
                os.file.setNASImgToWallPaper(opt.path, type, function() {
                    os.desktop.setupCumsWallpaper('desktop-bg-cums-img', type);
                });
                break;
            case 'getWindowMode':
                result = QNAP.QOS.user.common.windowMode;
                break;
            case 'getStationPrivilege':
                result = this.getStationPrivilege(OPTION);
                break;
            case 'setMailToken':
                result = this.setMailToken(OPTION.appInstId, OPTION.token, OPTION.email);
                break;
            case 'hasNewCodexPack':
                result = os.hasNewCodexPack();
                break;
            case 'installCodexPack':
                os.installCodexPack();
                break;
            case 'mask':
                Ext.Msg.wait(OPTION.msg);
                break;
            case 'unmask':
                Ext.Msg.hide();
                break;
            case 'refreshDesktop':
                location.reload();
                break;
            case 'setSize':
                if (QNAP.QOS.user.common.windowMode === 'tab') {
                    result = appWin.getSize();
                } else {
                    if (appWin.maximized) {
                        appWin.restoreSize.width = OPTION.w;
                        appWin.restoreSize.height = OPTION.h;
                        appWin.restore();
                    } else {
                        appWin.setSize(OPTION.w, OPTION.h + appWin.header.getHeight());
                    }
                    appWin.setActive(true);
                    result = appWin.getSize();
                }
                break;
            case 'setMaximizable':
                var maxTool = appWin.tools.maximize;
                var restoreTool = appWin.tools.restore;
                if (OPTION) {
                    appWin.maximizable = true;
                    if (!appWin.maximized) {
                        maxTool.show();
                    } else {
                        restoreTool.show();
                    }
                } else {
                    appWin.maximizable = false;
                    appWin.maximized = false;
                    appWin.el.removeClass('x-window-maximized');
                    appWin.container.removeClass('x-window-maximized-ct');
                    maxTool.hide();
                    restoreTool.hide();
                }
                if (appWin.ddLabel) {
                    appWin.ddLabel.updateTabTools();
                }
                break;
            case 'setIframeSize':
                if (QNAP.QOS.user.common.windowMode === 'tab') {
                    result = appWin.getSize();
                } else {
                    if (appWin.maximized) {
                        appWin.restoreSize.width = OPTION.w;
                        appWin.restoreSize.height = OPTION.h + appWin.header.getHeight();
                        appWin.restore();
                    } else {
                        appWin.setSize(OPTION.w, OPTION.h + appWin.header.getHeight());
                    }
                    appWin.setActive(true);
                    result = appWin.getSize();
                }
                break;
            case 'disableResizHandler':
                result = appWin.disableResizHandler(OPTION);
                break;
            case 'regPushNotify':
                result = this.regPushNotify(OPTION.appInstId, OPTION);
                break;
            case 'saveState':
                result = appWin.qts_save_state(OPTION);
                break;
            case 'restoreState':
                result = appWin.qts_restore_state(OPTION);
                break;
        }
        return result;
    },
    setMailToken: function(appInstId, token, email) {
        var app = os.getAppInstance(appInstId);
        app.setMailToken(token, email);
    },
    regPushNotify: function(appInstId, OPTION) {
        var app = os.getAppInstance(appInstId);
        app.regPushNotify(OPTION);
    },
    getStationPrivilege: function(appId) {
        var appIdRexp = new RegExp('^' + RegExp.escape(appId) + '$', 'i');
        var serviceIndex = os.serviceStore.find('appId', appIdRexp);
        if (serviceIndex >= 0) {
            var service = os.serviceStore.getAt(serviceIndex);
            if (service.get('allowed') === '0') {
                return 'deny';
            }
            return 'grant';
        }
        return 'deny';
    },
    /**
     *
     * @return {String/Boolean}
     * if support return event name (fullscreenchange/webkitfullscreenchange/mozfullscreenchange/MSFullscreenChange)
     * else return false;
     */
    getFullscreenEvent: function() {
        var fullscreenchange = false;
        if ('onfullscreenchange' in document) {
            fullscreenchange = 'fullscreenchange';
        } else if ('onwebkitfullscreenchange' in document) {
            fullscreenchange = 'webkitfullscreenchange';
        } else if ('onmozfullscreenchange' in document) {
            fullscreenchange = 'mozfullscreenchange';
        } else if ('onmsfullscreenchange' in document) {
            fullscreenchange = 'MSFullscreenChange';
        }
        return fullscreenchange;
    },
    fullScrrenDesktop: function() {
        var fullscreenchange = os.desktop.getFullscreenEvent();
        var Element = window.Element;
        if (fullscreenchange === false) {
            return;
        }
        if (!document.fullscreenElement && // alternative standard method
            !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) { // current working methods
            if (document.requestFullscreen) {
                document.requestFullscreen();
            } else if (document.mozRequestFullScreen) {
                document.mozRequestFullScreen();
            } else if (document.webkitRequestFullscreen) {
                document.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            } else if (document.msRequestFullscreen) {
                document.msRequestFullscreen();
            }
        } else {
            if (document.cancelFullScreen) {
                document.cancelFullScreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            } else if (document.msCancelFullScreen) {
                document.msCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    },
    /**
     * 直接將指定的app window body 區域設為 fullscreen
     * @param  {[type]} appId [description]
     * @return {[type]}       [description]
     */
    fullScreenWin: function(appId) {

        var me = this;
        var appWin = Ext.getCmp(appId);
        var windowDom = appWin.body.dom;

        var fullscreenchange = me.getFullscreenEvent();
        var Element = window.Element;
        if (fullscreenchange === false) {
            return;
        }
        if (!document.fullscreenElement && // alternative standard method
            !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) { // current working methods
            if (windowDom.requestFullscreen) {
                windowDom.requestFullscreen();
            } else if (windowDom.mozRequestFullScreen) {
                windowDom.mozRequestFullScreen();
            } else if (windowDom.webkitRequestFullscreen) {
                windowDom.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            } else if (windowDom.msRequestFullscreen) {
                windowDom.msRequestFullscreen();
            }
            appWin.restoreSize = appWin.getSize();
            if (fullscreenchange) {
                Ext.EventManager.on(window, fullscreenchange, function() {
                    appWin.body.setStyle({
                        'width': '100%',
                        'height': '100%'
                    });
                    appWin.doLayout();
                    Ext.EventManager.on(window, fullscreenchange, function() {
                        appWin.setSize(appWin.restoreSize.width, appWin.restoreSize.height);
                        appWin.doLayout();
                    }, null, {
                        single: true
                    });
                }, null, {
                    single: true
                });
            }
        } else {
            if (document.cancelFullScreen) {
                document.cancelFullScreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            } else if (document.msCancelFullScreen) {
                document.msCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    },
    initUI: function() {
        var me = this;
        me.initEvent();
        os.initTask();
        Ext.StoreMgr.item(QNAP.QOS.config.T_SYS_SETTING).load();
        me.resetRootEm();
        me.checkFlash();

        os.dataStore.hardware.load();
        var params = {
            lang: QNAP.QOS.lib.getLanguageCode(),
            subfunc: "qpkg"
        };

        if (QNAP.QOS.user.isAdminGroup) {
            params.apply = 9;
        }

        QNAP.QOS.ajax({
            url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'application/appRequest.cgi', {
                action: 'getRemoteRSS'
            }),
            method: 'POST',
            params: params,
            disableCaching: false,
            success: function(res) {
                QNAP.QOS.Environment.supportMyQNAPCloud = Ext.DomQuery.selectNumber('QNAPDDNS', res.responseXML, 0) === 1;
            },
            failure: Ext.emptyFn,
            callback: function() {
                os.qpkgInfoStore.load();
            }
        });

        new Ext.util.DelayedTask(function() {
            if (os.qpkgInfoStore.loaded) {
                return;
            }
            os.qpkgInfoStore.load();
        }).delay(3000); // delay 3 Sec.

        /**
         * img preload
         * service store load
         * station store load
         * QPKG store load
         * loadQTSSetting
         * loadQTSSetting
         * @type {Number}
         */
        os.totalInitCount = 6;
    },
    checkFlash: function() {
        QNAP.QOS.config.supportFlash = DetectFlashVer(9);
    },
    logincomplete: function() {
        _D('=== Desktop logincomplete ===');
        var me, view, user;

        me = this;
        view = os.getViewport();
        user = QNAP.QOS.user;

        var completeInit, quickInit, checkSysSettingDataReady,
            initFileAPI, setupDesktopUI, addEventListeren, openAppWin,
            initTask;
        completeInit = function() {
            if (checkSysSettingDataReady()) {
                me.initializing = true;
                me.initDesktop();
                if (QNAP.QOS.user.isAdminGroup) {
                    me.initDashboard();
                }
                initFileAPI();
                setupDesktopUI();
                initTask();
                addEventListeren();
                openAppWin();
                me.initializing = false;
                me.fireEvent('initialized');
                me.initializFinish = true;
            }
        };
        quickInit = function() {
            me.initializing = true;
            me.initDesktop();
            setupDesktopUI();
            os.desktop.showQuickChangePwdUI();
            me.initializing = false;
            me.fireEvent('initialized');
            me.initializFinish = true;
        };

        checkSysSettingDataReady = function() {
            var sysSettingStore = Ext.StoreMgr.item(QNAP.QOS.config.T_SYS_SETTING);
            if (sysSettingStore.retry > 3 || sysSettingStore.getCount() > 0) {
                sysSettingStore.on('load', me.syncSystemDateTime);
                me.syncSystemDateTime();
                return true;
            } else {
                sysSettingStore.retry = (sysSettingStore.retry || 0) + 1;
                sysSettingStore.on({
                    single: true,
                    scope: me,
                    load: me.logincomplete
                });
                setTimeout(function() {
                    sysSettingStore.load();
                }, 2000);
                return false;
            }
            return false;
        };

        initFileAPI = function() {
            os.file = window.FileAPI;
            os.file.setSid(user.sid);
            os.file.loadSysSetting();
        };

        setupDesktopUI = function() {
            if (view.getBox().height < 820) {
                view.addClass('s-widget');
            } else {
                view.removeClass('s-widget');
            }
            Ext.getBody().insertHtml('beforeEnd', deployJava.getPluginTag() || '');
            me.initContextMenu();
            if (QNAP.QOS.Environment.showDesktopBottomDock) {
                Ext.getCmp(me.CMP_ID.QNAP_UTILITY_DOCK).show();
            }
            Ext.QuickTips.getQuickTip().el.setZIndex(20012);
            view.doLayout();
            me.setupCumsWallpaper(user.bgClass);
            me.setupDesktopCfg();
            var desktopEl = me.desktop.getEl();
            desktopEl.child('.window-area').on('scroll', function() {
                this.scrollIntoView();
                this.dom.scrollTop = 0;
            });
            if (user.pwExpiryWarn) {
                var notifyList, msg;
                notifyList = os.dataStore.notifyList;
                msg = _S.QTS_MSG_19;
                msg = msg.replace('{0}', QNAP.QOS.user.pwExpiryDate);
                me.appendPwExpireNotify(os.dataStore.notifyList);
                notifyList.on('load', function(store) {
                    this.appendPwExpireNotify(store);
                }, me, {
                    delay: 100
                });

                msg = os.showMsg('', msg, false);
                msg.addClass('link');
                msg.child('div.content').on('click', function(evt, target) {
                    os.openApp('PersonalSettings', {
                        showPwdPanel: true
                    });
                    var msg = Ext.fly(target).parent('div.msg-box');
                    var msgCt = os.desktop.msgCt;
                    msg.replaceClass('msg-box', 'removing-msg-box');
                    msg.remove();
                    msgCt.alignTo(document, 'br-br', [-10, 7]);
                    msgCt.setStyle({
                        top: 'auto'
                    });
                });
            }
            if (user.isAdminGroup) {
                me.initCpItems();
                Ext.getCmp(me.CMP_ID.DESKTOP).add(me.dashboard);
                Ext.getCmp(me.CMP_ID.DESKTOP).doLayout();
                me.showDashBoardItem();

                me.on('initialized', function() {
                    if (QNAP.QOS.user.showQuickStart && QNAP.lib.cookie.get('showQuickStart') == 1) {
                        os.desktop.showQuickStart();
                    }
                    QNAP.lib.cookie.del('showQuickStart', '/');
                    this.show_network_change_message();
                }, me, {
                    single: true
                });

                QNAP.QOS.ajax({
                    url: QNAP.QOS.lib.getCgiUrl(
                        QNAP.QOS.config.sitePath + 'ajaxRequest.cgi', {}),
                    params: {
                        func: 'genNewsRSS'
                    },
                    success: function() {
                        if (Ext.StoreMgr.item(QNAP.QOS.config.T_RSS)) {
                            if (QNAP.QOS.Environment.loadNewsRSS) {
                                Ext.StoreMgr.item(QNAP.QOS.config.T_RSS).reload();
                            }
                        }
                    },
                    failure: function() {}
                });

                /**
                 * if checkDNS OK and enableliveupdate then check new firmware
                 */
                os.checkDNS(null, me.checkNewQPKG, true);
            }
        };

        addEventListeren = function() {
            os.qpkgStore.on('load', me.onQPKGStoreload, me);
            if (os.qpkgStore.loaded) {
                me.onQPKGStoreload();
            }
            me.bindEvents();

            os.on('resetlang', function() {
                os.stationStore.reload();
                os.qpkgStore.each(function(record) {
                    var qInternationalKey;
                    if (record.get('type') === 'QPKGAPP') {
                        qInternationalKey = record.get('qInternationalKey');
                        if (_S[qInternationalKey] || qInternationalKey) {
                            record.set('defaultTitle', _S[qInternationalKey] || qInternationalKey);
                            record.set('displayName', _S[qInternationalKey] || qInternationalKey);
                        }
                    }
                });

                if (QNAP.QOS.user.isAdminGroup) {
                    QNAP.QOS.ajax({
                        url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'application/appRequest.cgi', {
                            action: 'getRemoteRSS'
                        }),
                        method: 'POST',
                        params: {
                            apply: 9,
                            lang: QNAP.QOS.lib.getLanguageCode(),
                            subfunc: "qpkg"
                        },
                        success: Ext.emptyFn,
                        failure: Ext.emptyFn,
                        callback: function() {
                            os.qpkgInfoStore.reset_lang();
                            os.qpkgInfoStore.reload();
                            os.desktop.onQPKGStoreload();
                        }
                    });
                }
            });
        };

        openAppWin = function() {
            var quickopen = QNAP.lib.cookie.get('quickopen');
            if (quickopen) {
                os.openApp(quickopen, {});
                QNAP.lib.cookie.del('quickopen');
            }

            if (window._quick_open) {
                os.openApp(window._quick_open.appId, window._quick_open.cfg);
            }
            window._quick_open = undefined;

            try {
                delete window._quick_open;
            } catch (e) {}
            me.on('initialized', function() {
                try {
                    this.resumeWin();
                } catch (e) {
                    _D('[Info] resumeWin failed');
                }
            }, me, {
                single: true
            });
        };

        initTask = function() {
            os.startTask();
            me.openAppTask();
            me.clearAppFocusCookie('');
            me.initTask();
            me.startTask();
        };

        if (Ext.state.Manager.get('desktopMode') === 'forceChangePwd') {
            quickInit();
        } else {
            Ext.state.Manager.set('desktopMode', '');
            completeInit();
        }

    },
    initCpItems: function() {
        var me = this;

        Ext.each(QNAP.QOS.systemPreferencesItems, function(group) {
            Ext.each(group.items, function(item) {
                switch (item) {
                    case "systemLogs":
                    case "systemStatus":
                    case "qpkg":
                    case "qsync":
                    case "MyCloudNas":
                    case "storageManagerV2":
                    case "backupRestore":
                    case "USBQuickAccess":
                        break;
                    default:
                        me.cpItems[item] = true;
                        break;
                }
            });
        });

    },
    loadNotify: function(store, records) {
        /**
         * 由回傳的項目決定重讀那些資料
         * @type {Boolean}
         */
        var reloadTask = false,
            reloadEventLog = false,
            reloadConnLog = false,
            reloadExtDevice = false,
            reloadValume = false,
            reloadNotice = false,
            reloadSysSetting = false;
        var lastSec = 0,
            lastId = 0;
        var eventLogMap = {},
            connLogMap = {},
            extDevMap = {},
            taskMap = {},
            noticeMap = {},
            skipMap = {},
            pinMap = {};

        var dataStore = os.dataStore,
            extDevice = dataStore.extDevice;

        var promptHistory = os.desktop.extDevPromptWinHistory;

        var facilityMap = os.facilityMap;
        var getTaskMsg = os.dataStore.notifyList.getTaskMsg,
            getExtraTaskMsg = os.dataStore.notifyList.getExtraTaskMsg;

        var autoPlayExtDev;
        var errorCode;

        try {
            errorCode = store.reader.jsonData.Error;
        } catch (e) {
            console.info('[Info] can\'t load notification list (syslogRequest.cgi).');
        }

        if (errorCode == -1) {
            os.logout();
        }

        function getLogMsg(r, facility) {
            var type;
            switch (parseInt(r.severity, 10)) {
                case 3:
                    type = _S.IEI_IDS_STRING85;
                    break;
                case 4:
                    type = _S.IEI_IDS_STRING65;
                    break;
            }
            var msg = String.format('[{0}] {1}', type, r.desc);
            var p = [];
            switch (facility) {
                case "8":
                    p.push(_S.IEI_NAS_LOGS20);
                    break;
                case "9":
                    p.push(_S.IEI_NAS_LOGS24);
                    break;
            }
            p.push(msg);

            return p;
        }

        function getExtDevMsg(r) {
            var recordData = r.data;
            var ifName = recordData.interface;
            var msg;

            switch (ifName.toUpperCase()) {
                case 'USB':
                    ifName = 'USB';
                    break;
                case 'USB2':
                case 'USB 2.0':
                    r.set('interface', 'usb2');
                    ifName = 'USB 2.0';
                    break;
                case 'USB3':
                case 'USB 3.0':
                    r.set('interface', 'usb3');
                    ifName = 'USB 3.0';
                    break;
                case 'USB 3.1':
                    r.set('interface', 'usb 3.1');
                    ifName = 'USB 3.1';
                    break;
                case 'ESATA':
                    ifName = 'eSATA';
                    break;
            }

            if (r.get('isODD')) {
                msg = _S.QTS_EXT_DEV_DISC_DRIVER_DETECT;
            } else {
                msg = String.format(_S.QTS_D_EXT_DEVICE + '\r{1} {2}', ifName, recordData.manufacturer, recordData.model);
            }

            return msg.replace('{MANUFACTURER}', recordData.manufacturer).replace('{MODEL}', recordData.model).replace('{INTERFACE}', ifName);

        }

        function getExtDevVolumeMsg(record) {
            var recordData = record.data;

            return _S.QTS_EXT_DEV_DISC_INSERT.replace('{MANUFACTURER}', recordData.manufacturer).replace('{MODEL}', recordData.model).replace('{VOLUME_NAME}', recordData.name);
        }

        /**
         * [bindClickEvent description]
         * @param  {Component} msg        [description]
         * @param  {String} app_id     [description]
         * @param  {String} app_option [description]
         */
        function bindClickEvent(msg, app_id, app_option) {
            if (app_id) {
                msg.addClass('link');
                msg.child('div.content').on('click', function(evt, target) {
                    var m, msgCt, option;

                    m = Ext.fly(target).parent('div.msg-box');
                    msgCt = os.desktop.msgCt;

                    try {
                        option = Ext.decode(app_option);
                    } catch (e) {
                        option = app_option;
                    }

                    os.openApp(app_id, option);
                    m.replaceClass('msg-box', 'removing-msg-box');
                    m.remove();
                    msgCt.alignTo(document, 'br-br', [-10, 7]);
                    msgCt.setStyle({
                        top: 'auto'
                    });
                });
            }
        }

        var uid, gid, facility, msgKey, msgCode;
        var DK_REG = /^MSG_DK_/;
        Ext.each(records, function(rec) {
            uid = rec.get('uid');
            gid = rec.get('gid');
            msgCode = rec.get('msgCode');
            if (uid >= 0 && uid != QNAP.QOS.user.uid) {
                return true;
            }
            if (msgCode === 'MSG_PS_001') {
                os.desktop.setPowerScheduleAlert();
                return true;
            } else if (!reloadSysSetting || DK_REG.test(msgCode)) {
                reloadSysSetting = true;
            }

            lastSec = Math.max(rec.data.timeSec, lastSec);
            facility = rec.data.facility;
            msgKey = facility + '_' + rec.data.name;

            if (/^(14|15|16)$/.test(facility)) {
                /**
                 * [14] MEDIA_LIB
                 * [15] VIDEO_TRANSCODE
                 * [16] VIDEO_TRANSCODE_RTT
                 * 連續轉檔時不連續跳出視窗
                 */
                var skipKey = facility + '_' + msgCode;
                if (facility == facilityMap.VIDEO_TRANSCODE || facility == facilityMap.VIDEO_TRANSCODE_RTT) {
                    skipKey = facility + '_' + msgCode + '_' + rec.data.name;
                }
                skipMap[skipKey] = true;
                if (store.lastSkipMap[skipKey]) {
                    reloadTask = true;
                    return true;
                } else {
                    store.lastSkipMap[skipKey] = true;
                }
            } else {
                if (lastId === 0) {
                    lastId = rec.data.id;
                }
                reloadNotice = true;
            }

            if (rec.data.severity == 5) {
                pinMap[msgKey] = true;
            }

            switch (facility) {

                case facilityMap.SMART: // [1] SMART
                case facilityMap.ANTIVIRUS: // [2] Antivirus
                case facilityMap.BAK_EXTERNAL_DRIVCE: // [3] Backup External Drivce
                case facilityMap.BAK_RTRR: // [4] Backup RTRR
                case facilityMap.BAK_RSYNC: // [5] Backup Rsync
                case facilityMap.BAK_LUN: // [6] Backup LUN
                case facilityMap.BAK_AMAZON_S3: // [7] Backup Amazon S3
                case facilityMap.MEDIA_LIB: // [14] Media lib pic
                case facilityMap.VIDEO_TRANSCODE: // [15] Media lib VIDEO_TRANSCODE
                case facilityMap.VIDEO_TRANSCODE_RTT: // [16] Media lib VIDEO_TRANSCODE RTT
                    reloadTask = true;
                    break;
                case facilityMap.EVENT_LOG: // [8] event log
                    reloadEventLog = true;
                    break;
                case facilityMap.CONN_LOG: // [9] connect log
                    reloadConnLog = true;
                    break;
                case facilityMap.EXT_DRVICE_USB: // [10] External Drvice USB
                case facilityMap.EXT_DRVICE_ESATA: // [11] External Drvice eSATA
                    reloadExtDevice = true;
                    break;
                case facilityMap.VALUME: // [12] valume or Disk
                    reloadTask = true;
                    reloadValume = true;
                    break;
                case facilityMap.APP_NOTIFY: // [13] App notify
                case facilityMap.SYSTEM:
                    reloadTask = true;
                    break;
                default:
                    reloadTask = true;
                    reloadConnLog = true;
                    reloadEventLog = true;
                    reloadExtDevice = true;
                    break;
            }


            if (/^(8|9)$/.test(facility) && /^(3|4)$/.test(rec.data.severity)) {
                /**
                 * facility 8 or 9
                 * 8 - event log
                 * 9 - connect log
                 *
                 * severity 3 or 4
                 * 3 - warning
                 * 4 - error
                 */
                if (facility == 8 && !eventLogMap[msgKey]) {
                    eventLogMap[msgKey] = rec.data;
                } else if (facility == 9 && !connLogMap[msgKey]) {
                    connLogMap[msgKey] = rec.data;
                } else {
                    return true;
                }
            } else if (/^(10|11)$/.test(facility)) {
                if (!extDevMap[msgKey]) {
                    var splitName = rec.data.name.split(/:(.+)?/);
                    if (splitName.length > 1) {
                        rec.data.name = splitName[1];
                        rec.data.devName = splitName[0];
                    } else {
                        rec.data.devName = '';
                    }
                    extDevMap[msgKey] = rec.data;
                } else {
                    return true;
                }

                os.fireEvent('filechange', 'os', '/', '/', rec.data.name, 'new');
            } else if (/^17$/.test(facility)) {
                if (!noticeMap[msgKey]) {
                    noticeMap[msgKey] = rec.data;
                }
            } else {
                if (!taskMap[msgKey]) {
                    taskMap[msgKey] = rec.data;
                } else {
                    return true;
                }
            }
        });

        store.lastSkipMap = skipMap;
        if (reloadExtDevice) {
            var eventCfg = {
                single: true
            };
            autoPlayExtDev = function(_extDevMap, _pinMap) {
                var extDeviceStore = os.dataStore.extDevice;
                var promptHistory = os.desktop.extDevPromptWinHistory;
                var removeList = [];
                var queryFn = function(record, id, regStr) {
                    var reg = new RegExp('^' + RegExp.escape(regStr) + '$', 'i');
                    var isODD = record.get('isODD');
                    if (reg.test(record.get('name'))) {
                        return true;
                    } else if (record.get('isODD')) {
                        return reg.test([record.get('manufacturer'), record.get('model')].join(' '));
                    }
                    return false;
                };

                var showMsg = function(record, index, length, deviceKey, deviceData, regStr) {
                    var autoHide = true;
                    var showODDVolume = false;
                    var isODD = record.get('isODD');
                    var isInsert = record.get('isInsert');
                    var promptKey;
                    if (_pinMap[deviceKey]) {
                        autoHide = false;
                    }

                    if (!isODD) {
                        /* not ODD */
                        record.showPromptWin = true;
                        os.showMsg(_S.MENU_8, getExtDevMsg(record), autoHide, deviceData.timeSecStr);
                        promptHistory.push(deviceData.devName || regStr);
                    } else {
                        /* is ODD */
                        promptKey = [record.get('devName'), record.get('manufacturer'), record.get('model'), 'ODD'].join('_');
                        /* Show detect Drive */
                        if (promptHistory.indexOf(promptKey) === -1) {
                            os.showMsg(_S.MENU_8, getExtDevMsg(record), autoHide, deviceData.timeSecStr);
                            promptHistory.push(promptKey);
                        }
                        /* Show detect disc volume mount */
                        if (isInsert) {
                            promptKey = [record.get('devName'), record.get('manufacturer'), record.get('model'), record.get('name')].join('_');
                            if (record.get('onlyAdmin') !== '--' && promptHistory.indexOf(promptKey) === -1) {
                                record.showPromptWin = true;
                                os.showMsg(_S.MENU_8, getExtDevVolumeMsg(record), autoHide, deviceData.timeSecStr);
                                promptHistory.push(promptKey);
                            }
                        }
                    }

                    return false;
                }

                Ext.each(promptHistory, function(name) {
                    var index = extDeviceStore.findBy(function(record) {
                        if (record.get('devName') === name || record.get('name') === name) {
                            return true;
                        }
                        if (record.get('isODD')) {
                            if (name === [record.get('devName'), record.get('manufacturer'), record.get('model'), 'ODD'].join('_')) {
                                return true;
                            }
                            if (name === [record.get('devName'), record.get('manufacturer'), record.get('model'), record.get('name')].join('_')) {
                                return true;
                            }
                        }
                        return false;
                    });
                    if (index === -1) {
                        removeList.push(name);
                    }
                });

                Ext.each(removeList, function(removeId) {
                    promptHistory.remove(removeId);
                });

                Ext.iterate(_extDevMap, function(deviceKey, deviceData) {
                    var regStr = deviceData.name.replace(/^\[?/, '').replace(/\]?$/, '').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
                    var isODD = false;

                    if (promptHistory.indexOf(deviceData.devName || regStr) >= 0) {
                        return true;
                    }
                    extDeviceStore
                        .queryBy(Ext.createDelegate(queryFn, this, [regStr], true))
                        .each(Ext.createDelegate(showMsg, this, [deviceKey, deviceData, regStr], true));

                    if (QNAP.QOS.user.isAdminGroup && QNAP.QOS.user.common.autoPlayExtDevice == 'true') {
                        os.openApp("autoPlayExtDev");
                    }
                });
            };
            extDevice.on('load', Ext.createDelegate(autoPlayExtDev, extDevice, [extDevMap, pinMap], 0), extDevice, eventCfg);
            extDevice.load();
        }

        if (reloadTask) {
            dataStore.doingTaskList.load({
                callback: function(records, options, success) {
                    var taskMap = options.taskMap;
                    var autoHide = true;
                    var msg;
                    Ext.iterate(taskMap, function(taskKey, task) {
                        if (/^(3|4)$/.test(task.severity)) {
                            if (/MSG_HA_/.test(task.msgCode)) {
                                os.openApp('HighAvailabilityApp');
                            }
                            return true;
                        } else {
                            if (pinMap[taskKey]) {
                                autoHide = false;
                            } else {
                                autoHide = true;
                            }

                            if (task.facility === facilityMap.APP_NOTIFY) {
                                msg = os.showMsg.apply(os, getExtraTaskMsg(task).concat([autoHide, task.timeSecStr]));
                            } else {
                                msg = os.showMsg.apply(os, getTaskMsg(task).concat([autoHide, task.timeSecStr]));
                            }
                            bindClickEvent(msg, task.link_id, task.link_option);
                        }
                    });
                },
                taskMap: taskMap
            });
            dataStore.doneTaskList.load();
        }

        if (reloadConnLog) {

            dataStore.connLog.on('load',
                Ext.createDelegate(function(connLogMap) {
                    var autoHide, msg;
                    if (os.dataStore.connLog.getCount() > 0) {
                        Ext.iterate(connLogMap, function(logKey, log) {
                            autoHide = true;
                            if (pinMap[logKey]) {
                                autoHide = false;
                            }
                            msg = os.showMsg.apply(os, getLogMsg(log, log.facility).concat([autoHide, log.timeSecStr]));
                            bindClickEvent(msg, log.link_id, log.link_option);
                        });
                    }
                }, null, [connLogMap]), // Ext.createDelegate end
                null, {
                    single: true
                });
            dataStore.connLog.load();
        }

        if (reloadEventLog) {

            dataStore.sysLog.on('load',
                Ext.createDelegate(function(eventLogMap) {
                    var autoHide, msg;
                    if (os.dataStore.sysLog.getCount() > 0) {
                        Ext.iterate(eventLogMap, function(logKey, log) {
                            autoHide = true;
                            if (pinMap[logKey]) {
                                autoHide = false;
                            }
                            msg = os.showMsg.apply(os, getLogMsg(log, log.facility).concat([autoHide, log.timeSecStr]));
                            bindClickEvent(msg, log.link_id, log.link_option);
                        });
                    }
                }, null, [eventLogMap]), // Ext.createDelegate end
                null, {
                    single: true
                });
            dataStore.sysLog.load();
        }

        if (reloadValume) {
            Ext.StoreMgr.item(QNAP.QOS.config.T_VOLUME_LIST).reload();
        }

        if (reloadNotice) {
            os.dataStore.notifyList.on('load', function() {
                    var msg;

                    function addClickEvent(_msg) {
                        _msg.addClass('link');
                        _msg.child('div.content').on('click', function(evt, target) {
                            os.openStorageMgr('poolTip');
                            var m = Ext.fly(target).parent('div.msg-box');
                            var msgCt = os.desktop.msgCt;
                            m.replaceClass('msg-box', 'removing-msg-box');
                            m.remove();
                            msgCt.alignTo(document, 'br-br', [-10, 7]);
                            msgCt.setStyle({
                                top: 'auto'
                            });
                        });
                    }
                    Ext.iterate(noticeMap, function(taskKey, task) {
                        if (/^(3|4)$/.test(task.severity)) {
                            return true;
                        } else {
                            var autoHide = true;
                            if (pinMap[taskKey]) {
                                autoHide = false;
                            }
                            msg = os.showMsg.apply(os, getTaskMsg(task).concat([autoHide, task.timeSecStr]));

                            switch (task.msgCode) {
                                case 'MSG_SY_002':
                                    addClickEvent(msg);
                                    break;
                                case 'QTS_QPKG_INSTALLED':
                                    os.qpkgStore.on({
                                        single: true,
                                        load: function() {
                                            os.desktop.shortcutsView.addQPKGItem(task.varContent.split(';')[0]);
                                        }
                                    });

                                    if (!os.qpkgStore.proxy.conn.isLoading) {
                                        os.qpkgStore.reload.defer(2000, os.qpkgStore);
                                    }
                                    break;
                            }
                        }
                    });
                },
                null, {
                    single: true
                }
            );
            os.dataStore.notifyList.reload();
        }

        if (reloadSysSetting) {
            os.dataStore.sysSetting.reload();
        }

        if (errorCode === 0) {
            store.baseParams.startTime = parseInt(os.dataStore.notifyStore.reader.jsonData.nowTime);
            if (lastId !== 0) {
                store.baseParams.logId = lastId;
            } else {
                delete store.baseParams.logId;
            }
        }

    },
    /**
     * 依傳的入 volumeValue 回傳 組態:硬碟編號 [鏡像硬碟群組：硬碟  3  4 ] 的字串
     * @param  {[type]} volumeValue [description]
     *         {[type]} desc        [description]
     * @return {[type]}             [description]
     */
    getVolumeDisplayName: function(volumeValue, desc) {
        var records = Ext.StoreMgr.item(QNAP.QOS.config.T_VOLUME_LIST).query('volumeValue', new RegExp('^' + RegExp.escape(volumeValue) + '$'));
        var name;
        if (records.getCount() > 0) {
            name = records.get(0).get('volumeLabel');
        } else if (/\[RAID Group \d\]/.test(desc)) {
            name = desc.match(/\[RAID Group \d\]/)[0];
        } else if (/\[Pool \d\]/.test(desc)) {
            name = desc.match(/\[Pool \d\]/)[0];
        } else {
            name = '';
        }
        return name;
    },
    clearAppFocusCookie: function(appId) {
        var pairs = document.cookie.split(";");
        var cookies = {};
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i].split("=");
            cookies[pair[0]] = window.unescape(pair[1]);
            if (pair[0].indexOf('q-app-' + appId) == 1) {
                QNAP.lib.cookie.del(pair[0], '/');
            }
        }
    },
    getQsyncSID: function() {
        var qsyncSID = QNAP.lib.cookie.get('QSYNC_SID') || QNAP.QOS.user.sid;
        var ajaxInfo = {
            url: '/cgi-bin/filemanager/utilRequest.cgi?',
            params: {
                func: 'qbox_ping_sid',
                sid: qsyncSID
            },
            method: 'POST',
            success: function(o) {
                var rs = Ext.util.JSON.decode(o.responseText);
                switch (rs.status) {
                    case 0:
                        QNAP.lib.cookie.set('QSYNC_SID', rs.sid, 60 * 60 * 24 * 7);
                        break;
                    case 4:
                    case -1:
                    case -4:
                    case -2:
                    case -15:
                    case -10:
                    case -3:
                        break;
                }
            },
            failure: function() {}
        };
        QNAP.QOS.ajax(ajaxInfo);
    },
    openURL: function(urlPath, windowId, title, w, h) {
        var iframeElCt = Ext.query('div.q-WebBrowser-window div.web-window' + (windowId ? "." + windowId : ""))[0];
        if (iframeElCt) {
            var appWinId = Ext.fly(iframeElCt).parent('div.q-WebBrowser-window').id;
            Ext.getCmp(appWinId).toFront();
            Ext.getCmp(appWinId)._getApp().setURL(urlPath, windowId, title);
        } else {
            os.openApp('WebBrowser', {
                url: urlPath,
                windowId: windowId,
                width: w,
                height: h,
                title: title
            });
        }
    },
    authPass: function() {
        _D('=== Deasktop authPass ===');
        os.desktop.loadDefaultShortcut(os.loadUserSetting, os);
        if (Ext.state.Manager.get('desktopMode') === 'forceChangePwd') {
            os.loadQTSSetting();
        } else {
            os.loadQTSSetting();
        }
        os.readyToShowUI = true;
    },
    /**
     * onQPKGStoreload description
     */
    onQPKGStoreload: function() {
        var bootingData;

        var closeWinAppID, data;
        os.qpkgStore.each(function(r) {
            data = r.data;
            if (data.appId === 'HybridBackup') {
                if (r.get('enable') === "TRUE") {
                    closeWinAppID = 'backupRestore';
                } else {
                    closeWinAppID = 'HybridBackup';
                }
                apps = os.getAppInstancesByAppId(closeWinAppID);
                Ext.each(apps, function(app) {
                    app._getMainWindow().close();
                });
                return;
            }

            if ((data.shell != "null" && data.enable != "TRUE")) {
                apps = os.getAppInstancesByAppId(data.appId);

                Ext.each(apps, function(app) {
                    app._getMainWindow().close();
                });
            }
        });

        QNAP.QOS.ajax({
            url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'userConfig.cgi'),
            params: {
                func: 'getQpkgDir'
            },
            success: function(res) {
                var me = os.desktop;
                var o = Ext.util.JSON.decode(res.responseText);
                switch (o.status) {
                    case "1":
                        Ext.each(o.qpkg, function(appId) {
                            var record = os.qpkgStore.getById(appId);
                            if (Ext.isEmpty(record)) {
                                return true;
                            }
                            switch (record.data.webUI) {
                                case 'QTS_desktop':
                                    me.loadQPKGAppItemConfig(appId);
                                    break;
                                case 'CUSTOM':
                                    me.loadQPKGEasyWizardConfig(appId);
                                    break;
                            }

                        });
                        break;
                    default:
                        break;
                }
            },
            failure: function() {},
            callback: function() {
                os.desktop.menu.listItem.initQPKGItemDelay();
            }
        });

        /* Bug#106226 auto hide update message */
        os.desktop.checkNewQPKG();

        bootingData = this.getBootingQPKGData();
        if (QNAP.QOS.config.isBooting ||
            (bootingData.bootList.length + bootingData.waitList.length > 0)) {
            this.showBootingQPKGMsg(bootingData);
        }
    },
    loadQPKGEasyWizardConfig: function(appId) {
        QNAP.QOS.ajax({
            url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'qpkg/' + appId + '/easyWizard.json'),
            success: function(res) {
                QNAP.QOS.QPKG.Map[appId] = appId;
                QNAP.QOS.QPKG.Map[appId] = {
                    appId: 'EasyWizard',
                    type: 'app',
                    extCfg: appId + '/easyWizard.json',
                    qpkgId: appId
                };
                var record = os.qpkgStore.getById(appId);
                if (record) {}
            }
        });
    },
    loadQPKGAppItemConfig: function(appId, callback) {
        function testIconPath(appId, path, bakPath) {
            var img = new Image();
            img.onerror = function() {
                QNAP.QOS.QPKG.Map[appId].icon = bakPath;
                var record = os.qpkgStore.getById(appId);
                record.set('localIcon', bakPath);
                record.set('icon', bakPath);
                record.commit();
            };
            img.src = path;
        }

        callback = callback || Ext.emptyFn;
        Ext.Ajax.request({
            url: QNAP.QOS.config.sitePath + 'qpkg/' + appId + '/config.json',
            method: 'GET',
            success: function(res) {
                var o = Ext.util.JSON.decode(res.responseText);
                if (o[appId]) {
                    var record = os.qpkgStore.getById(appId);
                    if (record) {
                        record.data.type = 'QPKGAPP';
                    } else {
                        return;
                    }
                    QNAP.QOS.QPKG.Map[appId] = o[appId];
                    var qpkgApp = QNAP.QOS.QPKG.Map[appId];
                    qpkgApp.appId = appId;
                    qpkgApp.version = record.data.version;
                    if (!Ext.isArray(qpkgApp.js)) {
                        qpkgApp.js = [qpkgApp.js];
                    }
                    Ext.each(qpkgApp.js, function(_jsPath, index) {
                        if (/\?/.test(_jsPath)) {
                            qpkgApp.js[index] = _jsPath.replace(/\?/, '?v=' + qpkgApp.version + '&');
                        } else {
                            qpkgApp.js[index] = _jsPath + '?v=' + qpkgApp.version;
                        }
                    });

                    Ext.each([68], function(size) {
                        testIconPath(qpkgApp.appId, String.format(qpkgApp.icon, size) + '?' + URL_RANDOM_NUM, record.get('icon'));
                    });
                    var iconPath = String.format(qpkgApp.icon, 68) + '?v' + qpkgApp.version;

                    record.set('localIcon', iconPath);
                    if (!record.get('isXMLIcon')) {
                        record.set('icon', iconPath);
                        if (_S[qpkgApp.qInternationalKey] || qpkgApp.qInternationalKey) {
                            record.set('qInternationalKey', qpkgApp.qInternationalKey);
                            record.set('defaultTitle', _S[qpkgApp.qInternationalKey] || qpkgApp.qInternationalKey);
                            record.set('displayName', _S[qpkgApp.qInternationalKey] || qpkgApp.qInternationalKey);
                        }
                    }

                    record.commit();
                    QNAP.QOS.QPKG.Map[appId] = qpkgApp;

                    if (qpkgApp.langJs) {
                        os.loadLang(qpkgApp.langJs, qpkgApp.langVar, function() {
                            if (!record.get('isXMLIcon')) {
                                record.set('icon', iconPath);
                                if (_S[qpkgApp.qInternationalKey] || qpkgApp.qInternationalKey) {
                                    record.set('qInternationalKey', qpkgApp.qInternationalKey);
                                    record.set('defaultTitle', _S[qpkgApp.qInternationalKey] || qpkgApp.qInternationalKey);
                                    record.set('displayName', _S[qpkgApp.qInternationalKey] || qpkgApp.qInternationalKey);
                                }
                                record.commit();
                            }
                        }, this);
                    }
                }
            },
            callback: function() {
                os.desktop.menu.listItem.initQPKGItemDelay();
                callback();
            }
        });
    },
    openAppTask: function() {
        setTimeout(function() {
            var appStr = QNAP.lib.cookie.get('open_app'),
                cpItems = os.desktop.cpItems;
            if (appStr) {
                appStr = appStr.replace(/,+/g, ",").replace(/^,$/, "");
                var apps = appStr.split(',');
                Ext.each(apps, function(appId) {
                    var inCp = cpItems[appId]; //是否透過control panel開啟
                    try {
                        if (inCp) {
                            var cfg = {
                                fn: appId
                            };
                            if (appId == 'mediaLibrary') {
                                cfg.config = {
                                    focusTab: 1
                                };
                            }
                            os.openApp("systemPreferences", cfg);
                        } else {
                            os.openApp(appId);
                        }
                    } catch (e) {
                        _D('[Err] open cookie app task', e);
                    }
                    appStr = appStr.replace(appId, "");
                });
                appStr = appStr.replace(/,+/g, ",").replace("^,$", "");
                QNAP.lib.cookie.set('open_app', appStr, null, '/');
            }

            var cookieKey = /open_url.*?(?==)/.exec(document.cookie);
            if (cookieKey) {
                cookieKey = cookieKey[0];
                var cookieValue = Ext.util.Cookies.get(cookieKey);
                QNAP.lib.cookie.del(cookieKey, '/');
                os.openURL(cookieValue, cookieKey.replace('open_url', ''));
            }
            os.desktop.openAppTask();
        }, 1000);
    },
    checkSid: function(doAuthPass, callback, scope) {
        _D('=== Desktop checkSid ===');
        var sid = QNAP.lib.cookie.get('NAS_SID') || '';
        if (QNAP.QOS.lib.supportStorage) {
            sid = sid || window.sessionStorage.getItem('NAS_SID');
        }

        function setForceChangePwd() {
            QNAP.QOS.user.forceChangePwd = true;
            Ext.state.Manager.set('keepCheckSID', false);
            Ext.state.Manager.set('desktopMode', 'forceChangePwd');
        }
        QNAP.QOS.user.sid = sid;
        if (window.forceChangePassword) {
            QNAP.QOS.user.account = window.a;
            setForceChangePwd();
            if (doAuthPass === true) {
                os.authPass();
            }
            return;
        }

        if (window.isValidResetPwd == '1' || Ext.isEmpty(sid) || sid === '') {
            os.logout();
        } else {
            var info = {
                url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'authLogin.cgi', {}),
                params: {
                    service: '1'
                },
                success: function(res) {
                    QNAP.GQ.parseGQMaster(res.responseXML);
                    var dQuery = Ext.DomQuery,
                        xmlData = res.responseXML;

                    os.qHaStatusAndLock(xmlData);

                    if (dQuery.selectValue('user', xmlData)) {
                        var user = QNAP.QOS.user,
                            config = QNAP.QOS.config;
                        user.sid = sid;
                        QNAP.QOS.lib.fixAjax();


                        user.isAdminGroup = dQuery.selectNumber('isAdmin', xmlData, 0) === 1;
                        user.account = dQuery.selectValue('user', xmlData);
                        user.type = dQuery.selectValue('userType', xmlData);
                        user.fwNotice = dQuery.selectValue('fwNotice', xmlData);
                        user.uid = dQuery.selectValue('userid', xmlData);
                        user.pwExpiryDate = dQuery.selectValue('pw_expiry_date', xmlData, '');
                        user.pwExpiryWarn = dQuery.selectValue('pw_expiry_warn', xmlData, '0') === '1';


                        config.supportRTT = dQuery.selectValue('supportRTT', xmlData);
                        config.supportQuickStart = dQuery.selectValue('quickStart', xmlData, '1') == '1';
                        config.isSMBFW = dQuery.selectValue('SMBFW', xmlData, 0) === '1';
                        config.bIsStorageV2 = (dQuery.selectValue('storage_v2', xmlData) == 1);

                        os.loadHostSetting(xmlData);

                        switch (user.type) {
                            case 'ldap':
                                user.allowChangePwd = dQuery.selectNumber('ldapDisallowChangePwd', xmlData, 0) !== 1;
                                break;
                            case 'domain':
                                user.allowChangePwd = false;
                                break;
                            default:
                                user.allowChangePwd = dQuery.selectNumber('user_pw_change', xmlData, 1) === 1;
                                break;
                        }
                        Ext.state.Manager.set('desktopMode', '');
                        if (dQuery.selectNumber('ldapResetPwd', xmlData) === 1) {
                            setForceChangePwd();
                        }

                        if (doAuthPass === true) {
                            os.authPass();
                        }

                    } else {
                        QNAP.lib.cookie.del('NAS_SID');
                        window.location.href = '/cgi-bin/login.html?' + URL_RANDOM_NUM;
                    }
                },
                failure: function() {},
                callback: callback || Ext.emptyFn,
                scope: scope || this
            };
            QNAP.QOS.ajax(info);
        }
    },
    initEvent: function() {
        var me = this;

        me.on('updateportrait', function(newPortraitURL) {
            if (newPortraitURL === QNAP.QOS.config.defaultPortraitUrl) {
                QNAP.QOS.config.hasPortrait = false;
            } else {
                QNAP.QOS.config.hasPortrait = true;
            }
            QNAP.QOS.config.myPortraitUrl = newPortraitURL;
        });
        Ext.override(Ext.Window.DD, {
            startDrag: function() {
                var w = this.win;
                this.proxy = w.ghost(w.initialConfig.cls);
                this.constrainTo(me.CMP_ID.DESKTOP, {
                    right: -w.getWidth() + 50,
                    left: -w.getWidth() + 50,
                    bottom: -w.getHeight() + 50
                });
                os.qWinMgr.each(function(win) {
                    var iframe = win.el.child('iframe');
                    if (iframe) {
                        iframe.parent().mask(null, '', 'transparent-mask');
                    }
                });
            },
            endDrag: function() {
                this.win.unghost();
                this.win.saveState();
                os.qWinMgr.each(function(win) {
                    var iframe = win.el.child('iframe');
                    if (iframe) {
                        iframe.parent().unmask();
                    }
                });
            }
        });
    },
    onServiceUpdate: function(appId, serviceName, option) {
        if (serviceName === 'fwUpdate') {
            if (!/^[0-3]$/.test(option.status)) {
                os.startTask();
            } else {
                os.qTaskMgr.stopAll();
            }
        }

        if (serviceName === 'removeVolume') {
            os.dataStore.volumeList.reload();
        } else if (serviceName === 'qpkg' && option) {
            if (option.name == 'MediaManagement') {
                Ext.Loader.load(['/cgi-bin/apps/systemPreferences/systemPreferences.json?' + (new Date() - 0)], function() {
                    os.fireEvent('serviceupdate', os.id, 'controlPanelUpdate');
                });
            } else if (option.name === 'QsyncServer') {
                os.file.loadSysSetting();
            }
            if (option.action == 'install' || option.action == 'file_install') {
                if (option.isUpdate) {
                    return;
                }

                var tip = os.desktop.desktop.headBar.menuBtn.infoTip;
                var msg = String.format(_S.QTS_DESKTOP_MSG_2, option.displayName);
                tip.initTarget(os.desktop.desktop.headBar.menuBtn);

                tip.on('hide', function(cmp) {
                    var tg = Ext.get(this.target);
                    cmp.mun(tg, 'mouseover', this.onTargetOver, this);
                    cmp.mun(tg, 'mouseout', this.onTargetOut, this);
                    cmp.mun(tg, 'mousemove', this.onMouseMove, this);
                    cmp.msg = [];
                }, tip, {
                    single: true
                });

                tip.on('close', function(cmp) {
                    var tg = Ext.get(this.target);
                    cmp.mun(tg, 'mouseover', this.onTargetOver, this);
                    cmp.mun(tg, 'mouseout', this.onTargetOut, this);
                    cmp.mun(tg, 'mousemove', this.onMouseMove, this);
                    cmp.msg = [];
                }, tip, {
                    single: true
                });

                os.qpkgStore.reload({
                    callback: function(records, options) {
                        var qpkgItem = os.qpkgStore.getById(option.name || option.displayName);

                        if (qpkgItem && qpkgItem.get('webUI') != 'null' && qpkgItem.get('enable') == 'TRUE') {
                            tip.msg.push(options.msg);
                            tip.html = tip.msg.join('<br>');
                            if (tip.rendered) {
                                tip.update(tip.html);
                            }
                            tip.showAt([20, 53]);
                            tip.anchorEl.show();
                            tip.syncAnchor();
                        }
                    },
                    msg: msg
                });
                os.serviceStore.reload({
                    callback: function() {
                        var recordIndex = os.serviceStore.find('appId', new RegExp('^' + RegExp.escape(option.name || option.displayName) + '$', 'i'));
                        if (recordIndex > 0) {
                            var record = os.serviceStore.getAt(recordIndex);
                            tip.html = tip.msg.join('<br>');
                            if (tip.rendered) {
                                tip.update(tip.html);
                            }
                            tip.showAt([20, 53]);
                            tip.anchorEl.show();
                            tip.syncAnchor();
                        }
                    }
                });
            } else if (option.action === 'start_download' ||
                option.action === 'start_install') {
                os.dataStore.notifyStore.load.defer(1000, os.dataStore.notifyStore);
            } else {
                os.qpkgStore.reload();
                os.serviceStore.reload();
            }
        } else if (serviceName === 'QsyncServer') {
            os.qpkgStore.reload();
            os.file.loadSysSetting();
        } else if (serviceName === 'generalTime') {
            Ext.StoreMgr.item(QNAP.QOS.config.T_SYS_SETTING).reload();
            os.desktop.reloadSystemDateTime();
        } else if (serviceName === 'password_strength') {
            os.desktop.checkSid(false, function() {
                os.desktop.desktop.headBar.accountBtn.menu.accountInfo.qInternationalFn();
            }, this);
        }
    },
    onFileChange: function(appId, source, target, filename, action) {
        if ((source === '/' || target === '/') && action === 'rename') {
            var exit = false;
            os.dataStore.extDevice.each(function(record) {
                Ext.each(record.get('volumns'), function(volumn) {
                    if (volumn.name === filename) {
                        os.dataStore.extDevice.reload();
                        exit = true;
                        return false;
                    }
                });
                if (exit) {
                    return false;
                }
            });
        }
    },
    imgLoadcheckDoneDelay: function() {
        os.desktop.imgLoadcheckDoneTask.delay(3000);
    },
    imgLoadcheckDone: function() {
        _D('=== Desktop imgLoadcheck initCheck ===');
        var desktop = os.desktop;
        desktop.imgLoadcheckDoneTask.cancel();
        os.initCheck(_S.QTS_INIT_LOADING, 'imgLoadcheck');
        delete desktop.basicImgs;
        delete desktop.basicImgsLoadedCount;
        desktop.basicImgs = undefined;
        desktop.basicImgsLoadedCount = undefined;
        desktop.imgLoadcheckDoneTask = Ext.emptyFn;
        desktop.imgLoaded = true;
    },
    imgLoadcheck: function(imgEl) {
        var me = this;
        if (me.imgLoaded) {
            return;
        }
        if (Ext.isEmpty(imgEl)) {
            me.basicImgsLoadedCount++;
        } else if (imgEl.complete) {
            me.basicImgsLoadedCount++;
            imgEl.onload = undefined;
            imgEl.onerror = undefined;
        } else {
            setTimeout(function() {
                me.imgLoadcheck(imgEl);
            }, 10);
        }

        if (me.basicImgsLoadedCount === me.basicImgs.length) {
            me.imgLoadcheckDone();
        } else {
            me.imgLoadcheckDoneDelay();
        }
    },
    initImg: function() {
        _D('=== Desktop initImg ===');
        var me = this,
            iconSize = 68;

        me.imgLoadcheckDoneTask = new Ext.util.DelayedTask(me.imgLoadcheckDone);

        if (Ext.isString(QNAP.QOS.user.shortcuts)) {
            QNAP.QOS.user.shortcuts = Ext.decode(QNAP.QOS.user.shortcuts);
        }

        if (QNAP.QOS.config.supportQuickStart && QNAP.QOS.user.showQuickStart) {

            me.basicImgs.push('/cgi-bin/apps/quick_start/images/btn_finish.png');
            me.basicImgs.push('/cgi-bin/apps/quick_start/images/btn_start.png');
            me.basicImgs.push('/cgi-bin/apps/quick_start/images/icon.png');

            if (QNAP.QOS.config.isSMBFW) {
                me.basicImgs.push('/cgi-bin/apps/quick_start/images/p1.png');
                me.basicImgs.push('/cgi-bin/apps/quick_start/images/p2_1.png');
                me.basicImgs.push('/cgi-bin/apps/quick_start/images/p2_2.png');
                me.basicImgs.push('/cgi-bin/apps/quick_start/images/p2_3.png');
                me.basicImgs.push('/cgi-bin/apps/quick_start/images/p2_4.png');
            } else {
                me.basicImgs.push('/cgi-bin/apps/quick_start/images/1.png');
                me.basicImgs.push('/cgi-bin/apps/quick_start/images/7.png');
                me.basicImgs.push('/cgi-bin/apps/quick_start/images/8.png');
                me.basicImgs.push('/cgi-bin/apps/quick_start/images/9.png');
                me.basicImgs.push('/cgi-bin/apps/quick_start/images/10.png');
                me.basicImgs.push('/cgi-bin/apps/quick_start/images/11.png');
                me.basicImgs.push('/cgi-bin/apps/quick_start/images/12.png');
            }
        }

        function parserShortcuts(item) {
            me.basicImgs.push(String.format(item.icon, iconSize));
            if (item.config && item.config.icon) {
                me.basicImgs.push(String.format(item.config.icon, iconSize));
            }
        }

        for (var i = 0; i < QNAP.QOS.user.shortcuts.length; i++) {
            try {
                var sc = QNAP.QOS.user.shortcuts[i];
                if (sc.icon) {
                    me.basicImgs.push(String.format(sc.icon, iconSize));
                }
                if (sc.config.icon) {
                    me.basicImgs.push(String.format(sc.config.icon, iconSize));
                }
                if (Ext.isArray(sc.items)) {
                    Ext.each(sc.items, parserShortcuts);
                }
            } catch (e) {
                _D('[Err] error path', sc);
            }

        }

        if (QNAP.QOS.user.fwNotice == '1') {
            me.basicImgs.push('/cgi-bin/images/icon/icon_add.png');
            me.basicImgs.push('/cgi-bin/images/desktop/whats_new.png');
        }

        function getLoadFn() {
            return function(e) {
                if (!e) e = window.event;
                os.desktop.imgLoadcheck(e.target || e.srcElement || e.originalTarget);
            };
        }

        function getErrorFn() {
            return function(e) {
                var me = os.desktop;
                me.basicImgsLoadedCount++;

                if (me.basicImgsLoadedCount == me.basicImgs.length) {
                    me.imgLoadcheckDone();
                } else {
                    me.imgLoadcheckDoneDelay();
                }

                var el = (e.target || e.srcElement || e.originalTarget);
                delete el.onload;
                delete el.onerror;
                el = undefined;
            };
        }

        for (i = 0; i < me.basicImgs.length; i++) {
            var img = new Image();
            img.onload = getLoadFn();

            img.onerror = getErrorFn();
            img.src = me.basicImgs[i].replace(/\?.*/, '') + '?' + URL_RANDOM_NUM;
        }
        var v = QNAP.QOS.lib.getIEVersion();
        if (v <= 8 && v > 0) {
            _D('=== initImg initCheck ===');
            os.initCheck(_S.QTS_INIT_LOADING, 'imgLoadcheck pass by IE version');
        }
    },
    initDashboard: function() {
        var view = os.getViewport(),
            me = this;
        var sysHealth = new QNAP.QOS.CMP.SysHealth({
            itemId: 'sysHealth',
            plugins: new QNAP.CMP.Plugin.DragDashBoardPanel({
                xtype: 'QSysHealth',
                cls: 'sys-health'
            }, {
                bwrapCfg: 'dark-bg'
            })
        });

        var hddHealth = new QNAP.QOS.CMP.HDDHealth({
            itemId: 'hddHealth',
            plugins: new QNAP.CMP.Plugin.DragDashBoardPanel({
                xtype: 'QHDDHealth',
                cls: 'hdd-health'
            }, {
                bwrapCfg: 'dark-bg'
            })
        });

        var storageMonitor = new QNAP.QOS.CMP.StorageMonitor({
            itemId: 'storageMonitor',
            plugins: new QNAP.CMP.Plugin.DragDashBoardPanel({
                xtype: 'QStorageMonitor',
                cls: 'storage-monitor',
            }, {
                bwrapCfg: 'dark-bg'
            })
        });

        var resourceMtr = new QNAP.QOS.CMP.ResourcesMonitor({
            itemId: 'resourceMtr',
            plugins: new QNAP.CMP.Plugin.DragDashBoardPanel({
                xtype: 'QResourcesMonitor',
                cls: 'resources-monitor',
            }, {
                bwrapCfg: 'dark-bg'
            })
        });

        var hwMonitor = new QNAP.QOS.CMP.HWMonitor({
            itemId: 'hwMonitor',
            plugins: new QNAP.CMP.Plugin.DragDashBoardPanel({
                xtype: 'QHWMonitor',
                cls: 'hardware-monitor'
            }, {
                bwrapCfg: 'dark-bg'
            })
        });

        var userMonitor = new QNAP.QOS.CMP.UserMonitor({
            itemId: 'userMonitor',
            ref: '../userMonitor',
            plugins: new QNAP.CMP.Plugin.DragDashBoardPanel({
                xtype: 'QUserMonitor',
                cls: 'user-monitor'
            }, {
                bwrapCfg: 'light-bg'
            })
        });

        var rssMonitor = new QNAP.QOS.CMP.RSSMonitor({
            itemId: 'rssMonitor',
            plugins: new QNAP.CMP.Plugin.DragDashBoardPanel({
                xtype: 'QRSSMonitor',
                cls: 'rss-monitor'
            }, {
                bwrapCfg: 'light-bg'
            })
        });

        var taskMonitor = new QNAP.QOS.CMP.ScheduleMonitor({
            itemId: 'taskMonitor',
            cls: 'task-monitor',
            plugins: new QNAP.CMP.Plugin.DragDashBoardPanel({
                xtype: 'QScheduleMonitor'
            }, {
                bwrapCfg: 'light-bg'
            })
        });

        me.dashboard = new Ext.Container({
            x: view.getWidth() - me.dashboardDefaultSize,
            cls: 'dashboard-area',
            layout: 'absolute',
            tooltip: 'DESHBOARD_TIP',
            disabled: true,
            id: me.CMP_ID.DASHBOARD,
            width: 0,
            plugins: {
                init: function(cmp) {
                    var plug = this;
                    cmp.addEvents({
                        'showDashboard': true,
                        'hideDashboard': true,
                        'ready': true
                    });

                    cmp.dashboardModelSwitch = this.dashboardModelSwitch;
                    cmp.updateDashBoardInfo = this.updateDashBoardInfo;
                    cmp.on('afterrender', this.initEvent, this, {
                        single: true
                    });
                    os.showDashboard = Ext.createDelegate(cmp.show, cmp);

                    var config = QNAP.QOS.config;
                    cmp.storeList = {};
                    cmp.storeList[config.T_DISK_STATUS] = false;
                    cmp.storeList[config.T_SYSTEM_HEALTH] = false;
                    cmp.storeList[config.T_HOST_STATUS] = false;
                    cmp.storeList[config.T_BAND_WIDTH] = false;
                    cmp.storeList[config.T_ONLINE_USERS] = false;
                    cmp.storeList[config.T_VOLUME_LIST] = false;
                    cmp.storeList[config.T_DONE_TASK_LIST] = false;
                    cmp.storeList[config.T_DOING_TASK_LIST] = false;
                    cmp.storeList[config.T_SYS_SETTING] = false;

                    Ext.iterate(cmp.storeList, function(it) {
                        var s = Ext.StoreMgr.item(it);
                        if (s.loaded) {
                            plug.checkStore.apply(cmp, [s]);
                            return;
                        }
                        cmp.mon(s, 'load', plug.checkStore, cmp, {
                            single: true
                        });
                        cmp.mon(s, 'exception', plug.checkStore, cmp, {
                            single: true
                        });
                    });
                },
                initEvent: function(cmp) {
                    new Ext.util.DelayedTask(function() {
                        if (cmp.disabled === true) {
                            cmp.setDisabled(false);
                        }
                        var item = cmp.items.itemAt(0);
                        if (item.disabled === true) {
                            item.setDisabled(false);
                        }
                        cmp.setDisabled(false);
                        cmp.fireEvent('ready');
                        cmp.isReady = true;
                        cmp.items.itemAt(0).setDisabled(false);
                    }).delay(1000 * 60);
                    cmp.setWidth(0);
                    cmp.el.on('click', this.clickDashboardTab, cmp);
                },
                clickDashboardTab: function(event, el) {
                    dashboard.addClass('dashboard-area-top');
                    if (Ext.fly(el).hasClass('tab-bar')) {
                        this.dashboardModelSwitch();
                    } else if (Ext.fly(el).is('a')) {
                        return;
                    }
                    event.stopEvent();
                },
                dashboardModelSwitch: function() {
                    var dashboard = this,
                        el = dashboard.el;
                    var size = 200;
                    var tabBar = el.child('div.tab-bar');

                    /* call dashboard come back */
                    dashboard.removeClass('go-away');

                    if (dashboard.disabled) {
                        return false;
                    }
                    switch (dashboard.modelType) {
                        case 0:
                            dashboard.modelType = 1;
                            dashboard.addClass('dashboard-area-top');
                            break;
                        case 1:
                            dashboard.modelType = 0;
                            dashboard.removeClass('dashboard-area-top');
                            break;
                    }
                    var width = dashboard.modelCfg[dashboard.modelType];
                    var left = dashboard.ownerCt.getBox().width - width;

                    if (left < 0) {
                        left = 0;
                    }

                    dashboard.setWidth(width + me.dashboardDefaultSize);
                    if (dashboard.modelType == 1) {
                        dashboard.getComponent('dashboard').el.setStyle('visibility', 'visible');
                        dashboard.getComponent('dashboard').el.setStyle('display', 'block');
                        dashboard.doLayout();
                    }

                    el.animate({
                        left: {
                            to: left
                        }
                    }, 0.35, function() {
                        if (dashboard.modelType === 0) {
                            dashboard.getComponent('dashboard').el.setStyle('visibility', 'hidden');
                            dashboard.getComponent('dashboard').el.setStyle('display', 'none');
                            dashboard.setWidth(0);
                            dashboard.fireEvent('hideDashboard');
                        } else {
                            dashboard.fireEvent('showDashboard');
                            dashboard.updateDashBoardInfo();
                        }

                    }, 'easeIn', 'run');
                },
                updateDashBoardInfo: function() {
                    sysHealth.onHostStoreLoad(os.desktop.clocks.systemUpTime.getTime());
                    sysHealth.onSysStoreLoad(Ext.StoreMgr.item(QNAP.QOS.config.T_SYSTEM_HEALTH));

                    hddHealth.onDiskStoreLoad(Ext.StoreMgr.item(QNAP.QOS.config.T_DISK_STATUS));

                    resourceMtr.onBandStoreLoad(Ext.StoreMgr.item(QNAP.QOS.config.T_BAND_WIDTH));
                    resourceMtr.onHostStoreLoad(os.initStore('system_resource'));

                    hwMonitor.onHostload(Ext.StoreMgr.item(QNAP.QOS.config.T_HOST_STATUS));

                    userMonitor.onUserStoreLoad(Ext.StoreMgr.item(QNAP.QOS.config.T_ONLINE_USERS));

                    storageMonitor.onVolumnListLoad(Ext.StoreMgr.item(QNAP.QOS.config.T_VOLUME_LIST));
                    var combo = storageMonitor.getComponent('volumeView').getComponent('volumeCombo');
                    var v = combo.getValue();
                    var record = combo.getRecord(v);
                    var volumeUsage = record.get('volumeUsage');
                    storageMonitor.diskUsage.loadData(volumeUsage);

                    taskMonitor.loadSchedul(Ext.StoreMgr.item(QNAP.QOS.config.T_DONE_TASK_LIST));
                    taskMonitor.loadSchedul(Ext.StoreMgr.item(QNAP.QOS.config.T_DOING_TASK_LIST));
                    userMonitor.refresh();
                    rssMonitor.refresh();
                },
                checkStore: function(store) {
                    var cmp = this;
                    cmp.storeList[store.storeId] = true;
                    var allStoreLoaded = true;
                    Ext.iterate(cmp.storeList, function(it, value) {
                        allStoreLoaded &= value;
                        if (!allStoreLoaded) {
                            return false;
                        }
                    });

                    if (allStoreLoaded) {
                        cmp.setDisabled(false);
                        cmp.fireEvent('ready');
                        cmp.isReady = true;
                        cmp.items.itemAt(0).setDisabled(false);
                        Ext.iterate(cmp.storeList, function(it, value) {
                            var s = Ext.StoreMgr.item(it);
                            cmp.mun(s, 'load', cmp.plugins.checkStore, cmp);
                        });
                    }
                }
            },
            items: [{
                xtype: 'container',
                cls: 'dashboard',
                itemId: 'dashboard',
                ref: 'dashboard',
                style: {
                    'visibility': 'hidden',
                    'overflow': 'hidden',
                    'display': 'none'
                },
                items: [{
                        xtype: 'box',
                        cls: 'top-layer-bg'
                    }, {
                        xtype: 'box',
                        cls: 'bottom-gray-line'
                    }, sysHealth, hddHealth, resourceMtr,
                    hwMonitor,
                    userMonitor, rssMonitor, storageMonitor,
                    taskMonitor
                ]
            }],
            modelType: 0,
            modelCfg: [me.dashboardDefaultSize,
                811
            ],
            hideDashboard: function() {
                this.removeClass('dashboard-area-top');
                if (this.modelType == 1) {
                    this.dashboardModelSwitch();
                }
            }
        });

        var dashboard = me.dashboard;
        resourceMtr.mon(view, 'afterlayout', resourceMtr.updateLienChart,
            resourceMtr);

        dashboard.dashboard.mon(view, 'afterlayout', function() {
            if (this.rendered === false || this.getWidth() === 0) {
                return;
            }
            this.items.each(function(widget) {
                if (/panel/.test(widget.getXTypes()) && widget.rendered) {
                    widget.syncSize();
                }
            });
        }, dashboard.dashboard);

        storageMonitor.mon(view, 'afterlayout', storageMonitor.reDrawPieChart,
            storageMonitor); // 畫面重新layout後 PieChart位置會跑掉

        rssMonitor.mon(view, 'afterlayout', rssMonitor.refresh, rssMonitor);

        resourceMtr.on('destroy', function() {
            resourceMtr.mun(view, 'afterlayout',
                resourceMtr.updateLienChart, resourceMtr);
        });

        storageMonitor.on('destroy', function() {
            storageMonitor.mun(view, 'afterlayout',
                storageMonitor.reDrawPieChart, storageMonitor);
        });

        rssMonitor.on('destroy', function() {
            rssMonitor.mun(view, 'afterlayout', rssMonitor.refresh, rssMonitor);
        });

        storageMonitor.mon(os, 'serviceupdate', function() {
            Ext.StoreMgr.item(QNAP.QOS.config.T_VOLUME_LIST).reload();
        }, storageMonitor);

        dashboard.mon(view, 'afterlayout', function(cmp) {
            var width = dashboard.modelCfg[dashboard.modelType],
                left = view.getBox().width - width;
            if (left < 0) {
                left = 0;
            }
            if (dashboard.el) {
                dashboard.el.setLeft(left)
                    .setWidth(width);
            }
        });

        Ext.Msg.show = Ext.createSequence(Ext.Msg.show, dashboard.hideDashboard, dashboard);

        var qWinMgr = os.qWinMgr;
        qWinMgr.bringToFront = Ext.createSequence(
            qWinMgr.bringToFront,
            dashboard.hideDashboard,
            dashboard);

        qWinMgr.register = Ext.createSequence(
            qWinMgr.register,
            dashboard.hideDashboard,
            dashboard);
    },
    initMainMenu: function() {
        var mainMenu = new QNAP.QOS.MainMenuList({
            ref: '../listItem',
            plugins: [{
                init: function(cmp) {
                    cmp.on('afterrender', this.afterRender);
                },
                afterRender: function(cmp) {
                    var scrollBar = new QNAP.CMP.Plugin.QTSScrollBar({
                        target: cmp.el,
                        content: cmp.el.child('.x-list-body')
                    });
                    cmp.refreshFn =
                        Ext.createSequence(
                            cmp.refreshFn,
                            scrollBar.updateSize,
                            cmp);
                }
            }],
            listeners: {
                single: true,
                afterrender: function(cmp) {
                    os.desktop.addContextMenuItem(cmp);
                }
            }
        });

        this.menu = new Ext.Container({
            cls: 'qts-mainmenu qnap-block--white hide',
            id: this.CMP_ID.START_MENU,
            anchor: 'l 100%',
            tooTip: 'SYSTEM_TRAY_16',
            layout: 'vbox',
            layoutConfig: {
                align: 'stretch'
            },
            items: [{
                xtype: 'container',
                cls: 'header',
                height: 50,
                ref: 'menuHeader',
                items: [{
                    xtype: 'box',
                    id: this.CMP_ID.HOSTNAME,
                    tpl: new Ext.XTemplate('<ul class="host" ><li class="hostname fb">{hostname}</li><li class="model-name">{modelName}</ul>'),
                    data: {
                        hostname: QNAP.QOS.config.hostname,
                        modelName: QNAP.QOS.config.displayModelName
                    }
                }, {
                    xtype: 'box',
                    ref: '../pageTag',
                    cls: 'page',
                    tpl: new Ext.XTemplate(
                        '<span class="previous nav"> </span>' +
                        '<ul>' +
                        '<tpl for=".">' +
                        '<li class="tag <tpl if="active==true" >active</tpl>" data-index={[xindex]} > </li>' +
                        '</tpl>' +
                        '</ul>' +
                        '<span class="next nav"> </span>')
                }],
                onClick: function(e) {
                    e.stopEvent();
                    if (e.getTarget('.tag')) {
                        this.clickPageTag(e);
                    } else if (e.getTarget('.nav')) {
                        this.navPage(e);
                    }
                },
                clickPageTag: function(e) {
                    var page = e.getTarget().getAttribute('data-index');
                    this.goPage(page);
                },
                navPage: function(e) {
                    var pageTag = this.refOwner.pageTag;
                    if (Ext.fly(e.getTarget()).hasClass('previous')) {
                        pageTag.currentIndex--;
                    } else {
                        pageTag.currentIndex++;
                    }
                    this.goPage(pageTag.currentIndex);
                },
                goPage: function(page) {
                    this.refOwner.goPage(page);
                },
                listeners: {
                    afterrender: function(cmp) {
                        cmp.el.on('click', cmp.onClick, cmp);
                    },
                    single: true
                }
            }, {
                xtype: 'container',
                flex: 1,
                ref: 'listCt',
                cls: 'listCt',
                items: [mainMenu],
            }],
            goPage: function(page) {
                var pageTag = this.pageTag;
                page = Math.max(Math.min(page, pageTag.maxIndex), 1);
                pageTag.currentIndex = page;
                this.pageTag.el.select('.tag').removeClass('active');
                this.pageTag.el.select('.tag:nth-child(' + page + ')').addClass('active');

                this.listItem.el.setStyle({
                    'transform': 'translateX(' + ((1 - page) * 298) + 'px)'
                });

                if (pageTag.currentIndex === 1) {
                    pageTag.el.replaceClass('on-last-page', 'on-first-page');
                } else if (pageTag.currentIndex === pageTag.maxIndex) {
                    pageTag.el.replaceClass('on-first-page', 'on-last-page');
                } else {
                    pageTag.removeClass(['on-last-page', 'on-first-page']);
                }
            },
            listeners: {
                afterlayout: function(cmp) {
                    var listItem = cmp.listItem,
                        viewStore = listItem.viewStore,
                        itemCount = 0;

                    viewStore.each(function(record) {
                        itemCount += record.data.items.length;
                    });

                    listItem.getNode(listItem.dataStore.getCount());

                    var pageWidth = 198 + 24,
                        totalPage = 0,
                        maxPage = Math.max(Math.floor((os.getViewport().getWidth() - pageWidth) / pageWidth), 1),
                        minWidth = pageWidth;
                    if (itemCount > 0) {
                        listItem.el.setWidth('auto');
                        var listItemEl = listItem.el,
                            lastItem = listItemEl.child('.side-menu-item:last-child');
                        var lastItemX = 0;
                        if (lastItem) {
                            lastItemX = lastItem.getOffsetsTo(listItemEl)[0];
                        }
                        totalPage = Math.floor((lastItemX + pageWidth) / pageWidth);
                        minWidth = totalPage * pageWidth;
                    }
                    if (maxPage < totalPage) {
                        minWidth = pageWidth * maxPage;
                        var tag = [],
                            dotCount = totalPage + 1 - maxPage,
                            i;
                        for (i = 0; i < dotCount; i++) {
                            tag.push({
                                active: i === 0
                            });
                        }
                        cmp.pageTag.update(tag);
                        cmp.pageTag.show();
                        cmp.pageTag.maxIndex = dotCount;
                    } else {
                        cmp.pageTag.maxIndex = 1;
                        cmp.pageTag.hide();
                    }
                    cmp.goPage(1);
                    cmp.el.setStyle({
                        'min-width': minWidth + 'px'
                    });
                    cmp.el.first().setStyle({
                        'min-width': minWidth + 'px'
                    });
                    cmp.setWidth(minWidth);
                    listItem.el.setWidth(totalPage * pageWidth);
                }
            }
        });
    },
    onWindowResize: function() {
        this.resetRootEm();
        this.checkZoom();
    },
    resetRootEm: function() {
        if (window.getComputedStyle) {
            var html = document.getElementsByTagName("html")[0];
            var fontSize = window.getComputedStyle(html, null).getPropertyValue("font-size");
            fontSize = fontSize.replace(/px/i, '');
            this.rootEm = parseInt(fontSize) / 16;
            Ext.fly(html).removeClass(['scale-100', 'scale-125', 'scale-175', 'scale-250'])
                .addClass('scale-' + (this.rootEm * 100));
        } else {
            this.rootEm = 1;
        }
    },
    checkZoom: function() {
        return;

    },
    hideZoomTip: function() {
        var zoomDivId = 'qts-zoom-msg-' + URL_RANDOM_NUM;
        var zoomMsgEl = Ext.get(zoomDivId);
        if (zoomMsgEl) {
            zoomMsgEl.removeClass('show');

            this.zoomMsgRemoveTask = undefined;
            this.zoomMsgRemoveTask = new Ext.util.DelayedTask(function(zoomDivId) {
                Ext.fly(zoomDivId).remove();
            }, this, [zoomDivId]);
            this.zoomMsgRemoveTask.delay(5000);
        }
    },
    showZoomTip: function() {
        var zoomDivId = 'qts-zoom-msg-' + URL_RANDOM_NUM;
        var zoomMsgEl = Ext.get(zoomDivId);
        var msg = '';

        if (Ext.isMac) {
            msg = _S.QTS_MSG_18_MAC;
        } else {
            msg = _S.QTS_MSG_18;
        }

        if (zoomMsgEl) {
            zoomMsgEl.addClass('show')
                .select('.msg').update(msg);
            if (this.zoomMsgRemoveTask) {
                this.zoomMsgRemoveTask.cancel();
            }
            this.zoomMsgRemoveTask = undefined;
            return;
        }

        Ext.util.CSS.swapStyleSheet('zoom-msg-css', '/cgi-bin/css/zoom_msg.css');

        os.getViewport().getEl().createChild({
                tag: 'div',
                id: zoomDivId,
                cls: 'zoom-msg show',
                cn: [{
                    tag: 'div',
                    cls: 'close'
                }, {
                    tag: 'div',
                    cls: 'msg',
                    html: msg
                }]
            })
            .select('.close').addClassOnOver('close-over').on({
                scope: this,
                click: this.hideZoomTip
            });
    },
    initDesktop: function() {
        _D('=== Desktop initDesktop ====');
        var view = os.getViewport(),
            me = this,
            CMP_ID = me.CMP_ID,
            viewW = view.getWidth();
        me.CMP_ID = {
            START_MENU: Ext.id(),
            SIDE_MENU: Ext.id(),
            QPKG_MENU: Ext.id(),
            WINDOW_DOCK: Ext.id() + '-winDock',
            DESKTOP: Ext.id() + '-desktop',
            DASHBOARD: Ext.id(),
            ABOUT_WIN: Ext.id(),
            ABOUT_MSG: Ext.id(),
            ABOUT_MSG_2: Ext.id(),
            HEADERBAR_SEARCH_RESULT: Ext.id(),
            HEADERBAR_SEARCH_INPUT: Ext.id(),
            TOOL_EXT_DRIVCE_BTN: Ext.id(),
            QNAP_UTILITY_DOCK: Ext.id('', 'utility-dock-'),
            WHATS_NEW_ITEM: Ext.id('', 'whats-new-'),
            HOSTNAME: Ext.id('', '-hostname')
        };

        var absoluteLayout = new Ext.layout.AbsoluteLayout();
        view.setLayout(absoluteLayout);
        view.addClass(QNAP.QOS.config.internalModelName + ' ' + QNAP.QOS.config.platform);
        Ext.DomHelper.insertFirst(view.el.id, {
            tag: 'img',
            cls: 'background',
            src: Ext.BLANK_IMAGE_URL
        });

        me.desktop = new Ext.Container({
            x: 0,
            y: 0,
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            boxMinHeight: 590,
            anchor: '100% 100%',
            cls: 'desktop layer-shadow ' + (QNAP.QOS.user.bgClass || QNAP.QOS.config.defaultBg),
            listeners: {
                afterrender: function(cmp) {
                    if (QNAP.QOS.lib.isMobileBrowser) {
                        cmp.setWidth(1180);
                        cmp.boxMinWidth = 1180;
                    }
                    var el = cmp.getEl(),
                        dom = el.dom;
                    el.on('scroll', function() {
                        this.scrollIntoView();
                    }, dom);
                    Ext.getBody().on('scroll', function() {
                        this.scrollIntoView();
                    }, dom);
                },
                single: true
            }
        });

        me.initHeadBar();
        var leftBorder = new Ext.BoxComponent({
            cls: 'left-border',
            ref: 'leftBorder',
            html: {
                children: {
                    cls: 'arrow'
                },
                cls: 'arrow-wrap'
            },
            listeners: {
                afterrender: function(cmp) {
                    var sv = me.shortcutsView;
                    var cmpEl = cmp.el;
                    var prePageTask = {
                        run: function() {
                            sv.setPage(sv.currentPage - 1);
                        },
                        interval: 1000 //1 second
                    };
                    var timeoutTask, taskMgr = new Ext.util.TaskRunner();

                    if (sv.currentPage === 0) {
                        cmp.addClass('first-page');
                    }

                    cmp.mon(sv, 'changepage', function(sv, newIndex, oldIndex) {
                        if (newIndex === 0) {
                            cmp.addClass('first-page');
                        } else {
                            cmp.removeClass('first-page');
                        }
                    });

                    cmpEl.on('mouseenter', function() {
                        if (Ext.dd.DragDropMgr.dragCurrent) {
                            taskMgr.stopAll();
                            timeoutTask = setTimeout(function() {
                                taskMgr.stopAll();
                                taskMgr.start(prePageTask);
                            }, 1500);
                        }
                    });

                    cmpEl.on('mousemove', function(e, el) {
                        if (sv.currentPage === 0) {
                            cmpEl.removeClass('border-mouse-over');
                        } else {
                            cmpEl.addClass('border-mouse-over');
                        }
                    });

                    cmpEl.on('mouseout', function(e, el) {
                        if (e.within(cmpEl, true)) {
                            return;
                        }
                        cmpEl.addClass('speed-hide');
                        cmpEl.removeClass('border-mouse-over');
                        cmpEl.removeClass.defer(1, cmpEl, ['speed-hide']);
                        clearTimeout(timeoutTask);
                        taskMgr.stopAll();
                    });
                    cmpEl.first().on('click', function() {
                        sv.setPage(sv.currentPage - 1);
                    });
                },
                single: true
            }
        });

        var rightBorder = new Ext.BoxComponent({
            cls: 'right-border',
            ref: 'rightBorder',
            html: {
                children: {
                    cls: 'arrow'
                },
                cls: 'arrow-wrap'
            },
            listeners: {
                afterrender: function(cmp) {
                    var sv = me.shortcutsView;
                    var cmpEl = cmp.el;
                    var nextPageTask = {
                        run: function() {
                            sv.setPage(sv.currentPage + 1);
                        },
                        interval: 1000 //1 second
                    };
                    var timeoutTask, taskMgr = new Ext.util.TaskRunner();

                    if (sv.currentPage == sv.shortcutCfg.maxPage - 1) {
                        cmp.addClass('last-page');
                    }

                    cmp.mon(sv, 'changepage', function(sv, newIndex, oldIndex) {
                        if (newIndex == sv.shortcutCfg.maxPage - 1) {
                            cmp.addClass('last-page');
                        } else {
                            cmp.removeClass('last-page');
                        }
                    });
                    cmpEl.on('mouseenter', function() {
                        if (Ext.dd.DragDropMgr.dragCurrent) {
                            taskMgr.stopAll();
                            timeoutTask = setTimeout(function() {
                                taskMgr.stopAll();
                                taskMgr.start(nextPageTask);
                            }, 1500);
                        }
                    });

                    cmpEl.on('mousemove', function() {
                        if (sv.currentPage == sv.shortcutCfg.maxPage - 1) {
                            cmpEl.removeClass('border-mouse-over');
                        } else {
                            cmpEl.addClass('border-mouse-over');
                        }
                    });

                    cmpEl.on('mouseleave', function(e, el) {
                        if (e.within(cmpEl, true)) {
                            return;
                        }

                        cmpEl.addClass('speed-hide');
                        cmpEl.removeClass('border-mouse-over');
                        cmpEl.removeClass.defer(1, cmpEl, ['speed-hide']);
                        clearTimeout(timeoutTask);
                        taskMgr.stopAll();
                    });

                    cmpEl.first().on('click', function() {
                        sv.setPage(sv.currentPage + 1);
                    });

                },
                single: true
            }
        });

        me.shortcutsView = new QNAP.QOS.ShortcutsView({
            flex: 1,
            width: '100%',
            height: '100%',
            plugins: [new Ext.DataView.DragSelector(), {
                init: function(cmp) {
                    cmp.onServiceUpdate = Ext.createDelegate(this.onServiceUpdate, cmp);
                    cmp.onQPKGUpdate = Ext.createDelegate(this.onQPKGUpdate, cmp);
                    cmp.onStationUpdate = Ext.createDelegate(this.onStationUpdate, cmp);
                    cmp.onQPKGInfoUpdate = Ext.createDelegate(this.onQPKGInfoUpdate, cmp);
                    cmp.onServiceStoreLoad = Ext.createDelegate(this.serviceStoreLoad, cmp);
                    cmp.addQPKGItem = Ext.createDelegate(this.addQPKGItem, cmp);
                    cmp.updateDisplayNameByAppId = Ext.createDelegate(this.updateDisplayNameByAppId, cmp);

                    cmp.fixItemData = cmp.fixItemData.createSequence(this.fixItemData, cmp);
                    cmp.updateQPKGIcon = this.updateQPKGIcon;
                    os.logout = Ext.createInterceptor(os.logout, cmp.saveShortcuts, cmp);
                    this.cmp = cmp;

                },
                fixItemData: function(appInfo) {
                    var reg = /hdstation/i;
                    appInfo.config = appInfo.config || {};
                    if (reg.test(appInfo.appId) || reg.test(appInfo.config.fn)) {
                        var mix = os.serviceStore.query('appId', 'hdStation');
                        mix.each(function(record) {
                            var recData = record.data;
                            if (recData.installed == '0') {
                                appInfo.config.config = appInfo.config.config || {};
                                appInfo.config.config.autoRun = 'startNow';
                                appInfo.config.needInstall = true;
                                _D('fixItemData.. needInstall', appInfo.appId);
                            }
                            return false;
                        });
                    }
                    return appInfo;
                },
                onQPKGInfoUpdate: function() {
                    var cmp = this,
                        /**
                         * if some item has update description, then shortcut need refresh.
                         * @type {Boolean}
                         */
                        hasUpdate = false;
                    if (!os.qpkgInfoStore.loaded) {
                        return;
                    }
                    var idRegx, collection, data;
                    os.qpkgInfoStore.each(function(r) {
                        data = r.data;
                        if (os.stationStore.find('appId', new RegExp('^' + RegExp.escape(data.internalName) + '$', 'i')) >= 0) {
                            return true;
                        }
                        cmp.updateDisplayNameByAppId(data.internalName, data.name);
                    });
                },
                updateQPKGIcon: function(store, record) {
                    var iconField,
                        idField,
                        idRegx,
                        newIcon,
                        iconColl,
                        groupColl;


                    if (store == os.qpkgStore) {
                        iconField = 'icon';
                        idField = 'appId';
                    } else {
                        iconField = 'icon80';
                        idField = 'internalName';
                    }

                    idRegx = new RegExp('^' + RegExp.escape(record.get(idField)) + '$', 'i');
                    newIcon = record.get(iconField);
                    iconColl = this.store.query('appId', idRegx);
                    groupColl = this.store.query('type', 'group');

                    iconColl.each(function(collItem) {
                        if (collItem.get('icon') !== newIcon) {
                            if (os.desktop.initializFinish) {
                                collItem.beginEdit();
                                collItem.set('icon', newIcon);
                                collItem.data.config.icon = newIcon;
                                collItem.endEdit();
                            } else {
                                collItem.data.icon = newIcon;
                                collItem.data.config.icon = newIcon;
                            }

                        }
                    });

                    groupColl.each(function(collGItem) {
                        Ext.each(collGItem.data.items, function(gItem) {
                            if (gItem.type != 'QPKG' && gItem.type != 'service') {
                                return true;
                            }
                            if (idRegx.test(gItem.appId)) {
                                gItem.icon = gItem.config.icon = newIcon;
                                gItem.config.icon = gItem.icon;
                            }
                        });
                    });
                    if (os.desktop.initializFinish) {
                        this.store.commitChanges();
                    }
                },
                onQPKGUpdate: function() {
                    var TARGET_TYPES = ['QPKG', 'service', 'QPKGApp'];
                    var cmp = this;
                    var removeList = [];

                    if (!os.qpkgStore.loaded) {
                        return;
                    }

                    function isQPKGEnable(data) {
                        var store, appIdRegExp, collection, record, is_enable;

                        store = os.qpkgStore;
                        appIdRegExp = new RegExp('^' + RegExp.escape(data.appId) + '$', 'i');
                        collection = store.query('name', appIdRegExp);
                        is_enable = true;

                        if (collection.getCount() === 0) {
                            is_enable = false;
                        } else {
                            record = collection.get(0); // record
                            if (record.get('enable') === 'FALSE') {
                                is_enable = false;
                            } else if (record.get('webUI') === 'null' && record.get('openIn') === 'null') {
                                is_enable = false;
                            }
                        }
                        return is_enable;
                    }

                    /**
                     * update shortcut icon display name
                     */
                    var replaceBackupStation = false;
                    var data, appId;
                    os.qpkgStore.each(function(r) {
                        data = r.data;
                        appId = r.get('appId');
                        if (os.stationStore.find('appId', new RegExp('^' + RegExp.escape(appId) + '$', 'i')) >= 0) {
                            return true;
                        }

                        cmp.updateDisplayNameByAppId(appId, data.defaultTitle, data.icon);
                        if (/HybridBackup/i.test(appId) && r.get('enable') === 'TRUE') {
                            replaceBackupStation = true;
                        }
                    });

                    if (replaceBackupStation) {
                        cmp.replaceShortcut('backupRestore', 'HybridBackup');
                    } else {
                        cmp.replaceShortcut('HybridBackup', 'backupRestore');
                    }

                    /**
                     * collection need to remove shortcut icon
                     * - QPKG not install or disabled
                     */
                    cmp.store.each(function(item) {
                        if (TARGET_TYPES.indexOf(item.data.type) >= 0) {
                            var collection = os.qpkgStore.query('name', new RegExp('^' + RegExp.escape(item.data.appId) + '$', 'i'));

                            if (RCD_QPKGS[item.data.appId] && QNAP.QOS.user.isAdminGroup) {
                                item.data.config.needInstall = collection.getCount() === 0;
                                _D('onQPKGUpdate needInstall', item.data.appId);
                            }

                            if (!isQPKGEnable(item.data)) {
                                if (removeList.indexOf(item.data.appId) < 0) {
                                    removeList.push(item.data.appId);
                                }
                            }

                        } else if (item.data.type == 'group') {
                            Ext.each(item.data.items,
                                function(gItem) {
                                    if (TARGET_TYPES.indexOf(gItem.type) === -1) {
                                        return true;
                                    }

                                    if (removeList.indexOf(gItem.appId) < 0) {
                                        if (!isQPKGEnable(gItem)) {
                                            removeList.push(gItem.appId);
                                        }
                                    } else {
                                        return true;
                                    }
                                });
                        }
                    });

                    /**
                     * remove shortcut icon
                     */
                    var QPKG;
                    Ext.each(removeList, function(appId) {
                        if (RCD_QPKGS[appId]) {
                            QPKG = os.getQPKG(appId);
                            if (QPKG && QPKG.get('enable') === 'FALSE') {
                                cmp.removeItem('appId', appId);
                            } else if (!QNAP.QOS.user.isAdminGroup) {
                                cmp.removeItem('appId', appId);
                            }
                            return;
                        }
                        cmp.removeItem('appId', appId);
                    });
                    if (os.desktop.initializFinish) {
                        cmp.store.commitChanges();
                        cmp.refresh();
                    }

                },
                addQPKGItem: function(qpkgId) {
                    var qDatas = [os.getQPKGqData(qpkgId)];
                    var hasSpace = os.desktop.shortcutsView.hasSpace(1);
                    var appIdReg = new RegExp('^' + RegExp.escape(qpkgId) + '$', 'i');
                    var qpkgData = os.qpkgStore.query('appId', appIdReg).itemAt(0);
                    var isExist = false;

                    if (qpkgId === 'HybridBackup') {
                        this.replaceShortcut('backupRestore', 'HybridBackup');
                    }

                    os.desktop.shortcutsView.store.each(function(item) {
                        if (item.data.type === 'group') {
                            Ext.each(item.data.items, function(groupItem) {
                                if (appIdReg.test(groupItem.appId)) {
                                    isExist = true;
                                    return false;
                                }
                            });
                        } else if (appIdReg.test(item.data.appId)) {
                            isExist = true;
                        }
                        if (isExist) {
                            return false;
                        }
                    });

                    if (qpkgData) {
                        if (qpkgData.get('webUI') == 'CUSTOM') {
                            os.openApp(qpkgId);
                        }

                        if (isExist) {
                            return;
                        }

                        if ((qpkgData.get('webUI') != 'null' || qpkgData.get('openIn') != 'null') && !(qpkgData.data.shell != "null" && qpkgData.data.enable != "TRUE")) {
                            if (hasSpace) {
                                os.desktop.shortcutsView.quickAdd(qDatas);
                                os.desktop.showMsg('', _S.CP_MSG_1);
                            } else {
                                os.desktop.showMsg('', _S.CP_MSG_2, false);
                            }
                        }

                    }
                },
                onServiceUpdate: function(appId, serviceName, option) {
                    var cmp = this,
                        /**
                         * if some item has update description, then shortcut need refresh.
                         * @type {Boolean}
                         */
                        hasUpdate = false,
                        totalIconCount = cmp.store.getCount();
                    var data, apps, qpkgName;

                    if (serviceName == 'fwUpdate') {
                        return;
                    }


                    if (option && (option.action === 'install' || option.action === 'file_install')) {
                        qpkgName = option.name || option.displayName;
                        if (QNAP.QOS.QPKG.Map[qpkgName]) {
                            QNAP.QOS.QPKG[qpkgName] = null;
                            delete QNAP.QOS.QPKG[qpkgName];
                        }

                        os.qpkgStore.on('load',
                            os.dataStore.notifyStore.load,
                            os.dataStore.notifyStore, {
                                single: true
                            }
                        );

                        if (!os.qpkgStore.proxy.conn.isLoading) {
                            os.qpkgStore.reload.defer(2000, os.qpkgStore);
                        }
                    } else if (option && option.action == "remove") {
                        hasUpdate = true;
                        if (RCD_QPKGS[option.name]) {
                            cmp.store.query('appId', new RegExp('^' + RegExp.escape(option.name) + '$', 'i')).each(
                                function(shortcut) {
                                    shortcut.data.config.needInstall = true;
                                });
                        } else {
                            if (option.name === 'HybridBackup') {
                                apps = os.getAppInstancesByAppId('HybridBackup');
                                Ext.each(apps, function(app) {
                                    app._getMainWindow().close();
                                });
                            } else {
                                cmp.removeItem('appId', option.name, false);
                                apps = os.getAppInstancesByAppId(option.name);
                                Ext.each(apps, function(app) {
                                    app._getMainWindow().close();
                                });
                            }
                        }
                    }
                    if (cmp.store.getCount() != totalIconCount) {
                        if (cmp.rendered && hasUpdate && os.desktop.initializFinish) {
                            cmp.refresh();
                        }
                    }
                    if (os.desktop.initializFinish) {
                        cmp.saveShortcuts();
                    }
                },
                onStationUpdate: function(appId, serviceName) {
                    var isQPKGEnable;
                    var cmp, removeList;
                    cmp = this;

                    os.stationStore.each(function(r) {
                        var data = r.data;
                        cmp.updateDisplayNameByAppId(data.appId, data.name);
                    });

                    if (!QNAP.QOS.user.isAdminGroup) {
                        removeList = [];
                        isQPKGEnable = function(data) {
                            var appIdReg = new RegExp('^' + RegExp.escape(data.appId) + '$', 'i');
                            var collection = os.stationStore.query('appId', appIdReg);
                            var qpkgCollection = os.qpkgStore.query('appId', appIdReg);
                            if (collection.getCount() === 0 && qpkgCollection.getCount() === 0) {
                                return false;
                            } else {
                                var stationRec = collection.get(0); // record
                                var qpkgRec = qpkgCollection.get(0); // record
                                if (stationRec && stationRec.get('display') === 1) {
                                    return true;
                                }
                                if (qpkgRec && qpkgRec.get('visible') === 2) {
                                    return true;
                                }
                                return false;
                            }
                        };

                        cmp.store.each(function(item) {
                            if (item.data.type == 'QPKG') {
                                if (removeList.indexOf(item.data.appId) < 0) {
                                    if (!isQPKGEnable(item.data)) {
                                        removeList.push(item.data.appId);
                                    }
                                } else {
                                    return true;
                                }
                            } else if (item.data.type == 'group') {
                                Ext.each(item.data.items,

                                    function(gItem) {
                                        if (gItem.type != 'QPKG') {
                                            return true;
                                        }
                                        if (removeList.indexOf(gItem.appId) < 0) {
                                            if (!isQPKGEnable(gItem)) {
                                                removeList.push(gItem.appId);
                                            }
                                        } else {
                                            return true;
                                        }
                                    });
                            }
                        });

                        Ext.each(removeList, function(appId) {
                            if (RCD_QPKGS[appId]) {
                                if (RCD_QPKGS[appId].isAdminOnly && !QNAP.QOS.user.isAdminGroup) {
                                    cmp.removeItem('appId', appId);
                                }
                                return;
                            }
                            cmp.removeItem('appId', appId);
                        });
                        if (removeList.length > 0) {
                            cmp.refresh();
                        }
                    }
                    cmp.store.commitChanges();
                },
                updateDisplayNameByAppId: function(appId, newName, icon) {
                    var cmp = this,
                        hasUpdate = false,
                        idRegex;

                    cmp.store.each(function(record, index) {
                        idRegex = new RegExp('^' + RegExp.escape(appId) + '$', 'i');
                        if (record.data.type === 'group') {
                            hasUpdate = true;
                            Ext.each(record.data.items, function(groupItem) {
                                if (idRegex.test(groupItem.appId)) {
                                    groupItem.displayName = newName;
                                    groupItem.qInternationalKey = newName;
                                    if (icon) {
                                        groupItem.icon = icon;
                                        groupItem.config.icon = icon;
                                    }
                                }
                            });
                        } else if (idRegex.test(record.get('appId'))) {
                            if (record.get('type') !== "folder") {
                                hasUpdate = true;
                                record.data.displayName = newName;
                                record.data.qInternationalKey = newName;
                                if (icon) {
                                    record.data.icon = icon;
                                    record.data.config.icon = icon;
                                }
                            }
                        }
                    });

                    if (hasUpdate && os.desktop.initializFinish) {
                        cmp.refresh();
                    }
                    if (appId === 'netmgr') {
                        this.updateDisplayNameByAppId('network_switch', newName, false);

                        Ext.apply(QNAP.QOS.Keyword.model.items.network_switch, {
                            defaultTitle: newName,
                            qInternationalKey: newName
                        });

                        Ext.apply(QNAP.QOS.systemItems.network_switch, {
                            defaultTitle: newName,
                            qInternationalKey: newName
                        });
                    }
                },
                serviceStoreLoad: function() {
                    var cmp = this,
                        store = os.serviceStore,
                        /**
                         * if some item has update, then shortcut need refresh.
                         * @type {Boolean}
                         */
                        hasUpdate = false;

                    var data, appIdRegExp, dataIcon, appInfo, apps;
                    var isBooting;

                    isBooting = function(record) {
                        var flag = false;

                        if (record.get('enable') === 'FALSE') {
                            return false;
                        }

                        if (QNAP.QOS.config.isBooting) {
                            return true;
                        }

                        switch (record.get('boot_run_status')) {
                            case -1: // unknow
                            case 0: // waiting
                            case 1: // booting
                                flag = true;
                                break;
                        }
                        return flag;
                    };

                    store.each(function(r) {
                        data = r.data;
                        appIdRegExp = new RegExp('^' + RegExp.escape(data.appId) + '$', 'i');
                        /**
                         * [supported description]
                         */
                        if (data.supported === '0' ||
                            (data.removed === '1' && data.enabled === '0') || // removed=1, enabled=1 只出現在 ssv
                            (!QNAP.QOS.user.isAdminGroup && data.installed === '0') ||
                            (data.installed === '1' && data.enabled === '0') ||
                            (data.allowed === '0') ||
                            (data.portEnabled === '0' && data.sslEnabled === '0')
                        ) {
                            if (data.appId === 'hdStation' && data.supported === '1') {
                                return true;
                            }
                            /**
                             * Remove desktop shortcut icon
                             * - NAS modle not support
                             * - station removed
                             * - station is admin only
                             * - station disabled & upgraded
                             */
                            if (os.qpkgStore
                                .query('appId', appIdRegExp)
                                .findIndexBy(isBooting) >= 0) {
                                return true;
                            }

                            hasUpdate = true;
                            cmp.removeItem('appId', data.appId, false);

                            Ext.each(
                                os.getAppInstancesByAppId(data.appId),
                                function(app) {
                                    app._getMainWindow().close();
                                });

                        } else if (data.installed === '1' && data.upgraded === '1') {
                            /**
                             * 已安裝且已更新
                             */
                            appInfo = QNAP.QOS.lib.getAppInfo(data.appId);
                            dataIcon = data.icon.replace(/\?.*/, '') + '?' + URL_RANDOM_NUM;

                            cmp.store.each(function(shortcut) {
                                var shortcutData = shortcut.data;
                                if (appIdRegExp.test(shortcutData.appId) || appIdRegExp.test(shortcutData.config.fn)) {
                                    if (shortcutData.type != 'folder' && shortcutData.type != 'QPKG') {
                                        shortcutData.type = appInfo.type;
                                        shortcutData.config.icon = shortcutData.icon = dataIcon;
                                        shortcutData.config.needInstall = false;
                                    }
                                }
                            });

                        } else if (data.installed === '0') {
                            /**
                             * 未安裝或未更新，needInstall=ture,
                             * 在畫面上會加上[+]符號
                             */

                            if (os.qpkgStore.query('appId', appIdRegExp).getCount() > 0) {
                                return true;
                            }

                            appInfo = QNAP.QOS.lib.getAppInfo(data.appId);
                            dataIcon = data.icon.replace(/\?.*/, '') + '?' + URL_RANDOM_NUM;
                            cmp.store.each(function(shortcut) {
                                var shortcutData = shortcut.data;
                                if (appIdRegExp.test(shortcutData.appId) || appIdRegExp.test(shortcutData.config.fn)) {
                                    if (shortcutData.type != 'folder') {
                                        shortcutData.type = appInfo.type;
                                        shortcutData.config.icon = shortcutData.icon = dataIcon;
                                        shortcutData.config.needInstall = true;
                                        if (/hdstation/i.test(shortcutData.appId) || /hdstation/i.test(shortcutData.config.fn)) {
                                            shortcutData.config.config = shortcutData.config.config || {};
                                            shortcutData.config.config.autoRun = 'startNow';
                                        }
                                    }
                                }
                            });
                        }
                    });
                    if (cmp.rendered && hasUpdate && os.desktop.initializFinish) {
                        cmp.refresh();
                    }
                }
            }],
            shortcutCfg: {
                pageTagHeight: 30,
                pageTagBottomPadding: 64,
                itemHeight: 140,
                itemWidth: 140,
                itemHGap: 30,
                itemVGap: 30,
                textHeight: 57,
                textWidth: 140,
                iconSize: 68,
                iconTextGap: 0,
                defaultTopPadding: 64,
                groupIconSize: 24,
                row: 3,
                column: 6,
                maxPage: 3
            }
        });

        var dockCt;
        if (QNAP.QOS.Environment.showDesktopBottomDock) {
            dockCt = new Ext.DataView({
                id: me.CMP_ID.QNAP_UTILITY_DOCK,
                ref: 'bottomDock',
                cls: 'desktop__bottom-dock',
                itemSelector: 'div.dock-item',
                overClass: 'active',
                hidden: QNAP.QOS.user.common.showPCUtil == 'false',
                store: new Ext.data.JsonStore({
                    root: 'items',
                    idProperty: 'label',
                    fields: ['label', 'iconCls', 'href', 'menu'],
                    help_data: {
                        items: [{
                            label: 'QTS_DESKTOP_HELP_REQ',
                            iconCls: 'help-request'
                        }]
                    },
                    data: {
                        items: [{
                            label: 'GO_TO_QNAP_CLOUD',
                            href: 'http://www.qnap.com/_jump/web/myqnapcloud.php?',
                            iconCls: 'cloud'
                        }, {
                            label: 'QNAP_UTILITY',
                            iconCls: 'tools',
                            menu: [{
                                    label: 'QNAP_MOBILE_APP',
                                    cls: 'x-menu-item--height',
                                    iconCls: 'dock-menu-item--mobile-app',
                                    href: 'http://www.qnap.com/_jump/mobile/index.php?',
                                    appendLang: true
                                },
                                {
                                    label: 'QNAP_UTILITY',
                                    cls: 'x-menu-item--height',
                                    iconCls: 'dock-menu-item--utility',
                                    href: 'http://www.qnap.com/_jump/utility/index.php?',
                                    appendLang: true
                                }
                            ]
                        }, {
                            label: 'FIRSTPAGE_FEEDBACK',
                            link: 'http://qnap.force.com/SupportForm/QTSBugReport?' + '&fw=' + QNAP.QOS.config.firmware + '-' + QNAP.QOS.config.buildTime + '&model=' + QNAP.QOS.config.displayModelName + '&',
                            iconCls: 'book',
                            menu: [{
                                label: 'FIRSTPAGE_WIKI',
                                cls: 'x-menu-item--height',
                                iconCls: 'dock-menu-item--wiki',
                                href: 'http://wiki.qnap.com/wiki/Main_Page',
                                appendLang: false
                            }, {
                                label: 'FIRSTPAGE_FORUM',
                                cls: 'x-menu-item--height',
                                iconCls: 'dock-menu-item--forum',
                                href: 'http://forum.qnap.com/',
                                appendLang: false
                            }, {
                                label: 'FIRSTPAGE_SERVICE',
                                cls: 'x-menu-item--height',
                                iconCls: 'dock-menu-item--cust-service',
                                href: 'http://www.qnap.com/_jump/nas_redirect/support.php?',
                                appendLang: true,
                                langType: 2
                            }]
                        }]
                    }
                }),
                hideMode: 'visibility',
                qInternational: true,
                imgLoadedCount: 0,
                imgMaxHeight: 0,
                nodeMinWidth: 0,
                refreshFn: function() {
                    var dv = this;
                    dv.hide();
                    dv.imgLoadedCount = 0;
                    dv.imgMaxHeight = 0;
                    dv.nodeMinWidth = 0;
                    dv.fixLayout();
                },
                fixLayout: function(e, node) {
                    var dv = this;
                    var nodes = dv.getNodes();
                    if (QNAP.QOS.user.common.showPCUtil == 'true') {
                        dv.show();
                        dv.el.show(true);
                    }
                },
                tpl: new Ext.XTemplate(
                    '<tpl for=".">',
                    '<div class="dock-item {iconCls}" ext:qtip="{[_S[values.label]||values.label]}"></div>',
                    '</tpl>',
                    '<div class="x-clear"></div>'
                ),
                openURL: function(url, pageId) {
                    window.open(url, pageId || '_blank');
                },
                initMenu: function() {
                    var menuItems = [];
                    this.store.each(function(record) {
                        var menu = record.data.menu;
                        if (menu) {
                            Ext.each(menu, function(element, index) {
                                menuItems.push({
                                    qInternational: true,
                                    qInternationalKey: element.label,
                                    text: _S[element.label] || element.label,
                                    xhref: element.href,
                                    langType: element.langType || 1,
                                    cls: 'x-menu-item--height',
                                    iconCls: 'dock-menu-item ' + element.iconCls,
                                    appendLang: element.appendLang === true,
                                    parentRecord: record
                                });
                            });
                        }
                    });
                    this.menu = new Ext.menu.Menu({
                        defaultAlign: 'bl-tl',
                        defaultOffsets: [0, 0],
                        cls: 'qnap-menu-v2 qnap-block--white',
                        minWidth: 210,
                        enableScrolling: false,
                        shadow: false,
                        margins: {
                            bottom: 10
                        },
                        items: menuItems,
                        listeners: {
                            click: function(menu, menuItem) {
                                var pageLang = '';
                                if (menuItem.langType === 2) {
                                    pageLang = QNAP.QOS.lib.getLanguageCode2();
                                } else {
                                    pageLang = QNAP.QOS.user.lang === "auto" ? QNAP.QOS.lib.browserSelectLanguage() : QNAP.QOS.user.lang;
                                }
                                this.openURL(menuItem.xhref + (menuItem.appendLang ? 'lang=' + pageLang : ''), menuItem.xhrefTarget);
                            },
                            show: function(menu) {
                                if (menu.parent_node) {
                                    Ext.fly(menu.parent_node).addClass('active-dock-item');
                                }
                            },
                            hide: function(menu) {
                                if (menu.parent_node) {
                                    Ext.fly(menu.parent_node).removeClass('active-dock-item');
                                }
                            },
                            scope: this
                        }
                    });
                },
                showMenu: function(record, node) {
                    this.menu.hide();
                    var pageLang = QNAP.QOS.user.lang === "auto" ? QNAP.QOS.lib.browserSelectLanguage() : QNAP.QOS.user.lang;
                    this.menu.items.each(function(item) {
                        if (item.parentRecord === record) {
                            item.show();
                        } else {
                            item.hide();
                        }
                    });
                    this.menu.parent_node = node;
                    this.menu.show(node);
                },
                has_helpdesk: function() {
                    var help_desk_qpkg;

                    help_desk_qpkg = os.getQPKG('helpdesk', false);

                    return help_desk_qpkg && help_desk_qpkg.get('enable') === 'TRUE' && os.compareVersions(help_desk_qpkg.get('version'), '1.0.11');
                },
                qInternational: true,
                qInternationalFn: function() {
                    var store = this.store;
                    if (this.has_helpdesk()) {
                        store.loadData(store.help_data, true);
                    } else {
                        store.removeAt(3);
                    }
                },
                listeners: {
                    afterlayout: function(dv) {
                        dv.getEl().setStyle({
                            'transform': 'scale(' + os.desktop.rootEm + ')'
                        });
                    },
                    afterrender: {
                        fn: function(cmp) {
                            cmp.el.unselectable();
                            cmp.initMenu();
                            cmp.mon(os.qpkgStore, 'load', cmp.qInternationalFn, cmp);
                        },
                        single: true
                    },
                    beforerender: {
                        fn: function() {
                            this.qInternationalFn();
                        },
                        single: true
                    },
                    click: function(dv, index, node, event) {
                        var record = dv.getRecord(node),
                            lang = QNAP.QOS.user.lang,
                            pageLang;

                        if (index === 0) {
                            pageLang = lang === "auto" ? QNAP.QOS.lib.browserSelectLanguage() : lang;
                            dv.openURL(record.data.href + 'lang=' + pageLang, '_blank');
                        } else if (index === 3) {
                            var help_desk_qpkg;

                            help_desk_qpkg = os.getQPKG('helpdesk');

                            if (help_desk_qpkg && os.compareVersions(help_desk_qpkg.get('version'), '1.0.11')) {
                                os.openApp('helpdesk', {
                                    path: 'HelpRequest'
                                });
                            } else {
                                window.open(
                                    'https://www.qnap.com/_jump/it/qts_feedback.php?' + 'lang=' + QNAP.QOS.lib.getLanguageCode2() + '&fw=' + QNAP.QOS.config.firmware + '-' + QNAP.QOS.config.buildTime + '&model=' + QNAP.QOS.config.displayModelName,
                                    'qnap-feedback');
                            }
                        } else {
                            dv.showMenu(record, node);
                        }
                    }
                }
            });
            dockCt.mon(view, 'afterlayout', function() {
                this.getEl().setStyle({
                    'transform': 'scale(' + os.desktop.rootEm + ')'
                });
            }, dockCt);
        }


        var deskContainer = {
            xtype: 'container',
            flex: 1,
            layout: 'absolute',
            cls: 'window-area',
            ref: 'windowArea',
            id: this.CMP_ID.DESKTOP,
            items: [{
                    xtype: 'box',
                    cls: 'desktop-model-name',
                    ref: 'modelName',
                    hidden: true,
                    html: QNAP.QOS.config.displayModelName,
                    plugins: {
                        init: function(cmp) {
                            cmp.on('afterrender', this.afterrender, this, {
                                single: true
                            });
                        },
                        afterrender: function(cmp) {
                            cmp.el.unselectable();
                        }
                    }
                }, {
                    xtype: 'box',
                    cls: 'desktop-datetime',
                    ref: 'dateTime',
                    html: {
                        tag: 'div',
                        children: [{
                            tag: 'div',
                            cls: 'time-ct fl',
                            children: [{
                                tag: 'div',
                                cls: 'time'
                            }, {
                                tag: 'div',
                                cls: 'meridiem',
                                style: {
                                    position: 'absolute',
                                    left: '100%',
                                    bottom: '35px'
                                }
                            }]
                        }, {
                            tag: 'div',
                            cls: 'date fn'
                        }]
                    },
                    qInternational: true,
                    qInternationalFn: function(cmp) {
                        cmp.plugins.updateDatetime.apply(cmp);
                    },
                    plugins: {
                        init: function(cmp) {
                            cmp.on('afterrender', this.afterrender, this, {
                                single: true
                            });
                        },
                        updateDatetime: function(date) {
                            var timeEl, dateEl, meridiemEl, cmp = this;

                            timeEl = cmp.el.child('div.time');
                            dateEl = cmp.el.child('div.date');
                            meridiemEl = cmp.el.child('div.meridiem');

                            var sysSetting = Ext.StoreMgr.item(QNAP.QOS.config.T_SYS_SETTING),
                                dtFormat = QNAP.QOS.user.dateTimeFormat,
                                timeformat = dtFormat.timeformat,
                                dateformat = sysSetting.mdDateFormats[dtFormat.dateformatindex - 1];

                            dateformat = dateformat.replace('m', 'M.').replace('d', 'j').replace(/(-|\.|\/)/g, ' ');

                            var tmpStr = '';
                            if (timeformat === 12) {
                                tmpStr = date.format('h:i');
                                if (timeEl.lastStr != tmpStr) {
                                    timeEl.lastStr = tmpStr;
                                    timeEl.update(timeEl.lastStr);
                                }
                                tmpStr = date.format('A');
                                if (meridiemEl.lastStr != tmpStr) {
                                    meridiemEl.lastStr = tmpStr;
                                    meridiemEl.update(meridiemEl.lastStr);
                                }
                            } else {
                                tmpStr = date.format('H:i');
                                if (timeEl.lastStr != tmpStr) {
                                    timeEl.lastStr = tmpStr;
                                    timeEl.update(timeEl.lastStr);
                                }
                                if (meridiemEl.lastStr !== '') {
                                    meridiemEl.lastStr = '';
                                    meridiemEl.update(meridiemEl.lastStr);
                                }
                            }
                            var lang = QNAP.QOS.user.lang == 'auto' ? QNAP.QOS.lib.browserSelectLanguage() : QNAP.QOS.user.lang;
                            switch (lang) {
                                case "TCH":
                                case "SCH":
                                case "JPN":
                                    dateformat = dateformat.replace('j', 'j 日');
                                    tmpStr = date.format('l, ' + dateformat);

                                    if (dateEl.lastStr != tmpStr) {
                                        dateEl.lastStr = tmpStr;
                                        dateEl.update(dateEl.lastStr);
                                    }
                                    break;
                                default:

                                    tmpStr = date.format('D., ' + dateformat);
                                    if (dateEl.lastStr != tmpStr) {
                                        dateEl.lastStr = tmpStr;
                                        dateEl.update(dateEl.lastStr);
                                    }

                                    break;
                            }
                            date = undefined;
                        },
                        afterrender: function(cmp) {
                            os.desktop.clocks.systemDateTime.on('ticktock', this.updateDatetime, cmp);
                            cmp.el.unselectable();
                        }
                    }
                },
                me.shortcutsView
            ]
        };

        if (QNAP.QOS.lib.isMobileBrowser) {
            deskContainer.width = 1180;
            deskContainer.minWidth = 1180;
        }

        me.desktop.add(deskContainer);

        this.initMainMenu();

        me.on('contextmenu', function(dv, index, domEl, e) {
            e.stopEvent();
            var contextMenu = me.contextMenu;
            contextMenu.data.appInfo = me.data[index];
            contextMenu.showAt(e.getXY());
            me.dragging = false;
        });

        me.desktop.mon(me.shortcutsView, 'afterchangepage', function(cmp, newIndex, oldIndex) {
            if (QNAP.QOS.user.bgClass == 'desktop-bg-1' ||
                QNAP.QOS.user.bgClass == 'desktop-bg-2' ||
                QNAP.QOS.user.bgClass == 'desktop-bg-3' ||
                (QNAP.QOS.user.bgClass == 'desktop-bg-cums' && QNAP.QOS.user.common.cumsWallpaperType != 'Tile')) {
                return;
            }
        });

        if (!QNAP.QOS.user.isAdminGroup) {} else {

        }

        view.add(me.desktop);
        if (QNAP.QOS.Environment.showDesktopBottomDock) {
            view.add(dockCt);
        }
        view.add(me.menu);
        view.add(leftBorder);
        view.add(rightBorder);
        if (os.loginUI) {} else {
            view.items.each(function(item) {
                if (item.el) {
                    item.el.setOpacity(0);
                }
            });
        }

        view.on('afterlayout', function(view) {
            if (!this.isFullScreen()) {
                var tmpSize = {},
                    tmpPos = {};
                os.qWinMgr.each(function(win) {
                    if (win.ddLabel) {
                        win.ddLabel.updateDragLabel();
                    }

                    if (win.maximized) {
                        tmpSize = win.restoreSize;
                        tmpPos = win.restorePos;
                        if (win.isVisible()) {
                            win.maximized = false;
                            win.maximize();
                        } else {
                            win.on('beforeshow', function(win) {
                                win.maximized = false;
                                win.maximize();
                            });
                        }
                        if (!Ext.isEmpty(tmpSize)) {
                            win.restoreSize = tmpSize;
                        }
                        if (!Ext.isEmpty(tmpPos)) {
                            win.restorePos = tmpPos;
                        }
                    }
                });
            }

            this.menu.doLayout();
            var box = view.getBox();
            this.desktop.setSize(box.width, box.height);
        }, this, {
            buffer: 300
        });

        view.addClass('viewport-transition');
    },
    initContextMenu: function() {
        var me = this;

        var desktop = Ext.getCmp(me.CMP_ID.DESKTOP);
        desktop.contextMenu = new Ext.menu.Menu({
            data: {},
            items: [{
                text: '*更換桌布',
                qInternationalKey: '*更換桌布',
                qInternational: true,
                listeners: {
                    click: function(item) {
                        os.openApp('PersonalSettings', {
                            showWallpaperPanel: true
                        });
                    }
                }
            }]
        });
        Ext.getDoc().on('contextmenu', function(event) {
            var target = event.target;
            if (/allow-select/.test(target.className || target.parentElement.className)) {
                return true;
            }
            if (target.nodeName !== 'INPUT' && target.type !== 'text' && target.nodeName !== 'TEXTAREA') {
                event.preventDefault();
            }
        });
    },
    initTask: function() {
        var ds, notifyStore, doingTaskList, doneTaskList, finishTaskList;

        ds = os.dataStore;
        notifyStore = ds.notifyStore;
        doingTaskList = ds.doingTaskList;
        doneTaskList = ds.doneTaskList;
        finishTaskList = ds.finishTaskList;

        QNAP.QOS.config.platformRadix = QNAP.QOS.config.platform == 'TS-NASARM' ? 1.5 : 1;

        if (QNAP.QOS.user.isAdminGroup) {
            notifyStore.baseParams.sid = QNAP.QOS.user.sid;
            if (QNAP.QOS.user.datetime.notify) {
                notifyStore.baseParams.startTime = QNAP.QOS.user.datetime.notify;
            }

            notifyStore.on({
                beforeload: function() {
                    if (QNAP.QOS.config.isRebooting) {
                        clearTimeout(os.desktop.timeoutMap.notifyTask);
                        os.desktop.timeoutMap.notifyTask = setTimeout(
                            function() {
                                os.dataStore.notifyStore.load();
                            },
                            15 * 1000 * QNAP.QOS.config.platformRadix); // 15 sec.
                        return false;
                    }
                    os.desktop.stopTask();
                },
                load: function(store, records) {
                    if (QNAP.QOS.config.demoSiteSuppurt == 'yes' && QNAP.QOS.user.account != 'admin') {
                        return false;
                    }
                    os.desktop.loadNotify.apply(this, [this, records]);
                    if (records.length > 0) {
                        os.saveDateTime('notify', store.baseParams.startTime);
                    }
                    clearTimeout(os.desktop.timeoutMap.notifyTask);
                    os.desktop.timeoutMap.notifyTask = setTimeout(
                        function() {
                            os.dataStore.notifyStore.load();
                        }, 15 * 1000 * QNAP.QOS.config.platformRadix); // 15 sec.
                },
                exception: function(misc) {
                    if (QNAP.QOS.config.demoSiteSuppurt == 'yes' && QNAP.QOS.user.account != 'admin') {
                        return false;
                    }
                    os.desktop.loadNotify.apply(this, [this, this.getRange()]);
                    clearTimeout(os.desktop.timeoutMap.notifyTask);
                    os.desktop.timeoutMap.notifyTask = setTimeout(
                        function() {
                            os.dataStore.notifyStore.load();
                        }, 15 * 1000 * QNAP.QOS.config.platformRadix);
                }
            });

            doingTaskList.on({
                beforeload: function(store, option) {
                    if (store.getCount() > 0 && !option.isReload) {
                        _D('[Info] doingTaskList is in reloading loop.');
                        return false;
                    }
                    if (store.isLoading) {
                        return false;
                    }
                    option.callback = Ext.createSequence(function() {
                        this.isLoading = false;
                        this.loaded = true;
                    }, option.callback || Ext.emptyFn, option.scope || store);
                    store.isLoading = true;
                    return true;
                },
                load: function(store) {
                    var totalCount = store.getCount();
                    if (totalCount > 0) {
                        clearTimeout(os.desktop.timeoutMap.doingTask);
                        os.desktop.timeoutMap.doingTask = setTimeout(function() {
                            os.dataStore.doingTaskList.load({
                                isReload: true
                            });
                        }, 15 * 1000 * QNAP.QOS.config.platformRadix);
                        if (store.lastCount != totalCount) {
                            doneTaskList.reload();
                        }
                    } else {
                        doneTaskList.reload.defer(3000, doneTaskList);
                        notifyStore.load();
                    }
                    store.lastCount = totalCount;
                },
                exception: function(store) {
                    clearTimeout(os.desktop.timeoutMap.doingTask);
                    os.desktop.timeoutMap.doingTask = setTimeout(
                        function() {
                            os.dataStore.doingTaskList.load({
                                isReload: true
                            });
                        },
                        15 * 1000 * QNAP.QOS.config.platformRadix
                    );
                }
            });

            doneTaskList.on({
                beforeload: function(store, option) {
                    if (store.isLoading) {
                        return false;
                    }
                    option.callback = Ext.createSequence(function() {
                        this.isLoading = false;
                        this.loaded = true;
                    }, option.callback || Ext.emptyFn, option.scope || store);
                    store.isLoading = true;
                    return true;
                },
                exception: function() {
                    clearTimeout(os.desktop.timeoutMap.doneTaskList);
                    os.desktop.timeoutMap.doneTaskList = setTimeout(
                        function() {
                            os.dataStore.doneTaskList.load();
                        },
                        15 * 1000 * QNAP.QOS.config.platformRadix
                    );
                }
            });

            finishTaskList.on({
                update: function(store) {
                    var hasStdTaskUnfinish = false;
                    store.each(function(record) {
                        if (/(waitDone|doing)/g.test(record.get('uiGroup')) &&
                            record.get('cat') === 'standard') {
                            hasStdTaskUnfinish = true;
                            return false;
                        }
                    });
                    if (hasStdTaskUnfinish) {
                        this.fireEvent('checkwaitdownrecord');
                        clearTimeout(os.desktop.timeoutMap.doingTask);
                        os.desktop.timeoutMap.doingTask = setTimeout(function() {
                            os.dataStore.doingTaskList.load({
                                isReload: true
                            });
                            os.dataStore.doneTaskList.load();
                        }, 15 * 1000 * QNAP.QOS.config.platformRadix);
                    }
                    finishTaskList.sort('endTimeSec', 'DESC');
                },
                buffer: 1000
            });
            this.initMediaLibPlayTask();
        }

        os.qTaskMgr.addTask(this.TASK_ID.SYS_DATETIME_TASK, {
            run: function() {
                os.desktop.reloadSystemDateTime();
            },
            interval: 300000 // 5 Mins
        });
    },
    /**
     * 因為notify 中volume display name是由volumeList提供
     * 必需等待volumeList 取得後再開始讀取notifyStore
     */
    startTask: function() {
        if (QNAP.QOS.user.isAdminGroup) {
            os.dataStore.volumeList.on('load', function() {
                os.dataStore.notifyStore.on('load', function() {
                    os.dataStore.extDevice.silent = true;
                    os.dataStore.extDevice.on('load', function(store) {
                        store.silent = false;
                    }, null, {
                        single: true
                    });
                    os.dataStore.extDevice.load();
                    os.dataStore.sysLog.load();
                    os.dataStore.connLog.load();
                    os.dataStore.notifyList.reload();
                    os.dataStore.doingTaskList.load();
                    os.dataStore.doneTaskList.load();
                }, null, {
                    single: true
                });
                os.dataStore.notifyStore.load();
            }, null, {
                single: true
            });
            os.dataStore.volumeList.load();
        }
    },
    stopTask: function() {
        clearTimeout(os.desktop.timeoutMap.notifyTask);
        clearTimeout(os.desktop.timeoutMap.finishTask);
    },
    showQuickStart: function() {
        if (QNAP.QOS.config.supportQuickStart) {
            if (QNAP.QOS.user.autoShowStorageV2) {
                var info = {
                    url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'disk/disk_manage.cgi', {}),
                    params: {
                        'func': 'extra_get',
                        'extra_vol_index': '1',
                        'dc': Math.random()
                    },
                    success: function(res) {
                        if (Ext.DomQuery.select('row', res.responseXML).length === 0) {
                            os.openApp('storageManagerV2', {
                                'autoApp': 'QuickStart',
                                'config': {
                                    'autoShow': true
                                }
                            });
                        } else {
                            os.openApp('QuickStart', {
                                autoShow: true
                            });
                        }
                        os.saveConfig('autoShowStorageV2', 'false');
                    }
                };
                Ext.Ajax.request(info);
            } else {
                os.openApp('QuickStart', {
                    autoShow: true
                });
            }
        }
    },
    resetStationWindowTitle: function(store) {
        var title = '';
        store.each(function(record) {
            title = record.get('defaultTitle');
            Ext.each(os.getAppInstancesByAppId(record.get('appId')), function(app) {
                app._getMainWindow().setTitle(title);
            });
        });
    },
    /**
     * 註冊桌面各元件間的 event 通知
     * @return {[type]} [description]
     */
    bindEvents: function() {
        var me = this,
            view = os.getViewport(),
            headBar = me.desktop.headBar,
            startMenu = Ext.getCmp(me.CMP_ID.START_MENU),
            utilityDock = Ext.getCmp(me.CMP_ID.QNAP_UTILITY_DOCK),
            shortcutsView = me.shortcutsView,
            hardwareStore = Ext.StoreMgr.item(QNAP.QOS.config.T_HOST_STATUS);

        if (shortcutsView.rendered) {
            this.bindShortcutEvents();
        } else {
            shortcutsView.on({
                afterrender: this.bindShortcutEvents,
                scope: this
            });
        }
        var DDM = Ext.dd.DDM;
        DDM.startDrag = Ext.createInterceptor(DDM.startDrag, function() {
            os.qWinMgr.each(function(win) {
                if (win.el.child('iframe')) {
                    var mask = win.body.mask(null, '', 'transparent-mask');
                }
            });
        });

        DDM.stopDrag = Ext.createInterceptor(DDM.stopDrag, function() {
            os.qWinMgr.each(function(win) {
                if (win.el.child('iframe')) {
                    win.body.unmask();
                }
            });
        });

        os.on('filechange', me.onFileChange, me);
        os.on('serviceupdate', me.onServiceUpdate, me);

        Ext.StoreMgr.item(QNAP.QOS.config.T_CPU_USAGE).on({
            beforeload: function() {
                if (os.getAppInstancesByAppId('ResourceMonitor').length > 0) {
                    this.isAutoReload = false;
                    os.qTaskMgr.startAutoReload(this.storeId);
                    return false;
                }
            },
            load: function(store) {
                if (store.getCount() > 0) {
                    var first_record, resource_record, cpu;
                    var DQ;

                    first_record = store.getAt(0);

                    if (os.getAppInstancesByAppId('ResourceMonitor').length > 0) {
                        return;
                    }

                    DQ = Ext.DomQuery;
                    resource_record = os.initStore('system_resource').getById('localhost');
                    resource_record.beginEdit();
                    resource_record.set('cpu_usage', parseFloat(first_record.get('cpu_total_usage').replace(' %', '')));
                    cpu = [];
                    Ext.each(DQ.jsSelect('cpu', store.reader.xmlData), function(node, index) {
                        cpu.push({
                            phy_id: DQ.selectNumber('phy_id', node, index),
                            cpu_usage: DQ.selectNumber('cpu_usage', node, 0)
                        });
                    });
                    resource_record.set('cpu', cpu);
                    resource_record.set('memory_total', first_record.get('memory_total'));
                    resource_record.set('memory_free', first_record.get('memory_free'));
                    resource_record.commit();
                }
            }
        });

        hardwareStore.on('load', function(store) {
            if (store.getCount() > 0) {
                var first_record;
                first_record = store.getAt(0);
                me.clocks.systemUpTime.setTime(first_record.get('uptime'));
            }
        });

        if (hardwareStore.loaded) {
            hardwareStore.fireEvent('load', hardwareStore, hardwareStore.getRange(), {});
        }

        Ext.StoreMgr.item(QNAP.QOS.config.T_SYSTEM_HEALTH).on({
            load: function(store) {
                var volume_event_changed = false;
                var event_flag;
                store.each(function(record) {
                    switch (record.get('eventID')) {
                        case '5':
                        case '10':
                            volume_event_changed = true;
                            return false;
                            break;
                    }
                });

                event_flag = volume_event_changed ? 1 : 0;

                if (event_flag !== store.last_time_event) {
                    os.fireEvent('broadcast', os.id, QNAP.EVENT.VOLUME_STATUS_CHANGE);
                    store.last_time_event = event_flag;
                }
            }
        });

        /**
         * events only for admin group users
         */
        if (QNAP.QOS.user.isAdminGroup) {
            view.on('afterlayout', function(cmp, layout) {
                var box = cmp.getBox();
                if (box.height < 820) {
                    cmp.addClass('s-widget');
                } else {
                    cmp.removeClass('s-widget');
                }
            });
            view.el.on('click', function(e) {
                var dashboard = Ext.getCmp(me.CMP_ID.DASHBOARD);
                if (dashboard.modelType == 1) {
                    dashboard.dashboardModelSwitch();
                }
            });

            os.on('broadcast', function(appId, option) {
                switch (option) {
                    case 'emptyRecycle':
                        os.dataStore.volumeList.reload();
                        break;
                    case 'ups':
                        os.dataStore.extDevice.reload();
                        break;
                    case 'powerSchedule':
                    case 'qsync_cluster_task_start':
                        os.dataStore.notifyList.reload();
                        break;
                    case QNAP.EVENT.VOLUME_STATUS_CHANGE:
                        if (appId !== os.id) {
                            Ext.StoreMgr.item(QNAP.QOS.config.T_SYSTEM_HEALTH).load();
                            Ext.StoreMgr.item(QNAP.QOS.config.T_VOLUME_LIST).load();
                            os.dataStore.notifyList.reload();
                        }
                        break;
                }
            }, os);
        }

        view.on('afterrender', function(cmp, layout) {
            this.initTouchEvent();
        }, me);

        headBar.mon(me, 'beforeCreateAppWin', function(appInfo) {
            var me = this;
            if (appInfo.appId == 'quickWizard') {
                return;
            }
            if (appInfo.showOnDock === false) {
                return;
            }
            me.addWin(appInfo);
        }, headBar);

        headBar.mon(me, 'createAppWin', function(appInfo, win) {
            var me = this;
            if (appInfo.appId == 'quickWizard') {
                return;
            }
            if (appInfo.showOnDock === false) {
                return;
            }
            if (appInfo)
                me.addWin(appInfo, win);
        }, headBar);


        QNAP.QOS.lib.addWindowEvent('click', function() {
            if (!(Ext.isIE || Ext.isIE9 || Ext.isIE10)) {
                window.focus();
            }
        });

        QNAP.QOS.lib.addWindowEvent('focus', function() {
            os.desktop.clearAppFocusCookie();
        });

        QNAP.QOS.lib.addWindowEvent('blur', function() {
            setTimeout(
                function() {
                    var activeWin = os.qWinMgr.getActive();
                    os.qWinMgr.each(function(win) {
                        var winId = win.id;

                        var action = QNAP.lib.cookie.get(winId);
                        switch (action) {
                            case 'focus':
                                os.desktop.clearAppFocusCookie();
                                os.qWinMgr.bringToFront(win);
                                break;
                            default:
                                if (win.el.child('iframe')) {
                                    var mask = win.body.mask(null, '', 'transparent-mask');
                                    mask.on('mouseover', function() {
                                        win.body.unmask();
                                        os.desktop.clearAppFocusCookie();
                                    });
                                    mask.on('dragover', function(e) {
                                        e.preventDefault();
                                        win.body.unmask();
                                        os.desktop.clearAppFocusCookie();
                                    });
                                }
                                break;
                        }
                        QNAP.lib.cookie.del(winId, '/');
                    });
                }, 50);
        });
        if (QNAP.QOS.lib.isMobileBrowser) {
            QNAP.QOS.lib.addWindowEvent('orientationchange', function() {
                me.checkViewSize();
            });
            me.checkViewSize();
            setTimeout(function() {
                me.updateViewportScal();
            }, 300);
        } else {
            document.getElementById('viewport').setAttribute('content', 'initial-scale=1, maximum-scale=1, minimum-scale=1');
        }
        Ext.EventManager.onWindowResize(me.onWindowResize, me);
        this.checkZoom();
        Ext.getBody().on('click', function(e, t) {
            os.openApp(Ext.fly(t).getAttribute('data-appId'));
        }, null, {
            delegate: '.openApp'
        });
    },
    bindShortcutEvents: function() {
        var shortcutsView = this.shortcutsView;

        shortcutsView.on('click', this.openApp4Dv, this);
        os.on('serviceupdate', shortcutsView.onServiceUpdate, shortcutsView);

        shortcutsView.mon(os.serviceStore, {
            load: shortcutsView.onServiceStoreLoad,
            scope: shortcutsView,
            buffer: 300
        });

        shortcutsView.mon(os.stationStore, {
            load: function(store) {
                shortcutsView.onStationUpdate();
                os.desktop.resetStationWindowTitle(store);
            },
            buffer: 300
        });

        shortcutsView.mon(os.qpkgStore, {
            update: function(store) {
                shortcutsView.onQPKGUpdate(store);
                os.desktop.resetStationWindowTitle(store);
            },
            load: function(store) {
                shortcutsView.onQPKGUpdate(store);
                os.desktop.resetStationWindowTitle(store);
            },
            scope: shortcutsView,
            buffer: 1000
        });

        shortcutsView.mon(os.qpkgInfoStore, {
            update: shortcutsView.updateQPKGIcon,
            load: shortcutsView.onQPKGInfoUpdate,
            scope: shortcutsView,
            buffer: 300
        });

        shortcutsView.mon(os.serviceStore, {
            update: shortcutsView.onServiceStoreLoad,
            load: shortcutsView.onServiceStoreLoad,
            scope: shortcutsView,
            buffer: 300
        });

        shortcutsView.mon(this.desktop, 'afterlayout', function() {
            if (this.initializing) {
                return;
            }
            if (this.shortcutsView.rendered) {
                this.shortcutsView.refresh();
            }
        }, this);

        shortcutsView.mon(this, 'initialized', function() {
            var shortcutsView = this;
            shortcutsView.updateRecycleBinStatusDelay();

            if (os.stationStore.loaded) {
                shortcutsView.onStationUpdate();
                os.desktop.resetStationWindowTitle(os.stationStore);
            }

            if (os.qpkgInfoStore.loaded) {
                os.qpkgInfoStore.each(function(record) {
                    shortcutsView.updateQPKGIcon.call(shortcutsView, os.qpkgInfoStore, record);
                });
            }
            if (os.qpkgStore.loaded) {
                os.qpkgStore.each(function(record) {
                    shortcutsView.updateQPKGIcon.call(shortcutsView, os.qpkgStore, record);
                });
            }

            shortcutsView.onQPKGUpdate();
            shortcutsView.onQPKGInfoUpdate();
            shortcutsView.onServiceStoreLoad();
            shortcutsView.refresh();
        }, shortcutsView, {
            single: true
        });

        if (shortcutsView.rendered && QNAP.QOS.user.isAdminGroup) {
            var dropZone = shortcutsView.dropZone;
            dropZone.notifyEnter = Ext.createSequence(
                dropZone.notifyEnter,
                function() {
                    var dashboard = Ext.getCmp(os.desktop.CMP_ID.DASHBOARD);
                    dashboard.addClass('go-away');
                }
            );
            dropZone.onNodeDrop = Ext.createSequence(
                dropZone.onNodeDrop,
                function() {
                    var dashboard = Ext.getCmp(os.desktop.CMP_ID.DASHBOARD);
                    dashboard.removeClass('go-away');
                }
            );
            dropZone.onContainerDrop = Ext.createSequence(
                dropZone.onContainerDrop,
                function() {
                    var dashboard = Ext.getCmp(os.desktop.CMP_ID.DASHBOARD);
                    dashboard.removeClass('go-away');
                }
            );
        } else {
            shortcutsView.on('afterrender', function() {
                var shortcutsView = this.shortcutsView,
                    dropZone = shortcutsView.dropZone;

                dropZone.notifyEnter = Ext.createSequence(
                    dropZone.notifyEnter,
                    function() {
                        var dashboard = Ext.getCmp(this.CMP_ID.DASHBOARD);
                        dashboard.addClass('go-away');
                    }
                );

                dropZone.onNodeDrop = Ext.createSequence(
                    dropZone.onNodeDrop,
                    function() {
                        var dashboard = Ext.getCmp(this.CMP_ID.DASHBOARD);
                        dashboard.removeClass('go-away');
                    }
                );

                dropZone.onContainerDrop = Ext.createSequence(
                    dropZone.onContainerDrop,
                    function() {
                        var dashboard = Ext.getCmp(this.CMP_ID.DASHBOARD);
                        dashboard.removeClass('go-away');
                    }
                );
            }, os.desktop, {
                single: true
            });
        }

    },
    syncDST: function(date) {
        var desktop = os.desktop,
            systemDateTime = desktop.clocks.systemDateTime,
            DSTfrom = systemDateTime.DSTfrom,
            DSTto = systemDateTime.DSTto,
            dtFormat = QNAP.QOS.user.dateTimeFormat,
            timeformat = dtFormat.timeformat,
            timeForamt = 'Y/m/d , ',
            currentDateTime;

        if (timeformat === 12) {
            timeForamt += 'h:i A';
        } else {
            timeForamt += 'H:i';
        }
        currentDateTime = date.format(timeForamt);
        if (currentDateTime === DSTfrom || currentDateTime === DSTto) {
            os.dataStore.sysSetting.reload();
        }
    },
    syncSystemDateTime: function() {

        var desktop = os.desktop,
            systemDateTime = desktop.clocks.systemDateTime,
            store = os.dataStore.sysSetting;
        if (store.getCount() === 0) {
            return;
        }
        var selectValue = Ext.DomQuery.selectValue;
        var record = store.getAt(0),
            xml = store.reader.xmlData,
            dtFormat = QNAP.QOS.user.dateTimeFormat,
            timeForamt = 'Y/m/d , ',
            defaultDSTime = '1970/01/01 , 00:01';

        systemDateTime.setTime(record.get('serverDate'));
        dtFormat.timeformat = parseInt(record.get('timeformat'), 10);

        /*
        if system is restoring config,
        dateformatindex will be 0, but 0 is erorr value
        so 0 || 1 to prevent this error
        */
        dtFormat.dateformatindex = parseInt(record.get('dateformatindex'), 10) || 1;

        timeForamt = store.ymdDateFormats[dtFormat.dateformatindex - 1] + ' , ';

        if (dtFormat.timeformat === 12) {
            timeForamt += 'h:i A';
            defaultDSTime += ' A';
        } else {
            timeForamt += 'H:i';
        }
        var DSTfrom = selectValue('DSTfrom', xml, defaultDSTime),
            DSTto = selectValue('DSTto', xml, defaultDSTime),
            currentDateTime = systemDateTime.time.getTime(),
            addEvent = false;

        addEvent = [DSTfrom, DSTto].some(function(time) {
            if (time === '--') {
                return false;
            }
            return Math.abs(Date.parseDate(time, timeForamt).getTime() - currentDateTime) < 1800000;
        });

        systemDateTime.DSTfrom = DSTfrom;
        systemDateTime.DSTto = DSTto;
        systemDateTime.un('ticktock', desktop.syncDST);
        if (addEvent) {
            systemDateTime.on('ticktock', desktop.syncDST);
        }
        if (Ext.isEmpty(QNAP.QOS.user.datetime.pageTime)) {
            QNAP.QOS.user.datetime.pageTime = parseInt(desktop.clocks.systemDateTime.getTime() / 1000);
        }
        desktop.setPowerScheduleAlert();
    },
    reloadSystemDateTime: function() {
        Ext.Ajax.request({
            url: QNAP.QOS.config.sitePath + 'userConfig.cgi',
            method: 'POST',
            params: {
                func: 'get_all',
                sid: QNAP.QOS.user.sid
            },
            success: function(response) {
                var o = Ext.decode(response.responseText),
                    sysDateTime = Date.parseDate(o.current.replace('T', ' '), "Y-m-d H:i:s");
                os.desktop.clocks.systemDateTime.setTime(sysDateTime);
                Ext.apply(QNAP.QOS.user, {
                    dateTimeFormat: {
                        current: sysDateTime,
                        timeOffset: sysDateTime.getTime() - new Date().getTime(),
                        dateformatindex: parseInt(o.dateformatindex),
                        timeformat: parseInt(o.timeformat)
                    }
                });
                os.checkSid(false, function() {
                    os.desktop.desktop.headBar.accountBtn.menu.accountInfo.qInternationalFn();
                });
            }
        });

    },
    checkViewSize: function() {
        Ext.EventManager.onWindowResize(os.desktop.updateViewportScal, null, {
            single: true
        });
        var content = ['initial-scale=1', 'maximum-scale=1', 'minimum-scale=1'].join(', ');

        var mvp = document.getElementById('viewport');
        mvp.setAttribute('content', content);
    },
    updateViewportScal: function() {
        Ext.EventManager.removeResizeListener(os.desktop.updateViewportScal);

        var minWidth = 1180;
        var minHeight = 590;
        var mvp = document.getElementById('viewport');
        var wScal = window.innerWidth / minWidth;
        var hScal = window.innerHeight / minHeight;

        var scal = Math.min(wScal, hScal).toFixed(2);

        var w = Math.floor(window.innerWidth / scal);
        var h = Math.floor(window.innerHeight / scal);
        var content;
        content = 'width=' + w +
            ', ' + 'height=' + h +
            ', ' + 'initial-scale=' + scal +
            ', ' + 'maximum-scale=' + scal +
            ', ' + 'minimum-scale=' + scal;
        if (Ext.isIos) {
            if (Ext.iosVer[0] >= 8) {
                setTimeout(function() {
                    var content = 'width=' + w + ', ' + 'height=' + h + ', ' + 'initial-scale=' + scal;
                    mvp.setAttribute('content', content);
                    os.getViewport().doLayout();
                    os.qWinMgr.each(function(win) {
                        if (win.maximized) {
                            win.maximized = false;
                            win.maximize();
                        }
                    });
                    window.scrollTo(0, 1);
                }, 50);
            } else if (Ext.iosVer[0] >= 7) {
                setTimeout(function() {
                    var content = 'width=' + w + ', ' + 'height=' + h + ', ' + 'initial-scale=' + scal;
                    mvp.setAttribute('content', content);
                    Ext.getBody().setStyle({
                        height: h + 'px',
                        width: w + 'px'
                    });
                    os.getViewport().doLayout();
                    os.desktop.desktop.el.setStyle({
                        height: '100%',
                        width: '100%'
                    });
                    os.qWinMgr.each(function(win) {
                        if (win.maximized) {
                            win.maximized = false;
                            win.maximize();
                        }
                    });

                    window.scrollTo(0, 1);
                }, 50);
            }
        } else {
            Ext.EventManager.onWindowResize(function() {
                var content = 'width=' + w + ', ' + 'height=' + h + ', ' + 'initial-scale=' + scal;
                mvp.setAttribute('content', content);

                setTimeout(function() {
                    os.getViewport().doLayout();
                    os.qWinMgr.each(function(win) {
                        if (win.maximized) {
                            win.maximized = false;
                            win.maximize();
                        }
                    });

                    window.scrollTo(0, 1);
                }, 50);
            }, null, {
                single: true
            });
        }
        mvp.setAttribute('content', content);
    },
    initTouchContextmenu: function(cmp, selector) {
        var cmpEl = cmp.el;
        cmpEl.on('touchstart', function(e) {
            if (selector && !Ext.fly(e.getTarget(selector))) {
                return;
            }
            if (os.desktop.touchContextmenu) {
                return;
            }
            var desktop = os.desktop;
            desktop.touchContextmenu = true;
            var touch = e.browserEvent.touches[0];
            desktop.touchXY = [touch.pageX, touch.pageY];

            var menuTimeout = setTimeout(function() {
                var desktop = os.desktop;
                Ext.QuickTips.getQuickTip().hide();
                cmp.contextMenu.showAt(desktop.touchXY);
                cmp.contextMenu.on('hide', function() {
                    os.desktop.touchContextmenu = false;
                }, null, {
                    single: true
                });
            }, 500);

            function timeoutFn() {
                clearTimeout(menuTimeout);
                cmpEl.un('touchend', timeoutFn);
                cmpEl.un('touchmove', timeoutFn);
                os.desktop.touchContextmenu = false;
            }
            cmpEl.on('touchmove', timeoutFn, null, {
                single: true
            });
            cmpEl.on('touchend', timeoutFn, null, {
                single: true
            });
        });
    },
    initTouchEvent: function() {
        var me = this;
        /**
         * main menu
         */
        if (me.menu.rendered) {
            QNAP.QOS.lib.addTouchScrollEvent(Ext.getCmp(me.CMP_ID.START_MENU).el);
        } else {
            me.menu.on('afterrender', function() {
                QNAP.QOS.lib.addTouchScrollEvent(Ext.getCmp(me.CMP_ID.START_MENU).el);
            }, null, {
                single: true
            });
        }

        me.initTouchContextmenu(me.shortcutsView, me.shortcutsView.itemSelector);




    },
    hideContextMenu: function() {
        var desktop = this;
        this.contextMenu.hide();
    },

    repostitionShortcuts: function() {
        var desktop = os.desktop;
        if (desktop.shortcutsView && desktop.shortcutsView.rendered) {
            desktop.shortcutsView.refresh();
        }
    },
    minimizeWin: function(win) {
        win.minimized = true;
        win.hide();
        win._getSubWin().each(function(win) {
            win.hide();
        });
    },

    fixImgPath: function(imgPath) {
        if (imgPath.indexOf('/') == -1) {
            imgPath = QNAP.QOS.config.sitePath + QNAP.QOS.config.iconPath + imgPath;
        }
        return imgPath;
    },

    getQData: function(appId) {

        var appInfo = QNAP.QOS.lib.getAppInfo(appId);
        var qData = {
            newWin: false,
            appId: appId,
            icon: appInfo.icon,
            qInternationalKey: '',
            type: 'app',
            pin: false,
            bindApp: false
        };
        return qData;
    },

    openQPKG: function(qpkgName) {
        var rs = os.qpkgStore.getById(qpkgName);
        window.open(rs.data.linkURL, window.pageRandom + '_' + qpkgName);
    },
    /**
     * 開啟QNAP Station or QPKG
     * 如果Station 未安裝，則開啟App Center 進行安裝
     * 如果是QPKG 在HTTPS protocol時判斷，是否支援
     * 如果QPKG 使用的是apache的port必須檢查apache是否啟動?(admin 限定?)
     *
     * Station 一定是QPKG，QPKG不一定是Station
     * @param  {[type]}  serviceId [description]
     * @param  {[type]}  cfg       [description]
     * @param  {Boolean} isQpkg    [description]
     * @return {[type]}            [description]
     */
    openService: function(serviceId, cfg, isQpkg) {
        if (serviceId == 'webFileManager') {
            serviceId = 'fileExplorer';
        }

        if (Ext.isEmpty(cfg)) {
            cfg = {};
        }
        var me = this,
            info = false;
        var protocol = location.protocol.toLowerCase();
        var url = location.protocol + '//' + QNAP.lib.getHostnameForIpv6(location.hostname);

        var serviceIdRegExp = new RegExp('^' + RegExp.escape(serviceId) + '$', 'i');
        var service = os.serviceStore.getAt(os.serviceStore.find('appId', serviceIdRegExp, 0, true, false));
        var station = os.stationStore.getAt(os.stationStore.find('appId', serviceIdRegExp, 0, true, false));
        var qpkgInfo = os.qpkgStore.getAt(os.qpkgStore.find('appId', serviceIdRegExp, 0, true, false));
        var windowId = window.pageRandom + '_' + serviceId;
        var dlg, app;

        if (qpkgInfo) {
            if (QNAP.QOS.config.isCloudRelayMode) {
                var notSupportRelayMode = false;
                /*
                 * port =  0, use QNAP deault web Server (80)
                 * port = -1, use QNAP System web server (8080)
                 */
                if (qpkgInfo.data.webSSLPort !== -1) {
                    notSupportRelayMode = true;
                }
                if (notSupportRelayMode) {
                    dlg = Ext.Msg.alert('', _S.CLOUD_LINK_MSG_3);
                    return false;
                }
            }
            if (QNAP.QOS.config.isBooting || qpkgInfo.get('boot_run_status') === 0 || qpkgInfo.get('boot_run_status') === 1) {
                Ext.Msg.alert('', String.format(_S.QTS_QPKG_BOOT_MSG_4.replace('{QPKG}', '{0}'), qpkgInfo.get('displayName')));
                return;
            }
            if (qpkgInfo.get('openIn') && qpkgInfo.get('openIn') != 'null') {
                var appId = qpkgInfo.get('openIn').split(',')[0];
                var focusTab = qpkgInfo.get('openIn').split(',')[1] || 0;
                me.openApp(appId, {
                    config: {
                        focusTab: parseInt(focusTab, 10)
                    }
                });
                return;
            }
            /**
             * webSSLPort = -2 or NaN
             * not support https protocol
             */
            if (cfg.skipProtocolChk !== true && protocol == 'https:' && (qpkgInfo.data.webSSLPort == -2 || isNaN(qpkgInfo.data.webSSLPort))) {
                dlg = Ext.Msg.confirm('', _S.QTS_MSG_15);
                var clickFn = function() {
                    os.openApp(serviceId, Ext.apply({
                        skipProtocolChk: true
                    }, cfg));
                };

                dlg.getBtn('yes').on('click', clickFn, null, {
                    single: true
                });

                dlg.getDialog().on('hide', function() {
                    dlg.getBtn('yes').un('click', clickFn);
                }, null, {
                    single: true
                });
                return;
            }

            /**
             * webPort = -2 or NaN
             * not support http protocol
             */
            if (qpkgInfo.data.webPort == -2 || isNaN(qpkgInfo.data.webPort)) {}
        }

        if (service) {
            if (service.data.installed == '0') {
                os.openApp('qpkg', {
                    config: {
                        install: serviceId,
                        runMore: true
                    }
                });
                return;
            }
            info = QNAP.QOS.lib.getAppInfo(service.get('appId'));
        } else if (station) {
            info = QNAP.QOS.lib.getAppInfo(station.get('appId'));
        }

        if (info === false || qpkgInfo) {
            if (qpkgInfo && qpkgInfo.data.type === 'QPKG') {
                url = '';
                if (station) {
                    Ext.applyIf(station.data, {
                        checkMLScanMode: -1
                    });
                } else {
                    station = {
                        data: {
                            checkMLScanMode: -1
                        }
                    };
                }
                if (qpkgInfo.data.linkURL) {
                    station.data.url = station.data.surl = qpkgInfo.data.linkURL;
                }
            }
        }

        if (Ext.isEmpty(station)) {
            if (QNAP.QOS.user.isAdminGroup && (!QNAP.QOS.config.apacheHttpEnable) &&
                /(musicStation|photoStation|multimediaStation)/i.test(serviceId)) {
                Ext.Msg.confirm('', _S.QPKG_WEBSERVER_REMINDER, function(btnId) {
                    if (btnId == 'yes') {
                        os.openApp('systemPreferences', {
                            app: 'systemPreferences',
                            fn: 'webServer',
                            icon: 'apps/systemPreferences/images/icon-webServer-{0}.png',
                            tag: 'webServer',
                            config: {
                                newWin: true
                            }
                        });
                    }
                });
            } else {
                Ext.Msg.alert(_S[info.qInternationalKey] || info.defaultTitle, _S.QLICENSE_WIZARD_STR69);
            }
            return;
        }

        /**
         * check Media lib scan mode
         * only admin group users,
         * must has info (is station or service)
         *
         */
        if (info &&
            QNAP.QOS.user.isAdminGroup && cfg.skipMLChk !== true &&
            QNAP.QOS.user.common.skipMLChk !== 'true' &&
            station && station.data.checkMLScanMode > -1) {

            this.on({
                loadmlinfo: function(mediaLibInfo) {
                    if (mediaLibInfo && mediaLibInfo.get('medialibEnable') === 1 &&
                        mediaLibInfo.get('medialibRTSEnable') === 0 &&
                        mediaLibInfo.get('medialibSchEnable') === 0) {
                        /**
                         * MediaLib is enable and not use real-time scan mode
                         */
                        this.showMLSettingWin(serviceId, function() {
                            os.openService(serviceId, Ext.apply({
                                skipMLChk: true
                            }, cfg));
                        }, cfg.newWin === true);
                    } else {
                        os.openService(serviceId, Ext.apply({
                            skipMLChk: true
                        }, cfg));
                    }
                },
                scope: this,
                single: true
            });

            this.laodMLStatus(cfg.newWin === true);
            return;
        }

        var iframeId = Ext.id() + serviceId;
        var waitUrl = 'wait';

        switch (protocol) {
            case 'http:':
                url += station.data.url;
                break;
            case 'https:':
                url += station.data.surl;
                break;
        }

        if ((Ext.isEmpty(url) || url == 'undefined') && RCD_QPKGS[serviceId]) {
            var qpkg = os.qpkgStore.getById(serviceId),
                rcdQPKG = RCD_QPKGS[serviceId];
            cfg = {};
            if (Ext.isEmpty(qpkg)) {
                cfg = {
                    config: {
                        install: serviceId,
                        tplCmp: rcdQPKG.QPKGFocusId,
                        tpl: rcdQPKG.QPKGFilter,
                        runMore: true
                    }
                };
            } else {
                cfg = {
                    config: {
                        install: serviceId,
                        tplCmp: 'QPKG_STRING_15',
                        tpl: 'MyApps',
                        runMore: true
                    }
                };
            }
            os.openApp('qpkg', cfg);
            return;
        }

        if (serviceId === 'surveillanceStation') {
            url += '?' + new Date().getTime();
        }

        waitUrl = url;

        if (cfg.newWin) {
            window[windowId] = window.open(url, windowId);
            window[windowId].focus();
            return;
        }

        if (info.serviceOpen == 'QOSWindow' || (qpkgInfo && qpkgInfo.get("openOnDesktop") == "1")) {
            var existApps = os.getAppInstancesByAppId(serviceId);
            if (existApps.length > 0) {
                _D('[Info] ' + existApps.length + ' ' + serviceId + ' exist already');
                app = existApps.pop();
                app._getMainWindow().show();
                app.activeApp(cfg);
                return;
            }

            var windowInfo = {};
            if (info) {
                Ext.apply(windowInfo, info);
                if (info.type == 'QPKG') {
                    Ext.applyIf(windowInfo, info.data);
                }
            } else {
                windowInfo = {
                    icon: qpkgInfo.data.icon,
                    defaultTitle: qpkgInfo.data.displayName
                };
            }

            var appInstance = new QNAP.QOS.BaseApp(info || qpkgInfo.data);
            os.addAppInstance(appInstance);

            var params = {
                appId: serviceId,
                icon: windowInfo.icon,
                width: 1030,
                height: 600,
                maximizable: false,
                minimizable: false,
                maximized: true,
                closable: false,
                qInternational: true,
                qInternationalFn: function(cmp) {
                    cmp.el.child('iframe').src = '';
                    setTimeout(function() {
                        cmp.update(Ext.DomHelper.markup({
                            tag: 'iframe',
                            id: iframeId,
                            cls: 'wait',
                            allowfullscreen: true,
                            mozallowfullscreen: true,
                            webkitallowfullscreen: true,
                            src: cmp.waitUrl + '?windowId=' + cmp.id
                        }));
                        cmp.el.child('iframe').on('focus', function() {
                            cmp.toFront();
                        });
                    }, 0);
                },
                title: _S[windowInfo.qInternationalKey] || windowInfo.defaultTitle,
                shadow: false,
                cls: 'station-window',
                waitUrl: waitUrl,
                urlQueryString: cfg.urlQueryString || '',
                plugins: {
                    initConfig: cfg,
                    init: function(cmp) {
                        var plugin = this;
                        cmp.addClass('hide-title q-window-border q-window q-' + serviceId + '-window');

                        cmp.on('show', function(cmp) {
                            cmp.update({
                                tag: 'iframe',
                                id: iframeId,
                                cls: 'wait',
                                allowfullscreen: true,
                                mozallowfullscreen: true,
                                webkitallowfullscreen: true,
                                src: cmp.waitUrl + '?windowId=' + cmp.id + '&' + cmp.urlQueryString
                            });
                            cmp.el.child('iframe').on('focus', function() {
                                if (cmp.manager.getActive() == cmp) {
                                    cmp.toFront();
                                }
                            });
                        }, cmp, {
                            single: true
                        });
                        cmp.on('show', this.focusIframe, null, {
                            buffer: 300
                        });
                        cmp.on('activate', this.focusIframe, null, {
                            buffer: 300
                        });

                        cmp.on('destroy', function() {
                            os.removeAppIinstance(cmp.appInstance);
                            cmp.appInstance.closeWin();
                            cmp.appInstance.doCloseApp();
                            cmp.appInstance.destroy();
                        });

                        cmp.on('afterrender', function(win) {
                            appInstance.activeApp(cfg);
                            win.focusEl.on('focus', plugin.focusIframe, win, {
                                buffer: 300
                            });
                        }, cmp, {
                            single: true
                        });

                        appInstance.on('destroy', function() {
                            appInstance._getMainWindow = undefined;
                            delete appInstance._getMainWindow;
                        });
                        cmp.on('beforerender', function(win) {
                            appInstance._getMainWindow = function() {
                                return win;
                            };
                        });

                        cmp.on('restore', function() {
                            var iframe = Ext.get(iframeId);
                            if (!iframe) {
                                return;
                            }
                            var h = iframe.getHeight();
                            iframe.setHeight(h - 1);

                            setTimeout(function() {
                                if (iframe.dom.style.removeAttribute) {
                                    iframe.dom.style.removeAttribute('height');
                                } else {
                                    iframe.dom.style.removeProperty('height');
                                }
                            }, 10);
                        });
                        cmp.on('resize', function() {
                            var iframe = Ext.get(iframeId);
                            if (!iframe) {
                                return;
                            }
                            var h = iframe.getHeight();
                            iframe.setHeight(h - 1);

                            setTimeout(function() {
                                if (iframe.dom.style.removeAttribute) {
                                    iframe.dom.style.removeAttribute('height');
                                } else {
                                    iframe.dom.style.removeProperty('height');
                                }
                            }, 10);
                        });
                        cmp.on('maximize', function() {
                            var iframe = Ext.get(iframeId);
                            if (!iframe) {
                                return;
                            }
                            var h = iframe.getHeight();
                            iframe.setHeight(h - 1);

                            setTimeout(function() {
                                if (iframe.dom.style.removeAttribute) {
                                    iframe.dom.style.removeAttribute('height');
                                } else {
                                    iframe.dom.style.removeProperty('height');
                                }
                            }, 10);
                        });
                        cmp.on('render', this.setup, this);

                        /**
                         * send openApp config to iframe via postmessage
                         * situation-1: app was not opened
                         * -------------------------------
                         * [1] open app
                         * [2] add ready event listeners
                         * [3] receive ready event
                         * [4] if is my iframe send config via [sendActiveConfig]
                         *
                         * situation-2: app was opened and ready
                         * -------------------------------
                         * [1] In activeApp function check app is ready via [isReadyCallback]?
                         * [2] get app ready status is ready in [isReadyCallback]
                         * [3] send config via [sendActiveConfig]
                         *
                         * situation-3: app was opened but not ready
                         * -------------------------------
                         * [1] In activeApp function check app is ready via [isReadyCallback]?
                         * [2] get app ready status is not ready in [isReadyCallback]
                         * [3] add ready event listeners
                         * [4] receive ready event
                         * [5] send config via [sendActiveConfig]
                         */
                        cmp.addReadyListener = this.addReadyListener;
                        cmp.isReadyCallback = this.isReadyCallback;
                        cmp.sendActiveConfig = this.sendActiveConfig;
                        cmp.initConfig = this.initConfig;
                        cmp.tempFn = {};
                    },
                    focusIframe: function() {
                        var win = this;
                        var iframe = win.getEl().child('iframe');
                        if (iframe && win.manager.getActive() == win) {
                            iframe.focus();
                        }
                    },
                    close: function() {
                        if (this.fireEvent('beforeclose', this) !== false) {
                            if (this.hidden) {
                                this.doClose();
                            } else {
                                this.removeClass('qEffect6').addClass('qEffect4');
                                this.el.shadow.hide();
                                this.proxy.hide();
                                this.hide.defer(500, this, [null, this.doClose, this]);
                            }
                        }
                    },
                    setup: function(cmp) {
                        cmp._getApp().activeApp = Ext.createDelegate(this.activeApp, cmp, [this.sendConfig], 0);
                        cmp.addReadyListener(cmp.initConfig);
                    },
                    onAppReady: function(initConfig, windowId, postevent) {
                        if (windowId === this.id) {
                            this._getApp().activeApp(initConfig);
                        }
                    },
                    activeApp: function(sendConfig, options) {
                        var iframe = this.getEl().child('iframe', true);
                        if (iframe) {
                            os.qMessage.isReady(iframe.contentWindow, Ext.createDelegate(this.isReadyCallback, this, [options], 0));
                        }
                    },
                    isReadyCallback: function(options, response) {
                        var ready = response.VALUE;
                        if (ready) {
                            this.sendActiveConfig(0, options, response.APP_ID);
                        } else {
                            this.addReadyListener(options);
                        }
                    },
                    addReadyListener: function(options) {
                        var tempId = new Date().getTime() + Math.random();
                        this.tempFn[tempId] = Ext.createDelegate(this.sendActiveConfig, this, [tempId, options], 0);
                        this.mon(os, 'appready', this.tempFn[tempId], this);
                    },
                    sendActiveConfig: function(tempId, options, windowId) {
                        if (windowId !== this.id) {
                            return;
                        }
                        var iframe = this.getEl().child('iframe', true);
                        if (iframe) {
                            os.qMessage.activeApp(iframe.contentWindow, options);
                            if (tempId > 0) {
                                this.mun(os, 'appready', this.tempFn[tempId], this);
                                this.tempFn[tempId] = undefined;
                            }
                        }
                    }
                }
            };

            if (QNAP.QOS.user.common.isWindowBaseMode == 'true' &&
                !QNAP.QOS.lib.isMobileBrowser) {
                params.maximized = false;
            } else {
                params.maximized = true;
            }

            if (qpkgInfo) {
                if (qpkgInfo.data.winW > 0) {
                    params.width = qpkgInfo.data.winW;
                }
                if (qpkgInfo.data.winH > 0) {
                    params.height = qpkgInfo.data.winH;
                }
                if (qpkgInfo.data.winMinW > 0) {
                    params.minWidth = qpkgInfo.data.winMinW;
                    if (params.width) {
                        params.width = Math.max(params.width, params.minWidth);
                    }
                }
                if (qpkgInfo.data.winMinH > 0) {
                    params.minHeight = qpkgInfo.data.winMinH;
                    if (params.height) {
                        params.height = Math.max(params.height, params.minHeight);
                    }
                }
            }

            params.width = Math.min(1030, params.width);
            params.height = Math.min(params.height, Math.min(600, os.desktop.desktop.getHeight() - 20));

            params.resizable = true;
            params.maximizable = true;
            params.minimizable = true;
            params.closable = true;
            params.iframeWin = true;

            me.createWindow(appInstance, params);

            Ext.util.Cookies.set(serviceId + '-action', 'open', new Date().add(Date.MINUTE, 1), '/');
            me.detectService(serviceId, url, 5, 0);
        } else {
            window[windowId] = window.open(url, windowId);
            window[windowId].focus();
        }
    },
    /**
     * 取得window正確定位，避免視窗重疊
     * @return {[type]} [description]
     */
    getWinPosition: function(win, winx, winy) {
        var viewportBox = os.getViewport().getBox();
        var XYs = [];
        var myXY = [winx, winy];
        var isOverlap = false;
        var harfH = parseInt(viewportBox.height / 2, 10);
        win.manager.each(function(w) {
            if (w == win) {
                return true;
            }
            XYs.push(w.getPosition(true));
        });
        if (XYs.length === 0) {
            return myXY;
        }
        Ext.each(XYs, function(XY) {
            if (Math.abs(XY[0] - myXY[0]) <= 40 ||
                Math.abs(XY[1] - myXY[1]) <= 40) {
                isOverlap = true;
                myXY[0] += 60;
                myXY[1] += 60;
                if (harfH < myXY[1]) {
                    myXY[1] = 5;
                }
            }
        });
        return myXY;
    },
    updateWinPosition: function(win) {
        if (win.reposition === false) {
            return;
        }
        if (win.maximized) {
            return;
        }
        var myXY = win.getPosition(true);
        myXY = this.getWinPosition(win, myXY[0], myXY[1]);
        win.setPosition(myXY[0], myXY[1]);
    },
    loadExtCfg: function(extCfg) {
        var request = QNAP.QOS.lib.getXMLHttpRequest(),
            wizCfg = {};
        if (request) {
            request.open('POST', QNAP.QOS.config.sitePath + 'qpkg/' + extCfg, false);
            request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
            request.send();
            if (request.status === 200) {
                wizCfg = Ext.decode(request.responseText);
            }
        }
        return wizCfg;
    },
    /**
     *
     * @param  {String} appId
     * @param  {Object} cfg
     * @return {[type]}       [description]
     */
    openApp: function(appId, cfg, callbackFn) {
        var CONTROL_PANEL_ID, HYBRID_BACKUP_ID,
            MEDIA_LIBRARY_ID, TRANSCODEINFO_ID,
            NETWORK_SWITCH_ID, HELPER_ID;
        var me = this,
            config = {},
            app, existApps;
        var qpkg, rcdQPKG, appInfo;
        var fixed_args;

        CONTROL_PANEL_ID = 'systemPreferences';
        HYBRID_BACKUP_ID = 'HybridBackup';
        MEDIA_LIBRARY_ID = 'mediaLibrary';
        TRANSCODEINFO_ID = 'transcodeInfo';
        QSYNCSERVER_ID = 'QsyncServer';
        HELPER_ID = 'helper';
        NETWORK_SWITCH_ID = 'network_switch';



        cfg = Ext.apply({}, cfg);
        callbackFn = callbackFn || Ext.emptyFn;

        if ((appId === TRANSCODEINFO_ID || cfg.fn === TRANSCODEINFO_ID) &&
            !me.cpItems[TRANSCODEINFO_ID]) {
            fixed_args = this.fix_open_app_args_for_transcode_info(appId, cfg);
            cfg = fixed_args.cfg;
            appId = fixed_args.app_id;
        } else if ((appId === MEDIA_LIBRARY_ID || cfg.fn === MEDIA_LIBRARY_ID) &&
            !me.cpItems[MEDIA_LIBRARY_ID]) {
            appId = TRANSCODEINFO_ID;
        } else if (appId !== HELPER_ID && (appId === NETWORK_SWITCH_ID || cfg.fn === NETWORK_SWITCH_ID)) {
            appId = 'netmgr';
        }

        if (me.cpItems[appId]) {
            cfg.fn = appId;
            appId = CONTROL_PANEL_ID;
        }


        if (appId === 'backupRestore') {
            qpkg = os.qpkgStore.getById(HYBRID_BACKUP_ID);
            if (qpkg && qpkg.get('enable') === 'TRUE') {
                appId = HYBRID_BACKUP_ID;
            }
        }

        appInfo = QNAP.QOS.lib.getAppInfo(appId);

        if (appInfo === false) {
            appInfo = os.qpkgStore.getById(appId);
            if (appInfo) {
                appInfo = appInfo.data;
                if (appInfo.webUI === 'QTS_desktop') {
                    appInfo.type = "QPKGApp";
                    os.qpkgStore.reload({
                        callback: function() {
                            os.openApp(appId, cfg);
                        }
                    });
                    return true;
                }
            } else if (RCD_QPKGS[appId]) {
                qpkg = os.qpkgStore.getById(appId);
                rcdQPKG = RCD_QPKGS[appId];
                cfg = {};
                if (Ext.isEmpty(qpkg)) {
                    cfg = {
                        config: {
                            install: appId,
                            tplCmp: rcdQPKG.QPKGFocusId,
                            tpl: rcdQPKG.QPKGFilter,
                            runMore: true
                        }
                    };
                } else {
                    cfg = {
                        config: {
                            install: appId,
                            tplCmp: 'QPKG_STRING_15',
                            tpl: 'MyApps',
                            runMore: true
                        }
                    };
                }
                os.openApp('qpkg', cfg);
                return;
            } else {
                /* Bug#105194 open uninstalled qpkg */
                var uninstall_qpkg = os.qpkgInfoStore.query('internalName', new RegExp('^' + RegExp.escape(appId) + '$', 'i')).get(0);
                if (uninstall_qpkg) {
                    cfg = {
                        config: {
                            install: appId,
                            all: true,
                            runMore: true
                        }
                    };
                    os.openApp('qpkg', cfg);
                }
                _D('[Err] ' + appId + ' open failed!!');
                return;
            }
        }

        if (appId === CONTROL_PANEL_ID) {
            cfg.icon = appInfo.icon;
        } else if (appId === QSYNCSERVER_ID && appInfo && appInfo.type !== 'QPKGApp') {
            Ext.apply(appInfo, {
                type: 'QPKG',
                webUI: 'QTS_desktop'
            });
        }

        if (appInfo.type == 'QPKGApp') {
            qpkg = os.qpkgStore.getById(appId);
            rcdQPKG = RCD_QPKGS[appId];
            if (QNAP.QOS.config.isBooting || qpkg.get('boot_run_status') === 0 || qpkg.get('boot_run_status') === 1) {
                Ext.Msg.alert('', String.format(_S.QTS_QPKG_BOOT_MSG_4.replace('{QPKG}', '{0}'), qpkg.get('displayName')));
                return;
            }
            if (Ext.isEmpty(qpkg)) {
                os.openApp('qpkg', {
                    config: {
                        install: appId,
                        tplCmp: rcdQPKG.QPKGFocusId,
                        tpl: rcdQPKG.QPKGFilter,
                        runMore: true
                    }
                });
                return;
            } else if (qpkg && qpkg.data.enable == 'FALSE') {
                os.openApp('qpkg', {
                    config: {
                        install: appId,
                        tplCmp: 'QPKG_STRING_15',
                        tpl: 'MyApps',
                        runMore: true
                    }
                });
                return;
            }
        }

        if (appInfo.type === 'QPKG' && appInfo.webUI === 'QTS_desktop') {
            if (QNAP.QOS.config.isBooting || appInfo.get('boot_run_status') === 0 || appInfo.get('boot_run_status') === 1) {
                Ext.Msg.alert('', String.format(_S.QTS_QPKG_BOOT_MSG_4.replace('{QPKG}', '{0}'), appInfo.get('displayName')));
                return;
            }
            me.loadQPKGAppItemConfig(appId, function() {
                if (QNAP.QOS.QPKG.Map[appId]) {
                    me.openApp(appId, cfg, callbackFn);
                }
            });
            return;
        }

        var appIdRexp = new RegExp('^' + RegExp.escape(appId) + '$', 'i');
        if (os.serviceStore) {
            var serviceIndex = os.serviceStore.find('appId', appIdRexp);
            if (serviceIndex >= 0) {
                var service = os.serviceStore.getAt(serviceIndex);
                if (service.get('allowed') === '0') {
                    Ext.Msg.alert(_S[appInfo.qInternationalKey] || appInfo.defaultTitle, _S.QLICENSE_WIZARD_STR69);
                    return;
                }
            }
        }


        appId = appInfo.appId || appInfo.data.appId;

        Ext.apply(config, appInfo);
        Ext.apply(config, cfg);
        if (config && config.extCfg) {
            config.extCfg = me.loadExtCfg(config.extCfg);
        }

        switch (appInfo.type) {
            case 'fn':
                if (appInfo.isAdminOnly && !QNAP.QOS.user.isAdminGroup) {
                    return;
                }
                if (appId == "MediaViewer") {
                    os.execFn(appId, cfg);
                } else {
                    os.execFn(appId, cfg);
                }
                break;
            case 'QPKGWizard':
                appId = 'easyWizard';
                config.icon = '/RSS/images/' + config.qpkgId + '.gif?' + URL_RANDOM_NUM;
                /* falls through */
            case 'app':
                if (appInfo.isAdminOnly && !QNAP.QOS.user.isAdminGroup) {
                    return;
                }
                /* falls through */
            case 'QPKGApp':
                config.id = 'q-app-' + appId + '-' + (++Ext.Component.AUTO_ID);
                existApps = os.getAppInstancesByAppId(config.appId);
                var maxWin = config.maxWin ? config.maxWin : 1;
                if (me.openingMap[appId]) {
                    return;
                }
                if (existApps.length >= maxWin) {
                    _D('[Info] ' + existApps.length + ' ' + appId + ' exist already');
                    app = existApps.pop();
                    if (config.autoShow !== false) {
                        var appWin = app._getMainWindow();
                        appWin.show();
                        var viewportBox = os.getViewport().getBox();
                        var region = appWin.el.getRegion();
                        if (region.bottom > viewportBox.height ||
                            region.right > viewportBox.width ||
                            region.left < 0) {
                            var xy = appWin.el.getAlignToXY(appWin.container, 'c-c');
                            var pos = appWin.el.translatePoints(xy[0], xy[1]);
                            var myXY = me.getWinPosition(appWin, pos.left, pos.top);
                            if (!appWin.maximized) {
                                appWin.setPosition(myXY[0], myXY[1]);
                            }
                        }
                    }
                    app.activeApp(cfg);
                    callbackFn(app);
                    return;
                } else {
                    me.openingMap[appId] = true;
                    me.fireEvent('beforeCreateAppWin', config);
                    os.loadAppJs.defer(100, os, [appId, function() {
                        callbackFn(me.createApp(config));
                    }]);
                }
                break;
            case 'service':
            case 'QPKG':
                existApps = os.getAppInstancesByAppId(appId);
                if (existApps.length >= 1) {
                    _D('[Info] ' + existApps.length + ' ' + appId + ' exist already');
                    app = existApps.pop();
                    app._getMainWindow().show();
                    app.activeApp(cfg);
                    return;
                } else {
                    if (appInfo.type == 'QPKG') {
                        me.checkQPKGLicenseStatus(appId, cfg);
                    } else {
                        os.openService(appId, cfg);
                    }
                }
                break;
            default:
                _D('[Info] what is [' + appId + '] ?');
                break;
        }
    },
    openApp4Dv: function(dv, index, node, e) {
        var desktop = this;
        if (Ext.isString(dv) && Ext.isObject(index)) {
            desktop.openApp(dv, index);
            return true;
        }

        if (dv.multiSelect && (e.shiftKey || e.ctrlKey)) {
            return;
        }
        var recoreData = dv.getRecord(node).data;
        switch (recoreData.type) {
            case 'group':
                dv.showGroupWin(dv, index, node, e);
                break;
            case 'QPKG':
                os.openApp(recoreData.appId, recoreData.config);
                break;
            default:
                desktop.openApp(recoreData.appId, recoreData.config);
                break;
        }
        dv.dragging = false;
    },
    /**
     * 右下提示訊息
     * @param  {String} title    [description]
     * @param  {String} format   [description]
     * @param  {Boolean} autoHide default is "true"
     * @param  {String} dateTime
     * @param  {String} position 'top','center' or 'bottom', defaults 'center'
     * @return {Element}
     */
    showMsg: function(title, format, autoHide, dateTime, position) {
        var me = this,
            DH = Ext.DomHelper,
            msgStr, msgEl;
        switch (position) {
            case 'top':
            case 'bottom':
                break;
            default:
                position = 'center';
                break;
        }

        function createMsgBox(t, s, datetime) {
            var tips = s.replace(/&/g, '&amp;'),
                hasTime = datetime ? true : false;
            datetime = datetime || '';
            return ['<div class="msg">',
                '<div class="x-box-tl none-bg"><div class="x-box-tr none-bg"><div class="x-box-tc none-bg"></div></div></div>',
                '<div class="x-box-ml none-bg"><div class="x-box-mr none-bg"><div class="x-box-mc none-bg">',
                '<h3>', t, '</h3>',
                '<div class="close-btn"></div>',
                '<div class="content text-over-dot ' + (hasTime ? 'content--width-time' : '') + ' " ext:qtip="' + tips + '<br>' + datetime + '" data-htmltip="true" >',
                s, '</div>',
                '<div class="datetime " ext:qtip="' + datetime + '" >', datetime, '</div>',
                '</div></div></div>',
                '<div class="x-box-bl none-bg"><div class="x-box-br none-bg"><div class="x-box-bc none-bg"></div></div></div>', '</div>'
            ].join('');
        }
        if (dateTime === '0') {
            dateTime = false;
        }

        this.initMsgCt();

        msgStr = String.format.apply(String, Array.prototype.slice.call(
            arguments, 1));

        msgStr = msgStr.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');

        msgEl = DH.append(me[position + 'MsgCt'], {
            cls: 'msg-box',
            html: createMsgBox(title, msgStr, dateTime)
        }, true);

        msgEl.slideIn('b').pause(3);
        if (autoHide !== false) {
            var number = msgEl.replaceClass.defer(3500, msgEl, ['msg-box', 'removing-msg-box']);
            msgEl.on('DOMNodeRemoved', function() {
                clearTimeout(number);
            });
            msgEl.ghost('b', {
                remove: true,
                callback: function() {
                    if (autoHide !== false) {
                        try {
                            msgEl.replaceClass('msg-box', 'removing-msg-box');
                        } catch (e) {
                            _D('[Err]', e);
                        }
                        me.msgCt.alignTo(document, 'br-br', [-10, 7]);
                        me.msgCt.setStyle({
                            top: 'auto'
                        });
                    }
                }
            });
        }

        msgEl.child('div.close-btn')
            .addClassOnOver('close-btn-hover')
            .addClassOnClick('close-btn-press')
            .on('click', function() {
                msgEl.replaceClass('msg-box', 'removing-msg-box');
                msgEl.stopFx();
                msgEl.remove();
                clearTimeout(number);
                me.msgCt.alignTo(document, 'br-br', [-10, 7]);
                me.msgCt.setStyle({
                    top: 'auto'
                });
            });

        return msgEl;
    },
    minAllWins: function() {
        var isAllHide = true;
        os.qWinMgr.each(function(cmp) {
            if (cmp instanceof Ext.Window && cmp.isVisible()) {
                isAllHide = false;
            }
            return isAllHide;
        });
        if (isAllHide) {
            os.qWinMgr.each(function(win) {
                if (win._getApp && win._getApp().showOnDock === false) {
                    return true;
                }
                if (os.qWinMgr.lastActiveWin != win) {
                    win.show();
                }
            });
            var lastActiveWin = os.qWinMgr.lastActiveWin;
            if (lastActiveWin) {
                if (lastActiveWin._getApp && lastActiveWin._getApp().showOnDock === false) {
                    return true;
                }
                os.qWinMgr.lastActiveWin.show();
            }
        } else {
            os.qWinMgr.lastActiveWin = os.qWinMgr.getActive();
            os.qWinMgr.hideAll();
        }
    },
    /**
     * 檢測Service 是否正常開啟
     * @param  {String} serviceName
     * @param  {int} max 最多檢查次數
     */
    detectService: function(serviceId, url, max, count) {
        var me = this;
        var value = QNAP.lib.cookie.get(serviceId + '-action');
        count = count ? count : 0;
        if (value == 'opened') {
            QNAP.lib.cookie.del(serviceId + '-action', '/');
        } else {
            if (count++ >= max) {
                QNAP.lib.cookie.del(serviceId + '-action', '/');
            } else {
                me.detectService.defer(1000, me, [serviceId, url, max, count]);
            }
        }
    },
    /**
     * @author Dian 20120525 依使用者設定套用桌面設定
     *
     */
    setupCumsWallpaper: function(cls, type) {
        var imgSrc = './userConfig.cgi?func=outputBgImg&imgbgName=cumsImg.jpg&sid=' + QNAP.QOS.user.sid + '&r=' + Math.random();
        var img = Ext.select('img.background');
        var desktop = this.desktop,
            desktopEl;
        var style, removeApi;
        type = type || QNAP.QOS.user.common.cumsWallpaperType;
        if (!/^desktop-bg-cums(-img)?$/.test(cls)) {
            type = 'none';
        }
        var oldCls = QNAP.QOS.user.bgClass;
        if (desktop.rendered) {
            desktopEl = desktop.el;
            desktopEl.replaceClass(oldCls, cls);
        } else {
            desktop.removeClass(oldCls).addClass(cls);
        }

        switch (cls) {
            case 'desktop-bg-1':
            case 'desktop-bg-2':
                Ext.getBody().replaceClass('light-desktop-theme', 'dark-desktop-theme');
                break;
            default:
                Ext.getBody().replaceClass('dark-desktop-theme', 'light-desktop-theme');
                break;
        }

        QNAP.QOS.user.bgClass = cls;

        if (cls === 'desktop-bg-cums-color') {

            style = ".cums-color-wallpaper, .desktop-bg-cums-color{background: " +
                "-webkit-linear-gradient(45deg,  hsl({0}, {1}%,  {2}%)  0%,  transparent 70%), " +
                "-webkit-linear-gradient(135deg, hsl({3}, {4}%,  {5}%)  10%, transparent 80%), " +
                "-webkit-linear-gradient(225deg, hsl({6}, {7}%,  {8}%)  10%, transparent 80%),  " +
                "-webkit-linear-gradient(315deg, hsl({9}, {10}%, {11}%) 50%, transparent 100%)," +
                "url(/cgi-bin/apps/personalSettings/images/{12}.png);" +
                "background:  " +
                "-ms-linear-gradient(45deg,  hsl({0}, {1}%,  {2}%)  0%,  transparent 70%),  " +
                "-ms-linear-gradient(135deg, hsl({3}, {4}%,  {5}%)  10%, transparent 80%),  " +
                "-ms-linear-gradient(225deg, hsl({6}, {7}%,  {8}%)  10%, transparent 80%),  " +
                "-ms-linear-gradient(315deg, hsl({9}, {10}%, {11}%) 50%, transparent 100%), " +
                "url(/cgi-bin/apps/personalSettings/images/{12}.png);" +
                "background:  " +
                "linear-gradient(45deg,  hsl({0}, {1}%,  {2}%)  0%,  transparent 70%),  " +
                "linear-gradient(135deg, hsl({3}, {4}%,  {5}%)  10%, transparent 80%),  " +
                "linear-gradient(225deg, hsl({6}, {7}%,  {8}%)  10%, transparent 80%),  " +
                "linear-gradient(315deg, hsl({9}, {10}%, {11}%) 50%, transparent 100%), " +
                "url(/cgi-bin/apps/personalSettings/images/{12}.png);";
            Ext.util.CSS.createStyleSheet(String.format.apply(this, [style].concat(QNAP.QOS.user.cumsWallpaperColors).concat([QNAP.QOS.user.cumsWallpaperPatten])), 'cums-color-wallpaper');
        }

        var tmpImg = new Image();

        switch (type) {
            case 'Center':
                tmpImg.onload = function(e) {
                    img.hide('display');
                    desktopEl.setStyle('background-size', 'auto');
                    desktopEl.setStyle('background-repeat', 'no-repeat');
                    desktopEl.setStyle('background-position', 'center');
                    desktopEl.setStyle('background-image', ' url(' + imgSrc + ')');
                };
                break;
            case 'Fill':
                tmpImg.onload = function(e) {
                    img.show();
                    img.set({
                        src: imgSrc
                    });
                    desktopEl.setStyle('background', 'none');
                };
                break;
            case 'Stretch':
                tmpImg.onload = function(e) {
                    img.hide('display');
                    desktopEl.setStyle('background', ' url(' + imgSrc + ') center no-repeat');
                    desktopEl.setStyle('background-size', ' 100% auto');
                };
                break;
            case 'Fit':
                tmpImg.onload = function(e) {
                    img.hide('display');
                    desktopEl.setStyle('background', ' url(' + imgSrc + ') center no-repeat');
                    desktopEl.setStyle('background-size', 'auto 100%');
                };
                break;
            case 'Tile':
                tmpImg.onload = function(e) {
                    img.hide('display');
                    desktopEl.setStyle('background-size', 'initial');
                    desktopEl.setStyle('background', ' url(' + imgSrc + ') center');
                };
                break;
            case 'none':
                /* falls through */
            default:
                img.hide('display');
                if (desktop.rendered) {
                    style = desktop.el.dom.style;
                    removeApi = '';
                    if (style.removeAttribute) {
                        removeApi = 'removeAttribute';
                    } else {
                        removeApi = 'removeProperty';
                    }
                    style[removeApi]('background-image');
                    style[removeApi]('background');
                    style[removeApi]('background-size');
                    style[removeApi]('background-repeat');
                } else {
                    desktop.on('afterrender', function() {
                        var style = this.el.dom.style;
                        var removeApi = '';
                        if (style.removeAttribute) {
                            removeApi = 'removeAttribute';
                        } else {
                            removeApi = 'removeProperty';
                        }
                        style[removeApi]('background-image');
                        style[removeApi]('background');
                        style[removeApi]('background-size');
                        style[removeApi]('background-repeat');
                    }, desktop, {
                        single: true
                    });
                }
                imgSrc = Ext.BLANK_IMAGE_URL;
                break;
        }
        tmpImg.src = imgSrc;
    },
    /**
     * window unload 時跳出確認視窗
     */
    unloadConfirm: function(e) {
        var message = false, // no msg
            userCommon = QNAP.QOS.user.common,
            app = os.getAppInstancesByAppId('FileUploadMgr')[0];

        if (app && (Math.abs(app.getTaskStatus()) & 3 > 0)) {
            message = _S._SFE_LANG_MSG_CONFIRM_CLOSE_BRS;
        }

        if (userCommon.levWarn == 'true') {
            if (e) {
                e.returnValue = message = _S.QTS_DESKTOP_MSG_5;
            }
        }

        if (message === false) {
            throw new Error();
        }

        return message;
    },
    /**
     * 套用各項桌面設定
     * <ul>
     * 	<li>QNAP.QOS.user.common.levWarn -- 離開時是否詢問 unloadConfirm </li>
     * 	<li>QNAP.QOS.user.common.showPageSwitch -- 換頁鈕固定顯示在桌面上</li>
     * 	<li>QNAP.QOS.user.common.showDashboard -- 是否顯示Dashboard</li>
     * 	<li>QNAP.QOS.user.common.resWin -- 登入後是否回覆上次開啟視窗</li>
     * 	<li>QNAP.QOS.user.common.showDatetime -- 在桌面顯示系統時間</li>
     * 	<li>QNAP.QOS.user.common.isWindowBaseMode -- 視窗顯示模式, true=window mode, false =tab mode(full page)</li>
     * 	<li>QNAP.QOS.user.common.shortcutLayout -- 桌面Icon 排版模式 detail/simple </li>
     * 	<li>QNAP.QOS.user.common.autoHideMainMenu -- 自動隱藏 Main Menu</li>
     * 	<li>QNAP.QOS.user.common.autoLogout -- 是否自動登出</li>
     * 	<li>QNAP.QOS.user.common.maxIdleTime -- 最大閒置時間</li>
     * </ul>
     * @return {[type]} [description]
     */
    setupDesktopCfg: function() {
        var me = this;
        var userCommon = QNAP.QOS.user.common;

        window.onbeforeunload = os.desktop.unloadConfirm;

        var pageSwitchStyle = {
            'z-index': 0
        };
        if (userCommon.showPageSwitch == 'true') {
            pageSwitchStyle = {
                'z-index': 0
            };
            Ext.select('div.right-border').replaceClass('border-width-fixed', 'border-width-fixed');
            Ext.select('div.left-border').replaceClass('border-width-fixed', 'border-width-fixed');
        } else {
            Ext.select('div.right-border').removeClass('border-width-fixed');
            Ext.select('div.left-border').removeClass('border-width-fixed');
            pageSwitchStyle = {
                'z-index': 8100
            };
        }
        Ext.select('div.right-border').setStyle(pageSwitchStyle);
        Ext.select('div.left-border').setStyle(pageSwitchStyle);
        var dashBoard = Ext.getCmp(me.CMP_ID.DASHBOARD);
        if (dashBoard) {
            if (userCommon.showDashboard == 'true') {
                dashBoard.show();
                os.desktop.desktop.headBar.dashboardBtn.show();
            } else {
                dashBoard.hide();
                os.desktop.desktop.headBar.dashboardBtn.hide();
            }
        }

        os.logout = Ext.createInterceptor(os.logout, me.stopLeaveConfirm);
        if (userCommon.resWin == 'true' && QNAP.QOS.lib.supportStorage) {
            window.onunload = function() {
                var lastApps = [];
                var lastServices = [];
                var appId, appInfo;
                var localStorage = window.localStorage;
                os.qWinMgr.each(function(win) {
                    if (win instanceof QNAP.QOS.appWindow) {
                        appId = win._getApp().appId;
                        switch (appId) {
                            case 'WebBrowser':
                            case 'FileUploadMgr':
                            case 'MediaViewer':
                            case 'ShareCenter':
                                return true;
                        }
                        appInfo = QNAP.QOS.lib.getAppInfo(appId);
                        if (appInfo.type == 'service') {
                            lastServices.push(appId);
                        } else {
                            lastApps.push(appId);
                        }

                        localStorage[appId + "_resume_cfg"] = Ext.encode(win._getApp().getResumeCfg());
                    }
                });
                localStorage["last_apps_" + QNAP.QOS.user.account] = Ext.encode(lastApps);
                localStorage["last_services_" + QNAP.QOS.user.account] = Ext.encode(lastServices);
            };
        } else {
            window.onunload = null;
            if (QNAP.QOS.lib.supportStorage) {
                var localStorage = window.localStorage;
                localStorage.removeItem("last_apps_" + QNAP.QOS.user.account);
                localStorage.removeItem("last_services_" + QNAP.QOS.user.account);
            }
        }

        if (userCommon.showDatetime == 'true') {
            os.getViewport().el.removeClass('hide-desktop-datetime');
        } else {
            os.getViewport().el.replaceClass('hide-desktop-datetime', 'hide-desktop-datetime');
        }

        /**
         * 如果是移動設備，強制使用整頁模式
         * windowMode
         * - basic
         * - label
         * - tab (Full page)
         */
        if (!QNAP.QOS.lib.isMobileBrowser &&
            userCommon.isWindowBaseMode === 'true') {
            os.getViewport().el
                .removeClass('window-tab-mode')
                .addClass('window-base-mode');

            var showDDLabel = userCommon.windowMode === 'label';
            if (showDDLabel) {
                os.getViewport().el.addClass('window-label-mode');
            } else {
                os.getViewport().el.removeClass('window-label-mode');
            }
            QNAP.lib.cookie.set('WINDOW_MODE', '1');
            os.qWinMgr.each(function(win) {
                if (win.restore && win.isVisible()) {
                    win.restore();
                }
                if (win.ddLabel) {
                    win.ddLabel.setDisabled(!showDDLabel);
                    win.ddLabel.updateTabTools();
                }
                if (win.iframeWin) {
                    try {
                        var iframe = win.el.child('iframe');
                        var h = iframe.getHeight();
                        iframe.setHeight(h - 1);
                        setTimeout(function() {
                            if (iframe.dom.style.removeAttribute) {
                                iframe.dom.style.removeAttribute('height');
                            } else {
                                iframe.dom.style.removeProperty('height');
                            }
                        }, 10);
                    } catch (e) {
                        _D('[Error] get Iframe height error.');
                    }
                }
            });
        } else {
            os.getViewport().el
                .removeClass(['window-base-mode', 'window-label-mode'])
                .addClass('window-tab-mode');
            os.qWinMgr.each(function(win) {
                if (win.maximizable) {
                    if (win.isVisible()) {
                        win.restore();
                        win.maximize();
                    } else {
                        win.on({
                            beforeshow: function(win) {
                                if (QNAP.QOS.user.common.isWindowBaseMode === 'false') {
                                    win.maximize();
                                }
                            },
                            single: true
                        });
                    }
                }
                if (win.iframeWin) {
                    var iframe = win.el.child('iframe');
                    var h = iframe.getHeight();
                    iframe.setHeight(h - 1);
                    setTimeout(function() {
                        if (iframe.dom.style.removeAttribute) {
                            iframe.dom.style.removeAttribute('height');
                        } else {
                            iframe.dom.style.removeProperty('height');
                        }
                    }, 10);
                }
            });
            Ext.util.Cookies.clear('WINDOW_MODE');
        }
        os.onBroadcast('desktop', 'windowmodechange');
        var actWin = os.qWinMgr.getActive();
        if (actWin) {
            actWin.setActive(true);
        }

        if (!QNAP.QOS.lib.isMobileBrowser &&
            userCommon.shortcutLayout == 'detail') {
            os.getViewport().el.removeClass('detail-view');
        } else {
            os.getViewport().el.removeClass('detail-view');
        }
        var utilityDock = Ext.getCmp(me.CMP_ID.QNAP_UTILITY_DOCK);
        if (utilityDock) {
            utilityDock.setVisible(userCommon.showPCUtil == 'true');
        }
        if (userCommon.autoLogout == 'true') {
            var timeList = this.getIdelTimeList();
            if (timeList.indexOf(String(userCommon.maxIdleTime)) == -1) {
                userCommon.maxIdleTime = '60';
            }

            QNAP.QOS.lib.setMaxIdleTime(userCommon.maxIdleTime);
        } else {
            QNAP.QOS.lib.setMaxIdleTime(-1);
        }

        if (!me.initializing) {
            me.shortcutsView.refresh();
        }
    },
    /**
     * get user idel time list, for auto logout function
     * @return {Array} [5 min,10 min,30 min, 1hr, 1 day], unit minute.
     */
    getIdelTimeList: function() {
        return ['5', '10', '30', '60', '1440'];
    },
    /**
     * 中斷window unload configrm，用於session timeout或重開機等情況
     * @return {[type]} [description]
     */
    stopLeaveConfirm: function() {
        window.onbeforeunload = null;
        return true;
    },
    /**
     * 回復原本已開啟視窗，瀏覽器需支援localStorage
     * @return {[type]} [description]
     */
    resumeWin: function() {
        var resumeServiceWin;
        if (QNAP.QOS.user.common.resWin == 'true' && QNAP.QOS.lib.supportStorage) {
            var lastApps = Ext.decode(window.localStorage["last_apps_" + QNAP.QOS.user.account]);
            Ext.each(lastApps, function(appId) {
                os.openApp(appId, Ext.decode(window.localStorage[appId + "_resume_cfg"]));
            });

            resumeServiceWin = function() {
                var lastServices = Ext.decode(window.localStorage["last_services_" + QNAP.QOS.user.account]);
                Ext.each(lastServices, function(appId) {
                    os.openApp(appId, Ext.decode(window.localStorage[appId + "_resume_cfg"]));
                });
            };

            if (os.stationStore.loaded) {
                resumeServiceWin();
            } else {
                os.stationStore.on('load', resumeServiceWin, null, {
                    single: true
                });
            }

        }
    },
    /**
     * 更新UI上 Host name 關相字串
     */
    updateHostname: function(name) {
        var me = this;
        QNAP.QOS.config.hostname = name;
        Ext.getCmp(me.CMP_ID.HOSTNAME).update({
            hostname: QNAP.QOS.config.hostname,
            modelName: QNAP.QOS.config.displayModelName
        });
    },
    /**
     * Check offical QPKG version
     * if install version is older then offical version, show slide message or
     * popup window. And if slide message or popup window is exist and all
     * install version is newer then offical version, auto close message and
     * window.
     */
    checkNewQPKG: function() {
        if (QNAP.QOS.config.updateLock === '1') {
            return;
        }

        /* only support admin group */
        if (!QNAP.QOS.user.isAdminGroup) {
            return;
        }

        var qpkgMap, msg,
            curSysTime,
            desktop,
            notifyList;

        var appendQPKGNotify, appendHDStationNotify;

        desktop = os.desktop;
        curSysTime = desktop.clocks.systemDateTime.getTime();

        if (desktop.QPKGinfoIsReady()) {
            qpkgMap = os.checkNewQPKG();
            curSysTime = curSysTime.getTime() / 1000;
            notifyList = os.dataStore.notifyList;
            if (qpkgMap.appCenter.length > 0 && Ext.isEmpty(desktop.qpkg_update_msg)) {
                msg = os.showMsg('', _S.QTS_DESKTOP_MSG_1, false);
                msg.addClass('link');
                msg.child('div.content').on('click', function(evt, target) {
                    os.openApp('qpkg', {
                        config: {
                            update: true
                        }
                    });
                    var msg = Ext.fly(target).parent('div.msg-box');
                    var msgCt = os.desktop.msgCt;
                    msg.replaceClass('msg-box', 'removing-msg-box');
                    msg.remove();
                    msgCt.alignTo(document, 'br-br', [-10, 7]);
                    msgCt.setStyle({
                        top: 'auto'
                    });
                });

                appendQPKGNotify = function(store) {
                    var dayLightSavingOffset = desktop.getDayLightSavingOffset(),
                        localTzOffset = desktop.getLocalTzOffset(),
                        NASTzOffset = desktop.getNASTzOffset(),
                        timeOffset = (NASTzOffset + localTzOffset + dayLightSavingOffset) * 60;

                    if (store.baseParams.startTime > curSysTime - timeOffset) {
                        store.un('load', appendQPKGNotify);
                        return;
                    }
                    if (store.getById(curSysTime + '_App_Center')) {
                        return;
                    }
                    store.loadData({
                        list: [{
                            'id': curSysTime + '_App_Center',
                            'facility': '17', // System
                            'facilityStr': 'System',
                            'name': '',
                            'desc': 'Update is available in the App Center now',
                            'msgCode': 'QTS_DESKTOP_MSG_1',
                            'varNum': 0,
                            'varContent': '',
                            'timeSec': curSysTime - timeOffset,
                            'timeSecStr': '',
                            'endtimeSec': curSysTime - timeOffset,
                            'endtimeSecStr': '',
                            'count': '1',
                            'uid': '-1',
                            'gid': '-1',
                            'logType': 'notifyLog',
                            'date': '',
                            'time': ''
                        }]
                    }, true);
                };

                appendQPKGNotify(notifyList);
                notifyList.on('load', appendQPKGNotify, null, {
                    delay: 100
                });
                desktop.qpkg_update_msg = msg.id;
            } else if (qpkgMap.appCenter.length === 0) {
                var msg = Ext.get(desktop.qpkg_update_msg);
                if (msg) {
                    msg.child('div.content').removeAllListeners();
                    msg.remove();
                }
            }

            if (qpkgMap.HD_Station.length > 0 && Ext.isEmpty(desktop.hd_station_update_msg)) {
                msg = os.showMsg('', _S.QTS_DESKTOP_MSG_70, false);
                msg.addClass('link');
                msg.child('div.content').on('click', function(evt, target) {
                    os.openApp('systemPreferences', {
                        fn: 'hdStation'
                    });
                    var msg = Ext.fly(target).parent('div.msg-box');
                    var msgCt = os.desktop.msgCt;
                    msg.replaceClass('msg-box', 'removing-msg-box');
                    msg.remove();
                    msgCt.alignTo(document, 'br-br', [-10, 7]);
                    msgCt.setStyle({
                        top: 'auto'
                    });
                });

                appendHDStationNotify = function(store) {
                    var dayLightSavingOffset = desktop.getDayLightSavingOffset(),
                        localTzOffset = desktop.getLocalTzOffset(),
                        NASTzOffset = desktop.getNASTzOffset(),
                        timeOffset = (NASTzOffset + localTzOffset + dayLightSavingOffset) * 60;
                    if (store.baseParams.startTime > curSysTime - timeOffset) {
                        store.un('load', appendHDStationNotify);
                        return;
                    }
                    if (store.getById(curSysTime + '_HD_Station')) {
                        return;
                    }
                    store.loadData({
                        list: [{
                            'id': curSysTime + '_HD_Station',
                            'facility': '17', // System
                            'facilityStr': 'System',
                            'name': '',
                            'desc': 'Update is available in the HybridDesk Station now',
                            'msgCode': 'QTS_DESKTOP_MSG_70',
                            'varNum': 0,
                            'varContent': '',
                            'timeSec': curSysTime - timeOffset,
                            'timeSecStr': '',
                            'endtimeSec': curSysTime - timeOffset,
                            'endtimeSecStr': '',
                            'count': '1',
                            'uid': '-1',
                            'gid': '-1',
                            'logType': 'notifyLog',
                            'date': '',
                            'time': ''
                        }]
                    }, true);
                };

                appendHDStationNotify(notifyList);
                notifyList.on('load', appendHDStationNotify, null, {
                    delay: 100
                });
                desktop.hd_station_update_msg = msg.id;
            } else if (qpkgMap.HD_Station.length === 0) {
                var msg = Ext.get(desktop.hd_station_update_msg);
                if (msg) {
                    msg.child('div.content').removeAllListeners();
                    msg.remove();
                }
            }

            if (qpkgMap.notSupport.length + qpkgMap.minVersion.length > 0) {

                msg = os.showMsg('', _S.QPKG_STRING_98, false);
                msg.addClass('link');
                msg.child('div.content').on('click', function(evt, target) {
                    os.desktop.openNotSupportQPKGListWin();
                    var msg = Ext.fly(target).parent('div.msg-box');
                    var msgCt = os.desktop.msgCt;
                    msg.replaceClass('msg-box', 'removing-msg-box');
                    msg.remove();
                    msgCt.alignTo(document, 'br-br', [-10, 7]);
                    msgCt.setStyle({
                        top: 'auto'
                    });
                });

                os.desktop.appendQPKGNotSupportNotify = function(store) {
                    var dayLightSavingOffset = desktop.getDayLightSavingOffset(),
                        localTzOffset = desktop.getLocalTzOffset(),
                        NASTzOffset = desktop.getNASTzOffset(),
                        timeOffset = (NASTzOffset + localTzOffset + dayLightSavingOffset) * 60;
                    if (store.baseParams.startTime > curSysTime - timeOffset) {
                        store.un('load', appendHDStationNotify);
                        return;
                    }
                    if (store.getById(curSysTime + '_affected_QPKG')) {
                        return;
                    }
                    store.loadData({
                        list: [{
                            'id': curSysTime + '_affected_QPKG',
                            'facility': '17', // System
                            'facilityStr': 'System',
                            'name': '',
                            'desc': _S.QPKG_STRING_98,
                            'msgCode': 'QPKG_STRING_98',
                            'varNum': 0,
                            'varContent': '',
                            'timeSec': curSysTime - timeOffset,
                            'timeSecStr': '',
                            'endtimeSec': curSysTime - timeOffset,
                            'endtimeSecStr': '',
                            'count': '1',
                            'uid': '-1',
                            'gid': '-1',
                            'logType': 'notifyLog',
                            'date': '',
                            'time': ''
                        }]
                    }, true);
                };

                os.desktop.appendQPKGNotSupportNotify(notifyList);
                notifyList.on('load', os.desktop.appendQPKGNotSupportNotify, null, {
                    delay: 100
                });
            }

            desktop.show_qpkg_req_update_message(desktop.show_licenses_promote_win);
        } else {
            setTimeout(function() {
                os.desktop.checkNewQPKG();
            }, 1000 * 30);
        }
    },
    /**
     * 增加建立捷徑選單
     * @param {[type]} cmp [description]
     */
    addContextMenuItem: function(cmp) {
        var me = this,
            shortcutsView = me.shortcutsView;
        cmp.contextMenu.on('beforeshow', function(cmp) {
            var item = cmp.getComponent('createShortcut');
            var count = me.shortcutsView.store.getCount();
            var shortcutCfg = shortcutsView.shortcutCfg;
            var maxCount = shortcutCfg.maxPage * shortcutCfg.pageSize;
            item.setDisabled(count >= maxCount);
        });

        cmp.contextMenu.add({
            itemId: 'createShortcut',
            text: _S.DESKTOP_CREATE_SHORTCUT,
            qInternationalKey: 'DESKTOP_CREATE_SHORTCUT',
            qInternational: true,
            listeners: {
                click: function(item) {
                    var qDatas = item.parentMenu.data.qDatas;
                    me.addIcon2Desktop(qDatas, null, true);
                }
            }
        });
    },
    /**
     * 顯示桌面Widget
     * @return {[type]} [description]
     */
    showDashBoardItem: function() {
        var me = this;
        var items = QNAP.QOS.user.deshboardItems || {};
        try {
            items = Ext.decode(items);
        } catch (e) {
            items = {};
        }

        QNAP.QOS.user.deshboardItems = items;
        Ext.iterate(items, function(item) {
            var width, height, widgetId = '';
            var bwrapCfg = '';
            var cls = ['dd-widget', 'none-bg'];
            cls = cls.concat(Ext.ComponentMgr.types[item].prototype.cls);
            switch (item) {
                case 'QScheduleMonitor':
                    bwrapCfg = 'light-bg';
                    break;
                case 'QStorageMonitor':
                    bwrapCfg = 'dark-bg';
                    break;
                case 'QUserMonitor':
                    bwrapCfg = 'light-bg';
                    break;
                case 'QHWMonitor':
                    bwrapCfg = 'dark-bg';
                    break;
                case 'QResourcesMonitor':
                    bwrapCfg = 'dark-bg';
                    break;
                case 'QHDDHealth':
                    bwrapCfg = 'dark-bg';
                    break;
                case 'QSysHealth':
                    bwrapCfg = 'dark-bg';
                    break;
                case 'QRSSMonitor':
                    bwrapCfg = 'light-bg';
                    break;
            }
            cls.push(bwrapCfg);
            var panel = Ext.create({
                id: 'widget-' + item,
                stateId: 'widget-' + item,
                xtype: item,
                disabled: true,
                shadow: false,
                plugins: new QNAP.CMP.Plugin.WidgetPanel(),
                bwrapCfg: {
                    cls: bwrapCfg
                },
                cls: cls.join(' '),
                renderTo: me.desktop.id
            }, 'window');
        });
        if (!me.initializing) {
            os.getViewport().doLayout();
        }
    },
    /**
     * 快速建立捷徑，在右鍵選單中呼叫
     * @param {[type]} qDatas        [description]
     * @param {[type]} sourceCmp     [description]
     * @param {[type]} byCurrentPage [description]
     */
    addIcon2Desktop: function(qDatas, sourceCmp, byCurrentPage) {
        var me = this,
            sv = me.shortcutsView;
        var pageTable = sv.pageTable,
            count = sv.store.getCount();
        var shortcutCfg = sv.shortcutCfg;
        var maxCount = shortcutCfg.maxPage * shortcutCfg.pageSize;
        var insertIndex = 0;
        if (maxCount <= count) {
            return;
        }
        var originalPage = sv.currentPage;
        if (byCurrentPage) {
            var l = pageTable[originalPage].length;
            if (l < shortcutCfg.pageSize) {
                insertIndex = l + originalPage * shortcutCfg.pageSize;
            } else {
                os.showMsg('', _S.CP_MSG_2);
                return;
            }
        } else {
            Ext.each(pageTable, function(page, index) {
                if (page.length < shortcutCfg.pageSize) {
                    insertIndex = page.length + index * shortcutCfg.pageSize;
                    sv.currentPage = index;
                    return false;
                }
            });
        }
        me.shortcutsView.insertShortcuts(qDatas, insertIndex + 1, false);
        me.shortcutsView.refresh();
    },
    /**
     * 切換menu 狀態 show/hide
     * @return {[type]} [description]
     */
    menuModelSwitch: function(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        var me = this;
        var el = this.menu.el;

        if (el.hasClass('hide')) {
            this.menu.doLayout();
            if (Ext.isIE8) {
                setTimeout(function() {
                    os.getViewport().el.on('click', me._checkAutoHideMainCfg, me);
                }, 10);
            } else {
                os.getViewport().el.on('click', this._checkAutoHideMainCfg, this);
            }
            el.removeClass('hide');
            el.addClass('active');
            this.menu.fireEvent('show', this.menu);
            this.menuModelType = 2;
        } else {
            os.getViewport().el.un('click', this._checkAutoHideMainCfg, this);
            el.addClass('hide');
            this.menu.fireEvent('hide', this.menu);
            this.menuModelType = 1;
        }
    },
    _checkAutoHideMainCfg: function(e) {
        if (e.within(this.menu.el)) {
            this.menu.el.addClass('active');
        } else {
            this.menu.el.removeClass('active');
        }
        if (QNAP.QOS.user.common.autoHideMainMenu === 'true' &&
            !e.within(os.desktop.desktop.headBar.menuBtn.el)) {
            return;
        }
        if (this.menuModelType == 2) {
            this.menuModelSwitch(e);
        }
    },
    /**
     * 建立App
     * @param  {[type]} config [description]
     * @return {[type]}        [description]
     */
    createApp: function(config) {
        var me = this,
            appId = config.appId,
            appInfo = QNAP.QOS.lib.getAppInfo(config.appId),
            isQPKGApp = appInfo.type === 'QPKGApp',
            maxWin = config.maxWin ? config.maxWin : 1,
            existApps = os.getAppInstancesByAppId(appId),
            desktop = Ext.getCmp(me.CMP_ID.DESKTOP);
        var app;
        if (existApps.length >= maxWin) {
            _D('[Info] ' + existApps.length + ' ' + appId + ' exist already');
            app = existApps.pop();
            app._getMainWindow().show();
            app.activeApp(config);
            return;
        }
        appInfo.id = config.id;

        var appInstance;
        try {
            appInstance = isQPKGApp ? new QNAP.QOS.QPKG[appId](appInfo) : new QNAP.QOS[appId](appInfo, config);
        } catch (e) {
            _D('[Error] appId => ', appId);
            _D(e.stack);
            appInstance = new QNAP.QOS[appId].main(appInfo);
        }


        os.addAppInstance(appInstance);
        var params = appInstance.getMainWinParams(config);
        params.icon = String.format(appInfo.icon, 24);

        if (appId == 'quickWizard') {
            params.y = 50;
            params.shadow = false;
        } else {
            params.maxHeight = params.height;
            if (appInfo.fullScreen === false) {

            } else {

                if (QNAP.QOS.user.common.isWindowBaseMode == 'true' &&
                    !QNAP.QOS.lib.isMobileBrowser) {
                    params.maximized = false;
                } else {
                    params.maximized = true;
                }
                /*
                if( appInstance.fullBrowser ){
                params.width        = innerWidth;
                params.height       = innerHeight;
                params.maximized    = true;
                }
                else{}
                */
                params.width = appInstance.winConfig.width ? appInstance.winConfig.width : 1030;
                var h = appInstance.winConfig.height ? appInstance.winConfig.height : 600;
                params.height = Math.min(h, desktop.getHeight() - 20);


                Ext.applyIf(params, {
                    resizable: true,
                    maximizable: true,
                    minimizable: true,
                    closable: true
                });
            }
            params.plugins = [{
                init: function(cmp) {
                    cmp.addClass('q-window q-' + appId + '-window q-app-window');
                    cmp.initialConfig.cls += 'q-window q-' + appId + '-window q-app-window';
                    if (cmp.buttons && /utility-window/.test(cmp.cls)) {
                        Ext.each(cmp.buttons, function(btn) {
                            if (btn.xtype === 'button' || btn.isXType('button')) {
                                btn.cls = [btn.cls || '', 'qts-button'].join(' ');
                            }
                        });
                    }
                    this.initEvents(cmp);
                },
                initEvents: function(cmp) {
                    cmp.on('beforerender', this.beforerender);
                    cmp.on('destroy', function(cmp) {
                        os.removeAppIinstance(cmp.appInstance);
                        cmp.appInstance.closeWin();
                        cmp.appInstance.doCloseApp();
                        cmp.appInstance.destroy();
                    });

                    cmp.on('afterrender', function() {
                        appInstance.activeApp(config);
                    }, null, {
                        single: true
                    });

                    appInstance.on('destroy', function() {
                        appInstance._getMainWindow = undefined;
                        delete appInstance._getMainWindow;
                    });
                },
                beforerender: function(win) {
                    appInstance._getMainWindow = function() {
                        return win;
                    };
                }
            }];
        }
        params.id = appInfo.id;
        params.constrain = true;
        params.constrainHeader = true;
        params.stateId = 'app-' + appId;
        params.stateEvents = ['maximize', 'restore'];
        params.defaultTitle = appInfo.defaultTitle;
        params.qInternationalKey = appInfo.qInternationalKey;
        params.title = _S[params.qInternationalKey] || params.defaultTitle;
        params.qInternational = true;
        params.shadow = false;
        if (appInstance.windowType == 'appWizard') {
            appInstance.icon = config.icon;
        }

        me.createWindow(appInstance, params, config.autoShow);
        return appInstance;
    },
    /**
     * 建立 QTS Window
     * @param  {[type]} appInstance [description]
     * @param  {[type]} params      [description]
     * @return {[type]}             [description]
     */
    createWindow: function(appInstance, params, autoShow) {
        var me = this,
            appId = appInstance.appId;
        var appInfo = QNAP.QOS.lib.getAppInfo(appId);
        var maxWin = appInfo.maxWin ? appInfo.maxWin : 1;
        var desktop = Ext.getCmp(me.CMP_ID.DESKTOP);
        params.manager = os.qWinMgr;
        var win;
        params.id = appInstance.id;
        params.dragLabel = params.dragLabel === false ? false : true;
        if (params.resizable) {
            var rootEm = os.desktop.rootEm;
            params.height *= rootEm;
            params.width *= rootEm;
        }
        if (Ext.isEmpty(appInstance)) {
            win = new QNAP.QOS.baseWindow(params);
        } else {
            switch (appInstance.windowType) {
                case 'appWizard':
                    win = new QNAP.QOS.appWizard(params, appInstance);
                    break;
                case 'appWindow':
                    /* falls through */
                default:
                    win = new QNAP.QOS.appWindow(params, appInstance);
                    break;
            }
            /*
            if( appInstance.fullBrowser ){
            fullBrowser = true;
            }
            */
        }
        /*
        if( fullBrowser === true){
        var cmpBody = os.getViewport();
        cmpBody.add(win);

        appInstance._getMainWindow = function() {
        return win;
        };

        me.fireEvent('createAppWin', appInstance, win);

        cmpBody.doLayout();

        win.on('show',this.updateWinPosition,cmpBody,{single:true,delay:0});

        win.show();

        if (win.resizer){
        cmpBody.on('resize',function (){
        win.maximize();
        });
        }

        delete me.openingMap[appId];
        appInstance.initAppComplete();
        return;
        }
        */
        desktop.add(win);
        win.on('show', function() {
            this.desktopPage = os.desktop.shortcutsView.getPage();
        });
        win.on('beforeshow', function(_win) {
            os.desktop.clearAppFocusCookie(_win._getApp().appId);
        });
        win.on('close', function(_win) {
            os.desktop.clearAppFocusCookie(_win._getApp().appId);
        });
        win.mon(me.shortcutsView, 'afterchangepage',
            function(cmp, newIndex, oldIndex) {
                var action = '';
                var t = win.animateTarget;

                if (win.isVisible()) {
                    if (win.el.shadow) {
                        win.el.shadow.hide();
                    }

                    win.hidden = true;
                    action = 'hide';
                    win.hideForPage = true;
                    win.animateTarget = null;
                    if (action == 'hide') {
                        win.hidden = false;
                    }
                    win[action]();
                    if (action == 'hide' && win.el.shadow) {
                        win.el.shadow.hide();
                    }
                    win.animateTarget = t;

                } else if (win.desktopPage == newIndex &&
                    !win.isVisible() &&
                    win.hideForPage) {
                    win.animateTarget = null;
                    win.show(true);
                    win.animateTarget = t;
                    win.hideForPage = false;
                }
            });

        appInstance._getMainWindow = function() {
            return win;
        };

        desktop.doLayout(true);

        me.fireEvent('createAppWin', appInstance, win);

        if (appId == 'quickWizard') {
            win.show(Ext.getBody());
        } else {
            win.on('show', this.updateWinPosition, this, {
                single: true
            });
            /*
            var fullApp = os.apps.find(function(app) {
            return app.fullBrowser === true;
            });
            */
            if (autoShow !== false) { //(!fullApp || && appInstance.caller
                win.show().center();
            }
            if (win.resizable) {
                win.resizer.on('resize', function() {
                    var XY = win.getPosition();
                    if (XY[1] < 44) {
                        win.setPosition(null, 0);
                    }
                });
            }
        }
        if (win.resizer) {
            win.resizer.on('beforeresize', function() {
                win.toFront();
            });
        }
        delete me.openingMap[appId];
        appInstance.initAppComplete();
    },
    /**
     * 顯示 About Window
     * @return {[type]} [description]
     */
    showAboutWin: function() {
        if (QNAP.QOS.AboutWin) {
            QNAP.QOS.AboutWin.show();
        } else {
            Ext.Loader.load(['js/qos-desktop-about.js?' + URL_RANDOM_NUM], this.showAboutWin);
        }
    },
    /**
     * 執行關機動作，會跳出確認視窗要求使用者確認，
     * 關機指令由os負責
     * @return {[type]} [description]
     */
    shutdownNas: function() {
        var me = this;
        if (QNAP.QOS.config.demoSiteSuppurt == 'yes' && QNAP.QOS.user.account != 'admin') {
            os.Msg.alert('', _S.DEMO_SITE_SUPPURT);
        } else if (typeof(QNAP.QOS.config.qHaCfg) != 'undefined' && QNAP.QOS.config.qHaCfg.operation_status > 0) { //(QNAP.QOS.config.ha_enabled) {
            Ext.Msg.confirm('', 'To shutdown or restart the NAS, please use the HA management interface. Click "Yes" to open it.', function(_strYes) {
                if (_strYes == 'yes') {
                    os.openApp('HighAvailabilityApp');
                }
            });
        } else if (QNAP.QOS.config.lm_enabled) {
            os.openApp('liveMigrationApp');
        } else {
            Ext.Msg.wait(_S.QTS_INIT_LOADING);
            me.get_shutdown_warning_flag(function(warning_flag) {
                Ext.Msg.hide();
                me.show_shutdown_warning_confirm(warning_flag, 'SHUTDOWN');
            });
        }
    },
    sleepNas: function() {
        var me = this;
        if (QNAP.QOS.config.demoSiteSuppurt == 'yes' && QNAP.QOS.user.account != 'admin') {
            os.Msg.alert('', _S.DEMO_SITE_SUPPURT);
            return;
        }
        if (!os.dataStore.sysSetting.getAt(0).data.sleepSupport) {
            Ext.getBody().unmask();
            return;
        }
        Ext.Msg.wait(_S.QTS_INIT_LOADING);
        me.get_shutdown_warning_flag(function(warning_flag) {
            Ext.Msg.hide();
            me.show_shutdown_warning_confirm(warning_flag, 'SLEEP');
        });
    },
    /**
     * 執行重開機動作，會跳出確認視窗要求使用者確認，
     * 重開機指令由os負責
     * @return {[type]} [description]
     */
    rebootNas: function() {
        var me = this;
        if (QNAP.QOS.config.demoSiteSuppurt == 'yes' && QNAP.QOS.user.account != 'admin') {
            os.Msg.alert('', _S.DEMO_SITE_SUPPURT);
        } else if (typeof(QNAP.QOS.config.qHaCfg) != 'undefined' && QNAP.QOS.config.qHaCfg.operation_status > 0) { //(QNAP.QOS.config.ha_enabled) {
            Ext.Msg.confirm('', 'To shutdown or restart the NAS, please use the HA management interface. Click "Yes" to open it.', function(_strYes) {
                if (_strYes == 'yes') {
                    os.openApp('HighAvailabilityApp');
                }
            });
        } else if (QNAP.QOS.config.lm_enabled) {
            os.openApp('liveMigrationApp');
        } else {
            Ext.Msg.wait(_S.QTS_INIT_LOADING);
            me.get_shutdown_warning_flag(function(warning_flag) {
                Ext.Msg.hide();
                me.show_shutdown_warning_confirm(warning_flag, 'REBOOT');
            });
        }
    },
    /**
     * 取得系統目前Rsync 執行狀態，由 shutdownNas/rebootNas 呼叫
     * @return {[type]}
     */
    loadSysRsyncStatus: function(runningFn, notRunningFn) {
        QNAP.QOS.ajax({
            url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'sys/sysRequest.cgi', {
                subfunc: 'power_mgmt'
            }, {
                apply: 'rsync_running',
                reboot: 1
            }),
            method: 'POST',
            success: function(response, opts) {
                var xmlData = response.responseXML;
                var rsyncRunning = Ext.DomQuery.selectValue('rsyncRunning', xmlData, 'notRunning');
                if (rsyncRunning == "isRunning") {
                    runningFn();
                } else if (rsyncRunning == "notRunning") {
                    notRunningFn();
                }
            },
            failure: function() {}
        });
    },
    /**
     * 等待系統重開完成後，回到登入頁面
     * @return null
     */
    waitReboot: function() {
        var me = this;
        QNAP.QOS.ajax({
            url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'authLogin.cgi'),
            method: 'POST',
            success: function(response, opts) {
                if (Ext.DomQuery.selectNumber('authPassed', response.responseXML) === 0) {
                    me.stopLeaveConfirm();
                    setTimeout(function() {
                        me.stopLeaveConfirm();
                        location.href = '/';
                    }, 1000 * 10);
                } else {
                    new Ext.util.DelayedTask(function() {
                        me.waitReboot();
                    }).delay(5000);
                }
            },
            failure: function() {
                new Ext.util.DelayedTask(function() {
                    me.waitReboot();
                }).delay(5000);
            }
        });
    },
    /**
     * 當系統沒有HTTP回應時，提示使用者已經關機完成
     * @return {[type]} [description]
     */
    pingNas: function(msg) {
        var me = this;
        os.pingNas(
            function(response, opts) {
                new Ext.util.DelayedTask(function() {
                    me.pingNas(msg);
                }).delay(5000);
            },
            function() {
                setTimeout(
                    function() {
                        Ext.Msg.hide();
                        Ext.getBody().mask();
                        Ext.Msg.show({
                            closable: false,
                            msg: msg,
                            icon: Ext.MessageBox.INFO,
                            width: 480
                        });
                    }, 1000 * 60 * 2
                );
            }
        );
    },
    /**
     * 開啟媒體瀏覽器
     * @return {[type]} [description]
     */
    openViewer: function() {
        os.openApp('MediaViewer');
    },
    /**
     * 開啟Storage Manager，包含判斷v1/v2
     * @return {[type]} [description]
     */
    openStorageMgr: function(showUI, params) {
        var config = {};
        if (QNAP.QOS.config.bIsStorageV2) {
            switch (showUI) {
                case "globalSetting":
                    config = {
                        fn: 'storageSpaceMgmt',
                        config: {
                            openWiz: 'globalSetting'
                        }
                    }
                    break;
                case "smart":
                    if (typeof(params) == 'object') {
                        config = {
                            fn: 'dashboardMgmt',
                            config: { // 2013/09/26 Lance 修正 interface 由 App 決定 function name
                                openWiz: 'HddSmart', //'QNAP.QOS.storageManagerCoreV2.dialog.HddSmart.show'
                                diskId: (typeof(params.diskId) != 'undefined') ? params.diskId : -1
                            }
                        };
                    } else {
                        config = {
                            fn: 'overviewMgmt',
                            config: {
                                openWiz: 'HddSmart',
                                encId: params
                            }
                        };
                    }
                    break;
                case "diskList": // 2013/05/09 Lance 新增 hddMgmt 進入點
                    config = {
                        fn: 'hddMgmt'
                    };
                    break;
                case "chkFileSys": // 2013/06/20 Lance 新增 hddMgmt 進入點
                    config = {
                        fn: 'storageSpaceMgmt' //'volumeMgmt'
                    };
                    break;
                case "iSCSI": // 2013/04/29 Lance 新增 iscsi 進入點
                    config = {
                        fn: 'iscsiMgmt'
                    };
                    break;
                case "lunBackup":
                    config = {
                        fn: 'backupMgmt'
                    };
                    break;
                case "takeVolSnapshot": // 2013-11-13 Andy add volume snapshot enter point
                    config = {
                        fn: 'storageSpaceMgmt', //"volumeMgmt",
                        config: {
                            openWiz: "snapshotWiz",
                            volumeID: params.volumeID
                        }
                    };
                    break;
                case "takeISCSISnapshot": // 2013-11-13 Andy add iSCSI snapshot enter point
                    config = {
                        fn: "iscsiMgmt",
                        config: {
                            openWiz: "iSCSI_snapshotWiz",
                            lunID: params.lunID
                        }
                    };
                    break;
                case "poolMgmt": // 2014-12-23 Dian add
                    config = {
                        fn: 'poolMgmt'
                    };
                    break;
                case "poolTip": // 2014-12-26 Lance Add : no break to used poolMgmt config
                    QNAP.QOS.user.fw_version = false;
                    /* falls through */
                case "storageSpaceMgmt": // 2014-12-23 Dian add
                    config = {
                        fn: 'storageSpaceMgmt',
                        config: params
                    };
                    break;
            }
            os.openApp('storageManagerV2', config);
        } else {

            switch (showUI) {
                case "chkFileSys":
                case "diskList":
                    config = {
                        fn: 'storageManager',
                        config: {
                            focusTab: 0
                        }
                    };
                    break;
                case "iSCSI":
                    config = {
                        fn: 'storageManager',
                        config: {
                            focusTab: 4
                        }
                    };
                    break;
                case "smart":
                    config = {
                        fn: 'storageManager',
                        config: {
                            focusTab: 2,
                            diskId: params ? params.diskId : 0
                        }
                    };
                    break;
                case "lunBackup":
                    config = {
                        fn: 'storageManager',
                        config: {
                            focusTab: 4,
                            secTab: 3
                        }
                    };
                    break;
            }
            os.openApp('systemPreferences', config);
        }
    },
    /**
     * [checkQPKGLicenseStatus description]
     * @param  {[type]} qpkgName [description]
     * @param  {[type]} config   [description]
     * @return {[type]}          [description]
     */
    checkQPKGLicenseStatus: function(qpkgName, config) {
        var me = this;
        var collection = os.qpkgInfoStore.query('internalName', new RegExp('^' + RegExp.escape(qpkgName) + '$', 'i'));
        if (collection.getCount() > 0 && collection.itemAt(0).get('licChk') == '0') {
            os.openService(qpkgName, config);
            return;
        } else if (collection.getCount() === 0) {
            os.openService(qpkgName, config);
            return;
        }
        var linStatus = os.checkQPKGLicenseStatus(false, qpkgName);
        var status = os.getStatusMap('LinceseStatus');
        switch (linStatus) {
            case status.NO_LICENSE: // 2
            case status.TRIAL_LICENSE_EXPIRED: // 3
                var win = me.getLinceseWin(linStatus, qpkgName);
                win.show();
                break;
            case status.ACTIVATE:
                /* falls through */
            default:
                os.openService(qpkgName, config);
                break;
        }
    },
    /**
     * [openLinceseWin description]
     * @param  {[type]} linStatus [description]
     * @param  {[type]} qpkgName  [description]
     * @param  {[type]} baseWin   [description]
     * @return {[type]}           [description]
     */
    getLinceseWin: function(linStatus, qpkgName, baseWin) {
        var me = this,
            str = '';
        var status = os.getStatusMap('LinceseStatus');

        switch (linStatus) {
            case status.NO_LICENSE:
                str = 'QPKG_STRING_45';
                break;
            case status.TRIAL_LICENSE_EXPIRED:
                str = 'QPKG_STRING_44';
                break;
        }
        var btnStyle = 'margin-bottom:10px;';
        var tmpSet = {
            title: _S.QPKG_STRING_30_1,
            qInternational: true,
            qInternationalKey: 'QPKG_STRING_30_1',
            cls: 'utility-window',
            width: 460,
            autoHeight: true,
            autoScroll: true,
            plain: true,
            closable: true,
            layout: 'auto',
            padding: 17,
            items: [{
                xtype: 'displayfield',
                value: _S.QPKG_STRING_32,
                qInternational: true,
                qInternationalKey: 'QPKG_STRING_32',
                style: 'padding: 3px 0 12px;',
                hideLabel: true
            }, {
                xtype: 'qtsbutton',
                text: _S.QPKG_STRING_42,
                qInternational: true,
                qInternationalKey: 'QPKG_STRING_42',
                width: '100%',
                style: btnStyle,
                handler: function(cmp) {
                    cmp.disable();
                    window.open('http://license.qnap.com/', 'QNAP License Store');
                    modalWin.close();
                }
            }, {
                xtype: 'qtsbutton',
                text: _S.QPKG_STRING_43,
                qInternational: true,
                qInternationalKey: 'QPKG_STRING_43',
                width: '100%',
                style: btnStyle,
                handler: function(cmp) {
                    cmp.disable();
                    modalWin.close();
                }
            }, {
                xtype: 'qtsbutton',
                text: _S[str] || str,
                qInternational: true,
                qInternationalKey: str,
                disabled: linStatus == status.TRIAL_LICENSE_EXPIRED,
                width: '100%',
                style: btnStyle,
                handler: function(cmp) {
                    modalWin.getEl().mask(_S.IEI_NAS_STORAGE182);
                    QNAP.QOS.ajax({
                        url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'application/appRequest.cgi', {
                            subfunc: 'survielance'
                        }, {
                            get_trial: 1,
                            app_id: qpkgName
                        }),
                        method: 'POST',
                        success: function(response, opts) {
                            var xmlData = response.responseXML;
                            if (xmlData !== undefined) {
                                var lic = Ext.DomQuery.selectNumber('lic', xmlData);
                                if (lic == '0' && linStatus == status.NO_LICENSE) {
                                    modalWin.close();
                                    os.openApp(qpkgName);
                                } else {
                                    os.Msg.alert('', _S.QPKG_STRING_47);
                                    modalWin.getEl().unmask();
                                }
                            }
                        },
                        failure: function(f, r) {}
                    });
                }
            }, {
                xtype: 'displayfield',
                value: _S.QPKG_STRING_36,
                qInternational: true,
                qInternationalKey: 'QPKG_STRING_36',
                style: 'padding: 12px 0 3px;',
                hideLabel: true
            }]
        };
        if (baseWin) {
            tmpSet = Ext.applyIf(tmpSet, {
                manager: baseWin.manager,
                parent: baseWin,
                baseWin: baseWin
            });
        }
        var modalWin = new QNAP.QOS.modalWindow(tmpSet);
        return modalWin;
    },
    _ERROR_ICON: QNAP.QOS.OS.prototype._ERROR_ICON,
    _INFO_ICON: QNAP.QOS.OS.prototype._INFO_ICON,
    _QUESTION_ICON: QNAP.QOS.OS.prototype._QUESTION_ICON,
    _QUESTION_BLUE_ICON: QNAP.QOS.OS.prototype._QUESTION_BLUE_ICON,
    _WARNING_ICON: QNAP.QOS.OS.prototype._WARNING_ICON,
    /**
     * show MediaLib Setting Win
     * @param  {String}   serviceId [description]
     * @param  {Function} fn    [description]
     * @param  {Boolean}   sync  [description]
     * @return {[type]}         [description]
     */
    showMLSettingWin: function(serviceId, fn, sync) {
        var confirmWin;
        var serviceIdRegExp = new RegExp('^' + RegExp.escape(serviceId) + '$', 'i'),
            station = os.stationStore.getAt(os.stationStore.find('appId', serviceIdRegExp, 0, true, false)),
            icon = this._INFO_ICON,
            btnText = ['IEI_NAS_BUTTON_OK', // OK
                'IEI_NAS_BUTTON_CANCEL', // CANCEL
                'MEDIA_LIB_STR_00'
            ], // Media Library
            style = 'display:inline-block;',
            msg = _S.MEDIA_LIB_STR_65,
            tmpId = Ext.id('qtag', 'tmp-'),
            title = station.get('defaultTitle'),
            windowId = serviceId + '-' + window.pageRandom;

        if (Ext.getCmp(windowId)) {
            Ext.getCmp(windowId).toFront().focus();
            return;
        }

        msg = msg.replace('<qtag>', '<qtag id="' + tmpId + '" class="link_line">');

        var items = {
            xtype: 'container',
            border: false,
            autoHeight: true,
            layout: 'form',
            defaults: {
                hideLabel: true
            },
            items: [{
                xtype: 'displayfield',
                itemId: 'msgText',
                value: msg,
                qInternational: true,
                qInternationalFn: function(cmp) {
                    var msg = _S.MEDIA_LIB_STR_65,
                        tmpId = Ext.id('qtag', 'tmp-');
                    msg = msg.replace('<qtag>', '<qtag id="' + tmpId + '" class="link_line">');
                    cmp.update(msg);
                    Ext.get(tmpId).on('click', function() {
                        os.openApp('mediaLibrary', {
                            config: {
                                focusTab: 1
                            }
                        });
                    });
                }
            }, {
                anchor: '100%',
                xtype: 'qtsradiogroup',
                ref: '../radiogroup',
                columns: 1,
                defaults: {
                    name: Ext.id('', 'scanmode'),
                    qInternational: true
                },
                items: [{
                    boxLabel: _S.MEDIA_LIB_STR_27,
                    qInternationalKey: 'MEDIA_LIB_STR_27',
                    checked: true,
                    value: 'realtime'
                }, {
                    boxLabel: _S.MEDIA_LIB_STR_29,
                    qInternationalKey: 'MEDIA_LIB_STR_29',
                    value: 'manual'
                }]
            }, {
                anchor: '100%',
                xtype: 'qtscheckbox',
                cls: 'ask-me-checkbox',
                boxLabel: _S.IEI_NAS_CONFIRM18,
                qInternational: true,
                qInternationalKey: {
                    boxLabel: 'IEI_NAS_CONFIRM18'
                },
                ref: '../askMeChk'
            }]
        };

        var fbar = [{
            /**
             * open Media lib button
             * @type {[type]}
             */
            xtype: 'qtsbutton',
            text: _S[btnText[2]] || btnText[2],
            qInternational: true,
            qInternationalKey: btnText[2],
            itemId: 'mlBtn',
            ref: '../mlBtn',
            hidden: true,
            handler: function() {
                os.openApp('mediaLibrary', {
                    config: {
                        focusTab: 1
                    }
                });
            }
        }, {
            xtype: 'qtsbutton',
            text: _S[btnText[0]] || btnText[0],
            qInternational: true,
            qInternationalKey: btnText[0],
            itemId: 'yesBtn',
            ref: '../yesBtn',
            handler: function() {
                var win = this.refOwner;
                os.desktop.on({
                    setmlscanmodefinish: function() {
                        win.close();
                    },
                    single: true
                });
                os.desktop.setMLScanMode(win.radiogroup.getValue().value, sync);
                win.getEl().mask('APPLY_MSG');
            }
        }, {
            xtype: 'qtsbutton',
            text: _S[btnText[1]] || btnText[1],
            qInternational: true,
            qInternationalKey: btnText[1],
            itemId: 'noBtn',
            ref: '../noBtn',
            handler: function() {
                this.refOwner.close();
            }
        }];

        confirmWin = os.getMsgWindow(title, items, fbar).show();

        confirmWin.on({
            close: function() {
                fn();
                if (this.askMeChk.getValue()) {
                    os.saveConfig('skipMLChk', true);
                }
            }
        });

        confirmWin.mask.hide();

        Ext.get(tmpId).on('click', function() {
            os.openApp('mediaLibrary', {
                config: {
                    focusTab: 1
                }
            });
        });

        return confirmWin;
    },
    /**
     * set MediaLib scan mode
     * @param {string} mode
     *        <p>realtime</p>
     *        <p>manual</p>
     * @param {boolean} sync
     *        sync or async
     */
    setMLScanMode: function(mode, sync) {
        var url = QNAP.QOS.config.sitePath + '/application/appRequest.cgi',
            params = {
                subfunc: 'medialib',
                sid: QNAP.QOS.user.sid,
                apply: 1,
                chk_ml: 1,
                chk_ml_rts: 1,
                chk_ml_sch: 0
            };
        if (mode === 'realtime') {
            params.chk_ml_rts = 1;
        } else if (mode === 'manual') {
            params.chk_ml_rts = 0;
        }

        if (sync) {
            var request = QNAP.QOS.lib.getXMLHttpRequest(),
                wizCfg = {};
            if (request) {
                request.open('POST', QNAP.QOS.lib.getCgiUrl(url, params), false);
                request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
                request.send();
                this.fireEvent('setmlscanmodefinish');
            }
        } else {
            QNAP.QOS.ajax({
                url: QNAP.QOS.lib.getCgiUrl(url),
                params: params,
                method: 'POST',
                scope: this,
                success: Ext.emptyFn,
                callback: function() {
                    this.fireEvent('setmlscanmodefinish');
                }
            });
        }
    },
    /**
     * load MediaLib staus
     * @param  {boolean} sync use sync or async load
     */
    laodMLStatus: function(sync) {
        var mediaLib = Ext.data.Record.create([
            /**
             * 1: media library enabled
             */
            {
                name: 'medialibEnable',
                type: 'int',
                defaultValue: 0
            },
            /**
             * 1: realtime scan enabled
             */
            {
                name: 'medialibRTSEnable',
                type: 'int',
                defaultValue: 0
            },
            /**
             * 1: schedule scan enabled
             */
            {
                name: 'medialibSchEnable',
                type: 'int',
                defaultValue: 0
            }
        ]);
        var mlReader = new Ext.data.XmlReader({
            record: "ownContent"
        }, mediaLib);

        var url = QNAP.QOS.config.sitePath + '/application/appRequest.cgi',
            params = {
                subfunc: 'medialib',
                getstatus: 1,
                sid: QNAP.QOS.user.sid
            };
        if (sync) {
            var request = QNAP.QOS.lib.getXMLHttpRequest(),
                wizCfg = {};
            if (request) {
                request.open('POST', QNAP.QOS.lib.getCgiUrl(url, params), false);
                request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
                request.send();
                if (request.status === 200) {
                    if (request.responseXML) {
                        var records = mlReader.read(request);
                        this.fireEvent('loadmlinfo', records.records[0]);
                    } else {
                        console.error('[warning] Response content type not XML.');
                        this.fireEvent('loadmlinfo');
                    }
                } else {
                    this.fireEvent('loadmlinfo');
                }
            }
        } else {
            QNAP.QOS.ajax({
                scope: this,
                url: QNAP.QOS.lib.getCgiUrl(url),
                params: params,
                method: 'POST',
                success: function(response, opts) {
                    if (response.responseXML) {
                        var records = mlReader.read(response);
                        this.fireEvent('loadmlinfo', records.records[0]);
                    } else {
                        console.error('[warning] Response content type not XML.');
                        this.fireEvent('loadmlinfo');
                    }
                },
                failure: function() {
                    this.fireEvent('loadmlinfo');
                }
            });
        }
    },
    openFwUpdateInfoWin: function(url, rcdAutoRun, beta) {
        if (!url) {
            QNAP.lib.cookie.set('checkFW', '1', null, '/');
            QNAP.lib.cookie.set('rcdAutoRun', rcdAutoRun ? '1' : '', null, '/');
            os.openApp('systemPreferences', {
                fn: 'firmware',
                config: {
                    focusTab: 0,
                    beta: beta ? '1' : '0'
                }
            });
            return;
        }
        if (Ext.isEmpty(this.fwUpdateInfoWin)) {
            this.fwUpdateInfoWin = new QNAP.QOS.baseWindow({
                title: _S.QTS_WHATS_NEW || 'What\'s New',
                cls: 'utility-window fill-iframe-window',
                resizable: false,
                closable: true,
                minimizable: false,
                modal: true,
                height: 500,
                width: 840,
                closeAction: 'hide',
                layout: 'auto',
                items: [{
                    xtype: 'box',
                    style: {
                        'width': '100%',
                        'height': '100%'
                    },
                    listeners: {
                        afterrender: function(cmp) {
                            var iframeId = Ext.id();
                            cmp.update(Ext.DomHelper.markup({
                                id: iframeId,
                                tag: 'iframe',
                                style: {
                                    'width': '100%',
                                    'height': '100%',
                                    'border': 'none'
                                },
                                src: url + '?lang=' + QNAP.QOS.lib.getLanguageCode()
                            }));
                        }
                    }
                }],
                fbar: {
                    buttonAlign: 'left',
                    items: [{
                            xtype: 'qtscheckbox',
                            boxLabel: 'check me',
                            ref: '../chkBox',
                            hidden: true,
                            handler: function(chkBox, checked) {
                                chkBox.refOwner.installBtn.setDisabled(!checked);
                            }
                        },
                        '->', {
                            xtype: 'qtsbutton',
                            text: _S.IEI_NAS_BUTTON_CONTINUE,
                            handler: function() {
                                QNAP.lib.cookie.set('rcdAutoRun', rcdAutoRun ? '1' : '', null, '/');
                                QNAP.lib.cookie.set('checkFW', '1', null, '/');
                                os.openApp('systemPreferences', {
                                    fn: 'firmware',
                                    config: {
                                        focusTab: 0,
                                        beta: beta ? '1' : '0'
                                    }
                                });
                                this.refOwner.hide();
                            },
                            ref: '../installBtn'
                        }, {
                            xtype: 'qtsbutton',
                            text: _S.CANCEL,
                            handler: function(btn) {
                                this.refOwner.hide();
                            },
                            ref: '../cancelBtn'
                        }
                    ]
                }
            });
            this.fwUpdateInfoWin.on({
                hide: function(win) {
                    win.el.child('iframe').parent().update(
                        Ext.DomHelper.markup({
                            tag: 'iframe',
                            style: {
                                'width': '100%',
                                'height': '100%',
                                'border': 'none'
                            }
                        }));
                }
            });
        } else {
            this.fwUpdateInfoWin.on({
                single: true,
                show: function(win) {
                    win.el.child('iframe').dom.src = url + '?lang=' + QNAP.QOS.lib.getLanguageCode();
                }
            });
        }
        this.fwUpdateInfoWin.show();
    },
    openFwNewFeatureWin: function() {
        if (Ext.isEmpty(this.fwNewFeatureWin)) {
            this.fwNewFeatureWin = new QNAP.QOS.baseWindow({
                title: _S.QTS_WHATS_NEW,
                cls: 'utility-window fill-iframe-window',
                qInternationalKey: 'QTS_WHATS_NEW',
                qInternational: true,
                resizable: false,
                closable: true,
                minimizable: false,
                height: 500,
                width: 840,
                closeAction: 'hide',
                layout: 'auto',
                items: [{
                    xtype: 'box',
                    style: {
                        'width': '100%',
                        'height': '100%'
                    },
                    listeners: {
                        afterrender: function(cmp) {
                            var iframeId = Ext.id();
                            cmp.update(Ext.DomHelper.markup({
                                id: iframeId,
                                tag: 'iframe',
                                style: {
                                    'width': '100%',
                                    'height': '100%',
                                    'border': 'none'
                                },
                                src: QNAP.QOS.config.newFeatureURL + '?lang=' + QNAP.QOS.lib.getLanguageCode() + '&fw=' + QNAP.QOS.config.firmware + '-' + QNAP.QOS.config.buildTime
                            }));
                        }
                    }
                }]
            });
            this.fwNewFeatureWin.on({
                hide: function(win) {
                    win.el.child('iframe').parent().update(
                        Ext.DomHelper.markup({
                            tag: 'iframe',
                            style: {
                                'width': '100%',
                                'height': '100%',
                                'border': 'none'
                            }
                        }));
                }
            });
        } else {
            this.fwNewFeatureWin.on({
                single: true,
                show: function(win) {
                    win.el.child('iframe').dom.src = QNAP.QOS.config.newFeatureURL + '?lang=' + QNAP.QOS.lib.getLanguageCode() + '&fw=' + QNAP.QOS.config.firmware + '-' + QNAP.QOS.config.buildTime;
                }
            });
        }
        this.fwNewFeatureWin.show();
    },
    /**
     * get NAS timezone offset, unit minute.<br/>
     * if timezone is GMT+1:00, return 60(mins)
     * if timezone is GMT-1:00, return -60(mins)
     * @return {int} minutes
     */
    getNASTzOffset: function(widthDaylightsaving) {
        var sysSetting = os.dataStore.sysSetting,
            sysRecord = sysSetting.getAt(0),
            timeOffset = 0;

        var isNegative = false,
            timezone;

        if (sysRecord) {
            timezone = sysSetting.getAt(0).get('timezone').replace(/\(GMT(.*?)\)(.*)/, '$1');
            isNegative = false;
            if (timezone.indexOf('-') === 0) {
                isNegative = true;
            }
            timezone = timezone.split(':');
            timeOffset = parseInt(timezone[0] || 0) * 60;
            timeOffset += parseInt(timezone[1] || 0) * (isNegative ? -1 : 1);
        }
        return timeOffset;
    },
    /**
     * [getLocalTzOffset description]
     * @return {int} minutes
     */
    getLocalTzOffset: function() {
        return new Date().getTimezoneOffset();
    },
    /**
     * [getDayLightSavingOffset description]
     * @return {float} minutes
     */
    getDayLightSavingOffset: function() {
        var offset = 0,
            gap = 0;
        if (os.desktop.clocks.systemDateTime.getTime()) {
            gap = (os.desktop.clocks.systemDateTime.getTime().getTime() - new Date().getTime()) / 3600000;
            gap = Math.round(gap * 10) / 10 * 60;
            offset = gap - (os.desktop.getNASTzOffset() + os.desktop.getLocalTzOffset());
        }
        return offset;
    },
    /**
     * format ms to NAS datetime
     * @return {String} formated String by NAS Datetime format.
     */
    formatMsToNASDt: function(ms) {
        var dt = new Date(ms),
            sysSetting = os.dataStore.sysSetting,
            sysRecord = sysSetting.getAt(0),
            timeformat = 'H:i:s',
            dateformat = 'Y-m-d';
        if (sysRecord) {
            dateformat = sysSetting.ymdDateFormats[sysRecord.get('dateformatindex') - 1];
            if (sysRecord.get('timeformat') === 12) {
                timeformat = 'h:i:s A';
            }
        }
        return dt.format(dateformat + ' ' + timeformat);
    },
    isFullScreen: function() {
        var fsElement = document.mozFullScreenElement ||
            document.webkitCurrentFullScreenElement ||
            document.fullscreenElement;
        if (fsElement) {
            return true;
        }
        return false;
    },
    /**
     * [openBetaUserConfirmWin description]
     * @param  {[type]} callbackFn [description]
     * @param  {[type]} fromFw     from [control panel] > [Firmware Update]
     * @return {[type]}            [description]
     */
    openBetaUserConfirmWin: function(callbackFn, fromFw) {
        var divStyle = 'margin-bottom: 10px; line-height: 1.5;';
        callbackFn = callbackFn || Ext.emptyFn;

        this.betaUserConfirmWin = new QNAP.QOS.baseWindow({
            title: _S.QTS_BETA_STR_01,
            resizable: false,
            closable: true,
            minimizable: false,
            modal: true,
            height: 'auto',
            width: 746,
            layout: 'auto',
            cls: 'utility-window',
            items: [{
                xtype: 'box',
                tpl: new Ext.XTemplate('<div style="text-align: right; margin-bottom: 20px;"><img src="{logoImg}" alt="QNAP logo" style="width:97px; height:17px;" ></div><div style="{divStyle}" >{introduction}</div><div style="{divStyle}" >{termsHead}</div><ul style="list-style: decimal; padding-left: 1.5rem; line-height: 1.4;"><li>{term1}</li><li>{term2}</li><li>{term3}</li><li>{term4}</li></ul>'),
                getTplData: function() {
                    return {
                        logoImg: '/cgi-bin/images/desktop/beta_logo.png?' + URL_RANDOM_NUM,
                        introduction: _S.QTS_BETA_STR_02,
                        termsHead: _S.QTS_BETA_STR_03,
                        term1: _S.QTS_BETA_STR_04,
                        term2: _S.QTS_BETA_STR_05,
                        term3: _S.QTS_BETA_STR_06,
                        term4: _S.QTS_BETA_STR_07,
                        divStyle: divStyle
                    };
                },
                qInternational: true,
                qInternationalFn: function() {
                    this.update(this.getTplData());
                },
                listeners: {
                    single: true,
                    render: function() {
                        this.data = this.getTplData();
                    }
                }
            }, {
                xtype: 'qtscheckbox',
                boxLabel: _S.QTS_BETA_STR_08,
                qInternational: true,
                ref: 'agreeChk',
                qInternationalKey: {
                    boxLabel: 'QTS_BETA_STR_08'
                }
            }, {
                xtype: 'box',
                tpl: new Ext.XTemplate('<div style="{divStyle}" >{confirm}</div><div class="note-color">{note}</div>'),
                getTplData: function() {
                    return {
                        confirm: _S.QTS_BETA_STR_09,
                        note: fromFw ? '' : _S.QTS_BETA_STR_10,
                        divStyle: divStyle
                    };
                },
                qInternational: true,
                qInternationalFn: function() {
                    this.update(this.getTplData());
                },
                listeners: {
                    single: true,
                    render: function() {
                        this.data = this.getTplData();
                    }
                }
            }],
            fbar: [{
                text: _S.QTS_BETA_STR_13,
                disabled: true,
                qInternational: true,
                ref: '../yesBtn',
                qInternationalKey: 'QTS_BETA_STR_13',
                cls: 'qts-button'
            }, {
                text: _S.IEI_NAS_BUTTON_NO,
                qInternational: true,
                ref: '../noBtn',
                qInternationalKey: 'IEI_NAS_BUTTON_NO',
                cls: 'qts-button'
            }],
            agreeUpdate: function(chk, checked) {
                this.yesBtn.setDisabled(!checked);
            },
            applyBeta: function() {
                this.el.mask(_S.IEI_NAS_ACL24);
                os.setBetaUserStatus(true, {
                    success: function() {
                        os.fireEvent('broadcast', 'agreeBetaUser');
                        QNAP.QOS.config.agreeBeta = '1';
                    },
                    callback: function() {
                        this.close();
                    }
                }, this);
            },
            skipBeta: function() {
                this.el.mask(_S.IEI_NAS_ACL24);
                os.setBetaUserStatus(false, {
                    success: function() {
                        os.fireEvent('broadcast', 'cancelBetaUser');
                        QNAP.QOS.config.agreeBeta = '0';
                    },
                    callback: function() {
                        this.close();
                    }
                }, this);
            },
            listeners: {
                single: true,
                afterrender: function() {
                    var agreeChk = this.agreeChk,
                        yesBtn = this.yesBtn,
                        noBtn = this.noBtn;
                    yesBtn.scope = noBtn.scope = agreeChk.scope = this;
                    agreeChk.handler = this.agreeUpdate;
                    agreeChk.wrap.applyStyles('margin: 20px 0;');
                    yesBtn.handler = this.applyBeta;
                    noBtn.handler = this.skipBeta;
                },
                close: callbackFn
            }
        }).show();
    },
    QPKGinfoIsReady: function() {
        return os.qpkgStore.loaded && os.qpkgInfoStore.loaded && !Ext.isEmpty(_S.QTS_DESKTOP_MSG_1) && this.clocks.systemDateTime.getTime();
    },
    openNotSupportQPKGListWin: function() {
        var affectedListWin;
        if (this.QPKGinfoIsReady()) {
            var qpkgMap = os.checkNewQPKG();
            var divStyle = 'margin-bottom: 10px; line-height: 1.5;',
                divStyle2 = 'margin-bottom: 20px; line-height: 1.5;',
                divStyle3 = 'margin-bottom: 5px; line-height: 1.5;';
            var winInfo = [{
                xtype: 'box',
                tpl: new Ext.XTemplate('<div style="{divStyle}" >{introduction}</div>'),
                getTplData: function() {
                    return {
                        introduction: _S.QPKG_STRING_99,
                        divStyle: divStyle2
                    };
                },
                qInternational: true,
                qInternationalFn: function() {
                    this.update(this.getTplData());
                },
                listeners: {
                    single: true,
                    render: function() {
                        this.data = this.getTplData();
                    }
                }
            }];

            if (qpkgMap.notSupport.length > 0) {
                winInfo.push({
                    xtype: 'box',
                    tpl: new Ext.XTemplate('<div style="{divStyle}" >{text}</div><div style="{divStyle2}" class="fb" >{qpkgs}</div>'),
                    getTplData: function() {
                        return {
                            text: _S.QPKG_STRING_100,
                            qpkgs: qpkgMap.notSupport.join(', '),
                            divStyle: divStyle3,
                            divStyle2: divStyle2
                        };
                    },
                    qInternational: true,
                    qInternationalFn: function() {
                        this.update(this.getTplData());
                    },
                    listeners: {
                        single: true,
                        render: function() {
                            this.data = this.getTplData();
                        }
                    }
                });
            }

            if (qpkgMap.minVersion.length > 0) {
                winInfo.push({
                    xtype: 'box',
                    tpl: new Ext.XTemplate('<div style="{divStyle}" >{text}</div><div style="{divStyle2}" class="fb" >{qpkgs}</div>'),
                    getTplData: function() {
                        return {
                            text: _S.QPKG_STRING_101,
                            qpkgs: qpkgMap.minVersion.join(', '),
                            divStyle: divStyle3,
                            divStyle2: divStyle2
                        };
                    },
                    qInternational: true,
                    qInternationalFn: function() {
                        this.update(this.getTplData());
                    },
                    listeners: {
                        single: true,
                        render: function() {
                            this.data = this.getTplData();
                        }
                    }
                });
            }

            affectedListWin = new QNAP.QOS.baseWindow({
                title: _S.QPKG_STRING_102,
                qInternational: true,
                resizable: false,
                closable: true,
                minimizable: false,
                height: 'auto',
                width: 646,
                layout: 'auto',
                cls: 'utility-window',
                qInternationalKey: 'QPKG_STRING_101',
                items: winInfo,
                fbar: [{
                    text: _S.IEI_NAS_BUTTON_CLOSE,
                    qInternational: true,
                    ref: '../closeBtn',
                    qInternationalKey: 'IEI_NAS_BUTTON_CLOSE',
                    cls: 'qts-button'
                }],
                listeners: {
                    single: true,
                    afterrender: function() {
                        var closeBtn = this.closeBtn;
                        closeBtn.scope = this;
                        closeBtn.handler = this.close;
                    }
                }
            });
        }
        os.openApp('qpkg', {
            config: {
                update: true
            }
        }, function() {
            if (affectedListWin && qpkgMap.notSupport.length + qpkgMap.minVersion.length > 0) {
                affectedListWin.show();
            }
        });
    },
    installCodexPack: function() {
        if (os.file.getSysSetting().need_codexpack_standalone === 1) {
            os.openApp('qpkg', {
                config: {
                    install: 'CodexPack',
                    all: true,
                    runMore: true
                }
            });
        } else {
            os.openApp('hdStation');
        }
    },
    loadDefaultShortcut: function(callbackFn, scope) {
        Ext.Ajax.request({
            url: '/cgi-bin/userConfig.cgi?func=default_shortcut&sid=' + QNAP.QOS.user.sid,
            scope: scope || this,
            success: function(response) {
                var shortcuts = [],
                    resJSON = Ext.decode(response.responseText);
                if (resJSON.result === 0) {
                    Ext.each(resJSON.datas, function(shortcut) {
                        if (Ext.isEmpty(shortcut.config)) {
                            shortcut.config = {};
                        }
                        shortcut.config = Ext.apply(shortcut.config, {
                            page: 0
                        });
                        if (shortcut.appId === 'hdStation') {
                            shortcut.config.config = {
                                autoRun: 'startNow'
                            };
                        }
                        shortcuts.push(shortcut);
                    });
                    QNAP.QOS.config.defaultAdminShortcuts = shortcuts;
                    QNAP.QOS.config.defaultUserShortcuts = shortcuts;
                }
            },
            callback: callbackFn || Ext.emptyFn
        });
    },
    /**
     * include downloading and installing
     * @return {Boolean} true - some QPKG install, false
     */
    isQPKGInstalling: function() {
        var flag = false;
        os.dataStore.doingTaskList.each(function(record) {
            if (record.get('type') === 'appCenter') {
                flag = true;
                return false;
            }
        });
        return flag;
    },
    setPowerScheduleAlert: function() {
        if (!QNAP.QOS.user.isAdminGroup) {
            return false;
        }
        os.getPowerSchedule(function() {
            var powerSchedule = QNAP.QOS.config.powerSchedule;
            var alert, delay;
            this.initPowerScheduleAlert();
            if (powerSchedule) {
                alert = powerSchedule.alertTime;
                delay = powerSchedule.remainTime - alert;
                if (powerSchedule.remainTime < alert) {
                    this.psAlert.delay(0);
                } else if (delay < 3600) {
                    /*
                    If delay large then 1hr(3600 Sec.),
                    don't setup delay task
                    */
                    powerSchedule.remainTime = powerSchedule.remainTime - delay;
                    this.psAlert.delay(delay * 1000);
                } else {
                    this.psAlert.cancel();
                }
            } else {
                this.psAlert.cancel();
            }
        }, this);
    },
    initPowerScheduleAlert: function() {
        if (!this.psAlert) {
            var alert = {};
            this.psAlert = new Ext.util.DelayedTask(function() {
                if (this.win && this.win.isVisible()) {
                    return true;
                }

                var items, fbar, eventTime;
                var powerSchedule = QNAP.QOS.config.powerSchedule,
                    systemDateTime = os.desktop.clocks.systemDateTime;

                var getStr = function(remain, type) {
                        var TYPE_MAP, tpl, sec_num, hours, minutes, seconds;

                        TYPE_MAP = {
                            shutdown: 'IEI_NAS_BUTTON_SHUTDOWN',
                            reboot: 'IEI_NAS_BUTTON_RESTART',
                            sleep: 'QTS_SLEEP_TITLE_1'
                        };

                        tpl = _S.MISC_SB_07 || 'The system is scheduled to {action} in {minutes} minutes, {seconds} seconds. Do you want to skip the scheduled task at this time?';
                        sec_num = parseInt(remain / 1000, 10); // don't forget the second param
                        hours = Math.floor(sec_num / 3600);
                        minutes = Math.floor((sec_num - (hours * 3600)) / 60);
                        seconds = sec_num - (hours * 3600) - (minutes * 60);

                        if (hours < 10) {
                            hours = hours;
                        }
                        if (minutes < 10) {
                            minutes = minutes;
                        }
                        if (seconds < 10) {
                            seconds = seconds;
                        }
                        return tpl.replace('{minutes}', minutes)
                            .replace('{seconds}', seconds)
                            .replace('{action}', _S[TYPE_MAP[type]]);
                    },
                    updateRemainTime = function() {
                        var remain;
                        remain = this.eventTime - systemDateTime.getTime().getTime();
                        if (remain <= 0) {
                            this.refOwner.close();
                            os.desktop.setPowerScheduleAlert();
                            return;
                        }
                        this.setText(getStr(remain, this.eventType));
                    };

                eventTime = systemDateTime.getTime().getTime() + (powerSchedule.remainTime * 1000);
                items = {
                    xtype: 'container',
                    items: {
                        xtype: 'label',
                        ref: '../reminTimeLable',
                        eventTime: eventTime,
                        eventType: powerSchedule.type,
                        text: getStr(eventTime - systemDateTime.getTime().getTime(), powerSchedule.type)
                    }
                };

                fbar = [{
                    xtype: 'qtsbutton',
                    qInternational: true,
                    qInternationalKey: 'IEI_NAS_BUTTON_OK',
                    text: _S.IEI_NAS_BUTTON_OK,
                    scope: os.desktop,
                    handler: function(btn) {
                        os.skipNextPowerPower(this.setPowerScheduleAlert, this);
                        btn.ownerCt.ownerCt.close();
                    }
                }, {
                    xtype: 'qtsbutton',
                    qInternational: true,
                    qInternationalKey: 'IEI_NAS_BUTTON_CANCEL',
                    text: _S.IEI_NAS_BUTTON_CANCEL,
                    scope: this,
                    handler: function(btn) {
                        btn.ownerCt.ownerCt.close();
                    }
                }];

                this.win =
                    os.getMsgWindow(_S.IEI_NAS_MISC14_7, items, fbar)
                    .show();

                systemDateTime.on('ticktock', updateRemainTime, this.win.reminTimeLable);
                this.win.on('hide', function() {
                    systemDateTime.un('ticktock', updateRemainTime, this.win.reminTimeLable);
                }, this);
            });
        }
    },
    showQuickChangePwdUI: function() {
        var CLASS = 'opacity-hide-none-point';
        var viewPort, windowArea;
        viewPort = os.getViewport();
        windowArea = os.desktop.desktop.windowArea;
        os.openApp('PersonalSettings', {
            mode: 'forceChangePwd'
        });
        os.desktop.desktop.headBar.addClass(CLASS);
        os.desktop.shortcutsView.addClass(CLASS);
        viewPort.bottomDock.addClass(CLASS);
        viewPort.bottomDock.hide();
        viewPort.rightBorder.addClass(CLASS);
        viewPort.leftBorder.addClass(CLASS);
        windowArea.modelName.addClass(CLASS);
        windowArea.dateTime.addClass(CLASS);
        QNAP.QOS.user.common.showPCUtil = false;
    },
    appendPwExpireNotify: function(store) {
        var desktop, localTzOffset, NASTzOffset, timeOffset,
            id, curSysTime, varContent, eventTime;
        varContent = _S.QTS_MSG_19;
        varContent = varContent.replace('{0}', QNAP.QOS.user.pwExpiryDate);
        desktop = os.desktop;
        localTzOffset = desktop.getLocalTzOffset();
        NASTzOffset = desktop.getNASTzOffset();
        timeOffset = (NASTzOffset + localTzOffset + desktop.getDayLightSavingOffset()) * 60;
        curSysTime = desktop.clocks.systemDateTime.getTime() / 1000;
        eventTime = QNAP.QOS.user.datetime.pageTime;

        if (store.baseParams.startTime > eventTime - timeOffset) {
            store.un('load', os.desktop.appendFWNotify);
            return;
        }

        id = eventTime + '_PW_EXPIRE';

        if (store.getById(id)) {
            return;
        }

        store.loadData({
            list: [{
                'id': id,
                'facility': '17', // System
                'facilityStr': 'System',
                'name': '',
                'desc': varContent,
                'msgCode': 'QTS_MSG_19',
                'varNum': 1,
                'varContent': QNAP.QOS.user.pwExpiryDate,
                'timeSec': curSysTime - timeOffset,
                'timeSecStr': '',
                'endtimeSec': curSysTime - timeOffset,
                'endtimeSecStr': '',
                'count': '1',
                'uid': '-1',
                'gid': '-1',
                'logType': 'notifyLog',
                'date': '',
                'time': ''
            }]
        }, true);
    },
    initMediaLibPlayTask: function() {
        var task_id, query_url;
        task_id = 'qts_medialib_playing_task';
        query_url = '/cgi-bin/management/manaRequest.cgi?subfunc=player&op=1';
        os.addExtraTask(task_id, query_url)
            .on({
                exception: function(porxy, type, action, options, response, arg) {
                    var STOP_URL;
                    var json, tasks, store, dataReader, resJSON;

                    STOP_URL = QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'management/manaRequest.cgi', {
                        subfunc: 'player',
                        apply: '1',
                        op: '2'
                    });

                    store = this;
                    tasks = [];
                    resJSON = Ext.decode(response.responseText);
                    json = {
                        datas: {
                            tasks: []
                        }
                    };
                    if (resJSON.status !== "0") {
                        return;
                    }
                    dataReader = os.initStore('mediaLibPlayingTaskStore');

                    dataReader.loadData(resJSON);

                    dataReader.each(function(record) {
                        var info, jobId, status_msg, appInfo;
                        jobId = record.get('jobID');
                        info = record.get('info');
                        status_msg = info.appType;
                        if (/^FileStation$/i.test(status_msg)) {
                            status_msg = 'fileExplorer';
                        } else if (/^videoStation$/i.test(status_msg)) {
                            status_msg = 'videoStationPro';
                        }

                        appInfo = QNAP.QOS.lib.getAppInfo(status_msg);

                        if (appInfo) {
                            status_msg = appInfo.defaultTitle;
                        }
                        status_msg = [_S.MISC_QSYNC_CLIENT_WIZ57, status_msg].join(' ');

                        if (record.get('info').playerState !== 'PLAY') {
                            return true;
                        }
                        tasks.push({
                            task_id: jobId,
                            task_name: record.get('name'),
                            type_name: record.get('displayType'),
                            status: 3,
                            icon: '/cgi-bin/images/desktop/headbar/multizone.png?' + URL_RANDOM_NUM,
                            act_stop: STOP_URL + '&dev_id=' + jobId,
                            status_msg: status_msg,
                            info: record.get('info')
                        });
                    });

                    if (tasks.length > 0) {
                        json.datas.tasks = tasks;
                    }

                    store.loadData(json);

                }
            });

        os.on('resetlang', function() {
            os.addExtraTask(task_id, query_url).reload();
        });
    },
    showBootingQPKGMsg: function(bootingData) {
        var DH, msgId, msgTpl;

        bootingData = bootingData || this.getBootingQPKGData();
        bootingData.isExpand = false;
        if (this.updateBootingQPKGTask) {
            return;
        }
        if (QNAP.QOS.config.isBooting ||
            (bootingData.bootList.length + bootingData.waitList.length > 0)) {

            msgId = Ext.id(null, 'booting-qpkg');
            msgTpl = this.renderBootingQPKGMsg(msgId, msgTpl, bootingData);

            if (this.updateBootingQPKGTask) {
                Ext.TaskMgr.stop(this.updateBootingQPKGTask);
            }

            this.updateBootingQPKGTask = {
                run: function() {
                    Ext.Ajax.abort(this.ajaxId);
                    this.ajaxId = Ext.Ajax.request({
                        url: this.CGI_PATH,
                        method: 'POST',
                        scope: this,
                        success: function(response) {
                            var DQ, qpkgStore, qItems, record, boot_run_status, reloadFlag;
                            DQ = Ext.DomQuery;
                            qpkgStore = os.qpkgStore;
                            reloadFlag = false;

                            Ext.each(DQ.select('qItem', response.responseXML), function(qItem) {
                                record = qpkgStore.getById(DQ.selectValue('name', qItem, ''));
                                if (record) {
                                    boot_run_status = DQ.selectNumber('boot_run_status', qItem, 0);
                                    if (boot_run_status === record.get('boot_run_status')) {
                                        return true; // next item
                                    }
                                    record.set('boot_run_status', boot_run_status);
                                    if (reloadFlag) {
                                        return true; // next item
                                    }
                                    if (boot_run_status === 2 &&
                                        os.serviceStore
                                        .query('appId', new RegExp('^' + RegExp.escape(record.id) + '$', 'i'))
                                        .getCount() > 0) {
                                        reloadFlag = true;
                                    }
                                }
                            });
                            if (reloadFlag) {
                                os.stationStore.reload();
                                os.serviceStore.reload();
                            }
                        },
                        callback: function(options, success, response) {
                            var bootingData, desktop;
                            desktop = os.desktop;
                            bootingData = desktop.getBootingQPKGData();
                            desktop.renderBootingQPKGMsg(this.msgId, this.msgTpl, bootingData);
                            if (!QNAP.QOS.config.isBooting &&
                                (bootingData.bootList.length + bootingData.waitList.length === 0)) {
                                Ext.TaskMgr.stop(desktop.updateBootingQPKGTask);
                            }
                        }
                    });
                },
                msgId: msgId,
                msgTpl: msgTpl,
                ajaxId: 0,
                CGI_PATH: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'application/appRequest.cgi', {
                    subfunc: 'qpkg',
                    get_run_status: '1'
                }),
                interval: 6000 // 30 second
            };

            Ext.TaskMgr.start(this.updateBootingQPKGTask);
        }
    },
    initMsgCt: function() {
        var DH = Ext.DomHelper;
        if (!this.msgCt) {
            this.msgCt = DH.insertFirst(document.body, {
                cls: 'q-msg-box'
            }, true);
            this.bottomMsgCt = DH.insertFirst(this.msgCt, {
                cls: 'q-bottom-msg-box'
            }, true);

            this.centerMsgCt = DH.insertFirst(this.msgCt, {
                cls: 'q-center-msg-box'
            }, true);
            this.topMsgCt = DH.insertFirst(this.msgCt, {
                cls: 'q-top-msg-box'
            }, true);
        }
    },
    initCSS: function() {},
    getBootingQPKGData: function() {
        var bootingData, bootList, waitList, displayName, reloadFlag;

        bootList = [];
        waitList = [];
        reloadFlag = false;
        os.qpkgStore.each(function(record) {
            if (record.get('enable') !== 'TRUE') {
                return;
            }
            displayName = record.get('defaultTitle');

            /**
             * -1 unkwno
             *  0 waiting
             *  1 booting
             *  2 finish
             */
            switch (record.get('boot_run_status')) {
                case 0: // waitting
                    waitList.push({
                        id: record.id,
                        displayName: displayName
                    });
                    break;
                case 1: // booting
                    bootList.push({
                        id: record.id,
                        displayName: displayName
                    });
                    break;
                case 2: // booting finish
                case -1: // unknow
                    if (QNAP.QOS.config.isBooting) {
                        waitList.push({
                            id: record.id,
                            displayName: displayName
                        });
                    } else if (record.get('enable') === 'FALSE') {
                        reloadFlag = true;
                    }
            }
        });

        bootingData = {
            bootList: bootList,
            waitList: waitList
        };
        if (reloadFlag) {
            os.qpkgstore.reload();
        }
        return bootingData;
    },
    renderBootingQPKGMsg: function(msgId, msgTpl, bootingData) {
        var msgEl;

        msgEl = Ext.get(msgId);

        if (msgEl) {
            msgEl.updateList(bootingData);
        } else {
            if (!msgTpl) {
                msgTpl = new Ext.XTemplate(
                    '<tpl if="values.bootList.length || values.waitList.length">',
                    '<div id="{values.id}"" class=\'msg-box qpkg-booting-msg <tpl if="!values.isExpand">collapsed</tpl>\' >',
                    '<div class="msg-title">',
                    '<div class="msg-icon"><div class="app-ceneter-icon"></div></div>',
                    '<div class="text">{[_S[values.msg_title]||values.msg_title]}</div>',
                    '<button class="collapse-btn"></button>',
                    '</div>',
                    '<div class="msg-content"><div class="list-ct">',
                    '<ol class="booting-list status-list" style="{[values.bootList.length===0?"display: none;":""]}" >',
                    '<li class="status-title" >{[_S[values.boot_title]||values.boot_title]}',
                    '<tpl if="values.bootList.length &gt; 1">',
                    '<span class="item-count">{[values.bootList.length]}</span>',
                    '</tpl>',
                    '</li>',
                    '<tpl for="values.bootList">',
                    '<li class="status-item" data-id="{id}" >{displayName}</li>',
                    '</tpl>',
                    '</ol>',
                    '<ol class="waiting-list status-list" style="{[values.bootList.length===0?"display: none;":""]}" >',
                    '<li class="status-title" >{[_S[values.wait_title]||values.wait_title]}',
                    '<tpl if="values.waitList.length &gt; 1">',
                    '<span class="item-count">{[values.waitList.length]}</span>',
                    '</tpl>',
                    '</li>',
                    '<tpl for="values.waitList">',
                    '<li class="status-item" data-id="{id}" >{displayName}</li>',
                    '</tpl>',
                    '</ol>',
                    '</div></div>',
                    '</div>',
                    '</tpl>'
                );
            }

            this.initMsgCt();
            Ext.apply(bootingData, {
                id: msgId,
                isExpand: false,
                boot_title: 'QTS_QPKG_BOOT_MSG_2',
                wait_title: 'QTS_QPKG_BOOT_MSG_3',
                msg_title: 'QTS_QPKG_BOOT_MSG_1'
            });

            msgEl = msgTpl.overwrite(this.bottomMsgCt, bootingData, true);
            if (!msgEl) {
                return;
            }

            Ext.apply(msgEl, {
                bootingData: bootingData,
                liTpl: new Ext.XTemplate('<li class="status-item" data-id="{id}" >{displayName}</li>'),
                scrollBar: new QNAP.CMP.Plugin.QTSScrollBar({
                    target: msgEl.child('.list-ct'),
                    cls: 'dark'
                }),
                getExpandTitle: function() {
                    var title = _S[this.bootingData.boot_title];
                    if (bootingData.bootList.length || bootingData.waitList.length) {
                        return [this.query('.status-item')[0].textContent, title].join(' ');
                    } else {
                        return title;
                    }
                },
                updateTitle: function() {
                    var title, titleHeight, titleText, titleTextEl;
                    title = this.child('.msg-title');
                    titleTextEl = title.child('.text');
                    titleHeight = title.getHeight();
                    if (this.bootingData.isExpand) {
                        this.setStyle({
                            'maxHeight': 224 + titleHeight + 'px'
                        });
                        this.scrollBar.updateSize();
                        titleText = _S[this.bootingData.msg_title];
                        this.removeClass('collapsed');
                    } else {
                        this.setStyle({
                            'maxHeight': titleHeight + 'px'
                        });
                        this.scrollBar.updateSize(true);
                        titleText = this.getExpandTitle();
                        this.addClass('collapsed');
                    }
                    titleTextEl.update(titleText);
                    Ext.QuickTips.register({
                        target: titleTextEl,
                        text: titleText
                    });
                },
                qInternationalFn: function() {
                    var msgId, msgTpl, bootingData;
                    msgTpl = this.msgTpl;
                    bootingData = this.bootingData;
                    msgId = bootingData.id;
                    Ext.copyTo(bootingData, os.desktop.getBootingQPKGData(), ['bootList', 'waitList']);
                    this.updateList(bootingData);
                },
                updateList: function(bootingData) {
                    var me, liTpl, bootListEl, waitListEl, bootTitle, waitTitle, newBootIds, newWaitIds;

                    me = this;
                    liTpl = me.liTpl;
                    bootListEl = me.select('.booting-list');
                    waitListEl = me.select('.waiting-list');
                    newBootIds = [];
                    newWaitIds = [];

                    Ext.each(bootingData.bootList, function(item) {
                        newBootIds.push(item.id);
                    });

                    Ext.each(bootingData.waitList, function(item) {
                        newWaitIds.push(item.id);
                    });

                    Ext.copyTo(me.bootingData, bootingData, ['bootList', 'waitList']);

                    me.select('.status-item.hide').remove();

                    Ext.each(me.bootIds, function(id, index) {
                        var ListItemEl;
                        if (newBootIds.indexOf(id) === -1) {
                            ListItemEl = this.getListItemEl(id);
                            if (!ListItemEl) {
                                return true;
                            }
                            Ext.fly(ListItemEl).addClass('hide');
                        }
                    }, me);

                    Ext.each(me.waitIds, function(id, index) {
                        var ListItemEl = this.getListItemEl(id);
                        if (!ListItemEl) {
                            return true;
                        }
                        if (newBootIds.indexOf(id) >= 0) {
                            bootListEl.appendChild(ListItemEl);
                        } else if (newWaitIds.indexOf(id) === -1) {
                            Ext.fly(ListItemEl).addClass('hide');
                        }
                    }, me);

                    this.createNewListItem(newWaitIds, waitListEl, bootingData.waitList);
                    this.createNewListItem(newBootIds, bootListEl, bootingData.bootList);

                    me.bootIds = newBootIds;
                    me.waitIds = newWaitIds;

                    if (me.bootIds.length === 0) {
                        me.select('.booting-list').setDisplayed(false);
                    } else {
                        me.select('.booting-list').setDisplayed(true);
                        bootTitle = _S[me.bootingData.boot_title] || me.bootingData.boot_title;
                        if (me.bootIds.length > 1) {
                            bootTitle = [bootTitle, '<span class="item-count">', me.bootIds.length, '</span>'].join('');
                        }
                        me.select('.booting-list .status-title').update(bootTitle);
                    }

                    if (me.waitIds.length === 0) {
                        me.select('.waiting-list').setDisplayed(false);
                    } else {
                        me.select('.waiting-list').setDisplayed(true);
                        waitTitle = _S[me.bootingData.wait_title] || me.bootingData.wait_title;
                        if (me.waitIds.length > 1) {
                            waitTitle = [waitTitle, '<span class="item-count">', me.waitIds.length, '</span>'].join('');
                        }
                        me.select('.waiting-list .status-title').update(waitTitle);
                    }

                    if ((me.bootIds.length + me.waitIds.length) === 0) {
                        os.un('resetlang', me.qInternationalFn, me, {
                            delay: 1000
                        });
                        me.remove();
                    } else {
                        me.updateTitle();
                    }
                },
                getListItemEl: function(itemId) {
                    return this.query(['[data-id=', itemId, ']'].join(''))[0];
                },
                /**
                 * if item not exist in old list, use this function
                 */
                createNewListItem: function(newIDs, listEl, listData) {
                    Ext.each(newIDs, function(id, index) {
                        if (!this.getListItemEl(id)) {
                            listEl.insertHtml('beforeEnd', this.liTpl.apply(listData[index]));
                        }
                    }, this);
                },
                setBootingData: function(bootingData) {
                    var newBootIds, newWaitIds;

                    newBootIds = [];
                    newWaitIds = [];

                    Ext.each(bootingData.bootList, function(item) {
                        newBootIds.push(item.id);
                    });

                    Ext.each(bootingData.waitList, function(item) {
                        newWaitIds.push(item.id);
                    });

                    Ext.apply(this, {
                        bootIds: newBootIds,
                        waitIds: newWaitIds,
                        bootingData: bootingData
                    });
                }
            });

            msgEl.updateTitle();

            msgEl.on('click', function() {
                this.bootingData.isExpand = !this.bootingData.isExpand;
                this.updateTitle();
            }, msgEl, {
                delegate: '.msg-title'
            });

            os.on('resetlang', msgEl.qInternationalFn, msgEl, {
                delay: 1000
            });
        }

        msgEl.bootItmes = [];
        msgEl.select('.booting-list .status-item').each(function(node) {
            msgEl.bootItmes.push(node.dom);
        });

        msgEl.waitItmes = [];
        msgEl.select('.waiting-list .status-item').each(function(node) {
            msgEl.waitItmes.push(node.dom);
        });
    },
    /**
     * get_shutdown_warning_flag
     * @param  {Function} callback
     *         callback (warning_flag)
     *         warning_flag
     *         		0 - nothing
     *         		1 - rsync running
     *         		2 - iscsi connected
     *         	if rsync is working and iscsi connected, warning_flag = 5(1+4)
     *         		callback(5)
     *         	if nothing to warning, warning_flag = 0
     *         		callback(0)
     *
     */
    get_shutdown_warning_flag: function(callback, scope) {
        var RSYNC_FLAG, ISCSI_FLAG, VM_FLAG, TAL_CHK_CNT;
        var warning_flag, callback_cnt;
        var item_callback, check_rsync_running_status, check_iscsi_is_connected;

        RSYNC_FLAG = 1; // rsync running
        ISCSI_FLAG = 2; // iSCSI connecting
        VM_FLAG = 4; // VM running
        RTRR_FLAG = 8; // RTRR running
        TAL_CHK_CNT = 2;

        scope = scope || this;
        warning_flag = 0;
        callback_cnt = 0;

        item_callback = function() {
            callback_cnt++;
            if (callback_cnt === TAL_CHK_CNT) {
                callback.apply(scope, [warning_flag]);
            }
        }

        check_rsync_running_status = function() {
            QNAP.QOS.ajax({
                url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'sys/sysRequest.cgi', {
                    subfunc: 'power_mgmt',
                    apply: 'chk_shutdown_running'
                }),
                method: 'GET',
                success: function(response, opts) {
                    var ITEM_MAP;
                    var fnSelectValue;
                    var name, status;

                    ITEM_MAP = {
                        Rsync: 1,
                        VMs: 4,
                        RTRR: 8
                    };

                    fnSelectValue = Ext.DomQuery.selectValue;
                    Ext.each(Ext.DomQuery.jsSelect('item', response.responseXML), function(dom) {
                        name = fnSelectValue('name', dom, '');
                        status = fnSelectValue('status', dom, '');
                        if (ITEM_MAP[name] && status === '1') {
                            warning_flag += ITEM_MAP[name];
                            ITEM_MAP[name] = undefined;
                        }
                    });
                },
                failure: function() {},
                callback: item_callback
            });
        }

        check_iscsi_is_connected = function() {
            os.initStore('iscsi_target_status').load({
                callback: function(records) {
                    Ext.each(records, function(record) {
                        if (record.get('targetStatus') === '1') {
                            warning_flag += 2;
                            return false;
                        }
                    });
                    item_callback();
                }
            });
        }


        check_rsync_running_status();
        check_iscsi_is_connected();

        setTimeout(function() {
            if (callback_cnt < TAL_CHK_CNT) {
                callback_cnt = TAL_CHK_CNT - 1;
                item_callback();
            }
        }, 60000);
    },
    /**
     * show reboot/shutdown/sleep/update firmware confirm window
     * @param  {String} action
     *         REBOOT
     *         SHUTDOWN
     *         SLEEP
     *         UPDATE_FIREMWARE
     */
    show_shutdown_warning_confirm: function(warning_flag, action_code) {
        var ACT_CODE;
        var RSYNC_FLAG;
        var ISCSI_FLAG;
        var VM_FLAG;
        var RTRR_FLAG;
        var LABEL_FORMAT;
        var getMsg, rebootFn, shutdownFn, sleepFn, updateFwRebootFn;
        var me, msg, msg_win, window_title, actFn, action_option;

        Ext.Msg.wait(_S.QTS_INIT_LOADING);

        getMsg = function(warning_flag, action_code) {
            var ITEM_FLAGS;
            var mask, msg;

            /**
             * 1 - rsync running
             * 2 - iscsi connected
             * 4 - VMs running
             * 8 - RTRR running
             * @type {Array}
             */
            ITEM_FLAGS = [{
                flag: RSYNC_FLAG,
                label: 'BACKUP_CLIENT_STRING01',
                tag: 'rsync'
            }, {
                flag: ISCSI_FLAG,
                label: 'QTS_ISCSI_CONNECTION',
                tag: 'iSCSI_target'
            }, {
                flag: VM_FLAG,
                label: 'VM_IS_RUNNING',
                tag: 'QPKG_vm'
            }, {
                flag: RTRR_FLAG,
                label: 'BACKUP_CLIENT_STRING02',
                tag: 'rtrr'
            }];

            msg = '';

            mask = RSYNC_FLAG | ISCSI_FLAG | VM_FLAG | RTRR_FLAG;

            if (warning_flag & mask) {
                msg += _S.QTS_SHUTDOWN_WARNING_HEAD;
                Ext.each(ITEM_FLAGS, function(item) {
                    if (warning_flag & item.flag) {
                        msg += String.format(LABEL_FORMAT, _S[item.label] || item.label, item.tag);
                    }
                });
                msg += '<br><br>' + _S.QTS_SHUTDOWN_WARNING_END;
            } else {
                msg = _S[ACT_CODE[action_code].MSG];
            }
            if (action_code === ACT_CODE.SLEEP.CODE) {
                msg += '<br><br>' + _S[ACT_CODE.SLEEP.EXT_MSG];
            }

            return msg
        };

        rebootFn = function(btnId) {
            if (btnId === 'yes') {

                me.stopLeaveConfirm();
                os.qTaskMgr.stopAll();
                os.rebootNas();
                Ext.Msg.wait(_S.QUICK11_RESTART_STR04, _S.IEI_NAS_BUTTON_RESTART);
                me.waitReboot();
            }
        };

        shutdownFn = function(btnId) {
            if (btnId === 'yes') {

                me.stopLeaveConfirm();
                os.qTaskMgr.stopAll();
                os.shutdownNas();
                Ext.Msg.wait(_S.QTS_DESKTOP_MSG_3, _S.IEI_NAS_BUTTON_SHUTDOWN);
                me.pingNas(_S.IEI_IDS_STRING80);
            }
        };

        sleepFn = function(btnId) {
            if (!os.dataStore.sysSetting.getAt(0).data.sleepSupport) {
                return;
            }
            if (btnId == 'yes') {
                me.stopLeaveConfirm();
                os.qTaskMgr.stopAll();
                os.sleepNas();
                Ext.Msg.show({
                    closable: false,
                    msg: _S.QTS_SLEEP_MSG_3,
                    icon: Ext.MessageBox.INFO,
                    width: 480
                });
            }
        };

        updateFwRebootFn = function(btn) {
            if (btn == 'yes') {
                os.qTaskMgr.stopAll();
                os.rebootNas();
                Ext.Msg.wait(_S.QUICK11_RESTART_STR04);
                os.desktop.waitReboot();
            }
        };


        RSYNC_FLAG = 1; // rsync running
        ISCSI_FLAG = 2; // iSCSI connecting
        VM_FLAG = 4; // VM running
        RTRR_FLAG = 8; // RTRR running
        LABEL_FORMAT = "<br><qtag class='q-dlg-link-text' data-link={1}>{0}</qtag>";

        ACT_CODE = {
            REBOOT: {
                CODE: 'REBOOT',
                TITLE: 'IEI_NAS_BUTTON_RESTART',
                MSG: 'IEI_NAS_MISC14_1',
                actFn: rebootFn
            },
            SHUTDOWN: {
                CODE: 'SHUTDOWN',
                TITLE: 'IEI_NAS_BUTTON_SHUTDOWN',
                MSG: 'IEI_NAS_MISC14_2',
                actFn: shutdownFn
            },
            SLEEP: {
                CODE: 'SLEEP',
                TITLE: 'QTS_SLEEP_TITLE_1',
                MSG: 'QTS_SLEEP_MSG_1',
                EXT_MSG: 'QTS_SLEEP_MSG_2',
                actFn: sleepFn
            },
            UPDATE_FW_REBOOT: {
                CODE: 'UPDATE_FW_REBOOT',
                TITLE: 'FIRMWARE_UPDATE_REBOOT_3',
                MSG: 'IEI_NAS_MISC4_TITLE16',
                EXT_MSG: 'QTS_SLEEP_MSG_2',
                actFn: updateFwRebootFn
            },
            UPDATE_FW_REBOOT: {
                CODE: 'UPDATE_FW_REBOOT',
                TITLE: 'FIRMWARE_UPDATE_REBOOT_3',
                MSG: 'IEI_NAS_MISC4_TITLE16',
                EXT_MSG: 'QTS_SLEEP_MSG_2',
                actFn: updateFwRebootFn
            }
        };

        me = this;
        action_option = ACT_CODE[action_code];
        window_title = _S[action_option.TITLE];
        actFn = action_option.actFn;
        msg = getMsg(warning_flag, action_code);

        Ext.Msg.hide();
        msg_win = Ext.Msg.confirm(window_title, msg, actFn).getDialog()
        msg_win.setWidth(600).center()
            .getEl().on({
                click: function(e) {
                    Ext.Msg.hide();
                    switch (e.getTarget().getAttribute('data-link')) {
                        case 'rtrr':
                            os.openApp('backupRestore', {
                                showUI: 'RTRRClient'
                            });
                            break;
                        case 'rsync':
                            os.openApp('backupRestore', {
                                showUI: 'RsynClient'
                            });
                            break;
                        case 'iSCSI_target':
                            os.openStorageMgr('iSCSI');
                            break;
                        case 'QPKG_vm':
                            os.openApp('QKVM');
                            break;
                    }
                },
                delegate: 'qtag'
            });
        return msg_win;
    },
    openTASTipWin: function(closeConfirm) {
        var tasTipURL = 'https://www.qnap.com/solution/android-nas/tas-tutorial/';
        if (Ext.isEmpty(this.TASTipWin)) {
            this.TASTipWin = new QNAP.QOS.baseWindow({
                title: _S.TAS_STR_1,
                resizable: false,
                closable: true,
                minimizable: false,
                height: 500,
                width: 840,
                closeAction: 'hide',
                layout: 'auto',
                cls: 'desktop-window',
                items: [{
                    xtype: 'box',
                    style: {
                        'width': '100%',
                        'height': '100%'
                    },
                    listeners: {
                        afterrender: function(cmp) {
                            var lang = QNAP.QOS.user.lang == "auto" ? QNAP.QOS.lib.browserSelectLanguage() : QNAP.QOS.user.lang;
                            cmp.update(Ext.DomHelper.markup({
                                tag: 'iframe',
                                style: {
                                    'width': '100%',
                                    'height': '100%',
                                    'border': 'none'
                                },
                                src: tasTipURL + '?lang=' + lang
                            }));
                        }
                    }
                }]
            });

            this.TASTipWin.on({
                hide: function(win) {
                    win.el.child('iframe').parent().update(
                        Ext.DomHelper.markup({
                            tag: 'iframe',
                            style: {
                                'width': '100%',
                                'height': '100%',
                                'border': 'none'
                            }
                        }));
                    if (win.closeConfirm === false) {
                        return;
                    }
                    if (QNAP.QOS.user.common.autoShowTASTip !== 'false') {
                        Ext.Msg.confirm(_S.TAS_STR_1, _S.TAS_STR_3, function(btnId) {
                            if (btnId == 'yes') {
                                os.saveConfig('autoShowTASTip', 'true');
                                QNAP.QOS.user.common.autoShowTASTip = 'true';
                            } else {
                                os.saveConfig('autoShowTASTip', 'false');
                                QNAP.QOS.user.common.autoShowTASTip = 'false';
                            }
                        });
                    }
                }
            });
        } else {
            this.TASTipWin.on({
                single: true,
                show: function(win) {
                    var lang = QNAP.QOS.user.lang == "auto" ? QNAP.QOS.lib.browserSelectLanguage() : QNAP.QOS.user.lang;
                    win.el.child('iframe').dom.src = tasTipURL + '?lang=' + lang;
                }
            });
        }

        this.TASTipWin.closeConfirm = closeConfirm;
        this.TASTipWin.show();
    },
    showTASTipMsg: function() {
        if (this.TASTipWin && this.TASTipWin.isVisible) {
            return;
        }
        if (QNAP.QOS.user.common.autoShowTASTip !== 'false') {
            if (Ext.select('.tas-tip-msg').getCount() > 0) {
                return;
            }

            var msg = os.showMsg('', _S.TAS_STR_2, false);
            msg.addClass('link tas-tip-msg');
            msg.child('div.content').on('click', function(evt, target) {
                os.desktop.openTASTipWin();
                var msg = Ext.fly(target).parent('div.msg-box');
                var msgCt = os.desktop.msgCt;
                msg.replaceClass('msg-box', 'removing-msg-box');
                msg.remove();
                msgCt.alignTo(document, 'br-br', [-10, 7]);
                msgCt.setStyle({
                    top: 'auto'
                });
            });

        }
    },
    fix_open_app_args_for_transcode_info: function(appId, cfg) {
        var CONTROL_PANEL_ID, MEDIA_LIBRARY_ID;

        CONTROL_PANEL_ID = 'systemPreferences';
        MEDIA_LIBRARY_ID = 'mediaLibrary';

        Ext.apply(cfg, {
            fn: MEDIA_LIBRARY_ID,
            config: cfg.config || {}
        });
        cfg.config.focusTab = parseInt(cfg.config.focusTab || 0) + 4;

        return {
            app_id: CONTROL_PANEL_ID,
            cfg: cfg
        };
    }
});

Ext.preg('pDesktop', QNAP.QOS.Desktop);
Ext.preg('pDesktop-2', QNAP.QOS.Desktop);

QNAP.QOS.OpenAppsWin = function(app, value) {
    if (value === '') {
        var obj = {};
        if (app == 'fileExplore') {
            obj = {
                app: app,
                newWin: true,
                pin: false
            };
        } else {
            obj = QNAP.QOS.systemItems[app];
        }
        os.openApp(app, null, obj);
    } else if (value.split('/').length > 1) {
        var param = {
            config: {
                newWin: true
            },
            path: value
        };
        os.openApp(app, param);
    } else {
        os.openApp(app, {
            fn: value
        }, QNAP.QOS.systemItems[value]);
    }
};

QNAP.QOS.MainMenuList = Ext.extend(Ext.DataView, {
    cls: 'side-menu',
    qInternational: true,
    qInternationalFn: function(cmp) {
        cmp.refresh();
    },
    itemSelector: "li.side-menu-item",
    groupSelector: "li.side-menu-title",
    overClass: 'side-menu-item--over',
    autoEl: 'ul',
    GROUP_INDEX: {
        'system': 10000,
        'station': 20000,
        'hdStation': 25000,
        'qpkg': 30000
    },
    tpl: new Ext.XTemplate(
        '<tpl for=".">' +
        '<tpl if="values.showTitle==true">' +
        '<li class="side-menu-title" >' +
        '{[this.getGroupTitle(values)]}' +
        '</li>' +
        '</tpl>' +
        '<tpl if="values.items && (values.items.length &gt; 0) ">' +
        '<tpl for="items">' +
        '<li class="side-menu-item" data-record-id="{id}" ext:qtip="{[this.getAppTitle(values.data)]}" >' +
        '<img src="{[this.getImgSrc(values.data)]}" class="item-img {[this.getImgCls(values.data)]}-img" ext:qtip="{[this.getAppTitle(values.data)]}" />' +
        '<span class="item-text" ext:qtip="{[this.getAppTitle(values.data)]}">{[this.getAppTitle(values.data)]}</span>' +
        '</li>' +
        '</tpl>' +
        '</tpl>' +
        '</tpl>', {
            getGroupTitle: function(data) {
                return (_S[data.qInternationalKey] || data.defaultTitle || data.name).toUpperCase();
            },
            getAppTitle: function(data) {
                return _S[data.qInternationalKey] || data.defaultTitle;
            },
            getImgCls: function(values) {
                var clsName = values.appId;
                if (values.config && values.config.fn) {
                    clsName = values.config.fn;
                }
                return clsName;
            },
            getImgSrc: function(values) {
                return String.format(values.icon, 20);
            }
        }),
    initComponent: function() {
        this.initQPKGItemTask = new Ext.util.DelayedTask(this.initQPKGItem, this);
        this.initStore();
        this.initSystemItem(true);
        this.checkIsSupportHDStation();
        QNAP.QOS.MainMenuList.superclass.initComponent.call(this);
    },
    initStore: function() {
        this.dataStore = new Ext.data.JsonStore({
            root: 'items',
            idProperty: 'itemId',
            fields: ['itemId', 'defaultTitle', 'appId', 'icon', 'config', 'isAdminOnly', 'groupId', 'qInternationalKey',
                {
                    name: 'itemIndex',
                    type: 'int'
                }
            ],
            sortInfo: {
                field: 'itemIndex',
                direction: 'ASC' // or 'DESC' (case sensitive for local sorting)
            }
        });

        this.viewStore = new Ext.data.JsonStore({
            root: 'groups',
            idProperty: 'groupId',
            fields: ['defaultTitle', 'items', 'showTitle', 'groupId', 'qInternationalKey',
                {
                    name: 'groupIndex',
                    type: 'int'
                }
            ],
            sortInfo: {
                field: 'groupIndex',
                direction: 'ASC' // or 'DESC' (case sensitive for local sorting)
            }
        });

        this.dataStore.on('update', function(store, record) {
            this.updateViewStoreItem([record]);
        }, this);

        this.dataStore.on('add', function(store, records) {
            this.updateViewStoreItem(records);
        }, this);

        this.dataStore.on('remove', function(store, record) {
            this.remove(record);
        }, this.viewStore);

        this.dataStore.on('clear', this.viewStore.clear, this.viewStore);
        this.mon(this.viewStore, 'datachanged', this.viewStoreChange, this);
        this.mon(this.viewStore, 'add', this.viewStoreChange, this);

        os.qpkgStore.on('load', this.initQPKGItemDelay, this);
        os.qpkgStore.on('update', this.initQPKGItemDelay, this);
        os.stationStore.on('load', this.initQPKGItemDelay, this);

        if (os.qpkgStore.loaded) {
            this.initQPKGItemDelay();
        }
        this.bindStore(this.viewStore);
    },
    initSystemItem: function(doInitCheck) {
        QNAP.QOS.ajax({
            url: 'apps/start.json',
            scope: this,
            success: function(response, opts) {
                var menu = this,
                    dataStore = menu.dataStore,
                    viewStore = menu.viewStore,
                    lib = QNAP.QOS.lib,
                    responseData = Ext.decode(response.responseText),
                    items = [],
                    groups = [];

                var removeList = [];
                var groupId = '';
                var itemIndex = this.GROUP_INDEX.system;
                Ext.each(responseData, function(group, index) {
                    groupId = 'system_' + index;
                    groups.push({
                        'showTitle': true,
                        'qInternationalKey': group.qInternationalKey,
                        'defaultTitle': group.defaultTitle,
                        'groupId': groupId,
                        'groupIndex': 100,
                        'items': []
                    });

                    Ext.each(group.items, function(item, index) {
                        var appInfo = lib.getAppInfo(item.appId);
                        if (!appInfo) {
                            return true;
                        }
                        if (item.appId === 'QuickStart' && !QNAP.QOS.config.supportQuickStart) {
                            return true;
                        }
                        if (item.appId === 'qsync' && !QNAP.QOS.user.supportQsync) {
                            return true;
                        }
                        if (item.isAdminOnly === 'true' && !QNAP.QOS.user.isAdminGroup) {
                            return true;
                        }
                        if (item.config) {
                            item.config = Ext.decode(item.config);
                            appInfo = lib.getAppInfo(item.config.fn);
                            Ext.copyTo(item, appInfo, ['qInternationalKey',
                                'defaultTitle',
                                'icon'
                            ]);
                        } else {
                            Ext.applyIf(item, appInfo);
                        }
                        /*
                        if ( typeof( QNAP.QOS.config.qHaCfg ) != 'undefined' && QNAP.QOS.config.qHaCfg.operation_status > 0 ){//(QNAP.QOS.config.ha_enabled) {
                        var idx = QNAP.QOS.config.ha_ns_functions.indexOf(item.appId);
                        if (-1 !== idx) {
                        removeList.push(item);
                        return true;
                        }
                        }
                        */
                        item.itemId = item.appId + '_' + index;
                        item.groupId = groupId;
                        item.itemIndex = itemIndex++;
                        items.push(item);
                    });
                });

                if (items.length > 0) {
                    viewStore.loadData({
                        groups: groups
                    }, true);
                    dataStore.loadData({
                        items: items
                    }, true);
                    dataStore.sort(
                        dataStore.sortInfo.field,
                        dataStore.sortInfo.direction);
                    viewStore.sort(
                        viewStore.sortInfo.field,
                        viewStore.sortInfo.direction);
                } else {
                    console.error('[Warning] Lost start menu systems item.');
                }
            },
            callback: function() {
                if (doInitCheck === true) {
                    _D('=== SideMenu initCheck ===');
                    os.initCheck(_S.QTS_INIT_LOADING, 'SideMenu initCheck');
                }
            }
        });
    },
    initQPKGItemDelay: function() {
        this.initQPKGItemTask.delay(500);
    },
    initQPKGItem: function() {
        var menu = this,
            lib = QNAP.QOS.lib,
            items = [],
            groups = [],
            groupId = 'qpkg_1',
            disabledItems = [];

        var dataStore = this.dataStore,
            viewStore = this.viewStore;

        groups.push({
            'showTitle': true,
            'qInternationalKey': 'MISC_QSYNC_CLIENT_WIZ86',
            'defaultTitle': 'Applications',
            'groupId': groupId,
            'groupIndex': 200,
            'items': []
        });

        var itemData, recordData, appId, serviceIndex, sys_app;
        var itemIndex = this.GROUP_INDEX.qpkg,
            serviceStore = os.serviceStore,
            backupStationIndex = itemIndex,
            displayBackupStation = true;

        os.qpkgStore.each(function(record, index) {
            sys_app = false;
            recordData = record.data;
            appId = recordData.appId;

            if (/HybridBackup/i.test(appId) && record.get('enable') !== 'FALSE') {
                displayBackupStation = false;
            }

            itemIndex += 10;
            itemData = {
                'groupId': groupId,
                'itemIndex': itemIndex,
                'appId': appId,
                'defaultTitle': recordData.defaultTitle,
                'icon': recordData.icon,
                'config': {},
                'itemId': appId
            };

            switch (recordData.visible) {
                case 0: // admin only
                    if (QNAP.QOS.user.account != 'admin') {
                        return true;
                    }
                    break;
                case 1: // administrator group
                    if (!QNAP.QOS.user.isAdminGroup) {
                        disabledItems.push(dataStore.getById(appId));
                        return true;
                    }
                    break;
            }

            serviceIndex = serviceStore.find('appId', appId);
            if (serviceIndex >= 0) {
                if (serviceStore.getAt(serviceIndex).get('allowed') === '0') {
                    disabledItems.push(dataStore.getById(appId));
                    return true;
                }
            }
            if (recordData.enable === "FALSE") {
                disabledItems.push(dataStore.getById(appId));
                return true;
            } else if (
                (record.get('webUI') !== 'null' || record.get('openIn') !== 'null') &&
                !(recordData.shell !== "null" && recordData.enable !== "TRUE")) {} else if (RCD_QPKGS[appId] && (record.get('webUI') === 'null')) {

            } else {
                disabledItems.push(dataStore.getById(appId));
                return true;
            }

            viewStore.each(function(group_record) {

                if (group_record.id.indexOf('system_') !== 0) {
                    return true;
                }

                Ext.each(group_record.get('items'), function(item) {
                    if (item.get('appId').toUpperCase() === appId.toUpperCase()) {
                        item.set('defaultTitle', recordData.defaultTitle || item.get('defaultTitle'));
                        sys_app = true;
                        return false;
                    }
                });

                if (sys_app) {
                    return false;
                }
            });

            if (!sys_app) {
                items.push(itemData);
            }
        });

        var appInfo;
        os.stationStore.each(function(record, index) {
            recordData = record.data;
            appId = recordData.appId;
            if (appId !== 'fileExplorer') {
                return true;
            }
            if (recordData.display !== 1) {
                disabledItems.push(dataStore.getById(appId));
                return;
            }
            appInfo = lib.getAppInfo(appId);
            itemIndex += 10;
            itemData = {
                'groupId': groupId,
                'itemIndex': itemIndex,
                'appId': appId,
                'defaultTitle': recordData.defaultTitle,
                'icon': appInfo.icon || recordData.icon,
                'config': {},
                'itemId': appId
            };
            items.push(itemData);
        });

        if (this.supportHDStation) {
            var hdApp = QNAP.QOS.lib.getAppInfo('hdStation');
            items.push({
                'icon': hdApp.icon,
                'qInternationalKey': hdApp.qInternationalKey,
                'appId': hdApp.appId,
                'config': {
                    fn: hdApp.appId
                },
                'groupId': groupId,
                'itemIndex': this.GROUP_INDEX.hdStation,
                'itemId': hdApp.appId
            });
        }

        if (QNAP.QOS.user.isAdminGroup && displayBackupStation) {
            var backupStApp = QNAP.QOS.lib.getAppInfo('backupRestore');
            items.push({
                'icon': backupStApp.icon,
                'qInternationalKey': backupStApp.qInternationalKey,
                'appId': backupStApp.appId,
                'groupId': groupId,
                'itemIndex': backupStationIndex,
                'itemId': backupStApp.appId
            });
        }

        viewStore.removeAt(viewStore.indexOfId(groupId));
        viewStore.loadData({
            groups: groups
        }, true);
        dataStore.loadData({
            items: items
        }, true);
        dataStore.remove(disabledItems);
        this.displayBackupStation = displayBackupStation;
        this.fixQPKGItemData();
    },
    updateViewStoreItem: function(records) {
        var viewStore = this.viewStore,
            itemIndex = -1;

        records.map(function(record, index) {
            var viewRecord;
            viewRecord = viewStore.getById(record.data.groupId);
            itemIndex = viewRecord.data.items.indexOf(record);
            if (itemIndex === -1) {
                viewRecord.data.items.push(record);
            } else {
                viewRecord.data.items[itemIndex] = record;
            }
        });
    },
    fixQPKGItemData: function() {
        var STATION_INDEX = this.GROUP_INDEX.station,
            dataStore = this.dataStore;
        var idRegx;
        var backupStationIndex = STATION_INDEX,
            tmpBackupStationIndex = 0,
            stationIndex;

        if (dataStore.getCount() === 0) {
            return;
        }

        dataStore.each(function(record) {
            idRegx = new RegExp('^' + RegExp.escape(record.data.appId) + '$', 'i');
            os.stationStore.each(function(stationRec, index) {
                if (idRegx.test(stationRec.data.appId)) {
                    stationIndex = STATION_INDEX + index * 10;
                    record.beginEdit();
                    record.set('itemIndex', stationIndex);
                    record.set('defaultTitle', stationRec.data.defaultTitle);

                    switch (stationRec.data.appId) {
                        case 'photoStation':
                        case 'musicStation':
                        case 'videoStationPro':
                        case 'downloadStation':
                        case 'webFileManager':
                        case 'fileExplorer':
                            tmpBackupStationIndex = stationIndex + 1;
                            break;
                    }
                    backupStationIndex = Math.max(backupStationIndex, tmpBackupStationIndex);
                    return true;
                }
            });
        });

        var backupRestoreApp;
        if (!this.displayBackupStation) {
            backupRestoreApp = dataStore.getById('HybridBackup');
            if (backupRestoreApp) {
                backupRestoreApp.beginEdit();
                backupRestoreApp.set('itemIndex', backupStationIndex);
            }
            backupRestoreApp = dataStore.getById('backupRestore');
            dataStore.remove(backupRestoreApp);
        } else if (QNAP.QOS.user.isAdminGroup) {
            backupRestoreApp = dataStore.getById('backupRestore');
            if (backupRestoreApp) {
                backupRestoreApp.beginEdit();
                backupRestoreApp.set('itemIndex', backupStationIndex);
            }
            backupRestoreApp = dataStore.getById('HybridBackup');
            dataStore.remove(backupRestoreApp);
        }

        dataStore.commitChanges();

        dataStore.sort(dataStore.sortInfo.field,
            dataStore.sortInfo.direction);

        function compare_label(labelA, labelB) {
            var labelA_chart = labelA.split('');
            var labelB_chart = labelB.split('');
            var labelALength = labelA_chart.length;
            var labelBLength = labelB_chart.length;
            var i = 0,
                l = Math.min(labelALength, labelBLength);
            var result;

            for (; i < l; i++) {
                result = labelA_chart[i].localeCompare(labelB_chart[i]);
                if (result !== 0) {
                    break;
                }
            }
            if (result === 0) {
                if (labelALength === labelBLength) {
                    result = 0;
                } else if (labelALength > labelBLength) {
                    result = 1;
                } else {
                    result = -1;
                }
            }
            return result;
        }

        this.viewStore.each(function(record) {
            record.data.items.sort(function(itemA, itemB) {
                var azAZnum_Regexp = /^\w/;
                var system_Regexp = /^system_/;
                var itemA_label = _S[itemA.data.qInternationalKey] || itemA.data.defaultTitle;
                var itemB_label = _S[itemB.data.qInternationalKey] || itemB.data.defaultTitle;

                if (system_Regexp.test(itemA.data.groupId) && system_Regexp.test(itemB.data.groupId)) {
                    return itemA.data.itemIndex - itemB.data.itemIndex;
                } else if (azAZnum_Regexp.test(itemA_label) && azAZnum_Regexp.test(itemB_label)) {
                    return compare_label(itemA_label, itemB_label);
                } else if (azAZnum_Regexp.test(itemA_label) && !azAZnum_Regexp.test(itemB_label)) {
                    return -1;
                } else if (!azAZnum_Regexp.test(itemA_label) && azAZnum_Regexp.test(itemB_label)) {
                    return 1;
                } else {
                    return compare_label(itemA_label, itemB_label);
                }
            });
        });

        this.viewStore.commitChanges();
        if (this.rendered) {
            this.refresh();
        }

    },
    checkIsSupportHDStation: function() {
        this.supportHDStation = this.isSupportHDStation();
    },
    isSupportHDStation: function() {
        var menu = this;
        if (!QNAP.QOS.user.isAdminGroup) {
            return;
        }
        var hdApp = QNAP.QOS.lib.getAppInfo('hdStation');
        var support = false;

        Ext.each(QNAP.QOS.systemPreferencesItems, function(itemClass) {
            Ext.each(itemClass.items, function(item) {
                if (item === 'hdStation') {
                    support = true;
                    return false;
                }
            });
            if (support) {
                return false;
            }
        });
        return support;
    },
    viewStoreChange: function(store) {},
    afterRender: function() {
        QNAP.QOS.MainMenuList.superclass.afterRender.call(this);
        this.initContextMenu();
        os.desktop.on('initialized', this.initDD, this, {
            single: true
        });

        this.on({
            'click': this.openApp,
            'contextmenu': this.showContextmenu,
            'containerclick': function(dv, e) {
                e.stopEvent();
            }
        });
        this.el.on({
            'scope': this,
            'touchstart': this.initContextMenuData,
            'mousedown': this.initContextMenuData
        });
    },
    initDD: function() {
        this.dargZone = new Ext.dd.DragZone(this.getEl(), {
            cmp: this,
            ddGroup: 'shortcutsView-dd',
            dropAllowed: 'q-dd-drop-drop',
            dropNotAllowed: 'q-dd-drop-nodrop',
            proxy: new Ext.dd.StatusProxy({
                dropAllowed: 'q-dd-drop-drop',
                dropNotAllowed: 'q-dd-drop-nodrop'
            }),
            onDrag: function(e) {
                if (this.proxy.el.shadow.el) {
                    this.proxy.el.shadow.el.addClass('drag-shadow');
                }
            },
            beforeDragDrop: function() {
                if (this.proxy.el.shadow.el) {
                    this.proxy.el.shadow.el.removeClass('drag-shadow');
                }
                return true;
            },
            getDragData: function(e) {
                var sourceEl = e.getTarget(this.cmp.itemSelector);
                if (sourceEl) {
                    var d = sourceEl.cloneNode(true);
                    d.id = Ext.id();
                    var qDatas = [];

                    qDatas.push(this.cmp.getQData(sourceEl));
                    var data = {
                        ddel: d,
                        qDatas: qDatas,
                        sourceEl: sourceEl,
                        repairXY: false
                    };
                    return data;
                }
            },
            onStartDrag: function(x, y) {
                this.cmp.refOwner.addClass('dragging');
                Ext.each(this.dragData.qDatas, function(qData) {
                    if (Ext.get(qData.sourceEl)) {
                        Ext.get(qData.sourceEl).removeClass(this.selectedClass);
                        Ext.get(qData.sourceEl).setOpacity(0.1);
                    }
                }, this.cmp);
                this.proxy.el
                    .setBottom('auto');
                this.proxy.ghost
                    .addClass('qts-mainmenu')
                    .setLeftTop('0px', '0px')
                    .setStyle({
                        'box-shadow': '0 0 1px #000',
                        'background': '#fff',
                        'list-style-type': 'none'
                    });
                this.constrainX = true;
                this.constrainY = true;
                var box = Ext.get(this.dragElId).getBox();
                var d = Ext.getBody().getBox();
                this.minX = d.x;
                this.minY = d.y;
                this.maxX = d.right - box.width;
                this.maxY = d.bottom - box.height;
            },
            onBeforeDrag: function(data, e) {
                e.stopEvent();
                this.cmp.dragging = true;
                return true;
            },
            endDrag: function(e) {
                this.cmp.refOwner.removeClass('dragging');
                e.stopEvent();
                this.hideProxy();
                Ext.fly(this.dragData.sourceEl).setOpacity(1);
                this.dragging = true;
                var fn = function() {
                    this.dragging = false;
                };
                fn.defer(1, this);
                this.cmp.dragging = false;
            }
        });
    },
    openApp: function(dv, index, node, e) {
        var record_id, record;

        record_id = Ext.fly(node).getAttribute('data-record-id');
        record = dv.dataStore.getById(record_id);

        if (record) {
            os.openApp(record.get('appId'), record.get('config'));
        }
    },
    initContextMenu: function() {
        this.contextMenu = new Ext.menu.Menu({
            data: {},
            items: [{
                itemId: 'openApp',
                text: _S.IEI_NAS_BUTTON_OPEN, // open
                qInternational: true,
                qInternationalKey: 'IEI_NAS_BUTTON_OPEN',
                listeners: {
                    click: function(item) {
                        var qData = item.parentMenu.data.qDatas[0];
                        os.openApp(qData.appId, qData.config);
                    }
                }
            }, {
                itemId: 'openAppAsWin',
                text: _S.QTS_OPEN_WIN, // open as win
                qInternational: true,
                qInternationalKey: 'QTS_OPEN_WIN',
                listeners: {
                    click: function(item, e) {
                        var qData = item.parentMenu.data.qDatas[0];
                        e.stopEvent();
                        os.openService(qData.appId, {
                            newWin: true
                        });
                    }
                }
            }],
            listeners: {
                beforeshow: function(menu) {
                    var contextMenu = menu;
                    if (!contextMenu.data.qDatas) {
                        return false;
                    }
                    var appId = contextMenu.data.qDatas[0].appId;
                    var appInfo = QNAP.QOS.lib.getAppInfo(appId);

                    contextMenu.getComponent('openApp').hide();
                    contextMenu.getComponent('openAppAsWin').hide();

                    if (appInfo.type === 'service') {
                        contextMenu.getComponent('openAppAsWin').show();
                        contextMenu.getComponent('openApp').setVisible(appInfo.serviceOpen == 'QOSWindow');
                    } else if (appInfo.type === 'QPKG') {
                        contextMenu.getComponent('openAppAsWin').show();
                        if (appInfo.openOnDesktop === '1') {
                            contextMenu.getComponent('openApp').show();
                        }
                        if (appInfo.webUI === 'QTS_desktop' || appInfo.webUI === 'null') {
                            contextMenu.getComponent('openAppAsWin').hide();
                        }
                    } else {
                        contextMenu.getComponent('openApp').show();
                    }
                    var openAsWinApp = ['fileExplorer', 'downloadStation'];

                    if (openAsWinApp.indexOf(appId) >= 0) {
                        contextMenu.getComponent('openAppAsWin').show();
                        contextMenu.getComponent('openApp').show();
                    }
                }
            }
        });
    },
    initContextMenuData: function(e) {
        var item = e.getTarget(this.itemSelector, this.getTemplateTarget());
        if (item) {
            this.contextMenu.data.qDatas = [this.getQData(item)];
        } else {
            this.contextMenu.data.qDatas = null;
        }
    },
    showContextmenu: function(dv, index, node, e) {
        e.stopEvent();
        dv.contextMenu.showAt(e.getXY());
        dv.dragging = false;
    },
    getQData: function(sourceEl) {
        var record_id = Ext.fly(sourceEl).getAttribute('data-record-id');
        var record = this.dataStore.getById(record_id);

        var appInfo = QNAP.QOS.lib.getAppInfo(record.data.appId, true),
            appType = appInfo.type;

        var qData = {
            newWin: false,
            appId: appInfo.appId,
            icon: appInfo.icon,
            type: appInfo.type,
            bindApp: false,
            data: appInfo,
            sourceEl: sourceEl,
            defaultTitle: appInfo.defaultTitle,
            config: {
                category: appInfo.category,
                icon: appInfo.icon,
                qInternationalKey: appInfo.qInternationalKey
            }
        };

        if (record.data.config) {
            Ext.apply(qData.config, record.data.config);
        }

        if (qData.config.fn) {
            var fnInfo = QNAP.QOS.lib.getAppInfo(qData.config.fn);
            qData.config.icon = fnInfo.icon;
            qData.config.qInternationalKey = fnInfo.qInternationalKey;
        }

        if (!_S[qData.config.qInternationalKey]) {
            qData.config.qInternationalKey = qData.defaultTitle;
        }
        return qData;
    }
});

QNAP.QOS.ToolBtn.BasicBtn = Ext.extend(Ext.Button, {
    cls: 'none-bg-btn tipBtn',
    tipUpdate: Ext.emptyFn,
    enableToggle: true,
    showTip: function(cmp) {
        var tip = cmp.tip;
        if (!cmp.pressed) {
            tip.hide();
        } else {
            tip.target = cmp.el;
            tip.initTarget(cmp.el);
            tip.showBy(cmp.el, 'tr-br');
        }
    },
    afterRender: function(ct) {
        QNAP.QOS.ToolBtn.BasicBtn.superclass.afterRender.call(this, ct);
        os.desktop.on('initialized', this.initQTip, this, {
            single: true
        });
    },
    initQTip: function() {
        var btn = this,
            taskName = btn.taskName,
            tip;
        var tipCfg = {
            cls: 'x-tip none-bg system-tray-tip opacity-0',
            anchor: 'top',
            anchorAlign: 'tl-bl?',
            renderTo: Ext.getBody(),
            autoHide: true,
            autoShow: false,
            onDocMouseDown: function(e) {
                if (e.within(btn.el)) {
                    return true;
                }
                if (this.autoHide !== true && !this.closable && !e.within(this.el.dom)) {
                    this.disable();
                    this.doEnable.defer(100, this);
                }
            },
            listeners: {
                hide: function() {
                    this.el.replaceClass('opacity-1', 'opacity-0');
                },
                show: function(cmp) {
                    cmp.el.disableShadow();
                    this.el.replaceClass('opacity-0', 'opacity-1');
                    return true;
                }
            }
        };
        Ext.apply(tipCfg, btn.tipCfg);
        tipCfg.cls += ' none-bg system-tray-tip ';
        tip = new QNAP.CMP.ToolTip(tipCfg);
        btn.tip = tip;
        btn.on('toggle', btn.showTip);
        tip.on('hide', function(_tip) {
            if (_tip.target) {
                var tg = Ext.get(_tip.target);
                _tip.mun(tg, 'mouseover', _tip.onTargetOver, _tip);
                _tip.mun(tg, 'mouseout', _tip.onTargetOut, _tip);
                _tip.mun(tg, 'mousemove', _tip.onMouseMove, _tip);
            }
            btn.toggle(false, false);
        });
    }
});

(function() {
    var _dev_list;

    function get_dev_list() {
        if (!_dev_list) {
            _dev_list = new Ext.data.XmlStore({
                autoDestroy: true,
                record: 'dev_info',
                idProperty: 'dev_mac',
                fields: [{
                    name: 'dev_status',
                    type: 'int'
                }, {
                    name: 'dev_eth_id',
                    type: 'int'
                }, {
                    name: 'dev_from_eth_id',
                    type: 'int'
                }, {
                    name: 'dev_to_eth_id',
                    type: 'int'
                }, 'dev_mac']
            });
        }
        return _dev_list;
    }


    function get_dataview_tpl() {
        return new Ext.XTemplate(
            '<ul style="list-style: disc outside;padding-left:10px;pointer-events: none;" >',
            '<tpl for=".">',
            '<li>{[this.get_status_msg(values)]}</li>',
            '</tpl>',
            '</ul>',
            '<div class="x-clear"></div>', {
                get_status_msg: function(values) {
                    var msg;
                    msg = '';
                    switch (values.dev_status) {
                        case 0: // device added
                            msg = _S.QTS_NET_DEV_MSG_4
                                .replace('{dev_eth_id}', values.dev_eth_id + 1)
                                .replace('{dev_mac}', values.dev_mac);
                            break;
                        case 1: // device deleted
                            msg = _S.QTS_NET_DEV_MSG_3
                                .replace('{dev_eth_id}', values.dev_eth_id + 1)
                                .replace('{dev_mac}', values.dev_mac);
                            break;
                        case 2: // device modified
                            msg = _S.QTS_NET_DEV_MSG_5
                                .replace('{dev_to_eth_id}', values.dev_to_eth_id + 1)
                                .replace('{dev_from_eth_id}', values.dev_from_eth_id + 1)
                                .replace('{dev_mac}', values.dev_mac);
                            break;
                    }
                    return msg;
                }
            }
        );
    }

    function show_message_win() {
        var dev_list;
        var message_win, items, fbar, tpl;

        tpl = get_dataview_tpl();
        dev_list = get_dev_list();

        items = [];
        if (dev_list.flag_net_dev_change) {
            items.push({
                xtype: 'label',
                text: _S.QTS_NET_DEV_MSG_6,
                qInternationalKey: 'QTS_NET_DEV_MSG_6'
            });
        } else {
            items.push({
                xtype: 'label',
                text: _S.QTS_NET_DEV_MSG_1,
                qInternationalKey: 'QTS_NET_DEV_MSG_1'
            });
        }

        items.push({
            xtype: 'dataview',
            store: dev_list,
            tpl: tpl,
            style: 'margin: 10px;',
            overClass: 'x-view-over',
            itemSelector: 'div.thumb-wrap',
        });

        items.push({
            xtype: 'box',
            ref: '../system_log_link',
            autoEl: {
                tag: 'a',
                cls: 'link_line',
                html: _S.IEI_NAS_LOGS20,
            },
            qInternationalFn: function(cmp) {
                cmp.update(_S.IEI_NAS_LOGS20);
            },
            bind_event: function() {
                this.el.on('click', function() {
                    os.openApp('systemLogs', {
                        autoSearch: {
                            logType: 'sysLog',
                            keyword: 'Network device monitor'
                        }
                    });
                }, this);
            },
            listeners: {
                single: true,
                afterrender: function(cmp) {
                    cmp.bind_event();
                }
            }
        });


        fbar = [{
            xtype: 'qtsbutton',
            text: _S.IEI_NAS_BUTTON_YES,
            qInternational: true,
            qInternationalKey: 'IEI_NAS_BUTTON_YES',
            itemId: 'yes_btn',
            ref: '../yes_btn',
            handler: function() {
                update_flag();
                this.refOwner.close();
            }
        }, {
            xtype: 'qtsbutton',
            text: _S.QTS_NET_DEV_MSG_2,
            qInternational: true,
            qInternationalKey: 'QTS_NET_DEV_MSG_2',
            itemId: 'no_btn',
            ref: '../no_btn',
            handler: function() {
                this.refOwner.close();
            }
        }];

        message_win = os.getMsgWindow(false, items, fbar)
        message_win.boxMaxWidth = 700;
        message_win.setWidth(700).show().center();
        message_win.mask.hide();
    }

    function update_flag() {
        Ext.Ajax.request({
            url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + '/management/manaRequest.cgi', {
                'subfunc': 'netinfo',
                'netdev_monitor': 1,
                'understand': 1,
                'apply': 1
            })
        });
    }

    /**
     * show popup window and message notice users,
     * some QPKG is to old, that can't run on current QTS Firmware
     * @return {[type]} [description]
     */
    function show_network_change_message() {
        Ext.Ajax.request({
            url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + '/management/manaRequest.cgi', {
                'subfunc': 'netinfo',
                'netdev_monitor': 1
            }),
            success: function(res) {
                var selectNumber = Ext.DomQuery.selectNumber;
                var xml;
                var dev_list;

                xml = res.responseXML;
                dev_list = get_dev_list();
                dev_list.loadData(xml);
                dev_list.flag_net_dev_change = selectNumber('flag_net_dev_change', xml, 0) === 1;
                dev_list.flag_current_net_change = selectNumber('flag_current_net_change', xml, 0) === 1;

                if (_dev_list.getCount() > 0) {
                    show_message_win();
                }
            }
        });
    }
    QNAP.QOS.Desktop.prototype.show_network_change_message = show_network_change_message;
})();
/* check qpkg minimum version */
(function() {
    var _qnap_qpkg_list, _3rd_party_qpkg_list;
    var _msg_win;
    var _notice_message;
    var first_call_flag = true;

    function get_qnap_qpkg_list() {
        if (!_qnap_qpkg_list) {
            _qnap_qpkg_list = new Ext.data.XmlStore({
                autoDestroy: true,
                record: 'must_install/item',
                idProperty: 'name',
                fields: ['displayName', 'icon', {
                    name: 'appId',
                    mapping: 'name'
                }, {
                    name: 'version',
                    mapping: 'min_version'
                }],
                defaults_data: {
                    QVPN: {
                        displayName: 'QVPN'
                    },
                    HybridBackup: {
                        displayName: 'Hybrid Backup Sync'
                    }
                },
                fix_record_data: function() {
                    var qpkg_info_store, qpkg_store, defaults_data;
                    var remove_list;
                    var collection, exist_record, app_id;

                    qpkg_info_store = os.qpkgInfoStore;
                    qpkg_store = os.qpkgStore;
                    defaults_data = this.defaults_data;
                    remove_list = [];

                    this.each(function(record) {
                        app_id = record.data.appId;

                        record.beginEdit();

                        collection = qpkg_info_store.query('internalName', new RegExp('^' + RegExp.escape(app_id) + '$'));

                        if (collection.getCount()) {
                            exist_record = collection.get(0);
                            record.set('icon', exist_record.get('icon80'));
                            record.set('displayName', exist_record.get('name'));
                            if (os.compareVersions(exist_record.get('version'), record.get('version'))) {
                                record.set('version', exist_record.get('version'));
                            } else {
                                remove_list.push(record);
                                return true;
                            }
                        } else {
                            remove_list.push(record);
                            return true;
                        }
                        record.commit();
                    });
                    this.remove(remove_list);
                    this.commitChanges();
                },
                listeners: {
                    datachanged: function(store) {
                        store.fix_record_data();
                    }
                }
            });
        }
        return _qnap_qpkg_list;
    }

    function get_3rd_party_qpkg_list() {
        if (!_3rd_party_qpkg_list) {
            _3rd_party_qpkg_list = new Ext.data.JsonStore({
                autoDestroy: true,
                root: 'items',
                idProperty: 'appId',
                fields: ['appId', 'displayName', 'icon', 'version'],
                syncDisplayName: function() {
                    this.each(this.syncDisplayNameByRecode);
                },
                syncDisplayNameByRecode: function(record) {
                    var exist_record;
                    var app_id;

                    app_id = record.get('appId');
                    collection = os.qpkgInfoStore.query('internalName', new RegExp('^' + RegExp.escape(app_id) + '$'));
                    if (collection.getCount()) {
                        exist_record = collection.get(0);
                        record.set('icon', exist_record.get('icon80'));
                        record.set('displayName', exist_record.get('name'));
                        if (os.compareVersions(exist_record.get('version'), record.get('version'))) {
                            record.set('version', exist_record.get('version'));
                        }
                    }
                }
            });
        }
        return _3rd_party_qpkg_list;
    }

    function get_dataview_tpl() {
        return new Ext.XTemplate(
            '<tpl for=".">',
            '<div class="qpkg-wrap" style="width:126px;height:130px;margin:15px 15px 15px 0;display:inline-block;vertical-align:top;">',
            '<img class="qpkg-icon" src="{[Ext.BLANK_IMAGE_URL]}" title="{name}" style="width:68px;height:68px;padding-bottom:12px;background:url(\'{icon}\') no-repeat;background-size:contain;"/>',
            '<div class="qpkg-name-with-version" style="height:50px;"><span style="font-size:14px;color:#2f2f2f;font-weight:bold;line-height:17px;max-height:34px;overflow:hidden;text-overflow:ellipsis;">{displayName} {version}</span></div></div>',
            '</tpl>',
            '<div class="x-clear"></div>'
        );
    }

    function init_message_win() {
        var new_qpkg_list, need_updata_list;
        var tpl;
        var items;

        if (_msg_win) {
            if (_msg_win.isDestroyed) {
                _msg_win = null;
            } else {
                return _msg_win;
            }
        }

        new_qpkg_list = get_qnap_qpkg_list();

        need_updata_list = get_3rd_party_qpkg_list();

        tpl = get_dataview_tpl();

        items = [];
        if (new_qpkg_list.getCount() > 0) {
            items.push({
                xtype: 'label',
                text: _S.QTS_QPKG_MSG_5,
                qInternational: true,
                qInternationalKey: 'QTS_QPKG_MSG_5'
            });
            items.push({
                xtype: 'dataview',
                store: new_qpkg_list,
                tpl: tpl,
                ref: 'qnap_qpkg_list',
                overClass: 'x-view-over',
                itemSelector: 'div.thumb-wrap'
            });
        }
        if (need_updata_list.getCount() > 0) {
            items.push({
                xtype: 'label',
                text: _S.QTS_QPKG_MSG_1,
                qInternational: true,
                qInternationalKey: 'QTS_QPKG_MSG_1'
            });
            items.push({
                xtype: 'dataview',
                store: need_updata_list,
                tpl: tpl,
                ref: 'third_party_list',
                overClass: 'x-view-over',
                itemSelector: 'div.thumb-wrap'
            });
        }

        _msg_win = new QNAP.QOS.baseWindow({
            title: _S.QTS_QPKG_MSG_TITLE,
            qInternational: true,
            qInternationalKey: 'QTS_QPKG_MSG_TITLE',
            resizable: false,
            closable: true,
            minimizable: false,
            height: 500,
            width: 840,
            layout: 'vbox',
            layoutConfig: {
                align: 'stretch',
                defaultMargins: '0 0 5 0'
            },
            cls: 'desktop-window utility-window no-body-padding',
            padding: '20px 0 20px 35px',
            defaults: {
                qInternational: true
            },
            items: [{
                xtype: 'container',
                layout: 'auto',
                flex: 1,
                style: 'padding-right: 35px;',
                plugins: [{
                    init: function(cmp) {
                        cmp.on('afterrender', this.afterRender);
                    },
                    afterRender: function(cmp) {
                        var scrollBar = new QNAP.CMP.Plugin.QTSScrollBar({
                            target: cmp.el
                        });
                    }
                }],
                defaults: {
                    qInternational: true
                },
                items: items,
                listeners: {
                    afterrender: function(cmp) {
                        cmp.mon(os.qpkgStore, 'update', function() {
                            cmp.qnap_qpkg_list.store.fix_record_data();
                            cmp.third_party_list.store.syncDisplayName();
                            cmp.qnap_qpkg_list.refresh();
                            cmp.third_party_list.refresh();
                        }, cmp, {
                            buffer: 500
                        });
                    }
                }
            }, {
                xtype: 'label',
                qInternationalFn: function() {
                    var note_msg;
                    note_msg = _S.QTS_QPKG_MSG_2.replace('<qtag>', '<a class="link_line" href="http://www.qnap.com/go/qpkg.html" target="QNAP_official_website">').replace('</qtag>', '</a>');
                    this.setText(note_msg, false);
                },
                listeners: {
                    beforerender: function() {
                        this.qInternationalFn();
                    }
                }
            }],
            fbar: [{
                xtype: 'qtsbutton',
                text: _S.QTS_QPKG_MSG_3,
                qInternational: true,
                qInternationalKey: 'QTS_QPKG_MSG_3',
                ref: '../qpkg_link_btn',
                handler: function() {
                    os.openApp('qpkg');
                    this.refOwner.close();
                }
            }, {
                xtype: 'qtsbutton',
                ref: '../auto_install_btn',
                text: _S.QTS_QPKG_MSG_4,
                qInternational: true,
                qInternationalKey: 'QTS_QPKG_MSG_4',
                handler: function() {
                    install_all_qpkg();
                    this.refOwner.close();
                }
            }]
        });
        return _msg_win;
    }

    function show_message_win(force) {
        if (force || QNAP.QOS.lib.getStorageValue('qpkg_min_ver_win') !== '1') {
            var message_win;

            message_win = init_message_win();
            message_win.show();
            QNAP.QOS.lib.setStorageValue('qpkg_min_ver_win', '1');
        }
    }

    function show_notice_message() {
        if (Ext.isEmpty(_notice_message)) {
            var msg = os.showMsg('', _S.QTS_QPKG_MSG_6, false);
            msg.addClass('link');
            msg.child('div.content').on('click', function(evt, target) {
                show_message_win(true);
                var msg = Ext.fly(target).parent('div.msg-box');
                var msgCt = os.desktop.msgCt;
                msg.replaceClass('msg-box', 'removing-msg-box');
                msg.child('div.content').removeAllListeners();
                msg.remove();
                msgCt.alignTo(document, 'br-br', [-10, 7]);
                msgCt.setStyle({
                    top: 'auto'
                });
            });
            _notice_message = msg.id;
        }
    }

    function update_need_update_qpkg_list(qpkg_map) {
        var internal_name, need_update_qpkg_record, need_update_qpkg_records;
        var need_updata_list, qnap_list;

        function fn_add_to_need_update_qpkg(internal_name, qpkg_record) {
            var target_version, offical_online_qpkg;

            target_version = qpkg_map[internal_name];

            need_update_qpkg_record = qpkg_record.copy();
            Ext.data.Record.id(need_update_qpkg_record);

            if (need_update_qpkg_record.get('enable') === 'FALSE') {
                need_update_qpkg_record.set('icon', need_update_qpkg_record.get('icon').replace('_gray.gif', '.gif'));
            }
            need_update_qpkg_record.set('version', target_version);

            need_update_qpkg_records.push(need_update_qpkg_record);
        }

        need_updata_list = get_3rd_party_qpkg_list();
        qnap_list = get_qnap_qpkg_list();
        need_update_qpkg_records = [];
        qnap_list.loadData(os.qpkgStore.reader.xmlData);

        Ext.iterate(qpkg_map, function(target_internal_name, target_version) {
            var offical_online_qpkg, installed_qpkg;

            if (qnap_list.getById(target_internal_name)) {
                return true;
            }

            offical_online_qpkg = os.qpkgInfoStore.query('internalName', new RegExp('^' + RegExp.escape(target_internal_name) + '$')).get(0);
            if (offical_online_qpkg && os.compareVersions(offical_online_qpkg.get('version'), target_version)) {

                qpkg_map[target_internal_name] = offical_online_qpkg.get('version');
                installed_qpkg = os.qpkgStore.getById(target_internal_name);
                if (installed_qpkg && os.compareVersions(target_version, installed_qpkg.get('version')) && target_version !== installed_qpkg.get('version')) {
                    fn_add_to_need_update_qpkg(target_internal_name, installed_qpkg);
                }
            }
        });

        /* Add item form installed qpkg (have_to_update) */
        os.qpkgStore.each(function(qpkg) {
            var target_internal_name;
            var target_version;
            var online_version;

            if (qpkg.get('have_to_update') !== '1') {
                return true;
            }

            target_internal_name = qpkg.get('appId');
            target_version = qpkg.get('version');

            if (qnap_list.getById(target_internal_name)) {
                return true;
            }

            offical_online_qpkg = os.qpkgInfoStore.query('internalName', new RegExp('^' + RegExp.escape(target_internal_name) + '$')).get(0);
            online_version = offical_online_qpkg ? offical_online_qpkg.get('version') : '0';
            if (os.compareVersions(online_version, target_version) && target_version !== online_version) {
                fn_add_to_need_update_qpkg(target_internal_name, qpkg);
            }
        });

        need_updata_list.removeAll();
        need_updata_list.add(need_update_qpkg_records);
    }

    function install_all_qpkg() {
        var need_updata_list, qnap_list;
        var qname;

        need_updata_list = get_3rd_party_qpkg_list();
        qnap_list = get_qnap_qpkg_list();
        qname = [];

        need_updata_list.each(function(record) {
            qname.push(record.get('appId'));
        });

        qnap_list.each(function(record) {
            qname.push(record.get('appId'));
        });

        Ext.Ajax.request({
            url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'application/appRequest.cgi', {
                'subfunc': 'qpkg',
                'apply': 26,
                'isZip': 1,
                'lang': QNAP.QOS.lib.getLanguageCode()
            }),
            params: {
                qname: qname
            },
            method: 'GET'
        });
    }

    /**
     * show popup window and message notice users,
     * some QPKG is to old, that can't run on current QTS Firmware
     * @return {[type]} [description]
     */
    function show_qpkg_req_update_message(callback) {
        callback = callback || Ext.emptyFn;

        if (os.qpkgStore.loaded) {
            Ext.Ajax.request({
                url: QNAP.QOS.config.sitePath + 'js/data/qpkg_mini_req_ver.json',
                method: 'GET',
                success: function(res) {
                    var qpkg_map = Ext.util.JSON.decode(res.responseText);

                    update_need_update_qpkg_list(qpkg_map);
                },
                callback: function() {
                    var need_updata_list, qnap_list;
                    var notice_message;

                    need_updata_list = get_3rd_party_qpkg_list();
                    qnap_list = get_qnap_qpkg_list();

                    if (need_updata_list.getCount() > 0 || qnap_list.getCount() > 0) {
                        if (first_call_flag) {
                            first_call_flag = false;
                            show_message_win();
                            show_notice_message();
                        }
                    } else {
                        notice_message = Ext.get(_notice_message);
                        if (notice_message) {
                            notice_message.child('div.content').removeAllListeners();
                            notice_message.remove();
                        }
                        if (need_updata_list.getCount() === 0 && qnap_list.getCount() === 0 && _msg_win) {
                            _msg_win.close();
                        }
                    }

                    callback();
                }
            });
        } else {
            os.qpkgStore.on('load', show_qpkg_req_update_message, this, {
                single: true
            });
        }
    }

    QNAP.QOS.Desktop.prototype.show_qpkg_req_update_message = show_qpkg_req_update_message;
})();
/* lincense promote window */
(function() {
    var support_exFAT = false;
    var support_McAfee = false;
    var support_SurveillanceStation = false;
    var support_QcloudSSLCertificate = false;
    var first_call = true;

    function get_support_licenses(callback, scope) {
        QNAP.QOS.ajax({
            url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'application/appRequest.cgi', {
                subfunc: 'survielance',
                supoort_license_page: 1
            }),
            scope: scope || this,
            success: function(res) {
                support_SurveillanceStation = Ext.DomQuery.selectNumber('SurveillanceStation', res.responseXML, 0) === 1;
                support_QcloudSSLCertificate = Ext.DomQuery.selectNumber('QcloudSSLCertificate', res.responseXML, 0) === 1;
                support_exFAT = Ext.DomQuery.selectNumber('exFAT', res.responseXML, 0) === 1;
                support_McAfee = Ext.DomQuery.selectNumber('McAfee', res.responseXML, 0) === 1;
                callback();
            },
            failure: Ext.emptyFn,
            callback: Ext.emptyFn
        });
    }

    function create_licenses_promote_win() {

        var dataview = {
            ref: 'dataview',
            xtype: 'dataview',
            store: new Ext.data.JsonStore({
                root: 'items',
                fields: ['label', 'icon', {
                    name: 'appId',
                    defaultValue: 'qpkg'
                }, {
                    name: 'config',
                    defaultValue: {
                        config: {
                            path: 'license'
                        }
                    }
                }, 'hidden'],
                data: {
                    items: [{
                        icon: '/cgi-bin/images/desktop/licenses_promote/surveillance_50.png?1509480336',
                        label: 'Camera Channel',
                        hidden: !support_SurveillanceStation,
                        appId: 'qpkg'
                    }, {
                        icon: '/cgi-bin/images/desktop/licenses_promote/exfat_driver_50.png?1509480336',
                        hidden: !support_exFAT,
                        label: 'exFAT Driver'
                    }, {
                        icon: '/cgi-bin/images/desktop/licenses_promote/ssl_certificate_50.png?1509480336',
                        label: 'QTS SSL Certificate',
                        hidden: !support_QcloudSSLCertificate,
                        appId: 'QcloudSSLCertificate'
                    }, {
                        icon: '/cgi-bin/images/desktop/licenses_promote/mcafee_50.png?1509480336',
                        hidden: !support_McAfee,
                        label: 'McAfee Antivirus'
                    }]
                }
            }),
            tpl: new Ext.XTemplate(
                '<tpl for=".">',
                '<div class="item-wrap" style="width:126px;height:130px;margin:15px;display:inline-block;vertical-align:top;text-align: center;cursor: pointer;<tpl if="hidden">display: none;</tpl>">',
                '<img class="item-icon" src="{[Ext.BLANK_IMAGE_URL]}" title="{label}" style="width:68px;height:68px;padding-bottom:12px;background:url(\'{icon}\') no-repeat;background-size:contain;"/>',
                '<div class="item-name-with-version" style="height:50px;"><span style="font-size:14px;color:#2f2f2f;font-weight:bold;line-height:17px;max-height:34px;overflow:hidden;text-overflow:ellipsis;">{label}</span></div></div>',
                '</tpl>',
                '<div class="x-clear"></div>'
            ),
            overClass: 'x-view-over',
            itemSelector: 'div.item-wrap'
        };

        _win = new QNAP.QOS.baseWindow({
            title: _S.QTS_DESKTOP_LICENSES_01,
            qInternational: true,
            qInternationalKey: 'QTS_DESKTOP_LICENSES_01',
            resizable: false,
            closable: true,
            minimizable: false,
            height: 365,
            width: 700,
            closeAction: 'hide',
            layout: 'vbox',
            manager: os.qWinMgr,
            layoutConfig: {
                align: 'stretch',
                defaultMargins: '0 0 5 0'
            },
            cls: 'desktop-window utility-window no-body-padding',
            padding: '20px 0 20px 35px',
            defaults: {
                qInternational: true
            },
            items: [{
                xtype: 'box',
                html: _S.QTS_DESKTOP_LICENSES_02,
                qInternational: true,
                qInternationalFn: function() {
                    this.update(_S.QTS_DESKTOP_LICENSES_02);
                }
            }, dataview, {
                xtype: 'checkbox',
                ref: 'autoShowChk',
                boxLabel: _S.ACL_ALERT_MSG02,
                qInternational: true,
                qInternationalKey: {
                    boxLabel: 'ACL_ALERT_MSG02'
                }
            }],
            fbar: [{
                xtype: 'qtsbutton',
                text: _S.IEI_NAS_BUTTON_CLOSE,
                qInternational: true,
                qInternationalKey: 'IEI_NAS_BUTTON_CLOSE',
                ref: '../close_btn',
                handler: function() {
                    this.refOwner.close();
                }
            }],
            listeners: {
                click: function(cmp, index, node, e) {
                    var record = cmp.getRecord(node);

                    if (record) {
                        os.openApp(record.get('appId'), record.get('config'));
                    }
                },
                beforeclose: function() {
                    if (this.autoShowChk.getValue()) {
                        os.saveConfig('autoShowLicensePromote', 'false');
                    }
                }
            }
        });

        _win.show();
        _win.relayEvents(_win.dataview, ['click']);
    }

    function show_licenses_promote_win() {
        if (QNAP.QOS.user.autoShowLicensePromote === 'false') {
            return;
        }
        if (QNAP.QOS.config.isGenericModel) {
            return;
        }
        if (first_call) {
            first_call = false;
            get_support_licenses(create_licenses_promote_win);
        }
    }

    QNAP.QOS.Desktop.prototype.show_licenses_promote_win = show_licenses_promote_win;
})();
(function() {
    function show_mcu_notice() {
        os.showMsg('', _S.QTS_DESKTOP_MSG_87, false);
    }

    QNAP.QOS.Desktop.prototype.show_mcu_notice = show_mcu_notice;
})();
(function() {
    var wait_reload = true;

    function show_raid_scrubbing_notice(callbackFn) {
        var message_win, items, fbar;
        var sys_setting_store = Ext.StoreMgr.item(QNAP.QOS.config.T_SYS_SETTING);
        var auto_enable_scrubbing_flag = false;


        /* user skip this notice */
        if (QNAP.QOS.user.common.I_know_raid_scrubbing === 'true') {
            callbackFn();
            return;
        }

        /* data not ready */
        if (!sys_setting_store.loaded) {
            if (wait_reload) {
                sys_setting_store.on({
                    single: true,
                    scope: os.desktop,
                    load: os.desktop.show_raid_scrubbing_notice
                });
            }
            wait_reload = false;
            sys_setting_store.load();
            return;
        }

        /* user skip this notice */
        if (sys_setting_store.getCount() > 0) {
            auto_enable_scrubbing_flag = sys_setting_store.getAt(0).get('raid_scrubbing_enabled') === '1';
        }

        /* no auto enable flag */
        if (!auto_enable_scrubbing_flag) {
            callbackFn();
            return;
        }

        items = [{
            xtype: 'label',
            /* RAID scrubbing checks the data integrity of all RAID 5 and RAID 6 groups on the NAS. Errors are automatically repaired, which ensures the RAID groups can be rebuilt in the future without data loss. */
            text: _S.QTS_DESKTOP_MSG_95,
            qInternationalKey: 'QTS_DESKTOP_MSG_95'
        }, {
            xtype: 'label',
            /* RAID scrubbing is scheduled to run on the first day of every month. */
            text: _S.QTS_DESKTOP_MSG_96,
            qInternationalKey: 'QTS_DESKTOP_MSG_96',
            style: {
                color: '#195a87',
                display: 'block',
                margin: '15px 0'
            }
        }, {
            xtype: 'label',
            /* Note: RAID scrubbing will take a long time. Storage performance might be degraded while RAID scrubbing is running. This check may reveal disk problems that exist due to long-term use. You should have a data backup plan in place before continuing. */
            text: _S.QTS_DESKTOP_MSG_97,
            qInternationalKey: 'QTS_DESKTOP_MSG_97'
        }, {
            xtype: 'qtscheckbox',
            ref: '../i_know_chkbox',
            /* I understand */
            boxLabel: _S.SSD_CACHE_CREATION_STR20,
            qInternational: true,
            qInternationalKey: {
                boxLabel: 'SSD_CACHE_CREATION_STR20'
            },
            listeners: {
                single: true,
                afterrender: function() {
                    this.wrap.setStyle({
                        margin: '10px 0 0'
                    });
                }
            }
        }];

        fbar = [{
            xtype: 'qtsbutton',
            cls: 'q-default',
            text: _S.SNAPSHOT_BTN_EDIT_SCH,
            qInternational: true,
            qInternationalKey: 'SNAPSHOT_BTN_EDIT_SCH',
            itemId: 'edit_btn',
            ref: '../edit_btn',
            handler: function() {
                var win = this.refOwner;
                win.save_i_know_flag = true;
                win.close();
                os.openStorageMgr('globalSetting');
            }
        }, {
            xtype: 'qtsbutton',
            text: _S.IEI_NAS_BUTTON_OK,
            qInternational: true,
            qInternationalKey: 'IEI_NAS_BUTTON_OK',
            itemId: 'ok_btn',
            ref: '../ok_btn',
            handler: function() {
                var win = this.refOwner;
                win.save_i_know_flag = true;
                win.close();
            }
        }];

        message_win = os.getMsgWindow('QTS_DESKTOP_MSG_94', items, fbar);
        message_win.boxMaxWidth = 700;
        message_win.setWidth(700)
            .show().center()
            .on('beforeclose', function(win) {
                if (win.save_i_know_flag && win.i_know_chkbox.getValue()) {
                    os.saveConfig('I_know_raid_scrubbing', 'true');
                }
            });

    }

    QNAP.QOS.Desktop.prototype.show_raid_scrubbing_notice = show_raid_scrubbing_notice;
})();
(function() {
    var spotlight;
    var spotlight_box;
    var tip;
    var tip_list;
    var callback;
    var current_tip_fn;

    function get_shadow_style() {
        var box = Ext.getBody().getBox();
        var shadow_size = Math.max(box.width, box.height) * 1.5;
        return 'box-shadow:rgba(0, 0, 0, 0.4) 0px 0px 0px ' + shadow_size + 'px, #369eff 0px 0px 5px 2px; border-radius: 2px;z-index: 40000;';
    }

    function update_tip() {
        if (current_tip_fn) {
            current_tip_fn();
            spotlight.el.setStyle(get_shadow_style());
        }
    }

    function show_spotlight_tour(callback) {

        callbackFn = callback;

        var shadow_style = get_shadow_style();

        spotlight = new Ext.BoxComponent({
            cls: 'q-spotlight',
            autoEl: {
                tag: 'div',
                cn: [{
                    tag: 'div',
                    style: shadow_style,
                }],
                style: 'height:100%;width:100%;z-index: 40000;position: absolute;'
            },
            renderTo: Ext.getBody(),
            show_tip: show_tip
        });

        if (QNAP.QOS.user.isAdminGroup) {
            tip_list = [step_1, setp_2, setp_3, setp_4];
        } else {
            tip_list = [step_1, setp_4];
        }

        spotlight_box = spotlight.el.first();
        spotlight.el.on('click', spotlight.show_tip, this);

        tip = new Ext.ToolTip({
            target: spotlight_box,
            msg: [],
            anchor: 'top',
            autoHide: false,
            style: 'z-index: 40000;',
            getAnchorAlign: function() {
                return this.anchorAlign;
            },
            anchorAlign: 'tl-b',
            anchorOffset: 0,
            getOffsets: function() {
                return this.offsets;
            },
            offsets: [-19, 9]
        });
        show_tip();
        Ext.EventManager.on(window, "resize", update_tip, this, {
            buffer: 300
        });
    }

    function show_tip() {
        current_tip_fn = tip_list.shift();
        if (current_tip_fn) {
            current_tip_fn();
        } else {
            current_tip_fn = undefined;
            tip.destroy();
            spotlight.destroy();
            auto_open_help();
            callbackFn();
            Ext.EventManager.un(window, "resize", update_tip, this);
        }
    }

    function auto_open_help() {
        if (QNAP.QOS.user.common.auto_open_help !== 'false') {
            os.openApp('helper', {
                show_welcome_msg: true
            });
        }
    }

    function step_1() {
        var box = os.desktop.desktop.headBar.menuBtn.getBox();
        box.width -= 4;
        box.height -= 4;
        box.x += 2;
        box.y += 2;
        box.right -= 2;
        box.bottom -= 2;
        spotlight_box.setBox(box);
        tip.html = _S.QTS_DESKTOP_SPOTLIGHT_MSG_1;
        tip.show();
    }

    function setp_2() {
        var control_panel_box;

        os.desktop.shortcutsView.store.each(function(record, index) {
            if (record.get('appId') !== 'systemPreferences') {
                return true;
            }
            if (Ext.isEmpty(record.get('config').fn)) {
                control_panel_box = Ext.fly(os.desktop.shortcutsView.getNode(index)).getBox();
                return false;
            }
        });

        control_panel_box.width -= 4;
        control_panel_box.height -= 4;
        control_panel_box.x += 2;
        control_panel_box.y += 2;
        control_panel_box.right -= 2;
        control_panel_box.bottom -= 2;
        spotlight_box.setBox(control_panel_box);
        tip.update(_S.QTS_DESKTOP_SPOTLIGHT_MSG_2);
        tip.show();
    }

    function setp_3() {
        var app_center_box;

        os.desktop.shortcutsView.store.each(function(record, index) {
            if (record.get('appId') === 'qpkg') {
                app_center_box = Ext.fly(os.desktop.shortcutsView.getNode(index)).getBox();
                return false;
            }
        });

        app_center_box.width -= 4;
        app_center_box.height -= 4;
        app_center_box.x += 2;
        app_center_box.y += 2;
        app_center_box.right -= 2;
        app_center_box.bottom -= 2;
        spotlight_box.setBox(app_center_box);
        tip.update(_S.QTS_DESKTOP_SPOTLIGHT_MSG_3);
        tip.show();
    }

    function setp_4() {
        var box = {
            width: 0,
            height: 0,
            x: Number.MAX_VALUE,
            y: Number.MAX_VALUE,
            right: 0,
            bottom: 0
        };
        var accountBtn = os.desktop.desktop.headBar.accountBtn;
        var avaita = accountBtn.previousSibling();
        var avaita
        var desktopBtn = accountBtn.nextSibling();
        var item_box;
        Ext.each([accountBtn, avaita, desktopBtn], function(item) {
            item_box = item.el.getBox();
            box.x = Math.min(item_box.x, box.x);
            box.y = Math.min(item_box.y, box.y);
            box.right = Math.max(item_box.right, box.right);
            box.bottom = Math.max(item_box.bottom, box.bottom);
        });

        box.x -= 10;
        box.y += 2;
        box.right -= 2;
        box.bottom -= 2;
        box.width = box.right - box.x;
        box.height = box.bottom - box.y;

        spotlight_box.setBox(box);
        tip.anchorAlign = 'tr-br';
        tip.offsets = [0, 9]
        tip.update(_S.QTS_DESKTOP_SPOTLIGHT_MSG_4);
        tip.show();
        tip.anchorOffset = tip.el.dom.offsetWidth - 30;
        tip.syncAnchor();
    }
    QNAP.QOS.Desktop.prototype.auto_open_help = auto_open_help;
    QNAP.QOS.Desktop.prototype.show_spotlight_tour = show_spotlight_tour;
})();
