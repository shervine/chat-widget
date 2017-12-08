
angular.module('menChat', ['ui.bootstrap', 'ui.bootstrap.tpls', 'ui.bootstrap.tooltip'])
    .run(function ($location, $rootScope, $interval) {
      
      //default bootstrap vars
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
      $rootScope.instructorData  = new PgSubscription('instructorData', $rootScope.instructorId).reactive();
    });
