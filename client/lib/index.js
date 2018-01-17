queryDict = {};
version='1.12';
angular.module('menChat', ['ui.bootstrap', 'ui.bootstrap.tpls',
    'ui.bootstrap.tooltip', 'ui.router', 'toastr', 'ngFileUpload', 'ngDialog', 'ngStorage',
    'hl.sticky'
  ])
  .config(['$stateProvider', '$urlRouterProvider', 'toastrConfig',
    function ($stateProvider, $urlRouterProvider, toastrConfig) {
      
      angular.extend(toastrConfig, {
        timeOut: 5000
      });

      $urlRouterProvider.otherwise('/');
      $stateProvider
        .state('home', {
          url: '/',
          templateUrl: '/home.html',
          resolve: {
            AutoLoginCheck: ['$state', '$window', '$q', '$timeout',
              function($state, $window, $q, $timeout) {
                location.search.substr(1).split('&').
                forEach(function(item) {
                  queryDict[item.split('=')[0]] = item.split('=')[1];
                });
                console.log('QueryDict:', queryDict);
                return Meteor.call('checkToken', queryDict.token, queryDict.instructorId,
                queryDict.bootcampId, function(err, success) {
                    console.log('checkToken response ', err, success);
                    if (err || !success) {
                      console.log('Meteor checkToken error ', err);
                      $state.go('denied');
                      return $q.reject();
                    }

                    if (success) {
                      window.authToken = queryDict.token;
                      window.instructorId = queryDict.instructorId;
                      window.bootcampId = queryDict.bootcampId;
                      window.authObj = {
                        instructorId: window.instructorId,
                        bootcampId: window.bootcampId,
                        authToken: window.authToken,
                      };
                      return $q.resolve('token ok');
                    } else {
                      return $q.reject();
                      $state.go('denied');
                    }
                  });
              }
            ],
          },
        })
        .state('denied', {
          url: '/denied',
          templateUrl: '/denied.html',
        });
    }
  ])
  .run(function($location, $rootScope, $interval, $state, $window, $timeout, toastr) {

    $timeout(function() {
      if(!window.authObj) {
        window.authToken = queryDict.token;
        window.instructorId = queryDict.instructorId;
        window.bootcampId = queryDict.bootcampId;
        window.authObj = {
          instructorId: window.instructorId,
          bootcampId: window.bootcampId,
          authToken: window.authToken,
        };
      }
      
      $rootScope.authToken = window.authToken;
      $rootScope.bootcampId = window.bootcampId;
      $rootScope.instructorId = window.instructorId;
     
      $rootScope.totalStudents = 0;
      
      $rootScope.instructorData = new PgSubscription('instructorData',
        queryDict.instructorId, window.authObj).reactive();
     
    }, 50);
    $rootScope.lostConnection = false;
    $interval(function() {
      if (!Meteor.connection.status().connected) {
        toastr.clear();
        toastr.error('Lost server connection', 'Error');
        $rootScope.lostConnection = true;
      }
      if (Meteor.connection.status().connected && $rootScope.lostConnection) {
        $rootScope.lostConnection = false;
        toastr.success('Connected !');
      }
    }, 2000);
  });