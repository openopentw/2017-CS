Ext.ns('QNAP.QOS', 'QNAP.QOS.QTask', 'QNAP.QOS.Plugins', 'QNAP.QOS.QPKG', 'QNAP.QOS.QPKG.Map');
QNAP.QOS.HeaderBar = Ext.extend(Ext.Container, {
    cls: 'topBar',
    layout: 'hbox',
    layoutConfig: {
        padding: '9px 0px',
        align: 'stretch'
    },
    height: 42,
    hideAppSwitchBtn: false,
    hideLangBtn: false,
    hideHelpBtn: false,
    hideUserBtn: false,
    servierNameBox: {
        xtype: 'box',
        html: 'Server Name',
        width: 200,
        cls: 'homeBtn'
    },
    userBtn: {
        xtype: 'splitbutton',
        cls: 'account none-bg-btn',
        text: 'User'
    },
    helpBtn: {
        xtype: 'button',
        iconCls: 'helpBtn',
        cls: 'logout none-bg-btn tipBtn',
        margins: {
            top: 0,
            right: 5,
            bottom: 9,
            left: 0
        }
    },
    langBtn: {
        xtype: 'button',
        iconCls: 'langBtn',
        tooltip: 'SYS_LANGUAGE',
        cls: 'none-bg-btn tipBtn',
        margins: {
            top: 0,
            right: 5,
            bottom: 8,
            left: 0
        }
    },
    constructor: function(config) {
        QNAP.QOS.HeaderBar.superclass.constructor.call(this, config);
    },
    initComponent: function() {
        var me = this;
        me.CMP_ID = {
            SERVER_NAME: 'servier-name-' + Ext.id(),
            APPLICATION_NAME: 'application-name-' + Ext.id(),
            USER_BTN: 'user-btn-' + Ext.id(),
            HELP_BTN: 'help-btn-' + Ext.id(),
            LANG_BTN: 'lang-btn-' + Ext.id()
        };
        me.items = [];
        me.initLeftItems();
        me.initCenterItems();
        me.initRightItems();
        QNAP.QOS.HeaderBar.superclass.initComponent.call(this);
    },
    initLeftItems: function() {
        var me = this;
        if (!me.hideServierNameBox) {
            me.servierNameBox.id = me.CMP_ID.SERVER_NAME;
            me.items.push(me.servierNameBox);
        }
        if (me.leftItems) {
            me.items.push(me.leftItems);
        }
    },
    initCenterItems: function() {
        var me = this;
        if (me.centerItem) {
            me.items.push(me.centerItem);
        } else {
            me.items.push({
                xtype: 'box',
                cls: 'app-name',
                html: 'app name',
                flex: 1,
                id: me.CMP_ID.APPLICATION_NAME
            });
        }
    },
    initRightItems: function() {
        var me = this;

        var headbarMenuTpl = new Ext.Template('<div class="system-tray-bg">' +
            '<div class="bg-tl login-background-r"></div>' +
            '<div class="bg-tm"></div>' +
            '<div class="bg-tr login-background-r"></div>' +
            '<div class="bg-cl"></div>' +
            '<div class="bg-cm"></div>' +
            '<div class="bg-cr"></div>' +
            '<div class="bg-bl login-background-r"></div>' +
            '<div class="bg-bm"></div>' +
            '<div class="bg-br login-background-r"></div>' +
            '<div class="bg-arrow">' +
            '</div>');

        if (me.rightItems) {
            me.items = me.items.concat(me.rightItems);
        }
        if (!me.hideUserBtn) {
            var avaita = new Ext.BoxComponent({
                tooltip: 'SYSTEM_TRAY_18',
                cls: 'avaita-box',
                style: {
                    border: 'none',
                    'box-shadow': 'none',
                    cursor: 'default'
                },
                margins: {
                    top: 0,
                    right: 5,
                    bottom: 7,
                    left: 0
                },
                html: '<img src="' + QNAP.QOS.config.defaultPortraitUrl + '" onerror>',
                listeners: {
                    render: function(cmp) {
                        var img = new window.Image();
                        img.onload = function() {
                            cmp.el.child('img').set({
                                src: QNAP.QOS.config.myPortraitUrl
                            });
                        };
                        img.src = QNAP.QOS.config.myPortraitUrl;
                    }
                }
            });
            me.userBtn = new Ext.SplitButton({
                cls: 'account none-bg-btn',
                id: me.CMP_ID.USER_BTN,
                split: true,
                text: QNAP.QOS.user.account,
                tooltip: 'SYSTEM_TRAY_02',
                menuAlign: 't-b?',
                boxMaxWidth: 160,
                template: new Ext.Template('<table id="{4}" cellspacing="0" class="x-btn {3}"><tbody class="{1}">', '<tr><td class="x-btn-tl"><i>&#160;</i></td><td class="x-btn-tc"></td><td class="x-btn-tr"><i>&#160;</i></td></tr>', '<tr><td class="x-btn-ml"><i>&#160;</i></td><td class="x-btn-mc"><em class="{2} x-unselectable" unselectable="on"><button type="{0}"><span class="account-btn-text"></span></button></em></td><td class="x-btn-mr"><i>&#160;</i></td></tr>', '<tr><td class="x-btn-bl"><i>&#160;</i></td><td class="x-btn-bc"></td><td class="x-btn-br"><i>&#160;</i></td></tr>', '</tbody></table>'),
                height: 26,
                setText: function(text) {
                    this.text = text;
                    if (this.el) {
                        this.btnEl.first().update(text || '&#160;');
                        this.setButtonClass();
                    }
                    this.doAutoWidth();
                    return this;
                },
                onClick: function(e) {
                    if (e) {
                        e.preventDefault();
                    }
                    if (e.button !== 0) {
                        return;
                    }
                    if (!this.disabled) {
                        this.doToggle();
                        if (this.menu && !this.hasVisibleMenu() && !this.ignoreNextClick) {
                            this.showMenu();
                        }
                        this.fireEvent('click', this, e);
                        if (this.handler) {
                            this.handler.call(this.scope || this, this, e);
                        }
                    }
                },
                margins: '0 12 0 0',
                menu: {
                    defaultOffsets: [-5, 14],
                    showSeparator: false,
                    shadow: false,
                    cls: 'headerbar-menu none-bg none-border account-menu',
                    data: 'dotpl',
                    tpl: headbarMenuTpl,
                    tplWriteMode: 'insertFirst',
                    items: [{
                        text: _S.IEI_NAS_FIRSTPAGE_STR10,
                        qInternational: true,
                        qInternationalKey: 'IEI_NAS_FIRSTPAGE_STR10',
                        iconCls: 'pwd-setting',
                        itemCls: 'x-menu-item account-option',
                        activeClass: 'account-option-over',
                        itemId: 'options',
                        handler: function() {
                            var config = {
                                app: "PersonalSettings",
                                fn: "",
                                icon: "apps/personalSettings/images/icon-personalSettings-{0}.png",
                                tag: "cloudBackup",
                                config: {
                                    newWin: true
                                },
                                showPwdPanel: true
                            };
                            os.openApp('PersonalSettings', config);
                        }
                    }, {
                        xtype: 'menuseparator',
                        cls: 'none-bg',
                        hidden: !QNAP.QOS.user.isAdminGroup,
                        itemId: 'separator-1'
                    }, {
                        text: _S.IEI_NAS_BUTTON_RESTART,
                        qInternational: true,
                        qInternationalKey: 'IEI_NAS_BUTTON_RESTART',
                        iconCls: 'restart',
                        itemCls: 'x-menu-item account-option',
                        itemId: 'restart',
                        activeClass: 'account-option-over',
                        hidden: !QNAP.QOS.user.isAdminGroup,
                        handler: function() {
                            os.desktop.rebootNas();
                        }
                    }, {
                        text: _S.IEI_NAS_BUTTON_SHUTDOWN,
                        qInternational: true,
                        qInternationalKey: 'IEI_NAS_BUTTON_SHUTDOWN',
                        iconCls: 'shutdown',
                        itemCls: 'x-menu-item account-option',
                        itemId: 'shutdown',
                        activeClass: 'account-option-over',
                        hidden: !QNAP.QOS.user.isAdminGroup,
                        handler: function() {
                            os.desktop.shutdownNas();
                        }
                    }, {
                        xtype: 'menuseparator',
                        cls: 'none-bg',
                        itemId: 'separator-2'
                    }, {
                        text: _S.IEI_NAS_BUTTON_LOGOUT,
                        qInternational: true,
                        qInternationalKey: 'IEI_NAS_BUTTON_LOGOUT',
                        iconCls: 'logout',
                        itemCls: 'x-menu-item account-option',
                        itemId: 'logout',
                        activeClass: 'account-option-over',
                        handler: function() {
                            os.logout();
                        }
                    }, {
                        text: _S.V3_MENU_STR38,
                        qInternational: true,
                        qInternationalKey: 'V3_MENU_STR38',
                        iconCls: 'about',
                        itemId: 'about',
                        itemCls: 'x-menu-item account-option',
                        activeClass: 'account-option-over',
                        handler: function() {
                            os.showAboutWin();
                        }
                    }]
                }
            });

            me.items.push(avaita);
            me.items.push(me.userBtn);
        }
        if (!me.hideHelpBtn) {
            me.helpBtn.id = me.CMP_ID.HELP_BTN;
            me.items.push(me.helpBtn);
        }
        if (!me.hideLangBtn) {
            var langList = {
                xtype: 'container',
                items: [{
                    xtype: 'listview',
                    cls: 'lnag-list',
                    hideHeaders: true,
                    qInternational: true,
                    width: 150,
                    columns: [{
                        dataIndex: 'selected',
                        tpl: '<tpl if="selected == 1"><div style="width:16px;height:16px;background-image:url(/cgi-bin/images/desktop/headbar/check.png)" ></div></tpl>',
                        width: 0.2
                    }, {
                        dataIndex: 'language',
                        tpl: '{[_S[values.language]||values.language]}',
                        width: 0.8
                    }],
                    store: QNAP.QOS.lib.languageStore,
                    listeners: {
                        click: function(list, index, node) {
                            var newLang = list.getRecord(node).get('cookie_name');
                            QNAP.QOS.lib.resetLang(newLang);
                            os.saveConfig('lang', newLang);
                            Ext.getCmp(me.CMP_ID.LANG_BTN).menu.hide();
                        }
                    }
                }],
                plugins: new QNAP.CMP.Plugin.BoxScrollBarV2({
                    cls: 'tip-list',
                    autoHide: false,
                    styleCfg: {
                        top: '10px',
                        right: '7px'
                    },
                    bottomGap: 10
                })
            };
            me.langBtn = new Ext.Button({
                iconCls: 'langBtn',
                tooltip: 'SYS_LANGUAGE',
                cls: 'none-bg-btn tipBtn',
                menuAlign: 'tr-br',
                id: me.CMP_ID.LANG_BTN,
                margins: '0 5 0 0',
                menu: {
                    defaultOffsets: [5, 14],
                    showSeparator: false,
                    shadow: false,
                    enableScrolling: false,
                    cls: 'none-bg none-border headerbar-menu lang-menu check-menu',
                    data: 'dotpl',
                    tpl: headbarMenuTpl,
                    tplWriteMode: 'insertFirst',
                    defaults: {
                        activeClass: 'account-option-over',
                        cls: 'no-icon menu-option'
                    },
                    items: [langList],
                    listeners: {
                        beforeshow: function(menu) {
                            var listCt = menu.getComponent(0);
                            var list = listCt.getComponent(0);
                            var h = os.getViewport().getHeight() - 80;
                            var listHeight = list.el.child('div.x-list-body').getHeight();
                            if (listHeight < h) {
                                h = listHeight;
                            }
                            menu.setHeight(h);
                            listCt.setHeight(h);
                            list.setHeight(listHeight);
                        },
                        show: function(menu) {
                            var listCt = menu.getComponent(0);
                            listCt.plugins.updateBar.defer(100, listCt);
                        }
                    }
                },
                onClick: function(e) {
                    if (e) {
                        e.preventDefault();
                    }
                    if (e.button !== 0) {
                        return;
                    }
                    if (!this.disabled) {
                        this.doToggle();
                        if (this.menu && !this.hasVisibleMenu() && !this.ignoreNextClick) {
                            this.showMenu();
                        }
                        this.fireEvent('click', this, e);
                        if (this.handler) {
                            this.handler.call(this.scope || this, this, e);
                        }
                    }
                }
            });
            me.items.push(me.langBtn);
        }
    }
});

QNAP.QOS.Plugins.FullWindowDesktop = Ext.extend(Ext.util.Observable, (function() {
    var headerBar;
    var openingMap = {};
    /**
     * functions
     */
    var initDesktop, setTitle, updateHeaderInfo, openApp, createApp, createWindow;
    initDesktop = function() {
        var view = os.getViewport();
        var vboxLayout = new Ext.Container.LAYOUTS.vbox({
            type: 'vbox',
            align: 'stretch'
        });
        if (os.defaultHeader !== false) {
            headerBar = new QNAP.QOS.HeaderBar({
                hideHelpBtn: true,
                hideServierNameBox: true
            });
        }

        var win = os.getWindow();
        var winBox = {
            xtype: 'container',
            layout: 'fit',
            flex: 1,
            items: win
        };
        view.setLayout(vboxLayout);

        if (os.defaultHeader !== false) {
            view.add(headerBar);
        }

        view.add(winBox);

        view.addClass('full-window');
        view.doLayout();
        win.setTitle = setTitle;
        if (os.defaultHeader !== false) {
            Ext.getCmp(headerBar.CMP_ID.APPLICATION_NAME).update(_S[win.qInternationalKey]);
        }
        os.fireEvent('viewportrendered', os);
    };
    setTitle = function(str) {
        Ext.getCmp(headerBar.CMP_ID.APPLICATION_NAME).update(str);
    };
    updateHeaderInfo = function() {
        if (os.defaultHeader !== false) {
            Ext.getCmp(headerBar.CMP_ID.USER_BTN).setText(QNAP.QOS.user.account);
        }
    };
    openApp = function(appId, cfg) {
        var appInfo = QNAP.QOS.lib.getAppInfo(appId),
            config = {};

        appId = appInfo.appId || appInfo.data.appId;

        Ext.apply(config, appInfo);
        Ext.apply(config, cfg);
        var app;
        switch (appInfo.type) {
            case 'app':
                config.id = 'q-app-' + appId + '-' + (++Ext.Component.AUTO_ID);
                var existApps = os.getAppInstancesByAppId(config.appId);
                var maxWin = config.maxWin || 1;
                if (openingMap[appId]) {
                    return;
                }
                if (existApps.length >= maxWin) {
                    _D('[Info] ' + existApps.length + ' ' + appId + ' exist already');
                    app = existApps.pop();
                    app._getMainWindow().show();
                    _D('[Info] activeApp...', app._getMainWindow().id);
                    app.activeApp(config);
                } else {
                    openingMap[appId] = true;
                    this.fireEvent('beforeCreateAppWin', config);
                    os.loadAppJs.defer(100, os, [appId, function() {
                        createApp(config);
                    }]);
                }
                break;
            default:
                _D('[Info] what is [' + appId + '] ?');
                break;
        }
    };

    /**
     * 建立App
     * @param  {[type]} config [description]
     * @return {[type]}        [description]
     */
    createApp = function(config) {
        var appId = config.appId,
            appInfo = QNAP.QOS.lib.getAppInfo(config.appId),
            isQPKGApp = appInfo.type === 'QPKGApp',
            maxWin = config.maxWin || 1,
            existApps = os.getAppInstancesByAppId(appId),
            desktop = os.getViewport();
        if (existApps.length >= maxWin) {
            _D('[Info] ' + existApps.length + ' ' + appId + ' exist already');
            var app = existApps.pop();
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
            if (appInfo.fullScreen !== false) {

                params.width = appInstance.winConfig.width || 1030;
                var h = appInstance.winConfig.height || 600;
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

                    cmp.on('afterrender', function(cmp) {
                        cmp.appInstance.activeApp(config);
                    });
                    appInstance.on('destroy', function(appInstance) {
                        appInstance._getMainWindow = undefined;
                        delete appInstance._getMainWindow;
                    });
                },
                beforerender: function(win) {
                    appInstance._getMainWindow = function() {
                        return win;
                    };
                },
                updateCloseFunction: function(cmp) {
                    var plugin = this;
                    if (cmp.closeAction == 'hide') {
                        return;
                    }
                    Ext.each(cmp.tools, function(tool) {
                        if (tool.id == 'close') {
                            tool.handler = plugin.close.createDelegate(cmp, []);
                            return false;
                        }
                    });
                },
                close: function() {
                    if (this.fireEvent('beforeclose', this) !== false) {
                        this._getSubWin().each(function(win) {
                            if (Ext.isBoolean(win.destroying)) {
                                this._removeSubWin(win);
                            } else {
                                win.hide();
                            }
                        });
                        if (this.hidden) {
                            this.doClose();
                        } else {
                            this.removeClass('qEffect6').addClass('qEffect4');
                            this.el.shadow.hide();
                            this.proxy.hide();
                            this.hide.defer(500, this, [null, this.doClose, this]);
                        }
                    }
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

        createWindow(appInstance, params, config.autoShow);
    };

    /**
     * 建立 QTS Window
     * @param  {[type]} appInstance [description]
     * @param  {[type]} params      [description]
     * @return {[type]}             [description]
     */
    createWindow = function(appInstance, params, autoShow) {
        var appId = appInstance.appId;
        var desktop = os.getViewport();
        params.manager = os.qWinMgr;
        var win;
        params.id = appInstance.id;
        if (Ext.isEmpty(appInstance)) {
            win = new QNAP.QOS.baseWindow(params);
        } else {
            win = new QNAP.QOS.appWindow(params, appInstance);
        }
        desktop.add(win);

        appInstance._getMainWindow = function() {
            return win;
        };


        if (appId == 'quickWizard') {
            win.show(Ext.getBody());
        } else {
            win.on('show', function(win) {
                if (win.maximized) {
                    return;
                }
                var XYs = [];
                win.center();
                var myXY = win.getPosition();
                var harfH = parseInt(os.getViewport().getHeight() / 2, 10);
                os.qWinMgr.each(function(w) {
                    if (w == win) {
                        return true;
                    }
                    XYs.push(w.getPosition());
                });


                Ext.each(XYs, function(XY) {
                    if (Math.abs(XY[0] - myXY[0]) <= 40 || Math.abs(XY[1] - myXY[1]) <= 40) {
                        myXY[0] += 60;
                        myXY[1] += 60;
                        if (harfH < myXY[1]) {
                            myXY[1] = 50;
                        }
                    }
                });

                win.setPagePosition(myXY[0], myXY[1]);
                if (win.ddTab) {
                    win.ddTab.updateDragTab();
                }
            }, win, {
                single: true
            });
            /*
            var fullApp = os.apps.find(function(app) {
            return app.fullBrowser == true;
            }); && (!fullApp || appInstance.caller)
            */
            if (autoShow !== false) {
                win.show();
            } else {
                _D('skip show');
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
        if (appId === 'ShareCenter') {
            win.viewportReady = true;
            win.show();
        }
        delete openingMap[appId];
        appInstance.initAppComplete();
    };

    return {
        init: function(os) {
            var me = this;
            os.on('initUI', initDesktop);
            os.on('initUI', updateHeaderInfo);
            os.openApp = Ext.createDelegate(openApp, this);
            os.addEvents({
                'viewportrendered': true
            });
            os.getHeaderBar = me.getHeaderBar;
            os.qWinMgr.zseed = 10000;
        },
        getHeaderBar: function() {
            return headerBar;
        }
    };
}()));
Ext.preg('pFullWindowDesktop', QNAP.QOS.Plugins.FullWindowDesktop);

function appletInitComplete() {
    if (window.history.pushState) {
        window.history.forward();
    }
    os.appletInitComplete.apply(this, arguments);
}

/**
 * QNAP task manager
 *
 * @type
 */
QNAP.QOS.QTask.QTaskMgr = Ext.extend(Ext.util.Observable, {
    constructor: function(config) {
        this.addEvents({
            "startTask": true,
            "stopTask": true
        });
        Ext.apply(this, config);
        this.taskMgr = Ext.TaskMgr;
        this.tasks = {};
        this.stores = {};
        this.runningTasks = {};
        QNAP.QOS.QTask.QTaskMgr.superclass.constructor.call(this, config);
    },
    T_SYSTEM_HEALTH: Ext.id(),
    runTask: function(taskId) {
        var task = this.tasks[taskId];
        task.run.apply(task.scope);
    },
    addStore: function(store, cfg) {
        store.interval = cfg.interval;
        store.delay = cfg.delay || 0;
        store.on('beforeload', this.beforeload, store);
        store.on('load', this.autoReload, store);
        store.on('exception', this.autoReload, store);
        store.on('loadexception', this.autoReload, store);
        store.delayLoad = new Ext.util.DelayedTask(function() {
            store.reload();
        }, store);
        store.keepReload = true;
        store.isAutoReload = false;
        this.stores[store.storeId] = store;
    },
    beforeload: function() {
        var store = this;
        store.queryStart = new Date().getTime();
    },
    autoReload: function() {
        var store = this;
        var currentTime = new Date().getTime();
        if (store.keepReload) {
            store.isAutoReload = true;
            store.delayLoad.delay(Math.max(0, store.interval - (currentTime - store.queryStart)));
        }
    },
    startAutoReload: function(storeId) {
        var store = this.stores[storeId];
        if (!store.isAutoReload) {
            store.delayLoad.delay(store.delay);
        }
    },
    stopAutoReload: function(storeId) {
        var store = this.stores[storeId];
        store.keepReload = false;
    },
    addTask: function(taskId, task) {
        task.id = taskId;
        this.tasks[taskId] = task;
    },
    startTask: function(taskId, option) {
        var task = this.tasks[taskId];
        if (this.runningTasks[task.id]) {
            this.stopTask(taskId);
        }
        task = Ext.applyIf(option || {}, task);
        this.tasks[taskId] = task;
        this.runningTasks[task.id] = task;
        this.taskMgr.start(task);
        this.fireEvent('startTask', task);
    },
    startAll: function() {
        var me = this;
        Ext.iterate(me.tasks, function(taskId) {
            me.startTask(taskId);
        });
        Ext.iterate(me.stores, function(storeId) {
            me.startAutoReload(storeId);
        });
    },
    stopTask: function(taskId) {
        var task = this.runningTasks[taskId];
        this.taskMgr.stop(task);
        this.fireEvent('stopTask', task);
        delete this.runningTasks[taskId];
    },
    stopAll: function() {
        var me = this;
        _D('--stopAll', me.runningTasks);
        Ext.iterate(me.runningTasks, function(taskId) {
            _D('--stop taskId', taskId);
            me.stopTask(taskId);
        });
        Ext.iterate(me.stores, function(storeId) {
            me.stopAutoReload(storeId);
        });
    }
});

QNAP.QOS.OS = Ext.extend(Ext.Component, {
    CMP_IDS: {
        CHANGE_PWD_FORM: 'change-pwd-form' + Ext.id(),
        CHANGE_PWD_OLD_PWD: 'old-pwd-' + Ext.id(),
        CHANGE_PWD_NEW_PWD: 'new-pwd-' + Ext.id(),
        CHANGE_PWD_VERIFY_PWD: 'verify-pwd-' + Ext.id(),
        LOGIN_PWD: 'pwd-form-' + Ext.id(),
        LOGIN_PWD_SKIN: 'pwd-form-' + Ext.id(),
        LOGIN_LOGO: 'login-logo-' + Ext.id()
    },
    facilityMap: {
        UNKNOWN: '0',
        SMART: '1',
        ANTIVIRUS: '2',
        BAK_EXTERNAL_DRIVCE: '3',
        BAK_RTRR: '4',
        BAK_RSYNC: '5',
        BAK_LUN: '6',
        BAK_AMAZON_S3: '7',
        EVENT_LOG: '8',
        CONN_LOG: '9',
        EXT_DRVICE_USB: '10',
        EXT_DRVICE_ESATA: '11',
        VALUME: '12', // VALUME or disk
        APP_NOTIFY: '13',
        MEDIA_LIB: '14',
        VIDEO_TRANSCODE: '15',
        VIDEO_TRANSCODE_RTT: '16',
        SYSTEM: '17',
        ONE_TOUCH_COPY: '18'
    },
    alreadyInitCount: 0,
    totalInitCount: Number.MAX_VALUE,
    initFinish: false,
    initTaskFlag: false,
    loadHostSettingFlag: false,
    loadUserSettingFlag: false,
    newCodexPackflag: false,
    showInitMask: true,
    extDeviceList: [],
    lastLogList: [],
    qWinMgr: new Ext.WindowGroup(),
    stationStore: new Ext.data.JsonStore({
        loaded: false,
        root: 'apps',
        url: '/cgi-bin/sysinfoReq.cgi?appsjson=1',
        idProperty: 'id',
        fields: ['url', 'icon', 'name', 'display', 'surl', {
            name: 'appId',
            mapping: 'id'
        }, {
            name: 'serviceIndex',
            mapping: 'serviceIndex',
            defaultValue: 99
        }, {
            name: 'proxyUrl',
            mapping: 'l',
            defaultValue: ''
        }, {
            name: 'defaultTitle',
            mapping: 'name'
        }, {
            /**
             * @type {String} checkMLScanMode
             * <p>before open station, need check Media lib scan mode</p>
             */
            name: 'checkMLScanMode',
            mapping: 'mlrts',
            defaultValue: -1,
            type: 'int'
        }, 'qInternationalKey'],
        listeners: {
            beforeload: function() {
                if (QNAP.QOS.user.lang == 'auto') {
                    var _lib = QNAP.QOS.lib,
                        lang = _lib.browserSelectLanguage();
                    Ext.util.Cookies.set('nas_lang', lang, new Date().add(Date.SECOND, 3));
                }
            },
            load: function(store) {
                var removeList = [];
                var locProtocol = Ext.getDoc().dom.location.protocol.toLowerCase();
                var lib = QNAP.QOS.lib;
                var isProxy = os.stationStore.reader.jsonData.proxy === 1;
                store.each(function(r) {
                    var recData = r.data;
                    if (recData.appId == 'webFileManager') {
                        recData.appId = 'fileExplorer';
                    }

                    var appId = recData.appId,
                        displayName = recData.name;

                    if (appId == 'home' || appId == 'administration') {
                        removeList.push(r);
                    } else if (recData.display === 0) {
                        removeList.push(r);
                    } else if (recData.url === '' && locProtocol == 'http:') {
                        removeList.push(r);
                    } else if (recData.surl === '' && locProtocol == 'https:') {
                        removeList.push(r);
                    } else {
                        var appInfo = lib.getAppInfo(appId);
                        Ext.apply(r.json, appInfo);
                        Ext.apply(r.json, {
                            appId: appId
                        });
                        r.json.qInternationalKey = r.json.defaultTitle = displayName;
                        if (isProxy && recData.proxyUrl.length > 0) {
                            recData.surl = (QNAP.QOS.config.serverPort ? ':' + QNAP.QOS.config.serverPort : '') + recData.proxyUrl;
                            recData.url = recData.surl;
                        }
                    }
                    if (appId == 'surveillanceStation' && recData.display == 1) {
                        QNAP.QOS.systemItems.surveillanceStation.defaultTitle = displayName;
                    } else if (QNAP.QOS.systemItems[appId]) {
                        QNAP.QOS.systemItems[appId].defaultTitle = displayName;
                    }
                });
                store.remove(removeList);
            }
        }
    }),
    wifiStore: new Ext.data.XmlStore({
        url: '/cgi-bin/sys/sysRequest.cgi',
        baseParams: {
            subfunc: 'net_setting',
            apply: 'wireless',
            type: 'rescan'
        },
        record: 'AP',
        fields: ['SSID', 'Status', 'MAC', 'Channel', 'Frequency', 'Quality', 'Auth', 'Cipher', 'Protocol', 'AutoConnect', 'connect',
            {
                name: 'Quality',
                mapping: 'Quality',
                type: 'int'
            }, {
                name: 'errorCode',
                mapping: 'error_code'
            }
        ],
        listeners: {
            load: function(store) {
                var support = Ext.DomQuery.selectNumber('WirelessSupport', store.reader.xmlData, 0);
                store.support = support == 1;
                store.each(function(record) {
                    var q = record.get('Quality');
                    record.set('Quality', Math.ceil(q / 20));
                    record.set('connect', record.get('Status') == '1' ? 1 : 0);
                });
                store.sort([{
                    field: 'connect',
                    direction: 'DESC'
                }, {
                    field: 'Quality',
                    direction: 'DESC'
                }]);
            }
        }
    }),
    treeLoader: {},
    dataStore: {
        notifyStore: new Ext.data.JsonStore({
            url: '/cgi-bin/sys/syslogRequest.cgi',
            root: 'list',
            lastSkipMap: {},
            baseParams: {
                noticelog: '1',
                lower: '0',
                sort: '13',
                subfunc: 'sys_logs',
                upper: '0',
                noticelogQueryByClientTime: '1',
                range: 30,
                startTime: '0',
                group: 1
            },
            messageProperty: 'Error',
            fields: ['id',
                'facility',
                {
                    name: 'facility',
                    type: 'string'
                },
                'facilityStr',
                'name',
                'severity',
                'status',
                'desc',
                'msgCode',
                {
                    name: 'varNum',
                    type: 'int'
                },
                'varContent',
                'timeSec',
                /**
                 * formated timeSec
                 */
                'timeSecStr',
                'endtimeSec',
                'endtimeSecStr',
                'server',
                'action',
                'serviceID',
                'user',
                'ip',
                'client',
                'count',
                /**
                 * @field uid
                 * @description 記錄此筆訊息是提供給那個 User的，預設值為 -1，代表不屬於任何 User
                 * @see gid
                 * @default -1
                 */
                'uid',
                /**
                 * @field gid
                 * @description 記錄此筆訊息是提供給那個 User Group 的，預設值為 -1，代表不屬於任何 User Group
                 * @see uid
                 * @default -1
                 */
                'gid',
                {
                    name: 'link_id',
                    defaultValue: '',
                    convert: function(v) {
                        return Ext.isString(v) ? v : '';
                    }
                },
                {
                    name: 'link_option',
                    defaultValue: '',
                    convert: function(v) {
                        return Ext.isString(v) ? v : '';
                    }
                }

            ]
        })
    },
    /**
     * tasks collection,
     * @see createTask
     * @type {Object}
     */
    tasks: {},
    /**
     * 新增，overwrite Ext.Msg style
     * @type
     */
    Msg: {
        INFO: 'qts-info',
        WARNING: 'qts-warning',
        QUESTION: 'qts-question',
        ERROR: 'qts-error',
        resetBtn: function() {
            var dlg = this.getDialog();
            var basicCls = ['x-btn', 'x-btn-noicon', 'qts-button'];
            var clsNames = [];
            var fbar = dlg.getFooterToolbar();
            fbar.buttonAlign = 'right';
            fbar.doLayout();
            fbar.items.each(function(cmp) {
                if (cmp.getXType() == 'button') {
                    clsNames = cmp.el.dom.className.split(' ');
                    cmp.addClass(basicCls);
                    Ext.each(clsNames, function(cls) {
                        if (basicCls.indexOf(cls) == -1) {
                            cmp.removeClass(cls);
                        }
                    });
                }
            });
            dlg.minWidth = 300;
            dlg.maxWidth = 450;
            dlg.setWidth('auto');
        },
        getBtn: function(btnId) {
            var index = ['ok', 'yes', 'no', 'cancel'].indexOf(btnId);
            return this.getDialog().getFooterToolbar().getComponent(index);
        },
        getInfoParams: function(title, msg, fn, scope) {
            return {
                title: title,
                msg: msg,
                buttons: Ext.Msg.OK,
                fn: fn,
                scope: scope,
                icon: Ext.Msg.INFO,
                minWidth: 250
            };
        },
        info: function(title, msg, fn, scope) {
            msg = Ext.Msg.show(Ext.Msg.getInfoParams(title, msg, fn, scope));
            return msg;
        },
        getAlertParams: function(title, msg, fn, scope) {
            return {
                title: title,
                msg: msg,
                buttons: Ext.Msg.OK,
                fn: fn,
                scope: scope,
                icon: Ext.Msg.INFO,
                minWidth: 250
            };
        },
        alert: function(title, msg, fn, scope) {
            msg = Ext.Msg.show(Ext.Msg.getAlertParams(title, msg, fn, scope));
            return msg;
        },
        getConfirmParams: function(title, msg, fn, scope) {
            return {
                title: title,
                msg: msg,
                buttons: Ext.Msg.YESNO,
                fn: fn,
                scope: scope,
                icon: Ext.Msg.QUESTION,
                minWidth: 250
            };
        },
        confirm: function(title, msg, fn, scope) {
            msg = Ext.Msg.show(Ext.Msg.getConfirmParams(title, msg, fn, scope));
            return msg;
        },
        getWarningParams: function(title, msg, fn, scope) {
            return {
                title: title,
                msg: msg,
                buttons: Ext.Msg.YESNO,
                fn: fn,
                scope: scope,
                icon: Ext.Msg.WARNING,
                minWidth: 250
            };
        },
        warning: function(title, msg, fn, scope) {
            msg = Ext.Msg.show(Ext.Msg.getWarningParams(title, msg, fn, scope));
            return msg;
        },
        getErrorParams: function(title, msg, fn, scope) {
            return {
                title: title,
                msg: msg,
                buttons: Ext.Msg.YESNO,
                fn: fn,
                scope: scope,
                icon: Ext.Msg.ERROR,
                minWidth: 250
            };
        },
        error: function(title, msg, fn, scope) {
            msg = Ext.Msg.show(Ext.Msg.getErrorParams(title, msg, fn, scope));
            return msg;
        },
        getProgressParams: function(title, msg, progressText) {
            return {
                title: title,
                msg: msg,
                buttons: false,
                progress: true,
                closable: false,
                minWidth: Ext.Msg.minProgressWidth,
                progressText: progressText
            };
        },
        progress: function(title, msg, progressText) {
            msg = Ext.Msg.show(Ext.Msg.getProgressParams(title, msg, progressText));
            return msg;
        },
        getWaitParams: function(msg, title, config) {
            return {
                title: title,
                msg: msg,
                buttons: false,
                closable: false,
                wait: true,
                modal: true,
                minWidth: Ext.Msg.minProgressWidth,
                waitConfig: config
            };
        },
        wait: function(msg, msgCls, maskCls) {
            maskCls = maskCls || '';
            this.mask = os.getViewport().getEl().mask(msg, msgCls, maskCls + ' top-mask');
            return this.mask;
        },
        doLayout: function(win) {
            win.setWidth('auto').syncSize();
        }
    },
    _ERROR_ICON: "/cgi-bin/images/tip_icon/error.svg?1509480336",
    _INFO_ICON: "/cgi-bin/images/tip_icon/info.svg?1509480336",
    _QUESTION_ICON: "/cgi-bin/images/tip_icon/help.svg?1509480336",
    _QUESTION_BLUE_ICON: "/cgi-bin/images/tip_icon/help.svg?1509480336",
    _WARNING_ICON: "/cgi-bin/images/tip_icon/warning.svg?1509480336",
    uploadByApplet: function(sourceFile, destPath, isOverwrite) {
        var callApplet = QNAP.QOS.lib.callApplet;
        var args = {
            SOURCE_FILE: sourceFile,
            DEST_PATH: destPath,
            IS_OVERWRITE: isOverwrite
        };
        callApplet(this.getId(), 'qUploadApplet', 'uploadFileNow', args);
    },
    downloadByApplet: function(sourcePath, destPath, files, dlFileName, isOverwrite) {
        var callApplet = QNAP.QOS.lib.callApplet;
        var size = 0;
        var tmpFiles = [];

        var i;
        for (i = 0; i < files.length; i++) {
            size += parseInt(files[i].size, 20);
            tmpFiles.push(files[i].displayName);
        }

        var args = {
            IS_FOLDER: files[0].type == 'folder' ? '1' : '0',
            DL_FILE_NAME: dlFileName,
            SOURCE_PATH: sourcePath,
            DEST_PATH: destPath,
            FILES: tmpFiles,
            TOTAL_SIZE: size,
            IS_OVERWRITE: isOverwrite
        };
        callApplet(this.getId(), 'qUploadApplet', 'downloadFile', args);
    },
    appletInitComplete: function(appletId) {
        QNAP.QOS.config.isAppletReady = true;
        os.fireEvent('appletInitComplete', appletId);
        os.initCheck('appletInitComplete...');
        Ext.get('qUploadApplet').setStyle({
            'visibility': 'hidden'
        });
        _D('[Info] appletInitComplete initCheck', appletId);
    },
    apps: new Ext.util.MixedCollection(), // already load js
    wins: new Ext.util.MixedCollection(), // open apps
    startConfig: null,
    addAppInstance: function(appInstance) {
        if (!appInstance.isExtandApp) {
            this.apps.add(appInstance.getId(), appInstance);
        }
        this.bindEvent(appInstance);
    },
    /**
     * 指定app 的instancesId取得對應的app instances
     *
     * @param {}
     *            name
     * @return {String}
     * @link getAppInstancesByAppId
     */
    getAppInstance: function(instancesId) {
        return this.apps.get(instancesId);
    },
    /**
     * 使用app的ID 直接搜尋是否有開啟中的app
     *
     * @param {}
     *            appId
     * @return {}
     * @link getAppInstancesByAppId
     * @see getAppInstancesByAppId
     */
    getAppInstancesByAppId: function(appId) {
        var appInstances = [];
        this.apps.find(function(instance) {
            if (instance.appId == appId) {
                appInstances.push(instance);
            }
        });
        return appInstances;
    },
    removeAppIinstance: function(instance) {
        this.apps.remove(instance);
    },
    constructor: function(config) {
        _D('=== os constructor ===');
        Ext.apply(this, config);
        var me = this;

        me.addEvents({
            'initUI': true,
            'broadcast': true,
            'beforeunload': true,
            'serviceupdate': true,
            'servicestart': true,
            'servicestop': true,
            'filechange': true,
            'loadUserSetting': true,
            'afterloadusersetting': true,
            'appletInitComplete': true,
            'logincomplete': true,
            'mousewheel': true,
            'checkQtoken': true,
            'orientationChanged': true,
            'login': true,
            'resetlang': true
        });

        QNAP.QOS.OS.superclass.constructor.call(this, config);
        Ext.state.Manager.setProvider(new QNAP.QOS.CMP.STATE.ConfigProvider());
    },
    qInternational: true,
    qInternationalFn: function() {
        os.fireEvent('resetlang');
    },
    /**
     * 在每個ifrmae上加上mask，讓滑鼠在mask上移動時可以對window focus
     * 同時避免拖拉item時進入iframe造成判斷錯誤的情況
     * @param  {[type]} win [description]
     * @return {[type]}     [description]
     */
    maskiFrame: function(win) {
        win.on('deactivate', function(_win) {
            if (_win.el.child('iframe')) {
                var mask = _win.body.mask(null, '', 'transparent-mask');
                mask.on('mouseover', function() {
                    _win.body.unmask();
                    if (os.desktop) {
                        os.desktop.clearAppFocusCookie();
                    }
                    window.focus();
                });
                mask.on('dragover', function(e) {
                    e.preventDefault();
                    _win.body.unmask();
                    if (os.desktop) {
                        os.desktop.clearAppFocusCookie();
                    }
                });
            }
        });
    },
    initComponent: function() {
        _D('=== os initComponent ===');
        var me, createSequence;
        me = this;
        createSequence = Ext.createSequence;
        me.qWinMgr.zseed = 8000;
        Ext.WindowMgr.zseed = 9000;
        me.qWinMgr.register = createSequence(me.qWinMgr.register, me.maskiFrame);
        Ext.WindowMgr.register = createSequence(Ext.WindowMgr.register, me.maskiFrame);
        QNAP.QOS.OS.superclass.initComponent.call(this);
        me.initMouseWhellEvent();
        me.initListeners();
    },
    initListeners: function() {
        var me = this;
        me.on('logincomplete', me.logincomplete, me, {
            single: true
        });
        me.on('afterloadusersetting', me.initUI, me, {
            single: true
        });
    },
    logincomplete: function() {
        var me = this,
            body = Ext.getBody();

        body.on('mousemove', QNAP.QOS.lib.delayCheckSession, null, {
            buffer: 5000
        });
        body.on('keypress', QNAP.QOS.lib.delayCheckSession, null, {
            buffer: 5000
        });
        QNAP.QOS.lib.delayCheckSession();

        QNAP.QOS.lib.initHelp();
        Ext.QuickTips.init();
        me.initMessageService();
        me.startSidChecker(0);
        var basicImgs = [
            '/cgi-bin/images/toolbar/large_topbar_left.png',
            '/cgi-bin/images/toolbar/large_topbar_right.png',
            '/cgi-bin/images/toolbar/large_topbar_middle.png',
            '/cgi-bin/images/toolbar/icon-question.png',
            '/cgi-bin/images/cmp/capsule_button.png',
            '/cgi-bin/images/bg/shadow-25px.png',
            '/cgi-bin/images/bg/shadow-3-25px.png',
            '/cgi-bin/images/bg/shadow-2-25px.png',
            '/cgi-bin/images/cmp/icon_notice.png',
            '/cgi-bin/images/toolbar/icon-warning.png',
            '/cgi-bin/images/toolbar/icon-error.png',
            '/cgi-bin/images/toolbar/icon-question.gif',
            '/cgi-bin/images/toolbar/icon-question.png',
            '/cgi-bin/images/toolbar/icon-question-b.png'

        ];
        Ext.each(basicImgs, function(imgPath) {
            var img = new Image();
            img.src = imgPath + '?' + URL_RANDOM_NUM;
        });
        try {
            window.addEventListener('orientationchange', function(e) {
                os.fireEvent("orientationChanged", e);
            });
        } catch (e) {
            _D(e);
        }

        Ext.apply(Ext.Msg, me.Msg);
        Ext.Msg.show = Ext.createInterceptor(Ext.Msg.show, function(config) {
            config.cls = ['q-dlg', 'q-window'];
            config.minWidth = 340;
            config.maxWidth = 450;
            config.minHeight = 140;
            if (Ext.isEmpty(config.title)) {
                config.cls.push('no-title');
            }
            return true;
        });

        Ext.Msg.show = Ext.createSequence(Ext.Msg.show, function(config) {
            this.updateProgress(0, config.progressText);
            this.updateText(config.msg);
            var win = this.getDialog();
            if (win
                .getEl()
                .child('.ext-mb-icon')
                .hasClass('x-hidden')) {
                win.addClass('no-mb-icon');
            } else {
                win.removeClass('no-mb-icon');
            }
        }, Ext.Msg);

        Ext.Msg.hide = Ext.createSequence(Ext.Msg.hide, function() {
            if (this.mask) {
                os.getViewport().getEl().unmask();
                this.mask = undefined;
            }
            return this;
        }, Ext.Msg);

        var dlg = Ext.Msg.getDialog();

        dlg.addClass(['q-dlg', 'q-window'])
            .on({
                scope: Ext.Msg,
                hide: Ext.Msg.resetBtn,
                beforeshow: Ext.Msg.doLayout
            });
        dlg.initialConfig.cls = 'q-dlg q-window';

        Ext.Msg.resetBtn();

        me.qWinMgr.hideAll = Ext.createDelegate(function() {
            this.each(function(cmp) {
                if (cmp.isVisible() && cmp instanceof Ext.Window) {
                    cmp.minimize();
                }
            });
        }, me.qWinMgr);

        /**
         * TODO --
         * for wifi model.
         */
    },
    initMessageService: function() {
        os.qMessage = new QMessage({
            fn: [{
                fnName: 'openApp',
                fn: os.qMsgProxy
            }, {
                fnName: 'focus',
                fn: os.qMsgProxy
            }, {
                fnName: 'close',
                fn: os.qMsgProxy
            }, {
                fnName: 'hideWin',
                fn: os.qMsgProxy
            }, {
                fnName: 'maxWin',
                fn: os.qMsgProxy
            }, {
                fnName: 'restoreWin',
                fn: os.qMsgProxy
            }, {
                fnName: 'openURL',
                fn: os.qMsgProxy
            }, {
                fnName: 'hideWindowFrame',
                fn: os.qMsgProxy
            }, {
                fnName: 'showWindowFrame',
                fn: os.qMsgProxy
            }, {
                fnName: 'setupWallpaper',
                fn: os.qMsgProxy
            }, {
                fnName: 'getWindowMode',
                fn: os.qMsgProxy
            }, {
                fnName: 'getStationPrivilege',
                fn: os.qMsgProxy
            }, {
                fnName: 'setMailToken',
                fn: os.qMsgProxy
            }, {
                fnName: 'hasNewCodexPack',
                fn: os.qMsgProxy
            }, {
                fnName: 'installCodexPack',
                fn: os.qMsgProxy
            }, {
                fnName: 'mask',
                fn: os.qMsgProxy
            }, {
                fnName: 'unmask',
                fn: os.qMsgProxy
            }, {
                fnName: 'refreshDesktop',
                fn: os.qMsgProxy
            }, {
                fnName: 'setSize',
                fn: os.qMsgProxy
            }, {
                fnName: 'setMaximizable',
                fn: os.qMsgProxy
            }, {
                fnName: 'setIframeSize',
                fn: os.qMsgProxy
            }, {
                fnName: 'disableResizHandler',
                fn: os.qMsgProxy
            }, {
                fnName: 'regPushNotify',
                fn: os.qMsgProxy
            }, {
                fnName: 'saveState',
                fn: os.qMsgProxy
            }, {
                fnName: 'restoreState',
                fn: os.qMsgProxy
            }]
        });
    },
    qMsgProxy: Ext.emptyFn,
    stopSidChecker: function() {
        QNAP.QOS.config.isRebooting = true;
    },
    startSidChecker: function(failureCount) {
        var checker;
        checker = setTimeout(function() {
            var info;
            if (Ext.state.Manager.get('keepCheckSID') === false) {
                os.startSidChecker(failureCount);
                return;
            }
            info = {
                url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'authLogin.cgi'),
                success: function(res) {
                    os.qHaStatusAndLock(res.responseXML);

                    if (Ext.DomQuery.selectValue('authPassed', res.responseXML) != '1') {
                        os.logout();
                    }
                    failureCount = 0;
                    QNAP.QOS.config.isBooting = Ext.DomQuery.selectNumber('is_booting', res.responseXML, 0) === 1;
                    if (Ext.Msg.getDialog().el.hasClass('SidChecker')) {
                        Ext.Msg.hide();
                    }
                },
                failure: function() {
                    failureCount++;
                },
                callback: function() {
                    if (QNAP.QOS.config.isRebooting) {
                        clearTimeout(checker);
                    } else if (failureCount >= 2) {
                        clearTimeout(checker);
                        Ext.MessageBox.buttonText = {
                            ok: _S.IEI_NAS_BUTTON_OK,
                            cancel: _S.IEI_NAS_BUTTON_CANCEL,
                            yes: _S.QTS_RELOAD_PAGE,
                            no: _S.IEI_NAS_BUTTON_CANCEL
                        };
                        Ext.Msg.confirm('', _S.QTS_CONN_ERR, function(btnId) {
                                if (btnId == 'yes') {
                                    window.location.reload(true);
                                } else {
                                    failureCount = 0;
                                }
                            }).setIcon(Ext.MessageBox.WARNING).getDialog()
                            .setWidth(450).el.replaceClass('', 'SidChecker');

                        Ext.MessageBox.buttonText = {
                            ok: _S.IEI_NAS_BUTTON_OK,
                            cancel: _S.IEI_NAS_BUTTON_CANCEL,
                            yes: _S.IEI_NAS_BUTTON_YES,
                            no: _S.IEI_NAS_BUTTON_NO
                        };
                    } else {
                        os.startSidChecker(failureCount);
                    }
                },
                /**
                 * AJAX timeout
                 * lan - 30 Sec.
                 * internet or Cloud Relay Mode- 60 Sec.
                 */
                timeout: 30000 * (QNAP.QOS.config.isInternet || QNAP.QOS.config.isCloudRelayMode ? 2 : 1) // 1000 * 30
            };
            Ext.Ajax.request(info);
        }, 30000);
    },
    checkQtoken: function() {
        var os = this,
            qtoken = QNAP.lib.cookie.get('qtoken');
        var encrypt = QNAP.lib.encryption;
        var cookieAccount = QNAP.lib.cookie.get('nas_1_u') || '';
        cookieAccount = decodeURIComponent(encrypt.ezDecode(cookieAccount));
        if (Ext.isEmpty(qtoken)) {
            _D('=== os checkQtoken initCheck ===');
            os.initCheck('', 'checkQtoken - empty qtoken');
        } else {
            var info = {
                url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'authLogin.cgi', {}),
                params: {
                    user: cookieAccount,
                    qtoken: qtoken,
                    qtokencheck: '1' // 有值就可以
                },
                success: function(res) {
                    var dQuery = Ext.DomQuery,
                        xmlData = res.responseXML;
                    if (dQuery.selectValue('authPassed', xmlData) != '1') {
                        QNAP.lib.cookie.del('qtoken', '/');
                    }
                },
                callback: function(options, success, res) {
                    os.fireEvent('checkQtoken', options, success, res);
                    _D('=== os checkQtoken ajax back initCheck ===');
                    os.initCheck('', 'checkQtoken - qtokenchecked');
                }
            };
            Ext.Ajax.request(info);
        }
    },
    checkSid: function(doAuthPass) {
        var os = this,
            sid = QNAP.lib.cookie.get('NAS_SID') || '';

        if (QNAP.QOS.lib.supportStorage) {
            sid = sid || window.sessionStorage.getItem('NAS_SID');
        }

        os.checkQtoken();
        QNAP.QOS.user.sid = sid;

        if (Ext.isEmpty(sid) || sid === '') {} else {
            var info = {
                url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'authLogin.cgi', {}),
                params: {
                    service: '1'
                },
                success: function(res) {
                    var dQuery = Ext.DomQuery,
                        xmlData = res.responseXML;
                    if (dQuery.selectValue('user', xmlData)) {
                        QNAP.QOS.user.sid = sid;
                        QNAP.QOS.lib.fixAjax();
                        QNAP.QOS.user.isAdminGroup = dQuery.selectNumber(
                            'isAdmin', xmlData) == 1;
                        QNAP.QOS.user.account = dQuery.selectValue('user',
                            xmlData);
                        os.loadHostSetting(xmlData);

                        QNAP.QOS.user.allowChangePwd = dQuery.selectNumber(
                            'ldapDisallowChangePwd', xmlData) === 0;

                        if (dQuery.selectNumber(
                                'ldapResetPwd', xmlData) == 1) {
                            os.showQuickChangePwdUI();
                            return;
                        }

                        if (doAuthPass === true) {
                            os.authPass();
                        }
                    } else {
                        QNAP.lib.cookie.del('NAS_SID');
                        os.checkQtoken();
                    }
                }
            };
            QNAP.QOS.ajax(info);
        }
    },
    loadBootStatus: function(callback) {
        var info = {
            url: '/cgi-bin/authLogin.cgi',
            success: function(res) {
                var xmlData = res.responseXML;
                os.loadHostSetting(xmlData);
            },
            callback: callback
        };
        QNAP.QOS.ajax(info);
    },
    initQuickChangePwdUI: function() {
        var os = this;
        var CMP_IDS = os.CMP_IDS;
        var PASSWORD_EL = {
            tag: 'input',
            type: 'checkbox',
            autocomplete: 'off',
            'data-flag': 'true'
        };
        if (!os.changePwdUI) {
            var isValidResetPwd = window.isValidResetPwd;
            os.changePwdUI = new QNAP.QOS.modalWindow({
                width: 460,
                height: 250,
                title: _S.QUICK11_STR32,
                qInternational: true,
                qInternationalKey: 'QUICK11_STR32',
                cls: 'q-app-systemPreferences',
                layout: "border",
                bbarStyle: {
                    visibility: 'hidden'
                },
                footerStyle: {
                    border: 'none'
                },
                items: [{
                    xtype: 'form',
                    id: CMP_IDS.CHANGE_PWD_FORM,
                    labelWidth: 200,
                    padding: '30px 60px',
                    region: "center",
                    border: false,
                    footerStyle: {
                        border: 'none'
                    },
                    items: [{
                        xtype: 'displayfield',
                        value: _S.IEI_PASSWORD_NOTE01,
                        qInternational: true,
                        qInternationalKey: {
                            value: 'IEI_PASSWORD_NOTE01'
                        },
                        hideLabel: true
                    }, {
                        xtype: 'textfield',
                        itemId: 'newPwdTxt',
                        maxLength: 64,
                        fieldLabel: _S.IEI_PASSWORD_OLD,
                        id: CMP_IDS.CHANGE_PWD_OLD_PWD,
                        defaultAutoCreate: PASSWORD_EL,
                        qInternational: true,
                        qInternationalKey: {
                            fieldLabel: 'IEI_PASSWORD_OLD'
                        },
                        inputType: 'password',
                        hidden: isValidResetPwd == '1',
                        enableKeyEvents: true,
                        listeners: {
                            buffer: 500,
                            keyup: function(cmp) {
                                if (QNAP.QOS.quickWizard.countStrLen(cmp.getValue()) > cmp.maxLength) {
                                    cmp.setValue(QNAP.QOS.quickWizard.getCusLenStr(cmp.getValue(), cmp.maxLength));
                                }
                            }
                        }
                    }, {
                        xtype: 'textfield',
                        itemId: 'oldPwdTxt',
                        maxLength: 64,
                        fieldLabel: _S.IEI_PASSWORD_NEW,
                        qInternational: true,
                        qInternationalKey: {
                            fieldLabel: 'IEI_PASSWORD_NEW'
                        },
                        id: CMP_IDS.CHANGE_PWD_NEW_PWD,
                        defaultAutoCreate: PASSWORD_EL,
                        inputType: 'password',
                        enableKeyEvents: true,
                        listeners: {
                            buffer: 500,
                            keyup: function(cmp) {
                                if (QNAP.QOS.quickWizard.countStrLen(cmp.getValue()) > cmp.maxLength) {
                                    cmp.setValue(QNAP.QOS.quickWizard.getCusLenStr(cmp.getValue(), cmp.maxLength));
                                }
                            }
                        }
                    }, {
                        xtype: 'textfield',
                        itemId: 'verifyPwdTxt',
                        defaultAutoCreate: PASSWORD_EL,
                        maxLength: 64,
                        fieldLabel: _S.IEI_PASSWORD_VERIFY,
                        qInternational: true,
                        qInternationalKey: {
                            fieldLabel: 'IEI_PASSWORD_VERIFY'
                        },
                        id: CMP_IDS.CHANGE_PWD_VERIFY_PWD,
                        inputType: 'password',
                        validator: function(v) {
                            if (v != Ext.getCmp(CMP_IDS.CHANGE_PWD_NEW_PWD).getValue()) {
                                return _S.USER_GROUP_GREATE_WIZ_STR26;
                            }
                            return true;
                        },
                        enableKeyEvents: true,
                        listeners: {
                            buffer: 500,
                            keyup: function(cmp) {
                                if (QNAP.QOS.quickWizard.countStrLen(cmp.getValue()) > cmp.maxLength) {
                                    cmp.setValue(QNAP.QOS.quickWizard.getCusLenStr(cmp.getValue(), cmp.maxLength));
                                }
                            }
                        }
                    }, {
                        xtype: 'checkbox',
                        boxLabel: _S.QTS_SHOW_PASSWORD,
                        qInternational: true,
                        qInternationalKey: {
                            boxLabel: 'QTS_SHOW_PASSWORD'
                        },
                        isDirty: function() {
                            return false;
                        },
                        handler: function(checkbox, checked) {
                            var inputs = checkbox.ownerCt.getEl().select('input[data-flag="true"]');
                            inputs.set({
                                type: checked ? 'text' : 'password'
                            });
                        }
                    }],
                    fbar: [{
                        text: _S.QNAP_PS_BUTTON_SUBMIT,
                        qInternational: true,
                        qInternationalKey: 'QNAP_PS_BUTTON_SUBMIT',
                        cls: 'capsule-btn',
                        handler: function() {
                            if (Ext.getCmp(CMP_IDS.CHANGE_PWD_FORM).getForm().isValid()) {
                                var encrypt = QNAP.lib.encryption;
                                var newP = Ext.getCmp(CMP_IDS.CHANGE_PWD_NEW_PWD).getValue();
                                var veriP = Ext.getCmp(CMP_IDS.CHANGE_PWD_VERIFY_PWD).getValue();
                                newP = encrypt.ezEncode(encrypt.utf16to8(newP));
                                veriP = encrypt.ezEncode(encrypt.utf16to8(veriP));
                                var params = {
                                    NEW_PASSWORD: newP,
                                    VERIFY_PASSWORD: veriP
                                };

                                if (isValidResetPwd == '1') {
                                    params.reset_key = resetKey;
                                    params.endtime = endtime;
                                } else {
                                    var oldP = Ext.getCmp(CMP_IDS.CHANGE_PWD_OLD_PWD).getValue();
                                    oldP = encrypt.ezEncode(encrypt.utf16to8(oldP));
                                    params.USER_NAME = QNAP.QOS.user.account;
                                    params.OLD_PASSWORD = oldP;
                                }
                                QNAP.QOS.ajax({
                                    url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'change_password.cgi'),
                                    method: 'POST',
                                    params: params,
                                    success: function(res, opts) {
                                        var result = Ext.DomQuery.selectValue(
                                            'Change_Password result', res.responseXML);
                                        if (result == '0') {
                                            Ext.Msg.alert(_S.QUICK11_STR32, _S.IEI_PASSWORD_NOTE02, function() {
                                                os.logout();
                                                window.location.href = '/';
                                            });
                                        } else {
                                            Ext.Msg.alert(_S.QUICK11_STR32, _S.IEI_PASSWORD_ALERT_TITLE, function() {
                                                os.logout();
                                                window.location.href = '/';
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    }, {
                        text: _S.IEI_NAS_BUTTON_CANCEL,
                        qInternational: true,
                        qInternationalKey: 'IEI_NAS_BUTTON_CANCEL',
                        cls: 'capsule-btn',
                        handler: function() {
                            os.logout();
                        }
                    }]
                }]
            });
        }
        return os.changePwdUI;
    },
    showQuickChangePwdUI: function() {
        var os = this;
        var CMP_IDS = os.CMP_IDS;
        QNAP.QOS.lib.resetLang(QNAP.QOS.user.lang);
        os.initQuickChangePwdUI();
        var pwdRules = [];

        QNAP.QOS.ajax({
            url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'authLogin.cgi'),
            method: 'POST',
            success: function(response, opts) {
                var xmlData = response.responseXML;
                var dq = Ext.DomQuery;
                pwdRules[0] = dq.selectValue('passwdConstraint01', xmlData);
                pwdRules[1] = dq.selectValue('passwdConstraint02', xmlData);
                pwdRules[2] = dq.selectValue('passwdConstraint03', xmlData);
                pwdRules[3] = dq.selectValue('passwdConstraint04', xmlData);

                function escapeSpecialChars(str) {
                    str = str.replace(/\[/, '\\[');
                    str = str.replace(/\\/, '\\\\');
                    str = str.replace(/\^/, '\\^');
                    str = str.replace(/\$/, '\\$');
                    str = str.replace(/\./, '\\.');
                    str = str.replace(/\|/, '\\|');
                    str = str.replace(/\?/, '\\?');
                    str = str.replace(/\*/, '\\*');
                    str = str.replace(/\+/, '\\+');
                    str = str.replace(/\(/, '\\(');
                    str = str.replace(/\)/, '\\)');
                    return str;
                }

                function reverseStr(str) {
                    var length = str.length;
                    var ret = '';
                    var x;
                    for (x = length; x >= 0; x--) {
                        ret += str.charAt(x);
                    }
                    return ret;
                }

                function noUsernameCheck(str, username) {
                    var temp = '';
                    temp = (typeof username == 'object') ? username.getValue() : username;
                    if (temp.length > 0) {
                        var filter = new RegExp(escapeSpecialChars(temp) + '|' + escapeSpecialChars(reverseStr(temp)),
                            'i');
                        return !filter.test(str);
                    }
                    return true;
                }


                function noRepeatedCharsCheck(str, threshold) {
                    var suffix = '';
                    var i;
                    for (i = 1; i < threshold; i++) {
                        suffix += '\\1';
                    }
                    var filter = new RegExp('(.{1})' + suffix, '');
                    return !filter.test(str);
                }

                function strictPasswordBaselineCheck(str, threshold) {
                    var pwdBaselineCount = 0;
                    if (/[a-z]+/.test(str)) {
                        pwdBaselineCount++;
                    }
                    if (/[A-Z]+/.test(str)) {
                        pwdBaselineCount++;
                    }
                    if (/[0-9]+/.test(str)) {
                        pwdBaselineCount++;
                    }
                    if (/[!"#$%&'()*+,-.\/:;<=>?@\[\\\]\^_`{|}~]+/.test(str)) {
                        pwdBaselineCount++;
                    }
                    return (pwdBaselineCount >= threshold);
                }

                function noCiscoVariationsCheck(str) {
                    return !/cisco|ocsic/i.test(str.replace(/[1!|]{1}/g, 'i').replace(/0/g,
                        'o').replace(/\$/g, 's'));
                }
                Ext.getCmp(CMP_IDS.CHANGE_PWD_NEW_PWD).validator = function(password) {
                    var errStr = [],
                        strErr = false;
                    var username = QNAP.QOS.user.account || checkName;
                    var isValidResetPwd = window.isValidResetPwd;
                    if (isValidResetPwd != '1' && password == Ext.getCmp(CMP_IDS.CHANGE_PWD_OLD_PWD).getValue()) {
                        errStr.push(_S.QUICK11_STR31);
                        if (password !== '') {
                            Ext.getCmp(CMP_IDS.CHANGE_PWD_NEW_PWD).setValue('');
                        }
                        Ext.getCmp(CMP_IDS.CHANGE_PWD_NEW_PWD).markInvalid(_S.QUICK11_STR31);
                        return _S.QUICK11_STR31;
                    }
                    if (pwdRules[2] == 1 &&
                        !noUsernameCheck(password, username)) {
                        strErr = true;
                        errStr.push(_S.IEI_NAS_PASSSTRENGTH3);
                    }

                    if (pwdRules[1] == 1 &&
                        !noRepeatedCharsCheck(password, 3)) {
                        strErr = true;
                        errStr.push(_S.IEI_NAS_PASSSTRENGTH2);
                    }

                    if (pwdRules[0] == 1 &&
                        !strictPasswordBaselineCheck(
                            password, 3)) {
                        strErr = true;
                        errStr.push(_S.IEI_NAS_PASSSTRENGTH1);
                    }

                    if (pwdRules[3] == 1 &&
                        !noCiscoVariationsCheck(password)) {
                        errStr.push(_S.IEI_NAS_PASSSTRENGTH4);
                    }

                    if (strErr) {
                        var errTitle = [_S.IEI_NAS_ALERT_BAD_PWD];
                        return '<ul style="list-style:inside;" ><li>' + errTitle.concat(errStr).join('</li><li>') + '</li></ul>';
                    }
                    return true;
                };
            }
        });
        os.changePwdUI.show();
    },
    loadHostSetting: function(xmlData) {

        var dQuery = Ext.DomQuery;
        var QOS_config = QNAP.QOS.config;
        QOS_config.internalModelName = dQuery.selectValue(
            'QDocRoot model internalModelName', xmlData).replace(/\s/g, '');
        QOS_config.platform = dQuery.selectValue(
            'QDocRoot model platform', xmlData).replace(/\s/g, '');
        QOS_config.platform = dQuery
            .selectValue('model/platform', xmlData);
        QOS_config.firmware = dQuery.selectValue(
            'QDocRoot firmware version', xmlData).replace(/\s/g, '');
        QOS_config.firmwareSP = dQuery.selectValue(
            'QDocRoot sp', xmlData, '').replace(/\s/g, '');
        QOS_config.modelName = dQuery.selectValue(
            'QDocRoot model modelName', xmlData).replace(/\s/g, '');
        QOS_config.buildTime = dQuery.selectValue(
            ' buildTime', xmlData).replace(/\s/g, '');
        QOS_config.build = dQuery.selectValue(
            ' build', xmlData).replace(/\s/g, '');
        QOS_config.displayModelName = dQuery.selectValue(
            ' displayModelName', xmlData);
        QOS_config.demoSiteSuppurt = dQuery.selectValue(
            ' DemoSiteSuppurt', xmlData).replace(/\s/g, '');
        QOS_config.display_firmware = [QOS_config.firmware, dQuery.selectValue(
            'QDocRoot firmware number', xmlData, '').replace(/\s/g, '')].join('.');
        QOS_config.supportRTT = dQuery.selectValue('supportRTT', xmlData);

        if (QOS_config.demoSiteSuppurt == 'yes') {
            Ext.util.Cookies.set('DEMO_QT', new Date().getTime());
        }

        QOS_config.isGenericModel = dQuery.selectValue('genericModel', xmlData) == 'yes';
        QOS_config.projectlName = dQuery.selectValue('projectlName', xmlData);
        QOS_config.timestamp = dQuery.selectValue('ts', xmlData);

        QOS_config.hostname = dQuery.selectValue('hostname', xmlData);
        QOS_config.isBooting = dQuery.selectNumber('is_booting', xmlData) === 1;

        QOS_config.pwdRules = 0;

        if (dQuery.selectNumber('passwdConstraint01', xmlData, 0)) {
            QOS_config.pwdRules += 1;
        }
        if (dQuery.selectNumber('passwdConstraint02', xmlData, 0)) {
            QOS_config.pwdRules += 2;
        }
        if (dQuery.selectNumber('passwdConstraint03', xmlData, 0)) {
            QOS_config.pwdRules += 4;
        }

        if (dQuery.selectNumber('passwdConstraint04', xmlData, 0)) {
            QOS_config.pwdRules += 8;
        }

        document.title = QOS_config.hostname;
        QOS_config.showModels = QNAP.QOS.lib.getModels(QOS_config.internalModelName, QOS_config.modelName);
        var webAccessPort = dQuery.selectNumber('webAccessPort', xmlData);
        var stunnelEnabled = dQuery.selectNumber('stunnelEnabled', xmlData);
        var stunnelPort = dQuery.selectNumber('stunnelPort', xmlData);
        var WFM2 = dQuery.selectNumber('WFM2', xmlData);
        var wfmPortEnabled = dQuery.selectNumber('wfmPortEnabled', xmlData);
        var wfmPort = dQuery.selectNumber('wfmPort', xmlData);
        var wfmSSLEnabled = dQuery.selectNumber('wfmSSLEnabled', xmlData);
        var wfmSSLPort = dQuery.selectNumber('wfmSSLPort', xmlData);
        var wfmURL = dQuery.selectValue('wfmURL', xmlData);
        QOS_config.httpEnable = true;
        QOS_config.httpPort = webAccessPort;
        QOS_config.httpsEnable = stunnelEnabled == 1;
        QOS_config.httpsPort = stunnelPort;
        QOS_config.SystemPreservePort = [11, 20, 21, 22, 23, 25, 53, 77, 79, 80, 87, 137, 138, 139, 161, 443, 445, 514, 587, 873, 3306, 3689, 6000, 8008, 8080, 8081, 8090, 8097, 9000, 13131, 8200, 9251, 8889, 3310, 8554, 111, 548, 6666, 6667, 6668, 6669,
            62693, 62694, 62695, 62696, 62697, 62698
        ];

        QOS_config.force_SSL = dQuery.selectNumber('forceSSL', xmlData, 0) === 1;

        var WFM = {
            status: WFM2 == 1 ? true : false,
            url: wfmURL,
            port: webAccessPort,
            sslenabled: stunnelEnabled == 1 ? true : false,
            sslPort: stunnelPort
        };
        if (wfmPortEnabled == 1) {
            WFM.port = wfmPort;
            if (wfmSSLEnabled == 1) {
                WFM.sslPort = wfmSSLPort == 1 ? true : false;
            }
        }
        QOS_config.WFM = WFM;

        var DSV2Supported = dQuery.selectNumber('DSV2Supported', xmlData);
        var DSV3Supported = dQuery.selectNumber('DSV3Supported', xmlData);
        var DSV2URL = dQuery.selectValue('DSV2URL', xmlData);
        var DSV2 = {
            status: ((DSV2Supported == 1) || (DSV3Supported == 1)) ? true : false,
            url: DSV2URL,
            port: webAccessPort,
            sslenabled: stunnelEnabled == 1 ? true : false,
            sslPort: stunnelPort
        };
        QOS_config.DSV2 = DSV2;

        var NVREnabled = dQuery.selectNumber('NVREnabled', xmlData);
        var NVRURL = dQuery.selectValue('NVRURL', xmlData);
        var NVR = {
            status: NVREnabled == 1 ? true : false,
            url: NVRURL,
            port: webAccessPort,
            sslenabled: stunnelEnabled == 1 ? true : false,
            sslPort: stunnelPort
        };
        QOS_config.NVR = NVR;

        var QWebPort = dQuery.selectNumber('QWebPort', xmlData);
        var QWebEnabled = dQuery.selectNumber('QWebEnabled', xmlData);
        var QWebSSLEnabled = dQuery.selectNumber('QWebSSLEnabled', xmlData);
        var QWebSSLPort = dQuery.selectNumber('QWebSSLPort', xmlData);

        var MSV2WebEnabled = dQuery.selectNumber('MSV2WebEnabled', xmlData);
        var MSV2URL = dQuery.selectValue('MSV2URL', xmlData);
        var MSV2 = {
            status: MSV2WebEnabled == 1 ? true : false,
            url: MSV2URL,
            port: QWebPort,
            sslenabled: QWebSSLEnabled == 1 ? true : false,
            sslPort: QWebSSLPort
        };

        QOS_config.MSV2 = MSV2;

        var QPhotosURL = dQuery.selectValue('QPhotosURL', xmlData);
        var photoSt = {
            status: false,
            url: QPhotosURL,
            port: QWebPort,
            sslenabled: QWebSSLEnabled == 1 ? true : false,
            sslPort: QWebSSLPort
        };
        QOS_config.photoSt = photoSt;

        var QMusicsURL = dQuery.selectValue('QMusicsURL', xmlData);
        var musicSt = {
            status: false,
            url: QMusicsURL,
            port: QWebPort,
            sslenabled: QWebSSLEnabled == 1 ? true : false,
            sslPort: QWebSSLPort
        };
        QOS_config.musicSt = musicSt;

        var QVideosURL = dQuery.selectValue('QVideosURL', xmlData);
        var videoSt = {
            status: false,
            url: QVideosURL,
            port: QWebPort,
            sslenabled: QWebSSLEnabled == 1 ? true : false,
            sslPort: QWebSSLPort
        };
        QOS_config.videoSt = videoSt;

        var smbSupport = {
            powerSchedule: true,
            cpuTemp: true,
            systemTemp: true,
            hddTemp: true,
            selfDefinedTemp: true,
            sysFan: 0
        };
        QOS_config.smbSupport = smbSupport;

        QOS_config.apacheHttpEnable = QWebEnabled == 1;
        QOS_config.apacheHttpPort = QWebPort;
        QOS_config.apacheHttpsEnable = QWebSSLEnabled == 1;
        QOS_config.apacheHttpsPort = QWebSSLPort;
        Ext.getBody().addClass(
            [QOS_config.internalModelName,
                QOS_config.platform,
                QNAP.QOS.user.type + '-user',
                QNAP.QOS.user.isAdminGroup ? 'isAdmin' : ''
            ]);

        this.loadHostSettingFlag = true;
    },
    loadServiceStstus: Ext.emptyFn,
    loadQTSSetting: function() {

        var me = this,
            lib = QNAP.QOS.lib;

        me.serviceStore = new Ext.data.XmlStore({
            record: 'service',
            url: QNAP.QOS.config.sitePath + 'sysinfoReq.cgi',
            idPath: 'id',
            fields: ['url', 'enabled', 'port', 'portEnabled', 'installed', 'removed', 'upgraded',
                'sslPort', 'sslEnabled', 'iconShowUp', 'autoLogin', 'qKey',
                'defaultTitle', 'enabled', 'icon', 'qInternationalKey',
                'serviceKey', 'type', {
                    name: 'allowed',
                    mapping: 'allowed',
                    defaultValue: '0'
                }, {
                    name: 'supported',
                    mapping: 'supported',
                    defaultValue: '1'
                }, {
                    name: 'installed',
                    mapping: 'installed',
                    defaultValue: '1'
                }, {
                    name: 'bindWins',
                    mapping: 'bindWins',
                    defaultValue: []
                }, {
                    name: 'appId',
                    mapping: 'id'
                }, {
                    name: 'serviceIndex',
                    mapping: 'serviceIndex',
                    defaultValue: 99
                }
            ],
            listeners: {
                load: function(store, records) {
                    store.loaded = true;
                    var _lib = QNAP.QOS.lib;
                    var removeRecords = [];
                    var qpkgs, qpkgInfo;
                    Ext.each(records, function(r) {
                        var data = r.data;
                        var appId = r.get('appId');
                        switch (appId) {
                            case 'webFileManager':
                                appId = 'fileExplorer';
                                r.set('appId', appId);
                                break;
                            case 'QsyncServer':
                                QNAP.QOS.user.supportQsync = r.get('allowed') !== '0';
                                break;
                        }

                        r.data.icon = r.data.icon.replace(/\?[\w\W]*/, '') + '?' + URL_RANDOM_NUM;
                        if (r.data.icon === '?' + URL_RANDOM_NUM && RCD_QPKGS[appId]) {
                            r.data.icon = (RCD_QPKGS[appId].icon || '').replace(/\?.*/, '') + '?' + URL_RANDOM_NUM;
                        }

                        var item = _lib.getAppInfo(appId);
                        if (item) {
                            if (item.isAdminOnly && !QNAP.QOS.user.isAdminGroup) {
                                removeRecords.push(r);
                                return true;
                            }
                            if (item.srcDataset === 'SYS_ITEMS') {
                                Ext.apply(data, item);
                            }
                            item.serviceURL = data.url;
                            item.serviceEnabled = data.enabled;
                            item.servicePort = data.port;
                            item.servicePortEnable = data.portEnabled;
                            item.serviceSSLPort = data.sslPort;
                            item.serviceSSLPortEnable = data.sslEnabled;
                            item.serviceInstalled = data.installed;
                            item.serviceUpgraded = data.upgraded;
                            item.serviceSupport = data.supported;

                            var qpkgInfo = os.qpkgInfoStore.query('internalName', new RegExp('^' + RegExp.escape(appId) + '$', 'i')).itemAt(0);
                            if (qpkgInfo) {
                                item.defaultTitle = item.qInternationalKey = qpkgInfo.get('name');
                            }

                            if (appId == 'surveillanceStation' && r.get('installed') == "1") {
                                QNAP.QOS.systemItems.surveillanceStation.defaultTitle = _S[r.get("qKey")] || r.get("qKey") || QNAP.QOS.systemItems.surveillanceStation.defaultTitle;
                            }
                        } else {
                            removeRecords.push(r);
                        }
                        delete r.node;
                    });
                    store.remove(removeRecords);
                    store.sort('serviceIndex', 'ASC');
                    store.commitChanges();
                    delete store.reader.xmlData;
                }
            }
        });

        me.serviceStore.load({
            callback: function() {
                _D('=== serviceStore load initCheck ===');
                os.initCheck(_S.QTS_INIT_LOADING, 'serviceStore loaded');
            }
        });

        me.qpkgStore = new Ext.data.XmlStore({
            url: lib.getCgiUrl(QNAP.QOS.config.sitePath + 'application/appRequest.cgi'),
            baseParams: {
                subfunc: 'qpkg',
                action: 'reload',
                apply: 10
            },
            loaded: false,
            idProperty: 'name',
            record: 'qItem',
            fields: ['name', 'displayName', 'linkURL', 'sysApp', 'icon', 'localIcon', {
                name: 'QPKGFile',
                mapping: 'attr > QPKGFile'
            }, {
                name: 'defaultTitle',
                mapping: 'displayName'
            }, {
                name: 'date',
                mapping: 'attr > date'
            }, {
                name: 'version',
                mapping: 'attr > version'
            }, {
                name: 'installPath',
                mapping: 'attr > installPath'
            }, {
                name: 'configPath',
                mapping: 'attr > configPath'
            }, {
                name: 'shell',
                mapping: 'attr > shell'
            }, {
                name: 'enable',
                mapping: 'attr > enable'
            }, {
                name: 'servPort',
                mapping: 'attr > servPort',
                type: 'int'
            }, {
                name: 'webPort',
                mapping: 'attr > webPort',
                type: 'int'
            }, {
                name: 'webSSLPort',
                mapping: 'attr > webSSLPort',
                type: 'int'
            }, {
                name: 'webUI',
                mapping: 'attr > webUI'
            }, {
                name: 'provider',
                mapping: 'attr > provider'
            }, {
                name: 'author',
                mapping: 'attr > author'
            }, {
                name: 'openOnDesktop',
                mapping: 'attr > desktop'
            }, {
                name: 'status',
                mapping: 'attr > status'
            }, {
                /**
                 * visible
                 * @type {int}
                 * [0] - admin only
                 * [1] - administrators group
                 * [2] - everyone group
                 * [3]
                 */
                name: 'visible',
                mapping: 'attr > visible',
                type: 'int'
            }, {
                name: 'type',
                defaultValue: 'QPKG'
            }, {
                name: 'serviceOpen'
            }, {
                name: 'appId',
                mapping: 'name'
            }, {
                name: 'winW',
                defaultValue: '0',
                type: 'int'
            }, {
                name: 'winH',
                defaultValue: '0',
                type: 'int'
            }, {
                name: 'winMinW',
                mapping: 'winminW',
                defaultValue: '0',
                type: 'int'
            }, {
                name: 'winMinH',
                mapping: 'winminH',
                defaultValue: '0',
                type: 'int'
            }, {
                name: 'winMaxW',
                mapping: 'winmaxW',
                defaultValue: '0',
                type: 'int'
            }, {
                name: 'winMaxH',
                mapping: 'winmaxH',
                defaultValue: '0',
                type: 'int'
            }, {
                name: 'openIn',
                defaultValue: ''
            }, {
                name: 'visible',
                mapping: 'attr > visible',
                defaultValue: 0,
                type: 'int'
            }, {
                name: 'class',
                mapping: 'attr > class'
            }, {
                name: 'isXMLIcon',
                type: 'boolean',
                defaultValue: false
            }, {
                name: 'boot_run_status',
                mapping: 'attr > boot_run_status',
                defaultValue: -1,
                type: 'int'
            }],
            loadIcon: function(record) {
                var img = new Image();
                img.onerror = function() {
                    record.beginEdit();
                    record.set('icon', record.get('localIcon'));
                    record.commit();
                };
                img.src = record.get('icon');
            },
            checkIcons: function() {
                this.each(this.loadIcon);
            },
            initCheck: function() {
                _D('=== qpkgStore load initCheck ===');
                os.initCheck(_S.QTS_INIT_LOADING, 'qpkgstore load');
                this.un('load', this.initCheck);
                this.un('exception', this.initCheck);
            },
            listeners: {
                beforeload: function(store, options) {
                    options.params.lang = QNAP.QOS.lib.getLanguageCode();
                },
                load: function(store) {
                    store.loaded = true;
                    var protocol = window.location.protocol;
                    var xmlData = store.reader.xmlData;
                    var systemWebPort = Ext.DomQuery.selectValue("webServerPort", xmlData);
                    var systemSSLPort = Ext.DomQuery.selectValue("sslPort", xmlData);
                    var cCode = Ext.DomQuery.selectValue("countryCode.code", xmlData, "0");
                    var hideQPKGs = [];
                    var isAdminGroup = QNAP.QOS.user.isAdminGroup;

                    store.countryCode = cCode;
                    store.isXMLAvailable = Ext.DomQuery.selectValue('isXMLAvailable', xmlData);
                    store.each(function(r) {
                        if (!isAdminGroup && r.data.visible !== 2) {
                            hideQPKGs.push(r);
                            return true;
                        } else if (r.data.visible === 0 && QNAP.QOS.user.account !== 'admin') {
                            hideQPKGs.push(r);
                            return true;
                        }
                        var onlyHttp = true;
                        r.beginEdit();
                        if (r.get('webUI') != 'null' && r.get('enable') != 'FALSE') {
                            var link = QNAP.lib.getHostnameForIpv6(window.location.hostname);
                            var httpLink = '',
                                httpsLink = '';
                            var webPort = r.get('webPort');
                            var webSSLPort = r.get('webSSLPort');
                            var webUI = r.get('webUI');

                            /***********************************************
                             * this app is using standard apache, construct
                             * both normal & secure urls
                             * webPort = http protocol port
                             * webSSLPort = https protocol port
                             * port >  0, use QPKG itself web Server
                             * port =  0, use QNAP deault web Server (80)
                             * port = -1, use QNAP System web server (8080)
                             * port = -2, not support http or https protocol
                             * port is not number, not support http or https protocol
                             */

                            if (!Ext.isNumber(webPort)) {
                                httpLink = '';
                            } else if (!Ext.isNumber(webPort) || webPort === 0 || webPort == systemWebPort) {
                                httpLink = 'http://' + link + ':' + systemWebPort + webUI;
                            } else if (webPort == -1) {
                                httpLink = QNAP.QOS.config.rootUrl + webUI;
                            } else if (webPort == -2) {
                                httpLink = '';
                            } else {
                                httpLink = 'http://' + link + ':' + webPort + webUI;
                            }

                            if (!Ext.isNumber(webSSLPort)) {
                                httpsLink = '';
                            } else if (webSSLPort === 0 || webSSLPort == systemSSLPort) {
                                httpsLink = 'https://' + link + ':' + systemSSLPort + webUI;
                            } else if (webSSLPort == -1) {
                                httpsLink = QNAP.QOS.config.rootUrl + webUI;
                            } else if (webSSLPort == -2) {
                                httpsLink = '';
                            } else {
                                httpsLink = 'https://' + link + ':' + webSSLPort + webUI;
                            }

                            if (httpLink === '' && httpsLink === '') {
                                httpLink = 'http://' + link + ':' + systemWebPort + webUI;
                                httpsLink = 'https://' + link + ':' + systemSSLPort + webUI;
                            } else if (httpLink === '') {
                                httpLink = httpsLink;
                            } else if (httpsLink === '') {
                                httpsLink = httpLink;
                            }

                            if (protocol == 'https:') {
                                r.set('linkURL', httpsLink);
                            } else {
                                r.set('linkURL', httpLink);
                            }
                        }

                        var path = '/RSS/images/{0}{1}.gif?{2}';
                        var isFalse = '';
                        if (r.get('enable') == 'FALSE') {
                            isFalse += '_gray';
                        }
                        r.set('icon', String.format(path, r.get('name'), isFalse, r.get('version')));
                        r.set('localIcon', r.data.icon);
                        r.set('onlyHttp', onlyHttp);
                        if (r.get('openOnDesktop') == '1') {
                            r.set('serviceOpen', 'QOSWindow');
                        }
                    });

                    store.remove(hideQPKGs);
                    store.hideQPKGs = hideQPKGs;

                    os.qpkgInfoStore.each(function(r) {
                        var installedService = store.query('appId', new RegExp('^' + RegExp.escape(r.data.internalName) + '$', 'i')).itemAt(0);
                        if (installedService) {
                            installedService.beginEdit();
                            installedService.set('isXMLIcon', true);
                            installedService.set('icon', r.get('icon80'));
                            installedService.set('defaultTitle', r.get('name'));
                            installedService.set('displayName', r.get('name'));
                        } else if (r.data.status.updateStatus == 3) {
                            r.data.status = {};
                        }
                    });
                    os.qpkgInfoStore.commitChanges();
                    store.commitChanges();
                    store.checkIcons();
                    xmlData = undefined;
                }
            }
        });

        me.qpkgStore.on({
            single: true,
            load: me.qpkgStore.initCheck,
            exception: me.qpkgStore.initCheck
        });

        me.on('serviceupdate', function(appId, serviceName, option) {
            var keyServices = ['photos', 'qmultimedia', 'musics', 'web_file_mgmt', 'qdownload', 'survielance', 'qpkg', 'webServer'];
            if (keyServices.indexOf(serviceName) >= 0) {
                me.serviceStore.reload();
                me.qpkgStore.reload();
                me.stationStore.reload();
            }
        });

        me.qpkgInfoStore = new Ext.data.XmlStore({
            url: QNAP.QOS.lib.getCgiUrl('/RSS/rssdoc/qpkgcenter_' + QNAP.QOS.lib.getLanguageCode() + '.xml'),
            record: 'item',
            fields: ['name', 'internalName', 'category', 'icon', 'icon80', 'icon100',
                'description', 'moreDescription', 'version', 'keyword',
                'publishedDate', 'maintainer', 'forumLink', {
                    name: 'ccode',
                    defaultValue: '0'
                }, {
                    name: 'licChk',
                    defaultValue: '0'
                }, 'wikiLink', 'platform', 'status', {
                    name: 'class',
                    defaultValue: 'appCenter'
                },
                {
                    name: 'minVersion',
                    mapping: 'min_version',
                    defaultValue: '-1'
                }, {
                    name: 'memGT',
                    mapping: 'memGT',
                    defaultValue: 0,
                    type: 'NUMBER'
                }
            ],
            loaded: false,
            filterUnSupport: function(record) {
                var system_memory;
                var support = true,
                    displayModelName = QNAP.QOS.config.displayModelName,
                    modelName = QNAP.QOS.config.modelName,
                    platform = QNAP.QOS.config.platform;

                Ext.iterate(record.data.platform, function(platformID, data) {
                    support = false;
                    switch (platformID) {
                        case displayModelName:
                        case modelName:
                        case platform:
                            if (data.location.length > 0) {
                                support = true;
                            }
                            Ext.each(data.platformExcls, function(platformExcl) {
                                switch (platformExcl) {
                                    case displayModelName:
                                    case modelName:
                                    case platform:
                                        support = false;
                                        return false;
                                }
                            });
                            if (support === true) {
                                return false;
                            }
                            break;
                    }
                });

                if (support === false) {
                    return !support;
                }

                support = QNAP.QOS.lib.chkCCode(me.qpkgStore.countryCode, record.data.ccode);

                try {
                    system_memory = os.dataStore.hardware.getAt(0).get('totalMemory');
                } catch (e) {
                    system_memory = 0;
                    console.warn('[Warn] Can\'t get system memory size.');
                }

                if (system_memory === 0) {
                    return !support;
                }

                if (record.get('memGT') > system_memory) {
                    support = false;
                }

                return !support;
            },
            isUnSupport: function(record) {
                return this.filterUnSupport(record);
            },
            isSupport: function(record) {
                return !this.filterUnSupport(record);
            },
            removeUnSupportItem: function() {
                var removeList = this.queryBy(this.filterUnSupport);
                this.remove(removeList.getRange().reverse());
                this.commitChanges();
            },
            reset_lang: function() {
                this.current_lang = QNAP.QOS.lib.getLanguageCode();
                this.proxy.setUrl(QNAP.QOS.lib.getCgiUrl('/RSS/rssdoc/qpkgcenter_' + this.current_lang + '.xml'));
            },
            load_after_hardware: function() {
                if (this.load_after_hardware_flag) {
                    this.load_after_hardware_flag = false;
                    this.load();
                }
            },
            listeners: {
                beforeload: function(store) {
                    var hardware_store;

                    hardware_store = os.dataStore.hardware;

                    if (!hardware_store) {
                        this.load_after_hardware_flag = true;
                        return false;
                    }

                    if (hardware_store.loaded) {
                        store.reset_lang();
                        return true;
                    } else {
                        this.load_after_hardware_flag = true;
                        hardware_store.on({
                            load: store.load_after_hardware,
                            scope: store,
                            single: true
                        });

                        return false;
                    }
                },
                load: function(store) {
                    store.loaded = true;
                    delete store.proxy.conn.headers;
                    var platformIDs = [],
                        platformExcls = [],
                        location = '',
                        version = '',
                        nodes;
                    var qpkg_name;
                    store.each(function(r) {
                        nodes = Ext.DomQuery.select('platform', r.node);
                        version = r.get('version');
                        r.data.platform = {};
                        r.data.icon += '?' + version;
                        r.data.icon80 += '?' + version;
                        r.data.icon100 += '?' + version;
                        Ext.each(nodes, function(node) {
                            platformIDs = Ext.DomQuery.selectValue('platformID', node).split(',');
                            platformExcls = Ext.DomQuery.selectValue('platformExcl', node, '').split(',');
                            location = Ext.DomQuery.selectValue('location', node, '');
                            Ext.each(platformIDs, function(platformID) {
                                r.data.platform[platformID] = {
                                    location: location,
                                    platformExcls: platformExcls
                                };
                            });
                        });

                        qpkg_name = r.get('name');
                        os.serviceStore.query('appId', r.data.internalName).each(function(service) {
                            service.beginEdit();
                            service.set('defaultTitle', qpkg_name);
                            service.set('qInternationalKey', qpkg_name);
                            service.endEdit();
                        });
                    });
                    os.serviceStore.commitChanges();

                    store.removeUnSupportItem();

                    os.qpkgStore.each(function(r) {
                        var installedService = store.query('internalName', new RegExp('^' + RegExp.escape(r.data.name) + '$', 'i')).itemAt(0);
                        if (installedService) {
                            r.beginEdit();
                            r.set('icon', installedService.get('icon80'));
                            r.set('defaultTitle', installedService.get('name'));
                            r.set('displayName', installedService.get('name'));
                            r.endEdit();
                        }
                    });

                    os.qpkgStore.commitChanges();
                    os.qpkgStore.checkIcons();
                }
            }
        });

        me.qpkgInfoStore.on({
            single: true,
            load: function() {
                if (os.qpkgStore.loaded) {
                    return;
                }
                os.qpkgStore.load({
                    callback: function() {}
                });
            }
        });

        if (lib.supportStorage) {
            me.qpkgInfoStore.proxy.onRead = Ext.createSequence(me.qpkgInfoStore.proxy.onRead, function(action, o, response) {
                var langCode, xml;

                langCode = os.qpkgInfoStore.current_lang;
                xml = response.responseText;

                try {
                    lib.setStorageValue('QPKG_XML_' + langCode, xml);
                    lib.setStorageValue('QPKG_XML_' + langCode + '_Last-Modified', response.getResponseHeader('Last-Modified'));
                } catch (e) {
                    var lang = '';
                    QNAP.QOS.lib.languageStore.each(function(langRecord) {
                        lang = langRecord.get('file_name');
                        lib.removeStorageValue('QPKG_XML_' + lang);
                        lib.removeStorageValue('QPKG_XML_' + lang + '_Last-Modified');
                    });
                }
            });

            me.qpkgInfoStore.on({
                single: true,
                'beforeload': function(store) {
                    me.qpkgInfoStore.proxy.conn.headers = {
                        'If-Modified-Since': lib.getStorageValue('QPKG_XML_' + store.current_lang + '_Last-Modified')
                    };
                },
                loadexception: function(proxy, o, response) {
                    var langCode = QNAP.QOS.lib.getLanguageCode();
                    var cacheXml = lib.getStorageValue('QPKG_XML_' + langCode);

                    if (response.status === 304 && lib.supportStorage && cacheXml) {
                        if (window.DOMParser) {
                            this.loadData(new window.DOMParser().parseFromString(cacheXml, "text/xml"));
                        } else if (ActiveXObject) {
                            var xmlDocument = new ActiveXObject('Microsoft.XMLDOM');
                            xmlDocument.async = false;
                            xmlDocument.loadXML(cacheXml);
                            this.loadData(xmlDocument);
                        }
                    } else {
                        lib.setStorageValue('QPKG_XML_' + langCode + '_Last-Modified', 0);
                        os.qpkgStore.load();
                    }
                }
            });
        } else {
            me.qpkgInfoStore.on({
                single: true,
                loadexception: function(proxy, request, response) {
                    if (os.qpkgStore.loaded) {
                        return;
                    }
                    os.qpkgStore.load();
                }
            });
        }

        os.on('afterloadusersetting', function() {
            if (QNAP.QOS.lib.getLanguageCode() !== os.qpkgInfoStore.current_lang) {
                os.qpkgInfoStore.reset_lang();
                os.qpkgInfoStore.reload();
            }
        });

        os.stationStore.on('load', function(store) {
            _D('=== os stationStore load initCheck ===');
            store.loaded = true;
            os.initCheck(_S.QTS_INIT_LOADING, 'stationStore load');
        }, null, {
            single: true
        });

        _D('=== os loadQTSSetting initCheck ===');
        os.initCheck(_S.QTS_INIT_LOADING, 'loadQTSSetting');
    },
    loadUserProfile: function(callbackFn) {
        _D('=== os loadUserProfile ===');
        var userProfile = {
            func: 'getUserProfile'
        };
        QNAP.QOS.ajax({
            url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'userConfig.cgi'),
            method: 'POST',
            params: userProfile,
            success: function(res, opts) {
                var resData = Ext.decode(res.responseText);
                if (resData.success == 'false') {
                    QNAP.QOS.user.profile = {};
                } else {
                    Ext.apply(QNAP.QOS.user, {
                        profile: resData.profile
                    });
                }
            },
            callback: callbackFn
        });
        QNAP.QOS.user.profile = {};

        QNAP.QOS.ajax({
            url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'userConfig.cgi'),
            method: 'POST',
            params: {
                func: 'cloudPersonalSmtp',
                cloud_url: 1
            },
            success: function(res, opts) {
                QNAP.QOS.config.cloudURL = Ext.decode(res.responseText).cloud_url;
            }
        });


    },
    loadUserSetting: function() {
        _D('=== os loadUserSetting ===');
        if (this.loadUserSettingFlag) {
            return true;
        }
        var me = this;
        Ext.Ajax.request({
            url: QNAP.QOS.config.sitePath + 'userConfig.cgi',
            method: 'POST',
            params: {
                func: 'get_all',
                sid: QNAP.QOS.user.sid
            },
            success: function(response, opts) {

                Ext.Msg.hide();
                var o = Ext.decode(response.responseText);

                var defaultCfg = {
                    lang: 'auto',
                    quickSet: '0',
                    lastApp: [],
                    common: {},
                    datetime: {
                        login: 0,
                        sysLogClearAll: 0,
                        notify: 0
                    }
                };

                var defalutCommon = {
                    levWarn: 'true',
                    showPCUtil: 'true',
                    showPageSwitch: 'true',
                    showDashboard: 'true',
                    showDatetime: 'true',
                    shortcutLayout: 'simple',
                    autoHideMainMenu: 'false',
                    autoPlayExtDevice: 'true',
                    isWindowBaseMode: 'true',
                    resWin: 'false',
                    autoLogout: 'true',
                    maxIdleTime: 60
                };

                if (QNAP.QOS.user.isAdminGroup) {
                    defaultCfg.shortcuts = QNAP.QOS.config.defaultAdminShortcuts;
                } else {
                    defaultCfg.shortcuts = QNAP.QOS.config.defaultUserShortcuts;
                    defalutCommon.showDashboard = 'false';
                }
                if (QNAP.QOS.config.modelName == 'IS-400') {
                    var nIdx = -1;
                    for (var i = 0; i < defaultCfg.shortcuts.length; ++i) {
                        if (defaultCfg.shortcuts[i].appId == 'VmGuide') {
                            nIdx = i;
                        }
                    }
                    if (nIdx >= 0) {
                        var temp = defaultCfg.shortcuts.splice(6, 1);
                        defaultCfg.shortcuts.push(temp[0]);

                    }
                }

                defaultCfg.bgClass = QNAP.QOS.config.defaultBg;
                defalutCommon.cumsWallpaperType = 'Center';

                var sysDateTime = new Date(o.current);

                Ext.apply(QNAP.QOS.user, defaultCfg);
                Ext.apply(QNAP.QOS.user, {
                    pageSize: o.pageSize || {},
                    dateTimeFormat: {
                        current: sysDateTime,
                        timeOffset: sysDateTime.getTime() - new Date().getTime(),
                        dateformatindex: parseInt(o.dateformatindex),
                        timeformat: parseInt(o.timeformat)
                    }
                });

                if (o.success == "true") {
                    if (o.datetime) {
                        QNAP.QOS.user.datetime = o.datetime;
                        Ext.iterate(QNAP.QOS.user.datetime, function(key, value, datetime) {
                            datetime[key] = parseInt(value);
                        });
                    }
                    if (o.record) {
                        QNAP.QOS.user.record = o.record;
                    }
                    if (o.access) {
                        QNAP.QOS.user.access = o.access;
                    }
                    if (o.state) {
                        QNAP.QOS.user.state = o.state;
                    }
                    defaultCfg.dock = Ext.encode(defaultCfg.dock);
                    defaultCfg.shortcuts = Ext.encode(defaultCfg.shortcuts);
                    defaultCfg.showQuickStart = true;
                    if (QNAP.QOS.config.bIsStorageV2) {
                        defaultCfg.autoShowStorageV2 = true;
                    }

                    Ext.apply(defaultCfg, o);
                    Ext.apply(defaultCfg, o.common);
                    Ext.applyIf(defaultCfg.common, defalutCommon);
                    defaultCfg.cumsWallpaperColors = Ext.decode(defaultCfg.cumsWallpaperColors);
                    defaultCfg.showQuickStart = defaultCfg.showQuickStart !== 'false';
                    if (QNAP.QOS.config.bIsStorageV2) {
                        defaultCfg.autoShowStorageV2 = defaultCfg.autoShowStorageV2 !== 'false';
                    }
                    Ext.apply(QNAP.QOS.user, defaultCfg);
                    if (QNAP.QOS.Environment.forceLang) {
                        QNAP.QOS.user.lang = QNAP.QOS.Environment.forceLang;
                    }
                    if (QNAP.QOS.Environment.supportCumsWindowMode === false) {
                        QNAP.QOS.user.common.isWindowBaseMode = 'true';
                        QNAP.QOS.user.common.windowMode = 'basic';
                    }
                    if (!QNAP.QOS.user.datetime.notify) {
                        QNAP.QOS.user.datetime.notify = QNAP.QOS.user.datetime.logout;
                    }

                    Ext.Ajax.request({
                        url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'userConfig.cgi'),
                        params: {
                            func: 'set',
                            common_lang: QNAP.QOS.user.lang
                        },
                        method: 'POST'
                    });
                    QNAP.QOS.config.bgList.push('desktop-bg-cums');
                    QNAP.QOS.config.myPortraitUrl = './userConfig.cgi?func=outputBgImgTh&imgbgName=portrait.jpg&sid=' + QNAP.QOS.user.sid + '&r=' + Math.random();

                    if (Ext.isString(QNAP.QOS.user.shortcuts)) {
                        try {
                            QNAP.QOS.user.shortcuts = Ext.decode(QNAP.QOS.user.shortcuts);
                        } catch (e) {
                            QNAP.QOS.user.shortcuts = QNAP.QOS.config.defaultUserShortcuts;
                        }
                    }

                    var hasQPKG = false;
                    Ext.each(QNAP.QOS.user.shortcuts, function(shortcut) {
                        if (shortcut.type === 'QPKG') {
                            hasQPKG = true;
                            return false;
                        }
                    });

                    Ext.getBody().addClass(QNAP.QOS.user.theme);
                    Ext.state.Manager.setProvider(new QNAP.QOS.CMP.STATE.ConfigProvider());
                }
                if (QNAP.QOS.user.common.isWindowBaseMode === 'true') {
                    QNAP.QOS.user.common.windowMode = QNAP.QOS.user.common.windowMode ? QNAP.QOS.user.common.windowMode : 'basic';
                }
                delete QNAP.QOS.user.common.shortcutLayout;

                var fireEvent = false;
                QNAP.QOS.lib.resetLang(QNAP.QOS.user.lang, function() {
                    if (!fireEvent) {
                        fireEvent = true;
                        os.fireEvent('afterloadusersetting');
                    }
                });
                me.loadUserSettingFlag = true;
            },
            callback: function() {
                os.initCheck(_S.QTS_INIT_LOADING, 'load user setting');
            }
        });
        this.loadUserProfile();
    },
    authPass: function() {
        _D('[Info] authPass...');
        this.loadUserSetting();
        os.readyToShowUI = true;
    },
    authNotPass: Ext.emptyFn,
    initMouseWhellEvent: function() {

        /**
         * mouse wheel event listener
         */
        function wheelEventLs(event) {
            var delta = 0;
            if (!event) { /* For IE. */
                event = window.event;
            }
            if (event.wheelDelta) { /* IE/Opera. */
                delta = event.wheelDelta / 120;
            } else if (event.detail) {
                /**
                 * Mozilla case.
                 *
                 * In Mozilla, sign of delta is different than in IE. Also,
                 * delta is multiple of 3.
                 */
                delta = -event.detail / 3;
            }

            os.fireEvent('mousewheel', Ext.EventObject.setEvent(event), delta);
        }

        if (Ext.isGecko) {
            window.addEventListener('DOMMouseScroll', wheelEventLs, false);
        } else if (Ext.isIE7 || Ext.isIE8) {
            Ext.getBody().dom.attachEvent('onmousewheel', wheelEventLs);
        } else {
            Ext.getBody().dom.addEventListener('mousewheel', wheelEventLs);
        }
    },
    initViewport: function() {
        if (QNAP.QOS.lib.isMobileBrowser) {
            Ext.override(Ext.Viewport, {
                initComponent: function() {
                    Ext.Viewport.superclass.initComponent.call(this);
                    document.getElementsByTagName('html')[0].className += ' x-viewport';
                    this.el = Ext.getBody();
                    this.el.setHeight = Ext.emptyFn;
                    this.el.setWidth = Ext.emptyFn;
                    this.el.setSize = Ext.emptyFn;
                    this.el.dom.scroll = 'no';
                    this.allowDomMove = false;
                    this.autoWidth = false;
                    this.width = 1180;
                    this.autoHeight = true;
                    this.renderTo = this.el;
                }
            });
        }
        this.viewport = new Ext.Viewport({
            cls: 'qos-body'
        });
    },
    pingNas: function(success, failure, callback) {
        QNAP.QOS.ajax({
            url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'authLogin.cgi'),
            method: 'POST',
            success: Ext.isFunction(success) ? success : Ext.emptyFn,
            failure: Ext.isFunction(failure) ? failure : Ext.emptyFn,
            callback: Ext.isFunction(callback) ? callback : Ext.emptyFn
        });
        Ext.util.Cookies.set('QT', new Date().getTime());
    },
    initUI: function() {
        os.stationStore.reload();
        this.getViewport();
        os.fireEvent('initUI');
    },
    startTask: function() {
        if (QNAP.QOS.user.isAdminGroup) {
            os.qTaskMgr.startAll();
        } else {
            os.qTaskMgr.startAutoReload(QNAP.QOS.config.T_SYS_SETTING);
        }
    },
    initStore: function(storeId) {
        var store;
        if (os.dataStore[storeId]) {
            if (os.dataStore[storeId].isDestroyed) {
                os.dataStore[storeId] = undefined;
            } else {
                return os.dataStore[storeId];
            }
        }
        switch (storeId) {
            case 'streamDeviceStore':
                store = new Ext.data.JsonStore({
                    isLoading: false,
                    url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'filemanager/utilRequest.cgi'),
                    baseParams: {
                        func: 'qrpac',
                        sid: QNAP.QOS.user.sid,
                        op: 1
                    },
                    autoDestroy: true,
                    totalProperty: 'total',
                    root: 'devices',
                    idProperty: 'device.deviceId',
                    fields: [{
                        name: 'deviceName',
                        mapping: 'device.deviceName'
                    }, {
                        name: 'deviceId',
                        mapping: 'device.deviceId'
                    }, {
                        name: 'ip',
                        mapping: 'device.ip'
                    }, {
                        name: 'mac',
                        mapping: 'device.mac'
                    }, { // supportType
                        name: 'type',
                        mapping: 'device.type'
                    }, { // DLNA/AirPlay/Chromecast
                        name: 'deviceType',
                        mapping: 'device.deviceType',
                        convert: function(value, record) {
                            if (value === 'ALSA') {
                                value = value + '_' + (record.device.deviceSubtype || '');
                            }
                            return value;
                        }
                    }, { // 音量上限，作用不明
                        name: 'maxVolume',
                        mapping: 'device.maxVolume',
                        type: 'int'
                    }, { // 是否使用中
                        name: 'active',
                        mapping: 'device.active',
                        type: 'boolean'
                    }, { // playerStatus
                        name: 'playerStatus',
                        mapping: 'device.playerStatus'
                    }, { // device is my
                        name: 'isMy',
                        defaultValue: false
                    }, {
                        name: 'installed',
                        mapping: 'device.installed',
                        defaultValue: "true",
                    }, { // Device is play or pause
                        name: 'isWorking',
                        defaultValue: false
                    }, {
                        name: 'appType',
                        mapping: 'device.playerStatus.appType',
                        defaultValue: ''
                    }, {
                        name: 'location',
                        mapping: 'device.location',
                        defaultValue: ''
                    }],
                    updaetWorkingState: function(record, silent) {
                        var status = record.get('playerStatus');
                        record.beginEdit();

                        if (status && /^(PLAY)$/i.test(status.playerState)) {
                            record.set('isWorking', true);
                        } else {
                            record.set('isWorking', false);
                        }
                        record.commit(silent);
                    },
                    listeners: {
                        beforeload: function(store) {
                            store.isLoading = true;
                        },
                        load: function(store) {
                            var removeList;
                            store.isLoading = false;
                            removeList = [];

                            store.each(function(record) {
                                if (record.get('location') === 'local' && record.get('type') === 'audio') {}
                                store.updaetWorkingState(record, true);
                            });
                        },
                        update: function(store, record, operation) {
                            store.updaetWorkingState(record, true);
                        },
                        exception: function() {
                            this.isLoading = false;
                        }
                    }
                });
                os.on('serviceupdate', function(appId, serviceName, option) {
                    if (serviceName === 'qpkg') {
                        this.reload();
                    }
                }, store);
                break;
                /**
                 * NAS to NAS Rsync
                 */
            case 'rrStore':
                store = new Ext.data.XmlStore({
                    storeId: "rrStore",
                    autoDestroy: true,
                    remoteSort: true,
                    url: "../cgi-bin/backup/backupRequest.cgi?",
                    record: 'backupJob',
                    totalProperty: 'count',
                    fields: ['bkSRate', 'checkbox', 'name', 'bk_pid',
                        'bkRsyncMode', 'bkType', 'bkMonth', 'bkWeek',
                        'bkHour', 'bkMinute', 'bkOption', 'bkRsyncPort',
                        'bkSSHPort', 'bkStatus', 'bktime', 'pidStatus',
                        'piProgress', 'pnsRemain', 'pidError', 'bSparse',
                        'bSuspedned', 'bktime_start', 'bktime_finish',
                        'bkTimeString', 'bkStatusString', 'pidStatus',
                        'pidError', 'serverLocation', 'userName', 'userPassword',
                        'bExattr', 'bkIntervalHour', 'bkIntervalHour',
                        {
                            name: 'remotePath',
                            mapping: 'remoteBackupNAS/path'
                        }, {
                            name: 'remoteVolume',
                            mapping: 'remoteBackupNAS/volume'
                        }, {
                            name: 'localPath',
                            mapping: 'localBackupNAS/path'
                        }, {
                            name: 'localVolume',
                            mapping: 'localBackupNAS/volume'
                        }, 'Speed'
                    ],
                    lastStatus: []
                });
                store.on('load', function(store) {
                    var reloadNotify = false;
                    var progressMap = {};
                    store.each(function(record) {
                        var pid = record.data.bk_pid;
                        var status = record.data.pidStatus + '-' + record.data.pidError;
                        progressMap['doing-' + pid + '-' + record.data.name] = record.data.piProgress;
                        if (store.lastStatus[pid] != status) {
                            store.lastStatus[pid] = status;
                            reloadNotify = true;
                        }
                    });
                    if (reloadNotify) {
                        os.dataStore.notifyStore.reload.defer(1000, os.dataStore.notifyStore);
                    }
                    var finishStroe = Ext.StoreMgr.item(QNAP.QOS.config.S_FINISH_TASK_LIST);
                    finishStroe.suspendEvents(true);
                    finishStroe.each(function(record) {
                        var mapKey = record.data.uiGroup + '-' + record.data.jobID + '-' + record.data.name;
                        if (progressMap[mapKey]) {
                            record.set('progress', progressMap[mapKey]);
                        }
                    });
                    finishStroe.resumeEvents();
                    finishStroe.commitChanges();
                });
                break;
            case 'qcenter':
                store = new Ext.data.JsonStore({
                    isLoading: false,
                    loaded: false,
                    url: '/qnapcmsagent/hawkeye_agent/v1/status',
                    autoDestroy: true,
                    totalProperty: 'total',
                    root: 'servers',
                    fields: [{
                        name: 'domain',
                        mapping: 'ip_hostname'
                    }, {
                        name: 'is_alive',
                        type: 'boolen'
                    }],
                    extractDomain: function(url) {
                        var domain;
                        if (url.indexOf("://") > -1) {
                            domain = url.split('/')[2];
                        } else {
                            domain = url.split('/')[0];
                        }

                        domain = domain.split(':')[0];

                        return domain;
                    },
                    /**
                     * [getConnectStatus description]
                     * @return {String} statusStr
                     * -- - Data not loaded
                     * Not Managed (3) - cmsHost and extCmsHost are empty
                     * Abnormal (2) - lastSyncStatus is "fail"
                     * Normal (1) - others
                     */
                    getConnectStatusStr: function() {
                        var record = this.getAt(0);
                        var statusStr = '--';
                        if (!this.loaded) {
                            return statusStr;
                        }
                        if (!record) {
                            return _S.QTS_QCENTER_NOT_MANAGED;
                        }
                        switch (record.get('statusCode')) {
                            case 3:
                                statusStr = _S.QTS_QCENTER_NOT_MANAGED;
                                break;
                            case 2:
                                statusStr = _S.UPS_STRING10;
                                break;
                            case 1:
                                statusStr = _S.UPS_STRING9;
                                break;
                        }
                        return statusStr;
                    },
                    get_host_status: function(record) {
                        var status;
                        if (record.get('is_alive') === true) {
                            status = _S.UPS_STRING9;
                        } else {
                            status = _S.UPS_STRING10;
                        }
                        return status;
                    },
                    listeners: {
                        exception: function(proxy, type, action, options, response) {
                            this.loaded = true;
                            var datas;
                            if (response.status !== 200) {
                                datas = {
                                    ext_cms_host: '',
                                    cms_host: '',
                                    domain: '--',
                                    statusCode: 3
                                };
                            } else {
                                datas = this.reader.jsonData;

                                datas.domain = this.extractDomain(datas.ext_cms_host || datas.cms_host);
                                if (datas.ext_cms_host === '' && datas.cms_host === '') {
                                    datas.statusCode = 3;
                                } else if (datas.last_sync_status === 'fail') {
                                    datas.statusCode = 2;
                                } else {
                                    datas.statusCode = 1;
                                }
                            }

                            this.loadData({
                                datas: [datas]
                            });
                        },
                        load: function() {
                            this.loaded = true;
                        }
                    }
                });
                break;
                /**
                 * Spec#6618 add now playing multi-room task in deskotp background task list
                 */
            case 'mediaLibPlayingTaskStore':
                store = new Ext.data.JsonStore({
                    isLoading: false,
                    url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'management/manaRequest.cgi', {
                        subfunc: 'player',
                        op: '1'
                    }),
                    baseParams: {
                        sid: QNAP.QOS.user.sid
                    },
                    autoDestroy: true,
                    totalProperty: 'playerCount',
                    root: 'players',
                    idProperty: 'jobID',
                    fields: [{
                        name: 'jobID',
                        mapping: 'player.renderID'
                    }, {
                        name: 'type',
                        defaultValue: 'meidaLibPlayTask'
                    }, {
                        name: 'displayType',
                        defaultValue: 'UNKNOWN',
                        mapping: 'player.status.deviceType',
                        convert: function(renderType, record) {
                            var renderType, renderIcon, deviceSubtype;
                            renderType = renderType;

                            switch (renderType) {
                                case 'ALSA':
                                    deviceSubtype = record.player.status.deviceSubtype;
                                    switch (deviceSubtype) {
                                        case 'ANALOG':
                                        case 'HDMI':
                                        case 'USB':
                                            renderType = [renderType, deviceSubtype].join('_');
                                            break;
                                        default:
                                            renderType = 'UNKNOWN';
                                            renderIcon = '';
                                    }

                                case 'DLNA':
                                case 'AirPlay':
                                case 'Chromecast':
                                case 'HDPLAYER':
                                    renderIcon = '<img class=\'multizone-render-icon render--' + renderType + '\' src=\'' + Ext.BLANK_IMAGE_URL + '\' />';
                                    break;
                                default:
                                    renderType = 'UNKNOWN';
                                    renderIcon = '';
                                    break;
                            }
                            return ['<div class=\'multizone-task\' >', renderIcon, record.player.deviceName, '</div>'].join('');
                        }
                    }, {
                        name: 'name',
                        mapping: 'player.status.file_title'
                    }, {
                        name: 'info',
                        convert: function(v, record) {
                            var status = record.player.status;
                            return {
                                renderID: record.player.renderID,
                                deviceName: record.player.deviceName,
                                playerState: status.playerState,
                                appType: status.appType,
                                file_path: status.file_path,
                                file_title: status.file_title,
                                trackContent: status.trackContent
                            };
                        }
                    }, {
                        name: 'uiGroup',
                        defaultValue: 'doing'
                    }],
                    shortInterval: 5000, // 5 sec
                    longInterval: 15000, // 15 sec
                    listeners: {
                        beforeload: function(store) {
                            store.isLoading = true;
                        },
                        load: function(store) {
                            var removeList = [];

                            store.isLoading = false;

                            store.each(function(record) {
                                if (record.get('info').playerState !== 'PLAY') {
                                    removeList.push(record);
                                }
                            });

                            store.remove(removeList);

                            if (store.getCount() > 0) {
                                store.interval = store.shortInterval;
                            } else {
                                store.interval = store.longInterval;
                            }
                        },
                        exception: function() {
                            this.isLoading = false;
                        }
                    }
                });
                break;
                /**
                 * Spec #7241 - Desktop headbar add volumn control button
                 */
            case 'soundVolume':
                store = new Ext.data.JsonStore({
                    url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'management/manaRequest.cgi', {
                        subfunc: 'player',
                        op: '3'
                    }),
                    autoDestroy: true,
                    storeId: 'soundVolume',
                    root: 'soundChanel',
                    idProperty: 'chanelName',
                    fields: ['chanelName', {
                        name: 'support',
                        type: 'boolean'
                    }, {
                        name: 'mute',
                        type: 'boolean'
                    }, {
                        name: 'volume',
                        type: 'int'
                    }],
                    data: {
                        soundChanel: [{
                            chanelName: 'master',
                            support: false,
                            mute: false,
                            volume: 0
                        }]
                    },
                    volumeReader: function(response) {
                        var json = response.responseText;
                        var o = Ext.decode(json);
                        var masterVolume = {
                            chanelName: 'masterVolume'
                        };
                        if (!o) {
                            throw {
                                message: 'JsonReader.read: Json object not found'
                            };
                        }
                        if (o.result === 0) {
                            Ext.apply(masterVolume, {
                                support: o.buzzer_voice_support === 1,
                                mute: o.mute === 1,
                                volume: o.volume.constrain(0, 100)
                            });
                        } else {
                            Ext.apply(masterVolume, {
                                support: false
                            });
                        }
                        return this.readRecords({
                            soundChanel: [masterVolume]
                        });
                    },
                    listeners: {}
                });
                store.reader.read = store.volumeReader;
                break;
            case 'iscsi_target_status':
                store = new Ext.data.XmlStore({
                    url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'disk/iscsi_portal_setting.cgi'),
                    baseParams: QNAP.QOS.config.bIsStorageV2 ? {
                        func: 'extra_get',
                        targetList: 1,
                        sid: QNAP.QOS.user.sid
                    } : {
                        func: 'get_all',
                        sid: QNAP.QOS.user.sid
                    },
                    record: 'targetInfo',
                    fields: ['targetIndex', 'targetName', 'targetStatus']
                });
                break;
            case 'system_resource':
                store = new Ext.data.JsonStore({
                    root: 'host',
                    data: {
                        host: [{
                            hostname: 'localhost',
                            cpu_usage: 0,
                            cpu: [{
                                phy_id: 0,
                                cpu_usage: 0
                            }],
                            memory_total: 0,
                            memory_free: 0
                        }]
                    },
                    idProperty: 'hostname',
                    fields: [{
                        name: 'hostname',
                        type: 'string'
                    }, {
                        name: 'cpu_usage',
                        type: 'float'
                    }, {
                        name: 'cpu'
                    }, {
                        name: 'memory_total',
                        type: 'int'
                    }, {
                        name: 'memory_free',
                        type: 'int'
                    }]
                });
                break;
        }
        os.dataStore[storeId] = store;
        return store;
    },
    initTreeLoader: function(loaderId) {
        var loader;
        if (os.treeLoader[loaderId]) {
            return os.treeLoader[loaderId];
        }
        /**
        * case 'backupExternal':
        case 'backupRsync':
        case 'backupNAStoNAS':
        case 'backupRTRR':
        **/
        switch (loaderId) {
            case 'rtrrTreeLoader':
                loader = new Ext.tree.TreeLoader({
                    dataUrl: '/cgi-bin/backup/qsyncrequest.cgi?',
                    baseParams: {
                        subfunc: 'remote_rep',
                        qs_act: 'loading_joblist_serverlist',
                        count: _dc,
                        sid: QNAP.QOS.user.sid
                    },
                    clearOnLoad: false,
                    datas: new Ext.util.MixedCollection(),
                    lastStatus: {}
                });
                loader.on('load', function(loader, node, response) {
                    var dQuery = Ext.DomQuery,
                        jobEntrys = dQuery.jsSelect('job_entry', response.responseXML);
                    var progressMap = {};
                    var reloadNotify = false;
                    loader.root = node;

                    Ext.each(jobEntrys, function(job) {
                        var jobId = dQuery.selectValue('job_id', job),
                            jobName = dQuery.selectValue('job_name', job),
                            jobStatus = dQuery.selectValue('job_status', job);
                        progressMap['backupRTRR-doing-' + jobId + '-' + jobName] = dQuery.selectValue('job_percent', job);
                        if (loader.lastStatus[jobId] != jobStatus) {
                            loader.lastStatus[jobId] = jobStatus;
                            reloadNotify = true;
                        }
                    });
                    if (reloadNotify) {
                        os.dataStore.notifyStore.reload.defer(1000, os.dataStore.notifyStore);
                    }
                    var finishStroe = Ext.StoreMgr.item(QNAP.QOS.config.S_FINISH_TASK_LIST);
                    finishStroe.suspendEvents(true);
                    finishStroe.each(function(record) {
                        var mapKey = record.data.type + '-' + record.data.uiGroup + '-' + record.data.jobID + '-' + record.data.name;
                        if (progressMap[mapKey]) {
                            record.set('progress', progressMap[mapKey]);
                        }
                    });
                    finishStroe.resumeEvents();
                    finishStroe.commitChanges();
                });
                break;
            case 'externalDeviceLoader':
                loader = new Ext.tree.TreeLoader({
                    dataUrl: '/cgi-bin/backup/extdriverequest.cgi?',
                    baseParams: {
                        subfunc: 'back_to_ext',
                        qs_act: 'loading_joblist_serverlist',
                        count: _dc,
                        sid: QNAP.QOS.user.sid
                    },
                    loading: false,
                    clearOnLoad: false,
                    datas: new Ext.util.MixedCollection(),
                    lastStatus: {}
                });
                loader.on('load', function(loader, node, response) {
                    var dQuery = Ext.DomQuery,
                        jobEntrys = dQuery.jsSelect('job_entry', response.responseXML);
                    var progressMap = {};
                    var reloadNotify = false;
                    loader.root = node;

                    Ext.each(jobEntrys, function(job) {
                        var jobId = dQuery.selectValue('job_id', job),
                            jobName = dQuery.selectValue('job_name', job),
                            jobStatus = dQuery.selectValue('job_status', job);
                        progressMap['backupExternal-doing-' + jobId + '-' + jobName] = dQuery.selectValue('job_percent', job);
                        if (loader.lastStatus[jobId] != jobStatus) {
                            loader.lastStatus[jobId] = jobStatus;
                            reloadNotify = true;
                        }
                    });
                    if (reloadNotify) {
                        os.dataStore.notifyStore.reload.defer(1000, os.dataStore.notifyStore);
                    }
                    var finishStroe = Ext.StoreMgr.item(QNAP.QOS.config.S_FINISH_TASK_LIST);
                    finishStroe.suspendEvents(true);
                    finishStroe.each(function(record) {
                        var mapKey = record.data.type + '-' + record.data.uiGroup + '-' + record.data.jobID + '-' + record.data.name;
                        if (progressMap[mapKey]) {
                            record.set('progress', progressMap[mapKey]);
                        }
                    });
                    finishStroe.resumeEvents();
                    finishStroe.commitChanges();
                });
                break;
        }
        os.treeLoader[loaderId] = loader;
        return loader;
    },
    initTask: function() {
        if (this.initTaskFlag) {
            return true;
        }

        var lib = QNAP.QOS.lib;
        var qConfig = QNAP.QOS.config,
            sitePath = QNAP.QOS.config.sitePath;
        var platformRadix = QNAP.QOS.config.platform == 'TS-NASARM' ? 1.5 : 1;
        var second = 1000,
            minute = second * 60,
            hour = minute * 60,
            sec15Timeout = second * 15 * platformRadix,
            sec30imeout = second * 30 * platformRadix;

        this.qTaskMgr = new QNAP.QOS.QTask.QTaskMgr();

        var onlineUserList = new Ext.data.XmlStore({
            loaded: false,
            url: lib.getCgiUrl(sitePath + 'sys/sysRequest.cgi'),
            storeId: QNAP.QOS.config.T_ONLINE_USERS,
            fields: ['date', 'time', 'user', 'ip', 'comp', 'share',
                'type', 'pid', 'onlineTime'
            ],
            record: 'online',
            baseParams: {
                subfunc: 'sys_logs',
                onlineuser: 1,
                getdata: 1,
                sort: 12
            },
            keepReload: true,
            interval: 10 * 1000
        });

        var diskInfo = new Ext.data.XmlStore({
            loaded: false,
            url: lib.getCgiUrl(sitePath + 'disk/qsmart.cgi'),
            storeId: QNAP.QOS.config.T_DISK_STATUS,
            HDTempWarnT: 55,
            HDTempErrT: 60,
            SSDTempWarnT: 65,
            SSDTempErrT: 70,
            fields: [{
                    name: 'diskStatus',
                    mapping: 'Disk_Status'
                },
                {
                    name: 'capacity',
                    mapping: 'Capacity'
                },
                {
                    name: 'vendor',
                    mapping: 'Vendor',
                    defaultValue: '',
                    convert: function(value, record) {
                        return value.trim();
                    }
                },
                {
                    name: 'health',
                    mapping: 'Health'
                },
                {
                    name: 'ioHealth',
                    mapping: 'io_health'
                },
                {
                    name: 'cTemperature',
                    mapping: 'Temperature > oC',
                    type: 'int',
                    defaultValue: -9999
                },
                {
                    name: 'fTemperature',
                    mapping: 'Temperature > oF',
                    type: 'int',
                    defaultValue: -9999
                },
                {
                    name: 'module_cTemperature',
                    mapping: 'module_temperature > oC',
                    type: 'int',
                    defaultValue: -9999
                },
                {
                    name: 'module_fTemperature',
                    mapping: 'module_temperature > oF',
                    type: 'int',
                    defaultValue: -9999
                },
                {
                    name: 'lastTestSts',
                    mapping: 'LastTestSts'
                },
                {
                    name: 'lastTestType',
                    mapping: 'LastTestType'
                },
                {
                    name: 'lastTestTime',
                    mapping: 'LastTestTime'
                },
                {
                    name: 'model',
                    mapping: 'Model'
                },
                {
                    name: 'serial',
                    mapping: 'Serial'
                },
                {
                    name: 'firmVersion',
                    mapping: 'FirmVersion'
                },
                {
                    name: 'ATAVersion',
                    mapping: 'ATAVersion'
                },
                {
                    name: 'HDTempWarnT',
                    type: 'int'
                },
                {
                    name: 'HDTempErrT',
                    type: 'int'
                },
                {
                    name: 'hd_is_ssd',
                    type: 'int'
                },
                {
                    name: 'disk_alias',
                    mapping: 'Disk_Alias',
                    defaultValue: ''
                },
                {
                    name: 'sort_type',
                    convert: function(value, record) {
                        var i = 0;
                        switch (Ext.DomQuery.selectValue('Disk_Alias', record, '').replace(/(SSD|M.2 SSD|Disk).*/i, '$1')) {
                            case 'M.2 SSD':
                                i = 0;
                                break;
                            case 'SSD':
                                i = 1;
                                break;
                            case 'Disk':
                                i = 2;
                                break;
                            default:
                                i = 99;
                                break;
                        }
                        return i;
                    }
                },
                {
                    name: 'JBODMode',
                    defaultValue: 0,
                    convert: function(value, record) {
                        var mode, REXP, HDNo;
                        mode = 0;
                        HDNo = Ext.DomQuery.selectValue('HDNo', record, '');
                        if (HDNo.indexOf(':') > -1) {
                            REXP = HDNo.split(':')[0];
                            if (typeof(QNAP.QOS.config.PCIeEncId) != 'undefined' && typeof(QNAP.QOS.config.PCIeEncId[REXP]) != 'undefined') {
                                mode = 0;
                            } else if (REXP !== '0') {
                                mode = 1;
                            }
                        }
                        return mode;
                    }
                },
                'HDNo', 'ATADescription',
                {
                    name: 'hd_no',
                    mapping: 'HDNo'
                }
            ],
            record: 'entry',
            sortInfo: {
                field: 'sort_type',
                direction: 'ASC'
            },
            baseParams: {
                func: 'all_hd_data'
            }
        });

        var bandwidth = new Ext.data.JsonStore({
            url: lib.getCgiUrl(sitePath + 'management/chartReq.cgi', {
                chart_func: 'bandwidth'
            }),
            storeId: QNAP.QOS.config.T_BAND_WIDTH,
            loaded: false,
            fields: ['id', 'name', {
                name: 'rx',
                mapping: 'rx',
                type: 'int'
            }, {
                name: 'tx',
                mapping: 'tx',
                type: 'int'
            }, {
                name: 'history'
            }, {
                name: 'type'
            }],
            root: 'items',
            idPath: 'id',
            _history: {}
        });

        bandwidth.reader.read = function(response) {
            var DQ, XML;
            var data, eth_count, bond_count, element, item_id;
            var current_hour, current_min, current_sec;
            var interval_sec;
            var i, l, type, type_index;
            DQ = Ext.DomQuery;
            XML = response.responseXML;
            interval_sec = DQ.selectNumber('bandwidth_interval', XML, 5);
            current_hour = DQ.selectNumber('current_hour', XML, 0);
            current_min = DQ.selectNumber('current_min', XML, 0);
            current_sec = DQ.selectNumber('current_sec', XML, 0);

            data = {
                items: [],
                def_gateway: DQ.selectValue('df_gateway', XML, '')
            };

            data.items.push({
                id: 'total',
                name: 'Total',
                rx: DQ.selectNumber('total_usage_rx', XML, 0) / interval_sec,
                tx: DQ.selectNumber('total_usage_tx', XML, 0) / interval_sec,
                type: 'total',
                type_index: 0
            });

            for (i = 0, l = DQ.selectNumber('eth_count', XML, 0); i < l; i++) {
                item_id = ['eth', i].join('');
                element = DQ.selectNode(item_id, XML);
                if (!element) {
                    continue;
                }

                type_index = i + 1;
                type = 'eth';

                if (DQ.selectNumber('is_QA_port', element, 0)) {
                    type_index = DQ.selectNumber('QA_number' + i, element, 0) + 1;
                    type = 'QA_port';
                }

                data.items.push({
                    id: item_id,
                    name: ['LAN', i + 1].join(' '),
                    rx: DQ.selectNumber('rx', element, 0) / interval_sec,
                    tx: DQ.selectNumber('tx', element, 0) / interval_sec,
                    type: type,
                    type_index: type_index
                });
            }

            type = 'wlan';
            for (i = 0, l = DQ.selectNumber('wlan_count', XML, 1); i < l; i++) {
                item_id = ['wlan', i].join('');
                element = DQ.selectNode(item_id, XML);
                if (!element) {
                    continue;
                }

                type_index = i + 1;

                data.items.push({
                    id: item_id,
                    name: ['WLAN', i + 1].join(' '),
                    rx: DQ.selectNumber('rx', element, 0) / interval_sec,
                    tx: DQ.selectNumber('tx', element, 0) / interval_sec,
                    type: type,
                    type_index: type_index
                });
            }

            type = 'tbtbr';
            for (i = 0, l = DQ.selectNumber('BridgeCount', XML, 0); i < l; i++) {
                item_id = ['tbtbr', i].join('');
                element = DQ.selectNode(item_id, XML);
                if (!element) {
                    continue;
                }

                type_index = i + 1;

                data.items.push({
                    id: item_id,
                    name: ['Thunderbolt', i + 1].join(' '),
                    rx: DQ.selectNumber('rx', element, 0) / interval_sec,
                    tx: DQ.selectNumber('tx', element, 0) / interval_sec,
                    type: type,
                    type_index: type_index
                });
            }

            type = 'bond';
            for (i = 0, l = DQ.selectNumber('bond_count', XML, 0); i < l; i++) {
                item_id = ['bond', i].join('');
                element = DQ.selectNode(item_id, XML);
                if (!element) {
                    continue;
                }

                group = DQ.selectValue('group_member', element, '').replace(/,/g, '+');
                type_index = i + 1;

                data.items.push({
                    id: item_id,
                    name: ['LAN', group].join(' '),
                    group: group.split('+'),
                    rx: DQ.selectNumber('rx', element, 0) / interval_sec,
                    tx: DQ.selectNumber('tx', element, 0) / interval_sec,
                    type: type,
                    type_index: type_index
                });
            }

            return this.readRecords(data);
        }

        var volumeList = new Ext.data.XmlStore({
            loaded: false,
            url: lib.getCgiUrl(sitePath + 'management/chartReq.cgi'),
            storeId: QNAP.QOS.config.T_VOLUME_LIST,
            fields: ['volumeStat', 'volumeDisks', 'volumeValue',
                'freeSize', 'fstype', 'volumeLabel', 'spare',
                'displayStr', 'volumeUsage', 'volumeStatus', 'volumeMngStatus', 'lvmSupport', 'Progress',
                {
                    name: 'isDefault',
                    mapping: 'is_default_volume',
                    type: Ext.data.Types.STRING,
                    defaultValue: '0'
                }, {
                    name: 'encryptfs_bool',
                    type: Ext.data.Types.INT,
                    defaultValue: 0
                }
            ],
            record: 'volumeList > volume',
            baseParams: {
                chart_func: 'disk_usage',
                disk_select: 'all',
                include: 'all'
            },
            defaultVolumeIndex: -1,
            updateVolumeLabel: function() {
                var store = this;
                store.each(function(r, index) {
                    if (!r.data.lvmSupport) {
                        var volumeStat = r.get('volumeStat');
                        var volumeDisks = r.get('volumeDisks');
                        var displayStr = '';
                        switch (volumeStat) {
                            case 'single':
                                displayStr = _S.IEI_NAS_STORAGE33;
                                break;
                            case 'linear':
                                displayStr = _S.IEI_NAS_STORAGE15;
                                break;
                            case 'strip':
                                displayStr = _S.IEI_NAS_STORAGE16;
                                break;
                            case 'mirror':
                                displayStr = _S.IEI_NAS_STORAGE17;
                                break;
                            case 'raid5':
                                displayStr = _S.IEI_NAS_STORAGE18;
                                break;
                            case 'raid6':
                                displayStr = _S.IEI_NAS_STORAGE171;
                                break;
                            case 'raid10':
                                displayStr = _S.IEI_NAS_STORAGE_RAID10_DRIVES;
                                break;
                            default:
                                displayStr = "Unknown";
                                break;
                        }
                        displayStr += ' ' + volumeDisks;
                        r.data.volumeLabel = displayStr;
                    }
                });
                this.fireEvent('updatevolumelabel', store);
            },
            getDefalutVolume: function() {
                var index = this.defaultVolumeIndex;
                if (index == -1) {
                    index = 0;
                }
                return this.getAt(index);
            }
        });
        volumeList.addEvents('updatevolumelabel');

        var sysSetting = new Ext.data.XmlStore({
            url: lib.getCgiUrl(sitePath + (QNAP.QOS.user.isAdminGroup ? 'sys/sysRequest.cgi' : 'sys/sysStandard.cgi')),
            storeId: QNAP.QOS.config.T_SYS_SETTING,
            fields: ['serverName', 'port', 'optionHF', 'hideHF',
                'SSL', 'SSLPort', 'SSLForce', 'timezone', 'day',
                'year', 'hour', 'minute', 'second', 'dn', 'month',
                'timeformat', 'ntpServer',
                'timeInterval', 'enableAdjDST', 'enableDSTtable',
                'DSTfrom', 'DSTto', 'DSToffset', 'codepage', 'serverDate', 'sleepSupport', 'raid_scrubbing_enabled',
                {
                    name: 'dateformatindex',
                    mapping: 'dateformatindex',
                    convert: function(value) {
                        return Math.max(value, 1);
                    }
                }
            ],
            record: 'func',
            baseParams: {
                subfunc: 'sys_setting'
            },
            ymdDateFormats: ['Y/m/d', 'Y.m.d', 'Y-m-d', 'm/d/Y', 'm.d.Y', 'm-d-Y', 'd/m/Y', 'd.m.Y', 'd-m-Y'],
            mdDateFormats: ['m/d', 'm.d', 'm-d', 'm/d', 'm.d', 'm-d', 'd/m', 'd.m', 'd-m']
        });

        var hardware = new Ext.data.XmlStore({
            url: lib.getCgiUrl(sitePath + 'management/manaRequest.cgi'),
            storeId: QNAP.QOS.config.T_HOST_STATUS,
            loaded: false,
            fields: [],
            record: 'root',
            cpuFanCount: 0,
            sysFanCount: 0,
            baseParams: {
                subfunc: 'sysinfo',
                hd: 'no',
                multi_cpu: 1,
                timeFlag: new Date()
            },
            listeners: {
                exception: function() {
                    this.loaded = true;
                }
            }
        });

        var doneTaskList = new Ext.data.XmlStore({
            loaded: false,
            url: lib.getCgiUrl(sitePath + 'management/manaRequest.cgi', {
                subfunc: 'sysmonitor',
                taskDonelist: 1
            }),
            storeId: QNAP.QOS.config.T_DONE_TASK_LIST,
            fields: ['displayType', 'type', 'name', 'status', 'startTime', 'startTimeSec',
                'endTime', 'endTimeSec', 'ret', 'progress', 'info',
                {
                    name: 'jobID',
                    defaultValue: -1
                }
            ],
            record: 'task',
            baseParams: {
                taskType: 0,
                rangeDay: 1
            },
            /***
             * 記錄那些項目已通知過
             * @type
             */
            alertFlags: {}
        });

        var doingTaskList = new Ext.data.XmlStore({
            loaded: false,
            url: lib.getCgiUrl(sitePath + 'management/manaRequest.cgi', {
                subfunc: 'sysmonitor',
                taskNowProcessing: 1
            }),
            storeId: QNAP.QOS.config.T_DOING_TASK_LIST,
            fields: ['displayType', 'type', 'name', 'status', 'startTime', 'startTimeSec',
                'endTime', 'endTimeSec', 'ret', 'info',
                {
                    name: 'progress',
                    defaultValue: -1,
                    type: 'int'
                },
                {
                    name: 'jobID',
                    defaultValue: -1
                },
                {
                    name: 'supportPause',
                    defaultValue: false
                },
                {
                    name: 'paused',
                    defaultValue: false
                },
                {
                    name: 'cat',
                    defaultValue: 'standard'
                }
            ],
            record: 'task',
            /***
             * 記錄那些項目已通知過
             * @type
             */
            alertFlags: {}
        });

        var finishTaskList = new Ext.data.XmlStore({
            storeId: QNAP.QOS.config.S_FINISH_TASK_LIST,
            fields: ['displayType', 'type', 'name', 'status', 'startTime', 'startTimeSec', 'endTime', 'endTimeSec', 'ret', 'progress', 'jobID', 'info',
                {
                    name: 'uiGroup',
                    defaultValue: 'done' //do/doing
                }, {
                    name: 'cat',
                    defaultValue: 'standard'
                }
            ],
            record: 'task',
            onTaskListLoad: function() {
                this.fireEvent('checkwaitdownrecord');
            }
        });
        finishTaskList.addEvents('checkwaitdownrecord');


        var extDevice = new Ext.data.XmlStore({
            sortInfo: {
                field: 'devName',
                direction: 'ASC'
            },
            url: lib.getCgiUrl(sitePath + 'devices/devRequest.cgi'),
            storeId: QNAP.QOS.config.T_EXT_DEVICE,
            fields: ['interface', 'deviceType', 'manufacturer',
                'model', 'info', 'name', 'deviceId', 'devName',
                'volumes', {
                    name: 'volumeID',
                    mapping: 'USBandSATA_ListId'
                }, {
                    name: 'isHal',
                    defaultValue: false
                }, {
                    name: 'onlyAdmin',
                    mapping: 'only_admin',
                    type: 'int',
                    defaults: 0
                }
            ],
            record: 'device',
            baseParams: {
                func: 'getExternalDev'
            }
        });

        var halExtDevice = new Ext.data.XmlStore({
            sortInfo: {
                field: 'devName',
                direction: 'ASC'
            },
            url: lib.getCgiUrl(sitePath + 'devices/devRequest.cgi'),
            storeId: QNAP.QOS.config.T_HAL_EXT_DEVICE,
            fields: [{
                    name: 'Disk_Status',
                    mapping: 'Disk_Status'
                },
                {
                    name: 'manufacturer',
                    mapping: 'Disk_Manufacture'
                },
                {
                    name: 'interface',
                    mapping: 'Disk_Type'
                },
                {
                    name: 'devName',
                    mapping: 'Disk_Path'
                },
                {
                    name: 'model',
                    mapping: 'Disk_Model'
                },
                {
                    name: 'sizeInfo',
                    mapping: 'Disk_Size_Info'
                },
                {
                    name: 'name',
                    mapping: 'Disk_List'
                },
                {
                    name: 'volumeID',
                    mapping: 'Disk_Selected'
                },
                {
                    name: 'deviceType',
                    defaultValue: 'storage'
                },
                {
                    name: 'isHal',
                    defaultValue: true
                },
                {
                    name: 'permission',
                    defaultValue: 'I'
                },
                {
                    name: 'Device_Type',
                    mapping: 'Device_Type'
                },
                {
                    name: 'isODD',
                    mapping: 'Disk_Is_ODD',
                    type: 'boolean',
                    convert: function(value) {
                        return parseInt(value) === 1;
                    }
                },
                {
                    name: 'isInsert',
                    mapping: 'Disk_In_ODD',
                    type: 'boolean',
                    convert: function(value) {
                        return parseInt(value) === 1;
                    }
                },
                {
                    name: 'onlyAdmin',
                    mapping: 'only_admin',
                    convert: function(v) {
                        var result = v !== undefined && v !== null && v !== '' ? parseInt(String(v).replace(Ext.data.Types.stripRe, ''), 10) : (this.useNull ? null : 0);
                        if (isNaN(result)) {
                            return v;
                        }
                        return result;
                    },
                    defaults: 0
                }
            ],
            record: 'Disk_Vol',
            baseParams: {
                func: 'getExternalDev'
            }
        });

        var systemHealth = new Ext.data.XmlStore({
            loaded: false,
            url: lib.getCgiUrl(sitePath + 'management/manaRequest.cgi'),
            storeId: QNAP.QOS.config.T_SYSTEM_HEALTH,
            fields: ['eventID', 'detal', 'type'],
            record: 'item',
            totalRecords: 'count',
            baseParams: {
                subfunc: 'sysinfo',
                sysHealth: 1
            },
            last_time_event: 0
        });

        var rssList = new Ext.data.XmlStore({
            url: lib.getCgiUrl(sitePath + '../RSS/rssdoc/newsrss_eng.xml'),
            storeId: QNAP.QOS.config.T_RSS,
            fields: ['title', 'description', 'category', 'guid',
                'pubDate', 'link'
            ],
            record: 'item'
        });

        var sysLog = new Ext.data.XmlStore({
            url: lib.getCgiUrl(sitePath + 'sys/sysRequest.cgi'),
            fields: ['id', 'type', 'date', 'time', 'user', 'ip', 'comp', 'desc', 'count',
                {
                    name: 'timestamp',
                    mapping: 'timet',
                    type: 'int'
                },
                {
                    name: 'logType',
                    defaultValue: 'sysLog'
                }
            ],
            record: 'event',
            totalProperty: 'count',
            storeId: Ext.id('', 'sysLog-'),
            baseParams: {
                eventlogQueryByClientTime: 1,
                count: _dc,
                sort: 13, // 排序方式 預設13 id DESC
                lower: 0, // 開始筆數
                subfunc: 'sys_logs', // 呼叫fun
                filtertype: '1,2',
                range: 30, //day
                upper: 21,
                group: 7
            },
            listeners: {
                beforeload: function(store, option) {
                    var clearAll = QNAP.QOS.user.datetime.sysLogClearAll || 0;
                    Ext.apply(option.params, {
                        startTime: clearAll
                    });
                    if (QNAP.QOS.config.demoSiteSuppurt == 'yes' && QNAP.QOS.user.account != 'admin') {
                        return false;
                    }
                }
            }
        });

        var connLog = new Ext.data.XmlStore({
            url: lib.getCgiUrl(sitePath + 'sys/sysRequest.cgi'),
            fields: ['id', 'type', 'date', 'time', 'user', 'ip', 'comp',
                'desc', 'action', 'serv', 'res', 'count',
                {
                    name: 'timestamp',
                    mapping: 'timet',
                    type: 'int'
                },
                {
                    name: 'logType',
                    defaultValue: 'connLog'
                }
            ],
            record: 'conn',
            totalProperty: 'count',
            storeId: Ext.id('', 'connLog-'),
            baseParams: {
                connlogQueryByClientTime: 1,
                count: _dc,
                sort: 13, // 排序方式 預設13 id DESC
                upper: 21, // 結束筆數
                lower: 0, // 開始筆數
                subfunc: 'sys_logs', // 呼叫fun
                filtertype: '1,2',
                range: 30, //day
                group: 1
            },
            listeners: {
                beforeload: function(store, option) {
                    var clearAll = QNAP.QOS.user.datetime.sysLogClearAll || 0;
                    Ext.apply(option.params, {
                        startTime: clearAll
                    });
                    if (QNAP.QOS.config.demoSiteSuppurt == 'yes' && QNAP.QOS.user.account != 'admin') {
                        return false;
                    }
                }
            }
        });

        var cpu_usage = new Ext.data.XmlStore({
            url: lib.getCgiUrl(sitePath + 'management/manaRequest.cgi', {
                subfunc: 'sysmonitor',
                sys_cpu_use_v2: 1,
                sys_memory_use: 1
            }),
            fields: ['cpu_total_usage', {
                name: 'memory_total',
                mapping: 'mem_total'
            }, {
                name: 'memory_free',
                mapping: 'mem_free'
            }],
            storeId: QNAP.QOS.config.T_CPU_USAGE,
            record: 'ownContent',
            cpu_reader: new Ext.data.XmlReader({
                    record: "ownContent"
                },
                Ext.data.Record.create(['cpu_total_usage'])
            ),
            memory_reader: new Ext.data.XmlReader({
                    record: "ownContent"
                },
                Ext.data.Record.create([{
                    name: 'memory_total',
                    mapping: 'mem_total'
                }, {
                    name: 'memory_free',
                    mapping: 'mem_free'
                }])),
            listeners: {
                datachanged: function(store) {
                    var first_record, memory_records, cpu_records, xml;

                    xml = store.reader.xmlData;

                    memory_records = store.memory_reader.readRecords(xml);
                    cpu_records = store.cpu_reader.readRecords(xml);
                    first_record = store.getAt(0);

                    first_record.beginEdit();
                    first_record.set('memory_total', memory_records.records[0].get('memory_total'));
                    first_record.set('memory_free', memory_records.records[0].get('memory_free'));
                    first_record.set('cpu_total_usage', cpu_records.records[0].get('cpu_total_usage'));
                    first_record.commit();
                }
            }
        });

        doneTaskList.on('load', function(store) {
            store.loaded = true;
            var displayType, jobName;
            var dq = Ext.DomQuery;
            store.each(function(r) {
                displayType = '';
                jobName = '';
                jobName = r.data.name;
                switch (r.data.type) {
                    case 'hdsmart':
                        displayType = _S.IEI_NAS_MISC13_V2;
                        jobName = _S.MISC_SMART_STR37 + jobName.replace(/\D/g, '');
                        if (QNAP.QOS.config.bIsStorageV2) {
                            var enclosureID = Ext.DomQuery.selectNumber('info > enclosureID', r.node);
                            var drive = Ext.DomQuery.selectNumber('info > drive', r.node);
                            var pd_alias = Ext.DomQuery.selectValue('info > pd_alias', r.node);

                            r.set('jobID', String.leftPad(enclosureID.toString(16), 4, '0') + String.leftPad(drive.toString(16), 4, '0'));
                            r.set('info', {
                                enclosureID: enclosureID,
                                drive: drive,
                                pd_alias: pd_alias
                            });

                            if (pd_alias && '' != pd_alias) {
                                jobName = _S.DEVICE_NAME_NAS + ': ' + pd_alias;
                            } else if (enclosureID === 0) {
                                jobName = _S.DEVICE_NAME_NAS + ': ' + _S.MISC_SMART_STR37 + ' ' + drive;
                            } else if (typeof(QNAP.QOS.config.CacheEncId) != 'undefined' && enclosureID == QNAP.QOS.config.CacheEncId) {
                                jobName = _S.DEVICE_NAME_NAS + ': ' + _S.SMB_ICP_STR002.replace('%id%', drive);
                            } else if (typeof(QNAP.QOS.config.PCIeEncId) != 'undefined' && typeof(QNAP.QOS.config.PCIeEncId[enclosureID]) != 'undefined') {
                                jobName = _S.DEVICE_NAME_NAS + ' : ' + _S.SMB_PCIE_STR001.replace('%slot%', QNAP.QOS.config.PCIeEncId[enclosureID].Slot).replace('%port%', drive);
                            } else {
                                jobName = _S.DEVICE_NAME_JBOD.replace('%n%', enclosureID) + ' ' + _S.MISC_SMART_STR37 + ' ' + drive;
                            }
                            r.set('name', jobName);
                        }
                        break;
                    case 'antiVirus':
                        displayType = _S.IEI_AV_TITLE;
                        break;
                    case 'backupExternal':
                        displayType = _S.IEI_NAS_BUTTON_BACKUP + ' - ' + _S.S_MENU_33;
                        break;
                    case 'backupRTRR':
                        displayType = _S.IEI_NAS_BUTTON_BACKUP + ' - ' + _S.BACKUP_CLIENT_STRING02;
                        break;
                    case 'backupRsync':
                        displayType = _S.IEI_NAS_BUTTON_BACKUP + ' - ' + _S.BACKUP_CLIENT_STRING01;
                        break;
                    case 'backupLUN':
                        displayType = _S.QTS_MSG_6;
                        break;
                    case 'backupAmazons3':
                        displayType = _S.IEI_NAS_BUTTON_BACKUP + ' - ' + _S.MISC_DEF_STR18;
                        break;
                }
                r.set('displayType', displayType);
            });
            store.commitChanges();
        });

        doingTaskList.on('load', function(store) {
            store.loaded = true;
            var dqSelectValue = Ext.DomQuery.selectValue,
                dqSelectNum = Ext.DomQuery.selectNumber;
            var displayType, jobName;
            var retry, // backupExternal, backupRTRR, backupRsync, backupNAStoNAS
                pidError, // backupRsync, backupNAStoNAS
                pnsRemain, // backupRsync, backupNAStoNAS
                bkTimeFinish, // backupRsync, backupNAStoNAS
                path, // mediaLibScanning, mediaLib
                paused, // mediaLibScanning, mediaLib
                statistic, // backupExternal, backupRTRR
                countdown, // backupExternal, backupRTRR
                drive, // hdsmart, blockscanning, secureearsing
                enclosureID; // hdsmart, blockscanning, secureearsing

            var facility, user, delay;
            var remain, sleep;
            var updateStatus, className, category, progress, stcode, downloadStatus, internalName;

            store.each(function(r) {
                jobName = r.data.name;
                switch (r.data.type) {
                    case 'mediaLibScanning':
                        displayType = _S.MEDIA_LIB_STR_00;
                        jobName = _S.SYSTEM_TRAY_19;
                        path = dqSelectValue('info > thGen', r.node, '');
                        remain = dqSelectValue('info > remain', r.node, '');
                        delay = dqSelectNum('info > ml_gen_thumb_delay', r.node, 0);
                        paused = dqSelectNum('info > ml_gen_thumb_status', r.node, 0) === 1;
                        sleep = dqSelectNum('info > ml_svr_sleep', r.node, 0) === 1;

                        r.set('info', {
                            path: path,
                            remain: remain,
                            delay: delay,
                            sleep: sleep
                        });
                        if (path) {
                            r.set('supportPause', true);
                            r.set('paused', paused);
                        }
                        break;
                    case 'volume':
                        displayType = _S.CHECK_FILE_SYSTEM;
                        break;
                    case 'snap replica':
                        displayType = _S.SNAPREPLICA_TREE_TITLE;
                        break;
                    case 'raid':
                        var status = Ext.DomQuery.selectNumber('status', r.node);
                        var jobID = Ext.DomQuery.selectNumber('jobID', r.node);
                        displayType = _S.VOLUME_CREATION_P4_STR02 + ": " + _S[QNAP.QOS.quickWizard.RaidStatus[status]];
                        jobName = _S.SMB_DB_POL_STR06.replace("%n%", jobID);
                        break;
                    case 'blockscanning':
                        displayType = _S.SYSTEM_TRAY_07;
                        jobName = _S.QUICK05_STR23 + ' ' + jobName.replace(/\D/g, '');

                        if (QNAP.QOS.config.bIsStorageV2) {
                            enclosureID = Ext.DomQuery.selectNumber('info > enclosureID', r.node);
                            drive = Ext.DomQuery.selectNumber('info > drive', r.node);

                            var pd_alias = dqSelectValue('info > pd_alias', r.node);

                            r.set('jobID', String.leftPad(enclosureID.toString(16), 4, '0') + String.leftPad(drive.toString(16), 4, '0'));
                            r.set('info', {
                                enclosureID: enclosureID,
                                drive: drive,
                                pd_alias: pd_alias
                            });

                            if (pd_alias && '' != pd_alias) {
                                jobName = _S.DEVICE_NAME_NAS + ': ' + pd_alias;
                            } else if (enclosureID === 0) {
                                jobName = _S.DEVICE_NAME_NAS + ': ' + _S.MISC_SMART_STR37 + ' ' + drive;
                            } else if (typeof(QNAP.QOS.config.CacheEncId) != 'undefined' && enclosureID == QNAP.QOS.config.CacheEncId) {
                                jobName = _S.DEVICE_NAME_NAS + ': ' + _S.SMB_ICP_STR002.replace('%id%', drive);
                            } else if (typeof(QNAP.QOS.config.PCIeEncId) != 'undefined' && typeof(QNAP.QOS.config.PCIeEncId[enclosureID]) != 'undefined') {
                                jobName = _S.DEVICE_NAME_NAS + ' : ' + _S.SMB_PCIE_STR001.replace('%slot%', QNAP.QOS.config.PCIeEncId[enclosureID].Slot).replace('%port%', drive);
                            } else {
                                jobName = _S.DEVICE_NAME_JBOD.replace('%n%', enclosureID) + ' ' + _S.MISC_SMART_STR37 + ' ' + drive;
                            }
                            r.set('name', jobName);
                        }

                        break;
                    case 'secureearsing':
                        displayType = _S.SECURE_ERASE_STR20;
                        jobName = _S.QUICK05_STR23 + ' ' + jobName.replace(/\D/g, '');

                        if (QNAP.QOS.config.bIsStorageV2) {
                            enclosureID = Ext.DomQuery.selectNumber('info > enclosureID', r.node);
                            drive = dqSelectValue('info > drive', r.node);

                            r.set('jobID', String.leftPad(enclosureID.toString(16), 4, '0') + String.leftPad(drive.toString(16), 4, '0'));
                            r.set('info', {
                                enclosureID: enclosureID,
                                drive: drive
                            });

                            if (enclosureID === 0) {
                                jobName = _S.DEVICE_NAME_NAS + ': ' + _S.MISC_SMART_STR37 + ' ' + drive;
                            } else if (typeof(QNAP.QOS.config.CacheEncId) != 'undefined' && enclosureID == QNAP.QOS.config.CacheEncId) {
                                jobName = _S.DEVICE_NAME_NAS + ': ' + _S.SMB_ICP_STR002.replace('%id%', drive);
                            } else if (typeof(QNAP.QOS.config.PCIeEncId) != 'undefined' && typeof(QNAP.QOS.config.PCIeEncId[enclosureID]) != 'undefined') {
                                jobName = _S.DEVICE_NAME_NAS + ' : ' + _S.SMB_PCIE_STR001.replace('%slot%', QNAP.QOS.config.PCIeEncId[enclosureID].Slot).replace('%port%', drive);
                            } else {
                                jobName = _S.DEVICE_NAME_JBOD.replace('%n%', enclosureID) + ' ' + _S.MISC_SMART_STR37 + ' ' + drive;
                            }
                            r.set('name', jobName);
                        }

                        break;
                    case 'hdsmart':
                        displayType = _S.IEI_NAS_MISC13_V2;
                        jobName = _S.MISC_SMART_STR37 + jobName.replace(/\D/g, '');
                        if (QNAP.QOS.config.bIsStorageV2) {
                            enclosureID = Ext.DomQuery.selectNumber('info > enclosureID', r.node);
                            drive = dqSelectValue('info > drive', r.node);
                            var pd_alias = dqSelectValue('info > pd_alias', r.node);
                            r.set('jobID', String.leftPad(enclosureID.toString(16), 4, '0') + String.leftPad(drive.toString(16), 4, '0'));
                            r.set('info', {
                                enclosureID: enclosureID,
                                drive: drive,
                                pd_alias: pd_alias
                            });

                            if (pd_alias && '' != pd_alias) {
                                jobName = _S.DEVICE_NAME_NAS + ': ' + pd_alias;
                            } else if (enclosureID === 0) {
                                jobName = _S.DEVICE_NAME_NAS + ': ' + _S.MISC_SMART_STR37 + ' ' + drive;
                            } else if (typeof(QNAP.QOS.config.CacheEncId) != 'undefined' && enclosureID == QNAP.QOS.config.CacheEncId) {
                                jobName = _S.DEVICE_NAME_NAS + ': ' + _S.SMB_ICP_STR002.replace('%id%', drive);
                            } else if (typeof(QNAP.QOS.config.PCIeEncId) != 'undefined' && typeof(QNAP.QOS.config.PCIeEncId[enclosureID]) != 'undefined') {
                                jobName = _S.DEVICE_NAME_NAS + ' : ' + _S.SMB_PCIE_STR001.replace('%slot%', QNAP.QOS.config.PCIeEncId[enclosureID].Slot).replace('%port%', drive);
                            } else {
                                jobName = _S.DEVICE_NAME_JBOD.replace('%n%', enclosureID) + ' ' + _S.MISC_SMART_STR37 + ' ' + drive;
                            }
                            r.set('name', jobName);
                        }
                        break;
                    case 'antiVirus':
                        displayType = _S.IEI_AV_TITLE;
                        break;
                    case 'backupExternal':
                        displayType = _S.IEI_NAS_BUTTON_BACKUP + ' - ' + _S.S_MENU_33;
                        retry = dqSelectValue('info > job_retry', r.node);
                        statistic = dqSelectValue('info > job_statistic', r.node);
                        countdown = dqSelectValue('info > job_countdown', r.node);
                        r.set('info', {
                            retry: retry,
                            countdown: countdown,
                            statistic: statistic
                        });
                        break;
                    case 'backupRTRR':
                        displayType = _S.IEI_NAS_BUTTON_BACKUP + ' - ' + _S.BACKUP_CLIENT_STRING02;
                        retry = dqSelectValue('info > job_retry', r.node);
                        statistic = dqSelectValue('info > job_statistic', r.node);
                        countdown = dqSelectValue('info > job_countdown', r.node);
                        r.set('info', {
                            retry: retry,
                            countdown: countdown,
                            statistic: statistic
                        });
                        break;
                    case 'backupRsync':
                        displayType = _S.IEI_NAS_BUTTON_BACKUP + ' - ' + _S.BACKUP_CLIENT_STRING01;
                        bkTimeFinish = dqSelectValue('info > bktime_finish', r.node);
                        pidError = dqSelectValue('info > pidError', r.node);
                        pnsRemain = dqSelectValue('info > pnsRemain', r.node);
                        retry = dqSelectValue('info > job_retry', r.node);
                        r.set('info', {
                            retry: retry,
                            bkTimeFinish: bkTimeFinish,
                            pidError: pidError,
                            pnsRemain: pnsRemain
                        });
                        break;
                    case 'backupNAStoNAS':
                        displayType = _S.IEI_NAS_BUTTON_BACKUP + ' - ' + _S.MISC_SCH_TITLE_STR26;
                        bkTimeFinish = dqSelectValue('info > bktime_finish', r.node);
                        pidError = dqSelectValue('info > pidError', r.node);
                        pnsRemain = dqSelectValue('info > pnsRemain', r.node);
                        retry = dqSelectValue('info > job_retry', r.node);
                        r.set('info', {
                            retry: retry,
                            bkTimeFinish: bkTimeFinish,
                            pidError: pidError,
                            pnsRemain: pnsRemain
                        });
                        break;
                    case 'backupLUN':
                        displayType = _S.QTS_LUN_MSG_1;
                        break;
                    case 'backupAmazons3':
                        displayType = _S.IEI_NAS_BUTTON_BACKUP + ' - ' + _S.MISC_DEF_STR18;
                        break;
                    case 'mediaLib':
                        facility = dqSelectValue('info > facility', r.node);
                        user = dqSelectValue('info > user', r.node);
                        delay = dqSelectNum('info > ts_svr_delay', r.node, 0);
                        paused = dqSelectNum('info > ts_svr_status', r.node, 0) === 2;
                        path = dqSelectValue('info > path', r.node);
                        sleep = dqSelectNum('info > ts_svr_sleep', r.node, 0) === 1;
                        r.set('info', {
                            path: path,
                            facility: facility,
                            user: user,
                            delay: delay,
                            sleep: sleep
                        });
                        r.set('supportPause', facility === '15' ? true : false);
                        r.set('paused', paused);
                        break;
                    case 'appCenter':
                        updateStatus = dqSelectNum('info > updateStatus', r.node, 0);
                        downloadStatus = dqSelectNum('info > downloadStatus', r.node, 0);
                        className = dqSelectValue('info > className', r.node);
                        category = dqSelectNum('info > category', r.node, 0);
                        stcode = dqSelectNum('info > stcode', r.node, 0);
                        operation = dqSelectNum('info > operation', r.node, 0);
                        progress = r.get('progress');
                        internalName = r.get('name');
                        if (r.data.status === '1') {
                            switch (updateStatus) {
                                case 0:
                                    progress = 20;
                                    break;
                                case 1:
                                    progress = 50;
                                    break;
                                case 2:
                                    progress = 80;
                                    break;
                                case 3:
                                    progress = 100;
                                    break;
                                default:
                                    progress = 0;
                                    break;
                            }
                        }
                        if (stcode === 3 || stcode === 7) {
                            r.set('status', '2');
                            progress = 0;
                        }
                        r.set('progress', progress);
                        r.set('info', {
                            updateStatus: updateStatus,
                            downloadStatus: downloadStatus,
                            className: className,
                            category: category,
                            stcode: stcode,
                            internalName: internalName,
                            operation: operation
                        });
                        var qpkgInfo = os.qpkgInfoStore.query('internalName', new RegExp('^' + RegExp.escape(internalName) + '$', 'i')).itemAt(0);
                        if (qpkgInfo) {
                            r.set('name', qpkgInfo.get('name'));
                        }
                        break;
                }
                r.set('displayType', displayType);
            });
            store.commitChanges();

            Ext.each(
                Ext.DomQuery.select('extra_task', store.reader.xmlData),
                function(extraTaskNode) {
                    os.addExtraTask(
                        dqSelectValue('app_name', extraTaskNode),
                        dqSelectValue('cgi', extraTaskNode));
                });

        });

        /**
         * update Backup Station task progress
         */
        doingTaskList.on('load', function(store) {
            var rtrrTreeRoot = os.initTreeLoader('rtrrTreeLoader').root;
            var extDevRoot = os.initTreeLoader('externalDeviceLoader').root;
            var rrStore = os.initStore('rrStore'); // NAS to NAS Rsync
            var refreshRtrr = false,
                refreshExtDev = false;
            store.each(function(record) {
                var type = record.data.type;
                var jobID = record.data.jobID;
                var name = record.data.name;
                switch (type) {
                    case 'mediaLibScanning':
                    case 'volume':
                    case 'snap replica':
                    case 'blockscanning':
                    case 'secureearsing':
                    case 'hdsmart':
                    case 'antiVirus':
                    case 'backupLUN':
                    case 'backupAmazons3':
                    case 'mediaLib':
                        break;
                    case 'backupRsync':
                    case 'backupNAStoNAS':
                        rrStore.suspendEvents();
                        rrStore.each(function(_record) {
                            var pid = _record.data.bk_pid;
                            var _name = _record.data.name;
                            if (pid == jobID && name == _name) {
                                _record.set('piProgress', record.data.progress);
                            }
                        });

                        rrStore.resumeEvents();
                        rrStore.commitChanges();
                        break;
                    case 'backupExternal':
                        if (extDevRoot) {
                            extDevRoot.findChildBy(function(node) {
                                if (name == node.attributes.job_name &&
                                    jobID == node.attributes.job_id) {
                                    refreshExtDev = true;
                                    node.attributes.job_percent = record.data.progress;
                                }
                            }, null, true);
                        }
                        break;
                    case 'backupRTRR':
                        if (rtrrTreeRoot) {
                            rtrrTreeRoot.findChildBy(function(node) {
                                if (name == node.attributes.job_name &&
                                    jobID == node.attributes.job_id) {
                                    refreshRtrr = true;
                                    node.attributes.job_percent = record.data.progress;
                                }
                            }, null, true);
                        }
                        break;
                }
            });
            if (refreshRtrr && rtrrTreeRoot.ownerTree) {
                rtrrTreeRoot.ownerTree.refresh();
            }
            if (refreshExtDev && extDevRoot.ownerTree) {
                extDevRoot.ownerTree.refresh();
            }

        });

        /**
         * 加入finishTaskList
         */
        doingTaskList.on('load', function(store, records) {
            finishTaskList.suspendEvents(false);
            store.each(function(record) {
                var type = record.data.type,
                    name = record.data.name,
                    jobID = record.data.jobID,
                    /**
                     * facility 目前只有mediaLib 回傳
                     * @type {int}
                     * [15] - off-line transcode
                     * [16] - on-the-fly transcode
                     */
                    facility = type == 'mediaLib' ? record.data.info.facility : '';

                var num = finishTaskList.findBy(function(r) {
                    if (r.data.type == type) {
                        if (type == 'mediaLib' && facility == '15' && (r.data.paused !== record.data.paused || r.data.uiGroup == 'done' || r.data.jobID != jobID)) {
                            r.data.lockMask = false;
                        } else if (type != 'mediaLib' && r.data.name == name) {
                            r.data.lockMask = false;
                        }
                    }

                    if (r.data.type == type) {
                        var isExist = false;
                        if (type == 'mediaLib') {
                            if (r.data.info.facility == '15' && facility == '15') {
                                isExist = true;
                            } else if (r.data.info.facility == '16' && facility == '16' && r.data.jobID == jobID) {
                                isExist = true;
                            }
                        } else if (r.data.name == name && r.data.jobID == jobID) {
                            isExist = true;
                        }

                        if (isExist) {
                            Ext.apply(r.data, record.data);
                            r.set('uiGroup', 'doing');
                            return true;
                        }
                    }
                });

                if (num == -1) {
                    var newR = record.copy();
                    newR.set('uiGroup', 'doing');
                    finishTaskList.add(newR);
                }
            });
            var removeList = [];
            var type = '';
            finishTaskList.each(function(finishRec, index) {
                if (finishRec.get('cat') !== 'standard') {
                    return true;
                }
                var num = store.findBy(function(doingRec) {
                    var doingData = doingRec.data,
                        finishData = finishRec.data;
                    if (doingData.type == finishData.type) {
                        var isExist = false;
                        if (doingData.type == 'mediaLib') {
                            if (doingData.info.facility == '15' && finishData.info.facility == '15') {
                                isExist = true;
                            } else if (doingData.info.facility == '16' && finishData.info.facility == '16' && doingData.jobID == finishData.jobID) {
                                isExist = true;
                            }
                        } else if (doingData.name == finishData.name && doingData.jobID == finishData.jobID) {
                            isExist = true;
                        }

                        if (isExist) {
                            return true;
                        }
                    }
                });
                if (num == -1) {
                    type = finishRec.get('type');
                    if (type == 'mediaLib' && finishRec.get('info').facility == '16') {
                        removeList.push(finishRec);
                    } else if (type === 'mediaLibScanning' || type === 'appCenter' || type === 'backupRTRR_IL') {
                        removeList.push(finishRec);
                    } else {
                        finishRec.beginEdit();
                        if (finishRec.get('uiGroup') == 'doing') {
                            finishRec.set('uiGroup', 'waitDone');
                        }
                        if (type === 'mediaLib' && finishRec.get('info').facility == '15') {
                            finishRec.set('uiGroup', 'done');
                        }
                        if (type === 'blockscanning') {
                            finishRec.set('status', 0);
                        }
                        if (type === 'secureearsing') {
                            finishRec.set('status', 0);
                        }
                        finishRec.endEdit();
                    }
                }
            });
            finishTaskList.remove(removeList);
            finishTaskList.sort('endTimeSec', 'DESC');
            finishTaskList.singleSort('uiGroup', 'ASC');
            finishTaskList.resumeEvents();
            finishTaskList.fireEvent('datachanged', finishTaskList);
            finishTaskList.commitChanges();
            /**
             * Medialib transcode pause status
             * 1 = pause
             * 0 = transcodeing or waitting
             */
            finishTaskList.medialibTCSPause = Ext.DomQuery.selectNumber('medialibTCSPause', store.reader.xmlData, 0);
            store.commitChanges();

        });

        doneTaskList.on('load', function(store) {
            var type, name, jobID, num, isDoing, finishRecord;

            store.each(function(record) {
                type = record.get('type');
                name = record.get('name');
                jobID = record.get('jobID');
                num = finishTaskList.findBy(function(finishRecord) {
                    if (finishRecord.get('type') == type) {
                        if (finishRecord.get('name') == name && finishRecord.get('jobID') == jobID) {
                            Ext.apply(finishRecord.data, record.data);
                            return true;
                        } else if (type == "mediaLib") {
                            Ext.apply(finishRecord.data, record.data);
                            return true;
                        }
                    }
                });

                isDoing = doingTaskList.findBy(function(doingRecord) {
                    if (doingRecord.get('type') == type &&
                        (type == "mediaLib" || doingRecord.get('name') == name)) {
                        Ext.apply(doingRecord.data, record.data);
                        return true;
                    }
                });
                if (num >= 0) {
                    var finishRecord = finishTaskList.getAt(num);
                    finishRecord.beginEdit();
                    finishRecord.set('uiGroup', 'done');
                    finishRecord.set('status', record.get('status'));
                    finishRecord.set('endTime', record.get('endTime'));
                    finishRecord.set('endTimeSec', record.get('endTimeSec'));
                    finishRecord.endEdit();
                }
            });
            finishTaskList.suspendEvents(false);
            finishTaskList.sort('endTimeSec', 'DESC');
            finishTaskList.singleSort('uiGroup', 'ASC');
            finishTaskList.resumeEvents();
            finishTaskList.fireEvent('datachanged', finishTaskList);
            finishTaskList.commitChanges();
        });

        doneTaskList.on('load', finishTaskList.onTaskListLoad, finishTaskList);
        doingTaskList.on('load', finishTaskList.onTaskListLoad, finishTaskList);

        diskInfo.on('datachanged', function(store) {
            store.loaded = true;

            var installed, empty, hddDataHAL, HDTempWarnT, HDTempErrT, SSDTempWarnT, SSDTempErrT,
                nEcnId, hd_no, selectNumber, xmlData, config;
            var statusList, idList, nStatus, recordData;

            config = QNAP.QOS.config;
            selectNumber = Ext.DomQuery.selectNumber;
            xmlData = store.reader.xmlData;

            installed = 0;
            empty = 0;
            hddDataHAL = [];
            statusList = {
                NO_DATA: 0,
                OK: 1,
                Normal: 2,
                Abnormal: 3
            };

            HDTempWarnT = selectNumber('HDTempWarnT', xmlData, 55);
            HDTempErrT = selectNumber('HDTempErrT', xmlData, 60);
            SSDTempWarnT = selectNumber('SSDTempWarnT', xmlData, 65);
            SSDTempErrT = selectNumber('SSDTempErrT', xmlData, 70);
            nEcnId = Ext.DomQuery.selectValue('CacheEncId', xmlData);

            if (nEcnId && nEcnId > 0) {
                config.CacheEncId = nEcnId;
            }

            store.HDTempWarnT = HDTempWarnT;
            store.HDTempErrT = HDTempErrT;
            store.SSDTempWarnT = SSDTempWarnT;
            store.SSDTempErrT = SSDTempErrT;

            store.each(function(r, index) {
                recordData = r.data;
                hd_no = r.get('HDNo');
                if (hd_no.indexOf(':') > -1) {
                    config.bIsHalSupport = true;

                    idList = hd_no.split(':');
                    nStatus = r.get('diskStatus') == '-5' ? 0 : statusList[r.get('health')];
                    idList[0] = parseInt(idList[0], 10);
                    idList[1] = parseInt(idList[1], 10);
                    if (nEcnId && nEcnId == idList[0]) {
                        idList[0] = 0;
                    }
                    if (config.PCIeEncId && config.PCIeEncId[idList[0]]) {
                        if (!r.get('disk_alias')) {
                            recordData.disk_alias = _S.SMB_PCIE_STR001.replace('%slot%', QNAP.QOS.config.PCIeEncId[idList[0]].Slot).replace('%port%', idList[1]);
                        }
                        idList[0] = 0;
                    }
                    if (!hddDataHAL[idList[0]]) {
                        hddDataHAL[idList[0]] = [0, 0, 0, 0];
                    }
                    hddDataHAL[idList[0]][0]++;
                    if (nStatus > 0) {
                        hddDataHAL[idList[0]][1]++;
                    }
                    if (nStatus > hddDataHAL[idList[0]][2]) {
                        hddDataHAL[idList[0]][2] = nStatus;
                    }
                    if (r.get('vendor') === 'QNAP ISCSI') {
                        hddDataHAL[idList[0]][3] = 2;
                    }
                }

                recordData.HDTempErrT = HDTempErrT;
                recordData.HDTempWarnT = HDTempWarnT;
                recordData.HDNo = index + 1;
                if (!r.get('disk_alias')) {
                    recordData.disk_alias = r.get('HDNo');
                }

                if (r.get('capacity')) {
                    installed++;
                } else {
                    empty++;
                }
                r.node = null;
                delete r.node;
            });

            config.installedBay = installed;
            config.emptyBay = empty;

            if (config.bIsHalSupport) {
                config.hddDataHAL = hddDataHAL;
            }
            store.reader.xmlData = undefined;
        });

        onlineUserList.on('datachanged', function(store) {
            store.loaded = true;
            var servSet = Ext.StoreMgr.item(QNAP.QOS.config.T_SYS_SETTING).getAt(0);
            if (Ext.isEmpty(servSet)) {
                return;
            }
            var serverDt = os.desktop.clocks.systemDateTime.getTime();
            var date, time, diffMs, dt;
            store.each(function(r) {
                date = r.get('date');
                time = r.get('time');
                dt = Date.parseDate(date + " " + time, "Y-m-d H:i:s");
                diffMs = serverDt.getElapsed(dt);
                r.data.onlineTime = diffMs;
                delete r.node;
            });
            store.commitChanges();
            servSet.set('sleepSupport', Ext.DomQuery.selectValue('sleepSupport', store.reader.xmlData, '0') == '3');
            Ext.StoreMgr.item(QNAP.QOS.config.T_SYS_SETTING).commitChanges();
            delete store.reader.xmlData;
        });

        volumeList.on('load', function(store, records) {
            store.loaded = true;

            var dq = Ext.DomQuery;
            var xmlData = store.reader.xmlData;
            var vddList = [];
            store.defaultVolumeIndex = -1;
            Ext.each(records, function(r, index) {
                var volumeStat = r.get('volumeStat'),
                    volumeValue = r.get('volumeValue'),
                    isDefault = r.get('isDefault');
                if (volumeStat == 'vdd') {
                    vddList.push(r);
                }
                if (isDefault === '1') {
                    store.defaultVolumeIndex = index;
                }
                var nodes = dq.jsSelect('volumeUseList > volumeUse', xmlData);
                Ext.each(nodes, function(node) {
                    if (dq.selectValue('volumeValue', node) == volumeValue) {
                        r.set('volumeUsage', node);
                        return false;
                    }
                });
            });
            store.remove(vddList);
            store.each(function(r) {
                r.data.lvmSupport = QNAP.QOS.config.bIsStorageV2;
            });
            store.updateVolumeLabel();
            store.commitChanges();
        });

        os.on('resetlang', volumeList.updateVolumeLabel, volumeList);

        systemHealth.on('load', function(store) {
            store.loaded = true;
            var xmlData = store.reader.xmlData,
                dq = Ext.DomQuery;
            store.sysStatus = dq.selectValue('sysHealth status', xmlData);
            store.suspendEvents();
            store.each(function(r) {
                var detal = {
                    hddNO: dq.selectValue('hddNO', r.node),
                    /**
                     * disk alias, if has value, use this value to display.
                     * @type {String}
                     * @since QTS 4.2.2
                     */
                    disk_alias: dq.selectValue('Disk_Alias', r.node, ''),
                    volumeStat: dq.selectValue('volumeStat', r.node),
                    volumeDisks: dq.selectValue('volumeDisks', r.node),
                    volumeValue: dq.selectValue('volumeValue', r.node),
                    powerNO: dq.selectValue('powerNO', r.node),
                    fanNO: dq.selectValue('fanNO', r.node, ''),
                    hostNO: dq.selectValue('hostNO', r.node),
                    poolID: dq.selectValue('poolID', r.node),
                    raidID: dq.selectValue('raidID', r.node),
                    status: dq.selectValue('status', r.node),
                    interfaceMember: dq.selectValue('interfaceMember', r.node),
                    interfaceId: dq.selectValue('interfaceId', r.node),
                    /* Spec #11319, Bug #99328 */
                    fan_type: dq.selectValue('fan_type', r.node),
                    pcie_slot: dq.selectValue('pcie_slot', r.node),
                    volume_list: []
                };
                var displayStr = '';

                if (QNAP.QOS.config.bIsStorageV2) {
                    if (detal.volumeStat && detal.volumeStat.indexOf(':') != -1) {
                        detal.volumeName = _S.SMB_DB_POL_STR06.replace('%n%', detal.volumeStat.split(':')[1]);
                    } else if (detal.volumeValue && detal.volumeValue.indexOf(':') != -1) {
                        detal.volumeName = detal.volumeValue.split(':')[0];
                    }
                    if (detal.volumeDisks && detal.volumeDisks.trim().indexOf(QNAP.QOS.config.VJBOD_ENC_ID + ':') === 0) {
                        detal.volumeName += ' (' + _S.SMB_VIRTUAL_DISK_MENU + ')';
                    }
                } else {
                    switch (detal.volumeStat) {
                        case 'single':
                            displayStr = _S.IEI_NAS_STORAGE33;
                            break;
                        case 'linear':
                            displayStr = _S.IEI_NAS_STORAGE15;
                            break;
                        case 'strip':
                            displayStr = _S.IEI_NAS_STORAGE16;
                            break;
                        case 'mirror':
                            displayStr = _S.IEI_NAS_STORAGE17;
                            break;
                        case 'raid5':
                            displayStr = _S.IEI_NAS_STORAGE18;
                            break;
                        case 'raid6':
                            displayStr = _S.IEI_NAS_STORAGE171;
                            break;
                        case 'raid10':
                            displayStr = _S.IEI_NAS_STORAGE_RAID10_DRIVES;
                            break;
                        default:
                            displayStr = "Unknown";
                            break;
                    }

                    displayStr += ' ' + detal.volumeDisks;
                    detal.volumeName = displayStr;
                }

                r.set('detal', detal);
            });
            store.resumeEvents();
            store.commitChanges();
            delete store.reader.xmlData;
        });

        hardware.on('load', function(store) {
            store.loaded = true;
            var config, selectNumber, reader, recordsEx, i;
            var tmpFields = [{
                    name: 'cpuUsage',
                    mapping: 'cpu_usage'
                }, {
                    name: 'totalMemory',
                    mapping: 'total_memory',
                    type: 'int'
                }, {
                    name: 'freeMemory',
                    mapping: 'free_memory',
                    type: 'int'
                }, {
                    name: 'uptimeDay',
                    mapping: 'uptime_day'
                }, {
                    name: 'uptimeHour',
                    mapping: 'uptime_hour'
                }, {
                    name: 'uptimeMin',
                    mapping: 'uptime_min'
                }, {
                    name: 'uptimeSec',
                    mapping: 'uptime_sec'
                }, {
                    name: 'cpuTempC',
                    mapping: 'cpu_tempc',
                    type: 'int'
                }, {
                    name: 'cpuTempF',
                    mapping: 'cpu_tempf',
                    type: 'int'
                }, {
                    name: 'cpuTempWarnT',
                    mapping: 'CPUTempWarnT',
                    type: 'int',
                    defaultValue: 62
                }, {
                    name: 'cpuTempErrT',
                    mapping: 'CPUTempErrT',
                    type: 'int',
                    defaultValue: 85
                }, {
                    name: 'sysTempC',
                    mapping: 'sys_tempc',
                    type: 'int'
                }, {
                    name: 'sysTempF',
                    mapping: 'sys_tempf',
                    type: 'int'
                }, {
                    name: 'sysTempWarnT',
                    mapping: 'SysTempWarnT',
                    type: 'int',
                    defaultValue: 57
                }, {
                    name: 'sysTempErrT',
                    mapping: 'SysTempErrT',
                    type: 'int',
                    defaultValue: 70
                }, {
                    name: 'serialNumber',
                    mapping: 'serial_number'
                }, {
                    name: 'serverName',
                    mapping: 'server_name'
                }, 'nic', 'disk', 'SSDTempWarnT', 'SSDTempErrT',
                {
                    name: 'has_VJBOD',
                    type: 'boolean',
                    defaultValue: false
                },
                'VJBOD_enc_id', 'VJBOD_max_disk', 'VJBOD_crnt_disk', 'VJBOD_status'
            ];

            config = QNAP.QOS.config;
            selectNumber = Ext.DomQuery.selectNumber;
            xmlData = store.reader.xmlData;

            store.sysFanCount = selectNumber('sysfan_count', xmlData);
            store.cpuFanCount = selectNumber('cpufan_count', xmlData, 0);
            config.sysFan = store.sysFanCount;
            config.cpusFan = store.cpuFanCount;

            for (i = 1; i <= store.cpuFanCount; i++) {
                tmpFields.push({
                    name: 'cpuFan' + i,
                    mapping: 'cpufan' + i
                });
                tmpFields.push({
                    name: 'cpuFan' + i + 'Stat',
                    mapping: 'fan_fail' + i
                });
            }
            for (i = 1; i <= store.sysFanCount; i++) {
                tmpFields.push({
                    name: 'sysFan' + i,
                    mapping: 'sysfan' + i
                });
                tmpFields.push({
                    name: 'sysFan' + i + 'Stat',
                    mapping: 'sysfan' + i + '_stat'
                });
            }

            delete store.reader.ef;
            reader = store.reader;
            reader.meta.fields = tmpFields;
            reader.recordType = Ext.data.Record.create(tmpFields);
            reader.buildExtractors();

            store.recordType = reader.recordType;
            store.fields = store.recordType.prototype.fields;
            recordsEx = reader.extractData(Ext.DomQuery.select(reader.meta.record, reader.xmlData), true); // <-- true to return Ext.data.Record[]
            store.removeAll();
            store.add(recordsEx);
        }, hardware, {
            single: true
        });

        hardware.on('load', function(store) {
            store.loaded = true;
            var xmlData = store.reader.xmlData,
                dq = Ext.DomQuery,
                record = store.getAt(0),
                reader = store.reader,
                rexpRow;

            if (dq.selectNumber('authPassed', xmlData) != 1) {
                return;
            }
            record.beginEdit();

            rexpRow = Ext.DomQuery.jsSelect('rexp row', reader.xmlData);
            Ext.each(rexpRow, function(row) {
                var DomQuery = Ext.DomQuery,
                    STATUS_MAP = {
                        'good': 'OK',
                        'warn': 'Normal',
                        'error': 'Abnormal'
                    };
                var status;

                if (DomQuery.selectNumber('encID', row) === QNAP.QOS.config.VJBOD_ENC_ID) {
                    record.set('has_VJBOD', true);
                    record.set('VJBOD_enc_id', DomQuery.selectNumber('encID', row));
                    record.set('VJBOD_max_disk', DomQuery.selectNumber('max_disk_num', row));
                    record.set('VJBOD_crnt_disk', DomQuery.selectNumber('crnt_disk_num', row));
                    record.set('VJBOD_status', STATUS_MAP[DomQuery.selectValue('status', row)] || 'NO_DATA');
                    return false;
                }
            });

            var uptime = new Date();
            uptime.setMinutes(record.get('uptimeMin'));
            uptime.setHours(record.get('uptimeHour'));
            uptime.setSeconds(record.get('uptimeSec'));
            record.data.uptime = uptime;
            record.commit(true);
            store.commitChanges();
        });

        extDevice.on('load', function(store) {
            var removeList = [];
            var xmlData = store.reader.xmlData;
            var _halExtDevice = Ext.StoreMgr.item(QNAP.QOS.config.T_HAL_EXT_DEVICE);

            _halExtDevice.loadData(xmlData);
            if (_halExtDevice.getCount() > 0) {
                store.insert(0, _halExtDevice.getRange());
            }

            var _halEncDevice = Ext.StoreMgr.item(QNAP.QOS.config.T_HAL_ENC_DEVICE);
            if (_halEncDevice) {
                store.each(function(_record) {
                    if (_record.get('interface') == 'JBOD') {
                        store.remove(_record);
                    }
                });

                if (_halEncDevice.getCount() > 1) {
                    _halEncDevice.each(function(_record) {
                        if (_record.get('enclosureID') != '0') {
                            Ext.apply(_record.data, {
                                'interface': 'JBOD'
                            });
                        }
                    });
                    store.insert(0, _halEncDevice.getRange(1));
                }
            }

            /**
             * 找出與 client 端記錄不符的裝置
             */
            Ext.each(os.extDeviceList, function(deviceId) {
                var index = store.findBy(function(r) {
                    if ((r.data.devName + ' - ' + r.data.model) == deviceId) {
                        r.data.passPromptWin = true;
                        return true;
                    }
                    var subVolums = false;
                    Ext.each(r.data.volumns, function(v) {
                        if (v.devName + ' - ' + v.model == deviceId) {
                            subVolums = true;
                            return false;
                        }
                    });
                    return subVolums;
                });
                if (index == -1) {
                    removeList.push(deviceId);
                }
            });

            /**
             * 移除與 clinet 端不符的裝置
             */
            Ext.each(removeList, function(removeId) {
                os.extDeviceList.remove(removeId);
                if (!store.silent) {
                    os.fireEvent('filechange', 'os', '/', '/', removeId, 'delete');
                }
            });

            /**
             * 新增裝置並跳出訊息
             */
            store.each(function(r) {
                var keyName = r.data.devName + ' - ' + r.data.model;
                if (os.extDeviceList.indexOf(keyName) == -1) {
                    if (r.data.deviceType == "storage") {
                        Ext.each(r.data.volumns, function(v) {
                            os.extDeviceList.push(v.devName + ' - ' + v.model);
                            if (!store.silent) {
                                os.fireEvent('filechange', 'os', '/', '/', v.devName, 'add');
                            }
                        });
                    } else {
                        os.extDeviceList.push(keyName);
                    }
                }
            });
            store.commitChanges();
        });

        halExtDevice.on('datachanged', function(store) {
            var devNameList = {},
                removeList = [];

            var _devName;
            var recordData;
            store.each(function(record) {
                recordData = record.data;
                switch (recordData.deviceType) {
                    case 'storage':
                        recordData.info = {
                            capacity: recordData.sizeInfo,
                            permission: recordData.permission,
                            onlyAdmin: recordData.onlyAdmin
                        };

                        if (recordData.isODD) {
                            if (recordData.name !== '--' || recordData.permission !== '--' ||
                                recordData.onlyAdmin !== '--' || recordData.sizeInfo !== '0 Bytes / 0 Bytes') {
                                recordData.isInsert = true;
                            }
                        }
                        /* Bug#97319, only compare devName begins 8 character. Ex: "/dev/sde" */
                        _devName = recordData.devName.replace(/mapper\//, '').substring(0, 8);


                        if (devNameList[_devName]) {
                            removeList.push(record);
                            devNameList[_devName].data.volumns.push(recordData);
                        } else {
                            recordData.volumns = [recordData];
                            devNameList[_devName] = record;
                        }
                        switch (recordData.Disk_Status) {
                            case 'IEI_DEVICE_MSG30':
                                recordData.info.status = -5;
                                break; //SS_NOT_EXIST     V.S. S_NOT_EXIST
                            case 'IEI_DEVICE_MSG31':
                                recordData.info.status = 0;
                                break; //SS_READY         V.S. S_READY
                            case 'IEI_DEVICE_MSG18':
                                recordData.info.status = 1;
                                break; //SS_INITIALIZING  V.S. S_INITIALIZING
                            case 'IEI_DEVICE_MSG26':
                                recordData.info.status = 2;
                                break; //SS_FORMATTING    V.S. S_FORMATTING
                            case 'IEI_DEVICE_MSG34':
                                recordData.info.status = -3;
                                break; //SS_NOT_MOUNTED   V.S. S_NOT_MOUNTED
                            case 'IEI_DEVICE_MSG32':
                                recordData.info.status = -1;
                                break; //SS_UNINITIALIZE  V.S. S_UNINITIALIZE
                            case 'IEI_DEVICE_MSG33':
                                recordData.info.status = -2;
                                break; //SS_NOT_ACTIVE    V.S. S_NOT_ACTIVE
                            case 'IEI_DEVICE_MSG61':
                                recordData.info.status = -13;
                                break; //SS_STOPPING      V.S. S_STOPPING
                            default:
                                recordData.info.status = -4;
                                break; //default          V.S. S_UNKNOW_ERROR
                        }
                        break;
                }
            });
            store.remove(removeList);
            store.commitChanges();
        });

        extDevice.on('datachanged', function(store) {
            var devNameList = {},
                removeList = [],
                dq = Ext.DomQuery;

            var capacity, status, permission, _devName;
            store.each(function(r) {
                switch (r.data.deviceType) {
                    case 'storage':
                        capacity = dq.selectNumber('capacity', r.node) * 1024;
                        status = dq.selectNumber('status', r.node);
                        permission = dq.selectValue('permission', r.node, 'I');

                        r.data.info = {
                            capacity: Ext.util.Format.fileSize(capacity, _S.IEI_NAS_SYSINFO_KB),
                            status: status,
                            permission: permission,
                            onlyAdmin: r.data.onlyAdmin
                        };

                        _devName = r.data.devName.replace(/\d*/g, '').replace(/mapper\//, '');
                        if (devNameList[_devName]) {
                            removeList.push(r);
                            devNameList[_devName].data.volumns.push(r.data);
                        } else {
                            r.data.volumns = [r.data];
                            devNameList[_devName] = r;
                        }
                        break;
                    case 'ups':
                        r.data.info = {
                            type: dq.selectValue('info/type', r.node, '')
                        };
                        break;
                }
            });
            store.remove(removeList);
            store.commitChanges();
        });

        if (lib.supportStorage) {
            rssList.proxy.onRead = Ext.createSequence(rssList.proxy.onRead, function(action, o, response) {
                lib.setStorageValue('NEWS_XML', response.responseText);
                lib.setStorageValue('NEWS_XML_Last-Modified', response.getResponseHeader('Last-Modified'));
            });
            rssList.on({
                'beforeload': function() {
                    this.proxy.conn.headers = {
                        'If-Modified-Since': lib.getStorageValue('NEWS_XML_Last-Modified')
                    };
                },
                loadexception: function(proxy, o, response) {
                    var cacheXml = lib.getStorageValue('NEWS_XML');
                    if (response.status === 304 && lib.supportStorage && cacheXml) {
                        if (window.DOMParser) {
                            this.loadData(new window.DOMParser().parseFromString(cacheXml, "text/xml"));
                        } else if (ActiveXObject) {
                            var xmlDocument = new ActiveXObject('Microsoft.XMLDOM');
                            xmlDocument.async = false;
                            xmlDocument.loadXML(cacheXml);
                            this.loadData(xmlDocument);
                        }
                    } else {
                        lib.setStorageValue('NEWS_XML_Last-Modified', 0);
                    }
                }
            });
        }

        rssList.on('load', function(store, records) {
            var rmRecs = [];
            Ext.each(records, function(r) {
                switch (r.get('category')) {
                    case QNAP.QOS.config.internalModelName:
                    case 'ALL':
                    case '':
                    case null:
                        break;
                    default:
                        rmRecs.push(r);
                        break;
                }
                r.node = null;
                delete r.node;
            });
            store.remove(rmRecs);
            store.reader.xmlData = null;
            delete store.reader.xmlData;
        });

        sysSetting.on('load', function(store) {
            store.loaded = true;
            var servSet = store.getAt(0);
            if (Ext.isEmpty(servSet)) {
                return;
            }

            var dtStr = servSet.get('year') + '-' +
                String.leftPad(servSet.get('month'), 2, '0') + '-' +
                String.leftPad(servSet.get('day'), 2, '0') + ' ' +
                String.leftPad(servSet.get('hour'), 2, '0') + ':' +
                String.leftPad(servSet.get('minute'), 2, '0') + ':' +
                String.leftPad(servSet.get('second'), 2, '0');
            var serverDt = Date.parseDate(dtStr, "Y-m-d H:i:s");
            if (servSet.get('dn') == '1') {
                serverDt = serverDt.add(Date.HOUR, 12);
            }

            servSet.set('serverDate', serverDt);
            servSet.data.sleepSupport = Ext.DomQuery.selectValue('sleepSupport', store.reader.xmlData, '0') == '3';
            store.commitChanges();
        });

        var logInfo = new Ext.data.XmlStore({
            url: lib.getCgiUrl(sitePath + 'sys/sysRequest.cgi'),
            storeId: QNAP.QOS.config.T_LOG,
            fields: ['id', 'type', 'date', 'time', 'user', 'ip',
                'comp', 'desc', 'timestamp', 'logType'
            ],
            record: 'event',
            totalProperty: 'count',
            baseParams: {
                eventlogQueryByClientTime: 1,
                count: _dc,
                sort: 13, // 排序方式 預設13 id DESC
                upper: 10, // 結束筆數
                lower: 0, // 開始筆數
                subfunc: 'sys_logs' // 呼叫fun
            },
            listeners: {
                beforeload: function(store, option) {
                    var clearAll;
                    clearAll = QNAP.QOS.user.datetime.sysLogClearAll || 0;
                    Ext.apply(option.params, {
                        startTime: clearAll,
                        filtertype: '1,2',
                        range: 30, //day
                        upper: 21
                    });
                }
            },
            notifyLogTotalCount: 0,
            sysLogTotalCount: 0,
            sysLogTotalECount: 0,
            sysLogTotalWCount: 0,
            connLogTotalCount: 0,
            connLogTotalECount: 0,
            connLogTotalWCount: 0
        });

        var notifyList = new Ext.data.JsonStore({
            url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'sys/syslogRequest.cgi'),
            fields: [
                'id', {
                    name: 'facility',
                    type: 'string'
                },
                'facilityStr',
                'name',
                'severity',
                'status',
                'desc',
                'msgCode',
                {
                    name: 'varNum',
                    type: 'int'
                },
                'varContent',
                {
                    name: 'timeSec',
                    type: 'int'
                },
                /**
                 * formated timeSec
                 */
                'timeSecStr',
                {
                    name: 'endtimeSec',
                    type: 'int'
                },
                'endtimeSecStr',
                'server',
                'action',
                'serviceID',
                'user',
                'ip',
                'client',
                {
                    name: 'count',
                    type: 'int'
                },
                /**
                 * @field uid
                 * @description 記錄此筆訊息是提供給那個 User的，預設值為 -1，代表不屬於任何 User
                 * @see gid
                 * @default -1
                 */
                'uid',
                /**
                 * @field gid
                 * @description 記錄此筆訊息是提供給那個 User Group 的，預設值為 -1，代表不屬於任何 User Group
                 * @see uid
                 * @default -1
                 */
                'gid', {
                    name: 'logType',
                    defaultValue: 'notifyLog'
                },
                'date', 'time',
                {
                    name: 'link_id',
                    defaultValue: '',
                    convert: function(v) {
                        return Ext.isString(v) ? v : '';
                    }
                },
                {
                    name: 'link_option',
                    defaultValue: '',
                    convert: function(v) {
                        return Ext.isString(v) ? v : '';
                    }
                }
            ],
            root: 'list',
            totalProperty: 'count',
            idProperty: 'id',
            baseParams: {
                subfunc: 'sys_logs',
                noticelog: 1,
                lower: 0,
                sort: 13,
                upper: 0,
                noticelogQueryByClientTime: 1,
                range: 30,
                group: 1,
                startTime: 0,
                log_only: 1,
                t: 1
            },
            listeners: {
                beforeload: function(store) {
                    var clearAll = QNAP.QOS.user.datetime.sysLogClearAll || 0;
                    Ext.apply(store.baseParams, {
                        startTime: parseInt(clearAll),
                    });
                }
            },
            getTaskMsg: function(task) {
                return os.getTaskNotifyMsg(task.facility, task.facilityStr, task.type, task.name, task.msgCode, task.varNum, task.varContent, task.desc);
            },
            getExtraTaskMsg: function(task) {
                if (os.getExtraTaskStore(task.name)) {
                    return os.getExtraTaskNotifyMsg(task.name, task.msgCode, task.varNum, task.varContent, task.desc);
                } else {
                    return os.getTaskNotifyMsg(task.facility, task.facilityStr, task.type, task.name, task.msgCode, task.varNum, task.varContent, task.desc);
                }
            },
            getExtDevMsg: function(recData) {
                var ifName = recData.interface;
                switch (recData.interface.toUpperCase()) {
                    case 'USB':
                        ifName = 'USB';
                        break;
                    case 'USB2':
                    case 'USB 2.0':
                        recData.interface = 'usb2';
                        ifName = 'USB 2.0';
                        break;
                    case 'USB3':
                    case 'USB 3.0':
                        recData.interface = 'usb3';
                        ifName = 'USB 3.0';
                        break;
                    case 'USB 3.1':
                        recData.interface = 'usb 3.1';
                        ifName = 'USB 3.1';
                        break;
                    case 'ESATA':
                        ifName = 'eSATA';
                        break;
                }
                return String.format(_S.QTS_D_EXT_DEVICE + '\r{1} {2}', ifName, recData.manufacturer, recData.model);
            },
            facilityMap: this.facilityMap
        });

        sysLog.on('load', function(store, records) {
            var removeRecords = [];
            var loginfoStore = Ext.StoreMgr.item(QNAP.QOS.config.T_LOG);
            loginfoStore.findBy(function(record) {
                if (record.data.logType == 'sysLog') {
                    removeRecords.push(record);
                }
            });
            loginfoStore.remove(removeRecords);
            loginfoStore.add(records);
            loginfoStore.sysLogTotalCount = store.getTotalCount();
            loginfoStore.sysLogTotalECount = 0;
            loginfoStore.sysLogTotalWCount = 0;
            store.each(function(record) {
                switch (record.get('type')) {
                    case '2':
                        loginfoStore.sysLogTotalECount += record.get('count');
                        break;
                    case '1':
                        loginfoStore.sysLogTotalWCount += record.get('count');
                        break;
                }
            });

            loginfoStore.fireEvent('update', loginfoStore, null, {
                buffer: 500
            });
            store.commitChanges();
            loginfoStore.commitChanges();
        });

        connLog.on('load', function(store, records) {

            var removeRecords = [];
            var loginfoStore = Ext.StoreMgr.item(QNAP.QOS.config.T_LOG);
            loginfoStore.findBy(function(record) {
                if (record.data.logType == 'connLog') {
                    removeRecords.push(record);
                }
            });

            loginfoStore.connLogTotalECount = 0;
            loginfoStore.connLogTotalWCount = 0;

            records.each(function(record) {
                record.data.desc = record.data.res == '---' ? '' : record.data.res;
                record.data.desc += ' ' + record.data.user.replace(/(<[^>]*>)/g, '');
                record.data.desc += ' ' + QNAP.QOS.lib.connLogActionType[record.data.action];
                record.data.desc += ' (' + QNAP.QOS.lib.connLogServType[record.data.serv] + ')';
                switch (record.get('type')) {
                    case '2':
                        loginfoStore.connLogTotalECount += record.get('count');
                        break;
                    case '1':
                        loginfoStore.connLogTotalWCount += record.get('count');
                        break;
                }
            });

            loginfoStore.remove(removeRecords);
            loginfoStore.add(records);
            loginfoStore.connLogTotalCount = store.getTotalCount();

            loginfoStore.fireEvent('update', loginfoStore, null, {
                buffer: 500
            });
            store.commitChanges();
            loginfoStore.commitChanges();
        });

        notifyList.on('load', function(store, records) {
            var removeRecords = [];
            var loginfoStore = Ext.StoreMgr.item(QNAP.QOS.config.T_LOG);

            function getDateTime(ms, timezone) {
                var dt = new Date(ms);
                if (ms == 0) {
                    return 0;
                }
                var sysSetting = os.dataStore.sysSetting,
                    sysRecord = sysSetting.getAt(0),
                    timeformat = 'H:i:s',
                    dateformat = 'Y-m-d';
                if (sysRecord) {
                    dateformat = sysSetting.ymdDateFormats[sysRecord.get('dateformatindex') - 1];
                    if (parseInt(sysRecord.get('timeformat')) === 12) {
                        timeformat = 'h:i:s A';
                    }
                    if (timezone) {
                        timezone = sysSetting.getAt(0).get('timezone').replace(/\(GMT(.*?)\)(.*)/, '$1');
                        var isNegative = false;
                        if (timezone.indexOf('-') === 0) {
                            isNegative = true;
                        }
                        timezone = timezone.split(':');
                        var timeOffset = parseInt(timezone[0] || 0) * 60;
                        timeOffset += parseInt(timezone[1] || 0) * (isNegative ? -1 : 1);
                        timeOffset += dt.getTimezoneOffset();
                        timeOffset += os.desktop.getDayLightSavingOffset();
                        dt = dt.add(Date.MINUTE, timeOffset);
                    }

                }
                return dt.format(dateformat + ' ' + timeformat);
            }

            loginfoStore.findBy(function(record) {
                if (record.data.logType == 'notifyLog') {
                    removeRecords.push(record);
                }
            });
            loginfoStore.remove(removeRecords);

            removeRecords = [];

            store.each(function(record) {
                if (record.get('msgCode') === 'MSG_PS_001') {
                    removeRecords.push(record);
                    return true;
                }
                var dateTimeStr = record.get('timeSecStr');
                if (Ext.isEmpty(dateTimeStr)) {
                    dateTimeStr = getDateTime(record.get('timeSec') * 1000, true);
                }
                dateTimeStr = dateTimeStr.split(' ');
                record.set('date', dateTimeStr[0]);
                record.set('time', dateTimeStr[1]);
            });
            store.remove(removeRecords);
            loginfoStore.add(store.getRange());
            loginfoStore.notifyLogTotalCount = 0;
            store.each(function(_record) {
                loginfoStore.notifyLogTotalCount += _record.get('count');
            });
            loginfoStore.fireEvent('update', loginfoStore, null, {
                buffer: 500
            });
            store.commitChanges();
            loginfoStore.commitChanges();
        });

        logInfo.on('add', function(store, records, index) {
            records.each(function(record) {
                if (record.data.logType === 'notifyLog') {
                    record.data.timestamp = record.data.timeSec * 1000;
                } else {
                    record.data.timestamp = record.data.timestamp * 1000;
                    var sysSetting = os.dataStore.sysSetting,
                        sysRecord = sysSetting.getAt(0),
                        timeformat = 'H:i:s',
                        dateformat = 'Y-m-d';
                    if (sysRecord) {
                        dateformat = sysSetting.ymdDateFormats[sysRecord.get('dateformatindex') - 1];
                        if (parseInt(sysRecord.get('timeformat')) === 12) {
                            timeformat = 'h:i:s A';
                        }
                    }
                    record.data.date = Date.parseDate(record.data.date, "Y-m-d").format(dateformat);
                    record.data.time = Date.parseDate(record.data.time, "H:i:s").format(timeformat);
                    record.node = undefined;
                }
            });
        });

        logInfo.on('update', function(store) {
            /**
             * update last log list
             */
            var tmpLogList = [];
            store.each(function(r) {
                r.data.desc = r.data.desc.replace(/\s/g, ' ');
                var keyName = r.data.id + ' - ' + r.data.time;
                tmpLogList.push(keyName);
                if (os.lastLogList.indexOf(keyName) == -1) {

                    var type = '';
                    switch (parseInt(r.data.type, 10)) {
                        case 2:
                            type = _S.IEI_IDS_STRING85;
                            break;
                        case 1:
                            type = _S.IEI_IDS_STRING65;
                            break;
                    }
                    var msg = String.format('[{0}] {1}', type, r.data.desc);
                    var p = [];
                    switch (r.data.logType) {
                        case "sysLog":
                            p.push(_S.IEI_NAS_LOGS20);
                            break;
                        case "connLog":
                            p.push(_S.IEI_NAS_LOGS24);
                            break;
                    }
                    p.push(msg);
                }
            });
            os.lastLogList = tmpLogList;
            store.sort('timestamp', 'DESC');
            store.commitChanges();
        }, null, {
            buffer: 500
        });

        bandwidth.on('datachanged', function(store) {
            var id, is_geteway_exist, timestamp,
                record_history, store_history, history_rx, history_tx, history_timestamp;
            var bond_eth, bond_tx, bond_rx;
            store.defGateway = store.reader.jsonData.def_gateway;
            isGetewayExist = false;
            store_history = store._history;
            timestamp = new Date().getTime();

            store.each(function(record, index) {
                id = record.get('id');

                if (id === store.defGateway) {
                    isGetewayExist = true;
                }

                record_history = store_history[id] || {
                    rx: [],
                    tx: [],
                    timestamp: []
                };
                history_rx = record_history.rx;
                history_tx = record_history.tx;
                history_timestamp = record_history.timestamp;

                history_rx.splice(180);
                history_tx.splice(180);
                history_timestamp.splice(180);

                if (record.get('type') === 'bond') {
                    bond_tx = 0;
                    bond_rx = 0;
                    Ext.each(record.json.group, function(eth) {
                        bond_eth = store.getById(['eth', eth].join(''));
                        if (bond_eth) {
                            bond_tx += bond_eth.get('tx');
                            bond_rx += bond_eth.get('rx');
                        }
                    });
                    record.set('tx', bond_tx);
                    record.set('rx', bond_rx);
                }

                history_rx.unshift(record.get('rx'));
                history_tx.unshift(record.get('tx'));
                history_timestamp.unshift(timestamp);
                record.set('history', record_history);
                store_history[id] = record_history;

            });

            if (isGetewayExist === false) {
                store.defGateway = undefined;
            }
        });

        bandwidth.on('load', function(store) {
            store.loaded = true;
        }, null, {
            single: true
        });

        connLog.proxy.conn.timeout = sec15Timeout;
        sysLog.proxy.conn.timeout = sec15Timeout;
        notifyList.proxy.conn.timeout = sec15Timeout;
        extDevice.proxy.conn.timeout = sec15Timeout;


        doingTaskList.proxy.conn.timeout = minute * 1;
        doneTaskList.proxy.conn.timeout = minute * 1;
        hardware.proxy.conn.timeout = minute * 1;
        diskInfo.proxy.conn.timeout = sec30imeout;
        onlineUserList.proxy.conn.timeout = sec30imeout;
        systemHealth.proxy.conn.timeout = sec30imeout;

        volumeList.proxy.conn.timeout = minute * 5;
        bandwidth.proxy.conn.timeout = minute * 30;

        this.qTaskMgr.addStore(cpu_usage, {
            interval: platformRadix === 1 ? second * 6 : second * 30,
            delay: 6
        });
        this.qTaskMgr.addStore(sysSetting, {
            interval: minute * 30
        });
        this.qTaskMgr.addStore(onlineUserList, {
            interval: sec30imeout * platformRadix,
            delay: second
        });
        this.qTaskMgr.addStore(systemHealth, {
            interval: sec30imeout * platformRadix,
            delay: second * 1
        });
        this.qTaskMgr.addStore(diskInfo, {
            interval: sec30imeout * platformRadix,
            delay: second * 1
        });
        this.qTaskMgr.addStore(hardware, {
            interval: sec30imeout * platformRadix,
            delay: second * 1.5
        });
        this.qTaskMgr.addStore(bandwidth, {
            interval: platformRadix === 1 ? second * 5 : second * 10
        });
        this.qTaskMgr.addStore(rssList, {
            interval: hour,
            delay: second * 5
        });
        this.qTaskMgr.addStore(volumeList, {
            interval: minute * 5
        });

        this.initTaskFlag = true;

        os.dataStore.hardware = hardware;
        os.dataStore.extDevice = extDevice;
        os.dataStore.halExtDevice = halExtDevice;
        os.dataStore.sysLog = sysLog;
        os.dataStore.connLog = connLog;
        os.dataStore.doingTaskList = doingTaskList;
        os.dataStore.doneTaskList = doneTaskList;
        os.dataStore.volumeList = volumeList;
        os.dataStore.sysSetting = sysSetting;
        os.dataStore.finishTaskList = finishTaskList;
        os.dataStore.notifyList = notifyList;
        os.dataStore.bandwidth = bandwidth;
        sysSetting = undefined;

        if (QNAP.QOS.config.bIsStorageV2) {
            Ext.Loader.load(
                [QNAP.QOS.config.sitePath + 'apps/storageManagerV2/storageManagerV2Store.js?dc=' + Math.random()],
                function() {
                    var encDiskList = new QNAP.QOS.storageManagerCoreV2.Data.encDiskList(); //T_ENC_DISK_LIST
                    var poolList = new QNAP.QOS.storageManagerCoreV2.Data.poolList(); //T_POOL_LIST
                    var cacheInfo = new QNAP.QOS.storageManagerCoreV2.Data.cacheVolInfo(); //T_CACHE_INFO
                    var poolInfo = new QNAP.QOS.storageManagerCoreV2.Data.poolInfo(); //T_POOL_INFO
                    var lvList = new QNAP.QOS.storageManagerCoreV2.Data.volumeList(); //T_LV_LIST
                    var lvInfo = new QNAP.QOS.storageManagerCoreV2.Data.volumeInfo(); //T_LV_INFO
                    var lunInfo = new QNAP.QOS.storageManagerCoreV2.Data.lunInfo(); //T_LUN_INFO
                    var halEncDevice = new QNAP.QOS.storageManagerCoreV2.Data.encList(); //T_HAL_ENC_DEVICE
                    var limitationInfo = new QNAP.QOS.storageManagerCoreV2.Data.limitation(); //T_LIMITATION_INFO
                    limitationInfo.on({
                        'load': function(_store) {
                            try {
                                var record = _store.getAt(0);
                                var aPCIe = record.data.PCIE_PORT_NUMBER.split(',');
                                QNAP.QOS.config.PCIeEncId = [];
                                var i, tmp = [];
                                for (i = 0; i < aPCIe.length; i++) {
                                    tmp = aPCIe[i].split(':');
                                    QNAP.QOS.config.PCIeEncId[parseInt(tmp[1], 10)] = {
                                        Slot: tmp[0],
                                        idEnc: tmp[1],
                                        cntDisk: tmp[2]
                                    };
                                }
                                var nEcnId = parseInt(record.data.MSATA_CACHE_ENCLOSURE, 16);
                                QNAP.QOS.config.CacheEncId = nEcnId;
                            } catch (e) {
                                _D('[Error] store => ', QNAP.QOS.config.T_LIMITATION_INFO);
                                _D(e.stack);
                            }
                        },
                        'single': true,
                        'scope': this
                    });
                    halEncDevice.on('load', function(store) {
                        this.load();
                    }, extDevice);
                    encDiskList.proxy.conn.timeout = minute * 5;
                    poolList.proxy.conn.timeout = minute * 5;
                    cacheInfo.proxy.conn.timeout = minute * 5;
                    encDiskList.load();
                    poolList.load();
                    lvList.load();
                    cacheInfo.load();
                    halEncDevice.load();
                    limitationInfo.load();
                    this.qTaskMgr.addStore(encDiskList, {
                        interval: minute * 5,
                        delay: second * 1
                    });
                    this.qTaskMgr.addStore(poolList, {
                        interval: minute * 5,
                        delay: second * 2
                    });
                    this.qTaskMgr.addStore(cacheInfo, {
                        interval: minute * 5,
                        delay: second * 3
                    });
                    os.dataStore.halEncDevice = halEncDevice;
                }, this, true
            );
        }
    },
    ignoreaApplet: new Ext.util.DelayedTask(function() {
        if (os.waitJava) {
            os.waitJava = false;
            _D('=== os ignoreaApplet initCheck ===');
            os.initCheck('ignoreaApplet');
        }
    }),
    /**
     * check list
     * - serviceStore loaded
     * - load user setting
     * - stationStore load
     * - SideMenu initCheck
     * - imgLoadcheck
     * - qpkgstore
     * @param  {[type]} info     [description]
     * @param  {[type]} debugmsg [description]
     * @return {[type]}          [description]
     */
    initCheck: function(info, debugmsg) {
        if (os.initFinish) {
            return true;
        }

        this.alreadyInitCount++;
        if (!this.initMask) {
            this.initMask = new Ext.LoadMask(Ext.getBody(), {
                msg: info,
                msgCls: 'init-load-mask-msg',
                maskCls: 'init-load-mask'
            });
            this.initMask.onBeforeLoad = Ext.emptyFn;
            this.initMask.show();

        }
        if (Ext.get('QTS_LOADING')) {
            Ext.get('QTS_LOADING').update(info);
        }
        os.ignoreaApplet.delay(1000); //5 Sec.
        if (this.totalInitCount == this.alreadyInitCount) {
            _D('=== os initCheck finish ===');
            _D('this.totalInitCount', this.totalInitCount);
            _D('this.alreadyInitCount', this.alreadyInitCount);
            os.initFinish = true;
            os.getViewport().items.each(function(item) {
                if (item.el) {
                    item.el.setOpacity(1, true);
                }
            });
            this.fireEvent('logincomplete', this);
            if (Ext.get('QTS_LOADING')) {
                Ext.get('QTS_LOADING').remove();
            }
        } else if (this.totalInitCount - this.alreadyInitCount == 1) {
            _D('=== interrupt to check LM ===');
            if (QNAP.QOS.Environment.qLM) {
                QNAP.QOS.lib.loadJsLib(['/cgi-bin/qpkg/LiveMigrationApp/desktop/lmEnvironment.js?_dc=' + QNAP.QOS.config.firmware + '.' + QNAP.QOS.config.build]);
            } else {
                QNAP.QOS.config.lm_enabled = false;
            }
        }
    },
    checkDNS: function(checkCookie, callbackFn, fromDesktop) {
        QNAP.QOS.ajax({
            url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'sys/sysRequest.cgi', {
                subfunc: 'firm_update'
            }, {
                dnsresolve: 1
            }),
            method: 'POST',
            scope: this,
            success: function(response) {
                var selectValue = Ext.DomQuery.selectValue,
                    xml = response.responseXML,
                    getCookie = QNAP.lib.cookie.get;
                var updateLock = selectValue('update_lock', xml, '0');
                var doReboot = selectValue('doReboot', xml, '0');
                QNAP.QOS.config.updateLock = updateLock;
                QNAP.QOS.config.enableLiveUpdate = selectValue('enableLiveUpdate', xml, '0');

                if (fromDesktop) {
                    if (updateLock === '1') {
                        os.openApp('firmware');
                        return;
                    }

                    if (doReboot === '1') {
                        Ext.Msg.confirm(_S.FIRMWARE_UPDATE_REBOOT_3, _S.IEI_NAS_MISC4_TITLE16, function(btn) {
                            if (btn == 'yes') {
                                Ext.Msg.wait(_S.QTS_INIT_LOADING);
                                os.desktop.get_shutdown_warning_flag(function(warning_flag) {
                                    if (warning_flag) {
                                        Ext.Msg.hide();
                                        os.desktop.show_shutdown_warning_confirm(warning_flag, 'UPDATE_FW_REBOOT');
                                    } else {
                                        os.qTaskMgr.stopAll();
                                        os.rebootNas();
                                        Ext.Msg.wait(_S.QUICK11_RESTART_STR04);
                                        os.desktop.waitReboot();
                                    }
                                });
                            }
                        });
                        return;
                    }
                    os.desktop.show_raid_scrubbing_notice(os.checkNewFw.createDelegate(os));
                }

                if (selectValue('dnsResolveOk', xml) == '1') {
                    return;
                }
                if (getCookie("alertDnsValue") == '1') {
                    return;
                }

                if (this.checkDNSWin || getCookie("alertDnsValue") == '1') {
                    return;
                }

                var chk_id = 'chk_delrealpath' + Ext.id();
                var msgStr;
                if (os.getQPKG('netmgr')) {
                    msgStr = 'NETWORK_STRING_01_ADV';
                } else {
                    msgStr = 'NETWORK_STRING_01';
                }
                var items = {
                    xtype: 'container',
                    border: false,
                    autoHeight: true,
                    layout: 'form',
                    defaults: {
                        hideLabel: true
                    },
                    items: [{
                        xtype: 'box',
                        cls: 'x-form-item',
                        html: _S[msgStr],
                        hideLabel: true
                    }, {
                        xtype: 'qtscheckbox',
                        id: chk_id,
                        boxLabel: _S.IEI_NAS_CONFIRM18,
                        hideLabel: true
                    }]
                };


                var fbar = [{
                    xtype: 'qtsbutton',
                    text: _S.IEI_NAS_BUTTON_OK,
                    qInternational: true,
                    qInternationalKey: 'IEI_NAS_BUTTON_OK',
                    handler: function() {
                        if (Ext.getCmp(chk_id).getValue()) {
                            QNAP.lib.cookie.set('alertDnsValue', 1, 60 * 60 * 24 * 365, '/');
                        }
                        this.checkDNSWin.close();
                    },
                    scope: this
                }];
                this.checkDNSWin = this.getMsgWindow(false, items, fbar).show();
                this.checkDNSWin.on({
                    scope: this,
                    close: function() {
                        this.checkDNSWin = undefined;
                    }
                });
            },
            failure: function() {},
            callback: callbackFn
        });
    },
    runTask: function(taskId) {
        this.qTaskMgr.runTask(taskId);
    },
    bindEvent: function(appInstance) {
        var os = this;
        appInstance.on('closeapp', os.onAppClose, os);
        appInstance.on('broadcast', os.onBroadcast, os);
        appInstance.on('servicestart', os.onServiceStart, os);
        appInstance.on('servicestop', os.onServiceStop, os);
        appInstance.on('serviceupdate', os.onServiceUpdate, os);
        appInstance.on('filechange', os.onFileChange, os);

        appInstance.mon(os, 'broadcast', appInstance.onBroadcast, appInstance);
        appInstance.mon(os, 'filechange', appInstance.onFileChange, appInstance);
        appInstance.mon(os, 'servicestop', appInstance.onServiceStop, appInstance);
        appInstance.mon(os, 'servicestart', appInstance.onServiceStart, appInstance);
        appInstance.mon(os, 'serviceupdate', appInstance.onServiceUpdate, appInstance);
    },
    getViewport: function() {
        if (!this.viewport) {
            this.initViewport();
        }
        return this.viewport;
    },
    onAppClose: function(appInstance) {
        appInstance.un('closeapp', os.onAppClose, os);
        appInstance.un('servicestart', os.onServiceStart, os);
        appInstance.un('servicestop', os.onServiceStop, os);
        appInstance.un('filechange', os.onFileChange, os);
        appInstance.un('serviceupdate', os.onServiceUpdate, os);
        appInstance.un('broadcast', os.onBroadcast, os);

        appInstance.mun(os, 'broadcast', appInstance.onBroadcast, appInstance);
        appInstance.mun(os, 'filechange', appInstance.onFileChange, appInstance);
        appInstance.mun(os, 'servicestop', appInstance.onServiceStop, appInstance);
        appInstance.mun(os, 'servicestart', appInstance.onServiceStart, appInstance);
        appInstance.mun(os, 'serviceupdate', appInstance.onServiceUpdate, appInstance);
    },
    loadAppJs: function(appId, callbackFn) {
        var app = QNAP.QOS.lib.getAppInfo(appId),
            isQPKGApp = app.type === 'QPKGApp';
        _D('[Info] loadAppJs....', appId);

        function loadJs(app) {
            Ext.Loader.load(app.js, function() {
                var tmpApp = isQPKGApp ? QNAP.QOS.QPKG[app.appId] : QNAP.QOS[app.appId];
                if (tmpApp) {
                    _D('[Info] App ready....................', appId);
                    if (callbackFn) {
                        callbackFn();
                    }
                } else {
                    _D('[Info] App is not ready....................', appId);
                }
            }, null, true);
        }


        if (app.css) {
            app.css = Ext.isArray(app.css) ? app.css : [app.css];
            Ext.each(app.css, function(_css, index) {
                if (Ext.fly(appId + '_style_' + index)) {
                    return true;
                }
                Ext.util.CSS.swapStyleSheet(appId + '_style_' + index, _css + '?' + URL_RANDOM_NUM);
            });
        }
        if ((isQPKGApp && QNAP.QOS.QPKG[appId]) || QNAP.QOS[appId]) {
            callbackFn();
            return;
        }
        if (app.langJs) {
            os.loadLang(app.langJs, app.langVar, function() {
                loadJs(app);
            }, this);
        } else {
            loadJs(app);
        }
    },
    /**
     * [loadLang description]
     * @param  {Array}   langJs   [description]
     * @param  {String}   langVar  [description]
     * @param  {Function} callback [description]
     * @param  {Object}   scope    [description]
     */
    loadLang: function(langJs, langVar, callback, scope) {
        var tmpLangJs = [];
        var lang = QNAP.QOS.user.lang == 'auto' ? QNAP.QOS.lib.browserSelectLanguage() : QNAP.QOS.user.lang;
        if (Ext.isArray(langJs)) {
            Ext.each(langJs, function(langJs) {
                QNAP.QOS.lib.subLangs.add(langJs, {
                    langPath: langJs,
                    langVar: langVar
                });
                tmpLangJs.push(String.format(langJs, lang));
            });
        } else if (Ext.isString(langJs)) {
            QNAP.QOS.lib.subLangs.add(langJs, {
                langPath: langJs,
                langVar: langVar
            });
            tmpLangJs.push(String.format(langJs, lang));
        }



        Ext.Loader.load(tmpLangJs, function() {
            var mix = new Ext.util.MixedCollection();
            mix.addAll(window['_Q_STRINGS' + langVar]);
            mix.eachKey(function(key) {
                _S[langVar + key] = mix.get(key);
            });
            window['_Q_STRINGS' + langVar] = undefined;
            try {
                delete window['_Q_STRINGS' + langVar];
            } catch (e) {}
            callback.apply(scope);
        }, null, true);
    },
    loginService: function(args) {
        var url = String.format(QNAP.QOS.config.rootUrl + QNAP.QOS.config.sitePath + 'authLogin.cgi?count={0}',
            Math.random(), args.serviceKey);
        var parmas = {
            user: args.account,
            service: args.serviceKey
        };
        if (args.qtoken) {
            parmas.qtoken = args.qtoken;
        } else {
            parmas.pwd = QNAP.lib.encryption.ezEncode(args.password);
        }
        if (args.remme == '1') {
            parmas.remme = args.remme;
        }
        Ext.Ajax.request({
            url: url,
            params: parmas,
            method: 'POST',
            success: function(response) {
                if (args.callback) {
                    args.callback(response);
                } else {
                    if (Ext.DomQuery.selectValue('authPassed',
                            response.responseXML) == '1') {

                        var sid = Ext.DomQuery.selectValue('authSid',
                            response.responseXML);

                        os.showMsg(args.serviceName, '*login success.');
                        switch (parseInt(args.serviceKey, 10)) {
                            case 0:
                            case 1:
                            case 2:
                                QNAP.lib.cookie.set('NAS_SID', sid, null, '/');
                                window.open(args.servicePath, '_blank');
                                break;
                            case 3:
                                var form = Ext.DomHelper.append(Ext
                                    .getBody(), {
                                        tag: 'form',
                                        id: 'msv2',
                                        method: 'post',
                                        target: "_blank",
                                        action: args.servicePath,
                                        children: [{
                                            tag: 'input',
                                            type: 'hidden',
                                            name: 'usr',
                                            value: args.account
                                        }, {
                                            tag: 'input',
                                            type: 'hidden',
                                            name: 'pwd',
                                            value: args.password
                                        }]
                                    });
                                form.submit();
                                break;
                            case 5:
                                window.open(args.servicePath, '_blank');
                                break;
                            default:
                                window.open(args.servicePath + sid,
                                    '_blank');
                                break;
                        }

                    } else {
                        os.showMsg(args.serviceName, '*login fail.');
                    }
                }
            },
            failure: args.failure || Ext.emptyFn
        });
    },
    changeLang: function(newLang) {
        Ext.Msg.wait();
        var url = QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'userConfig.cgi');
        QNAP.QOS.ajax({
            url: url,
            params: {
                func: 'set',
                common_lang: newLang
            },
            method: 'POST',
            success: function() {
                QNAP.QOS.user.lang = newLang;
                QNAP.QOS.lib.resetLang(newLang);
            },
            failure: Ext.emptyFn
        });
    },
    /**
     * logout function
     * @param  {boolean} mask     add mask, default is "true"
     * @param  {boolean} redirect auto redirect to "/", default is "true"
     */
    logout: function(mask, redirect) {
        if (mask !== false) {
            if (Ext.isString(mask)) {
                os.Msg.wait(mask);
            } else {
                os.Msg.wait(_S.V3_MENU_STR14);
            }
        }

        Ext.Ajax.request({
            url: QNAP.QOS.config.rootUrl + QNAP.QOS.config.sitePath + 'userConfig.cgi?func=set&datetime_logout=&access_clientIP=&sid=' + QNAP.QOS.user.sid,
            success: Ext.emptyFn,
            failure: Ext.emptyFn
        });

        Ext.Ajax.request({
            url: '/cgi-bin/qsync/qsyncsrv_logout.cgi',
            success: function(o) {},
            failure: function(o) {},
            callback: function() {
                QNAP.lib.cookie.del('QSYNC_SID');
            },
            params: {
                sid: QNAP.lib.cookie.get('QSYNC_SID'),
                logout: 1
            }
        });

        Ext.Ajax.request({
            url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'authLogout.cgi'),
            params: {
                logout: '1'
            },
            callback: function() {
                QNAP.lib.cookie.del('QMS_SID', '/');

                if (redirect !== false) {
                    window.location.href = '/?' + Math.random();
                }
            }
        });

        window.sessionStorage.clear();
        QNAP.lib.cookie.del('NAS_SID');
    },
    sleepNas: function(callback) {
        QNAP.QOS.config.isRebooting = true;
        QNAP.QOS.ajax({
            url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'sys/sysRequest.cgi'),
            params: {
                subfunc: 'power_mgmt',
                apply: 's3'
            },
            method: 'POST',
            success: function() {
                QNAP.QOS.config.isRebooting = false;
            },
            failure: Ext.emptyFn,
            callback: callback
        });
    },
    rebootNas: function(callback) {
        QNAP.QOS.ajax({
            url: QNAP.QOS.lib.getCgiUrl(
                QNAP.QOS.config.sitePath + 'sys/sysRequest.cgi', {
                    subfunc: 'power_mgmt'
                }, {
                    apply: 'restart'
                }),
            method: 'POST',
            success: function() {
                QNAP.QOS.config.isRebooting = true;
            },
            failure: Ext.emptyFn,
            callback: callback
        });
    },
    shutdownNas: function(callback) {
        QNAP.QOS.ajax({
            url: QNAP.QOS.lib.getCgiUrl(
                QNAP.QOS.config.sitePath + 'sys/sysRequest.cgi', {
                    subfunc: 'power_mgmt'
                }, {
                    apply: 'shutdown'
                }),
            method: 'POST',
            success: function() {
                QNAP.QOS.config.isRebooting = true;
            },
            failure: Ext.emptyFn,
            callback: callback
        });
    },
    onServiceUpdate: function(appId, serviceName, option) {
        _D('os:opps....' + serviceName + ' service update!!', option);
        var keyServices = ['backupExternalDrive', 'backupRTRR', 'antivirus'];
        if (keyServices.indexOf(serviceName) >= 0) {
            Ext.StoreMgr.item(QNAP.QOS.config.T_DOING_TASK_LIST).reload();
            Ext.StoreMgr.item(QNAP.QOS.config.T_DONE_TASK_LIST).reload();
        }
        this.fireEvent('serviceupdate', appId, serviceName, !option ? {} : option);
        os.qMessage.fireEvent('serviceupdate', appId, {
            serviceName: serviceName,
            option: option
        });
    },
    onServiceStart: function(appId, serviceName, option) {
        _D('os:opps....' + serviceName + ' service start!!');
        this.fireEvent('servicestart', appId, serviceName, option || {});
    },
    onServiceStop: function(appId, serviceName, option) {
        _D('os:opps....' + serviceName + ' service stop!!');
        this.fireEvent('servicestop', appId, serviceName, option || {});
    },
    /***
     * 廣播訊息，夾帶fn
     * @param {} appId
     * @param {} option
     * @param {} callBackFn
     */
    onBroadcast: function(appId, option, callBackFn) {
        switch (option) {
            case 'applicationPrivilege':
                os.stationStore.reload();
                os.serviceStore.reload();
                break;
        }
        this.fireEvent('broadcast', appId, option || {}, callBackFn || Ext.emptyFn);
        os.qMessage.fireEvent('broadcast', appId, {
            option: option
        }, true);
    },
    /***************************************************************************
     * 當檔案有修改時，會主動通知所有已開啟的app
     *
     * @param appId
     *            來源app
     * @param source
     *            檔案改變前路徑
     * @param target
     *            檔案改變後路徑
     * @param fileName
     *            檔案名稱
     * @param action
     *            修改動作
     *            <li>move</li>
     *            <li>new</li>
     *            <li>delete</li>
     *            <li>rename</li>
     *            <li>privilage</li>
     *            <li>rotate</li>
     */
    onFileChange: function(appId, source, target, fileName, action) {
        _D('os:opps....' + appId + ' changed some files!!', arguments);
        this.fireEvent('filechange', appId, source, target, fileName, action);

        os.qMessage.fireEvent('filechange', appId, {
            source: source,
            target: target,
            fileName: fileName,
            action: action
        });
    },
    checkSession: function() {
        QNAP.QOS.lib.checkSession();
    },
    initApplet: function() {
        var appletCfg = {
            id: "qUploadApplet"
        };
        if (Ext.get(appletCfg.id)) {
            return;
        }
        if (window.history.pushState) {
            window.history.back();
        }
        appletCfg = {
            tag: "applet",
            cls: "applet",
            archive: "/cgi-bin/applet/commons-io-2.4.jar,/cgi-bin/applet/plugin.jar,/cgi-bin/applet/QLib.jar,/cgi-bin/applet/QuploadLib.jar,/cgi-bin/applet/Qupload.jar",
            code: "qnap.web.Qup.class",
            name: "Qupload",
            id: "qUploadApplet",
            width: "1px",
            height: "1px",
            children: [{
                tag: "param",
                name: "appletId",
                value: "qUploadApplet"
            }, {
                tag: "param",
                name: "sid",
                value: QNAP.QOS.user.sid
            }, {
                tag: "param",
                name: "SERVER_PORT",
                value: QNAP.QOS.config.serverPort
            }, {
                tag: "param",
                name: "SERVER_HOST",
                value: QNAP.QOS.config.serverHost
            }, {
                tag: "param",
                name: "SERVER_SCHEME",
                value: QNAP.QOS.config.serverScheme
            }, {
                tag: "param",
                name: "java_status_events",
                value: true
            }, {
                tag: "param",
                name: "initCallbackFn",
                value: "appletInitComplete"
            }, {
                tag: "param",
                name: "classloader-policy",
                value: "classic"
            }, {
                tag: "param",
                name: "cache_archive",
                value: "/cgi-bin/applet/commons-io-2.4.jar,/cgi-bin/applet/plugin.jar,/cgi-bin/applet/QLib.jar,/cgi-bin/applet/QuploadLib.jar,/cgi-bin/applet/Qupload.jar"
            }, {
                tag: "param",
                name: "cache_version",
                value: URL_RANDOM_NUM + "," + URL_RANDOM_NUM + "," + URL_RANDOM_NUM + "," + URL_RANDOM_NUM + "," + URL_RANDOM_NUM
            }, {
                tag: "param",
                name: "permissions",
                value: 'all-permissions'
            }]
        };
        _D('initApplet......');
        Ext.DomHelper.append(Ext.getBody(), appletCfg);
    },

    loadSystemTime: function(callback) {
        var ajax = {
            url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'sys/sysRequest.cgi', {}),
            params: {
                subfunc: 'sys_setting'
            },
            success: Ext.isFunction(callback.success) ? callback.success : Ext.emptyFn,
            failure: Ext.isFunction(callback.failure) ? callback.failure : Ext.emptyFn,
            callback: Ext.isFunction(callback.callback) ? callback.callback : Ext.emptyFn
        };
        QNAP.QOS.ajax(ajax);
    },
    checkSTMPStatus: function(callback) {
        var ajax = {
            url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'sys/sysRequest.cgi', {}),
            params: {
                subfunc: 'notification'
            },
            success: function(res) {
                var smtpHost = Ext.DomQuery.selectValue('SMTPServer', res.responseXML);
                var mailStatus = /[\w\W]*\.[\w\W]*/.test(smtpHost);
                if (Ext.isFunction(callback.checkStatus)) {
                    callback.checkStatus(mailStatus);
                }
                if (Ext.isFunction(callback.success)) {
                    callback.success(res);
                }
            },
            failure: Ext.isFunction(callback.failure) ? callback.failure : Ext.emptyFn,
            callback: Ext.isFunction(callback.callback) ? callback.callback : Ext.emptyFn
        };
        QNAP.QOS.ajax(ajax);
    },
    /**
     * check new versioin qpkg
     * @return {Array} return has new version qpkg list.
     */
    checkNewQPKG: function() {
        os.newCodexPackflag = false;
        var me = this;
        var qpkgMap = {};
        var newQPKGMap = {
            appCenter: [],
            HD_Station: [],
            notSupport: [],
            minVersion: []
        };
        if (!(me.qpkgStore && me.qpkgInfoStore)) {
            return newQPKGMap;
        }
        me.qpkgStore.each(function(r) {
            qpkgMap[r.data.name] = r.data.version;
        });

        var isNewerVersion = QNAP.QOS.lib.isNewerVersion;

        var installVer = '';
        me.qpkgInfoStore.each(function(r) {
            /**
             * check QPKG new version
             * 1. installed
             * 2. supported model/platform
             * 2.1 in platformID
             * 2.2 not in platformExcl
             * 2.3 in supported country(country code)
             * 3. new version
             *
             */
            installVer = qpkgMap[r.data.internalName];
            if (installVer) {
                if (me.qpkgInfoStore.filterUnSupport(r)) {
                    return true;
                }

                if (isNewerVersion(installVer, r.data.version)) {
                    if (!newQPKGMap[r.data['class']]) {
                        newQPKGMap[r.data['class']] = [];
                    }
                    if (r.data.internalName === 'CodexPack') {
                        os.newCodexPackflag = true;
                    }
                    if (r.data.internalName === 'HD_Station') {
                        newQPKGMap.HD_Station.push(r.data.internalName);
                    } else if (r.data['class'] === 'HD_Station') {
                        Ext.iterate(r.data.platform, function(platformID) {
                            if (platformID === QNAP.QOS.config.internalModelName) {
                                newQPKGMap.HD_Station.push(r.data.internalName);
                                return false;
                            }
                        });
                    } else {
                        newQPKGMap[r.data['class']].push(r.data.internalName);
                    }
                }
            }
        });


        newQPKGMap.notSupport = [];
        newQPKGMap.minVersion = [];
        return newQPKGMap;
    },
    hasNewCodexPack: function() {
        os.checkNewQPKG();
        return os.newCodexPackflag;
    },
    /***
     * check new version firmware
     */
    checkNewFw: function(callback) {
        var info = {
            url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'sys/sysRequest.cgi'),
            params: {
                subfunc: 'firm_update',
                dnsresolve: 1,
                liveupdate: 1,
                beta: 1,
                /**
                 * Bug #77496
                 * @type {String}	control update firmware last check time flag
                 *       0 - not update
                 *       1 - update
                 * @see http://172.17.25.222/bugzilla/show_bug.cgi?id=77496
                 */
                update_check_time: QNAP.QOS.config.enableLiveUpdate
            },
            success: function(res) {
                var versionTestReg = new RegExp('^(?!none|error)');
                var QNAPQ_Config = QNAP.QOS.config;
                var dq = Ext.DomQuery,
                    dSelectValue = dq.selectValue,
                    xml = res.responseXML,
                    nasUpdateStatus = dSelectValue('liveUpdateStatus', xml),
                    newVersion = dSelectValue('official newVersion', xml),
                    newVersionFix = dSelectValue('official version_postfix', xml, ''),
                    url = dSelectValue('official update_info_url', xml),
                    newFeatureURL = dSelectValue('official new_feature_url', xml),
                    dnsresolve = dSelectValue('dnsResolveOk', xml),
                    doReboot = dSelectValue('doReboot', xml),
                    rebootSuggest = dSelectValue('rebootSuggest', xml),
                    enableLiveUpdate = dSelectValue('enableLiveUpdate', xml),
                    updateLock = dSelectValue('update_lock', xml, '0'),
                    betaVersion = dSelectValue('beta newVersion', xml),
                    betaVersionFix = dSelectValue('beta version_postfix', xml, ''),
                    betaUrl = dSelectValue('beta update_info_url', xml),
                    agreeBeta = dSelectValue('agree_beta', xml),
                    remindTime = dq.selectNumber('update_remind_time', xml, 0),
                    mcu_need_update = dSelectValue('mcu_need_update', xml, '0');

                if (os.compareVersions(newVersion, betaVersion)) {
                    betaVersion = 'none';
                }

                QNAPQ_Config.newFeatureURL = newFeatureURL;
                QNAPQ_Config.updateLock = updateLock;
                QNAPQ_Config.agreeBeta = agreeBeta;
                QNAPQ_Config.OfficialVersion = newVersion;

                function reBootConfirm() {
                    Ext.Msg.confirm(_S.FIRMWARE_UPDATE_REBOOT_3, _S.IEI_NAS_MISC4_TITLE16, function(btn) {
                        if (btn == 'yes') {
                            Ext.Msg.wait(_S.QTS_INIT_LOADING);
                            os.desktop.get_shutdown_warning_flag(function(warning_flag) {
                                if (warning_flag) {
                                    Ext.Msg.hide();
                                    os.desktop.show_shutdown_warning_confirm(warning_flag, 'UPDATE_FW_REBOOT');
                                } else {
                                    os.qTaskMgr.stopAll();
                                    os.rebootNas();
                                    Ext.Msg.wait(_S.QUICK11_RESTART_STR04);
                                    os.desktop.waitReboot();
                                }
                            });
                        }
                    });
                }

                function rebootConfirm(updateFn) {
                    var msgWin = Ext.Msg.getDialog();
                    var btns = Ext.Msg.YESNOCANCEL;
                    var msg = _S.IEI_NAS_MISC4_TITLE28_2.replace(/(\(@version@\)|（@version@）)/, ''),
                        titleStr = 'S_MENU_9';

                    msgWin.on({
                        single: true,
                        'beforeshow': function(win) {
                            Ext.Msg.getBtn('yes').setText(_S.IEI_NAS_BUTTON_RESTART_NAS);
                            Ext.Msg.getBtn('no').setText(_S.IEI_NAS_BUTTON_UPDATE);
                        },
                        'show': function(win) {
                            win.on('resize', function(win) {
                                var minWidth = win.getFooterToolbar().el.select('.x-toolbar-ct').first().getWidth() + 48 + 88;
                                if (minWidth > 450) {
                                    win.minWidth = minWidth;
                                    win.maxWidth = minWidth;
                                    win.setWidth(win.minWidth);
                                }
                            }, win, {
                                single: true
                            });
                        }
                    });

                    callbackFn = function(btn) {
                        if (btn == 'yes') {
                            Ext.Msg.wait(_S.QTS_INIT_LOADING);
                            os.desktop.get_shutdown_warning_flag(function(warning_flag) {
                                if (warning_flag) {
                                    Ext.Msg.hide();
                                    os.desktop.show_shutdown_warning_confirm(warning_flag, 'UPDATE_FW_REBOOT');
                                } else {
                                    os.qTaskMgr.stopAll();
                                    os.rebootNas();
                                    Ext.Msg.wait(_S.QUICK11_RESTART_STR04);
                                    os.desktop.waitReboot();
                                }
                            });
                        } else if (btn == 'no') {
                            rebootSuggest = '0';
                            updateFn();
                        }
                    };

                    var msgParams = Ext.Msg.getConfirmParams(_S[titleStr], msg, callbackFn);
                    msgParams.buttons = btns;
                    Ext.Msg.show(msgParams).getDialog().syncSize().center();
                }

                function getVersionList() {
                    var radioItems = [];
                    var isBetaUser = QNAPQ_Config.agreeBeta === '1';
                    if (versionTestReg.test(newVersion)) {
                        radioItems.push({
                            boxLabel: newVersion + ' <span class="fb">' + newVersionFix + '</span>',
                            inputValue: 1,
                            name: 'version'
                        });
                    }

                    if (isBetaUser && versionTestReg.test(betaVersion)) {
                        radioItems.push({
                            boxLabel: betaVersion + ' <span class="fb">' + betaVersionFix + '</span>',
                            inputValue: 2,
                            name: 'version'
                        });
                    }

                    return radioItems;
                }

                function updateConfirm() {
                    if (QNAPQ_Config.lm_enabled) {
                        _S.QLM_FW_STR01 = _S.QLM_FW_STR01;
                        Ext.Msg.alert(_S.S_MENU_9, _S.QTS_BETA_STR_12 + '<br>' + _S.QLM_FW_STR01, false);
                        return;
                    }

                    var msg = "";
                    var isBetaUser = QNAPQ_Config.agreeBeta === '1';
                    var radioItems = getVersionList();

                    if (radioItems.length === 0) {
                        return false;
                    }
                    radioItems[0].checked = true;
                    QNAPQ_Config.newVersion = radioItems[0].boxLabel.replace(/(<([^>]+)>)/ig, '');

                    var lang = QNAP.QOS.user.lang;
                    if (lang == 'auto') {
                        lang = QNAP.QOS.lib.browserSelectLanguage();
                    }
                    var releasenotes = ' (<a href="http://www.qnap.com/_jump/releasenotes/index.php?lang=' + lang + '&fw=' + QNAPQ_Config.firmware + '-' + QNAPQ_Config.buildTime + '" target="QNAP_RELEASE_NOTES" >' + _S.QTS_RELEASE_NOTES + '</a>)';
                    var chkboxStr, titleStr, rebootStr;
                    rebootStr = 'FIRMWARE_UPDATE_REBOOT_2';

                    if (rebootSuggest === "1") {
                        rebootConfirm(updateConfirm);
                        return;
                    } else {
                        titleStr = 'S_MENU_9';
                        chkboxStr = 'FIRMWARE_STRING_07';
                        msg = _S.QTS_BETA_STR_12;
                    }

                    if (QNAPQ_Config.isGenericModel === false) {
                        msg += releasenotes;
                    }

                    var fbar = [{
                        xtype: 'qtsbutton',
                        ref: '../updateBtn',
                        text: _S.IEI_AV_STR11,
                        handler: function() {
                            var win = this.ownerCt.ownerCt,
                                radioBoxGroup = win.radioBoxGroup;
                            var autoReboot = win.autoRebootChk.getValue(),
                                updateBeta, updateURL;

                            updateBeta = radioBoxGroup.getValue().inputValue === 2;
                            updateURL = '';
                            if (updateBeta) {
                                updateURL = betaUrl;
                            } else {
                                updateURL = url;
                            }

                            os.desktop.openFwUpdateInfoWin(updateURL, autoReboot, updateBeta);
                            win.close();
                        }
                    }, {
                        xtype: 'qtsbutton',
                        text: _S.IEI_NAS_BUTTON_CLOSE,
                        handler: function() {
                            this.ownerCt.ownerCt.close();
                        }
                    }];

                    var items = {
                        xtype: 'container',
                        layout: 'form',
                        cls: 'utility-window',
                        defaults: {
                            hideLabel: true
                        },
                        items: [{
                            xtype: 'displayfield',
                            value: msg
                        }, {
                            xtype: 'qtsradiogroup',
                            ref: '../radioBoxGroup',
                            columns: 1,
                            items: radioItems
                        }, {
                            xtype: 'qtscheckbox',
                            ref: '../autoRebootChk',
                            boxLabel: _S[rebootStr],
                            inputValue: 2,
                            checked: true
                        }, {
                            xtype: 'combo',
                            width: '100%',
                            anchor: '100%',
                            ref: '../postpone',
                            store: new Ext.data.ArrayStore({
                                fields: [
                                    'key',
                                    'value'
                                ],
                                data: [
                                    [0, _S.FIRMWARE_STRING_23],
                                    [1, _S.FIRMWARE_STRING_24],
                                    [3, _S.FIRMWARE_STRING_25],
                                    [7, _S.FIRMWARE_STRING_26],
                                    [-1, _S.FIRMWARE_STRING_27]
                                ]
                            }),
                            valueField: 'key',
                            displayField: 'value',
                            typeAhead: true,
                            triggerAction: 'all',
                            lazyRender: true,
                            editable: false,
                            value: 0,
                            listClass: 'desktop-window',
                            mode: 'local'
                        }]
                    };

                    var win = os.getMsgWindow(_S[titleStr], items, fbar);
                    win.show()
                        .on({
                            close: function() {
                                var postpone = this.postpone.getValue(),
                                    liveUpdate = true;

                                if (postpone === -1) {
                                    liveUpdate = false;
                                }
                                os.setLiveUpdateStatus(liveUpdate, postpone);
                            }
                        });
                    win.postpone.on({
                        scope: win,
                        select: function(combo, record, index) {
                            win.updateBtn.setDisabled(combo.getValue() > 0);
                        }
                    });


                    var desktop = os.desktop,
                        notifyList = os.dataStore.notifyList,
                        curSysTime = desktop.clocks.systemDateTime.getTime(),
                        eventTime;
                    if (curSysTime) {
                        eventTime = curSysTime.getTime() / 1000;
                    }

                    function appendFWNotify(store, beta) {
                        var desktop = os.desktop,
                            dayLightSavingOffset = desktop.getDayLightSavingOffset(),
                            localTzOffset = desktop.getLocalTzOffset(),
                            NASTzOffset = desktop.getNASTzOffset(),
                            timeOffset = (NASTzOffset + localTzOffset + dayLightSavingOffset) * 60;

                        if (store.baseParams.startTime > eventTime - timeOffset) {
                            store.un('load', appendFWNotify);
                            return;
                        }
                        var id, varContent;
                        if (beta) {
                            id = eventTime + '_FW_BETA';
                            varContent = betaVersion;
                        } else {
                            id = eventTime + '_FW';
                            varContent = newVersion;
                        }

                        if (store.getById(id)) {
                            return;
                        }

                        store.loadData({
                            list: [{
                                'id': id,
                                'facility': '17', // System
                                'facilityStr': 'System',
                                'name': '',
                                'desc': String.format('A newer firmware version ({0}) is now available for download.', varContent),
                                'msgCode': 'MSG_SY_001',
                                'varNum': 1,
                                'varContent': varContent,
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
                    }

                    if (versionTestReg.test(newVersion)) {
                        appendFWNotify(notifyList);
                        notifyList.on('load', function() {
                            appendFWNotify(notifyList);
                        }, null, {
                            delay: 100
                        });
                    }

                    if (isBetaUser && versionTestReg.test(betaVersion)) {
                        appendFWNotify(notifyList, true);
                        notifyList.on('load', function() {
                            appendFWNotify(notifyList, true);
                        }, null, {
                            delay: 100
                        });
                    }
                }

                if (QNAPQ_Config.onlyCheckReboot) {
                    dnsresolve = 0;
                    enableLiveUpdate = 0;
                }

                if (updateLock === '1') {
                    return;
                }

                if (mcu_need_update === '1') {
                    os.desktop.show_mcu_notice();
                }

                if (agreeBeta === '-1' && versionTestReg.test(betaVersion)) {
                    var callbackFn = updateConfirm;
                    if (doReboot == '1') {
                        callbackFn = reBootConfirm;
                    }
                    os.desktop.openBetaUserConfirmWin(callbackFn);
                    return;
                }

                if (doReboot == '1') {
                    reBootConfirm();
                } else if (dnsresolve == "1" && enableLiveUpdate == "1" && os.desktop.clocks.systemDateTime.getTime().getTime() / 1000 > remindTime) {
                    if (versionTestReg.test(newVersion) || (versionTestReg.test(betaVersion) && agreeBeta === '1')) {
                        if (nasUpdateStatus == "done") {
                            updateConfirm();
                        } else if (nasUpdateStatus == "updating") {
                            os.showMsg(_S.S_MENU_9, _S.IEI_NAS_MISC4_TITLE30, false);
                        }
                    }
                }

                if (QNAPQ_Config.isGenericModel === false) {
                    if (newFeatureURL) {
                        var whatsNewItem = Ext.getCmp(os.desktop.CMP_ID.WHATS_NEW_ITEM);
                        if (whatsNewItem) {
                            whatsNewItem
                                .show()
                                .ownerCt.doLayout();
                        }
                        if (QNAP.QOS.user.fwNotice === '1') {
                            os.desktop.openFwNewFeatureWin(newFeatureURL);
                            delete QNAP.QOS.user.fwNotice;
                        }
                    }
                }
            },
            failure: Ext.emptyFn,
            callback: callback
        };
        QNAP.QOS.ajax(info);
    },
    /**
     * [setLiveUpdate description]
     * @param {boolean} status
     * @param {int} postpone, unit day
     */
    setLiveUpdateStatus: function(status, postpone) {
        var params = {
            subfunc: 'firm_update',
            apply: 1,
            enableLiveUpdate: status ? 1 : 0
        };

        if (postpone > 0) {
            params.update_remind_postpone_min = 60 * 24 * postpone;
        } else {
            params.update_remind_postpone_min = Math.floor(os.desktop.clocks.systemDateTime.getTime().getTime() / 1000 / 60) * -1;
        }

        QNAP.QOS.ajax({
            url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'sys/sysRequest.cgi'),
            method: 'POST',
            params: params
        });
    },
    setBetaUserStatus: function(beta, callback, scope) {
        QNAP.QOS.ajax({
            url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'sys/sysRequest.cgi'),
            method: 'POST',
            params: {
                subfunc: 'firm_update',
                apply: 1,
                agree_beta: beta ? 1 : 0,
            }
        }, callback, scope);
    },
    saveDateTime: function(key, value, successFn, failureFn) {
        var params = {
            sid: QNAP.QOS.user.sid,
            func: 'set'
        };
        params['datetime_' + key] = value;
        Ext.Ajax.request({
            url: QNAP.QOS.config.sitePath + 'userConfig.cgi',
            method: 'POST',
            params: params,
            success: function(res) {
                if (Ext.isFunction(successFn)) {
                    successFn(res);
                }
            },
            failure: function(res) {
                if (Ext.isFunction(failureFn)) {
                    failureFn(res);
                }
            }
        });
    },
    saveConfig: function(key, value, callback) {
        var params = {
                func: 'set'
            },
            comm = {

            };

        if (Ext.isObject(key)) {
            Ext.iterate(key, function(keyId, value) {
                params['common_' + keyId] = value;
                comm[keyId] = value + '';
            });
        } else if (Ext.isArray(key) && Ext.isArray(value)) {
            Ext.each(key, function(keyId, index) {
                params['common_' + keyId] = value[index];
                comm[keyId] = value[index] + '';
            });
        } else {
            params['common_' + key] = value;
            comm[key] = value + '';
        }
        Ext.Ajax.request({
            url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'userConfig.cgi'),
            params: params,
            method: 'POST',
            success: function() {
                if (Ext.isFunction(callback)) {
                    callback();
                }
                Ext.apply(QNAP.QOS.user.common, comm);
            }
        });
    },
    /**
     * 20120530
     *
     * @author Dian
     *
     * <pre>
     * 提供task停止介面
     * </pre>
     *
     * @param {}
     *            taskType
     * @param {}
     *            taskId
     * @param {}
     *            callback
     */
    stopNasTask: function(taskType, taskId, callback) {
        var getCgiUrl = QNAP.QOS.lib.getCgiUrl;
        var sitePath = QNAP.QOS.config.sitePath;
        var ajax = {
            params: {},
            success: function() {
                _D('Stop [' + taskType + '] taskId : ' + taskId);
            },
            callback: function() {
                callback();
            }
        };
        switch (taskType) {
            case 'appCenter':
                ajax.url = getCgiUrl(sitePath + 'application/appRequest.cgi');
                ajax.params = {
                    qname: taskId,
                    subfunc: 'qpkg',
                    apply: 7,
                    action: 'cancel_download'
                };
                break;
            case 'backupExternal':
                ajax.url = getCgiUrl(sitePath + 'backup/extdriverequest.cgi');
                ajax.params = {
                    subfunc: 'back_to_ext',
                    qs_act: 'job_stop',
                    name_hidden_job_id: taskId
                };
                break;
            case 'volume':
                if (QNAP.QOS.config.bIsStorageV2) {
                    ajax.url = getCgiUrl(sitePath + 'disk/disk_manage.cgi');
                    ajax.params = {
                        func: 'volume_check_stop',
                        volumeID: taskId
                    };
                }
                break;
            case 'raid':
                if (QNAP.QOS.config.bIsStorageV2) {
                    ajax.url = getCgiUrl(sitePath + "disk/disk_manage.cgi");
                    ajax.params = {
                        func: "scrubbing_manual",
                        raidID: taskId,
                        enable: 0
                    }
                }
                break;
            case 'blockscanning':
                if (QNAP.QOS.config.bIsStorageV2) {
                    ajax.url = getCgiUrl(sitePath + 'disk/disk_manage.cgi');
                    ajax.params = {
                        func: 'scan_bad_block',
                        enable: 0,
                        diskID: taskId
                    };
                    ajax.success = function() {
                        var encDiskListStore = Ext.StoreMgr.item(QNAP.QOS.config.T_ENC_DISK_LIST);
                        encDiskListStore.load({
                            params: {
                                'func': 'extra_get',
                                'Enclosure_Info': '1',
                                'enclosureID': parseInt(taskId.substring(0, 4)),
                                'dc': Math.random()
                            }
                        });
                    }
                } else {
                    ajax.url = getCgiUrl(sitePath + 'disk/diskRequest.cgi');
                    ajax.params = {
                        apply: 'sata_finder_stop',
                        dev_no: taskId,
                        subfunc: 'disk_mgmt',
                        kick: 1
                    };
                }
                break;
            case 'secureearsing':
                if (QNAP.QOS.config.bIsStorageV2) {
                    ajax.url = getCgiUrl(sitePath + 'disk/disk_manage.cgi');
                    ajax.params = {
                        func: 'secure_erase_cancel',
                        enc_id: parseInt(taskId.substring(0, 4)),
                        port_id: parseInt(taskId).toString(16)
                    };
                    ajax.success = function() {
                        var encDiskListStore = Ext.StoreMgr.item(QNAP.QOS.config.T_ENC_DISK_LIST);
                        encDiskListStore.load({
                            params: {
                                'func': 'extra_get',
                                'Enclosure_Info': '1',
                                'enclosureID': parseInt(taskId.substring(0, 4)),
                                'dc': Math.random()
                            }
                        });
                    }
                } else {
                    ajax.url = getCgiUrl(sitePath + 'disk/diskRequest.cgi');
                    ajax.params = {
                        apply: 'sata_finder_stop',
                        dev_no: taskId,
                        subfunc: 'disk_mgmt',
                        kick: 1
                    };
                }
                break;
            case 'antiVirus':
                ajax.url = getCgiUrl(sitePath + 'application/appRequest.cgi', {});
                ajax.params = {
                    subfunc: 'antivirus',
                    to_do: 'stop_job',
                    JobID: taskId
                };
                break;
            case 'hdsmart':
                if (QNAP.QOS.config.bIsStorageV2) {
                    ajax.url = getCgiUrl(sitePath + 'disk/qsmart.cgi', {});
                    ajax.params = {
                        func: 'stoptest',
                        kick: 1,
                        type: 1,
                        dev_id: taskId
                    };
                } else {
                    ajax.url = getCgiUrl(sitePath + 'disk/qsmart.cgi', {});
                    ajax.params = {
                        func: 'stoptest',
                        type: 2,
                        hdno: taskId
                    };
                }

                break;
            case 'backupNAStoNAS':
            case 'backupRsync':
                ajax.url = getCgiUrl(sitePath + 'backup/backupRequest.cgi', {});
                ajax.params = {
                    subfunc: 'remote_rep',
                    stop_start: 1,
                    action: 0,
                    bk_pid: taskId
                };
                break;
            case 'backupRTRR':
                ajax.url = getCgiUrl(sitePath + 'backup/qsyncrequest.cgi', {});
                ajax.params = {
                    subfunc: 'remote_rep',
                    qs_act: 'job_stop',
                    name_hidden_job_id: taskId
                };
                break;
            case 'backupLUN':
                ajax.url = getCgiUrl(sitePath + 'disk/lunbackup.cgi', {});
                ajax.params = {
                    act: 'job_stop',
                    subfunc: 'iscsi',
                    Job: taskId
                };
                break;
            case 'mediaLib':
                ajax.url = getCgiUrl(sitePath + 'application/appRequest.cgi', {});
                ajax.params = {
                    subfunc: 'medialib',
                    apply: '1',
                    ml_queue_del_file: taskId
                };
                break;
            case 'mediaLibRTT':
                ajax.url = getCgiUrl(sitePath + 'application/appRequest.cgi');
                ajax.params = {
                    subfunc: 'medialib',
                    apply: '1',
                    kill_rtt_task: taskId
                };
                break;
            case 'backupAmazons3':
                ajax.url = getCgiUrl(QNAP.QOS.config.sitePath + 'backup/backupRequest.cgi');
                ajax.params = {
                    subfunc: 'cloudbackup',
                    amazons3: 'stop',
                    name: taskId
                };
                break;
        }
        QNAP.QOS.ajax(ajax);
    },
    /**
     * [pauseNasTask description]
     * @param  {Sring}   taskType  [description]
     * @param  {String}   taskId    [description]
     * @param  {Int}   delaytime [description]
     * @param  {Function} callback  [description]
     * @return {[type]}             [description]
     */
    pauseNasTask: function(taskType, taskId, delaytime, callback) {
        var getCgiUrl = QNAP.QOS.lib.getCgiUrl;
        var sitePath = QNAP.QOS.config.sitePath;
        var ajax = {
            params: {},
            success: function() {
                _D('Pause [' + taskType + '] taskId : ' + taskId);
            },
            callback: function() {
                callback();
            }
        };
        switch (taskType) {
            case 'mediaLibScanning':
                ajax.url = getCgiUrl(sitePath + 'application/appRequest.cgi');
                ajax.params = {
                    subfunc: 'medialib',
                    apply: '1',
                    ml_gen_thumb_pause: 1,
                    ml_gen_thumb_delay: delaytime
                };
                break;
            case 'mediaLib':
                ajax.url = getCgiUrl(sitePath + 'application/appRequest.cgi', {});
                ajax.params = {
                    subfunc: 'transcode',
                    apply: '1',
                    ml_ts_pause: 1,
                    ml_ts_delay: delaytime
                };
                break;
        }
        QNAP.QOS.ajax(ajax);
    },
    /**
     * [rerumeNasTask description]
     * @param  {Sring}   taskType [description]
     * @param  {Sring}   taskId   [description]
     * @param  {Function} callback [description]
     * @return {[type]}            [description]
     */
    resumeNasTask: function(taskType, taskId, callback) {
        var getCgiUrl = QNAP.QOS.lib.getCgiUrl;
        var sitePath = QNAP.QOS.config.sitePath;
        var ajax = {
            params: {},
            success: function() {
                _D('Resume [' + taskType + '] taskId : ' + taskId);
            },
            callback: function() {
                callback();
            }
        };
        switch (taskType) {
            case 'mediaLibScanning':
                ajax.url = getCgiUrl(sitePath + 'application/appRequest.cgi');
                ajax.params = {
                    subfunc: 'medialib',
                    apply: '1',
                    ml_gen_thumb_pause: 0
                };
                break;
            case 'mediaLib':
                ajax.url = getCgiUrl(sitePath + 'application/appRequest.cgi', {});
                ajax.params = {
                    subfunc: 'transcode',
                    apply: '1',
                    ml_ts_pause: 0
                };
                break;
        }
        QNAP.QOS.ajax(ajax);
    },
    removeQPKG: Ext.emptyFn,
    enableQPKG: function(qpkgName, callbackFn) {
        QNAP.QOS.ajax({
            url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'application/appRequest.cgi', {
                subfunc: 'qpkg'
            }, {
                qname: qpkgName,
                apply: 3
            }),
            method: 'POST',
            success: function() {
                callbackFn();
            },
            failure: Ext.emptyFn
        });
    },
    disableQPKG: function(qpkgName, callbackFn) {
        QNAP.QOS.ajax({
            url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'application/appRequest.cgi', {
                subfunc: 'qpkg'
            }, {
                qname: qpkgName,
                apply: 4
            }),
            method: 'POST',
            success: function() {
                callbackFn();
            },
            failure: Ext.emptyFn
        });
    },
    execFn: function(fnId, callback) {
        var fnInfo = QNAP.QOS.lib.getAppInfo(fnId);
        Ext.Loader.load(fnInfo.js, callback);
    },
    /***************************************************************************
     * 記錄最後執行項目
     */
    saveLastApp: function(appId) {
        QNAP.QOS.user.lastApp.splice(0, 0, appId);
        QNAP.QOS.user.lastApp = QNAP.QOS.user.lastApp.splice(0, 5);
        this.saveConfig('lastApp', QNAP.QOS.user.lastApp);
    },
    createApp: function(appId, config) {
        var me = this;
        var appInfo = {};
        Ext.apply(appInfo, QNAP.QOS.lib.getAppInfo(appId));
        Ext.apply(appInfo, config);
        var appInstance;
        try {
            appInstance = new QNAP.QOS[appId](appInfo, config);
        } catch (e) {
            _D('[Error] appId => ', appId);
            _D(e.stack);
            appInstance = new QNAP.QOS[appId].main(appInfo);
        }
        me.addAppInstance(appInstance);
        return appInstance;
    },
    openViewer: function() {
        os.openApp('MediaViewer');
    },
    /**
     * qpkgID==qpkg internalName
     * @param  {[type]} qpkgId [description]
     * @return {[type]}        [description]
     */
    getQPKGqData: function(qpkgId) {
        var qData = null,
            collection = null;

        collection = os.qpkgStore.query('appId', new RegExp('^' + RegExp.escape(qpkgId) + '$', 'i'));
        if (collection.getCount() > 0) {
            var qpkgInfo = collection.itemAt(0).data;
            qData = {
                newWin: true,
                appId: qpkgId,
                type: 'QPKG',
                bindApp: false,
                data: qpkgInfo,
                displayName: qpkgInfo.displayName || qpkgInfo.name,
                icon: qpkgInfo.icon,
                config: {
                    icon: qpkgInfo.icon,
                    qInternationalKey: qpkgInfo.qInternationalKey
                }
            };

            var extendInfo = os.qpkgInfoStore.query('internalName', new RegExp('^' + RegExp.escape(qpkgId) + '$', 'i')).itemAt(0);
            if (extendInfo) {
                qData.displayName = qData.config.displayName = extendInfo.get('name');
            }
        }
        return qData;
    },
    /**
     * [getStatusMap description]
     * @param  {[type]} statusName [description]
     * @return {[type]}            [description]
     */
    getStatusMap: function(statusName) {
        var map = {};
        switch (statusName) {
            case 'LinceseStatus':
                map = {
                    NOT_SUPPORT: 0,
                    ACTIVATE: 1,
                    NO_LICENSE: 2,
                    TRIAL_LICENSE_EXPIRED: 3
                };
                break;
        }
        return map;
    },
    /**
     * 1 : Status is already activation. Probably Paid License or Trial License
     * 2 : It does not install Paid License and Trial License
     * 3 : It does not any activation license. Trial License has been installed and expired
     * @param  {Boolean} async true = async query, default false.
     * @param  {String} qpkgName QPKG internalName.
     * @param  {Object} option ajax option.
     * @return {int} if async=false, return license status(0|1|2|3),
     * else return transactionId The id of the server transaction.
     * This may be used to cancel the request.
     */
    checkQPKGLicenseStatus: function(async, qpkgName, option) {
        async = async === true;
        var cgiPath = 'application/appRequest.cgi';
        var parmas = {
            subfunc: 'survielance',
            license_check: '1',
            app_id: qpkgName
        };

        if (async) {
            var info = {
                url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + cgiPath),
                params: parmas
            };
            Ext.applyIf(info, option);
            return QNAP.QOS.ajax(info);
        }
        var request = QNAP.QOS.lib.getXMLHttpRequest();
        if (request) {
            parmas.sid = QNAP.QOS.user.sid;
            request.open('POST', QNAP.QOS.config.sitePath + 'application/appRequest.cgi', false); // `false` makes the request synchronous
            request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
            request.send(Ext.urlEncode(parmas));
            if (request.status === 200) {
                var xmlData = request.responseXML;
                if (xmlData) {
                    var lic = Ext.DomQuery.selectNumber('lic', xmlData);
                    return lic;
                }
            }
            /**
             * request faile or error, return 1
             */
            return 1;
        }

    },
    /**
     * create tasks to watching unfinished task, like install QPKG
     * @param  {[type]} taskId  [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    createTask: function(taskId, options) {
        os.stopTask(taskId);
        switch (taskId) {
            case 'qpkgInstall':
                os.tasks[taskId] = {
                    run: function() {
                        QNAP.QOS.ajax({
                            url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'application/appRequest.cgi'),
                            method: 'POST',
                            scope: this,
                            params: {
                                subfunc: "qpkg",
                                apply: 1,
                                getstatus: 1,
                                r: Math.random()
                            },
                            success: function(response) {
                                var xmlData = response.responseXML,
                                    selectNumber = Ext.DomQuery.selectNumber,
                                    updateStatus = selectNumber('updateStatus', xmlData),
                                    downloadStatus = selectNumber('downloadStatus', xmlData),
                                    downloadPercent = selectNumber('downloadPercent', xmlData),
                                    taskOptions = this.options;
                                if (updateStatus == -1 && downloadStatus == -1 && downloadPercent === 0) {
                                    os.stopTask('qpkgInstall');
                                } else if (updateStatus == 3 && downloadStatus == 3 && downloadPercent === 0) {
                                    os.onServiceUpdate(os.id, 'qpkg', {
                                        name: taskOptions.name,
                                        displayName: taskOptions.displayName,
                                        action: 'install'
                                    });
                                    os.stopTask('qpkgInstall');
                                } else if (updateStatus == -99) {
                                    os.stopTask('qpkgInstall');
                                }

                            }
                        });
                    },
                    options: options,
                    interval: 1000 * 30 // 30 second
                };
                Ext.TaskMgr.start(os.tasks[taskId]);
                break;
        }
    },
    /**
     * stop createTask item
     * @param  {[type]} taskId [description]
     * @return {[type]}        [description]
     */
    stopTask: function(taskId) {
        if (os.tasks[taskId]) {
            Ext.TaskMgr.stop(os.tasks[taskId]);
            os.tasks[taskId] = undefined;
        }
    },
    /**
     * save fn name
     * @type {Object}
     */
    fnMap: {},
    loadFn: function(fnName, callbackFn, args, scope) {
        if (os.fnMap[fnName]) {
            callbackFn.apply(scope || window, args);
        } else {
            Ext.Loader.load(['/cgi-bin/' + fnName + '.js?' + URL_RANDOM_NUM], function() {
                os.fnMap[fnName] = true;
                callbackFn.apply(scope || window, args);
            });
        }
    },
    isValidPassword: function(password, username) {
        var errStr = [];
        username = username || QNAP.QOS.user.account;

        function escapeSpecialChars(str) {
            str = str.replace(/\[/, '\\[');
            str = str.replace(/\\/, '\\\\');
            str = str.replace(/\^/, '\\^');
            str = str.replace(/\$/, '\\$');
            str = str.replace(/\./, '\\.');
            str = str.replace(/\|/, '\\|');
            str = str.replace(/\?/, '\\?');
            str = str.replace(/\*/, '\\*');
            str = str.replace(/\+/, '\\+');
            str = str.replace(/\(/, '\\(');
            str = str.replace(/\)/, '\\)');
            return str;
        }

        function strictPasswordBaselineCheck(str, threshold) {
            var pwdBaselineCount = 0;
            if (/[a-z]+/.test(str)) {
                pwdBaselineCount++;
            }
            if (/[A-Z]+/.test(str)) {
                pwdBaselineCount++;
            }
            if (/[0-9]+/.test(str)) {
                pwdBaselineCount++;
            }
            if (/[!"#$%&'()*+,-.\/:;<=>?@\[\\\]\^_`{|}~]+/.test(str)) {
                pwdBaselineCount++;
            }
            return (pwdBaselineCount >= threshold);
        }

        function noRepeatedCharsCheck(str, threshold) {
            var suffix = '';
            var i;
            for (i = 1; i < threshold; i++) {
                suffix += '\\1';
            }
            var filter = new RegExp('(.{1})' + suffix, '');
            return !filter.test(str);
        }

        function noUsernameCheck(str, username) {
            var temp = username;

            if (temp.length > 0) {
                var filter = new RegExp(escapeSpecialChars(temp) + '|' + escapeSpecialChars(reverseStr(temp)), 'i');
                return !filter.test(str);
            }
            return true;
        }

        function noCiscoVariationsCheck(str) {
            return !/cisco|ocsic/i.test(str.replace(/[1!|]{1}/g, 'i').replace(/0/g, 'o').replace(/\$/g, 's'));
        }

        function reverseStr(str) {
            var length = str.length;
            var ret = '';
            var x;
            for (x = length; x >= 0; x--) {
                ret += str.charAt(x);
            }
            return ret;
        }

        if (QNAP.QOS.config.pwdRules & 1 && !strictPasswordBaselineCheck(password, 3)) {
            errStr.push(_S.IEI_NAS_PASSSTRENGTH1);
        }

        if (QNAP.QOS.config.pwdRules & 2 && !noRepeatedCharsCheck(password, 3)) {
            errStr.push(_S.IEI_NAS_PASSSTRENGTH2);
        }

        if (QNAP.QOS.config.pwdRules & 4 && !noUsernameCheck(password, username)) {
            errStr.push(_S.IEI_NAS_PASSSTRENGTH3);
        }

        if (QNAP.QOS.config.pwdRules & 8 && !noCiscoVariationsCheck(password)) {
            errStr.push(_S.IEI_NAS_PASSSTRENGTH4);
        }

        return errStr;
    },
    getQPKGNotifyMsg: function(msgCode, varContent) {
        var varContents = varContent.split(';');
        var displayName = this.getQPKGDisplayName(varContents[0]);
        if (displayName) {
            varContents[0] = displayName;
        } else if (varContents[1]) {
            varContents[0] = varContents[1];
        }
        return ['[App Center]', String.format.apply(this, [_S[msgCode]].concat(varContents))];
    },
    getTaskNotifyMsg: function(facility, facilityStr, type, name, msgCode, varNum, varContent, desc) {
        var facilityMap = this.facilityMap;
        var slideMsgTitle, slideMsgContent;

        function GetDiskDisplay_hal(diskID) {
            var display = '',
                idList = diskID.split(';');
            display = GetDeviceName_hal(parseInt(idList[0])) + ': ' + _S.IEI_NAS_STORAGE82 + ' ' + parseInt(idList[1]);
            return display;
        }

        function GetDeviceName_hal(id) {
            var JbodStr = (id == QNAP.QOS.config.VJBOD_ENC_ID) ? _S.SMB_VIRTUAL_DISK_MENU : _S.DEVICE_NAME_JBOD.replace('%n%', id);
            return (id == 0) ? _S.DEVICE_NAME_NAS : JbodStr;
        }

        switch (facility) {
            case facilityMap.SMART:
                slideMsgTitle = _S.IEI_NAS_MISC13_V2;
                break;
            case facilityMap.ANTIVIRUS:
                slideMsgTitle = _S.IEI_AV_TITLE;
                break;
            case facilityMap.BAK_EXTERNAL_DRIVCE:
                slideMsgTitle = _S.IEI_NAS_BUTTON_BACKUP + ' - ' + _S.S_MENU_33;
                break;
            case facilityMap.BAK_RTRR:
                slideMsgTitle = _S.IEI_NAS_BUTTON_BACKUP + ' - ' + _S.BACKUP_CLIENT_STRING02;
                break;
            case facilityMap.BAK_RSYNC:
                switch (msgCode) {
                    /**
                     * NAS to NAS
                     */
                    case 'MSG_RR_004':
                    case 'MSG_RR_005':
                    case 'MSG_RR_006':
                        slideMsgTitle = _S.IEI_NAS_BUTTON_BACKUP + ' - ' + _S.MISC_SCH_TITLE_STR26;
                        break;
                    default:
                        slideMsgTitle = _S.IEI_NAS_BUTTON_BACKUP + ' - ' + _S.BACKUP_CLIENT_STRING01;
                        break;
                }
                break;
            case facilityMap.BAK_LUN:
                slideMsgTitle = _S.QTS_LUN_MSG_1;
                break;
            case facilityMap.BAK_AMAZON_S3:
                slideMsgTitle = _S.IEI_NAS_BUTTON_BACKUP + ' - ' + _S.MISC_DEF_STR18;
                break;
            case facilityMap.MEDIA_LIB:
            case facilityMap.VIDEO_TRANSCODE:
            case facilityMap.VIDEO_TRANSCODE_RTT:
                slideMsgTitle = _S.MEDIA_LIB_STR_00;
                break;
            case facilityMap.BLOCK_SCANNING:
                if (/^(11|12|13|14)$/.test(type)) {
                    slideMsgTitle = _S.SYSTEM_TRAY_07;
                }
                break;
            case facilityMap.VALUME:
                switch (msgCode) {
                    case 'MSG_VO_001':
                    case 'MSG_VO_002':
                    case 'MSG_VO_003':
                        /*
                        Formate volume started/completed/failed
                        */
                        slideMsgTitle = _S.NOTIFY_MSG_TITTLE_01;
                        break;
                    case 'MSG_VO_011':
                    case 'MSG_VO_012':
                    case 'MSG_VO_013':
                        /*
                        Checking volume started/completed/failed
                        */
                        slideMsgTitle = _S.NOTIFY_MSG_TITTLE_02;
                        break;
                    case 'MSG_VO_009':
                    case 'MSG_VO_010':
                    case 'MSG_VO_014':
                        /*
                        Rebuilding volume started/completed/skiped
                        */
                        slideMsgTitle = _S.NOTIFY_MSG_TITTLE_03;
                        break;
                    case 'MSG_VO_015':
                    case 'MSG_VO_016':
                    case 'MSG_VO_017':
                        /*
                        Synchronizing volume started/completed/skiped
                        */
                        slideMsgTitle = _S.NOTIFY_MSG_TITTLE_04;
                        break;
                    case 'MSG_VO_018':
                    case 'MSG_VO_019':
                    case 'MSG_VO_020':
                    case 'MSG_VO_024':
                    case 'MSG_VO_025':
                    case 'MSG_VO_026':
                        /*
                        Exanding RAID volume started/completed/skiped
                        [18-20] RAID Exanding
                        [24-26] HD Exanding
                        */
                        slideMsgTitle = _S.NOTIFY_MSG_TITTLE_05;
                        break;
                    case 'MSG_VO_021':
                    case 'MSG_VO_022':
                    case 'MSG_VO_023':
                        /*
                         *	Synchronizing started/completed/skiped
                         */
                        slideMsgTitle = _S.NOTIFY_MSG_TITTLE_06;
                        break;
                    case 'MSG_DK_204':
                    case 'MSG_DK_204_ICP':
                    case 'MSG_DK_304_SLOT':
                        slideMsgTitle = _S.NOTIFY_MSG_TITTLE_07; //'Disk Detected';
                        break;
                    case 'MSG_DK_205':
                        slideMsgTitle = _S.NOTIFY_MSG_TITTLE_08; //'Enclosure Detected';
                        break;
                    case 'MSG_DK_206':
                        slideMsgTitle = _S.NOTIFY_MSG_TITTLE_09; //'Enclosure Ejected';
                        break;
                    case 'MSG_VO_027':
                    case 'MSG_VO_028':
                    case 'MSG_VO_029':
                        /*
                        Remove volume started/completed/failed
                        */
                        slideMsgTitle = _S.VOLUME_REMOVE_TITLE;
                        break;
                    case 'MSG_VO_032':
                    case 'MSG_VO_033':
                    case 'MSG_VO_034':
                        slideMsgTitle = _S.DATA_SCRUBBING_STR04;
                        break;
                    case 'MSG_DK_001':
                    case 'MSG_DK_101':
                    case 'MSG_DK_201':
                    case 'MSG_DK_002':
                    case 'MSG_DK_102':
                    case 'MSG_DK_202':
                    case 'MSG_DK_003':
                    case 'MSG_DK_103':
                    case 'MSG_DK_203':
                    case 'MSG_DK_201_ICP':
                    case 'MSG_DK_202_ICP':
                    case 'MSG_DK_203_ICP':
                    case 'MSG_DK_201_PCI':
                    case 'MSG_DK_202_PCI':
                    case 'MSG_DK_203_PCI':
                        slideMsgTitle = _S.SYSTEM_TRAY_07;
                        break;
                    default:
                        slideMsgTitle = facilityStr;
                        break;
                }
                break;
            case facilityMap.ONE_TOUCH_COPY:
                switch (msgCode) {
                    case 'MSG_OTC_007':
                    case 'MSG_OTC_008':
                    case 'MSG_OTC_009':
                        slideMsgTitle = _S.SMART_IMPORT_STR01_1;
                        break;
                    default:
                        slideMsgTitle = _S.MISC_USB_COPY_STRING01;
                        break;
                }
                break;
            case facilityMap.APP_NOTIFY:
                slideMsgTitle = os.getQPKGDisplayName(name) || name;
                break;
        }

        var varContents = varContent.split(';');
        if (_S[msgCode] && (varNum == varContents.length || varNum === 0)) {
            var orgMsg = false;
            if (/MSG_VO_/.test(msgCode)) {
                orgMsg = true;
                varContents[0] = os.desktop.getVolumeDisplayName(varContents[0], desc);
                if (varContents[0].length == 0) {
                    varContents[0] = name;
                }
            } else if (/MSG_DK_204/.test(msgCode)) {
                orgMsg = true;
                if (typeof(QNAP.QOS.config.CacheEncId) != 'undefined' && varContents[0] == QNAP.QOS.config.CacheEncId) {
                    if (msgCode.indexOf('_ICP') == -1)
                        msgCode += '_ICP';
                    varContents[0] = varContents[1];
                } else {
                    varContents[0] = GetDiskDisplay_hal(varContent);
                }
            } else if (/MSG_DK_205/.test(msgCode) || /MSG_DK_206/.test(msgCode)) {
                orgMsg = true;
                varContents[0] = GetDeviceName_hal(varContents[0]);
            } else if (/MSG_DK_20/.test(msgCode)) {
                if (typeof(QNAP.QOS.config.CacheEncId) != 'undefined' && varContents[0] == QNAP.QOS.config.CacheEncId) {
                    if (msgCode.indexOf('_ICP') == -1)
                        msgCode += '_ICP';
                    varContents[0] = varContents[1];
                } else if (typeof(QNAP.QOS.config.PCIeEncId) != 'undefined' && typeof(QNAP.QOS.config.PCIeEncId[varContents[0]]) != 'undefined') {
                    if (msgCode.indexOf('_PCIE') == -1)
                        msgCode += '_PCIE';
                    varContents[0] = QNAP.QOS.config.PCIeEncId[varContents[0]].Slot;
                }
            } else if (msgCode === 'QTS_QPKG_INSTALLED' || /^MSG_QPKG_/.test(msgCode)) {
                var displayName = os.getQPKGDisplayName(varContents[0]);
                if (displayName) {
                    varContents[0] = displayName;
                } else if (varContents[1]) {
                    varContents[0] = varContents[1];
                }
            }


            slideMsgContent = String.format.apply(this, [_S[msgCode]].concat(varContents));
        } else {
            slideMsgContent = desc;
        }
        return [slideMsgTitle, slideMsgContent];
    },
    getExtraTaskNotifyMsg: function(appName, msgCode, varNum, varContent, desc) {
        var extraTaskStore;
        var title, meg;
        var varContents = varContent.split(';');

        extraTaskStore = os.getExtraTaskStore(appName);

        if (extraTaskStore) {
            if (extraTaskStore._S[msgCode] && (varNum == varContents.length || varNum === 0)) {
                meg = String.format.apply(this, [extraTaskStore._S[msgCode]].concat(varContents));
            } else {
                meg = desc;
            }
        }

        title = os.getQPKGDisplayName(appName) || appName;

        return [title, meg];
    },
    getQPKGDisplayName: function(internalName) {
        var collection = os.qpkgInfoStore.query('internalName', new RegExp('^' + RegExp.escape(internalName) + '$', 'i'));
        if (collection.getCount() > 0) {
            return collection.get(0).get('name');
        } else {
            return false;
        }
    },
    /**
     * for QTS official and beta version compare
     * @param  {String} verA Version A, like "4.2.0 Build 20150925"
     * @param  {String} verB Version B, like "4.2.0 Build 20150925"
     * @return {Boolean} if verA >= verB return true
     */
    compareVersions: function(verA, verB) {
        if (/^(none|error)/i.test(verA)) {
            return false;
        }

        if (verA === verB) {
            return true;
        }

        return QNAP.QOS.lib.isNewerVersion(verB, verA);
    },
    gmailOAuth: function(callback, appId) {
        var url = QNAP.QOS.config.cloudURL + '/oauth2/connect?';
        url += 'app_id=HDvlM4cW2NTkFf9S4YTXeKFP&provider=gmail';
        url += '&scope=https://mail.google.com/ https://www.googleapis.com/auth/userinfo.email';
        url += '&cb=' + QNAP.QOS.config.rootUrl + '/cgi-bin/apps/personalSettings/oauth/oauth_cb.html?windowId=' + appId;
        os.oauthWin = window.open('/cgi-bin/apps/personalSettings/oauth/r.html?r=' + encodeURIComponent(url), 'oauthWin', 'height=530,width=500,top=0,left=100,scrollbars=yes');
    },
    /**
     * getQPKG record
     * @param  {String} internalName QPKG internal name.
     * @param  {Boolean} incloudeInvisible incloude invisible qpkg, defaults true.
     * @return {Mix} Record or false(not install or invisible)
     */
    getQPKG: function(internalName, incloudeInvisible) {
        var qpkgStore = os.qpkgStore;
        var qpkg;

        incloudeInvisible = incloudeInvisible === false ? incloudeInvisible : true;

        if (qpkgStore) {
            qpkg = qpkgStore.getById(internalName) || false;
            if (qpkg === false && incloudeInvisible === true) {
                Ext.each(qpkgStore.hideQPKGs, function(hideQPKG) {
                    if (hideQPKG.id === internalName) {
                        qpkg = hideQPKG;
                        return false;
                    }
                });
            }
        }

        return qpkg;
    },
    /**
     * @param  {String} title If want hide title, use false
     * @param  {Object} items Right side content
     * @param  {Object} fbar  If want hide fbar, use false
     * @param  {String} icon  defaults _INFO_ICON
     * @return {Window}       message window
     */
    getMsgWindow: function(title, items, fbar, icon) {

        icon = icon || this._INFO_ICON;
        items = items || {};

        if (fbar !== false) {
            fbar = fbar || [];
        }

        if (Ext.isArray(items)) {
            items = {
                xtype: 'container',
                cls: 'ext-mb-content',
                items: items
            };
        } else if (Ext.isObject(items)) {
            if (items instanceof Ext.Component) {
                items.addClass('ext-mb-content');
            } else {
                items.cls = [items.cls || '', 'ext-mb-content'].join(' ');
            }
        }
        var winCls = ['app-dlg', 'q-msg-win'];
        if (title === false) {
            winCls.push('no-title');
        }

        var win = new QNAP.QOS.modalWindow({
            title: _S[title] || title,
            qInternational: true,
            qInternationalKey: title,
            boxMaxWidth: 450,
            boxMinWidth: 340,
            boxMinHeight: 140,
            closable: true,
            maximizable: false,
            minimizable: false,
            modal: true,
            layout: 'auto',
            height: 'auto',
            cls: winCls.join(' '),
            bodyCssClass: 'x-dlg-icon',
            items: [{
                xtype: 'box',
                cls: 'ext-mb-icon',
                html: {
                    tag: 'img',
                    src: icon
                }
            }, items],
            fbar: fbar,
            buttonAlign: 'right'
        });
        return win;
    },
    addExtraTask: function(appName, taskListURL) {
        var dataStore, storeId, extraTaskStore;
        dataStore = os.dataStore;
        storeId = 'extraTask_' + appName;
        if (dataStore[storeId]) {
            dataStore[storeId].proxy.setUrl(taskListURL);
            dataStore[storeId].load();
        } else {
            extraTaskStore = new QNAP.QOS.ExtraTaskStore(appName, taskListURL);
            extraTaskStore.load({
                callback: function() {
                    os.fireEvent('extrataskfirstload');
                }
            });
            dataStore[extraTaskStore.storeId] = extraTaskStore;
        }
        return dataStore[storeId];
    },
    getExtraTaskStore: function(appName) {
        var dataStore, storeId;
        dataStore = os.dataStore;
        storeId = 'extraTask_' + appName;
        return dataStore[storeId] || false;
    },
    /**
     *
     * @param  {Function} callback function
     *
     * @since 4.2.2
     */
    getPowerSchedule: function(callback, scope) {
        QNAP.QOS.ajax({
            url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'sys/sysRequest.cgi', {
                subfunc: 'power_mgmt',
                action: 'get_schedule_skip',
            }),
            method: 'POST',
            scope: scope || this,
            success: function(res) {
                var TYPE_SEQ;
                var queryVal, next, schedules, closestTime, closestType;
                TYPE_SEQ = {
                    shutdown: 1,
                    reboot: 2,
                    sleep: 3,
                    unknown: 99
                };
                queryVal = Ext.DomQuery.selectValue;
                queryNum = Ext.DomQuery.selectNumber;
                next = false;
                schedules = Ext.DomQuery.select('schedule_next', res.responseXML);
                closestTime = 691200; // 8 day
                closestType = TYPE_SEQ.unknown;
                Ext.each(schedules, function(schedule, index) {
                    var remainTime, type;
                    remainTime = queryNum('remain_time', schedule);
                    type = queryVal('type', schedule);

                    if (closestTime > remainTime) {
                        next = schedule;
                        closestTime = remainTime;
                        closestType = type;
                    } else if (closestTime === remainTime &&
                        TYPE_SEQ[closestType] > TYPE_SEQ[type]) {
                        next = schedule;
                        closestTime = remainTime;
                        closestType = type;
                    }
                });
                if (next) {
                    QNAP.QOS.config.powerSchedule = {
                        type: queryVal('type', next),
                        year: queryNum('year', next),
                        mon: queryNum('mon', next),
                        day: queryNum('day', next),
                        hour: queryNum('hour', next),
                        min: queryNum('min', next),
                        alertTime: queryNum('alert_time', next),
                        remainTime: queryNum('remain_time', next)
                    };
                } else {
                    delete QNAP.QOS.config.powerSchedule;
                }
            },
            callback: callback || Ext.emptyFn
        });
    },
    /**
     * @param  {Function} callback function
     * @param  {Object} scope
     * @since 4.2.2
     */
    skipNextPowerPower: function(callback, scope) {
        var powerSchedule = QNAP.QOS.config.powerSchedule;
        var params = {
            year: powerSchedule.year,
            month: powerSchedule.mon,
            day: powerSchedule.day,
            hour: powerSchedule.hour,
            min: powerSchedule.min
        };
        params[powerSchedule.type] = 1;
        QNAP.QOS.ajax({
            url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'sys/sysRequest.cgi', {
                subfunc: 'power_mgmt',
                apply: 'set_schedule_skip'
            }),
            params: params,
            method: 'POST',
            scope: scope || this,
            success: Ext.emptyFn,
            callback: callback || Ext.emptyFn
        });
    },
    /**
     * @param  {Object} xml response from authLogin
     * @since 4.3.0
     */
    qHaStatusAndLock: function(_xml) {
        var dQuery = Ext.DomQuery;
        var objHA = {
            operation_status: dQuery.selectValue('ha_operation_status', _xml, ''),
            fw_updating: dQuery.selectValue('ha_fw_updating', _xml, ''),
            switching: dQuery.selectValue('ha_switching', _xml, ''),
            active_ip: dQuery.selectValue('ha_active_ip', _xml, '')
        };

        if (typeof(QNAP.QOS.config.qHaCfg) == 'undefined') {
            QNAP.QOS.config.qHaCfg = objHA;
        } else {
            Ext.apply(QNAP.QOS.config.qHaCfg, objHA);
        }

        if (objHA.operation_status !== '') {
            if (QNAP.QOS.config.qHaCfg.active_ip != '--') {
                function doAlert() {
                    QNAP.QOS.user.common.levWarn = false;
                    Ext.Msg.alert('High Availability',
                        _S.QHA_LOCK_LOGIN.replace('{0}', QNAP.QOS.config.qHaCfg.active_ip),
                        function() {
                            window.location.href = window.location.protocol + '//' + QNAP.QOS.config.qHaCfg.active_ip + ':' + window.location.port;
                        }
                    );
                }
                if (os.initFinish) {
                    doAlert();
                } else {
                    os.on({
                        'logincomplete': doAlert,
                        'single': true
                    });
                }
            }
        }

        var qlm_lock = dQuery.selectValue('qlm_lock', _xml, '-1');
        var qlm_active_ip = dQuery.selectValue('qlm_active_ip', _xml, '');
        if (qlm_lock != -1) {
            var alert = window.alert,
                confirm = window.confirm;
            if (qlm_lock == 1) {
                if (qlm_active_ip.length > 0) {
                    alert('You can not login to this NAS because the other NAS is active. This NAS will be kept service offline. Click "OK" to redirect to ' + qlm_active_ip);
                    window.location.href = window.location.protocol + '//' + qlm_active_ip + ':' + window.location.port;
                } else {
                    var result = confirm('The current active NAS can not be detected for some reasons. If there are problems with the active NAS, you can shut it down or turn it off then prompt this NAS as the ACTIVE one.\n Do you want to promot this NAS?');
                    if (result) {
                        QNAP.QOS.ajax({
                            url: QNAP.QOS.lib.getCgiUrl(QNAP.QOS.config.sitePath + 'disk/LM.cgi', {
                                'lm_func': 'promotion'
                            }),
                        });
                    }
                }
            } else if (qlm_lock == 2) { // service migrating
                alert('Live Migration is finishing, please wait few minutes, and refresh page again.');
                os.logout();
            } else if (qlm_lock == 3) { //lock & wait the init sync continue
                alert('First time migration syncing is not finished. Please check your source NAS to be on line.');
                os.logout();
            } else if (qlm_lock == 4) { // after promote, src
                alert('Migration destination NAS has been promoted.');
            }
        }
    }
});

QNAP.QOS.app = Ext.extend(Ext.Component, {
    winConfig: {},
    defaultTitle: '',
    tag: '',
    defaultWidth: 700,
    defaultHeight: 500,
    qName: '',
    windowType: 'appWindow',
    constructor: function(config) {
        this.helpArgs = {
            fn: '',
            items: ''
        };
        this._ajaxList = [];
        this._extendApp = {};
        this.addEvents({
            'beforeunload': true,
            'broadcast': true,
            'servicestart': true,
            'servicestop': true,
            'serviceupdate': true,
            'filechange': true,
            'taskstart': true,
            'taskstop': true,
            'taskupdate': true,
            'closeapp': true,
            'initappcomplete': true
        });
        this.doInitApp(config);
        Ext.apply(this, config);
        QNAP.QOS.app.superclass.constructor.call(this);
    },
    _getAppInfo: function() {
        return this.initialConfig;
    },
    _getApp: function() {
        return this;
    },
    _getApps: function() {
        return QNAP.QOS[this.qName]._getApps();
    },
    _createModalWindow: function(config) {
        var win = this._getMainWindow();

        config = Ext.applyIf(config, {
            manager: win.manager,
            parent: win,
            baseWin: win,
            styleVer: 2
        });

        config = Ext.applyIf(config, {
            footer: true
        });

        config.maskParent = !config.collapsible;

        if (config.styleVer === 2) {
            config.cls = [config.cls || '', 'utility-window q-' + this.appId + '-window'].join(' ');
        } else {
            config.cls = [config.cls || '', 'q-' + this.appId + '-window'].join(' ');
        }

        var modalWin = new QNAP.QOS.modalWindow(config);

        if (config.styleVer === 2) {
            modalWin.on('afterrender', function(win) {
                if (win.fbar) {
                    win.fbar.items.each(function(item) {
                        if (item.xtype === 'button' || item.isXType('button')) {
                            if (item.rendered) {
                                item.el.replaceClass('qts-button', 'qts-button');
                            } else {
                                item.cls = [item.cls || '', 'qts-button'].join(' ');
                            }
                        }
                    });
                }
                try {
                    var maxHeight;
                    try {
                        maxHeight = os.desktop.shortcutsView.getHeight();
                    } catch (e) {
                        maxHeight = os.getViewport().getHeight();
                    }

                    maxHeight -= win.header.getHeight();
                    maxHeight -= win.bwrap.down('.x-window-bl').getHeight();
                    maxHeight -= win.body.getPadding('tb');
                    maxHeight -= 10;
                    win.body.setStyle('max-height', maxHeight + 'px');
                    if (win.scrollBar === false) {
                        return;
                    }
                    win.scrollBar = new QNAP.CMP.Plugin.QTSScrollBar({
                        target: win.body
                    });
                    win.on({
                        scope: win.scrollBar,
                        resize: win.scrollBar.updateSize,
                        afterlayout: win.scrollBar.updateSize
                    });
                    if (win.items.get(0).getXType() === 'tabpanel') {
                        win.items.get(0).on({
                            scope: win.scrollBar,
                            tabchange: win.scrollBar.updateSize
                        });
                    }

                } catch (e) {
                    _D(e.stack);
                }
            });
            modalWin.on({
                single: true,
                show: function(win) {
                    if (os.desktop) {
                        var xy = win.el.getAlignToXY(os.desktop.desktop.windowArea.el, 'c-c');
                        win.setPagePosition(xy[0], xy[1]);
                    }
                }
            });
        }

        if (!win.sub_win_pocket) {
            win.sub_win_pocket = win.bwrap.insertHtml('beforeEnd', '<div class="q-sub-win-pocket" style="position: absolute;bottom: 0;right: 12px;height: auto; min-width:300px;"></div>', true);
        }

        if (win) {
            win.mon(modalWin, 'show', function() {
                Ext.getBody().scrollTo('top', 0);
            }, null);
        }
        return modalWin;
    },
    _createWizard: function(config) {

        config = Ext.applyIf(config, {
            manager: this._getMainWindow().manager,
            parent: this._getMainWindow(),
            baseWin: this._getMainWindow()
        });

        config.cls = [config.cls || '', 'q-' + this.appId + '-wiz'].join(' ');

        var wiz = new QNAP.QOS.wizard.modalWindow(config);
        var win = this._getMainWindow();
        if (win) {
            wiz.on('show', function() {
                Ext.getBody().scrollTo('top', 0);
            }, null);
        }
        return wiz;
    },
    _getMainWindow: Ext.emptyFn,
    /**
     * 動態讀取Plugin JS file
     * @param  {[String]} jsFiles     js file path
     * @param  {[String]} pluginNames plugin name
     * @param  {Function} callback    callback function after js loaded
     * @param  {[type]}   args        callback function args
     */
    _loadJsPlugin: function(jsFiles, pluginNames, callback, args) {
        var me = this;
        jsFiles = Ext.isArray(jsFiles) ? jsFiles : [jsFiles];
        pluginNames = Ext.isArray(pluginNames) ? pluginNames : [pluginNames];
        Ext.Loader.load(jsFiles, function() {
            Ext.each(pluginNames, function(name) {
                var plugin = new QNAP.QOS[name]();
                plugin.init(me);
                if (Ext.isArray(me.plugins)) {
                    me.plugins.push(plugin);
                } else if (me.plugins) {
                    var oldPlugins = me.plugins;
                    me.plugins = [];
                    me.plugins.push(oldPlugins);
                    me.plugins.push(plugin);
                } else {
                    me.plugins = plugin;
                }
            });
            if (callback) {
                callback.apply(me, args);
            }
        }, me);
    },
    getId: function() {
        if (!this.id) {
            this.id = 'q-app-' + this.appId + '-' + (++Ext.Component.AUTO_ID);
        }
        return this.id;
    },
    mask: function() {
        var el = this._getMainWindow().getEl();
        el.mask.apply(el, arguments);
    },
    unmask: function() {
        this._getMainWindow().getEl().unmask();
    },
    openHelp: function(args) {
        args = args || this.getHelpArgs();
        os.openApp('helper', args);
    },
    setHelpArgs: function(fn, items) {
        this.helpArgs.fn = fn;
        this.helpArgs.items = items;
    },
    getHelpArgs: function() {
        return this.helpArgs;
    },
    /**
     * get Resume Config
     * @return object
     */
    getResumeCfg: function() {
        return {};
    },
    /**
     *
     * onxxx 為app與os及其他app事件互相通知機制
     */
    onFileChange: Ext.emptyFn,
    onServiceStop: Ext.emptyFn,
    onServiceStart: Ext.emptyFn,
    onServiceUpdate: Ext.emptyFn,
    onBroadcast: Ext.emptyFn,
    /**
     * doxxx 為app內部通知機制
     */
    doInitApp: function(config) {
        var me = this;
        if (me.APP_CSS && Ext.isEmpty(Ext.get(config.appId + '_css'))) {
            Ext.util.CSS.createStyleSheet(me.APP_CSS, config.appId + '_css');
        }
        me.initApp(config);
    },
    reqAjax: function(params) {
        var me = this;
        var ajax;

        if (Ext.isFunction(params.callback)) {
            params.callback = Ext.createInterceptor(params.callback, me.removeAjax, me);
        } else {
            params.callback = Ext.createDelegate(me.removeAjax, me);
        }

        ajax = QNAP.QOS.ajax(params);
        me._ajaxList.push(ajax);
        return ajax;
    },
    removeAjax: function(options, success, response) {
        var tId = response.tId;

        Ext.each(this._ajaxList, function(ajax) {
            if (ajax.tId === tId) {
                this._ajaxList.remove(ajax);
                return false;
            }
        }, this);
    },
    initApp: Ext.emptyFn,
    doCloseApp: function() {
        _D('app .... appclose');
        this.fireEvent('closeapp', this);
        var me = this;
        Ext.each(me._ajaxList, function(ajax) {
            Ext.Ajax.abort(ajax);
            ajax = undefined;
        });
        this.closeApp();
    },
    closeApp: Ext.emptyFn,
    closeWin: Ext.emptyFn,
    getMainWinParams: function() {
        var winParams = {
            title: 'Empty window',
            icon: Ext.BLANK_IMAGE_URL,
            html: 'please overwrite getMainWinParams function'
        };
        return winParams;
    },
    activeApp: Ext.emptyFn,
    _ERROR_ICON: "/cgi-bin/images/tip_icon/error.svg?1509480336",
    _INFO_ICON: "/cgi-bin/images/tip_icon/info.svg?1509480336",
    _QUESTION_ICON: "/cgi-bin/images/tip_icon/help.svg?1509480336",
    _QUESTION_BLUE_ICON: "/cgi-bin/images/tip_icon/help.svg?1509480336",
    _WARNING_ICON: "/cgi-bin/images/tip_icon/warning.svg?1509480336",
    _alert: function(title, msg, btnText, icon, fn, scope) {
        if (Ext.isEmpty(icon)) {
            icon = this._INFO_ICON;
        }
        if (!Ext.isFunction(fn)) {
            fn = Ext.emptyFn;
        }
        var mainWin = this._getMainWindow();
        title = title || mainWin.qInternationalKey || mainWin.title;
        if (!Ext.isArray(btnText)) {
            btnText = ['IEI_NAS_BUTTON_OK'];
        }
        if (this._alertWin) {
            this._alertWin.close();
        }
        var items = {
            xtype: 'box',
            itemId: 'msgText',
            html: _S[msg] || msg,
            qInternational: true,
            qInternationalKey: msg
        };

        var fbar = [{
            text: _S[btnText[0]] || btnText[0],
            qInternational: true,
            qInternationalKey: btnText[0],
            itemId: 'yesBtn',
            ref: '../yesBtn',
            handler: function(btn) {
                fn('yes');
                btn.ownerCt.ownerCt.close();
            }
        }];
        this._alertWin = this._msgWindow(title, items, fbar, icon).show();
        return this._alertWin;
    },
    /**
     * [_alertWindow description]
     * @param  {String} title title string, default use app title, false to hide title
     * @param  {[type]} items [description]
     * @param  {[type]} fbar  [description]
     * @param  {[type]} icon  [description]
     * @param  {window} parentWin  [description]
     * @return {[type]}       [description]
     */
    _alertWindow: function(title, items, fbar, icon, parentWin) {
        var mainWin = this._getMainWindow();
        if (title !== false) {
            title = title || mainWin.qInternationalKey || mainWin.title;
        }

        icon = icon || this._INFO_ICON;

        if (fbar !== false) {
            fbar = fbar || [];
        }

        items = items || {};

        if (Ext.isArray(items)) {
            items = {
                xtype: 'container',
                cls: 'ext-mb-content',
                items: items
            };
        } else if (Ext.isObject(items)) {
            if (items instanceof Ext.Component) {
                items.addClass('ext-mb-content');
            } else {
                items.cls = [items.cls || '', 'ext-mb-content'].join(' ');
            }
        }
        var winCls = ['app-dlg', 'q-msg-win'];
        if (title === false) {
            winCls.push('no-title');
        }

        var alertWin = this._createModalWindow({
            parent: parentWin || this._getMainWindow(),
            title: _S[title] || title,
            qInternational: true,
            qInternationalKey: title,
            boxMaxWidth: 450,
            boxMinWidth: 340,
            boxMinHeight: 140,
            closable: true,
            maximizable: false,
            minimizable: false,
            layout: 'auto',
            height: 'auto',
            cls: winCls.join(' '),
            bodyCssClass: 'x-dlg-icon',
            items: [{
                xtype: 'box',
                cls: 'ext-mb-icon',
                html: {
                    tag: 'img',
                    src: icon
                }
            }, items],
            fbar: fbar,
            buttonAlign: 'right'
        });
        return alertWin;
    },
    _msgWindow: function() {
        return this._alertWindow.apply(this, arguments);
    },
    _wait: function(msg, parentWin) {
        parentWin = parentWin || this._getMainWindow();
        return parentWin.getEl().mask(msg);
    },
    _confirm: function(title, msg, btnText, icon, fn, scope) {
        if (Ext.isEmpty(icon)) {
            icon = this._QUESTION_ICON;
        }
        if (!Ext.isFunction(fn)) {
            fn = Ext.emptyFn;
        }
        var mainWin = this._getMainWindow();
        title = title || mainWin.qInternationalKey || mainWin.title;
        if (!Ext.isArray(btnText)) {
            btnText = ['IEI_NAS_BUTTON_OK', 'IEI_NAS_BUTTON_CANCEL'];
        }
        if (this._confirmWin) {
            this._confirmWin.close();
        }
        var items = {
            xtype: 'box',
            itemId: 'msgText',
            html: _S[msg] || msg,
            qInternational: true,
            qInternationalKey: msg
        };

        var fbar = [{
            text: _S[btnText[0]] || btnText[0],
            qInternational: true,
            qInternationalKey: btnText[0],
            itemId: 'yesBtn',
            ref: '../yesBtn',
            handler: function(btn) {
                fn('yes');
                try {
                    btn.ownerCt.ownerCt.close();
                } catch (err) {

                }
            }
        }, {
            text: _S[btnText[1]] || btnText[1],
            qInternational: true,
            qInternationalKey: btnText[1],
            itemId: 'noBtn',
            ref: '../noBtn',
            handler: function(btn) {
                fn('no');
                try {
                    btn.ownerCt.ownerCt.close();
                } catch (err) {

                }
            }
        }];
        this._confirmWin = this._msgWindow(title, items, fbar, icon).show();
        return this._confirmWin;
    },
    _progress: Ext.emptyFn,
    initAppComplete: function() {
        this.initAppCompleted = true;
        this.fireEvent('initappcomplete');
    },
    _log: function() {
        var output, mainArguments;
        mainArguments = Array.prototype.slice.call(arguments);
        output = ['%c[' + this.appId + ']', 'background-color:#bcc0ea;color:#000'];
        console.log.apply(console, output.concat(mainArguments));
    }
});
/**
 * @since 2012/11/12
 * @description 修改命名規則 class 項目皆為大寫
 * @type
 */
QNAP.QOS.BaseApp = QNAP.QOS.App = QNAP.QOS.app;

/**
 * <p>
 * 將畫面切割為上,下,左,右,中間五個操作區塊,
 * 其中上下左右皆可隱藏
 * </p>
 * @class QNAP.QOS.BorderApp
 * @extends QNAP.QOS.app
 */
QNAP.QOS.BorderApp = Ext.extend(QNAP.QOS.app, {
    /**
     * <p>統一透過 properties 存放UI properties</p>
     *
     * @type Object
     */
    regionProperties: {
        center: null,
        north: null,
        south: null,
        west: null,
        east: null
    },
    centerCmp: null,
    northCmp: null,
    southCmp: null,
    eastCmp: null,
    westCmp: null,
    getCenterCmp: function() {
        return this.centerCmp;
    },
    getNorthCmp: function() {
        return this.northCmp;
    },
    getSouthCmp: function() {
        return this.southCmp;
    },
    getEastCmp: function() {
        return this.eastCmp;
    },
    getWestCmp: function() {
        return this.westCmp;
    },
    initCenterRegion: Ext.emptyFn,
    initNorthRegion: Ext.emptyFn,
    initSouthRegion: Ext.emptyFn,
    initWestRegion: Ext.emptyFn,
    initEastRegion: Ext.emptyFn,
    initWindowEvents: Ext.emptyFn,
    doAfterrender: Ext.emptyFn,
    setRegionProperties: function(region, properties) {
        var me = this;
        me.regionProperties[region] = properties;
    },
    switchERegion: function(btn) {
        var me = this;
        var cmp = me._getMainWindow().layout.east;
        if (cmp.isCollapsed || !cmp.panel.isVisible()) {
            cmp.panel.show();
            cmp.beforeExpand(true);
            cmp.onExpand();
            cmp.el.setStyle('z-index', 'auto');
            cmp.panel.fireEvent('expand', cmp.panel);
        } else {
            btn.setDisabled(true);
            var proxy = cmp.panel.getEl().createProxy({
                cls: 'region-proxy'
            }, null, true).slideOut('r', {
                duration: 0.2
            });
            cmp.panel.hide();
            cmp.beforeCollapse(null, true);
            cmp.onCollapse(true);
            setTimeout(function() {
                proxy.remove();
                btn.setDisabled(false);
                cmp.panel.fireEvent('collapse', cmp.panel);
            }, 250);
        }
    },
    switchWRegion: function(btn) {
        var me = this;
        var cmp = me._getMainWindow().layout.west;
        if (cmp.isCollapsed || !cmp.panel.isVisible()) {
            cmp.panel.show();
            cmp.beforeExpand(true);
            cmp.onExpand();
            cmp.panel.fireEvent('expand', cmp.panel);
        } else {
            btn.setDisabled(true);
            var proxy = cmp.panel.getEl().createProxy({
                cls: 'region-proxy'
            }, null, true).slideOut('l', {
                duration: 0.2
            });
            cmp.panel.hide();
            cmp.beforeCollapse(null, true);
            cmp.onCollapse(true);
            setTimeout(function() {
                proxy.remove();
                btn.setDisabled(false);
                cmp.panel.fireEvent('collapse', cmp.panel);
            }, 250);
        }
    },
    getMainWinParams: function(cfg) {
        var me = this;
        var items = [];
        var hasNorthRegion = false;
        me.setRegionProperties('center', me.initCenterRegion() || null);
        me.setRegionProperties('north', me.initNorthRegion() || null);
        me.setRegionProperties('south', me.initSouthRegion() || null);
        me.setRegionProperties('west', me.initWestRegion() || null);
        me.setRegionProperties('east', me.initEastRegion() || null);
        if (Ext.isObject(me.regionProperties.center)) {
            me.centerCmp = Ext.create(me.regionProperties.center, 'container');
            me.centerCmp.addClass('center-area');
            me.centerCmp.margins = '0';
            if (me.centerCmp.isXType('form')) {
                me.centerCmp.border = false;
            }
            items.push(me.centerCmp);
        }

        if (Ext.isObject(me.regionProperties.west)) {
            var maxW = parseInt(os.getViewport().getWidth() / 3, 10);
            var west = Ext.apply(me.regionProperties.west, {
                minSize: Math.min(maxW, 239),
                maxSize: Math.max(maxW, 239)
            });
            me.westCmp = Ext.create(west, 'panel');
            me.westCmp.addClass('west-area');
            me.westCmp.margins = '0';
            me.westCmp.collapseMode = 'mini';
            me.westCmp.width = Math.min(maxW, 239);
            if (me.westCmp.collapsed) {
                me.westCmp.hidden = true;
                me.westCmp.collapsed = false;
            }
            items.push(me.westCmp);
        }
        if (Ext.isObject(me.regionProperties.east)) {
            var east = Ext.apply(me.regionProperties.east, {
                minSize: 239,
                maxSize: 439
            });
            me.eastCmp = Ext.create(east, 'panel');
            me.eastCmp.addClass('east-area');
            me.eastCmp.collapseMode = 'mini';
            me.eastCmp.margins = '0';
            if (me.eastCmp.collapsed) {
                me.eastCmp.hidden = true;
                me.eastCmp.collapsed = false;
            }
            items.push(me.eastCmp);
        }
        if (Ext.isObject(me.regionProperties.north)) {
            var northPty = me.regionProperties.north;
            if (me.eastCmp) {
                northPty.xtype = 'toolbar';
                var hasSplit = false;
                Ext.each(northPty.items, function(item) {
                    if (Ext.isString(item) && item == '->') {
                        hasSplit = true;
                        return false;
                    }
                    if (Ext.isObject(item) && item.xtype == 'tbfill') {
                        hasSplit = true;
                        return false;
                    }
                });
                if (!hasSplit) {
                    northPty.items.push('->');
                }
                northPty.items.push({
                    xtype: 'button',
                    cls: 'east-switch-btn none-bg-btn',
                    enableToggle: true,
                    pressed: !(me.eastCmp.hidden || me.eastCmp.collapsed),
                    width: 27,
                    height: 24,
                    tooltip: !(me.eastCmp.hidden || me.eastCmp.collapsed) ? 'QTS_H_RIGHT_R' : 'QTS_S_RIGHT_R',
                    handler: Ext.createDelegate(me.switchERegion, me),
                    listeners: {
                        toggle: function(btn, pressed) {
                            btn.setTooltip(pressed ? 'QTS_H_RIGHT_R' : 'QTS_S_RIGHT_R');
                        }
                    }
                });
            }
            if (me.westCmp) {
                northPty.xtype = 'toolbar';
                northPty.items.splice(0, 0, {
                    xtype: 'button',
                    cls: 'west-switch-btn none-bg-btn',
                    enableToggle: true,
                    pressed: !(me.westCmp.hidden || me.westCmp.collapsed),
                    width: 27,
                    height: 24,
                    tooltip: !(me.westCmp.hidden || me.westCmp.collapsed) ? 'QTS_H_LEFT_L' : 'QTS_S_LEFT_L',
                    handler: Ext.createDelegate(me.switchWRegion, me),
                    listeners: {
                        toggle: function(btn, pressed) {
                            btn.setTooltip(pressed ? 'QTS_H_LEFT_L' : 'QTS_S_LEFT_L');
                        }
                    }
                });
            }
            if (!northPty.layoutConfig) {
                northPty.layoutConfig = {
                    extraCls: 'q-gap-s'
                };
            }
            me.northCmp = Ext.create(northPty, 'toolbar');
            me.northCmp.addClass('north-area');
            me.northCmp.margins = '0';
            items.push(me.northCmp);
            hasNorthRegion = true;
        }
        if (Ext.isObject(me.regionProperties.south)) {
            me.southCmp = Ext.create(me.regionProperties.south, 'container');
            me.southCmp.margins = '0';
            me.southCmp.addClass('south-area');
            items.push(me.southCmp);
        }
        if (!hasNorthRegion) {
            me.winBaseCls = 'q-window';
        }
        var winParams = {
            title: _S[cfg.qInternationalKey] || cfg.defaultTitle,
            qInternational: true,
            qInternationalKey: cfg.qInternationalKey || cfg.defaultTitle,
            layout: 'border',
            layoutConfig: {
                getCollapsedEl: function() {
                    return '<div></div>';
                },
                minWidth: 0
            },
            cls: me.winBaseCls + ' hide-title q-app-window',
            items: items,
            listeners: {
                beforerender: me.initWindowEvents,
                afterrender: me.doAfterrender,
                scope: me
            }
        };

        Ext.applyIf(winParams, me.winConfig);
        return winParams;
    },
    winBaseCls: 'q-window-border'
});

QNAP.QOS.ExtraTaskStore = function(appName, taskListURL) {
    var storeId = 'extraTask_' + appName;
    var convertWithLang = Ext.createDelegate(this.convertWithLang, this);
    var config = {
        _S: {},
        loaded: false,
        root: 'datas.tasks',
        url: taskListURL,
        baseParams: {
            sid: QNAP.QOS.user.sid
        },
        storeId: storeId,
        appName: appName,
        loadLang: false,
        delay: 15000 * QNAP.QOS.config.platformRadix,
        reloadTask: new Ext.util.DelayedTask(function() {
            this.load();
        }, this),
        fields: [{
                name: 'jobID',
                mapping: 'task_id'
            }, {
                name: 'name',
                mapping: 'task_name'
            }, {
                name: 'type',
                mapping: 'type_name',
                convert: convertWithLang,
            }, {
                name: 'origType',
                mapping: 'type_name'
            },
            'status',
            'remain',
            'retry',
            'icon',
            'link',
            'act_stop',
            'act_pause',
            'act_resume',
            {
                name: 'progress',
                convert: this.convertProgress
            },
            {
                name: 'status_msg',
                convert: convertWithLang
            },
            {
                name: 'supportPause',
                convert: this.convertSupportPause
            },
            {
                name: 'paused',
                convert: this.convertPaused
            },
            {
                name: 'uiGroup',
                convert: this.convertUIGroup
            },
            {
                name: 'info'
            },
            {
                name: 'srcStore',
                defaultValue: storeId
            }
        ]
    };

    QNAP.QOS.ExtraTaskStore.superclass.constructor.call(this, config);
    this.on({
        scope: this,
        load: this.onLoad,
        update: this.onUpdate,
        exception: this.exception
    });
    os.on('resetlang', this.loadTaskLang, this);
};

QNAP.QOS.ExtraTaskStore.STATUS_MAP = {
    UNEXECUTED: 0,
    PROCESSING_WITH_PERCENT: 1,
    PROCESSING_WITH_REMAIN: 2,
    PROCESSING: 3,
    RETRY: 4,
    PAUSE: 5,
    WAIT: 6,
    FINISH: 7,
    FAILED: 8,
    MANULE_CANCEL: 9
};
Ext.extend(QNAP.QOS.ExtraTaskStore, Ext.data.JsonStore, {
    STATUS_MAP: QNAP.QOS.ExtraTaskStore.STATUS_MAP,
    delay: 15000, // 15 x 1000, 15 sec.
    onUpdate: function(store, extRcd, operation) {
        var jobID, srcStore, num, newR, extData, finishTaskList;

        finishTaskList = os.dataStore.finishTaskList;
        extData = extRcd.data;
        jobID = extData.jobID;
        srcStore = extData.srcStore;

        num = finishTaskList.findBy(function(viewRcd) {
            var viewData;

            viewData = viewRcd.data;

            if (viewData.jobID === jobID &&
                viewData.srcStore === srcStore) {
                viewRcd.beginEdit();

                viewData.lockMask = false;
                viewRcd.markDirty();
                if (viewData.uiGroup === 'doing' &&
                    extData.uiGroup === 'done') {
                    viewData.endTimeSec = new Date().getTime();
                    viewRcd.set('uiGroup', 'done');
                }

                Ext.apply(viewData, extData);
                viewRcd.endEdit();
                return true;
            }
        });

        if (extRcd.get('uiGroup') === 'doing' && num === -1) {
            newR = extRcd.copy();
            newR.set('cat', 'extra');
            finishTaskList.add(newR);
        }

        finishTaskList.commitChanges();
    },
    onLoad: function() {
        var needReload, finishTaskList, rmList;

        finishTaskList = os.dataStore.finishTaskList;
        needReload = false;
        rmList = [];

        this.loadTaskLang();
        finishTaskList
            .query('srcStore', this.storeId)
            .each(function(viewRcd) {
                var vData, vJobID;

                viewData = viewRcd.data;
                vJobID = viewData.jobID;
                rmFlag = true;

                this.each(function(extRcd) {
                    if (extRcd.get('jobID') === vJobID) {
                        rmFlag = false; // viewRcd is exist
                        return false; // exit loop
                    }
                });

                if (rmFlag) {
                    rmList.push(viewRcd);
                }

            }, this);

        finishTaskList.remove(rmList);

        this.each(function(extRcd) {
            this.onUpdate(this, extRcd);
            if (extRcd.get('uiGroup') === 'doing') {
                needReload = true;
            }
        }, this);
        if (needReload) {
            this.reloadTask.delay(this.delay);
        }
        finishTaskList.sort('endTimeSec', 'DESC');
        finishTaskList.commitChanges();
    },
    /**
     * 1. check store current language is the same with QTS Desktop language
     * Yes -> skip load
     * No  -> load it
     * 2. after load language file put it in store, cours only this store use these string
     * 3. update record
     */
    loadTaskLang: function() {
        var langPath, qtsCurLang;

        try {
            if (Ext.isString(this.reader.jsonData.datas.lang_js)) {
                this.langPath = this.reader.jsonData.datas.lang_js + '/lang_{0}.js';
            } else {
                return true;
            }
        } catch (e) {
            return true;
        }

        qtsCurLang = QNAP.QOS.lib.getCurLangCode();
        if (this.curLang === qtsCurLang) {
            return true;
        }

        langPath = String.format(this.langPath, qtsCurLang);

        Ext.Loader.load([langPath], function() {
            var appName;
            appName = this.appName;
            if (this._S = window['_Q_STRING_' + appName]) {
                this.curLang = qtsCurLang;
            }
            os.fireEvent('extrataskupdatelang');
            this.updateDataByLang();

            window['_Q_STRING_' + appName] = undefined;
            try {
                delete window['_Q_STRING_' + appName];
            } catch (e) {}
        }, this, true);
    },
    updateDataByLang: function() {
        if (this._S) {
            this.each(function(record) {
                var json;
                json = record.json;
                record.beginEdit();
                record.set('type', this.convertWithLang(json.type_name));
                record.set('status_msg', this.convertWithLang(json.status_msg));
                record.commit();
            }, this);
        }
    },
    convertWithLang: function(v) {
        if (this._S) {
            return this._S[v] || v;
        } else {
            return v;
        }

    },
    convertSupportPause: function(v, record) {
        var STATUS_MAP, support;
        STATUS_MAP = QNAP.QOS.ExtraTaskStore.STATUS_MAP;
        support = false;

        switch (record.status) {
            case STATUS_MAP.UNEXECUTED:
            case STATUS_MAP.PAUSE:
            case STATUS_MAP.FINISH:
            case STATUS_MAP.FAILED:
            case STATUS_MAP.MANULE_CANCEL:
                break;
            case STATUS_MAP.PROCESSING_WITH_PERCENT:
            case STATUS_MAP.PROCESSING_WITH_REMAIN:
            case STATUS_MAP.PROCESSING:
            case STATUS_MAP.RETRY: // retry
            case STATUS_MAP.WAIT: // WAIT
                if (Ext.isString(record.act_pause)) {
                    support = true;
                }
                break;
        }
        return support;
    },
    convertPaused: function(v, record) {
        return record.status === QNAP.QOS.ExtraTaskStore.STATUS_MAP.PAUSE;
    },
    convertProgress: function(v, record) {
        if (Ext.isNumber(v)) {
            v = (Math.min(1, Math.max(0, v)) * 100).toFixed(1);
            if (v === '100.0') {
                v = '100';
            }
            return v;
        } else {
            return 0;
        }
    },
    convertUIGroup: function(v, record) {
        var STATUS_MAP, uiGroup;

        STATUS_MAP = QNAP.QOS.ExtraTaskStore.STATUS_MAP;
        uiGroup = 'doing';

        switch (record.status) {
            case STATUS_MAP.UNEXECUTED:
            case STATUS_MAP.FINISH:
            case STATUS_MAP.FAILED:
            case STATUS_MAP.MANULE_CANCEL:
                uiGroup = 'done';
                break;
        }

        return uiGroup;
    },
    exception: function(misc) {
        this.reloadTask.delay(this.delay);
    }
});
