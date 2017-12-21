(function () {
  angular.module('menChat')
    .controller('chatCtrl', function ($scope, $rootScope, toastr, $timeout) {
      $scope.chatInput = '';
      $scope.sendMessage = function () {
        if ($scope.chatInput === '') {
          alert('Please type the message you want to send');
          return;
        }

        if (!$rootScope.selectedUser || !$rootScope.instructorData) {
          toastr.error('Invalid user or instructor');
          return;
        }

        var postObj = {
          'bId': $rootScope.bootcampId,
          'message': $scope.chatInput,
          'receiverId': $rootScope.selectedUser.u_id,
          'senderId': $rootScope.instructorData[0].u_id,
          'messageType': 'text' //for now
        }

        console.log('Sending message using post data :', postObj);

        Meteor.call('sendChatMessage', postObj, function (err, success) {
          console.log('sendChatMessage ', err, success);
          if (err) {
            toastr.error('Sending error');
            return;
          }
          angular.element('.user-messages ul').append('<li class="me tmpInsert">' + angular.copy($scope.chatInput) + '</li>');
          $scope.chatInput = '';
          $scope.$apply();

          //scroll div 
          $timeout(function () {
            var d = angular.element('.user-messages');
            d.animate({
              scrollTop: d.prop('scrollHeight')
            }, 1);
          }, 100);

        });
      }
    });


})();
