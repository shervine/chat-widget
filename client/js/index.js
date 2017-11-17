bootcampClasses = new PgSubscription('bootcampClasses');
messages = new PgSubscription('userMessages');

(function () {
  angular.module('menChat', ['ui.bootstrap'])
    .run(function($location, $rootScope){
      users = new PgSubscription('allUsers');
      $rootScope.instructorId = 82;
      $rootScope.bootcampId = 1;
      var bId = $location.search().bootcampId;
      var instrId = $location.search().instructorId;
      if(bId){
        $rootScope.bootcampId = bId; 
      }
      if(instrId){
        $rootScope.instructorId = instrId; 
      }
      console.log('Using bootcamp id ', $rootScope.bootcampId);
      console.log('Using instructor id ', $rootScope.instructorId);

      bootcampClasses = new PgSubscription('bootcampClasses', $rootScope.bootcampId, $rootScope.instructorId);   
    })
    .directive('filter', function ($timeout, $rootScope) {
      return {
        restrict: 'E',
        scope: {},
        link: function ($scope) {
          $scope.class = {'r_start_date': 'All'};
          $scope.statuses = ['All', 'Inactive', 'Pending', 'Active'];
          $scope.status = $scope.statuses[0];
          $scope.classes = bootcampClasses.reactive(); 
        
          $scope.selectClass = function (classObj){
            console.log('Selected class ', classObj);
            $scope.class = typeof classObj !== 'undefined' ? classObj : {'r_start_date': 'All'} ;
          }
          $scope.selectStatus = function (statusObj){
            $scope.status = statusObj;
          }
          $scope.$watch('class', function(newVal){
              if(!newVal){
                return;
              }
              $rootScope.$broadcast('filter-class', newVal);
          });
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

          $scope.$on('filter-class', function(ev, classObj){
            if(typeof classObj.r_id !== 'undefined') {
              users = new PgSubscription('allUsers', classObj.r_id);
            } else {
              //no filter
              users = new PgSubscription('allUsers');
            }
            $scope.allUsers = users.reactive();
            $timeout(function(){
              $scope.users = $scope.allUsers;
              console.log('Filtered users ', $scope.users);
            }, 300);
            
            
          });
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
          $scope.$watch('selectedUser', function(newVal){
               if(!newVal) {
                  return;
               }

               messages = new PgSubscription('userMessages', $scope.selectedUser.u_id);
               
               $timeout(function(){
                $scope.msgs = messages.reactive().reverse();
                console.log('User messages :', $scope.msgs); 
                        $timeout(function () {
                          var d = angular.element('.user-messages');
                          d.animate({ scrollTop: d.prop('scrollHeight') }, 1);
                        }, 300);
               }, 300);
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
          $scope.userDetails1 = {};
          $scope.$watch('selectedUser', function(newVal){
              if(!newVal) {
                  return;
               }
 
            userData = new PgSubscription('userData', $scope.selectedUser.u_id);
            $scope.details = userData.reactive();
            $timeout(function(){
              $scope.userDetails1 =  typeof $scope.details[0] !== 'undefined' ? $scope.details[0] : {} ; 
              console.log('User details : ', $scope.userDetails1);
            }, 300);
           
          });
        },
        templateUrl: 'user-details.html'
      }
    })
    .controller('chatCtrl', function($scope, $rootScope){

      $scope.chatInput = '';
      $scope.sendMessage = function (){
        // var auth_hash = md5( sender_u_id . receiver_u_id . message_type . '7H6hgtgtfii87' )
        if($scope.chatInput === ''){
          alert('Please type the message you want to send');
          return;
        }
        var postObj = {
          'message': $scope.chatInput
        }
        Meteor.call('sendChatMessage', postObj, function(err,success){
           console.log('sendChatMessage ',err,success);
           $scope.chatInput = '';
        });
      }
    })
})();
