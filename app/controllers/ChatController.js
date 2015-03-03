function ChatController(socket, onlineUsers, $scope) {
    onlineUsers.updateUsers();
    $scope.onlineUsers = onlineUsers.getUsers();

    $scope.userClicked = function(user) {
        console.log(user.name + ' clicked!');
    }
}