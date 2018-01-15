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
        $scope.readRecipients = [];

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
          $scope.readRecipients[user.u_id] = true;
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

            //when a new message comes bold the student for message unread behaviour  
            $scope.users.addEventListener('updated', function (diff, data) {
              console.log('$scope.users Subscription updated ', diff, data);
              
              try {
                for (var i in diff.added){
                  var student = diff.added[i];
                  if($scope.selectedUser.u_id == student.u_id){
                     continue;
                  }
                  $scope.readRecipients[student.u_id] = false;
                }
              } catch (err){
                  console.log('Something went wrong : ', err);
              }
            });

            console.log('allUsers populated ', $scope.users);
            $scope.stopInterval();
          }, 60);
        });

        $scope.checkUnread = function(user){
            if(user.e_type_id != 6 || $scope.readRecipients[user.u_id]){
              return;
            }

            return true;
        }
      },
      templateUrl: 'users-list.html?cbv=' + document.cbv,
    };
  });
