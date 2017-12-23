(function () {
  angular.module('menChat')
    .controller('chatCtrl', function ($scope, $rootScope, toastr, $timeout) {
      $scope.chatInput = '';

      $rootScope.$watch('selectedUser', function(newVal){
        $scope.selectedUser = newVal;
      });

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
        angular.element('.user-messages ul').append('<li class="me tmpInsert">' + angular.copy($scope.chatInput) + '</li>');
        //scroll div 
        $timeout(function () {
          var d = angular.element('.user-messages');
          d.animate({
            scrollTop: d.prop('scrollHeight')
          }, 1);
        }, 10);

        Meteor.call('sendChatMessage', postObj, window.authObj, (err, success) => {
          console.log('sendChatMessage ', err, success);
          if (err) {
            console.log('Sending message error ' , err);
            toastr.error('Sending error');
            $('.tmpInsert').remove();
            return;
          }
          
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
