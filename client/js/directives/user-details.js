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

      $scope.$on('filter-class', function (ev, classObj) {
        $scope.userDetails1 = {};
      });

    },
    templateUrl: 'user-details.html'
  }
})
