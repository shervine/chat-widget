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
          $scope.checkModel = {
            'cohort': false,
            'students': false
          };

        },
        templateUrl: 'filter.html'
      }
    })
    .directive('usersList', function ($rootScope, $timeout) {
      return {
        restrict: 'E',
        scope: {},
        link: function ($scope, iElem, iAttr) {
          $scope.searchTerm = '';
          $scope.allUsers = users.reactive();
          $scope.users = angular.copy($scope.allUsers);
          $timeout(function () {
            angular.element('.users-list').css('max-height', '700px');
          }, 300);

          $scope.userSelected = function (user) {
            console.log('Selected user ', user);
            var messages = new PgSubscription('userMessages', user.u_id);

            $timeout(function () {
              if (!messages.ready()) {
                console.log('Subscription not ready');
              }
              $scope.messages = messages.reactive();
              console.log('Got messages ', $scope.messages);
              $rootScope.$broadcast('selected_user_messages', $scope.messages);
            }, 300);
          }

          $scope.search = function (searchTerm) {
            if (searchTerm === '' || searchTerm === ' ') {
              $scope.users = angular.copy($scope.allUsers);
              return;
            }

            $scope.users = [];
            searchTerm = searchTerm.toLowerCase();
            for (var i in $scope.allUsers) {
              var fname = $scope.allUsers[i].u_fname.toLowerCase();
              var lname = $scope.allUsers[i].u_lname.toLowerCase();
              if (fname.indexOf(searchTerm) >= 0 || lname.indexOf(searchTerm) >= 0) {
                $scope.users.push($scope.allUsers[i]);
              }
            }

          }
        },
        templateUrl: 'users-list.html'
      }
    })
    .directive('userMessages', function ($rootScope, $timeout) {
      return {
        restrict: 'E',
        scope: {},
        link: function ($scope, iElem, iAttr) {
          $scope.msgs = [];
          $scope.$on('selected_user_messages', function (ev, messages) {
            $scope.msgs = messages;
            console.log('Got messages ', $scope.msgs);
          });

          $timeout(function () {

          });
        },
        templateUrl: 'user-messages.html'
      }
    })
})();
