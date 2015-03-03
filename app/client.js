var httpType = 'http://',
    serverUrl = 'localhost',
    portNumber = 9000,
    serverAddress = httpType + serverUrl + ':' + portNumber,
    socket = null;

console.log(serverAddress);

function startClient() {
    $('#displayRegisterFormButton').click(function (e) {
        console.log('Display register form button pressed');
        $('#confirmPassword').attr('hidden', false);
        $('#confirmPassword').attr('disabled', false);
        $('#registerButton').attr('disabled', false);
    });
    
    $('#registerButton').click(function (e) {
        console.log('Register button clicked');
        $.ajax({
            crossDomain: true,
            url: serverAddress + '/register',
            type: 'POST',
            data: $.param({
                name: $('#username').val(),
                password: $('#password').val(),
                confirmPassword: $('#confirmPassword').val()
            }),
            success: function (data, textStatus, jqXHR) {
                console.log('Server replied: ' + data);
            },
            error: function (jqXHR, textStatus) {
                console.log();
            }
        });
    });
    
    
    $('#loginForm').submit(function (e) {
        // e.preventDefault();
        console.log('Login button pressed');
        
        // For some reason this AJAX request is stuck in pending
        // Sometimes gets callbacked more then once,
        // make sure not to recreate websocket etc.
        $.ajax({
            crossDomain: true,
            url: serverAddress + '/login',
            type: 'POST',
            dataType: 'json',
            data: $.param({
                name: $('#username').val(),
                password: $('#password').val()
            }),
            success: function (data, textStatus, jqXHR) {
                console.log('login ajax returned success');
                console.log('data.token: ' + data.token);
                console.log(textStatus);
                console.log(jqXHR);
                if (data.token) {
                    console.log('Login success, calling openWebSocket');
                    console.log('data.token: ' + data.token);
                    openWebSocket(data.token);
                } else {
                    console.log(data.reply);
                }
            },
            error: function (jqXHR, textStatus) {
                console.log('login ajax returned error');
        // console.log(textStatus);
            }
        });
        return false;
    });
}


/*************************************** SCREEN 2 LOGIC ***********************************************/
// Logic should now move to next screen

var selectedUser = null;

function openWebSocket(token) {
    if (socket === null) {
        console.log('Creating initial websocket!');
        try {
            socket = io.connect('ws://' + serverUrl + ':' + portNumber, {
                query: 'token=' + token + '&' + 'username=' + $('#username').val()
            });
        } catch (err) {
            console.error('Error occured opening socket: ' + err);
        }
    }
    
    socket.on('connect', function (data) {
        console.log('Socket connection opened!');
        $('#loggedInUser').attr('hidden', false);
        $('#loginForm').attr('hidden', true);
    });
    
    socket.on('error', function (err) {
        console.error('Error occured, disconnecting socket');
        socket.disconnect();
    });
    
    socket.on('welcome', function (data) {
        console.log('Server says: ' + data.msg);
    });
    
    window.onbeforeunload = function (e) {
        alert('Navigating away from page');
        socket.disconnect();
    };
}

$(startClient);

$('#onlineUsers li').click(userSelected);

scrollDown();

// Toggles selected class on users, stores selected user's name in selectedUser (global var) atmost 1 user selected.
function userSelected(e) {
    var listItem = $(this);
    if (listItem.hasClass('selected')) {
        $('#onlineUsers li').removeClass('selected');
        selectedUser = null;
    } else {
        $('#onlineUsers li').removeClass('selected');
        listItem.toggleClass('selected');
        selectedUser = listItem.text();
    }
}

// Appends user li to onlineUsers ul
$('#addUser').click(function (e) {
    var username = $('#userName').val();
    if (username) {
        $('#onlineUsers ul').append('<li>' + username + '</li>');
        $findUser(username).click(userSelected);
    }
});


// Returns jQuery object of user li
function $findUser(username) {
    var user = null;
    $('#onlineUsers li').each(function (index, element) {
        if ($(this).text() === username) {
            user = $(this);
            return false;
        }
    });

    return user;
}


// Remove user li from onlineUsers ul
$('#removeUser').click(function (e) {
    var username = $('#userName').val();
    if (username) {
        $('#onlineUsers li').each(function (index, element) {
            if ($(this).text() === username) { 
                $(this).remove();
            }
        });
    }
});


// Makes scrollbar auto stick to bottom
function scrollDown() {
    $("#userMsgs").animate({ scrollTop: $(document).height() }, "fast");
}


// Appends chat message to userMsgs div
$('#addMsg').click(function (e) {
    var msgText = $('#msg').val();
    console.log('msgText: ' + msgText);
    console.log('selectedUser: ' + selectedUser);
    if (msgText && selectedUser) {
        $('#userMsgs ul').append('<li> [' + getCurrTime() + '] ' + selectedUser + ': ' + msgText + '</li>');
    }
    scrollDown();
});


// Gets current time in HH-MM-SS format
function getCurrTime() {
    var totalSec = new Date().getTime() / 1000;
    var hours = parseInt(totalSec / 3600) % 24;
    var minutes = parseInt(totalSec / 60) % 60;
    var seconds = parseInt(totalSec % 60);
    
    var result = (hours < 10 ? "0" + hours : hours) + "-" + (minutes < 10 ? "0" + minutes : minutes) + "-" + (seconds < 10 ? "0" + seconds : seconds);
    return result;
}