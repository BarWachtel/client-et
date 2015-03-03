function LoginController(serverDetails, socket, $location, $scope) {
    $scope.changeView = function (view) {
        $scope.$apply(function() {
            $location.path(view);
        });
    };

    $scope.displayRegisterForm = function (e) {
        // Use angular form controllers instead of jquery selectors
        console.log('Display register form button pressed');
        $('#confirmPassword').attr('hidden', false);
        $('#confirmPassword').attr('disabled', false);
        $('#registerButton').attr('disabled', false);
    };

    $scope.registerUser = function (e) {
        console.log('Register button clicked');
        $.ajax({
            crossDomain: true,
            url: serverDetails.getHttpAdd() + '/register',
            type: 'POST',
            data: $.param({
                name: $scope.username,
                password: $scope.password,
                confirmPassword: $scope.confirmPassword
            }),
            success: function (data, textStatus, jqXHR) {
                console.log('Server replied: ' + data);
            },
            error: function (jqXHR, textStatus) {
                console.log();
            }
        });
    };

    $scope.userLogin = function (e) {
        // e.preventDefault();
        console.log('Login button pressed');

        // For some reason this AJAX request is stuck in pending
        // Sometimes gets callbacked more then once,
        // make sure not to recreate websocket etc.
        $.ajax({
            crossDomain: true,
            url: serverDetails.getHttpAdd() + '/login',
            type: 'POST',
            dataType: 'json',
            data: $.param({
                name: $scope.username,
                password: $scope.password
            }),
            success: function (data, textStatus, jqXHR) {
                console.log('login ajax returned success');
                console.log('data.token: ' + data.token);
                console.log(textStatus);
                console.log(jqXHR);
                if (data.token) {
                    console.log('Login success, calling openWebSocket');
                    console.log('data.token: ' + data.token);

                    socket.openConnection({
                        username: $scope.username,
                        token: data.token,
                        serverAddress: serverDetails.getWsAdd()
                    }, function (err) {
                        if (err) {
                            console.log('Error opening websocket');
                        } else {
                            $scope.changeView('chat');
                        }
                    });

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
    };
}