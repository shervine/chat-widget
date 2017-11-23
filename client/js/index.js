(function () {
  angular.module('menChat', ['ui.bootstrap'])
    .run(function ($location, $rootScope, $interval) {
      users = new PgSubscription('allUsers');
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
    .directive('filter', function ($timeout, $rootScope) {
      return {
        restrict: 'E',
        scope: {},
        link: function ($scope) {
          $scope.class = {
            'r_start_date': 'All'
          };
          $scope.statuses = ['All', 'Inactive', 'Pending', 'Active'];
          $scope.status = $scope.statuses[0];
          $scope.classes = $rootScope.bootcampClasses.reactive();

          $scope.selectClass = function (classObj) {
            console.log('Selected class ', classObj);
            $scope.class = typeof classObj !== 'undefined' ? classObj : {
              'r_start_date': 'All'
            };
            $rootScope.$broadcast('filter-class', classObj);
          }
          $scope.selectStatus = function (statusObj) {
            $scope.status = statusObj;
          }
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
          $scope.loading = true;
          $timeout(function () {
            // angular.element('.users-list').css('max-height', '700px');
            $scope.users = $scope.allUsers;
            $scope.loading = false;
          }, 300);

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
              users = new PgSubscription('allUsers', classObj.r_id);
            } else {
              //no filter
              users = new PgSubscription('allUsers');
            }

            $rootScope.selectedUser = null;
            $scope.selectedUser = null;

            $scope.allUsers = users.reactive();
            $timeout(function () {
              $scope.users = $scope.allUsers;
              console.log('Filtered users ', $scope.users);
              $scope.loading = false;
            }, 300);


          });
        },
        templateUrl: 'users-list.html'
      }
    })
    .directive('userMessages', function ($rootScope, $timeout, $interval) {
      return {
        restrict: 'E',
        scope: {
          selectedUser: '='
        },
        link: function ($scope, iElem, iAttr) {
          $scope.msgs = [];
          $scope.$watch('selectedUser', function (newVal) {
            if (!newVal) {
              return;
            }
            $scope.loading = true;

              $scope.$on('filter-class', function (ev, classObj) {
                if ($scope.messages) {
                  $scope.messages.stop();
                }

                $scope.msgs = [];
              });

 	            var observer = new MutationObserver(function(mutations) {
                 console.log('New content into messages div');
                var d = angular.element('.user-messages');
                d.animate({
                  scrollTop: d.prop('scrollHeight')
                }, 1);

            });
            observer.observe(iElem.find('.user-messages')[0], {
                childList: true,
                subtree: true
            });

            if ($scope.messages) {
              $scope.messages.stop();
            }

            $scope.messages = new PgSubscription('userMessages', $scope.selectedUser.u_id).reactive();
            $timeout(function () {
              $scope.msgs = $scope.messages;
              console.log('User messages :', $scope.msgs);
              $timeout(function () {
                var d = angular.element('.user-messages');
                d.animate({
                  scrollTop: d.prop('scrollHeight')
                }, 1);
              }, 500);
              $scope.loading = false;
            }, 300);
          });
        },
        templateUrl: 'user-messages.html'
      }
    })
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
        },
        templateUrl: 'user-details.html'
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
          $scope.chatInput = '';
          $scope.$apply();
        });
      }
    })
})();
