document.addEventListener("deviceready", function () {
    $(function () {

        var chatHub = $.connection.chatHub;
        $.connection.hub.url = 'http://217.182.33.70/signalr';
        $('#login').click(function () {
            console.log("button clicked");       
            var hdUserName = $('#email').val();
            var pass = $('#password').val();
            onUserConnected(chatHub, hdUserName);
            $.connection.hub.start()
                .done(function () { login(chatHub, hdUserName, pass); })
                .fail(function () { console.log('Could not connect'); });
        });

        $('#lostPassword').click(function () {
            $.connection.hub.start()
                .done(function () {
                    $('#content').empty();
                    var html = '<input id="username" type="text" /><input id="email" type="text" /><button id="submit">Passwort anfordern</button>';
                    $("#content").append(html);
                    $('#submit').click(function () {
                        var username = $('#username').val();
                        var email = $('#email').val();
                        chatHub.server.lostpassword(username, email)
                            .done(function () { alert("Ihr neues Passwort wurde Ihnen per E-Mail zugeschickt.") });
                    })
                })
                .fail(function () { console.log('Could not connect'); });
        });

        var allUsersArray = new Array();
    });

    function login(chatHub, hdUserName, pass) {
        chatHub.server.login(hdUserName, pass);
    }

    function registerEvents(chatHub, hdUserName, pass) {
        chatHub.server.connect(hdUserName, pass, "gruppe");
        chatHub.server.join("gruppe");
        $('#hdUserName').val(hdUserName);
    }

    function onUserConnected(chatHub, hdUserName) {
        chatHub.client.onLogin = function (trueorfalse) {
            if (trueorfalse == "1") {
                registerEvents(chatHub, hdUserName, "pass");
            } else {
                alert("Username oder Passwort ist ungültig!");
            }
        }

        chatHub.client.onConnected = function (id, userName, allUsers, messages, group) {
            var hdId = id;
            allUsersArray = allUsers;
            $('#hdId').val(hdId);
            $('header').remove();
            $('#content').remove();
            $('footer').remove();

            var code = "";
            code = $('<div id="userlist"><ul id="user">');
            $("#wrapper").append(code);
            for (i = 0; i < allUsers.length; i++) {
                AddUser(chatHub, allUsers[i].ConnectionId, allUsers[i].UserName, allUsers[i].lastOnline, hdUserName);
                if (i == allUsers.length) {
                    code = $('</ul></div><div class="height"></div>');
                    $("#user").append(code);
                }
            }
        }

        chatHub.client.onGoBack = function (id, userName, allUsers, messages, group) {
            var hdId = id;
            allUsersArray = allUsers;
            $('#hdId').val(hdId);
            $('#privmsg').remove();
            $('footer').remove();
            var code = "";
            code = $('<div id="userlist"><ul id="user">');
            $("#wrapper").append(code);
            for (i = 0; i < allUsers.length; i++) {
                AddUser(chatHub, allUsers[i].ConnectionId, allUsers[i].UserName, allUsers[i].lastOnline, allUsers[i].personalstatus, hdUserName);
                if (i == allUsers.length) {
                    code = $('</ul></div><div class="height"></div>');
                    $("#user").append(code);
                }
            }
        }

        chatHub.client.sendPrivateMessage = function (windowId, fromUserName, message, nowtime) {
            var ctrId = 'private_' + windowId;
            var newtime;
            if (nowtime.match(/0001-01-01T.*$/)) {
                var splittime = nowtime.split("T");
                var split2hm = splittime[1].split(":");
                var newtime = split2hm[0] + ":" + split2hm[1];
            }
            if (hdUserName == fromUserName || hdUserName != windowId) {
                $('#privmsg').find('#Message').append('<div class="message" style="color: #fff; margin-right: 21px; margin-top: 10px; width: 70%; float: right; background-color: #4f6c97; padding: 10px; border-radius: 3px;"><span class="userName">' + newtime + '</span>' + message + '</div>');
            } else {
                $('#privmsg').find('#Message').append('<div class="message" style="color: #fff; margin-left: 21px; margin-top: 10px; width: 70%; float: left; background-color: #01aef0; padding: 10px; border-radius: 3px;"><span class="userName">' + newtime + '</span>' + message + '</div>');
            }
        }

        chatHub.client.getPrivateMessage = function (fromUserName, messages) {
            var ctrId = 'private_' + fromUserName;
            for (i = 0; i < messages.length; i++) {
                $('#' + ctrId).find('#Message').append('<div class="message" style="color: #fff; margin-left: 21px; margin-top: 10px; width: 70%; float: left; background-color: #01aef0; padding: 10px; border-radius: 3px;"><span class="userName">' + messages[i].send + '</span>' + messages[i].Message + '</div>');
            }
        }

		/*window.addEventListener("beforeunload", function(e){
			$.connection.hub.stop();
		}, false);*/

    }

    function AddUser(chatHub, id, name, lastOnline, personalstatus, hdUserName) {
        console.log(personalstatus);
        var userId = $('#hdId').val();
        var code = "";
        if (userId != id) {
            code = $('<li id="' + id + '"><img src="img/icon175x175.png" /><h2>' + name + '</h2><span id="lastMessageSent">' + lastOnline + '</span><p id="subtitle_id">' + personalstatus + '</p></li>');
            $(code).click(function () {
                var id = $(this).attr('id');
                if (userId != id) {
                    OpenPrivateChatWindow(chatHub, id, name, hdUserName);
                }
            });
        }
        $("#user").append(code);
    }

    function OpenPrivateChatWindow(chatHub, id, name, hdUserName) {
        $('#userlist').remove();
        var ctrId = 'private_' + name;
        if ($('#' + ctrId).length > 0) return;
        createPrivateChatWindow(chatHub, id, ctrId, name, hdUserName);
    }

    function createPrivateChatWindow(chatHub, userId, ctrId, userName, hdUserName) {

        var div = '<div id="privmsg" rel="0">' +
            '<div id="' + ctrId + '" rel="0">' +
            '<div class="privHeader">' +
            '<div id="goBack">&#9664;</div>' +
            '<img src="img/icon175x175.png" />' +
            '<h2 class="selText" rel="0">' + userName + '</h2>' +
            '<span id="lastOnline">Zuletzt online: 23:23</span>' +
            '</div>' +
            '<div id="Message">' +

            '</div>' +
            '<div class="height" style="width: 100%;"></div>' +
            '</div>' +
            '</div>' +

            '<footer>' +
            '<div class="buttonBar">' +
            '<textarea id="txtPrivateMessage" class="msgText" type="text"></textarea>' +
            '<input id="btnSendMessage" class="submitButton button" type="button" value="Send"   />' +
            '</div>' +
            '</footer>';

        var $div = $(div);

        if (localStorage.length != 0) {
            $div.find("#Message").append(localStorage.getItem(userName));
        }

        // Send Button event
        $div.find("#btnSendMessage").click(function () {
            $textBox = $div.find("#txtPrivateMessage");
            var msg = $textBox.val();
            if (msg.length > 0) {
                var checkcon = checkConnection();
                if (checkcon != "No network connection") {
                    chatHub.server.sendPrivateMessage(hdUserName, userName, msg);
                    $textBox.val('');
                } else {
                    localStorage.setItem("privmsg", hdUserName + "|" + userName + "|" + msg);
                    alert("No Network Connection");
                }
            }
        });

        // Text Box event
        $div.find("#txtPrivateMessage").keypress(function (e) {
            if (e.which == 13) {
                $div.find("#btnSendMessage").click();
            }
        });

        $div.find("#goBack").click(function () {
            $textBox = $('#' + ctrId).find('#Message');
            var user = $('#hdUserName').val()
            var msg = $textBox.html();
            localStorage.setItem(userName, msg);
            chatHub.server.goBack(user, "gruppe");
        });
        $('#wrapper').append($div);

        chatHub.server.getPrivateMessage(userName, hdUserName);
    }

    function checkConnection() {
        var networkState = navigator.connection.type;

        var states = {};
        states[Connection.UNKNOWN] = 'Unknown connection';
        states[Connection.ETHERNET] = 'Ethernet connection';
        states[Connection.WIFI] = 'WiFi connection';
        states[Connection.CELL_2G] = 'Cell 2G connection';
        states[Connection.CELL_3G] = 'Cell 3G connection';
        states[Connection.CELL_4G] = 'Cell 4G connection';
        states[Connection.CELL] = 'Cell generic connection';
        states[Connection.NONE] = 'No network connection';

        return states[networkState];
    }
}, false);

document.addEventListener('pause', function () {
    // cordova.plugins.backgroundMode is now available
    cordova.plugins.backgroundMode.enable();
    cordova.plugins.backgroundMode.configuration({ silent: true });
}, false);


/*document.addEventListener("online", onOnline, false);

function onOnline() {
	alert(localStorage.getItem("privmsg"));
	if (localStorage.getItem("privmsg") != null) {
		var privMessage{} = localStorage.getItem("privmsg");
		for each (var item in obj) {
			var pm = item.split("|");
			alert(pm(0));
			chatHub.server.sendPrivateMessage(pm(0), pm(1), pm(2));
		}
	}
}*/