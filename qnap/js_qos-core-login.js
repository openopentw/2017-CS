var QNAPTool;
QNAPTool = (function() {
    var w = false,
        c = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
        h = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);
    var g = /^\s+|\s+$/g;

    function k(B) {
        var z, A, e, C;
        z = "";
        e = B.length;
        for (A = 0; A < e; A++) {
            C = B.charCodeAt(A);
            if ((C >= 1) && (C <= 127)) {
                z += B.charAt(A)
            } else {
                if (C > 2047) {
                    z += String.fromCharCode(224 | ((C >> 12) & 15));
                    z += String.fromCharCode(128 | ((C >> 6) & 63));
                    z += String.fromCharCode(128 | ((C >> 0) & 63))
                } else {
                    z += String.fromCharCode(192 | ((C >> 6) & 31));
                    z += String.fromCharCode(128 | ((C >> 0) & 63))
                }
            }
        }
        return z
    }

    function b(D) {
        var z, B, e, E;
        var C, A;
        z = "";
        e = D.length;
        B = 0;
        while (B < e) {
            E = D.charCodeAt(B++);
            switch (E >> 4) {
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                    z += D.charAt(B - 1);
                    break;
                case 12:
                case 13:
                    C = D.charCodeAt(B++);
                    z += String.fromCharCode(((E & 31) << 6) | (C & 63));
                    break;
                case 14:
                    C = D.charCodeAt(B++);
                    A = D.charCodeAt(B++);
                    z += String.fromCharCode(((E & 15) << 12) | ((C & 63) << 6) | ((A & 63) << 0))
            }
        }
        return z
    }

    function p(F) {
        var E, D, B, z;
        var C, e, A;
        e = F.length;
        C = 0;
        A = "";
        while (C < e) {
            do {
                E = h[F.charCodeAt(C++) & 255]
            } while (C < e && E === -1);
            if (E === -1) {
                break
            }
            do {
                D = h[F.charCodeAt(C++) & 255]
            } while (C < e && D === -1);
            if (D === -1) {
                break
            }
            A += String.fromCharCode((E << 2) | ((D & 48) >> 4));
            do {
                B = F.charCodeAt(C++) & 255;
                if (B === 61) {
                    return A
                }
                B = h[B]
            } while (C < e && B === -1);
            if (B === -1) {
                break
            }
            A += String.fromCharCode(((D & 15) << 4) | ((B & 60) >> 2));
            do {
                z = F.charCodeAt(C++) & 255;
                if (z === 61) {
                    return A
                }
                z = h[z]
            } while (C < e && z === -1);
            if (z === -1) {
                break
            }
            A += String.fromCharCode(((B & 3) << 6) | z)
        }
        return A
    }

    function f(E) {
        var A, C, e;
        var D, B, z;
        e = E.length;
        C = 0;
        A = "";
        while (C < e) {
            D = E.charCodeAt(C++) & 255;
            if (C === e) {
                A += c.charAt(D >> 2);
                A += c.charAt((D & 3) << 4);
                A += "==";
                break
            }
            B = E.charCodeAt(C++);
            if (C === e) {
                A += c.charAt(D >> 2);
                A += c.charAt(((D & 3) << 4) | ((B & 240) >> 4));
                A += c.charAt((B & 15) << 2);
                A += "=";
                break
            }
            z = E.charCodeAt(C++);
            A += c.charAt(D >> 2);
            A += c.charAt(((D & 3) << 4) | ((B & 240) >> 4));
            A += c.charAt(((B & 15) << 2) | ((z & 192) >> 6));
            A += c.charAt(z & 63)
        }
        return A
    }
    var x = (function() {
        var e = "";
        var z = "ENG";
        if (navigator.appName === "Microsoft Internet Explorer") {
            e = navigator.browserLanguage
        } else {
            e = navigator.language
        }
        e = e.toLowerCase();
        if (/^us/.test(e)) {
            z = "ENG"
        } else {
            if (/^zh-tw/.test(e)) {
                z = "TCH"
            } else {
                if (/^zh-cn/.test(e)) {
                    z = "SCH"
                } else {
                    if (/^cs/.test(e)) {
                        z = "CZE"
                    } else {
                        if (/^da/.test(e)) {
                            z = "DAN"
                        } else {
                            if (/^de/.test(e)) {
                                z = "GER"
                            } else {
                                if (/^es/.test(e)) {
                                    if (e === "es-mex") {
                                        z = "ESM"
                                    } else {
                                        z = "SPA"
                                    }
                                } else {
                                    if (/^fr/.test(e)) {
                                        z = "FRE"
                                    } else {
                                        if (/^it/.test(e)) {
                                            z = "ITA"
                                        } else {
                                            if (/^ja/.test(e)) {
                                                z = "JPN"
                                            } else {
                                                if (/^ko/.test(e)) {
                                                    z = "KOR"
                                                } else {
                                                    if (/^(no|nb-no)/.test(e)) {
                                                        z = "NOR"
                                                    } else {
                                                        if (/^pl/.test(e)) {
                                                            z = "POL"
                                                        } else {
                                                            if (/^ru/.test(e)) {
                                                                z = "RUS"
                                                            } else {
                                                                if (/^fi/.test(e)) {
                                                                    z = "FIN"
                                                                } else {
                                                                    if (/^sv/.test(e)) {
                                                                        z = "SWE"
                                                                    } else {
                                                                        if (/^nl/.test(e)) {
                                                                            z = "DUT"
                                                                        } else {
                                                                            if (/^tr/.test(e)) {
                                                                                z = "TUR"
                                                                            } else {
                                                                                z = "ENG"
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
        return z
    })();
    var q = function(e) {
        if (e === "auto") {
            e = x()
        }
        if (e === null) {
            e = "eng"
        } else {
            if (e === "TCH") {
                e = "cht"
            } else {
                if (e === "SCH") {
                    e = "chs"
                } else {
                    e = e.toLowerCase()
                }
            }
        }
        return e
    };

    function d(z, C, B) {
        var e = document.createElement("script"),
            A = document.getElementsByTagName("head")[0];
        e.type = "text/javascript";
        e.src = z;
        if (e.readyState) {
            e.onreadystatechange = function(D) {
                if (e.readyState === "loaded" || e.readyState === "complete") {
                    e.onreadystatechange = null;
                    var E = {};
                    if (C && E.toString.call(C) === "[object Function]") {
                        C()
                    }
                }
            };
            e.onerror = B || function() {}
        } else {
            e.onload = C;
            e.onerror = B || function() {}
        }
        A.appendChild(e)
    }

    function m(e) {
        var z = "";
        if (e.indexOf(":") === -1) {
            z = e
        } else {
            z = "[" + e.replace(/[\[\]]/g, "") + "]"
        }
        return z
    }

    function y(z) {
        var A = z.success;
        var e = z.fail;
        var B = z.callback;
        if (this.readyState === 4) {
            if (this.status === 200) {
                if (typeof(A) === typeof(Function)) {
                    A.call(this, this, z)
                }
            } else {
                if (typeof(e) === typeof(Function)) {
                    e.call(this, this, z)
                }
            }
            if (typeof(B) === typeof(Function)) {
                B.call(this, this, z)
            }
        }
    }

    function l() {
        var e = false;
        if (window.XMLHttpRequest) {
            e = new XMLHttpRequest()
        } else {
            e = new ActiveXObject("Microsoft.XMLHTTP")
        }
        return e
    }

    function n(z) {
        var B = l();
        var e = z.url;
        var C = z.method == "GET" ? "GET" : "POST";
        var A = z.params || "";
        A = j(A);
        if (A.length > 0) {
            A += "&"
        }
        if (C == "GET") {
            e += "?" + A + "r=" + Math.random();
            B.open(C, e, true);
            B.onreadystatechange = function() {
                y.call(B, z)
            };
            B.send()
        } else {
            B.open(C, e, true);
            B.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            B.onreadystatechange = function() {
                y.call(B, z)
            };
            B.send(A + "r=" + Math.random())
        }
        return B
    }

    function j(A) {
        var z = "";
        if (typeof A == typeof {}) {
            for (var e in A) {
                if (A.hasOwnProperty(e)) {
                    z += e + "=" + encodeURIComponent(A[e]) + "&"
                }
            }
        } else {
            if (typeof A == typeof "string") {
                z += A
            }
        }
        z = z.replace(/&$/, "");
        return z
    }

    function s(C, A) {
        var z = C + "=";
        var E = z.length;
        var e = document.cookie.length;
        var D = 0;
        while (D < e) {
            var B = D + E;
            if (document.cookie.substring(D, B) == z) {
                return t(B, C)
            }
            D = document.cookie.indexOf(" ", D) + 1;
            if (D === 0) {
                break
            }
        }
        return A
    }

    function t(B, e) {
        var z = document.cookie.indexOf(";", B);
        if (z == -1) {
            z = document.cookie.length
        }
        var A = unescape(document.cookie.substring(B, z));
        if (r) {
            A = A || sessionStorage.getItem(e)
        }
        return A
    }

    function o(A, B, D, C) {
        var z, e;
        if (D) {
            z = new Date();
            z.setTime(z.getTime() + (D * 24 * 60 * 60 * 1000));
            e = "";
            e = "" + z.toGMTString()
        } else {
            e = false
        }
        C = C || "/";
        document.cookie = A + "=" + B + ";" + (e ? " expires=" + e + ";" : "") + "path=" + C + ";";
        if (r) {
            sessionStorage.setItem(A, B)
        }
    }

    function v(e) {
        document.cookie = e + "=; expires=" + new Date("1970").toUTCString() + "; path= /;";
        if (r) {
            sessionStorage.removeItem(e)
        }
    }
    var r = false;
    if (typeof(Storage) !== "undefined") {
        try {
            sessionStorage.setItem("tmp", 1);
            sessionStorage.removeItem("tmp");
            r = true
        } catch (u) {
            r = false;
            console.log(u.stack)
        }
    }

    function a(e, z) {
        if (r) {
            localStorage[e] = z
        } else {
            o(e, z, 365)
        }
    }

    function i(e) {
        if (r) {
            return localStorage[e]
        } else {
            return s(e)
        }
    }
    return {
        getCookie: s,
        setCookie: o,
        delCookie: v,
        getLanguageCode: q,
        browserLanguage: x,
        utf16to8: k,
        utf8to16: b,
        ezDecode: p,
        ezEncode: f,
        loadJs: d,
        scroll: scroll,
        fixIPv6: m,
        ajax: n,
        getInfo: i,
        setInfo: a,
        blank_img: "data:image/gif;base64,R0lGODlhAQABAID/AMDAwAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=="
    }
})();

function QTS() {
    var D = QNAPTool.ajax,
        h = QNAPTool.getCookie,
        l = QNAPTool.setCookie,
        J = QNAPTool.delCookie;
    var y = false,
        A, j;
    var u = false;
    if (typeof(Storage) !== "undefined") {
        try {
            sessionStorage.setItem("tmp", 1);
            sessionStorage.removeItem("tmp");
            u = true
        } catch (Q) {
            u = false;
            console.log(Q.stack)
        }
    }
    var G = {
        mediaReady: false,
        maxWaitingTime: new Date().getTime() + (1000 * 60 * 3),
        station: {},
        firmware: "",
        buildTime: "",
        modelName: "",
        stunnelEnabled: false,
        forceSSL: false,
        rememberAccountStatus: h("remeber", "0") === "1",
        sslLinkStatus: window.location.protocol.toUpperCase() == "HTTPS:",
        sitePath: "/cgi-bin/",
        rootUrl: location.protocol + "//" + location.host,
        serverPort: location.port,
        serverHost: QNAPTool.fixIPv6(location.hostname),
        pathname: location.pathname,
        uiStateId: "",
        logining: false,
        pwdCons: {
            c1: false,
            c2: false,
            c3: false,
            c4: false
        },
        syncFlag: {},
        dateForamts: ["YYYY/M/D", "YYYY.M.D", "YYYY-M-D", "M/D/YYYY", "M.D.YYYY", "M-D-YYYY", "D/M/YYYY", "D.M.YYYY", "D-M-YYYY"]
    };
    var x = {
        ready: [],
        beforelogin: [],
        loginfailed: [],
        loginsuccess: [],
        orientationChanged: [],
        need2sv: [],
        updatelostphoneoption: [],
        scyansfailed: [],
        updatescyquestion: [],
        mailsuccess: [],
        mailfailure: [],
        autorefresh: [],
        qtokendead: [],
        userPwExpiry: []
    };
    var z = {
        account: "",
        sid: h("NAS_SID") || "",
        qtoken: h("qtoken") || "",
        qtokenAccount: h("qtoken_account") || "",
        need2sv: "0",
        lostPhone: 3,
        questionNo: -1,
        questionText: "",
        emergencyLimit: 0,
        emergencyCount: 0
    };
    if (u) {
        z.sid = z.sid || sessionStorage.getItem("NAS_SID");
        if (z.sid === null) {
            z.sid = ""
        }
    }
    var r = [];
    var w = {
        OVER_LIMIT: -1,
        MAIL: 1,
        QUESTION: 2,
        DISABLED: 3
    };
    var d = {
        SUCCESS: 1,
        FAILURE: 0,
        SMTP_NOT_WORK: -1
    };
    if (z.qtokenAccount.length > 0) {
        z.account = z.qtokenAccount = decodeURIComponent(QNAPTool.ezDecode(z.qtokenAccount))
    }
    if (z.account === "") {
        G.rememberAccountStatus = false;
        J("remeber", "")
    }
    var o = h("nas_lang");
    var c = 0,
        H = 2;
    z.lang = o && o != "auto" ? o : QNAPTool.browserLanguage;
    o = undefined;
    $(window).on("orientationchange", function(U) {
        I("orientationChanged", U)
    });
    if (!window.IE8) {
        $(window).on("resize", function(U) {
            I("orientationChanged", U)
        })
    }

    function L() {
        c++;
        if (c < H) {
            return
        }
        var W = h("redirectLogin") == "true";
        if (W) {
            z.account = decodeURIComponent(QNAPTool.ezDecode(h("nas_1_u") || ""));
            var U = h("nas_1_a") || "-x-x-x-";
            U = QNAPTool.ezDecode(QNAPTool.ezDecode(U));
            if (h("qtoken", "") !== "") {
                z.pwd = ""
            } else {
                if (W === true) {
                    z.pwd = QNAPTool.utf8to16(U)
                } else {
                    var V = "";
                    for (var e = 0; e < 5; e++) {
                        V += parseInt(Math.random() * 10)
                    }
                    z.pwd = V
                }
            }
            G.sslLinkStatus = window.location.protocol.toUpperCase() == "HTTPS:" ? true : false;
            F()
        } else {
            f()
        }
    }

    function T() {
        if (z.qtoken.length === 0 || z.qtokenAccount.length === 0) {
            return
        }
        var U = "user=" + z.qtokenAccount;
        U += "&qtoken=" + z.qtoken;
        U += "&qtokencheck=1";
        var e = {
            url: G.sitePath + "authLogin.cgi",
            params: U,
            success: function(V) {
                var W = $(V.responseXML);
                if (W.find("authPassed").text() != "1") {
                    J("qtoken", "");
                    J("qtoken_account", "");
                    z.qtoken = "";
                    z.qtokenAccount = "";
                    I("qtokendead")
                }
            },
            callback: function() {}
        };
        D(e)
    }

    function m() {
        z.sid = "";
        QNAPTool.delCookie("NAS_SID");
        QNAPTool.delCookie("home");
        QNAPTool.delCookie("NAS_USER")
    }
    if (isPreview) {
        L()
    } else {
        if (z.sid.length > 0) {
            var O = {
                url: G.sitePath + "authLogin.cgi",
                params: {
                    service: "1",
                    sid: z.sid
                },
                success: function(e) {
                    var U = $(e.responseXML);
                    if (U.find("user").text().length > 0) {
                        c--;
                        var V = U.find("ts").text() || 0;
                        if (u) {
                            sessionStorage.STRING_QTS_INIT_LOADING = _Q_STRINGS.QTS_INIT_LOADING
                        } else {
                            l("STRING_QTS_INIT_LOADING", _Q_STRINGS.QTS_INIT_LOADING)
                        }
                        $("#username").val("");
                        $("#pwd").val("");
                        window.location.href = "/cgi-bin/main.html?" + URL_RANDOM_NUM + "." + V
                    } else {
                        m();
                        T()
                    }
                },
                callback: function() {
                    L()
                }
            };
            D(O)
        } else {
            m();
            L();
            T()
        }
    }
    D({
        url: G.sitePath + "authLogin.cgi",
        success: function(e) {
            var U = $(e.responseXML);
            if (U.find("doQuick").text() > 0) {
                location.href = U.find("doQuick").text()
            }
            R(U);
            if (G.stunnelEnabled === true && G.forceSSL === "1") {
                G.sslLinkStatus = true
            }
        },
        callback: function() {
            L()
        }
    });

    function b(U) {
        var af = $("qItem", U);
        var ai;
        var ad = $("webServerPort", U).text() - 0;
        var ag = $("webServerEnable", U).text() - 0;
        var ak = $("sslPort", U).text() - 0;
        var ae = $("sslEnable", U).text() - 0;
        var X = QNAPTool.fixIPv6(location.hostname);
        var ac = location.protocol;
        var aa;
        for (var ah = 0, V = af.length; ah < V; ah++) {
            aa = af[ah];
            ai = {
                name: $("name", aa).text(),
                displayName: $("name", aa).text(),
                linkURL: $("name", aa).text(),
                sysApp: $("name", aa).text(),
                QPKGFile: $("QPKGFile", aa).text(),
                defaultTitle: $("displayName", aa).text(),
                date: $("date", aa).text(),
                version: $("version", aa).text(),
                installPath: $("installPath", aa).text(),
                configPath: $("configPath", aa).text(),
                shell: $("shell", aa).text(),
                enable: $("enable", aa).text(),
                servPort: parseInt($("servPort", aa).text(), 10),
                webPort: parseInt($("webPort", aa).text(), 10),
                webSSLPort: parseInt($("webSSLPort", aa).text(), 10),
                webUI: $("webUI", aa).text(),
                provider: $("provider", aa).text(),
                openOnDesktop: $("desktop", aa).text(),
                status: $("status", aa).text()
            };
            var Y = "";
            if (ai.enable == "FALSE") {
                Y += "_gray";
                return
            }
            ai.icon = "/RSS/images/" + ai.name + ".gif?" + ai.version;
            if (ai.webUI != "null" && ai.enable != "FALSE") {
                var ab = "",
                    W = "";
                var Z = ai.webPort;
                var aj = ai.webSSLPort;
                var e = ai.webUI;
                if (!$.isNumeric(Z)) {
                    ab = ""
                } else {
                    if (!$.isNumeric(Z) || Z === 0 || Z === ad) {
                        ab = "http://" + X + ":" + ad + e
                    } else {
                        if (Z == -1) {
                            ab = G.rootUrl + e
                        } else {
                            if (Z == -2) {
                                ab = ""
                            } else {
                                ab = "http://" + X + ":" + Z + e
                            }
                        }
                    }
                }
                if (!$.isNumeric(aj)) {
                    W = ""
                } else {
                    if (aj === 0 || aj === ak) {
                        W = "https://" + X + ":" + ak + e
                    } else {
                        if (aj === -1) {
                            W = G.rootUrl + e
                        } else {
                            if (aj === -2) {
                                W = ""
                            } else {
                                W = "https://" + X + ":" + aj + e
                            }
                        }
                    }
                }
                if (ab === "") {
                    ab = W
                }
                if (W === "") {
                    W = ab
                }
                if (ac == "https:" && ae === 1) {
                    ai.linkURL = W
                } else {
                    ai.linkURL = ab
                }
            }
            r.push(ai)
        }
    }

    function f() {
        if (y) {
            return
        }
        y = true;
        I("ready")
    }

    function R(ac) {
        ac = $(ac);
        k(ac);
        G.wellcome = {
            title: ac.find("title").text(),
            content: ac.find("content").text(),
            showLink: ac.find("show_link").text(),
            stdMsg: ac.find("standard_massage").text() || "",
            stdColor: ac.find("standard_color").text() || "#FFF",
            stdSize: ac.find("standard_size").text() || "12px",
            stdBgStyle: ac.find("standard_bg_style").text() || "fill",
        };
        G.timestamp = ac.find("ts").text();
        G.isBooting = ac.find("is_booting").text() === "1";
        G.mediaReady = ac.find("mediaReady").text() === "1";
        G.firmware = ac.find("version").text();
        G.firmwareSP = ac.find("sp").text();
        G.display_firmware = [G.firmware, ac.find("number").text()].join(".");
        G.showVersion = ac.find("showVersion").text();
        G.hostname = ac.find("hostname").text();
        G.displayModelName = ac.find("displayModelName").text();
        G.internalModelName = ac.find("internalModelName").text();
        G.platform = ac.find("platform").text();
        G.buildTime = ac.find("buildTime").text();
        G.stunnelEnabled = ac.find("stunnelEnabled").text() === "1";
        G.forceSSL = ac.find("forceSSL").text();
        G.httpPort = ac.find("webAccessPort").text();
        G.httpsPort = ac.find("stunnelPort").text();
        G.pwdCons.c1 = ac.find("passwdConstraint01").text() == 1;
        G.pwdCons.c2 = ac.find("passwdConstraint02").text() == 1;
        G.pwdCons.c3 = ac.find("passwdConstraint03").text() == 1;
        G.pwdCons.c4 = ac.find("passwdConstraint04").text() == 1;
        G.QWebPort = ac.find("QWebPort").text();
        G.QWebEnabled = ac.find("QWebEnabled").text();
        G.QWebSSLEnabled = ac.find("QWebSSLEnabled").text();
        G.QWebSSLPort = ac.find("QWebSSLPort").text();
        if (h("cloudRelayMode") === "1") {
            G.forceSSL = "1"
        }
        document.title = G.hostname;
        var V = G.httpPort,
            ao = G.httpsPort,
            aq = ac.find("WFM2").text(),
            Y = ac.find("wfmPortEnabled").text(),
            U = ac.find("wfmPort").text(),
            au = ac.find("wfmSSLEnabled").text(),
            at = ac.find("wfmSSLPort").text(),
            e = ac.find("wfmURL").text();
        G.httpEnable = true;
        G.httpPort = V;
        G.httpsEnable = G.stunnelEnabled;
        G.httpsPort = G.httpsPort;
        var Z = {
            status: aq == 1 ? true : false,
            url: e,
            port: V,
            sslenabled: G.stunnelEnabled,
            sslPort: ao
        };
        if (Y == 1) {
            Z.port = U;
            if (au == 1) {
                Z.sslPort = at == 1 ? true : false
            }
        }
        G.station.WFM = Z;
        var aa = ac.find("DSV2Supported").text();
        var X = ac.find("DSV3Supported").text();
        var af = ac.find("DSV2URL").text();
        var W = {
            status: ((aa == 1) || (X == 1)) ? true : false,
            url: af,
            port: V,
            sslenabled: G.stunnelEnabled,
            sslPort: ao
        };
        G.station.DSV2 = W;
        var am = ac.find("NVREnabled").text();
        var aw = ac.find("NVRURL").text();
        var an = {
            status: am == 1 ? true : false,
            url: aw,
            port: V,
            sslenabled: G.stunnelEnabled,
            sslPort: ao
        };
        G.station.NVR = an;
        var ap = G.QWebPort;
        var ar = G.QWebEnabled;
        var al = G.QWebSSLEnabled;
        var ak = G.QWebSSLPort;
        var ae = ac.find("MSV2WebEnabled").text();
        var ab = ac.find("MSV2URL").text();
        var ai = {
            status: ae == 1 ? true : false,
            url: ab,
            port: ap,
            sslenabled: al == 1 ? true : false,
            sslPort: ak
        };
        G.station.MSV2 = ai;
        var ag = ac.find("QPhotosURL").text();
        var ad = {
            status: false,
            url: ag,
            port: ap,
            sslenabled: al == 1 ? true : false,
            sslPort: ak,
            enabled: ac.find("QPhotosEnabled").text() == "1"
        };
        G.station.photoSt = ad;
        var ah = ac.find("QMusicsURL").text();
        var av = {
            status: false,
            url: ah,
            port: ap,
            sslenabled: al == 1 ? true : false,
            sslPort: ak,
            enabled: ac.find("QMusicsEnabled").text() == "1"
        };
        G.station.musicSt = av;
        var aj = {
            status: false,
            url: ah,
            port: ap,
            sslenabled: al == 1 ? true : false,
            sslPort: ak,
            enabled: ac.find("QVideosEnabled").text() == "1"
        };
        G.station.videoSt = aj;
        G.apacheHttpEnable = ar == 1;
        G.apacheHttpPort = ap;
        G.apacheHttpsEnable = al == 1;
        G.apacheHttpsPort = ak
    }

    function p(W, e) {
        var V = document;
        var U = V.createElement("link");
        U.setAttribute("rel", "stylesheet");
        U.setAttribute("type", "text/css");
        U.setAttribute("id", W);
        U.setAttribute("href", e);
        V.getElementsByTagName("head")[0].appendChild(U)
    }

    function F() {
        var aa = z.account,
            ac = z.pwd,
            W = G.rememberAccountStatus,
            ab = z.scyCode,
            ad = z.scyAns,
            X = G.sslLinkStatus;
        if (aa.length === 0 || !aa) {
            $("#submit").removeAttr("disabled");
            return false
        }
        if (I("beforelogin", aa, ac, W, X) === false) {
            return
        }
        var Y = {
            user: aa,
            serviceKey: 1
        };
        if (ab) {
            Y.security_code = ab
        } else {
            if (ad) {
                Y.security_answer = ad
            }
        }
        var U = false;
        if (X && window.location.protocol.toUpperCase() == "HTTP:") {
            U = true
        }
        if (!X && window.location.protocol.toUpperCase() == "HTTPS:") {
            U = true
        }
        if (U) {
            if (G.rememberAccountStatus) {
                l("remeber", "1")
            }
            l("redirectLogin", "true");
            l("nas_1_u", QNAPTool.ezEncode(encodeURIComponent(aa)));
            l("nas_1_a", QNAPTool.ezEncode(QNAPTool.ezEncode(QNAPTool.utf16to8(ac))));
            var e = "";
            if (X) {
                e += "https://" + G.serverHost + ":" + G.httpsPort + G.pathname
            } else {
                e += "http://" + G.serverHost + ":" + G.httpPort + G.pathname
            }
            window.location.href = e;
            return
        } else {
            J("redirectLogin", "")
        }
        if (G.rememberAccountStatus) {
            Y.remme = 1
        } else {
            J("remeber", "")
        }
        if (z.qtoken && aa == z.qtokenAccount) {
            Y.qtoken = z.qtoken
        } else {
            Y.pwd = QNAPTool.ezEncode(QNAPTool.utf16to8(ac))
        }
        var Z = $("#pwd").val();
        $("#pwd").val("");
        var V = {
            url: G.sitePath + "authLogin.cgi",
            params: Y,
            success: function(ax, af) {
                var an = $(ax.responseXML),
                    at = an.find("authPassed").text() || "0",
                    al = an.find("need_2sv").text() || "0",
                    au = parseInt(an.find("lost_phone").text() || "3"),
                    av = an.find("errorValue").text() || "0",
                    aw = parseInt(an.find("emergency_try_count").text() || 0),
                    ap = parseInt(an.find("emergency_try_limit").text() || 0);
                userPwExpiry = parseInt(an.find("user_pw_expiry").first().text() || 0);
                z.emergencyCount = aw;
                z.emergencyLimit = ap;
                clearTimeout(A);
                A = setTimeout(E, 3600000);
                if (at === "1") {
                    var ak = an.find("authSid").text() || "";
                    var aj = an.find("username").text() || "";
                    l("NAS_USER", aj, null, "/");
                    t(ak);
                    z.account = aa;
                    var ae = an.find("ts").text() || 0;
                    if (C()) {
                        var ai = an.find("qtoken").text() || "";
                        var aq = 365;
                        l("remeber", "1", aq);
                        l("nas_1_u", QNAPTool.ezEncode(encodeURIComponent(aa)));
                        l("nas_1_a", QNAPTool.ezEncode(Math.random() + "-x-x-x-" + Math.random()));
                        l("qtoken_account", QNAPTool.ezEncode(encodeURIComponent(aa)), aq);
                        if (ai) {
                            l("qtoken", ai, aq)
                        } else {
                            J("nas_1_a", "")
                        }
                    } else {
                        J("nas_1_u", "");
                        J("nas_1_a", "");
                        J("remeber", "");
                        J("qtoken", "");
                        J("qtoken_account", "")
                    }
                    I("loginsuccess", aa, ac, W, X);
                    l("showQuickStart", 1);
                    D({
                        url: G.sitePath + "userConfig.cgi",
                        params: {
                            func: "updateLoginTime",
                            sid: ak
                        },
                        success: function() {},
                        failure: function() {},
                        callback: function() {
                            if (u) {
                                sessionStorage.STRING_QTS_INIT_LOADING = _Q_STRINGS.QTS_INIT_LOADING
                            } else {
                                l("STRING_QTS_INIT_LOADING", _Q_STRINGS.QTS_INIT_LOADING)
                            }
                            window.location.href = "/cgi-bin/main.html?" + URL_RANDOM_NUM + "." + ae
                        },
                        timeout: 500
                    })
                } else {
                    if (al === "1") {
                        $("#pwd").val(Z);
                        z.need2sv = al;
                        z.lostPhone = au;
                        n(au);
                        var ar = an.find("timezone").text() || "0",
                            ah = an.find("timestamp").text() || "0",
                            ag = an.find("time_format").text() || "24",
                            ao = an.find("date_format_index").text() || "0",
                            am = an.find("timestring").text() || "0";
                        G.updateTimeStamp = new Date().getTime();
                        G.timezone = ar;
                        G.timestamp = parseInt(ah, 10);
                        G.timeFormat = parseInt(ag, 10);
                        G.dateFormatIndex = parseInt(ao, 10) - 1;
                        G.dateFormat = G.dateForamts[G.dateFormatIndex];
                        if (G.timeFormat === 24) {
                            G.dateFormat += " HH:mm:ss"
                        } else {
                            G.dateFormat += " hh:mm:ss A"
                        }
                        G.time = moment(am, "YYYY/MM/DD H:mm:ss");
                        s();
                        setTimeout(function() {
                            I("need2sv")
                        }, 300)
                    } else {
                        if (userPwExpiry === 1) {
                            window.location.href = "/cgi-bin/main.html?cp=1&a=" + aa + "&" + URL_RANDOM_NUM + "." + ae
                        } else {
                            if (af.params.security_answer) {
                                $("#pwd").val(Z);
                                setTimeout(function() {
                                    I("scyansfailed", aa, ac, W, X)
                                }, 300)
                            } else {
                                setTimeout(function() {
                                    I("loginfailed", aa, ac, W, X)
                                }, 300)
                            }
                        }
                    }
                }
            },
            callback: function(ae) {
                f();
                $("#submit").removeAttr("disabled");
                G.logining = false
            }
        };
        if (G.logining) {
            $("#submit").removeAttr("disabled");
            return
        }
        D(V);
        G.logining = true
    }

    function s() {
        clearTimeout(j);
        var e = new Date().getTime();
        var U;
        G.time.millisecond(e - G.updateTimeStamp);
        G.updateTimeStamp = e;
        j = setTimeout(function() {
            s()
        }, 1000);
        U = parseInt(moment(G.time).format("mm"));
        if (U % 5 === 0) {
            if (!G.syncFlag[U]) {
                K(U);
                G.syncFlag[U] = true
            }
            setTimeout(function() {
                G.syncFlag[U] = undefined
            }, 1000 * 60 * 5)
        }
    }

    function K(U) {
        var e = {
            url: G.sitePath + "sysinfoReq.cgi?sys_time=1",
            success: function(X, W) {
                var Z = $(X.responseXML),
                    aa = Z.find("timezone").text() || "0",
                    ab = Z.find("timestamp").text() || "0",
                    ac = Z.find("time_format").text() || "24",
                    V = Z.find("date_format_index").text() || "0",
                    Y = Z.find("timestring").text() || "0";
                G.updateTimeStamp = new Date().getTime();
                G.timezone = aa;
                G.timestamp = parseInt(ab, 10);
                G.timeFormat = parseInt(ac, 10);
                G.dateFormatIndex = parseInt(V, 10) - 1;
                G.dateFormat = G.dateForamts[G.dateFormatIndex];
                if (G.timeFormat === 24) {
                    G.dateFormat += " HH:mm:ss"
                } else {
                    G.dateFormat += " hh:mm:ss A"
                }
                G.time = moment(Y, "YYYY/MM/DD H:mm:ss")
            },
            callback: function(V) {}
        };
        D(e)
    }

    function E() {
        I("autorefresh")
    }

    function q() {
        var W = z.account,
            X = z.pwd,
            V = G.rememberAccountStatus,
            Z = z.scyCode,
            e = z.scyAns,
            U = G.sslLinkStatus;
        if (W.length === 0 || !W) {
            $("#submit").removeAttr("disabled");
            return false
        }
        var Y = {
            user: W,
            serviceKey: 1
        };
        if (Z) {
            Y.security_code = Z
        } else {
            if (e) {
                Y.security_answer = e
            }
        }
        if (G.rememberAccountStatus) {
            l("remeber", "1");
            Y.remme = 1
        } else {
            J("remeber", "")
        }
        if (z.qtoken && W == z.qtokenAccount) {
            Y.qtoken = z.qtoken
        } else {
            Y.pwd = QNAPTool.ezEncode(QNAPTool.utf16to8(X))
        }
        return Y
    }
    var B = -1;

    function a(e, W, U) {
        var X = q();
        X.send_mail = 1;
        var V = {
            url: G.sitePath + "authLogin.cgi",
            params: X,
            success: function(ab, aa) {
                var ac = $(ab.responseXML),
                    Z = parseInt(ac.find("send_result").text() || 0),
                    Y = parseInt(ac.find("emergency_try_count").text() || 0),
                    ad = parseInt(ac.find("emergency_try_limit").text() || 0);
                z.emergencyLimit = ad;
                z.emergencyCount = Y;
                switch (Z) {
                    case d.SUCCESS:
                        I("mailsuccess");
                        break;
                    case d.FAILURE:
                    case d.SMTP_NOT_WORK:
                        I("mailfailure", Z);
                        break
                }
            },
            callback: function(Y) {}
        };
        D(V)
    }

    function i() {
        var U = q();
        U.get_question = 1;
        delete U.security_code;
        var e = {
            url: G.sitePath + "authLogin.cgi",
            params: U,
            success: function(W, V) {
                var X = $(W.responseXML),
                    Z = parseInt(X.find("security_question_no").text() || 0),
                    Y = X.find("security_question_text").text() || "-";
                if (Z > 0) {
                    z.questionNo = Z;
                    z.questionText = Y.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    I("updatescyquestion")
                } else {}
            },
            callback: function(V) {}
        };
        D(e)
    }

    function n(e) {
        z.lostPhone = e;
        switch (e) {
            case w.MAIL:
                break;
            case w.QUESTION:
                i();
                break;
            case w.DISABLED:
                break
        }
        I("updatelostphoneoption", e)
    }

    function M(e, U, W) {
        var V = {};
        V.func = "set";
        V["common_" + e] = U;
        V.sid = z.sid;
        D({
            url: G.sitePath + "userConfig.cgi",
            params: V,
            method: "POST",
            success: function(X, Y) {
                W()
            }
        })
    }

    function S(U, e) {
        x[U].push(e)
    }

    function I(X) {
        var Y = x[X],
            U;
        var V = Array.prototype.slice.call(arguments, 1);
        for (var W = 0, e = Y.length; W < e; W++) {
            U &= Y[W].apply(this, V) || true
        }
        return U
    }

    function N(U) {
        var e = {
            url: "/cgi-bin/authLogin.cgi",
            success: function(V) {
                var W = V.responseXML;
                R(W)
            },
            failure: function() {},
            callback: U
        };
        D(e)
    }

    function t(e) {
        z.sid = e;
        l("NAS_SID", e, null, "/");
        l("home", "1", null, "/");
        if (u) {
            sessionStorage.setItem("NAS_SID", e)
        }
    }

    function P() {
        return G.sslLinkStatus
    }

    function v(e) {
        G.sslLinkStatus = e === true ? e : false
    }

    function C() {
        return G.rememberAccountStatus
    }

    function g(e) {
        G.rememberAccountStatus = e === true ? e : false
    }

    function k(V) {
        var e = V.find("qlm_lock");
        var aa = V.find("qlm_active_ip");
        var X = V.find("ha_active_ip");

        function W(ab) {
            $(".msg-box-ct").addClass("show");
            $(".msg-icon-ct > div").removeClass("msg-icon--question");
            $("#modalCancel").addClass("display-none");
            $(".slice-img-close-2.close-btn").addClass("display-none");
            $(".msg-text-ct > span").html(ab);
            $(".msg-icon-ct > div").addClass("msg-icon--info")
        }
        if (X.length > 0) {
            var U = X.text();
            if (U.length > 0 && U != "--") {
                W(_Q_STRINGS.QHA_LOCK_LOGIN.replace("{0}", U));
                $("#modalOK").unbind("click");
                $("#modalOK").bind("click", function(ab) {
                    window.location.href = window.location.protocol + "//" + U + ":" + window.location.port;
                    ab.stopPropagation();
                    ab.stopImmediatePropagation()
                })
            }
        } else {
            if (e.length > 0) {
                var Y = e.text();
                var Z = aa.text();
                switch (Y) {
                    case "1":
                        if (Z.length > 0) {
                            W('You can not login to this NAS because the other NAS is active. This NAS will be kept service offline. Click "OK" to redirect to ' + Z);
                            $("#modalOK").unbind("click");
                            $("#modalOK").bind("click", function(ab) {
                                window.location.href = window.location.protocol + "//" + Z + ":" + window.location.port;
                                ab.stopPropagation();
                                ab.stopImmediatePropagation()
                            })
                        }
                        break;
                    case "2":
                        W("Live Migration is finishing, please wait few minutes, and refresh page again.");
                        $("#modalOK").addClass("display-none");
                        break;
                    case "3":
                        W("First time migration syncing is not finished. Please check your source NAS to be on line.");
                        $("#modalOK").addClass("display-none");
                        break;
                    case "0":
                    case "4":
                    default:
                        break
                }
            }
        }
    }
    return {
        config: G,
        on: S,
        login: F,
        isReady: function() {
            return y
        },
        getSSLLinkStatus: P,
        setSSLLinkStatus: v,
        getRemeAccStatus: C,
        setRemeAccStatus: g,
        getCookie: h,
        setCookie: l,
        delCookie: J,
        setStyle: QNAPTool.setStyle,
        addClass: QNAPTool.addClass,
        hasClass: QNAPTool.hasClass,
        removeClass: QNAPTool.removeClass,
        user: z,
        setSid: t,
        ajax: D,
        abortAjax: function() {},
        setHostData: R,
        loadCSS: p,
        reloadBootStatus: N,
        saveConfig: M,
        getPublicQPKGs: function() {
            return r
        },
        parseQPKGInfo: b,
        sendScyMail: a,
        LOST_PHONE: w,
        SEND_MAIL_RESULT: d
    }
};
