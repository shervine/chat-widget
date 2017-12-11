queryDict = {};
angular.module('menChat', ['ui.bootstrap', 'ui.bootstrap.tpls', 'ui.bootstrap.tooltip', 
          'ui.router', 'toastr'])
  .config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
      $urlRouterProvider.otherwise("/");
      $stateProvider
        .state('home',
        {
          url: "/",
          templateUrl: '/home.html',
          resolve: {
            AutoLoginCheck: ['$state', '$window', '$q', '$timeout',
              function ($state, $window, $q, $timeout) {
                
                location.search.substr(1).split("&").
                forEach(function(item) {queryDict[item.split("=")[0]] = item.split("=")[1]});
                console.log('QueryDict:', queryDict);
                Meteor.call('checkToken', queryDict.token, queryDict.instructorId, queryDict.bootcampId,
                  function (err, success) {
                    console.log('checkToken response ', err, success);
                    if (err) {
                      console.log('Meteor checkToken error ', err);
                      return;
                    }

                    if(success){
                       window.authToken = queryDict.token;
                       window.instructorId = queryDict.instructorId;
                       window.bootcampId = queryDict.bootcampId;
                    }
                  });

                $timeout(function () {
                  if (!window.authToken) {
                    $timeout(function () {
                      $state.go('denied');
                      //alert('Auth check failed');
                    }, 0);
                    console.log('No access token, redirect to deny ');
                    return $q.reject();
                  } else {
                    console.log('we have access token ', window.authToken);
                    return;
                  }
                }, 300);

              }]
          }
        })
        .state('denied', {
          url: "/denied",
          templateUrl: '/denied.html'
        })
    }])
  .run(function ($location, $rootScope, $interval, $state, $window, $timeout, toastr) {
    $rootScope.instructorId = 1;
    $rootScope.bootcampId = 1;
    $rootScope.token = '';
    var bId = $location.search().bootcampId;
    var instrId = $location.search().instructorId;
    var token = $location.search().token;

    if (bId) {
      $rootScope.bootcampId = bId;
    }
    if (instrId) {
      $rootScope.instructorId = instrId;
    }
    if (token) {
      $rootScope.token = token;
    }
    
    $timeout(function(){
      $rootScope.authToken = window.authToken;
      $rootScope.bootcampId = window.bootcampId;
      $rootScope.instructorId = window.instructorId;
      console.log('Auth token ', window.authToken);

      $rootScope.instructorData = new PgSubscription('instructorData', 
                                      queryDict.instructorId).reactive();
  
    });
    $rootScope.lostConnection = false;
    $interval(function(){
      toastr.clear();
        if(!Meteor.connection.status().connected){
          toastr.error('Lost server connection', 'Error');
          $rootScope.lostConnection = true;
        }
        if(Meteor.connection.status().connected && $rootScope.lostConnection){
          $rootScope.lostConnection = false;
          toastr.success('Connected !');
        }
    }, 2000);
  });
