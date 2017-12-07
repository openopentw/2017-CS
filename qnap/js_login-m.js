if (history.pushState) {
    history.pushState({}, "", "./")
}
var ua = navigator.userAgent;
var isiPad = /iPad/i.test(ua);
var isiPod = /iPod/i.test(ua);
var isiPhone = /iPhone/i.test(ua);
var isAndroid = /android/i.test(ua);
ua = null;
var supportTouchEvent = "ontouchstart" in window;
var supportDOMContentLoadedEvent = "DOMContentLoaded" in document;
var isValidResetPwd = false;
var ezEncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var ezDecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);
var autoRefreshFlag, emergencyCount = 0,
    emergencyLimit = 5,
    need2sv = "0",
    lostPhone = "3";
document.addEventListener("DOMContentLoaded", function() {
    var d = navigator.userAgent || navigator.vendor;
    if (/(iphone|ipod|ipad)/ig.test(d)) {
        os.addClass(os.get("body")[0], "ios")
    } else {
        if (/android/ig.test(d)) {} else {
            os.addClass(os.get("body")[0], "hide-apps")
        }
    }
    mask();
    updateString();
    os.get("body")[0].addEventListener("orientationChanged", updateOrientation, false);
    var g = os.get("loginBtn");
    g.onclick = login;
    os.get("okBtn").onclick = hideMsg;
    os.get("yesBtn").onclick = hideMsg;
    os.get("noBtn").onclick = hideMsg;
    os.get("cancelBtn").onclick = hideMsg;
    os.get("aboutQnap").onclick = function() {
        switchUI("about-frame")
    };
    os.get("setPwd").onclick = function() {
        switchUI("pwdSetting-frame")
    };
    os.get("findNas").onclick = startBuzzer;
    os.get("restart").onclick = os.reboot;
    os.get("shutdown").onclick = os.shutdown;
    os.get("loginForm").onsubmit = function() {
        os.get("body")[0].focus();
        login();
        return false
    };
    var f = os.get("button");
    addTouchEvent(f);
    var c = document.querySelectorAll("#mappLinks div");
    addTouchEvent(c);
    var c = document.querySelectorAll("#tools-frame .field");
    addTouchEvent(c);
    var h = os.get("account");
    var b = os.get("accountMask");
    h.onfocus = function(j) {
        os.addClass(b, "hidden")
    };
    h.onchange = function(j) {
        os.addClass(b, "hidden")
    };
    h.onkeydown = function(j) {
        os.addClass(b, "hidden")
    };
    h.onblur = function(k) {
        var j = k.target.value;
        j = j.replace(/^\s+|\s+$/g, "");
        if (j == "") {
            os.removeClass(b, "hidden")
        } else {
            os.addClass(b, "hidden")
        }
        k.target.value = j
    };
    var a = os.get("pwd");
    var e = os.get("pwdMask");
    a.onfocus = function(j) {
        os.addClass(e, "hidden")
    };
    a.onchange = function(j) {
        os.addClass(e, "hidden")
    };
    a.onkeydown = function(j) {
        os.addClass(e, "hidden")
    };
    a.onblur = function(k) {
        var j = k.target.value;
        if (j == "") {
            os.removeClass(e, "hidden")
        } else {
            os.addClass(e, "hidden")
        }
        k.target.value = j
    };
    initUI();
    if (os.getCookie("redirectLogin") == "true") {
        os.setCookie("redirectLogin", "");
        login()
    }
    initAppLink();
    checkSid()
}, false);

function updateOrientation() {
    var c = document.getElementById("viewport");
    var a = 1;
    if (window.orientation && window.orientation % 180 == 0) {
        a = screen.width / 640
    } else {
        a = screen.height / 960
    }
    if (a > 1) {
        a = 1
    }
    var b = "width=device-width,";
    if (screen.width * window.devicePixelRatio < 640) {
        b = "width=640,target-densitydpi=device-dpi,"
    } else {
        b = "width=device-width,target-densitydpi=device-dpi,"
    }
    b += "  initial-scale=" + a + ", maximum-scale=" + a + ", minimum-scale=" + a + ", user-scalable=no";
    c.setAttribute("content", b);
    setTimeout(hideURLbar, 0)
}
updateOrientation();

function utf16to8(e) {
    var b, d, a, f;
    b = "";
    a = e.length;
    for (d = 0; d < a; d++) {
        f = e.charCodeAt(d);
        if ((f >= 1) && (f <= 127)) {
            b += e.charAt(d)
        } else {
            if (f > 2047) {
                b += String.fromCharCode(224 | ((f >> 12) & 15));
                b += String.fromCharCode(128 | ((f >> 6) & 63));
                b += String.fromCharCode(128 | ((f >> 0) & 63))
            } else {
                b += String.fromCharCode(192 | ((f >> 6) & 31));
                b += String.fromCharCode(128 | ((f >> 0) & 63))
            }
        }
    }
    return b
}

function utf8to16(g) {
    var b, e, a, h;
    var f, d;
    b = "";
    a = g.length;
    e = 0;
    while (e < a) {
        h = g.charCodeAt(e++);
        switch (h >> 4) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                b += g.charAt(e - 1);
                break;
            case 12:
            case 13:
                f = g.charCodeAt(e++);
                b += String.fromCharCode(((h & 31) << 6) | (f & 63));
                break;
            case 14:
                f = g.charCodeAt(e++);
                d = g.charCodeAt(e++);
                b += String.fromCharCode(((h & 15) << 12) | ((f & 63) << 6) | ((d & 63) << 0))
        }
    }
    return b
}

function ezDecode(h) {
    var g, f, d, b;
    var e, a, c;
    a = h.length;
    e = 0;
    c = "";
    while (e < a) {
        do {
            g = ezDecodeChars[h.charCodeAt(e++) & 255]
        } while (e < a && g == -1);
        if (g == -1) {
            break
        }
        do {
            f = ezDecodeChars[h.charCodeAt(e++) & 255]
        } while (e < a && f == -1);
        if (f == -1) {
            break
        }
        c += String.fromCharCode((g << 2) | ((f & 48) >> 4));
        do {
            d = h.charCodeAt(e++) & 255;
            if (d == 61) {
                return c
            }
            d = ezDecodeChars[d]
        } while (e < a && d == -1);
        if (d == -1) {
            break
        }
        c += String.fromCharCode(((f & 15) << 4) | ((d & 60) >> 2));
        do {
            b = h.charCodeAt(e++) & 255;
            if (b == 61) {
                return c
            }
            b = ezDecodeChars[b]
        } while (e < a && b == -1);
        if (b == -1) {
            break
        }
        c += String.fromCharCode(((d & 3) << 6) | b)
    }
    return c
}

function ezEncode(g) {
    var c, e, a;
    var f, d, b;
    a = g.length;
    e = 0;
    c = "";
    while (e < a) {
        f = g.charCodeAt(e++) & 255;
        if (e == a) {
            c += ezEncodeChars.charAt(f >> 2);
            c += ezEncodeChars.charAt((f & 3) << 4);
            c += "==";
            break
        }
        d = g.charCodeAt(e++);
        if (e == a) {
            c += ezEncodeChars.charAt(f >> 2);
            c += ezEncodeChars.charAt(((f & 3) << 4) | ((d & 240) >> 4));
            c += ezEncodeChars.charAt((d & 15) << 2);
            c += "=";
            break
        }
        b = g.charCodeAt(e++);
        c += ezEncodeChars.charAt(f >> 2);
        c += ezEncodeChars.charAt(((f & 3) << 4) | ((d & 240) >> 4));
        c += ezEncodeChars.charAt(((d & 15) << 2) | ((b & 192) >> 6));
        c += ezEncodeChars.charAt(b & 63)
    }
    return c
}

function countStrLen_ex(e) {
    if (typeof e != "string") {
        return false
    }
    var d = e.match(/[\u0080-\u07FF]/g),
        c = e.match(/[\u0800-\uFFFF]/g),
        b = e.match(/[^\u0000-\uFFFF]/g),
        a = e.length + ((d ? d.length : 0) + (c ? c.length * 2 : 0) + (b ? b.length * 3 : 0));
    return a
}

function addTouchEvent(c) {
    if (toString.apply(c) === "[object NodeList]" || toString.apply(c) === "[object HTMLCollection]") {
        for (var b = 0, a = c.length; b < a; b++) {
            addTouchEvent(c[b])
        }
    } else {
        c.addEventListener("touchstart", function(d) {
            os.addClass(d.target, "pressed")
        }, false);
        c.addEventListener("touchmove", function(d) {
            os.removeClass(d.target, "pressed")
        }, false);
        c.addEventListener("touchend", function(d) {
            os.removeClass(d.target, "pressed")
        }, false);
        c.addEventListener("mousedown", function(d) {
            os.addClass(d.target, "pressed")
        });
        c.addEventListener("mouseover", function(d) {
            os.addClass(d.target, "pressed")
        });
        c.addEventListener("mouseup", function(d) {
            os.removeClass(d.target, "pressed")
        });
        c.addEventListener("mouseout", function(d) {
            os.removeClass(d.target, "pressed")
        })
    }
}

function switchSSL() {
    var a = os.get("sslStatus");
    if (os.getSslLinkStatus()) {
        os.setSslLinkStatus(false);
        os.removeClass(a, "switch-on")
    } else {
        os.setSslLinkStatus(true);
        os.addClass(a, "switch-on")
    }
}

function switchRemem(a) {
    var b = os.get("rememStatus");
    if (os.getRemeAccStatus()) {
        os.setRemeAccStatus(false);
        os.removeClass(b, "switch-on")
    } else {
        os.setRemeAccStatus(true);
        os.addClass(b, "switch-on")
    }
}

function hideURLbar() {
    setTimeout(function() {
        window.scrollTo(0, 1)
    }, 0)
}

function checkSid() {
    if (os.user.sid == "") {
        switchUI("login-frame");
        unmask();
        return
    }
    initApps(true);
    switchUI("appList-frame");
    os.checkSidTask()
}

function updateString() {
    var c = document.querySelectorAll(".qstr");
    for (var b = 0, a = c.length; b < a; b++) {
        var d = c[b];
        d.innerHTML = _Q_STRINGS[d.getAttribute("qstrId")] || d.innerHTML
    }
    os.get("scyCode").setAttribute("placeholder", _Q_STRINGS.AUTH_2STEP_29)
}

function setAppLink(d, c) {
    for (var b = 0, a = d.length; b < a; b++) {
        d[b].addEventListener("click", c, true)
    }
}

function initAppLink() {
    var b = os.get("qmanagerLink");
    var a = os.get("qfileLink");
    var c = os.get("moreLink");
    if (isAndroid) {
        setAppLink(b, function() {
            window.location = "https://play.google.com/store/apps/details?id=com.qnap.qmanager"
        });
        setAppLink(a, function() {
            window.location = "https://play.google.com/store/apps/details?id=com.qnap.qfile"
        });
        setAppLink(c, function() {
            window.location = "https://play.google.com/store/apps/developer?id=QNAP"
        })
    }
    if (isiPhone || isiPod || isiPad) {
        setAppLink(b, function(g) {
            try {
                var f = new Date().getTime();
                var d = setTimeout(function() {
                    var e = new Date().getTime();
                    if (e - f > 1100) {
                        return
                    }
                    location.href = "http://itunes.apple.com/tw/app/qmanager/id526337312?mt=8"
                }, 1000);
                window.location = "qnapqmanager://"
            } catch (g) {
                location.href = "http://itunes.apple.com/tw/app/qmanager/id526337312?mt=8"
            }
        });
        setAppLink(a, function() {
            try {
                var g = new Date().getTime();
                var d = setTimeout(function() {
                    var e = new Date().getTime();
                    if (e - g > 1100) {
                        return
                    }
                    location.href = "http://itunes.apple.com/tw/app/qfile/id526330408?mt=8"
                }, 1000);
                window.location = "qnapqfile://"
            } catch (f) {
                location.href = "http://itunes.apple.com/tw/app/qfile/id526330408?mt=8"
            }
        });
        setAppLink(c, function() {
            location.href = "http://itunes.apple.com/tw/artist/qnap-systems-inc./id355826923"
        })
    }
}
var appsAjaxReq = null;

function initApps(c) {
    if (appsAjaxReq) {
        appsAjaxReq.abort()
    }
    if (c) {
        mask()
    }
    var f = "";
    var e = {
        photoStation: "/cgi-bin/images/mobile/photo_70.png",
        webFileManager: "/v3_menu/pic/file-70.png",
        administration: "/cgi-bin/images/mobile/computer.png"
    };
    var d = {
        url: os.config.sitePath + "sysinfoReq.cgi?appsjson=1",
        params: f,
        success: function(r) {
            var p = r.responseText,
                t = JSON.parse(p),
                n = os.get("appLinks"),
                o = "";
            if (t.apps) {
                var k = t.apps.length;
                var s = ["home"];
                while (nd = n.getElementsByTagName("div")[0]) {
                    n.removeChild(nd)
                }
            }
            if (t.lang) {
                os.setCookie("nas_lang", t.lang, 365)
            }
            if (os.user.allowChangePwd) {
                var h = document.createElement("div");
                var q = document.createElement("img");
                q.src = "/cgi-bin/images/mobile/in.png";
                q.className = "in-bg";
                var j = document.createElement("img");
                j.src = "/cgi-bin/images/mobile/change-password.png";
                j.className = "app-icon";
                var g = document.createElement("span");
                g.innerHTML = _Q_STRINGS.IEI_NAS_FIRSTPAGE_STR10;
                g.unselectable = "on";
                g.setAttribute("unselectable", "on");
                h.appendChild(j);
                h.appendChild(g);
                h.appendChild(q);
                n.appendChild(h);
                h.addEventListener("click", function() {
                    switchUI("pwdSetting-frame")
                }, true)
            }
            var m = document.querySelectorAll("#appLinks div");
            addTouchEvent(m)
        },
        callback: function(g) {
            if (c) {
                unmask()
            }
        }
    };
    var b = os.get("appLinks");
    while (nd = b.getElementsByTagName("div")[0]) {
        b.removeChild(nd)
    }
    var a = document.createElement("div");
    os.addClass(a, "wait");
    b.appendChild(a);
    appsAjaxReq = os.ajax(d)
}

function fixIPv6(a) {
    var b = "";
    if (a.indexOf(":") == -1) {
        b = a
    } else {
        b = "[" + a.replace(/[\[\]]/g, "") + "]"
    }
    return b
}

function openWepApp(f) {
    var h = f.target.appData;
    if (h) {
        if (h.id == "administration") {
            os.setCookie("quickopen", "systemPreferences")
        }
        var g = location;
        var c = g.protocol + "//" + fixIPv6(g.hostname);
        c = c.split("?")[0];
        if (window.location.protocol.toUpperCase() == "HTTP:") {
            c += h.url
        } else {
            if (window.location.protocol.toUpperCase() == "HTTPS:") {
                c += h.surl
            }
        }
        c = c.split("?")[0];
        var b = os.get("linkForm");
        var a = os.get("sid");
        var d = os.get("ssid");
        a.value = os.user.sid;
        d.value = os.user.sid;
        b.action = c;
        b.submit()
    }
    return true
}

function resetPwd() {}

function autoRefresh() {
    if (!os.get("sv-form").hasClass("hidden")) {
        location.reload(false)
    } else {}
}

function login() {
    document.activeElement.blur();
    os.get("body")[0].focus();
    var l = os.getCookie("nas_1_u") || "";
    l = decodeURIComponent(ezDecode(l));
    var n = os.get("account").value;
    var q = os.get("pwd").value;
    var o = os.get("scyCode").value;
    var g = os.get("rememStatus").value;
    var h = os.get("sslStatus").value;
    var j = {
        user: n,
        serviceKey: 1
    };
    if (o) {
        j.security_code = o
    }
    var c = false;
    var k = os.getSslLinkStatus();
    if (k && window.location.protocol.toUpperCase() == "HTTP:") {
        c = true
    }
    if (!k && window.location.protocol.toUpperCase() == "HTTPS:") {
        c = true
    }
    if (os.getRemeAccStatus()) {
        j.remme = 1
    }
    var r = os.getCookie("qtoken", false);
    if (r && n == l) {
        j.qtoken = r
    } else {
        j.pwd = ezEncode(utf16to8(q))
    }
    if (c) {
        if (os.getRemeAccStatus()) {
            os.setCookie("remeber", "1")
        }
        os.setCookie("redirectLogin", true);
        os.setCookie("nas_1_u", ezEncode(encodeURIComponent(n)));
        os.setCookie("nas_1_a", ezEncode(ezEncode(utf16to8(q))));
        var b = "";
        if (k) {
            b += "https://" + os.config.serverHost + ":" + os.config.httpsPort + os.config.pathname
        } else {
            b += "http://" + os.config.serverHost + ":" + os.config.httpPort + os.config.pathname
        }
        var a = document.getElementsByTagName("META");
        var e = a[0].parentNode;
        var f = document.createElement("META");
        f.httpEquiv = "refresh";
        f.content = "0; url=" + b;
        e.appendChild(f);
        window.location.href = b;
        return
    } else {
        os.setCookie("redirectLogin", "")
    }
    var d = {
        url: os.config.sitePath + "authLogin.cgi",
        params: j,
        success: function(v) {
            var m = v.responseXML;
            var u = os.nodeValue("authPassed", m, "0");
            var p = os.nodeValue("errorValue", m);
            need2sv = os.nodeValue("need_2sv", m) || "0";
            lostPhone = os.nodeValue("lost_phone", m) || "3";
            emergencyCount = os.nodeValue("emergency_try_count", m) || 0;
            emergencyLimit = os.nodeValue("emergency_try_limit", m) || 0;
            var x = parseInt(os.nodeValue("user_pw_expiry", m) || 0);
            clearTimeout(autoRefreshFlag);
            autoRefreshFlag = setTimeout(autoRefresh, 3600000);
            if (u == "1") {
                var s = os.nodeValue("authSid", m, "");
                var t = os.nodeValue("username", m, "");
                os.setUserData(m);
                os.setHostData(m);
                os.setCookie("NAS_USER", t);
                os.setCookie("home", "1");
                os.setSid(s);
                checkSid();
                if (os.getRemeAccStatus()) {
                    var y = os.nodeValue("qtoken", m, "");
                    var w = 365;
                    os.setCookie("remeber", "1", w);
                    os.setCookie("nas_1_u", ezEncode(encodeURIComponent(n)), w);
                    os.setCookie("nas_1_a", ezEncode(Math.random() + "-x-x-x-" + Math.random()));
                    os.user.account = n;
                    if (y) {
                        os.setCookie("qtoken", y, w)
                    }
                } else {
                    os.setCookie("nas_1_u", "");
                    os.setCookie("nas_1_a", "");
                    os.setCookie("remeber", "");
                    os.setCookie("qtoken", "")
                }
                switchUI("appList-frame");
                initApps(true);
                os.get("nasName").innerHTML = os.config.hostname || ""
            } else {
                if (need2sv === "1") {
                    setTimeout(function() {
                        if (o === "") {
                            show2SVForm()
                        } else {
                            showMsg(_Q_STRINGS.AUTH_2STEP_32, {
                                okBtn: {
                                    text: _Q_STRINGS.IEI_NAS_BUTTON_OK,
                                    fn: hideMsg
                                }
                            })
                        }
                    }, 300)
                } else {
                    if (x === 1) {
                        os.user.ldapResetPwd = "1";
                        os.user.account = n;
                        switchUI("appList-frame");
                        unmask()
                    } else {
                        if (d.params.security_answer) {
                            setTimeout(function() {
                                fireEvent("scyansfailed", n, q, g, h)
                            }, 300)
                        } else {
                            setTimeout(function() {
                                showMsg(_Q_STRINGS.QTS_LOGIN_FAIELD_1, {
                                    okBtn: {
                                        text: _Q_STRINGS.IEI_NAS_BUTTON_OK,
                                        fn: hideMsg
                                    }
                                });
                                fireEvent("loginfailed", n, q, g, h)
                            }, 300)
                        }
                    }
                }
            }
        },
        callback: function(m) {}
    };
    os.ajax(d);
    os.get("loginBtn").blur();
    mask()
}

function logout(b) {
    var a = {
        url: os.config.sitePath + "authLogout.cgi?",
        params: "logout=1&sid=" + os.user.sid,
        success: function(c, d) {}
    };
    mask();
    os.ajax(a);
    os.setCookie("NAS_SID", "");
    os.setCookie("home", "");
    os.setCookie("NAS_SID", "");
    os.setCookie("QFS_SID", "");
    os.setCookie("QDS_SID", "");
    os.setCookie("QMS_SID", "");
    os.setCookie("QPS_SID", "");
    os.setCookie("QMS_SID", "");
    os.setCookie("QMMS_SID", "");
    if (b) {
        window.location.reload(false)
    }
}

function show2SVForm() {
    var d = os.get("loginForm"),
        b = os.get("basic-form"),
        c = os.get("sv-form"),
        a = d.offsetHeight;
    os.addClass(b, "hidden");
    os.removeClass(c, "hidden");
    unmask()
}

function switchUI(h) {
    var c = os.get("nasName-2"),
        m = os.get("leftBtn"),
        a = os.get("rightBtn"),
        k = os.get("frame"),
        e = os.get("logoBar"),
        n = os.get("toolBar"),
        p = os.get("dock"),
        o = os.get("foot");
    os.config.uiStateId = h;
    if (os.user.ldapResetPwd == "1") {
        h = "pwdSetting-frame"
    }
    var b = k.length;
    for (var d = 0; d < b; d++) {
        var g = k[d];
        if (g.id == h) {
            os.removeClass(g, "hidden")
        } else {
            os.addClass(g, "hidden")
        }
    }
    switch (h) {
        case "login-frame":
            os.removeClass(e, "hidden");
            os.removeClass(p, "hidden");
            os.addClass(n, "hidden");
            break;
        default:
            os.removeClass(n, "hidden");
            os.addClass(e, "hidden");
            os.addClass(p, "hidden");
            break
    }
    switch (h) {
        case "login-frame":
        case "appList-frame":
            os.removeClass(o, "hidden");
            break;
        default:
            os.addClass(o, "hidden");
            break
    }
    switch (h) {
        case "appList-frame":
            c.innerHTML = os.config.hostname;
            m.onclick = function() {
                switchUI("tools-frame")
            };
            m.innerHTML = "&nbsp;";
            a.onclick = function(f) {
                logout(true)
            };
            a.innerHTML = _Q_STRINGS.IEI_NAS_TIP_LOGOUT;
            os.removeClass(a, "hidden");
            os.addClass(m, "opt-btn");
            break;
        case "about-frame":
            os.get("versionInfo").innerHTML = _Q_STRINGS.IEI_NAS_SERVER4_VER + ": " + os.config.display_firmware + " " + os.config.firmwareSP + " (" + os.config.buildTime + ")";
            os.get("modelInfo").innerHTML = os.config.modelName;
            c.innerHTML = _Q_STRINGS.V3_MENU_STR38;
            os.addClass(a, "hidden");
            m.innerHTML = _Q_STRINGS.IEI_NAS_BUTTON_BACK;
            m.onclick = function() {
                switchUI("tools-frame")
            };
            os.removeClass(m, "opt-btn");
            break;
        case "tools-frame":
            c.innerHTML = _Q_STRINGS.SYSTEM_TRAY_02;
            os.addClass(a, "hidden");
            m.innerHTML = _Q_STRINGS.IEI_NAS_BUTTON_BACK;
            os.removeClass(m, "opt-btn");
            m.onclick = function() {
                switchUI("appList-frame")
            };
            if (!os.user.allowChangePwd) {
                os.addClass(os.get("setPwd"), "hidden")
            }
            if (!os.user.isAdminGroup) {
                os.addClass(os.get("findNas"), "hidden");
                os.addClass(os.get("restart"), "hidden");
                os.addClass(os.get("shutdown"), "hidden")
            }
            break;
        case "pwdSetting-frame":
            c.innerHTML = _Q_STRINGS.IEI_NAS_FIRSTPAGE_STR10;
            os.removeClass(a, "hidden");
            a.onclick = setPwd;
            a.innerHTML = _Q_STRINGS.NIC_ITUNES_STR025;
            m.innerHTML = _Q_STRINGS.IEI_NAS_BUTTON_BACK;
            m.onclick = function() {
                switchUI("appList-frame")
            };
            os.removeClass(m, "opt-btn");
            if (os.user.ldapResetPwd == "1") {
                m.innerHTML = _Q_STRINGS.IEI_NAS_TIP_LOGOUT;
                m.onclick = function() {
                    logout(true)
                }
            }
            os.get("newPwd").value = "";
            os.get("vrifPwd").value = "";
            os.get("oldPwd").value = "";
            var j = os.get("errMsg");
            os.addClass(j, "hidden");
            break
    }
    os.get("body")[0].focus();
    hideURLbar()
}

function showMsg(o, k) {
    var s = os.get("dlg");
    var j = os.get("dlgBox");
    var e = os.get("dlgMsg");
    var c = os.get("okBtn");
    var t = os.get("yesBtn");
    var b = os.get("noBtn");
    var n = os.get("cancelBtn");
    var r = [c, t, b, n];
    if (k) {
        for (var q = 0, p = r.length; q < p; q++) {
            var h = r[q],
                g = h.id;
            var f = k[g];
            if (f) {
                h.onclick = f.fn;
                h.innerHTML = f.text;
                os.removeClass(h, "hidden");
                clearTimeout(h.task);
                if (f.countdown > 0) {
                    h.cfg = f;
                    updateBtnCd(h)
                } else {
                    f.countdown = 0;
                    h.cfg = f;
                    updateBtnCd(h)
                }
            } else {
                os.addClass(h, "hidden")
            }
        }
    }
    e.innerHTML = o;
    var a = os.get("waitImg");
    os.addClass(a, "hidden");
    os.removeClass(e, "hidden");
    os.removeClass(j, "hidden");
    os.removeClass(s, "hidden");
    var m = (os.get("html")[0].offsetHeight - j.offsetHeight) / 2;
    os.setStyle(j, {
        top: m + "px"
    });
    var d = os.get("body")[0].offsetHeight > os.get("html")[0].offsetHeight ? os.get("body")[0].offsetHeight : os.get("html")[0].offsetHeight;
    os.setStyle(s, {
        height: d + "px"
    })
}

function hideMsg() {
    unmask();
    var a = os.get("dlgMsg");
    os.addClass(a, "hidden");
    os.addClass(dlg, "hidden")
}

function updateBtnCd(b) {
    var a = b.cfg;
    if (a.countdown > 0) {
        b.disabled = true;
        os.addClass(b, "desabled");
        b.innerHTML = a.text + " (" + a.countdown + ")";
        a.countdown--;
        b.task = setTimeout(function() {
            updateBtnCd(b)
        }, 1000)
    } else {
        os.removeClass(b, "desabled");
        b.disabled = false;
        b.innerHTML = a.text
    }
}

function mask() {
    var f = os.get("dlg");
    var b = os.get("waitImg");
    var d = os.get("dlgBox");
    os.addClass(d, "hidden");
    os.removeClass(b, "hidden");
    os.removeClass(f, "hidden");
    for (var a = 1; a <= 5; a++) {
        el = os.get("waitBlock_" + a);
        os.addClass(el, "barlittle-move")
    }
    var e = (os.get("html")[0].offsetWidth - b.offsetWidth) / 2;
    os.setStyle(b, {
        left: e + "px"
    });
    var c = os.get("body")[0].offsetHeight > os.get("html")[0].offsetHeight ? os.get("body")[0].offsetHeight : os.get("html")[0].offsetHeight;
    os.setStyle(f, {
        height: c + "px"
    })
}

function unmask() {
    if (!os.isReady) {
        return
    }
    var c = os.get("dlg");
    var b = os.get("waitImg");
    os.addClass(c, "hidden");
    os.addClass(b, "hidden");
    for (var a = 1; a <= 5; a++) {
        el = os.get("waitBlock_" + a);
        os.removeClass(el, "barlittle-move")
    }
}

function checkPwd(f, h, b) {
    function k(r, s) {
        var p = "";
        p = (typeof s == "object") ? s.getValue() : s;
        if (p.length > 0) {
            var q = new RegExp(d(p) + "|" + d(l(p)), "i");
            return !q.test(r)
        }
        return true
    }

    function l(s) {
        var r = s.length;
        var q = "";
        for (var p = r; p >= 0; p--) {
            q += s.charAt(p)
        }
        return q
    }

    function d(p) {
        p = p.replace(/\[/, "\\[");
        p = p.replace(/\\/, "\\\\");
        p = p.replace(/\^/, "\\^");
        p = p.replace(/\$/, "\\$");
        p = p.replace(/\./, "\\.");
        p = p.replace(/\|/, "\\|");
        p = p.replace(/\?/, "\\?");
        p = p.replace(/\*/, "\\*");
        p = p.replace(/\+/, "\\+");
        p = p.replace(/\(/, "\\(");
        p = p.replace(/\)/, "\\)");
        return p
    }

    function g(s, p) {
        var r = "";
        for (i = 1; i < p; i++) {
            r += "\\1"
        }
        var q = new RegExp("(.{1})" + r, "");
        return !q.test(s)
    }

    function e(r, p) {
        var q = 0;
        if (/[a-z]+/.test(r)) {
            q++
        }
        if (/[A-Z]+/.test(r)) {
            q++
        }
        if (/[0-9]+/.test(r)) {
            q++
        }
        if (/[!"#$%&'()*+,-.\/:;<=>?@\[\\\]\^_`{|}~]+/.test(r)) {
            q++
        }
        return (q >= p)
    }
    var a = [],
        n = false;
    var j = os.user.account;
    var o = os.config.pwdCons;
    if (isValidResetPwd != "1" && h == f) {
        n = true;
        a.push(QUICK11_STR31);
        os.addClass(os.get("newPwd"), "invalid-field")
    }
    if (o.c3 && !k(h, j)) {
        n = true;
        a.push(_Q_STRINGS.IEI_NAS_PASSSTRENGTH3)
    }
    if (o.c2 && !g(h, 3)) {
        n = true;
        a.push(_Q_STRINGS.IEI_NAS_PASSSTRENGTH2)
    }
    if (o.c1 && !e(h, 3)) {
        n = true;
        a.push(_Q_STRINGS.IEI_NAS_PASSSTRENGTH1)
    }
    if (o.c4 && !noCiscoVariationsCheck(newPnewP)) {
        n = true;
        a.push(_Q_STRINGS.IEI_NAS_PASSSTRENGTH4)
    }
    if (h != b) {
        n = true;
        a.push(_Q_STRINGS.USER_GROUP_GREATE_WIZ_STR26)
    }
    var m = os.get("errMsg");
    if (n) {
        var c = [_Q_STRINGS.IEI_NAS_ALERT_BAD_PWD];
        m.innerHTML = '<ul style="list-style:outside;" ><li>' + c.concat(a).join("</li><li>") + "</li></ul>";
        os.removeClass(m, "hidden");
        return true
    } else {
        os.addClass(m, "hidden");
        return false
    }
}

function setPwd() {
    var c = os.get("newPwd").value;
    var a = os.get("vrifPwd").value;
    var b = os.get("oldPwd").value;
    if (checkPwd(b, c, a)) {
        return
    }
    mask();
    os.setPwd(b, c, a)
}

function startBuzzer() {
    os.startBuzzer();
    showMsg(_Q_STRINGS.FIND_MY_NAS, {
        okBtn: {
            text: _Q_STRINGS.STOP_BEEING,
            fn: function() {
                os.stopBuzzer();
                hideMsg()
            }
        }
    })
}

function initUI() {
    var m = os.get("pcLink");
    m.addEventListener("click", function(n) {
        os.setCookie("DESKTOP", "1");
        if (os.user.isAdminGroup) {
            os.setCookie("quickopen", "systemPreferences")
        }
        location.href = "/cgi-bin/index.cgi"
    }, false);
    var d = os.get("rememStatus");
    var k = os.getCookie("redirectLogin");
    if ("ontouchstart" in d) {
        d.addEventListener("touchmove", function(n) {
            n.preventDefault()
        }, false);
        d.ontouchend = switchRemem
    } else {
        d.onclick = switchRemem
    }
    if (os.getRemeAccStatus() || k == "true") {
        os.addClass(d, "switch-on");
        var f = os.getCookie("nas_1_u");
        os.get("account").value = decodeURIComponent(ezDecode(f));
        var b = os.getCookie("nas_1_a") || "-x-x-x-";
        b = ezDecode(ezDecode(b));
        b = utf8to16(b);
        if (os.getCookie("qtoken", "") == "" && k != "true") {
            os.get("pwd").value = ""
        } else {
            if (k == "true") {
                os.get("pwd").value = b
            } else {
                var a = "";
                for (var c = 0; c < 5; c++) {
                    a += parseInt(Math.random() * 10)
                }
                os.get("pwd").value = a;
                var l = os.get("pwdMask");
                os.addClass(l, "hidden")
            }
        }
        var h = os.get("accountMask");
        os.addClass(h, "hidden")
    } else {
        os.removeClass(d, "switch-on")
    }
    if (os.get("account").value.length > 0) {
        var h = os.get("accountMask");
        os.addClass(h, "hidden")
    }
    if (os.get("pwd").value.length > 0) {
        var l = os.get("pwdMask");
        os.addClass(l, "hidden")
    }
    var j = os.get("sslStatus");
    if ("ontouchstart" in j) {
        j.addEventListener("touchmove", function(n) {
            n.preventDefault()
        }, false);
        j.ontouchend = switchSSL
    } else {
        j.onclick = switchSSL
    }
    if (os.config.stunnelEnabled == "1") {
        os.removeClass(j.parentNode, "hidden");
        if (os.config.stunnelEnabled == "1" && os.config.forceSSL == "1") {
            os.setSslLinkStatus(true);
            os.addClass(j.parentNode, "hidden")
        }
    } else {
        os.addClass(j.parentNode, "hidden")
    }
    if (os.getSslLinkStatus()) {
        os.addClass(j, "switch-on")
    } else {
        os.removeClass(j, "switch-on")
    }
    os.get("oldPwd").oninput = function(o) {
        var n = o.target;
        while (n.maxLength < countStrLen_ex(n.value)) {
            n.value = n.value.slice(0, -1)
        }
    };
    os.get("newPwd").oninput = function(o) {
        var n = o.target;
        while (n.maxLength < countStrLen_ex(n.value)) {
            n.value = n.value.slice(0, -1)
        }
    };
    os.get("vrifPwd").oninput = function(o) {
        var n = o.target;
        while (n.maxLength < countStrLen_ex(n.value)) {
            n.value = n.value.slice(0, -1)
        }
    };
    os.get("nasName").innerHTML = os.config.hostname || "";
    os.get("versionInfo").innerHTML = _Q_STRINGS.IEI_NAS_SERVER4_VER + ": " + os.config.display_firmware + " " + os.config.firmwareSP + " (" + os.config.buildTime + ")";
    os.get("modelInfo").innerHTML = os.config.modelName;
    try {
        document.querySelector(".copyright").innerHTML = "&copy;" + os.config.buildTime.substr(0, 4) + " QNAP Systems, Inc. All Rights Reserved."
    } catch (g) {}
    unmask()
}

function QTS() {
    var f = /^\s+|\s+$/g,
        p = /\s+/;
    var r = null;
    var t = false;
    var C = {
        firmware: "",
        display_firmware: "",
        firmwareSP: "",
        buildTime: "",
        modelName: "",
        stunnelEnabled: false,
        forceSSL: false,
        rememberAccountStatus: w("remeber", "0") == "1",
        sslLinkStatus: window.location.protocol.toUpperCase() == "HTTPS:",
        sitePath: "/cgi-bin/",
        rootUrl: location.protocol + "//" + location.host,
        serverPort: location.port,
        serverHost: fixIPv6(location.hostname),
        pathname: location.pathname,
        uiStateId: "",
        pwdCons: {
            c1: false,
            c2: false,
            c3: false,
            c4: false
        }
    };
    var D = {
        sid: w("NAS_SID") || "",
        qtoken: w("qtoken") || "",
        cookieAccount: w("nas_1_u") || "",
        lang: w("nas_lang") || ""
    };
    D.cookieAccount = decodeURIComponent(ezDecode(D.cookieAccount));
    if (D.cookieAccount === "") {
        C.rememberAccountStatus = false;
        o("remeber", "")
    }
    if (D.qtoken.length == 0) {} else {
        var B = "user=" + D.cookieAccount;
        B += "&qtoken=" + D.qtoken;
        B += "&qtokencheck=1";
        var A = {
            url: C.sitePath + "authLogin.cgi",
            params: B,
            success: function(F) {
                var G = F.responseXML;
                if (c("authPassed", G) != "1") {
                    o("qtoken", "")
                }
            },
            callback: function() {
                initUI()
            }
        };
        m(A)
    }
    var A = {
        url: C.sitePath + "authLogin.cgi",
        success: function(F) {
            var G = F.responseXML;
            if (c("doQuick", G, "").length > 0) {
                location.href = c("doQuick", G)
            }
            if (c("user", G, false)) {
                n(G);
                z(G);
                s()
            } else {
                o("NAS_USER", "");
                D.sid = "";
                o("NAS_SID", "");
                o("home", "")
            }
            C.hostname = c("hostname", G, "");
            C.displayModelName = c("displayModelName", G, "");
            C.internalModelName = c("internalModelName", G, "").replace(/\s/g, "");
            C.platform = c("platform", G, "").replace(/\s/g, "");
            C.buildTime = c("buildTime", G, "").replace(/\s/g, "");
            C.stunnelEnabled = c("stunnelEnabled", G);
            C.forceSSL = c("forceSSL", G);
            C.httpPort = c("webAccessPort", G);
            C.httpsPort = c("stunnelPort", G);
            C.pwdCons.c1 = c("passwdConstraint01", G, 0) == 1;
            C.pwdCons.c2 = c("passwdConstraint02", G, 0) == 1;
            C.pwdCons.c3 = c("passwdConstraint03", G, 0) == 1;
            C.pwdCons.c4 = c("passwdConstraint04", G, 0) == 1;
            if (os.getCookie("cloudRelayMode") === "1") {
                C.forceSSL = "1"
            }
            z(G);
            document.title = C.hostname;
            initUI();
            switchUI(C.uiStateId);
            t = true
        }
    };
    if (D.sid.length > 0) {
        A.params = {
            service: "1",
            sid: D.sid
        }
    } else {}
    m(A);

    function E(G) {
        var H = G.success;
        var F = G.fail;
        var I = G.callback;
        if (this.readyState == 4) {
            if (this.status == 200) {
                if (typeof(H) == typeof(Function)) {
                    H.call(this, this)
                }
            } else {
                if (typeof(F) == typeof(Function)) {
                    F.call(this, this)
                }
            }
            if (typeof(I) == typeof(Function)) {
                I.call(this, this)
            }
        }
    }

    function l() {
        var F = false;
        if (window.XMLHttpRequest) {
            F = new XMLHttpRequest()
        } else {
            F = new ActiveXObject("Microsoft.XMLHTTP")
        }
        return F
    }

    function b(F, G) {
        return G.getElementsByTagName(F)
    }

    function a(G, F) {
        return F && (" " + G.className + " ").indexOf(" " + F + " ") != -1
    }

    function w(I) {
        var G = I + "=";
        var K = G.length;
        var F = document.cookie.length;
        var J = 0;
        while (J < F) {
            var H = J + K;
            if (document.cookie.substring(J, H) == G) {
                return y(H)
            }
            J = document.cookie.indexOf(" ", J) + 1;
            if (J == 0) {
                break
            }
        }
        return null
    }

    function y(G) {
        var F = document.cookie.indexOf(";", G);
        if (F == -1) {
            F = document.cookie.length
        }
        return unescape(document.cookie.substring(G, F))
    }

    function o(H, I, J) {
        if (J) {
            var G = new Date();
            G.setTime(G.getTime() + (J * 24 * 60 * 60 * 1000));
            var F = "";
            F = "" + G.toGMTString()
        } else {
            var F = ""
        }
        document.cookie = H + "=" + I + "; expires=" + F + "; path=/"
    }

    function c(F, J, G) {
        var H = b(F, J);
        var I = G || "";
        if (H.length > 0) {
            I = H[0].textContent
        }
        return I
    }

    function m(G) {
        var I = l();
        var F = G.url;
        var J = G.method == "GET" ? "GET" : "POST";
        var H = G.params || "";
        H = j(H);
        if (J == "GET") {
            F += "?" + H + "&r=" + Math.random();
            I.open(J, F, true);
            I.onreadystatechange = function() {
                E.call(I, G)
            };
            I.send()
        } else {
            I.open(J, F, true);
            I.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            I.onreadystatechange = function() {
                E.call(I, G)
            };
            I.send(H + "&r=" + Math.random())
        }
        return I
    }

    function d(H) {
        var G = document.getElementById(H);
        var F = document.getElementsByName(H);
        if (F.length == 0) {
            F = document.getElementsByTagName(H)
        }
        return G || F
    }

    function j(H) {
        var G = "";
        if (typeof H == typeof {}) {
            for (var F in H) {
                if (H.hasOwnProperty(F)) {
                    G += F + "=" + encodeURIComponent(H[F]) + "&"
                }
            }
        } else {
            if (typeof H == typeof "string") {
                G += H
            }
        }
        return G
    }
    var q = null;

    function u() {
        var F = {
            url: C.sitePath + "sys/sysRequest.cgi?subfunc=notification&apply=where_are_you&sid=" + D.sid,
            success: function(G) {}
        };
        m(F)
    }

    function v() {
        q = setInterval(u, 2500);
        u()
    }

    function e() {
        clearInterval(q)
    }

    function x() {
        m({
            url: os.config.sitePath + "sys/sysRequest.cgi?",
            params: {
                subfunc: "power_mgmt",
                apply: "restart",
                sid: D.sid
            },
            method: "POST",
            success: function(F, G) {
                waitReboot.defer(30 * 1000)
            }
        })
    }

    function k() {
        m({
            url: os.config.sitePath + "sys/sysRequest.cgi?",
            params: {
                subfunc: "power_mgmt",
                apply: "shutdown",
                sid: D.sid
            },
            method: "POST",
            success: function(F, G) {}
        })
    }

    function s() {
        r = setTimeout(function() {
            var F = {
                url: C.sitePath + "authLogin.cgi",
                params: {
                    autoCheckSid: "flag",
                    service: "1"
                },
                success: function(G) {
                    var H = G.responseXML;
                    if (c("user", H)) {
                        s()
                    } else {
                        alert(_Q_STRINGS.QTS_CONNECTION_TIMEOUT);
                        logout(true)
                    }
                }
            };
            m(F)
        }, 1000 * 60 * 61)
    }

    function h(G, F) {
        m({
            url: C.sitePath + "sys/sysRequest.cgi",
            params: {
                subfunc: "power_mgmt",
                apply: "rsync_running",
                sid: D.sid
            },
            success: function(H, L) {
                var K = H.responseXML;
                var J = c("rsyncRunning", K);
                var M = "",
                    I = 0;
                if (G == "reboot") {
                    I = 0;
                    if (J == "isRunning") {
                        M = _Q_STRINGS.IEI_NAS_MISC14_4
                    } else {
                        if (J == "notRunning") {
                            M = _Q_STRINGS.IEI_NAS_MISC14_1
                        }
                    }
                } else {
                    if (G == "shutdown") {
                        I = 5;
                        if (J == "isRunning") {
                            M = _Q_STRINGS.IEI_NAS_MISC14_6 + "<br />" + _Q_STRINGS.IEI_NAS_MISC14_5
                        } else {
                            if (J == "notRunning") {
                                M = _Q_STRINGS.IEI_NAS_MISC14_6 + "<br />" + _Q_STRINGS.IEI_NAS_MISC14_2
                            }
                        }
                    }
                }
                showMsg(M, {
                    yesBtn: {
                        text: _Q_STRINGS.IEI_NAS_BUTTON_YES,
                        fn: function() {
                            F();
                            hideMsg()
                        },
                        countdown: I
                    },
                    noBtn: {
                        text: _Q_STRINGS.IEI_NAS_BUTTON_NO,
                        fn: function() {
                            hideMsg()
                        }
                    }
                })
            }
        })
    }

    function g(G, H, F) {
        G = ezEncode(utf16to8(G));
        H = ezEncode(utf16to8(H));
        F = ezEncode(utf16to8(F));
        var I = {
            NEW_PASSWORD: H,
            VERIFY_PASSWORD: F
        };
        if (isValidResetPwd == "1") {
            I.reset_key = resetKey;
            I.endtime = endtime
        } else {
            I.USER_NAME = os.user.account;
            I.OLD_PASSWORD = G
        }
        m({
            url: C.sitePath + "change_password.cgi",
            method: "POST",
            params: I,
            success: function(K, M) {
                var L = K.responseXML;
                var J = c("result", L);
                if (J == "0") {
                    showMsg(_Q_STRINGS.IEI_PASSWORD_NOTE02, {
                        okBtn: {
                            text: _Q_STRINGS.IEI_NAS_BUTTON_OK,
                            fn: function() {
                                mask();
                                logout(true);
                                location.href = "/"
                            }
                        }
                    })
                } else {
                    showMsg(_Q_STRINGS.IEI_PASSWORD_ALERT_TITLE, {
                        okBtn: {
                            text: _Q_STRINGS.IEI_NAS_BUTTON_OK,
                            fn: function() {
                                hideMsg()
                            }
                        }
                    })
                }
            },
            failure: function() {}
        })
    }

    function z(F) {
        C.firmware = c("version", F, C.firmware).replace(/\s/g, "");
        C.firmwareSP = c("sp", F, C.firmwareSP).replace(/\s/g, "");
        C.buildTime = c("buildTime", F, C.buildTime);
        C.modelName = c("displayModelName", F, C.modelName);
        var G = c("number", F, "").replace(/\s/g, "");
        if (G) {
            C.display_firmware = [C.firmware, G].join(".")
        }
    }

    function n(F) {
        D.account = c("username", F);
        o("NAS_USER", D.account);
        D.isAdminGroup = c("isAdmin", F) == 1;
        D.userType = c("userType", F, "");
        switch (D.userType) {
            case "ldap":
                D.allowChangePwd = c("ldapDisallowChangePwd", F, "") == "0";
                break;
            case "domain":
                D.allowChangePwd = false;
                break;
            default:
                D.allowChangePwd = c("user_pw_change", F, 1) != "0";
                break
        }
        D.ldapResetPwd = c("ldapResetPwd", F, "0")
    }
    return {
        isReady: function() {
            return t
        },
        getSslLinkStatus: function() {
            return C.sslLinkStatus
        },
        setSslLinkStatus: function(F) {
            C.sslLinkStatus = F === true ? F : false
        },
        getRemeAccStatus: function() {
            return C.rememberAccountStatus
        },
        setRemeAccStatus: function(F) {
            C.rememberAccountStatus = F === true ? F : false
        },
        setPwd: g,
        buzzer: u,
        startBuzzer: v,
        stopBuzzer: e,
        getCookie: w,
        setCookie: o,
        shutdown: function() {
            mask();
            h("shutdown", k)
        },
        reboot: function() {
            mask();
            h("reboot", x)
        },
        setStyle: function(I, J, H) {
            var F, G;
            if (typeof J != "object") {
                F = {};
                F[J] = H;
                J = F
            }
            for (G in J) {
                H = J[G];
                I.style[G] = H
            }
            return this
        },
        addClass: function(G, F) {
            if (typeof F == "string" && !a(G, F)) {
                G.className += " " + F
            }
            return G
        },
        removeClass: function(I, H) {
            var F, G;
            if (I.className) {
                G = I.className.replace(f, "").split(p);
                if (typeof H == "string") {
                    H = H.replace(f, "");
                    F = G.indexOf(H);
                    if (F != -1) {
                        G.splice(F, 1)
                    }
                }
                I.className = G.join(" ")
            }
            return I
        },
        config: C,
        user: D,
        nodeValue: c,
        select: b,
        get: d,
        checkSidTask: s,
        setSid: function(F) {
            D.sid = F;
            o("NAS_SID", F);
            o("home", "1")
        },
        ajax: m,
        abortAjax: function() {},
        setUserData: n,
        setHostData: z
    }
}
os = QTS();
