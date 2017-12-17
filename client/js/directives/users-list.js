angular.module('menChat')
  .directive('usersList', function($rootScope, $timeout, $interval, $window) {
    return {
      restrict: 'E',
      scope: {},
      link: function($scope, iElem, iAttr) {

        $rootScope.$watch('authToken', function(newVal) {
          if (!newVal) {
            return;
          }
          $scope.authToken = newVal;
        });

        $scope.searchTerm = '';

        if ($scope.allUsers && typeof $scope.allUsers.stop == 'function') {
          $scope.allUsers.stop();
        }

        $scope.stopInterval = function() {
          if (angular.isDefined(stop)) {
            $scope.loading = false;
            $interval.cancel(stop);
            stop = undefined;
          }
        };

        $scope.userSelected = function(user) {
          $rootScope.selectedUser = user;
          $scope.selectedUser = user;
        };

        $scope.search = function(searchTerm) {
          if (searchTerm === '' || searchTerm === ' ') {
            $scope.users = $scope.allUsers;
            return;
          }

          $scope.users = [];
          searchTerm = searchTerm.toLowerCase();
          for (let i in $scope.allUsers) {
            let fname = $scope.allUsers[i].u_fname.toLowerCase();
            let lname = $scope.allUsers[i].u_lname.toLowerCase();
            if (fname.indexOf(searchTerm) >= 0 || lname.indexOf(searchTerm) >= 0) {
              $scope.users.push($scope.allUsers[i]);
            }
          }
        };

        $scope.renderLastMessage = function(message) {
          if (!message) {
            return;
          }
          if (message.indexOf('image:') >= 0 && message.indexOf('/attach') >= 0) {
            return 'image';
          }
          if (message.indexOf('audio:') >= 0 && message.indexOf('/attach') >= 0) {
            return 'audio';
          }
          if (message.indexOf('video:') >= 0 && message.indexOf('/attach') >= 0) {
            return 'video';
          }
          if (message.indexOf('file:') >= 0 && message.indexOf('/attach') >= 0) {
            return 'file';
          }

          return message;
        };

        $scope.$on('new-filter', function(ev, filterObj) {
          $scope.loading = true;
          $scope.allUsers = new PgSubscription('allUsers', filterObj,  window.authObj).reactive();
          $rootScope.selectedUser = null;
          $scope.selectedUser = null;

          stop = $interval(function() {
            if (!$scope.allUsers.ready()) {
              return;
            }
            $scope.users = $scope.allUsers;
            console.log('allUsers populated ', $scope.users);
            $scope.stopInterval();
          }, 60);
        });
      },
      templateUrl: 'users-list.html',
    };
  });
