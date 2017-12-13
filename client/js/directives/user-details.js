angular.module('menChat')
.directive('userDetails', function ($rootScope, $timeout) {
  return {
    restrict: 'E',
    scope: {
      selectedUser: '='
    },
    link: function ($scope, iElem, iAttr) {
      $scope.userDetails1 = {};
      $scope.$watch('selectedUser', function (newVal) {
        if (!newVal) {
          return;
        }
        $scope.userDetails1 = newVal;
        console.log('User details : ', newVal);
      });

      $scope.$on('new-filter', function (ev, filterObj) {
        $scope.userDetails1 = {};
      });

      $scope.userStatus = {
         '-3': 'STUDENT DISPELLED',
         '-2': 'STUDENT WITHDREW',
         '-1': 'ADMISSION REJECTED',
         '0': 'ADMISSION INITIATED',
         '2': 'PENDING ADMISSION',
         '4': 'BOOTCAMP STUDENT',
         '5': 'BOOTCAMP GRADUATE'
      };
    },
    templateUrl: 'user-details.html'
  }
})
