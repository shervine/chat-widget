users = new PgSubscription('allUsers');

(function () {
  angular.module('menChat', ['ui.bootstrap'])
    .config(function () {
      console.log('angular menchat config triggered');
    })
    .run(function ($rootScope) {
      console.log('angular menchat run triggered');
      $rootScope.users = users.reactive();
    })
    .directive('filter', function () {
      return {
        restrict: 'E',
        scope: {},
        link: function ($scope) {
          console.log('directive filter link function ');
          $scope.checkModel = {'cohort': false , 'students': false};

        },
        templateUrl: 'filter.html'
      }
    })
    .directive('usersList', function ($rootScope, $timeout) {
      return {
        restrict: 'E',
        scope: {},
        link: function ($scope, iElem, iAttr) {
          console.log('directive usersList link function ');
          $scope.users = users.reactive();
          $timeout(function(){
            angular.element('.users-list').css('max-height', '600px');
          },300);
        },
        templateUrl: 'users-list.html'
      }
    })
})();
