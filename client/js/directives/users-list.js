angular.module('menChat')
.directive('usersList', function ($rootScope, $timeout, $interval) {
  return {
    restrict: 'E',
    scope: {},
    link: function ($scope, iElem, iAttr) {
      $scope.searchTerm = '';

      if ($scope.allUsers && typeof $scope.allUsers.stop == 'function') {
        $scope.allUsers.stop();
      }

      $scope.allUsers = new PgSubscription('allUsers').reactive();

     var stop;
     $scope.loading = true;
     stop = $interval(function(){
        if(!$scope.allUsers.ready()){
          return;
        }
        $scope.users = $scope.allUsers;
        console.log('allUsers populated ', $scope.users);
        $scope.stopInterval();
      }, 60);

      $scope.stopInterval = function() {
       if (angular.isDefined(stop)) {
            $scope.loading = false;
           $interval.cancel(stop);
           stop = undefined;
         }
      };

      $scope.userSelected = function (user) {
        console.log('Selected user ', user);

        $rootScope.selectedUser = user;
        $scope.selectedUser = user;
      }

      $scope.search = function (searchTerm) {
        if (searchTerm === '' || searchTerm === ' ') {
          $scope.users = $scope.allUsers;
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

      $scope.$on('filter-class', function (ev, classObj) {
        $scope.loading = true;
        if (classObj && typeof classObj.r_id !== 'undefined') {
          $scope.allUsers = new PgSubscription('allUsers', classObj.r_id).reactive();
        } else {
          //no filter
          $scope.allUsers = new PgSubscription('allUsers');
        }

        $rootScope.selectedUser = null;
        $scope.selectedUser = null;

        stop = $interval(function(){
           if(!$scope.allUsers.ready()){
             return;
           }
           $scope.users = $scope.allUsers;
           console.log('allUsers populated ', $scope.users);
           $scope.stopInterval();
         }, 60);
      });
    },
    templateUrl: 'users-list.html'
  }
})