angular.module('menChat')
  .directive('userDetails', function ($rootScope, $timeout, toastr) {
    return {
      restrict: 'E',
      scope: {
        selectedUser: '='
      },
      link: function ($scope, iElem, iAttr) {
        $scope.userDetails1 = {};

        $scope.userStatuses = [
          { id: '-3', status: 'STUDENT DISPELLED' },
          { id: '-2', status: 'STUDENT WITHDREW' },
          { id: '-1', status: 'ADMISSION REJECTED' },
          { id: '0', status: 'ADMISSION INITIATED' },
          { id: '2', status: 'PENDING ADMISSION' },
          { id: '4', status: 'BOOTCAMP STUDENT' },
          { id: '5', status: 'BOOTCAMP GRADUATE' }
        ];

        $scope.$watch('selectedUser', function (newVal) {
          if (!newVal) {
            return;
          }
          $scope.userDetails1 = newVal;
          console.log('User details : ', newVal);

          for (var i in $scope.userStatuses) {
            
            if ($scope.userDetails1.ru_status == $scope.userStatuses[i].id) {
              $scope.studentStatus = $scope.userStatuses[i];
            }
          }
          console.log($scope.studentStatus);

        });

        $scope.$on('new-filter', function (ev, filterObj) {
          $scope.userDetails1 = {};
        });

        $scope.changeStudentStatus = function (newStatus) {
          console.log('changeStudentStatus ', newStatus);
          toastr.info('Changing student status to ' + newStatus.status);
          //console.log('Changed student status :', $scope.studentStatus);
        }
      },
      templateUrl: 'user-details.html'
    }
  })
