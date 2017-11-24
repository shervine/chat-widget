(function () {
  angular.module('menChat', ['ui.bootstrap'])
    .run(function ($location, $rootScope, $interval) {
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
    .directive('usersList', function ($rootScope, $timeout, $interval) {
      return {
        restrict: 'E',
        scope: {},
        link: function ($scope, iElem, iAttr) {
          $scope.searchTerm = '';

          if ($scope.allUsers) {
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

              //observer for chat messages content to enable scroll down
              //when new content is inserted
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

            var stop;
            $scope.loading = true;
            stop = $interval(function(){
               if (!$scope.messages.ready()){
                 return;
               }
               $scope.msgs = $scope.messages.reverse();
               console.log('userMessages populated ', $scope.msgs);
               $scope.stopInterval();
             }, 60);

             $scope.stopInterval = function() {
              if (angular.isDefined(stop)) {
                  $scope.loading = false;
                  $interval.cancel(stop);
                  stop = undefined;
                }
             };
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
