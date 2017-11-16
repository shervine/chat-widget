users = new PgSubscription('allUsers');

const instructorId = 82;
const bootcampId = 10;

(function () {
  angular.module('menChat', ['ui.bootstrap'])
    .directive('filter', function () {
      return {
        restrict: 'E',
        scope: {},
        link: function ($scope) {
          console.log('directive filter link function ');
          $scope.checkModel = {
            'class': false,
            'status': false
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
          
          $timeout(function () {
            // angular.element('.users-list').css('max-height', '700px');
            $scope.users = $scope.allUsers;
          }, 300);

          $scope.userSelected = function (user) {
            console.log('Selected user ', user);

            $rootScope.selectedUser = user;
            $scope.selectedUser = user;
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
        scope: {selectedUser: '='},
        link: function ($scope, iElem, iAttr) {
          $scope.msgs = [];
          $scope.$on('selected_user_messages', function (ev, messages) {
            $scope.msgs = messages;
            console.log('Got messages ', $scope.msgs);
          });

          $scope.$watch('selectedUser', function(newVal){
               if(!newVal) {
                  return;
               }

               $scope.messages = new PgSubscription('userMessages', $scope.selectedUser.u_id);
               $scope.msgs = $scope.messages.reactive(); 
               console.log('Selected user messages : ', $scope.msgs); 
          });
        },
        templateUrl: 'user-messages.html'
      }
    })
    .directive('userDetails', function($rootScope, $timeout){
      return {
        restrict: 'E',
        scope: {selectedUser: '='},
        link: function ($scope, iElem, iAttr) {
          $scope.$watch('selectedUser', function(newVal){
              if(!newVal) {
                  return;
               }
 
            $scope.userDet = new PgSubscription('userData', $scope.selectedUser.u_id).reactive();
          
            $timeout(function(){
              $scope.userDetails1 =  $scope.userDet[0]; 
              console.log('User details : ', $scope.userDetails1);
            }, 200);
           
          });
        },
        templateUrl: 'user-details.html'
      }
    })
})();
