var clientApp = angular.module('clientApp', ["ngRoute", "ngTouch"]);

clientApp.config(function ($routeProvider) {
    $routeProvider
        .when("/chat", {
            templateUrl: "partials/chatView.html",
            controller: "ChatController"
        })
        .when("/login", {
            templateUrl: "partials/loginView.html",
            controller: "LoginController"
        })
        .otherwise({
            redirectTo: "/login"
        });
});

clientApp.factory('serverDetails', function () {
    var _details = {
        httpType: 'http://',
        wsType: 'ws://',
        serverUrl: 'localhost',
        portNumber: 3000
    }

    _details.getHttpAdd = function () {
        return this.httpType + this.serverUrl + ':' + this.portNumber;
    }

    _details.getWsAdd = function () {
        return this.wsType + this.serverUrl + ':' + this.portNumber;
    }

    return _details;
})

clientApp.factory('socket', ['$rootScope', function ($rootScope) {
    var _socket = {
        conn: {},
        isAlive: false
    };

    _socket.openConnection = function (args, callback) {
        if (!_socket.isAlive) {
            console.log('Creating initial websocket!');
            try {
                _socket.socket = io.connect(args.serverAddress, {
                    query: 'token=' + args.token + '&' + 'username=' + args.username
                });
            } catch (err) {
                callback(err);
            }

            _socket.socket.on('connect', function (data) {
                console.log('Socket connection opened!');
                _socket.isAlive = true;
                _socket.conn = {
                    on: function (eventName, callback) {
                        _socket.socket.on(eventName, function () {
                            var args = arguments;
                            $rootScope.$apply(function () {
                                callback.apply(_socket.socket, args);
                            });
                        });
                    },
                    emit: function (eventName, data, callback) {
                        _socket.socket.emit(eventName, data, function () {
                            var args = arguments;
                            $rootScope.$apply(function () {
                                if (callback) {
                                    callback.apply(_socket.socket, args);
                                }
                            });
                        })
                    }
                };
                addSocketListeners();
                callback();
            });
        }


    };

    _socket.disconnect = function () {
        _socket.socket.disconnect();
        _socket.isAlive = false;
    };

    var addSocketListeners = function () {
        _socket.conn.on('error', function (err) {
            console.error('Error occured, disconnecting socket');
            _socket.disconnect();
        });

        _socket.conn.on('welcome', function (data) {
            console.log('Server says: ' + data.msg);
        });
    };
    // Make sure this isn't called when navigating to #chat
    window.onbeforeunload = function () {
        console.log('window.onbeforeunload is being called (inside socket service)');
        _socket.disconnect();
    };

    return _socket;
}]);

clientApp.factory('onlineUsers', ['socket', function (socket) {
    var _onlineUsers = {};
    var _users = [];

    _onlineUsers.updateUsers = function () {
        socket.conn.emit('getOnlineUsers');
    };

    socket.conn.on('getOnlineUsers', function (users) {
        console.log('recieved new users');
        angular.copy(users, _users);
    });

    _onlineUsers.getUsers = function () {
        return _users;
    };

    return _onlineUsers;
}]);

clientApp.controller("LoginController",
    ['serverDetails', 'socket', '$location', '$scope', LoginController]);

clientApp.controller("ChatController",
    ['socket', 'onlineUsers', '$scope', ChatController]);
