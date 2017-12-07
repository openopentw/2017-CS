if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(b) {
        var a = this.length >>> 0;
        var c = Number(arguments[1]) || 0;
        c = (c < 0) ? Math.ceil(c) : Math.floor(c);
        if (c < 0) {
            c += a
        }
        for (; c < a; c++) {
            if (c in this && this[c] === b) {
                return c
            }
        }
        return -1
    }
}
var os, ui;

function UI() {
    var o = "error",
        y = "info";
    var i = false;
    var C = {
        STEP_1: "step-1",
        STEP_2: "step-2"
    };

    function G() {
        if (i) {
            return
        }
        var L = new Image();
        L.onload = function() {
            var M = L.width;
            var N = L.height;
            if (M == 1 && N == 1) {
                $("body").css("backgroundImage", "inherit")
            } else {
                $("body").css({
                    backgroundImage: "url(/cgi-bin/mediaGet.cgi?t=jpg&f=loginBG&r=" + os.config.timestamp + ")",
                    backgroundSize: "100% 100%"
                })
            }
        };
        L.src = "/cgi-bin/mediaGet.cgi?t=jpg&f=loginBG&r=" + os.config.timestamp;
        $("html").removeAttr("style");
        i = true;
        l();
        j();
        r();
        d();
        s();
        if (os.getCookie("redirectLogin") == "true") {
            os.delCookie("redirectLogin", "");
            x()
        }
        setTimeout(function() {}, 1000)
    }

    function j() {
        if (os.config.showVersion == "1") {
            $("#login-logo").html(os.config.firmware)
        } else {
            $("#login-logo").html("")
        }
        $("html").on("selectstart", function() {
            return false
        });
        $("#loginBtn").on("click", x);
        $("#loginForm").on("submit", function() {
            $("body")[0].focus();
            x();
            return false
        });
        var M = $("#account"),
            aa = $("#accountMask"),
            ab = $("#pwd"),
            O = $("#pwdMask"),
            W = $("#rememStatus"),
            L = $("#sslStatus");
        var Z = os.getCookie("redirectLogin");

        function ac() {
            $("#accountMask").addClass("x-hide-display")
        }

        function S() {
            $("#accountMask").removeClass("x-hide-display")
        }

        function T() {
            ac();
            $("#account").focus()
        }
        M.on("change", ac).on("focus", ac).on("keydown", ac).on("blur", function(af) {
            var ae = $(af.target).val();
            ae = ae.replace(/^\s+|\s+$/g, "");
            if (ae === "") {
                S()
            } else {
                ac()
            }
        });
        if (M.val().length > 0) {
            ac();
            M.focus()
        }
        aa.html(_Q_STRINGS.LDAP_SERVER_STR12).on("click", T).on("touchstart", T);

        function P() {
            console.log("hidePwdMask");
            $("#pwdMask").addClass("x-hide-display")
        }

        function U() {
            console.log("showPwdMask");
            $("#pwdMask").removeClass("x-hide-display")
        }

        function X() {
            P();
            $("#pwd").focus();
            console.log("focusPwdField");
            if (QNAPTool.getCookie("qtoken") !== "") {
                ab.value = ""
            }
            QNAPTool.delCookie("qtoken", "")
        }
        ab.on("change", P).on("focus", P).on("mouseup", function() {
            if (ab.selectionStart === ab.selectionEnd) {
                setTimeout(function() {
                    ab.select()
                }, 10)
            }
        }).on("keydown", function(ae) {
            P();
            if (ae.keyCode === 13) {
                x()
            }
        }).on("blur", function(af) {
            var ae = $(af.target).val();
            if (ae === "") {
                U()
            } else {
                P()
            }
        });
        O.html(_Q_STRINGS.QUICK04_STR09).on("click", X).on("touchstart", X);
        W.hover(function() {
            $(this).addClass("x-btn-over")
        }, function() {
            $(this).removeClass("x-btn-over")
        }).on("touchmove", function(ae) {
            ae.preventDefault()
        }).on("touchend", K).on("click", K);
        if (os.getRemeAccStatus()) {
            W.addClass("x-btn-pressed")
        }
        var N = os.getCookie("nas_1_a") || "-x-x-x-";
        N = QNAPTool.ezDecode(QNAPTool.ezDecode(N));
        N = QNAPTool.utf8to16(N);
        if (os.getCookie("nas_1_a")) {
            ab.val(N);
            M.val(os.user.account);
            P()
        }
        if (os.getRemeAccStatus() || Z === "true") {
            var R = os.getCookie("nas_1_u") || os.getCookie("qtoken_account") || "";
            M.val(decodeURIComponent(QNAPTool.ezDecode(R)));
            if (os.getCookie("qtoken", "") === "" && Z !== "true") {
                ab.val("")
            } else {
                if (Z === "true") {
                    ab.val(N);
                    P()
                } else {
                    var ad = "";
                    for (var Y = 0; Y < 5; Y++) {
                        ad += parseInt(Math.random() * 10)
                    }
                    ab.val(ad);
                    P()
                }
            }
            ac()
        } else {
            W.removeClass("x-btn-pressed")
        }
        if (ab.val().length > 0) {
            X()
        }

        function Q() {
            $("#sslStatus").addClass("x-hide-display")
        }

        function V() {
            $("#sslStatus").removeClass("x-hide-display")
        }
        L.hover(function() {
            $(this).addClass("x-btn-over")
        }, function() {
            $(this).removeClass("x-btn-over")
        }).on("touchmove", function(ae) {
            ae.preventDefault()
        }).on("touchend", t).on("click", t);
        if (os.config.stunnelEnabled) {
            if (os.config.forceSSL === "1") {
                os.setSSLLinkStatus(true);
                Q()
            } else {
                V()
            }
        } else {
            Q()
        }
        if (os.getSSLLinkStatus()) {
            L.addClass("x-btn-pressed")
        } else {
            L.removeClass("x-btn-pressed")
        }
        document.title = os.config.hostname || "QNAP Turbo NAS";
        $("#lostPhone").on("click", D);
        $("#back_2sv").on("click", function() {
            g(C.STEP_1)
        });
        $("#modalOK").on("click", v);
        $("#modalCancel").on("click", m);
        $(".scy-form__submit").on("click", x).prop("disabled", true).addClass("scy-form__submit--disabled");
        $(".scy-form__input").on("keydown", function(ae) {
            if (ae.keyCode === 13) {
                x()
            }
        })
    }

    function r() {
        if (/(TCH|SCH)/.test(os.user.lang)) {
            var L = {
                url: "/cgi-bin/qnapmsg.cgi?r=" + (new Date().getTime()) + "&lang=" + QNAPTool.getLanguageCode(os.user.lang),
                success: function(T) {
                    var M = T.responseXML,
                        U = $("Message", M),
                        P = U.length,
                        X = $("#adDisplayBox");
                    if (P === 0) {
                        return
                    }
                    X.lastPositionIndex = 0;
                    X.positionIndex = 0;
                    for (var R = 0; R < P; R++) {
                        var S = document.createElement("div"),
                            N = document.createElement("a"),
                            Q = document.createElement("img");
                        $(S).addClass("thumb-wrap ad-thumb-wrap");
                        Q.src = $("img", U[R]).text();
                        N.href = $("link", U[R]).text();
                        N.target = "ad-" + R;
                        N.appendChild(Q);
                        S.appendChild(N);
                        X.append(S)
                    }
                    var V = os.getCookie("stop-ad") != "true",
                        W = $("body"),
                        O = $("#adTab");
                    O.on("click", function() {
                        $("body").toggleClass("show-ad")
                    });
                    $("#adRightBtn").on("click", p);
                    $("#adLeftBtn").on("click", H);
                    u();
                    $(".qnap-adCt").removeClass("x-hide-display")
                }
            };
            os.ajax(L)
        }
    }

    function l() {
        var L = $("body"),
            M = L.offsetWidth;
        if (M < 1215) {
            L.addClass("s-adCt")
        } else {
            L.removeClass("s-adCt")
        }
    }

    function h() {
        var M = os.config.station.photoSt,
            L = location.protocol + "//" + location.hostname + ":" + (os.config.sslLinkStatus ? os.config.httpsPort : M.port) + M.url,
            N = M.url;
        window.showPublicPhoto = function(V) {
            if (V.lpshow === 0) {
                return
            }
            var T = V.DataList.length,
                S = {
                    list: []
                };
            for (var R = 0; R < T; R++) {
                var U = V.DataList[R],
                    Q = U.userItem.albums.length;
                for (var P = 0; P < Q; P++) {
                    var O = U.userItem.albums[P];
                    S.list.push({
                        coverImg: N + "p/api/thumb.php?f=" + O.FileItem.iAlbumCover + "&ac=" + O.FileItem.coverCode + "&s=1" + (O.FileItem.coverType == "video" ? "&t=video" : ""),
                        link: N + "p/index.php?a=" + O.FileItem.iPhotoAlbumId + "&u=" + O.FileItem.owner
                    })
                }
            }
            if (S.list.length > 0) {
                n(S)
            }
        };
        if (os.config.isBooting) {
            setTimeout(function() {
                os.reloadBootStatus(h)
            }, 10 * 1000);
            return
        } else {
            QNAPTool.loadJs(N + "p/api/list.php?json=1&t=albums&callback=showPublicPhoto")
        }
        $("#photoUpArrow").on("click", F);
        $("#photoDownArrow").on("click", I)
    }

    function d() {
        var N = document.querySelectorAll(".qStr");
        for (var M = 0, L = N.length; M < L; M++) {
            var O = N[M];
            O.innerHTML = _Q_STRINGS[O.getAttribute("qStrId") || O.getAttribute("data-qStrId")] || O.innerHTML
        }
    }

    function F() {
        $("#photoView").scrollTop(140)
    }

    function I() {
        $("#photoView").scrollTop(-140)
    }

    function n(Q) {
        var S = Q.list.length,
            P = $("#photoList");
        $(".photo-station-quick-list").addClass("show-photo-station-quick-list");
        P.on("mousewheel", function(T) {
            var U = 0;
            if ("wheelDelta" in T) {
                U = T.wheelDelta
            } else {
                U = -40 * T.detail
            }
            if (U > 0) {
                I()
            } else {
                if (U < 0) {
                    F()
                }
            }
        });
        for (var O = 0; O < S; O++) {
            var L = Q.list[O],
                R = document.createElement("li"),
                N = document.createElement("a"),
                M = document.createElement("img");
            $(R).addClass("thumb-wrap");
            $(N).addClass("thumb");
            $(M).addClass("photo");
            M.src = L.coverImg;
            N.href = L.link;
            N.target = "publicPhoto";
            N.appendChild(M);
            R.appendChild(N);
            P.append(R)
        }
    }

    function s() {
        os.on("beforelogin", function() {
            A(_Q_STRINGS.QTS_INIT_LOGGING_IN, "");
            $("#qestion_msg").addClass("font-blue").removeClass("font-warning").html(_Q_STRINGS.QTS_INIT_LOGGING_IN);
            $("#scy_msg").addClass("font-blue").removeClass("font-warning").html(_Q_STRINGS.QTS_INIT_LOGGING_IN);
            document.activeElement.blur();
            $("body").focus();
            $("#loginForm").removeClass("login-failed");
            $("#lostPhone").addClass("scy-form__lost-phone--disabled")
        });
        os.on("loginfailed", function() {
            if ($(".scy-Form--show").length === 1) {
                $("#scy_msg").removeClass("font-blue").addClass("font-warning").html(_Q_STRINGS.AUTH_2STEP_32)
            } else {
                $("#pwd").select();
                $("#loginForm").addClass("login-failed");
                A(_Q_STRINGS.QTS_LOGIN_FAIELD, "")
            }
            $("#lostPhone").removeClass("scy-form__lost-phone--disabled")
        });
        os.on("loginsuccess", function() {
            A(_Q_STRINGS.QTS_INIT_LOGGING_IN, "");
            $("#qestion_msg").addClass("font-blue").removeClass("font-warning").html(_Q_STRINGS.QTS_INIT_LOGGING_IN);
            $("#scy_msg").addClass("font-blue").removeClass("font-warning").html(_Q_STRINGS.QTS_INIT_LOGGING_IN)
        });
        os.on("orientationChanged", l);
        os.on("need2sv", function() {
            console.log("need2sv");
            console.log("os.user.scyCode", os.user.scyCode);
            if (os.user.scyCode) {
                $("#scy_msg").html(_Q_STRINGS.AUTH_2STEP_32).removeClass("display-hide").removeClass("font-blue").addClass("font-warning")
            } else {
                g(C.STEP_1)
            }
            A("", "");
            $("#lostPhone").removeClass("scy-form__lost-phone--disabled");
            J()
        });
        os.on("updatelostphoneoption", function(L) {
            switch (L) {
                case 0:
                    break;
                case 1:
                    break
            }
        });
        $("#scyCode").on("input", function() {
            var L = $("#scySubmit");
            if ($(this).val().length === 0) {
                L.prop("disabled", true).addClass("scy-form__submit--disabled")
            } else {
                L.prop("disabled", false).removeClass("scy-form__submit--disabled")
            }
        });
        $("#scyAns").on("input", function() {
            var L = $("#scyAnsSubmit");
            if ($(this).val().length === 0) {
                L.prop("disabled", true).addClass("scy-form__submit--disabled")
            } else {
                L.prop("disabled", false).removeClass("scy-form__submit--disabled")
            }
        });
        os.on("scyansfailed", b);
        os.on("updatescyquestion", f);
        os.on("mailsuccess", c);
        os.on("mailfailure", e);
        os.on("autorefresh", w)
    }

    function p() {
        var L = os.getNode("adDisplayBox");
        L.positionIndex--;
        u()
    }

    function H() {
        var L = os.getNode("adDisplayBox");
        L.positionIndex++;
        u()
    }

    function u() {
        var T = $("#adDisplayBox"),
            S = $("#adRightBtn"),
            O = $("#adLeftBtn"),
            L = $("ad-thumb-wrap");
        if (L.length === 0) {
            O.addClass("x-hide-display");
            S.addClass("x-hide-display");
            return
        }
        var N = T.positionIndex % L.length;
        var Q = -T.positionIndex * (314 + 27);
        var R = 314;
        for (var P = 0; P < L.length; P++) {
            var M = L[P];
            QNAPTool.setStyle(M, "left", Q + "px")
        }
        T.lastPositionIndex = T.positionIndex;
        if (T.lastPositionIndex + 3 === L.length) {
            O.css("visibility", "hidden")
        } else {
            O.css("visibility", "visible")
        }
        if (T.lastPositionIndex === 0) {
            S.css("visibility", "hidden")
        } else {
            S.css("visibility", "visible")
        }
    }

    function K(L) {
        var M = $("#rememStatus");
        if (os.getRemeAccStatus()) {
            os.setRemeAccStatus(false);
            M.removeClass("x-btn-pressed")
        } else {
            os.setRemeAccStatus(true);
            M.addClass("x-btn-pressed")
        }
    }

    function t() {
        var L = $("#sslStatus");
        if (os.getSSLLinkStatus()) {
            os.setSSLLinkStatus(false);
            L.removeClass("x-btn-pressed")
        } else {
            os.setSSLLinkStatus(true);
            L.addClass("x-btn-pressed")
        }
    }

    function x(M) {
        os.user.account = $("#account").val();
        os.user.pwd = $("#pwd").val();
        os.user.scyCode = undefined;
        os.user.scyAns = undefined;
        os.user.sendMail = undefined;
        var L = $(".scy-Form--show .scy-form__step-show .scy-form__submit").attr("id");
        switch (L) {
            case "submit":
                break;
            case "scySubmit":
                os.user.scyCode = $("#scyCode").val();
                break;
            case "scyAnsSubmit":
                os.user.scyAns = $("#scyAns").val();
                break
        }
        os.login()
    }

    function A(M, L) {
        $("#msgBox").html(M).addClass(L).removeClass("x-hide-display")
    }

    function a() {
        $("#msgBox").addClass("x-hide-display")
    }

    function E() {
        var O = "/cgi-bin/jc.cgi?_dc=" + URL_RANDOM_NUM + "&t=js&f=excanvas.js&f=prototype-1.7-min.js&f=ext-base.js&f=ext-all.js&f=languages.js&f=head.load.min.js&f=AC_OETags.js&f=deployJava.js&f=qnap-lib.js&f=qos-lib.js&f=qos-core-base.js&f=qos-core-desktop.js&f=qos-core-window.js&f=fn-search.js&f=quickWizard.js&f=plugin-qid.js",
            P = new Date().getTime(),
            N = 0,
            L = 0,
            Q;
        Q = setInterval(function() {
            N = new Date().getTime();
            if (N - P > 16000) {} else {}
        }, 1000);

        function M() {
            clearInterval(Q);
            var R = new Date().getTime();
            if (R - P > 15000) {}
        }
        QNAPTool.loadJs(O, M)
    }

    function z() {
        $("body").css("visibility", "visible")
    }

    function b() {
        var L = os.user;
        $("#qestion_msg").html(_Q_STRINGS.AUTH_2STEP_37).addClass("font-warning").removeClass("display-hide font-blue");
        $("#lostPhone").removeClass("scy-form__lost-phone--disabled");
        if (L.emergencyCount >= L.emergencyLimit) {
            if (!os.getRemeAccStatus()) {
                $("#username").val("");
                $("#pwd").val("")
            }
            k();
            q();
            A("", "")
        } else {
            $("#scyAns").focus()
        }
    }

    function k() {
        $(".msg-box-ct").addClass("show");
        $(".msg-icon-ct > div").removeClass("msg-icon--question");
        $("#modalCancel .btn-m").html(_Q_STRINGS.IEI_NAS_BUTTON_OK);
        $("#modalOK").addClass("display-none");
        $(".msg-text-ct > span").html(_Q_STRINGS.AUTH_2STEP_38);
        $(".msg-icon-ct > div").addClass("msg-icon--info")
    }

    function f() {
        var M = "",
            L = os.user;
        switch (L.questionNo) {
            case 1:
                M = _Q_STRINGS.AUTH_2STEP_19;
                break;
            case 2:
                M = _Q_STRINGS.AUTH_2STEP_20;
                break;
            case 3:
                M = _Q_STRINGS.AUTH_2STEP_21;
                break;
            case 4:
                M = _Q_STRINGS.AUTH_2STEP_22;
                break;
            case 5:
                M = _Q_STRINGS.AUTH_2STEP_23;
                break;
            case 6:
                M = L.questionText;
                break
        }
        $("." + C.STEP_2 + " > label").html(M).attr("title", M)
    }

    function c() {
        $("#scy_msg").addClass("font-blue").html(_Q_STRINGS.AUTH_2STEP_35);
        $("#lostPhone").removeClass("scy-form__lost-phone--disabled")
    }

    function e(L) {
        var M = "";
        if (L === os.SEND_MAIL_RESULT.FAILURE) {
            M = _Q_STRINGS.AUTH_2STEP_26
        } else {
            if (L === os.SEND_MAIL_RESULT.SMTP_NOT_WORK) {
                M = _Q_STRINGS.AUTH_2STEP_26
            }
        }
        $("#lostPhone").removeClass("scy-form__lost-phone--disabled");
        $("#scy_msg").removeClass("font-blue").addClass("font-warning").html(M)
    }

    function w() {
        if ($("#scyForm").hasClass("scy-Form--show")) {
            location.reload(true)
        } else {}
    }

    function g(L) {
        $(".scy-form__step").removeClass("scy-form__step-show");
        $(".scy-form__step." + L).addClass("scy-form__step-show");
        switch (L) {
            case C.STEP_1:
                $("#scy_msg").html(_Q_STRINGS.AUTH_2STEP_30).removeClass("font-blue").removeClass("font-warning");
                $("#scyCode").val("");
                break;
            case C.STEP_2:
                $("#qestion_msg").html("");
                $("#scyAns").val("");
                break
        }
        $(".scy-form__step-show  input:first").focus()
    }

    function D() {
        if ($("#lostPhone").hasClass("scy-form__lost-phone--disabled")) {
            return
        }
        var L = os.user;
        if (L.emergencyCount >= L.emergencyLimit) {
            os.user.lostPhone = -1
        }
        switch (os.user.lostPhone) {
            case os.LOST_PHONE.MAIL:
                B();
                break;
            case os.LOST_PHONE.QUESTION:
                g(C.STEP_2);
                break;
            case os.LOST_PHONE.DISABLED:
                break;
            case os.LOST_PHONE.OVER_LIMIT:
                k();
                break
        }
    }

    function B() {
        $(".msg-icon-ct > div").addClass("msg-icon--question");
        $(".msg-icon-ct > div").removeClass("msg-icon--info");
        $(".btn-ct").removeClass("display-none");
        $("#modalCancel .btn-m").html(_Q_STRINGS.IEI_NAS_BUTTON_CANCEL);
        $(".msg-text-ct > span").html(_Q_STRINGS.AUTH_2STEP_34);
        $(".msg-box-ct").addClass("show")
    }

    function J() {
        $("#scyFormMask").addClass("show");
        $("#scyForm").addClass("scy-Form--show")
    }

    function q() {
        $("#scyFormMask").removeClass("show");
        $("#scyForm").removeClass("scy-Form--show")
    }

    function v() {
        $("#scy_msg").removeClass("font-warning").addClass("font-blue").html(_Q_STRINGS.AUTH_2STEP_40);
        $("#lostPhone").addClass("scy-form__lost-phone--disabled");
        os.sendScyMail();
        m()
    }

    function m() {
        $(".msg-box-ct").removeClass("show")
    }
    return {
        ERR_MSG: o,
        INFO_MSG: y,
        init: G,
        login: x,
        bindEvnet: s,
        preLoadJsLib: E,
        show: z
    }
}
if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", function() {
        os = QTS();
        ui = UI();
        os.loadCSS("loginCSS", "/cgi-bin/loginTheme/theme/login.css?r=" + Math.random());
        if (os.isReady()) {
            ui.init();
            ui.show()
        } else {
            os.on("ready", function() {
                ui.init();
                ui.show()
            })
        }
    }, false)
} else {
    os.on("ready", function() {
        ui.init();
        ui.show()
    })
};
