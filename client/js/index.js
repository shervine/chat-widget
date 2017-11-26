(function () {
  angular.module('menChat')
    .run(function ($location, $rootScope, $interval) {
      $rootScope.instructorId = 1;
      $rootScope.bootcampId = 1;
      var bId = $location.search().bootcampId;
      var instrId = $location.search().instructorId;
      if (bId) {
        $rootScope.bootcampId = bId;
      }
      if (instrId) {
        $rootScope.instructorId = instrId;
      }
      console.log('Using bootcamp id ', $rootScope.bootcampId);
      console.log('Using instructor id ', $rootScope.instructorId);

      $rootScope.bootcampClasses = new PgSubscription('bootcampClasses', $rootScope.bootcampId, $rootScope.instructorId);

    })
    .controller('chatCtrl', function ($scope, $rootScope) {

      $scope.chatInput = '';
      $scope.sendMessage = function () {
        if ($scope.chatInput === '') {
          alert('Please type the message you want to send');
          return;
        }

        if (!$rootScope.selectedUser) {
          alert('No user selected');
          return;
        }

        var postObj = {
          'bId': $rootScope.bootcampId,
          'message': $scope.chatInput,
          'receiverId': $rootScope.selectedUser.u_id,
          'senderId': $rootScope.instructorId,
          'messageType': 'text' //for now
        }
        Meteor.call('sendChatMessage', postObj, function (err, success) {
          console.log('sendChatMessage ', err, success);
          if (err) {
            alert('Sending error');
            return;
          }
          angular.element('.user-messages ul').append('<li class="me tmpInsert">'+angular.copy($scope.chatInput)+'</li>');
          $scope.chatInput = '';
          $scope.$apply();

        });
      }
    })
    .directive('ngEnter', function () {
      return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
          if (event.which === 13) {
            scope.$apply(function () {
              scope.$eval(attrs.ngEnter);
            });

            event.preventDefault();
          }

        });
      };
    })

})();
